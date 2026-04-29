// localStorage-based API — mirrors the server API interface exactly
import { SEED_LEADS, SEED_OUTBOUND, DEFAULT_CONFIG } from './bdrSeed.js';
import { computeLeadScore } from './bdrScoring.js';

function uid(prefix) { return `${prefix}_${Math.random().toString(36).slice(2,10)}`; }

// ── Bootstrap localStorage on first load ──────────────────────────────────────

function bootstrap() {
  if (!localStorage.getItem('bdr_bootstrapped')) {
    localStorage.setItem('bdr_leads', JSON.stringify(SEED_LEADS));
    localStorage.setItem('bdr_outbound', JSON.stringify(SEED_OUTBOUND));
    localStorage.setItem('bdr_config', JSON.stringify(DEFAULT_CONFIG));
    localStorage.setItem('bdr_bootstrapped', '1');
  }
}

// ── Generic getters / setters ─────────────────────────────────────────────────

function getLeads() { bootstrap(); return JSON.parse(localStorage.getItem('bdr_leads') || '[]'); }
function setLeads(arr) { localStorage.setItem('bdr_leads', JSON.stringify(arr)); }
function getOutbound() { bootstrap(); return JSON.parse(localStorage.getItem('bdr_outbound') || '[]'); }
function setOutbound(arr) { localStorage.setItem('bdr_outbound', JSON.stringify(arr)); }
function getConfig() { bootstrap(); return JSON.parse(localStorage.getItem('bdr_config') || '{}'); }
function setConfig(cfg) { localStorage.setItem('bdr_config', JSON.stringify(cfg)); }

// ── api object (same shape as server api.js) ──────────────────────────────────

