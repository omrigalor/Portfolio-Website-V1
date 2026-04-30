// localStorage-based API that mirrors the live server API exactly.
// When an Anthropic API key is stored (bdr_api_key), all AI calls hit real Claude.
// Without a key, AI text falls back to pre-generated content for the demo.
import { SEED_LEADS, SEED_OUTBOUND } from './bdrSeed.js';
import { portfolioMonteCarlo } from './monteCarlo.js';

function uid(prefix) { return `${prefix}_${Math.random().toString(36).slice(2, 10)}`; }

// Returns the stored API key, or null if not set
function getApiKey() { return localStorage.getItem('bdr_api_key') || null; }

// Seeds localStorage on first load so the app has data immediately
function bootstrap() {
  if (!localStorage.getItem('bdr2_bootstrapped')) {
    localStorage.setItem('bdr2_leads',   JSON.stringify(SEED_LEADS));
    localStorage.setItem('bdr2_outbound', JSON.stringify(SEED_OUTBOUND));
    localStorage.setItem('bdr2_bootstrapped', '1');
  }
}

function getLeads()    { bootstrap(); return JSON.parse(localStorage.getItem('bdr2_leads')   || '[]'); }
function setLeads(a)   { localStorage.setItem('bdr2_leads',   JSON.stringify(a)); }
function getOutbound() { bootstrap(); return JSON.parse(localStorage.getItem('bdr2_outbound') || '[]'); }
function setOutbound(a){ localStorage.setItem('bdr2_outbound', JSON.stringify(a)); }

// ── api object — same interface as bdr-app server ─────────────────────────────

export const api = {
  leads: {
    list:   async () => getLeads().sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0)),
    get:    async (id) => { const l = getLeads().find(l => l.id === id); if (!l) throw new Error('Not found'); return l; },
    create: async (data) => {
      const lead = { ...data, id: uid('lead'), date_added: new Date().toISOString().split('T')[0] };
      setLeads([...getLeads(), lead]);
      return lead;
    },
    update: async (id, data) => {
      const updated = getLeads().map(l => l.id === id ? { ...l, ...data, updated_at: new Date().toISOString() } : l);
      setLeads(updated);
      return updated.find(l => l.id === id);
    },
    delete: async (id) => { setLeads(getLeads().filter(l => l.id !== id)); },
  },

  outbound: {
    list: async () => getOutbound().map(a => ({ ...a, touchpoint_count: a.touchpoints?.length || 0 })),
    get:  async (id) => { const a = getOutbound().find(a => a.id === id); if (!a) throw new Error('Not found'); return a; },
    create: async (data) => {
      const acct = { ...data, id: uid('ob'), touchpoints: [], touchpoint_count: 0 };
      setOutbound([...getOutbound(), acct]);
      return acct;
    },
    update: async (id, data) => { setOutbound(getOutbound().map(a => a.id === id ? { ...a, ...data } : a)); return data; },
    addTouchpoint: async (id, data) => {
      const tp = { ...data, id: uid('tp') };
      setOutbound(getOutbound().map(a => a.id === id
        ? { ...a, touchpoints: [...(a.touchpoints||[]), tp], touchpoint_count: (a.touchpoints?.length||0)+1, last_touch: data.date || new Date().toISOString().split('T')[0] }
        : a));
      return tp;
    },
    weeklyStats: async () => {
      const tps = getOutbound().flatMap(a => a.touchpoints || []);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStr = weekAgo.toISOString().split('T')[0];
      const weekTouches = tps.filter(t => t.date >= weekStr);
      const meetings = weekTouches.filter(t => t.response === 'meeting_booked').length;
      return { touches: weekTouches.length, target: 50, meetings, conversion_rate: weekTouches.length > 0 ? Math.round((meetings / weekTouches.length) * 100) : 0 };
    },
  },

  analytics: {
    kpis: async () => {
      const leads = getLeads();
      const tps = getOutbound().flatMap(a => a.touchpoints || []);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStr = weekAgo.toISOString().split('T')[0];
      const weekTouches = tps.filter(t => t.date >= weekStr);
      const mc = portfolioMonteCarlo(leads);
      return {
        total_leads: leads.length,
        tier1: leads.filter(l => l.tier === 'Tier 1').length,
        tier2: leads.filter(l => l.tier === 'Tier 2').length,
        tier3: leads.filter(l => l.tier === 'Tier 3').length,
        weighted_pipeline: Math.round(leads.reduce((s, l) => s + (l.expected_acv||0) * (l.conversion_probability||0), 0)),
        pipeline_p5: mc.p5, pipeline_p95: mc.p95,
        touches_this_week: weekTouches.length,
        touch_target: 50,
        meetings_this_week: weekTouches.filter(t => t.response === 'meeting_booked').length,
      };
    },
    actionItems: async () => {
      const leads = getLeads();
      const outbound = getOutbound();
      const items = [];
      const today = new Date().toISOString().split('T')[0];
      for (const l of leads) {
        if (!l.last_touch) continue;
        const days = Math.floor((Date.now() - new Date(l.last_touch).getTime()) / 86400000);
        if (days >= 5 && ['new','qualifying'].includes(l.status))
          items.push({ type:'stale_lead', urgency: l.tier==='Tier 1'?'high':'medium', lead_id:l.id, company:l.company, message:`${l.company} hasn't been touched in ${days} days — ${l.tier}, score ${l.overall_score}`, action:'Follow up now' });
      }
      for (const l of leads.filter(l => l.tier==='Tier 1' && l.status==='qualifying'))
        items.push({ type:'handoff_ready', urgency:'high', lead_id:l.id, company:l.company, message:`${l.company} is Tier 1 (score ${l.overall_score}) but still in qualifying — ready for AE handoff`, action:'Generate handoff brief' });
      for (const a of outbound)
        if (a.next_step_date && a.next_step_date < today && a.status !== 'archived')
          items.push({ type:'overdue_outbound', urgency: a.outbound_tier==='tier_a'?'high':'medium', account_id:a.id, company:a.company, message:`${a.company} next step overdue: "${a.next_step}"`, action:'Generate outreach' });
      items.sort((a, b) => a.urgency==='high' ? -1 : 1);
      return items.slice(0, 5);
    },
  },
};

