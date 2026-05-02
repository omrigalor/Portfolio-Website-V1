import { useState } from 'react';

const CYBER_COLOR   = '#60a5fa';
const FINTECH_COLOR = '#34d399';
const ACCENT        = '#818cf8';

const COMPANIES = [
  {
    id: 'capsule',
    name: 'Capsule Security',
    category: 'cyber',
    categoryLabel: 'AI Agent Runtime',
    stage: '$7M Seed',
    stageDate: 'Apr 2026',
    hook: 'Runtime security for AI agents — monitors and blocks unsafe actions before they complete, without proxies or SDKs',
    conviction: 'strong',
    replaced: false,
    founders: [
      { name: 'Naor Paz',      note: 'F5 Networks · Unit 8200' },
      { name: 'Lidan Hazout',  note: 'Securedtouch · Transmit Security · Ping Identity' },
    ],
    investors: 'Lama Partners · Forgepoint Capital International',
    advisors: 'Chris Krebs (1st CISA Director) · Omer Grossman (ex-CyberArk Global CIO)',
    signals: [
      'Gartner named Capsule a representative vendor in its new "guardian agents" market guide — a category that didn\'t exist 18 months ago',
      'Top 6 finalist in the CrowdStrike / AWS / NVIDIA Startup Accelerator out of ~1,000 applicants',
      'Discovered CVEs in Microsoft Copilot Studio and Salesforce Agentforce before general availability',
    ],
    asia: 'No-infrastructure deployment is a procurement advantage in conservative Asian enterprise buying cycles. Every company deploying AI agents across Singapore, Japan, or India will need a runtime security layer — and will need it soon.',
    competitive: 'Zenity (ahead on posture breadth, $38M raised), Prompt Security (prompt-level focus). Capsule differentiates on runtime enforcement depth — it stops unsafe actions as they execute, not after. The no-SDK model is a meaningful procurement advantage.',
    rationale: 'New Gartner category at exactly the right moment. Stage, team pedigree, and technical differentiation all align. The frictionless deployment removes the integration barrier that routinely kills US security tools in Asia.',
  },
  {
    id: 'onit',
    name: 'Onit Security',
    category: 'cyber',
    categoryLabel: 'Agentic Vuln Remediation',
    stage: '$11M Seed',
    stageDate: 'Mar 2026',
    hook: 'AI agents that fix vulnerabilities, not just flag them — 87% reduction in mean time-to-remediation',
    conviction: 'strong',
    replaced: false,
    founders: [
      { name: 'Elad Ben-Meir', note: 'Serial entrepreneur' },
      { name: 'Ofer Amitai',   note: 'Portnox founder → PE exit' },
      { name: 'Tom Winter',    note: 'SCADAfence → Honeywell · For-Each → Autodesk' },
    ],
    investors: 'Hetz Ventures · Brightmind Partners',
    advisors: null,
    signals: [
      '3 prior exits across the founding team: SCADAfence (Honeywell), Portnox (PE), For-Each (Autodesk) — strongest track record on this list',
      'Already working with Fortune 1000 customers — 87% reduction in mean time-to-remediation reported',
      'Born from a real Iranian state-sponsored cyberattack on a company the co-founder previously managed, where attackers exploited a known vulnerability buried in the backlog',
    ],
    asia: 'Fortune 1000 includes major Asian banks and manufacturers facing the identical 32-day average remediation window. Once a fix strategy is defined, Onit applies it automatically to all similar future exposures — that learning compounds across regions.',
    competitive: 'Traditional vuln management (Qualys, Tenable, Rapid7) is detection-only. Onit is the remediation layer on top. No direct competitor doing agentic, context-aware auto-remediation at this stage.',
    rationale: 'Best founding team on this list by track record — three exits means three times the pattern recognition on what enterprise security buyers actually need. The "fix, don\'t flag" angle is the generational leap in vuln management.',
  },
  {
    id: 'mate',
    name: 'Mate',
    category: 'cyber',
    categoryLabel: 'AI-Native SOC',
    stage: '$15.5M Seed',
    stageDate: 'Nov 2025',
    hook: 'AI-native SOC — turns 45-minute alert investigations into 45-second validations by learning from your best analysts',
    conviction: 'solid',
    replaced: false,
    caveat: 'Team8 + Insight Partners will likely dominate next-round allocation. BlueRed needs a clear Asia distribution angle to get in.',
    founders: [
      { name: 'Asaf Wiener',  note: 'First Wiz alumnus to found a startup · ex-Microsoft' },
      { name: 'Oren Saban',   note: 'Head of Product, Microsoft Defender XDR & Security Copilot' },
      { name: 'Guy Pergal',   note: 'Microsoft MSTIC · Axonius' },
    ],
    investors: 'Team8 · Insight Partners',
    advisors: null,
    signals: [
      'Best-in-class founder pedigree — Wiz + Microsoft Defender XDR product leadership at seed stage',
      'Pilot programs with major financial institutions showed dramatic MTTR and false positive reductions',
      'Platform learns an organization\'s environment in hours, not weeks — removing the localization barrier that kills most US security tools in Asia',
    ],
    asia: '83% of SOC analysts feel overwhelmed (Devo research). Asian financial institutions and telcos face identical alert volumes. The "learns your environment in hours" pitch eliminates the localization friction that typically requires months of tuning.',
    competitive: 'CrowdStrike, SentinelOne, Palo Alto all have SOC automation. But Mate builds institutional knowledge from an organization\'s own analysts — not generic playbooks. That distinction matters for enterprises that want memory, not rules.',
    rationale: 'Exceptional company. The allocation caveat is real but surmountable if BlueRed can articulate Asia distribution value. The first Wiz alumnus founding a company is a story investors will compete to be part of.',
  },
  {
    id: 'above',
    name: 'Above Security',
    category: 'cyber',
    categoryLabel: 'Insider Threat + AI Agents',
    stage: '$50M total',
    stageDate: 'Seed → Series A in 6 months',
    hook: 'AI-native insider threat — the first platform to treat AI agents as insiders alongside humans, with zero configuration required',
    conviction: 'solid',
    replaced: true,
    replaces: 'Sola Security',
    replaceReason: 'Sola has $65M total raised and a cap table full of S32, M12, and Mike Moritz — no realistic path for BlueRed to get allocation. Above is earlier, hotter, and in a more differentiated category.',
    founders: [
      { name: 'Aviv Nahum', note: 'Unit 81 (elite signals intelligence)' },
      { name: 'Amir Boldo', note: 'Unit 49 · prior exit' },
    ],
    investors: 'Ballistic Ventures · Merlin Ventures · Norwest · Jump Capital · QPV Ventures',
    advisors: null,
    signals: [
      'Seed-to-Series A in 6 months — already generating substantial revenue at founding, not pre-revenue',
      'Top 5 in the CrowdStrike / AWS / NVIDIA Startup Accelerator out of ~1,000 applicants',
      '45% of breaches are non-malicious human and system errors (IBM) — the systematically under-addressed attack surface',
    ],
    asia: 'Insider threat is amplified in Asian markets where data sovereignty regulations are strict and employee turnover in Singapore and Bangalore creates constant access management friction. Zero-config deployment removes the localization barrier entirely.',
    competitive: 'Legacy DLP/UEBA tools (Varonis, Forcepoint, Microsoft Purview) require extensive rule configuration and were built before AI agents existed. Above is the first platform to treat AI agents as insiders alongside humans — genuinely new category framing.',
    rationale: 'Better access than Sola at comparable cyber credibility. The 6-month seed-to-Series A velocity and the AI-agent-as-insider category angle make this the most forward-looking pick on the cyber side.',
  },
  {
    id: 'safebooks',
    name: 'Safebooks',
    category: 'fintech',
    categoryLabel: 'Revenue Integrity',
    stage: '$15M Seed',
    stageDate: 'Dec 2025',
    hook: 'Agentic revenue integrity — one source of truth from CRM to cash, for every contract, invoice, and payment',
    conviction: 'strong',
    replaced: true,
    replaces: 'Celery',
    replaceReason: 'Celery has $9M total, 15 employees, and is focused on payroll auditing for US healthcare — too niche, no Asia play, and a feature not a platform.',
    founders: [
      { name: 'Ahikam Kaufman', note: 'Co-founded Check → acquired by Intuit for $360M · ex-Mercury · ex-HP · ex-Intuit' },
    ],
    investors: '10D · Propel Ventures · Mensch Capital · Moneta VC · Magnolia Capital',
    advisors: null,
    signals: [
      'Founder\'s previous company Check was acquired by Intuit for $360M — proven exit with direct domain expertise',
      'Already monitored $40B+ in financial transactions; thousands of hours of manual reconciliation eliminated for enterprise SaaS',
      'Platform reads documents in any format and ties every opportunity, invoice, contract, billing record, and payment into a unified map',
    ],
    asia: 'Multi-entity, multi-currency revenue reconciliation is the operational nightmare of every ASEAN enterprise. Companies expanding across Southeast Asia — different tax regimes, billing systems, currencies across subsidiaries — are exactly the target customer.',
    competitive: 'No direct competitor doing "agentic revenue integrity." Adjacent to legacy reconciliation tools (BlackLine, Trintech) and narrow tools like Celery (US healthcare payroll). Safebooks operates at a larger, less crowded scope.',
    rationale: 'Proven exit founder returning with domain expertise. 4x the funding of the company it replaces, $40B+ in transaction proof, and a TAM that scales with any company operating across borders — which is every BlueRed portfolio company.',
  },
  {
    id: 'slice',
    name: 'Slice',
    category: 'fintech',
    categoryLabel: 'Global Equity Compliance',
    stage: '$32M total',
    stageDate: 'Series A, Jan 2026',
    hook: 'The only AI-native platform for cross-border equity compliance — stock options, RSUs, grants, across 100+ countries',
    conviction: 'strong',
    replaced: true,
    replaces: 'PointFive',
    replaceReason: 'PointFive is already at Series A ($36M total) in a massively crowded FinOps market with no specific Asia play. Slice is in a far less crowded category with direct relevance to BlueRed\'s existing portfolio.',
    founders: [
      { name: 'Maor Levran',  note: 'Top-ranked tech attorney (Legal 500) — unique distribution insight' },
      { name: 'Yoel Amir',    note: 'ex-Google · ex-Salesforce' },
      { name: 'Samuel Amar',  note: 'Elite IDF intelligence · 6+ years' },
    ],
    investors: 'Insight Partners · TLV Partners · Fenwick · Cooley LLP · R-Squared · Jibe Ventures',
    advisors: null,
    signals: [
      '100+ customers including Wiz, Wayve, Orca, Silverfort, VAST Data, Aqua Security, Cyera, Upwind — every elite Israeli tech company on the list',
      '$25M Series A led by Insight Partners with Fenwick and Cooley LLP participating as investors (unprecedented for a law firm)',
      'Full equity lifecycle across 100+ countries: cap table, grants, exercises, tax reporting, compliance, liquidity event preparation',
    ],
    asia: 'The most direct Israel→Asia bridge product on this list. Every Israeli tech company expanding into Southeast Asia faces cross-border equity compliance chaos. Every BlueRed portfolio company likely needs Slice today. Also valuable for Asian companies hiring globally.',
    competitive: 'Main competitor is Carta, which handles US equity well but international compliance poorly. Legacy local law firms are the alternative. Slice is the only AI-native global equity platform with this breadth.',
    rationale: 'The strategic fit for BlueRed is uniquely strong. Every company BlueRed has ever backed likely has a Slice use case — this is rare in a sourcing list. The customer roster (Wiz, Orca, VAST Data) proves enterprise product-market fit.',
  },
  {
    id: 'panax',
    name: 'Panax',
    category: 'fintech',
    categoryLabel: 'Cash Flow Management',
    stage: '$15.5M total',
    stageDate: 'Series A, May 2024',
    hook: 'AI cash flow management for multi-entity, multi-currency operations — real-time visibility across manufacturing, logistics, and real estate',
    conviction: 'solid',
    replaced: false,
    caveat: 'The least "exciting" pick on this list, but the most practically relevant for BlueRed\'s existing ASEAN network.',
    founders: [
      { name: 'Noam Mills',       note: 'Harvard · former world-ranked fencer (Israel national team)' },
      { name: 'Sefi Itzkovich',   note: 'ex-CTO Otonomo · ex-Facebook ML' },
      { name: 'Niv Yaar',         note: 'Co-founder' },
    ],
    investors: 'Team8 · TLV Partners',
    advisors: null,
    signals: [
      'Named in Calcalist\'s Top 50 Most Promising Israeli Startups 2025',
      'Doubled customer count in Q1 2024; customers include public beauty company Oddity',
      'Focused specifically on manufacturing, logistics, and real estate — the industries that dominate ASEAN economies',
    ],
    asia: 'Multi-entity, multi-currency cash visibility is the #1 operational pain for Asian conglomerates and manufacturers. Manufacturing, logistics, and real estate — Panax\'s exact target — are ASEAN\'s core economic pillars. Every logistics conglomerate in Singapore or Vietnam has this exact problem.',
    competitive: 'Kyriba (enterprise, expensive), Embat, Statement, Vesto. Panax differentiates on mid-market focus and AI-driven proactive insights rather than passive dashboard reporting.',
    rationale: 'Not category-defining. But tactically the most plug-and-play for BlueRed\'s network. The industry alignment with ASEAN\'s economic backbone makes it the easiest introduction conversation of the seven.',
  },
];

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)', fontWeight: 600, marginBottom: 7 }}>{title}</div>
      {children}
    </div>
  );
}

