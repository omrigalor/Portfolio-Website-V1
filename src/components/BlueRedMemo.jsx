import { useState } from 'react';

const ACCENT = '#818cf8';

const COMPANIES = [
  {
    id: 'capsule',
    name: 'Capsule Security',
    sector: 'Cyber',
    stage: '$7M Seed',
    stageDate: 'Apr 2026',
    hook: 'Runtime security for AI agents — monitors and blocks unsafe actions before they complete, without proxies or SDKs',
    conviction: 'top',
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
    competitive: 'Zenity (ahead on posture breadth, $38M raised), Prompt Security (prompt-level focus). Capsule differentiates on runtime enforcement depth — it stops unsafe actions as they execute, not after.',
    blueRedEdge: 'BlueRed\'s APAC financial institution network gives Capsule direct access to enterprise pilot customers in Singapore, Japan, and India who are actively deploying AI agents. Can also facilitate regional compliance advisory introductions.',
  },
  {
    id: 'onit',
    name: 'Onit Security',
    sector: 'Cyber',
    stage: '$11M Seed',
    stageDate: 'Mar 2026',
    hook: 'AI agents that fix vulnerabilities — not just flag them. 87% reduction in mean time-to-remediation',
    conviction: 'top',
    founders: [
      { name: 'Elad Ben-Meir', note: 'Serial entrepreneur' },
      { name: 'Ofer Amitai',   note: 'Portnox founder → PE exit' },
      { name: 'Tom Winter',    note: 'SCADAfence → Honeywell · For-Each → Autodesk' },
    ],
    investors: 'Hetz Ventures · Brightmind Partners',
    advisors: null,
    signals: [
      '3 prior exits across the founding team: SCADAfence (Honeywell), Portnox (PE), For-Each (Autodesk) — strongest founder track record on this list',
      'Fortune 1000 customers already live — 87% reduction in mean time-to-remediation reported in early deployments',
      'Born from a real Iranian state-sponsored cyberattack where attackers exploited a known vulnerability buried in the co-founder\'s backlog',
    ],
    asia: 'Fortune 1000 includes major Asian banks and manufacturers facing the same 32-day average remediation gap. Once a fix strategy is defined, Onit applies it automatically to all similar future exposures — that learning compounds across regions.',
    competitive: 'Traditional vuln management (Qualys, Tenable, Rapid7) is detection-only. Onit is the remediation execution layer on top. No direct competitor at this stage doing agentic, context-aware auto-remediation.',
    blueRedEdge: 'BlueRed\'s portfolio of Israeli-origin companies with Asian operations provides immediate warm introductions to Fortune 1000-equivalent customers with the exact remediation backlog Onit was built to solve.',
  },
  {
    id: 'mate',
    name: 'Mate',
    sector: 'Cyber',
    stage: '$15.5M Seed',
    stageDate: 'Nov 2025',
    hook: 'AI-native SOC — turns 45-minute alert investigations into 45-second validations by learning from your own analysts',
    conviction: 'strong',
    founders: [
      { name: 'Asaf Wiener',  note: 'First Wiz alumnus to found a startup · ex-Microsoft' },
      { name: 'Oren Saban',   note: 'Head of Product, Microsoft Defender XDR & Security Copilot' },
      { name: 'Guy Pergal',   note: 'Microsoft MSTIC · Axonius' },
    ],
    investors: 'Team8 · Insight Partners',
    advisors: null,
    signals: [
      'First Wiz alumnus to start a company — backed by Team8 and Insight Partners at seed',
      'Pilot programs with major financial institutions showed dramatic MTTR and false positive reductions',
      'Platform learns an organization\'s full environment in hours, not weeks — critical for Asia deployments where US tools typically require months of localization',
    ],
    asia: '83% of SOC analysts feel overwhelmed (Devo research). Asian financial institutions and telcos face identical alert volumes. The "learns your environment in hours" model eliminates the localization friction that routinely kills US security products in Asia.',
    competitive: 'CrowdStrike, SentinelOne, Palo Alto all have SOC automation layers. Mate builds institutional knowledge from an org\'s own best analysts — not generic playbooks. That distinction matters for enterprises that want memory, not rules.',
    blueRedEdge: 'BlueRed\'s deep relationships with APAC financial institution CISOs — the exact decision-makers for SOC tooling — is the single most compelling allocation argument for getting into this oversubscribed round.',
  },
  {
    id: 'above',
    name: 'Above Security',
    sector: 'Cyber',
    stage: '$43M Series A',
    stageDate: 'Mar 2026',
    hook: 'AI-native insider threat — the first platform to treat AI agents as insiders alongside humans. Zero configuration required',
    conviction: 'strong',
    founders: [
      { name: 'Aviv Nahum', note: 'Unit 81 (elite signals intelligence) · prior exit' },
      { name: 'Amir Boldo', note: 'Unit 49 · prior exit' },
    ],
    investors: 'Ballistic Ventures · Merlin Ventures · Norwest · Jump Capital · QPV Ventures',
    advisors: null,
    signals: [
      'Seed to Series A in 6 months — already generating substantial revenue, not pre-revenue',
      'Top 5 in the CrowdStrike / AWS / NVIDIA Startup Accelerator out of ~1,000 applicants',
      '45% of breaches are non-malicious human and system errors (IBM) — the systematically under-addressed attack surface',
    ],
    asia: 'Insider threat concerns are amplified in Asian markets where data sovereignty regulations are strict and high employee turnover in Singapore and Bangalore creates constant access management pressure. Zero-config deployment removes the integration barrier entirely.',
    competitive: 'Legacy DLP/UEBA tools (Varonis, Forcepoint, Microsoft Purview) require extensive rule configuration and were built before AI agents existed. Above is the first platform to classify AI agents as insiders — genuinely new category framing.',
    blueRedEdge: 'BlueRed can introduce Above to MAS-regulated financial institutions in Singapore, where the MAS Technology Risk Management guidelines create direct regulatory pull for insider threat tooling at board level.',
  },
  {
    id: 'safebooks',
    name: 'Safebooks',
    sector: 'Fintech',
    stage: '$15M Seed',
    stageDate: 'Dec 2025',
    hook: 'Agentic revenue integrity — one source of truth from CRM to cash, for every contract, invoice, and payment',
    conviction: 'top',
    founders: [
      { name: 'Ahikam Kaufman', note: 'Co-founded Check → acquired by Intuit for $360M · ex-Mercury · ex-HP · ex-Intuit' },
    ],
    investors: '10D · Propel Ventures · Mensch Capital · Moneta VC · Magnolia Capital',
    advisors: null,
    signals: [
      'Co-founder of Check, acquired by Intuit for $360M — proven exit founder returning with full domain expertise',
      '$40B+ in financial transactions already monitored; thousands of hours of manual reconciliation eliminated for enterprise SaaS',
      'Platform reads documents in any format and ties every opportunity, invoice, contract, and payment into a single auditable map',
    ],
    asia: 'Multi-entity, multi-currency revenue reconciliation is the operational nightmare of every ASEAN enterprise. Companies expanding across Southeast Asia — different tax regimes, billing systems, and currencies — are exactly the target customer.',
    competitive: 'No direct competitor doing "agentic revenue integrity." Adjacent to legacy reconciliation tools (BlackLine, Trintech) but operating at a broader scope. The $40B+ in transactions is early proof that this scales.',
    blueRedEdge: 'BlueRed\'s portfolio companies operating across ASEAN subsidiaries are immediate target customers. Can also facilitate introductions to the Big 4 accounting firms in Singapore who advise on cross-border revenue operations.',
  },
  {
    id: 'slice',
    name: 'Slice',
    sector: 'Fintech',
    stage: '$25M Series A',
    stageDate: 'Jan 2026',
    hook: 'The only AI-native platform for cross-border equity compliance — stock options, RSUs, and grants across 100+ countries',
    conviction: 'top',
    founders: [
      { name: 'Maor Levran',  note: 'Top-ranked tech attorney (Legal 500) — unique GTM advantage' },
      { name: 'Yoel Amir',    note: 'ex-Google · ex-Salesforce' },
      { name: 'Samuel Amar',  note: 'Elite IDF intelligence · 6+ years' },
    ],
    investors: 'Insight Partners · TLV Partners · Fenwick · Cooley LLP · R-Squared · Jibe Ventures',
    advisors: null,
    signals: [
      '100+ customers including Wiz, Wayve, Orca, Silverfort, VAST Data, Aqua Security, Cyera, Upwind — every elite Israeli tech company on the list',
      '$25M Series A led by Insight Partners with Fenwick and Cooley LLP participating as investors — unprecedented for two top US law firms',
      'Full equity lifecycle across 100+ countries: grants, exercises, tax reporting, compliance, and liquidity event preparation',
    ],
    asia: 'The most direct Israel→Asia bridge product on this list. Every Israeli tech company expanding into Southeast Asia faces cross-border equity compliance chaos. Every BlueRed portfolio company likely needs Slice today.',
    competitive: 'Main competitor is Carta, which handles US equity well but global compliance poorly. Legacy local law firms are the alternative. Slice is the only AI-native global equity platform with this country breadth.',
    blueRedEdge: 'Every company BlueRed has ever backed that grants equity to employees across Asia is a direct reference customer. Slice also creates a natural network effect across the BlueRed portfolio — each new portfolio company is a warm referral.',
  },
  {
    id: 'panax',
    name: 'Panax',
    sector: 'Fintech',
    stage: '$10M Series A',
    stageDate: 'May 2024',
    hook: 'AI cash flow management for multi-entity, multi-currency operations in manufacturing, logistics, and real estate',
    conviction: 'strong',
    founders: [
      { name: 'Noam Mills',       note: 'Harvard · former world-ranked fencer (Israel national team)' },
      { name: 'Sefi Itzkovich',   note: 'ex-CTO Otonomo · ex-Facebook ML' },
      { name: 'Niv Yaar',         note: 'Co-founder' },
    ],
    investors: 'Team8 · TLV Partners',
    advisors: null,
    signals: [
      'Named in Calcalist\'s Top 50 Most Promising Israeli Startups 2025; doubled customer count in Q1 2024',
      'Customers include public beauty company Oddity; focus on manufacturing, logistics, real estate — ASEAN\'s core economic pillars',
      'Real-time cash visibility and forecasting across entities, regions, and currencies — a universal CFO pain point',
    ],
    asia: 'Multi-entity, multi-currency cash visibility is the #1 operational pain for Asian conglomerates. Manufacturing, logistics, and real estate — Panax\'s exact target — dominate ASEAN GDP. Every logistics conglomerate in Singapore or Vietnam has this exact fragmentation problem.',
    competitive: 'Kyriba (enterprise, expensive), Embat, Statement, Vesto. Panax differentiates on mid-market focus and AI-driven proactive insights rather than passive dashboard reporting.',
    blueRedEdge: 'BlueRed\'s ASEAN manufacturing and logistics network provides warm customer introductions. Portfolio companies with multi-subsidiary regional treasury operations are immediate pilots — and built-in case studies for the next fundraise.',
  },
];

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '18px 0' }} />;
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
      color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: 8,
    }}>{children}</div>
  );
}