// ── Anthropic browser fetch helpers ──────────────────────────────────────────

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const HEADERS = (key) => ({
  'x-api-key': key,
  'anthropic-version': '2023-06-01',
  'content-type': 'application/json',
  'anthropic-dangerous-allow-browser': 'true',
});

// Makes a non-streaming Anthropic call and returns the text response
async function callClaude(apiKey, prompt, maxTokens = 2000) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: HEADERS(apiKey),
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `API ${res.status}`); }
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

// Makes a streaming Anthropic call and drips each text delta to onChunk
async function streamClaude(apiKey, prompt, onChunk, maxTokens = 600) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: HEADERS(apiKey),
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `API ${res.status}`); }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const evt = JSON.parse(data);
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          onChunk(evt.delta.text);
        }
      } catch {}
    }
  }
}

// ── Prompts (mirror the server ai.js prompts exactly) ────────────────────────

function researchPrompt(companyName) {
  return `You are a senior BDR research assistant for Anthropic, the AI safety company that makes Claude. Research this company and return a JSON intelligence brief.

Company: ${companyName}

Return ONLY valid JSON with no markdown. Schema:
{"company":"name","country":"HQ country","industry":"vertical","employee_count_estimate":number,"company_overview":"2-3 sentence summary","ai_readiness":{"score":1-5,"reasoning":"one sentence"},"use_case_fit":{"score":1-5,"top_use_cases":["case1","case2","case3"],"reasoning":"one sentence"},"compliance_sensitivity":{"score":1-5,"reasoning":"key regulations and how Claude addresses them"},"competitive_landscape":{"current_ai_tools":["tool1"],"likely_pain_points":["pain1","pain2","pain3"]},"compelling_events":["event1","event2"],"recommended_entry_point":{"title":"ideal contact title","reasoning":"why"},"messaging_angle":"one sentence hook for the AI decision-maker","overall_score":1-100,"tier":"Tier 1 or Tier 2 or Tier 3","battlecard":{"if_using_openai":"specific Claude advantage","if_using_google":"specific Claude advantage","if_greenfield":"how to position"},"recommended_products":["product1"],"expected_acv":number,"conversion_probability":0.0-1.0}

Tier 1 = score 70+, clear use case, budget likely, compelling event. Tier 2 = 40-69. Tier 3 = below 40.`;
}