function CompanyCard({ company: c, isOpen, onToggle, index }) {
  const catColor = c.category === 'cyber' ? CYBER_COLOR : FINTECH_COLOR;
  const convictionMeta = {
    strong: { color: '#4ade80', label: 'Strong fit' },
    solid:  { color: '#fb923c', label: 'Solid' },
  }[c.conviction] || { color: '#94a3b8', label: 'Watchlist' };

  return (
    <div style={{
      background: isOpen ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.022)',
      border: `1px solid ${isOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'border-color 0.2s, background 0.2s',
    }}>
      {/* Collapsed row */}
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '13px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', width: 14, flexShrink: 0 }}>{index + 1}</span>

        <div style={{ width: 7, height: 7, borderRadius: '50%', background: catColor, flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{c.name}</span>
            <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 4, background: catColor + '18', color: catColor, fontWeight: 600, letterSpacing: '0.02em' }}>
              {c.categoryLabel}
            </span>
            {c.replaced && (
              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 4, background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontWeight: 600, letterSpacing: '0.02em' }}>
                ↑ Replaces {c.replaces}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', marginTop: 3, lineHeight: 1.5 }}>{c.hook}</p>
        </div>

        <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 80 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontFamily: 'monospace' }}>{c.stage}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{c.stageDate}</div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, minWidth: 72 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: convictionMeta.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: convictionMeta.color, fontWeight: 600 }}>{convictionMeta.label}</span>
        </div>

        <span style={{
          fontSize: 11, color: 'rgba(255,255,255,0.25)', flexShrink: 0,
          display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
        }}>▾</span>
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div style={{ padding: '4px 18px 22px 54px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {(c.caveat || c.replaced) && (
            <div style={{
              margin: '14px 0 16px',
              padding: '8px 13px', borderRadius: 8,
              background: c.caveat ? 'rgba(251,191,36,0.07)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${c.caveat ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              <span style={{ fontSize: 12, color: c.caveat ? '#fbbf24' : 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                {c.caveat || `Replaces ${c.replaces} — ${c.replaceReason}`}
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Section title="Founders">
                {c.founders.map((f, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>{f.note}</div>
                  </div>
                ))}
              </Section>
              <Section title="Investors">
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{c.investors}</p>
              </Section>
              {c.advisors && (
                <Section title="Key Advisors">
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{c.advisors}</p>
                </Section>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Section title="Key Signals">
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {c.signals.map((s, i) => (
                    <li key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)', lineHeight: 1.65, paddingLeft: 13, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: catColor, fontWeight: 700 }}>·</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </Section>
              <Section title="Asia Angle">
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{c.asia}</p>
              </Section>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 20 }}>
            <Section title="Competitive Context">
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{c.competitive}</p>
            </Section>
            <Section title="Why BlueRed">
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{c.rationale}</p>
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlueRedMemo({ onBack }) {
  const [filter,   setFilter]   = useState('all');
  const [expanded, setExpanded] = useState(null);

  const visible     = filter === 'all' ? COMPANIES : COMPANIES.filter(c => c.category === filter);
  const cyberCount  = COMPANIES.filter(c => c.category === 'cyber').length;
  const fintechCount= COMPANIES.filter(c => c.category === 'fintech').length;
  const replacedCount = COMPANIES.filter(c => c.replaced).length;

  return (
    <div style={{ background: '#060612', color: 'white', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(6,6,18,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 24px', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onBack} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            ← Portfolio
          </button>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: ACCENT }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>BlueRed Partners</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>· Deal Sourcing Memo</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { id: 'all',     label: `All  ${COMPANIES.length}` },
            { id: 'cyber',   label: `Cyber  ${cyberCount}` },
            { id: 'fintech', label: `Fintech  ${fintechCount}` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '4px 13px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: filter === f.id ? 'rgba(255,255,255,0.09)' : 'transparent',
              color: filter === f.id ? 'white' : 'rgba(255,255,255,0.38)',
              border: filter === f.id ? '1px solid rgba(255,255,255,0.13)' : '1px solid transparent',
            }}>{f.label}</button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* Context strip */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.28)', fontWeight: 600, marginBottom: 10 }}>
            BlueRed Partners · Singapore · Israeli Tech → Asian Markets
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.7, maxWidth: 580, marginBottom: 20 }}>
            Assignment: source 7 seed/post-seed Israeli companies in cyber, fintech, and FinOps with clear Asia market fit.
            Independently evaluated ~40 companies, validated each against stage, competitive landscape, founder quality, and
            Asia relevance — replacing {replacedCount} of the originally suggested picks.
          </p>
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { value: '7',   label: 'shortlisted' },
              { value: String(replacedCount),  label: 'independently replaced' },
              { value: '~40', label: 'evaluated' },
              { value: '2',   label: 'categories' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'monospace', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { dot: CYBER_COLOR,   label: 'Cyber' },
            { dot: FINTECH_COLOR, label: 'Fintech' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.dot }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{l.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Strong fit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fb923c' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Solid (caveat noted)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fbbf24', borderRadius: 2 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>↑ Replaces original pick</span>
          </div>
        </div>

        {/* Company cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {visible.map((c, i) => (
            <CompanyCard
              key={c.id}
              company={c}
              index={COMPANIES.indexOf(c)}
              isOpen={expanded === c.id}
              onToggle={() => setExpanded(prev => prev === c.id ? null : c.id)}
            />
          ))}
        </div>

        {/* Methodology */}
        <div style={{ marginTop: 52, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.22)', fontWeight: 600, marginBottom: 10 }}>Methodology</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.8 }}>
            Sourced from ~40 Israeli companies identified through Calcalist rankings, Crunchbase, recent funding announcements,
            and RSAC / CrowdStrike / AWS / NVIDIA accelerator lists. Each company was evaluated against four criteria:
            stage fit for BlueRed's investment thesis, genuine differentiation within its category, specific and defensible
            Asia market applicability, and founding team quality relative to stage. Four of the seven originally proposed
            companies were replaced after identifying stage mismatches, full cap tables, or insufficient Asia relevance.
          </p>
        </div>
      </div>
    </div>
  );
}