export const api = {
  leads: {
    list: async () => getLeads(),
    get: async (id) => {
      const l = getLeads().find(l => l.id === id);
      if (!l) throw new Error('Not found');
      return l;
    },
    create: async (data) => {
      const lead = { ...data, id: uid('lead'), date_added: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString(), ...computeLeadScore(data, getConfig()) };
      setLeads([...getLeads(), lead]);
      return lead;
    },
    update: async (id, data) => {
      const updated = { ...data, updated_at: new Date().toISOString(), ...computeLeadScore(data, getConfig()) };
      setLeads(getLeads().map(l => l.id === id ? updated : l));
      return updated;
    },
    delete: async (id) => { setLeads(getLeads().filter(l => l.id !== id)); },
  },

  outbound: {
    list: async () => getOutbound().map(a => ({ ...a, touchpoint_count: a.touchpoints?.length || 0 })),
    get: async (id) => {
      const a = getOutbound().find(a => a.id === id);
      if (!a) throw new Error('Not found');
      return a;
    },
    create: async (data) => {
      const acct = { ...data, id: uid('ob'), touchpoints: [], touchpoint_count: 0 };
      setOutbound([...getOutbound(), acct]);
      return acct;
    },
    update: async (id, data) => {
      setOutbound(getOutbound().map(a => a.id === id ? { ...a, ...data } : a));
      return data;
    },
    delete: async (id) => { setOutbound(getOutbound().filter(a => a.id !== id)); },
    addTouchpoint: async (id, data) => {
      const tp = { ...data, id: uid('tp') };
      setOutbound(getOutbound().map(a => a.id === id ? { ...a, touchpoints: [...(a.touchpoints||[]), tp], touchpoint_count: (a.touchpoint_count||0)+1 } : a));
      return tp;
    },
    weeklyStats: async () => {
      const outbound = getOutbound();
      const touchpoints = outbound.flatMap(a => a.touchpoints || []);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStr = weekAgo.toISOString().split('T')[0];
      const weekTouches = touchpoints.filter(t => t.date >= weekStr).length;
      const meetings = touchpoints.filter(t => t.date >= weekStr && t.response === 'meeting_booked').length;
      const config = getConfig();
      return { touches: weekTouches, target: config.weekly_touch_target || 50, meetings, conversion_rate: weekTouches > 0 ? Math.round((meetings/weekTouches)*100) : 0 };
    },
  },

  discovery: {
    get: async (leadId) => {
      const leads = getLeads();
      const l = leads.find(l => l.id === leadId);
      return l || null;
    },
    save: async (leadId, data) => {
      const leads = getLeads();
      const updated = leads.map(l => l.id === leadId ? { ...l, ...data, ...computeLeadScore({ ...l, ...data }, getConfig()) } : l);
      setLeads(updated);
      return updated.find(l => l.id === leadId);
    },
  },

  analytics: {
    funnel: async () => {
      const leads = getLeads();
      const statuses = ['new','qualifying','qualified','handed_off','nurture','archived'];
      const counts = {};
      for (const s of statuses) counts[s] = 0;
      for (const l of leads) { if (counts[l.status] !== undefined) counts[l.status]++; }
      const stages = statuses.map(s => ({ status: s, count: counts[s] }));
      const total = leads.length;
      const qualified = leads.filter(l => ['qualified','handed_off'].includes(l.status)).length;
      const handoffs = leads.filter(l => l.status === 'handed_off').length;
      const conversions = [];
      for (let i = 0; i < stages.length - 1; i++) {
        if (stages[i].count > 0) conversions.push({ from: stages[i].status, to: stages[i+1].status, rate: Math.round((stages[i+1].count/stages[i].count)*100) });
      }
      return { stages, total, qualified, meetings: 2, handoffs, conversions };
    },

    patterns: async () => {
      const leads = getLeads();
      const byVerticalMap = {};
      for (const l of leads) {
        const v = l.industry || 'Unknown';
        if (!byVerticalMap[v]) byVerticalMap[v] = { count:0, totalScore:0, totalPipeline:0 };
        byVerticalMap[v].count++;
        byVerticalMap[v].totalScore += l.composite_score || 0;
        byVerticalMap[v].totalPipeline += (l.expected_acv||0)*(l.conversion_probability||0);
      }
      const by_vertical = Object.entries(byVerticalMap)
        .map(([vertical,d]) => ({ vertical, count:d.count, avg_score:Math.round(d.totalScore/d.count), total_pipeline:Math.round(d.totalPipeline) }))
        .sort((a,b)=>b.count-a.count).slice(0,8);

      const bySourceMap = {};
      for (const l of leads) {
        const s = l.source || 'unknown';
        if (!bySourceMap[s]) bySourceMap[s] = { count:0, totalScore:0 };
        bySourceMap[s].count++; bySourceMap[s].totalScore += l.composite_score||0;
      }
      const by_source = Object.entries(bySourceMap)
        .map(([source,d]) => ({ source, count:d.count, avg_score:Math.round(d.totalScore/d.count) }))
        .sort((a,b)=>b.count-a.count);

      const tier1 = leads.filter(l=>l.tier==='tier_1_hot');
      const insights = [
        tier1.length > 0 && { title:`${tier1.length} Hot lead${tier1.length>1?'s':''} ready for AE`, body:`${tier1.slice(0,3).map(l=>l.company).join(', ')} are Tier 1.`, action:'Schedule AE intros this week' },
        { title:'Fintech dominates pipeline', body:'5 of 10 leads are Fintech — FCA/GDPR compliance is a common buying signal.', action:'Lead with regulatory compliance positioning' },
      ].filter(Boolean);

      return { by_vertical, by_source, insights, avg_score: Math.round(leads.reduce((s,l)=>s+(l.composite_score||0),0)/Math.max(leads.length,1)) };
    },

    kpis: async () => {
      const leads = getLeads();
      const totalAcv = leads.reduce((s,l)=>s+(l.expected_acv||0)*(l.conversion_probability||0),0);
      return {
        total_leads: leads.length,
        avg_score: Math.round(leads.reduce((s,l)=>s+(l.composite_score||0),0)/Math.max(leads.length,1)),
        tier1: leads.filter(l=>l.tier==='tier_1_hot').length,
        tier2: leads.filter(l=>l.tier==='tier_2_warm').length,
        tier3: leads.filter(l=>l.tier==='tier_3_nurture').length,
        tier4: leads.filter(l=>l.tier==='tier_4_archive').length,
        avg_conversion_prob: (leads.reduce((s,l)=>s+(l.conversion_probability||0),0)/Math.max(leads.length,1)*100).toFixed(1),
        pipeline_value: Math.round(totalAcv),
        new_this_week: 0,
        enterprise_count: leads.filter(l=>l.route_to==='enterprise_ae').length,
        startup_count: leads.filter(l=>l.route_to==='startup_ae').length,
      };
    },
  },

  config: {
    getAll: async () => {
      const cfg = getConfig();
      return Object.entries(cfg).map(([key, value]) => ({ key, value: String(value) }));
    },
    set: async (key, value) => {
      const cfg = getConfig();
      cfg[key] = value;
      setConfig(cfg);
    },
  },
};

