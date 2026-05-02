import { useState } from 'react';

// ─── Social icon SVGs ─────────────────────────────────────────────────────────

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

// ─── Experience data ──────────────────────────────────────────────────────────


const PATENTS = [
  {
    id: 'reprium',
    shortName: 'Predictive Algorithm for Relationship Longevity & Offspring Prosperity',
    name: null,
    patentNo: 'US 11,847,293 B2',
    live: true,
    desc: 'Predicts how long a relationship will last and how well children will thrive — based on how culturally similar or different the two partners are. Built on 22,000+ real couples and 5M+ child outcomes.',
    tags: ['Relationship Science', 'Cultural Genetics', 'Predictive Modeling'],
    accent: '#C41E3A',
  },
  {
    id: 'attrition',
    shortName: 'Predictive Algorithm for Employee Attrition',
    name: 'Intra-Ancestral Divergence Model for Predicting Employee Attrition',
    patentNo: 'US 11,923,451 B1',
    live: true,
    desc: 'Predicts whether an employee will stay or leave based on their parents\' cultural backgrounds. Too similar or too different → higher job-hopping. Intermediate background diversity minimises attrition.',
    tags: ['HR Analytics', 'Organizational Behavior', 'Workforce Science'],
    accent: '#3b82f6',
  },
  {
    id: 'loan',
    shortName: 'Predictive Algorithm for Loan Default Risk',
    name: 'Intra-Ancestral Divergence Model for Predicting Loan Default Risk',
    patentNo: 'US 12,041,876 B2',
    live: true,
    desc: 'Predicts loan default probability from the borrower\'s parental cultural background. Outperforms traditional credit scores by capturing focus, earning potential, and financial discipline.',
    tags: ['Credit Risk', 'FinTech', 'Alternative Data'],
    accent: '#D4AF37',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Tag({ label }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs text-white/70 border border-white/10">
      {label}
    </span>
  );
}


function PatentCard({ item, onOpen }) {
  return (
    <div
      className={`glass rounded-2xl p-6 flex flex-col gap-4 transition-all card-lift ${item.live ? 'hover:bg-white/6 cursor-pointer' : 'opacity-80 cursor-default'}`}
      onClick={item.live ? onOpen : undefined}
      style={{ borderTop: `2px solid ${item.accent}40` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {item.live ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                Coming Soon
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white/90 leading-snug">{item.shortName}</h3>
          {item.name && <p className="text-xs text-white/52 leading-snug mt-1.5 italic">{item.name}</p>}
        </div>
        {item.live && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: item.accent + '20', border: `1px solid ${item.accent}40` }}>
            <span className="text-sm" style={{ color: item.accent }}>→</span>
          </div>
        )}
      </div>
      <p className="text-xs text-white/65 leading-relaxed">{item.desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {item.tags.map(t => <Tag key={t} label={t} />)}
      </div>
      <p className="text-xs font-mono mt-1" style={{ color: item.accent + '99' }}>{item.patentNo}</p>
    </div>
  );
}

// ─── Main portfolio page ──────────────────────────────────────────────────────

export default function Portfolio({ onOpenReprium, onOpenAttrition, onOpenLoan, onOpenVC, onOpenBDR, onOpenBlueRed }) {
  const [openPaper, setOpenPaper] = useState(null);

  if (openPaper) {
    return (
      <div className="min-h-screen bg-premium flex flex-col">
        <div className="absolute inset-0 bg-glow-red pointer-events-none" />
        <div className="relative flex items-center px-4 py-3 border-b border-white/8"
          style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)' }}>
          <button
            onClick={() => setOpenPaper(null)}
            className="text-xs text-white/58 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all shrink-0"
          >
            ← Back
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-xs text-white/70 font-medium text-center pointer-events-none">{openPaper.title}</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full border font-mono shrink-0"
            style={{ borderColor: openPaper.color + '50', color: openPaper.color, background: openPaper.color + '15' }}>
            {openPaper.type}
          </span>
        </div>
        <iframe
          src={import.meta.env.BASE_URL + openPaper.href}
          className="flex-1 w-full relative"
          style={{ minHeight: 'calc(100vh - 48px)', border: 'none' }}
          title={openPaper.title}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium">
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      <div className="absolute inset-0 bg-glow-gold pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 py-12 space-y-16">

        {/* ── Hero ── */}
        <section className="text-center space-y-6">
          {/* Avatar placeholder */}
          <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold font-display"
            style={{ background: 'rgba(196,30,58,0.15)', border: '1px solid rgba(196,30,58,0.3)', color: '#C41E3A' }}>
            OG
          </div>

          <div>
            <h1 className="font-display text-4xl md:text-5xl text-white mb-2 tracking-tight">Omri Galor</h1>
            <p className="text-base text-white/70 font-medium">
              Quantitative Researcher · Venture Capitalist · Founder
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.linkedin.com/in/omri-galor"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-white/70 hover:text-white/80 hover:border-white/20 transition-all text-xs font-medium"
            >
              <LinkedInIcon />
              LinkedIn
            </a>
            <a
              href="https://github.com/omrigalor"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-white/70 hover:text-white/80 hover:border-white/20 transition-all text-xs font-medium"
            >
              <GitHubIcon />
              GitHub
            </a>
            <a
              href="mailto:omri_galor@alumni.brown.edu"
              className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-white/70 hover:text-white/80 hover:border-white/20 transition-all text-xs font-medium"
            >
              <EmailIcon />
              Email
            </a>
          </div>

          <a
            href="/resume.html"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border transition-all text-sm font-semibold"
            style={{ borderColor: '#C41E3A80', background: 'rgba(196,30,58,0.12)', color: '#ff8fa3' }}
          >
            <span>↓</span>
            View Résumé
          </a>
        </section>

        {/* ── Patents / Models ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-display font-semibold text-white">Patented Models</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">3 models</span>
          </div>
          <p className="text-xs text-white/50 mb-6 -mt-3">
            Each model demonstrates highest predictive power versus existing benchmarks in its domain.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PATENTS.map(p => (
              <PatentCard
                key={p.id}
                item={p}
                onOpen={
                  p.id === 'reprium'   ? onOpenReprium   :
                  p.id === 'attrition' ? onOpenAttrition :
                  p.id === 'loan'      ? onOpenLoan      : undefined
                }
              />
            ))}
          </div>
        </section>

        {/* ── Research Papers ── */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-display font-semibold text-white">Research</h2>
          </div>
          <p className="text-xs text-white/50 mb-6">Working papers, technical notes, and research presentations.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {[
              {
                title: 'Cultural Distance & Relationship Longevity',
                desc: 'Empirical study of 22,091 cross-national couples. Inverted-U relationship between ancestral cultural distance and separation probability. β₁=−0.31, β₂=0.64, ψ*=0.240.',
                type: 'Working Paper',
                tags: ['CPS Micro-data', 'HDFE Regression', 'Ancestral Distance'],
                href: 'papers/relationship-longevity.pdf',
                color: '#C41E3A',
              },
              {
                title: 'Cultural Diversity & Child Outcomes',
                desc: 'Effect of parental ancestral diversity on child wages, educational attainment, creativity, and focus. Inverted-U pattern consistent across all four outcomes.',
                type: 'Working Paper',
                tags: ['ACS Data', 'NLSY', 'Intergenerational'],
                href: 'papers/child-well-being.pdf',
                color: '#D4AF37',
              },
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => setOpenPaper(p)}
                className="glass rounded-2xl p-6 flex flex-col gap-3 hover:bg-white/6 card-lift transition-all group text-left w-full cursor-pointer"
                style={{ borderTop: `2px solid ${p.color}40` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full border font-mono"
                    style={{ borderColor: p.color + '50', color: p.color, background: p.color + '15' }}>
                    {p.type}
                  </span>
                  <span className="text-white/38 group-hover:text-white/70 transition-colors text-sm">↗</span>
                </div>
                <h3 className="text-sm font-semibold text-white/90">{p.title}</h3>
                <p className="text-xs text-white/65 leading-relaxed">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {p.tags.map(t => <Tag key={t} label={t} />)}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── AI Agents ── */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-display font-semibold text-white">AI Agents</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">AI-Powered</span>
          </div>
          <p className="text-xs text-white/50 mb-6">Autonomous agents built for investment intelligence and revenue operations.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* VC Agent */}
            <div
              className="glass rounded-2xl p-6 flex flex-col gap-4 card-lift hover:bg-white/6 cursor-pointer transition-all"
              style={{ borderTop: '2px solid rgba(59,130,246,0.4)' }}
              onClick={onOpenVC}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white/90 leading-snug">Venture Capital Agent</h3>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)' }}>
                  <span className="text-sm" style={{ color: '#60a5fa' }}>→</span>
                </div>
              </div>
              <p className="text-xs text-white/65 leading-relaxed">
                AI agent that researches a portfolio of companies and ranks them using Monte Carlo simulation (2,000 iterations) and a 10-tree Random Forest across 12 weighted investment factors — with per-factor data quality scores that adjust confidence weighting.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {['Monte Carlo','Random Forest','12 Factors','Portfolio Scatter'].map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-xs text-white/70 border border-white/10">{t}</span>
                ))}
              </div>
            </div>

            {/* BDR OS */}
            <div
              className="glass rounded-2xl p-6 flex flex-col gap-4 card-lift hover:bg-white/6 cursor-pointer transition-all"
              style={{ borderTop: '2px solid rgba(255,160,64,0.4)' }}
              onClick={onOpenBDR}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white/90 leading-snug">BDR Operating System</h3>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,160,64,0.12)', border: '1px solid rgba(255,160,64,0.3)' }}>
                  <span className="text-sm" style={{ color: '#FFA040' }}>→</span>
                </div>
              </div>
              <p className="text-xs text-white/65 leading-relaxed">
                Full-stack EMEA pipeline OS. AI-powered lead scoring across 10 BANT factors, AE handoff brief generation, outbound campaign tracker, discovery call playbook, and funnel analytics.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {['Lead Scoring','AI Handoffs','Outbound Tracker','BANT Playbook','Funnel Analytics'].map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-xs text-white/70 border border-white/10">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── VC Research ── */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-display font-semibold text-white">VC Research</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">Interactive</span>
          </div>
          <p className="text-xs text-white/50 mb-6">Deal sourcing assignments and investment analysis.</p>
          <div className="grid grid-cols-1 gap-5 max-w-lg mx-auto">
            <div
              className="glass rounded-2xl p-6 flex flex-col gap-4 card-lift hover:bg-white/6 cursor-pointer transition-all"
              style={{ borderTop: '2px solid rgba(129,140,248,0.4)' }}
              onClick={onOpenBlueRed}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white/90 leading-snug">BlueRed Partners · Deal Sourcing Memo</h3>
                  <p className="text-xs text-white/35 mt-1">Israeli tech → Asian markets</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.3)' }}>
                  <span className="text-sm" style={{ color: '#818cf8' }}>→</span>
                </div>
              </div>
              <p className="text-xs text-white/65 leading-relaxed">
                Sourced and evaluated ~40 Israeli seed-stage companies for a Singapore-based VC fund. Independently validated against stage, competitive landscape, and Asia market fit — replacing 4 of 7 originally proposed picks.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['7 Companies','Cyber + Fintech','Asia Fit','Primary Research'].map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-xs text-white/70 border border-white/10">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-white/38">
            omri_galor@alumni.brown.edu · © 2025 Omri Galor
          </p>
        </footer>
      </div>
    </div>
  );
}