function handoffPrompt(lead) {
  return `Write a concise AE handoff brief. Use structured headers. Be specific — mention actual pain points and advantages. No fluff.

Company: ${lead.company} (${lead.country}, ${lead.industry}, ${lead.employee_count_estimate?.toLocaleString()} employees)
Score: ${lead.overall_score}/100 — ${lead.tier}
Contact: ${lead.contact_name}, ${lead.contact_title}
Top Use Cases: ${(lead.use_case_fit_top_cases||[]).join(', ')}
Compelling Events: ${(lead.compelling_events||[]).join('; ')}
Recommended Products: ${(lead.recommended_products||[]).join(', ')}
Competitive Context: ${lead.battlecard_openai}
Messaging Angle: ${lead.messaging_angle}
Expected ACV: €${lead.expected_acv?.toLocaleString()}

Format: **Executive Summary** · **Why Claude, Why Now** · **Recommended Products** · **Competitive Positioning** · **Suggested Next Steps**`;
}

function outreachPrompt(account, channel) {
  const isEmail = channel === 'email';
  return `Write a ${isEmail ? 'cold email (with Subject: line)' : 'LinkedIn message (under 300 chars)'} from an Anthropic BDR. Be specific, reference the trigger signal naturally. First line must be about THEM, not us. No corporate jargon.

Target: ${account.entry_point_name}, ${account.entry_point_title} at ${account.company} (${account.country}, ${account.vertical})
Trigger: ${account.trigger_signal}
Messaging Angle: ${account.messaging_angle}
${isEmail ? 'Sign off: Best,\n[Your name], Anthropic EMEA' : ''}`;
}

function weeklyReportPrompt() {
  const leads = getLeads();
  const outbound = getOutbound();
  const tps = outbound.flatMap(a => a.touchpoints || []);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStr = weekAgo.toISOString().split('T')[0];
  const weekTouches = tps.filter(t => t.date >= weekStr).length;
  const pipelineValue = leads.reduce((s, l) => s + (l.expected_acv||0) * (l.conversion_probability||0), 0);
  const stale = leads.filter(l => l.last_touch && (Date.now() - new Date(l.last_touch).getTime()) / 86400000 > 5 && ['new','qualifying'].includes(l.status)).map(l => l.company);

  return `Write a concise weekly BDR pipeline summary. 5 bullets max. Be specific — use company names and numbers. Format each as **Header**: body.

Data:
- Leads: ${JSON.stringify(leads.map(l => ({ company: l.company, tier: l.tier, score: l.overall_score, status: l.status, acv: l.expected_acv })))}
- Outbound accounts: ${JSON.stringify(outbound.map(a => ({ company: a.company, tier: a.outbound_tier, status: a.status, touches: a.touchpoint_count })))}
- Touches this week: ${weekTouches} / 50 target
- Weighted pipeline: €${Math.round(pipelineValue).toLocaleString()}
- Stale leads: ${stale.join(', ') || 'none'}

Focus on: what to act on NOW, what's at risk, one tactical recommendation.`;
}

// ── Public API: researchCompany ───────────────────────────────────────────────