// Pre-generated AI text for seed companies (typewriter-effect streaming sim)
const AI_HANDOFFS = {
  'lead_002': `**AE Handoff Brief — Revolut**

**Executive Summary**
Revolut is a Tier-1, immediately actionable deal with CEO-level sponsorship and a confirmed €500K budget. The champion (Nik Storonsky) has moved faster than any lead this quarter — pilot should start within 3 weeks.

**Why Claude, Why Now**
FCA compliance requires audit trails for AI-generated outputs that GPT-4o cannot provide. Claude's Constitutional AI and native refusal logging directly address the MLRO's concerns. Revolut's fraud team cited hallucination rate as their #1 blocker with incumbent; our benchmark shows 3.1× fewer hallucinations on financial narrative tasks.

**Positioning Recommendation**
Lead with the Claude API for fraud narrative generation (immediate pain), then expand to 8M+ customer support conversations/month. Propose Claude API + Batch Processing for cost efficiency at scale.

**Competitive Landscape**
Active GPT-4o evaluation. Differentiators: (1) Constitutional AI = compliance by design, (2) 200K context window for full transaction history, (3) UK data residency option.

**Suggested Next Steps**
1. AE intro call with Nik's technical lead (Friday)
2. 2-week pilot: 10K fraud transactions → narrative generation
3. SLA proposal with 99.9% uptime commitment`,

  'lead_004': `**AE Handoff Brief — Klarna**

**Executive Summary**
Klarna is in closing stage. €800K ACV, Sebastian Siemiatkowski personally engaged. This is a reference customer win — Klarna's brand in fintech will unlock 5+ similar deals.

**Why Claude, Why Now**
Klarna publicly committed to replacing 700 support agents with AI. They tried GPT and hit multi-lingual quality issues (Swedish, German, Dutch). Claude's language parity is the decisive differentiator. Timeline: board announcement in 6 weeks.

**Positioning Recommendation**
Claude API for Tier 1 support automation + Claude for customer-facing Swedish/German flows. Emphasise GDPR-compliant inference and no training on customer data.

**Suggested Next Steps**
1. Final legal review — DPA amendment needed for EU data residency
2. Technical integration spec (they have their own fine-tuning pipeline to wire in)
3. Press release coordination once signed`,

  'lead_008': `**AE Handoff Brief — Stripe Ireland**

**Executive Summary**
Stripe is a strategic account with €600K budget, full technical champion alignment, and a 3-month pilot scope already defined by their VP Engineering.

**Why Claude, Why Now**
Stripe's developer documentation is their #1 customer satisfaction driver. Their LLM-powered docs assistant hallucinates 12% of the time on API edge cases — unacceptable for a developer tools company. Claude's code reasoning and factual accuracy are 2× better on their internal eval.

**Positioning Recommendation**
Lead with Stripe Docs AI (immediate, low-risk). Expand to Stripe Radar fraud explanation (high value, high volume). Long-term: internal tooling for 8,000 engineers.

**Suggested Next Steps**
1. Pilot scope doc (send by EOW)
2. Technical integration call — their stack is GCP/Ruby, our SDK is idiomatic
3. Introduce to Patrick Collison for executive alignment`,
};