function CompanyCard({ company: c, isOpen, onToggle }) {
  const [hovered, setHovered] = useState(false);

  const convictionMeta = c.conviction === 'top'
    ? { label: 'Top Pick', bg: 'rgba(255,255,255,0.1)', color: 'white', border: 'rgba(255,255,255,0.2)' }
    : { label: 'Strong',   bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.1)' };

  const cardStyle = {
    background: isOpen ? 'rgba(255,255,255,0.045)' : hovered ? 'rgba(255,255,255,0.038)' : 'rgba(255,255,255,0.025)',
    border: `1px solid ${isOpen ? 'rgba(129,140,248,0.25)' : hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 14,
    overflow: 'hidden',
    transform: hovered && !isOpen ? 'scale(1.008)' : 'scale(1)',
    boxShadow: hovered && !isOpen ? '0 6px 28px rgba(129,140,248,0.1)' : 'none',
    transition: 'all 0.18s ease',
    cursor: 'pointer',
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Collapsed row */}
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        {/* Name + hook */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{c.name}</span>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4,
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)',
              fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>{c.sector}</span>
            <span style={{
              fontSize: 11, padding: '2px 9px', borderRadius: 20,
              background: convictionMeta.bg, color: convictionMeta.color,
              border: `1px solid ${convictionMeta.border}`, fontWeight: 600,
            }}>{convictionMeta.label}</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{c.hook}</p>
        </div>

        {/* Stage */}
        <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 90 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{c.stage}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{c.stageDate}</div>
        </div>

        {/* Chevron */}
        <div style={{
          flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
          background: isOpen ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, background 0.2s',
          transform: isOpen ? 'rotate(180deg)' : 'none',
        }}>
          <span style={{ fontSize: 10, color: isOpen ? ACCENT : 'rgba(255,255,255,0.35)', lineHeight: 1 }}>▾</span>
        </div>
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div style={{ padding: '0 20px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Signals */}
          <div style={{ paddingTop: 18 }}>
            <SectionLabel>Key Signals</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {c.signals.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                    background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, color: ACCENT, marginTop: 1,
                  }}>{i + 1}</div>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>{s}</p>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* 2-column: Founders + Investors | Asia + BlueRed Edge */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <SectionLabel>Founders</SectionLabel>
                {c.founders.map((f, i) => (
                  <div key={i} style={{ marginBottom: 7 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>{f.note}</div>
                  </div>
                ))}
              </div>
              <div>
                <SectionLabel>Investors</SectionLabel>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{c.investors}</p>
                {c.advisors && (
                  <>
                    <div style={{ height: 10 }} />
                    <SectionLabel>Advisors</SectionLabel>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{c.advisors}</p>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <SectionLabel>Asia Angle</SectionLabel>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', lineHeight: 1.7 }}>{c.asia}</p>
              </div>
              <div>
                <SectionLabel>BlueRed Edge</SectionLabel>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', lineHeight: 1.7 }}>{c.blueRedEdge}</p>
              </div>
            </div>
          </div>

          <Divider />

          {/* Competitive context */}
          <div>
            <SectionLabel>Competitive Context</SectionLabel>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.52)', lineHeight: 1.7 }}>{c.competitive}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlueRedMemo({ onBack }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ background: '#060612', color: 'white', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(6,6,18,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 24px', height: 52,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button onClick={onBack} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          ← Portfolio
        </button>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: ACCENT }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>BlueRed Partners</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>· Deal Sourcing Memo</span>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '44px 24px 80px' }}>

        {/* Stats — centered */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', fontWeight: 600, marginBottom: 16 }}>
            Singapore · Israeli Tech → Asian Markets · Seed &amp; Series A
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
            {[
              { value: '7',   label: 'shortlisted' },
              { value: '~40', label: 'evaluated' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'white', fontFamily: 'monospace', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Company cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COMPANIES.map(c => (
            <CompanyCard
              key={c.id}
              company={c}
              isOpen={expanded === c.id}
              onToggle={() => setExpanded(prev => prev === c.id ? null : c.id)}
            />
          ))}
        </div>

        {/* Methodology */}
        <div style={{ marginTop: 52, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            Sourced from ~40 Israeli companies across Calcalist rankings, Crunchbase, recent funding announcements,
            and the CrowdStrike / AWS / NVIDIA Startup Accelerator cohort. Each evaluated on stage fit, category
            differentiation, Asia market applicability, and founding team quality. All data from primary sources.
          </p>
        </div>
      </div>
    </div>
  );
}