// Researches a company using real Claude (if key set) or pre-baked data (demo mode).
// Maps the nested AI JSON response to flat lead DB fields.
export async function researchCompany(companyName) {
  const apiKey = getApiKey();

  if (apiKey) {
    const text = await callClaude(apiKey, researchPrompt(companyName));
    const jsonStr = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    const d = JSON.parse(jsonStr);
    return {
      company:                   d.company || companyName,
      country:                   d.country || '',
      industry:                  d.industry || '',
      employee_count_estimate:   d.employee_count_estimate || 0,
      company_overview:          d.company_overview || '',
      ai_readiness_score:        d.ai_readiness?.score || 3,
      ai_readiness_reasoning:    d.ai_readiness?.reasoning || '',
      use_case_fit_score:        d.use_case_fit?.score || 3,
      use_case_fit_top_cases:    d.use_case_fit?.top_use_cases || [],
      use_case_fit_reasoning:    d.use_case_fit?.reasoning || '',
      compliance_sensitivity_score:   d.compliance_sensitivity?.score || 3,
      compliance_sensitivity_reasoning: d.compliance_sensitivity?.reasoning || '',
      current_ai_tools:          d.competitive_landscape?.current_ai_tools || [],
      likely_pain_points:        d.competitive_landscape?.likely_pain_points || [],
      compelling_events:         d.compelling_events || [],
      entry_point_title:         d.recommended_entry_point?.title || '',
      entry_point_reasoning:     d.recommended_entry_point?.reasoning || '',
      messaging_angle:           d.messaging_angle || '',
      overall_score:             d.overall_score || 50,
      tier:                      d.tier || 'Tier 3',
      battlecard_openai:         d.battlecard?.if_using_openai || '',
      battlecard_google:         d.battlecard?.if_using_google || '',
      battlecard_greenfield:     d.battlecard?.if_greenfield || '',
      recommended_products:      d.recommended_products || [],
      expected_acv:              d.expected_acv || 25000,
      conversion_probability:    d.conversion_probability || 0.1,
      status:                    'new',
      route_to:                  'enterprise_ae',
    };
  }

  // Demo fallback — pre-baked data for known companies, generic template for others
  const RESEARCH_BRIEFS = {
    'revolut':     SEED_LEADS.find(l => l.company === 'Revolut'),
    'klarna':      SEED_LEADS.find(l => l.company === 'Klarna'),
    'bnp paribas': SEED_LEADS.find(l => l.company === 'BNP Paribas'),
    'wise':        SEED_LEADS.find(l => l.company === 'Wise'),
    'doctolib':    SEED_LEADS.find(l => l.company === 'Doctolib'),
  };
  const key = companyName.trim().toLowerCase();
  const match = RESEARCH_BRIEFS[key];
  if (match) {
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const { id, date_added, last_touch, ...rest } = match;
    return rest;
  }
  await new Promise(r => setTimeout(r, 1800));
  return {
    company: companyName, country: 'Europe', industry: 'Technology', employee_count_estimate: 1000,
    company_overview: `${companyName} — add your Anthropic API key to get real AI research on any company.`,
    ai_readiness_score: 3, ai_readiness_reasoning: 'Add API key for real analysis.',
    use_case_fit_score: 3, use_case_fit_top_cases: ['Internal tooling', 'Customer support'], use_case_fit_reasoning: 'Generic estimate.',
    compliance_sensitivity_score: 3, compliance_sensitivity_reasoning: 'Standard GDPR.',
    current_ai_tools: ['Unknown'], likely_pain_points: ['Manual processes at scale'], compelling_events: ['Recent growth'],
    entry_point_title: 'CTO', entry_point_reasoning: 'Technical decision maker.',
    messaging_angle: 'Add an Anthropic API key (⚙ in top bar) to generate real research.',
    overall_score: 50, tier: 'Tier 2',
    battlecard_openai: '', battlecard_google: '', battlecard_greenfield: '',
    recommended_products: ['Claude API'],
    status: 'new', expected_acv: 50000, conversion_probability: 0.1, route_to: 'startup_ae',
  };
}

// ── Public API: streamAI ──────────────────────────────────────────────────────