const AI_OUTREACH = {
  email: {
    'ob_001': `Subject: EU AI Act Compliance — How Allianz Can Audit Every AI Decision

Hi Oliver,

The EU AI Act's transparency requirements for insurance AI systems take effect in August. I've been working with several Tier-1 insurers this quarter on exactly this — building audit trails that satisfy regulators without compromising model performance.

Anthropic's Claude API is the only foundation model with Constitutional AI built in — meaning every output is logged, explainable, and refusable on demand. For an organisation of Allianz's scale, this directly addresses DORA's human oversight requirements.

I'd love to share what Allianz Re's peers are doing. 15 minutes this week?

Best,
Omri`,

    'ob_002': `Subject: Your ML Infrastructure Posts — A Conversation on Inference Costs

Hi Ingo,

Your engineering team's post on inference cost optimisation caught my eye — the analysis of attention head pruning was excellent.

I reach out because Anthropic has been solving a similar problem from a different angle: we've reduced Claude Haiku's cost/token by 60% vs GPT-3.5 while maintaining SOC2 Type II compliance — which matters for Adyen's PCI-DSS obligations.

Given you're already thinking hard about inference economics, I'd love to explore whether Claude API fits into your architecture. Worth a 20-minute call?

Best,
Omri`,
  },
  linkedin: {
    'ob_001': `Hi Oliver — saw Allianz's AI governance initiative following the EU AI Act publication. At Anthropic, we've been helping regulated insurers build compliant AI pipelines with full audit trails. Happy to share what others in your space are doing — worth a quick call?`,
    'ob_002': `Ingo — your team's writing on ML inference is some of the best I've read. We've been solving similar cost/quality tradeoffs at Anthropic's API layer. Given Adyen's PCI requirements, I think there's a natural fit. Open to a 15-minute chat?`,
  },
};

// Streaming simulation — typewriter effect
export async function streamAI(path, body, onChunk) {
  let text = '';

  if (path.includes('/handoff/')) {
    const leadId = path.split('/').pop();
    text = AI_HANDOFFS[leadId] || `**AE Handoff Brief**\n\nThis lead has been qualified and is ready for AE engagement. Key signals: strong budget confirmation, technical champion identified, clear use case aligned with Claude's core strengths.\n\n**Recommended Next Steps**\n1. Schedule executive intro call\n2. Send SOC2 + DPA documentation\n3. Propose 4-week technical pilot`;
  } else if (path.includes('/outreach/')) {
    const accountId = path.split('/').pop();
    const channel = body?.channel || 'email';
    text = AI_OUTREACH[channel]?.[accountId] || `${channel === 'email' ? 'Subject: Anthropic Claude API — Relevant for Your Team\n\nHi,\n\nI\'ve been following your company\'s AI initiatives and believe Claude API could be a strong fit for your use case. Our Constitutional AI approach and enterprise-grade reliability have been compelling for similar companies in your space.\n\nWould love 15 minutes to explore fit.\n\nBest,\nOmri' : `Hi — I've been following your company's work in AI. At Anthropic, we've been helping similar organisations build reliable, compliant AI pipelines with Claude. Worth a quick chat?`}`;
  } else if (path.includes('/weekly-report')) {
    text = `**EMEA BDR Weekly Summary**\n\n• **Pipeline**: 10 active leads, €302K weighted pipeline value. Tier-1 count at 6 — highest this quarter.\n\n• **Wins This Week**: Klarna moving to legal/signing stage (€800K ACV). Stripe pilot scope document sent.\n\n• **At Risk**: Sanofi procurement timeline extended to Q3 — deprioritise until budget cycle. Deliveroo champion still unidentified.\n\n• **Outbound**: 12 touchpoints this week vs 50 target — need acceleration on Tier A accounts (UBS not yet contacted).\n\n• **Next Week Priority**: UBS first outreach (FINMA regulation is a live trigger), Adyen discovery call prep, Revolut pilot kick-off.`;
  }

  // Typewriter effect: stream character by character in chunks
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise(r => setTimeout(r, 18 + Math.random() * 12));
    onChunk((i === 0 ? '' : ' ') + words[i]);
  }
}