// Streams AI text for weekly reports, handoff briefs, and outreach messages.
// Routes to real Claude when key is set, pre-generated text otherwise.
export async function streamAI(path, body, onChunk) {
  const apiKey = getApiKey();

  if (apiKey) {
    let prompt;
    if (path === '/ai/weekly-report') {
      prompt = weeklyReportPrompt();
    } else if (path.startsWith('/ai/handoff/')) {
      const id = path.split('/').pop();
      const lead = getLeads().find(l => l.id === id);
      if (!lead) { onChunk('Lead not found.'); return; }
      prompt = handoffPrompt(lead);
    } else if (path.startsWith('/ai/outreach/')) {
      const id = path.split('/').pop();
      const account = getOutbound().find(a => a.id === id);
      if (!account) { onChunk('Account not found.'); return; }
      prompt = outreachPrompt(account, body?.channel || 'email');
    } else {
      onChunk('Unknown endpoint.'); return;
    }
    await streamClaude(apiKey, prompt, onChunk);
    return;
  }

  // Demo fallback — pre-generated text with typewriter effect
  const AI_TEXT = {
    '/ai/weekly-report': `**Pipeline Health**: Klarna (99) and Revolut (97) are both in qualifying with confirmed budgets — push for pilot scoping calls this week before competitor evaluations close.\n\n**Best Inbound**: Wise entered the pipeline after AWS Bedrock failed their multilingual pilot. Send the language benchmark deck before EOW — this is a 6-8 week window.\n\n**Outbound Action**: Allianz next step is overdue. CDO showed interest in audit trail features on last call — send the EU AI Act compliance one-pager as a nudge.\n\n**Meeting Prep**: Adyen meeting booked for tomorrow. Prep discovery agenda focused on PCI-DSS + SLA requirements, reference the Stripe case study.\n\n**Long Cycle Flag**: BNP Paribas procurement is 6-9 months but DORA deadline creates urgency — flag for AE now so they can start the security review.`,
  };

  let key = path;
  if (path.startsWith('/ai/handoff/')) {
    const id = path.split('/').pop();
    const lead = getLeads().find(l => l.id === id);
    key = `/ai/handoff/${lead?.company?.toLowerCase() || id}`;
  }

  const HANDOFFS = {
    '/ai/handoff/revolut': `**AE Handoff Brief — Revolut**\n\n**Executive Summary**\nRevolut is Tier 1 with CEO-level sponsorship and confirmed €480K budget. FCA compliance makes Claude the only viable option over GPT-4o.\n\n**Why Claude, Why Now**\nFCA Q1 AI guidance requires audit trails for all AI outputs. Constitutional AI provides this by design — 3.1× fewer hallucinations on financial narrative tasks.\n\n**Recommended Products**\nClaude API (fraud narratives) → Claude Enterprise (expand to 8M+ CS conversations).\n\n**Competitive Positioning**\nActive GPT-4o evaluation. Win with: FCA audit compliance by design, 200K context for full transaction history, UK data residency option.\n\n**Suggested Next Steps**\n1. AE intro call with Head of AI within 5 days\n2. 2-week pilot: 10K fraud transactions\n3. SLA proposal with 99.9% uptime commitment`,
  };

  const text = HANDOFFS[key] || AI_TEXT[path] || AI_TEXT['/ai/weekly-report'];

  // Generate outreach text on the fly from account data
  if (path.startsWith('/ai/outreach/')) {
    const id = path.split('/').pop();
    const account = getOutbound().find(a => a.id === id);
    const channel = body?.channel || 'email';
    const outreachFallback = account
      ? (channel === 'email'
          ? `Subject: ${account.trigger_signal?.split(';')[0] || account.company + ' — quick question'}\n\nHi ${account.entry_point_name?.split(' ')[0] || 'there'},\n\n${account.messaging_angle}\n\nWorth 20 minutes this week?\n\nBest,\n[Your name], Anthropic EMEA`
          : `Hi ${account.entry_point_name?.split(' ')[0] || 'there'} — ${account.messaging_angle} Worth a quick chat?`)
      : 'Add an Anthropic API key to generate personalised outreach.';
    await drip(outreachFallback, onChunk);
    return;
  }

  await drip(text, onChunk);
}

// Drips text character by character to simulate Claude streaming
function drip(text, onChunk, charDelay = 12) {
  return new Promise(resolve => {
    let i = 0;
    function tick() {
      if (i >= text.length) { resolve(); return; }
      const chunk = text.slice(i, i + Math.ceil(Math.random() * 3));
      onChunk(chunk);
      i += chunk.length;
      setTimeout(tick, charDelay);
    }
    tick();
  });
}
