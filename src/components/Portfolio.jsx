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

const EXPERIENCE = [
  {
    role: 'Co-Founder & CEO',
    org: 'Reprium',
    period: '2024 – 2025',
    location: 'New York City, US',
    desc: 'Developed & commercialized a predictive analytics platform forecasting relationship longevity & family outcomes. Secured Bumble\'s board-level acquisition review. Designed core model IP isolating the causal impact of cultural, behavioral and demographic factors.',
    tags: ['Predictive Analytics', 'NLP', 'React', 'Stata', 'Python'],
    accent: '#C41E3A',
  },
  {
    role: 'Quantitative Analyst',
    org: 'Deutsche Bank',
    period: '2019 – 2023',
    location: 'New York, NY',
    desc: '4-year tenure building quantitative models for fixed-income derivatives and risk management. Designed real-time pricing models and systematic trading strategies across global rates desks.',
    tags: ['Fixed Income', 'Derivatives', 'Python', 'C++', 'Risk'],
    accent: '#3b82f6',
  },
  {
    role: 'Venture Capital Analyst',
    org: 'CICC (Morgan Stanley JV)',
    period: '2018 – 2019',
    location: 'Hong Kong',
    desc: 'Evaluated early-stage technology investments at China International Capital Corporation, the flagship Morgan Stanley–CITIC joint venture. Conducted due diligence across fintech and AI sectors.',
    tags: ['Venture Capital', 'Due Diligence', 'Fintech', 'Asia Markets'],
    accent: '#D4AF37',
  },
  {
    role: 'Research Analyst',
    org: 'World Bank',
    period: '2017 – 2018',
    location: 'Washington, D.C.',
    desc: 'Conducted empirical research on economic development, cultural diversity, and long-run growth. Co-authored policy briefs on ancestral diversity and innovation outcomes.',
    tags: ['Development Economics', 'Empirical Research', 'Stata', 'R'],
    accent: '#22c55e',
  },
  {
    role: 'Research Analyst',
    org: "Office of the Chief Economic Advisor, Prime Minister's Office",
    period: '2016 – 2017',
    location: 'Jerusalem, Israel',
    desc: "Provided empirical and policy analysis to Israel's Chief Economic Advisor. Prepared research memos on labor markets, innovation policy, and macroeconomic forecasting.",
    tags: ['Economic Policy', 'Macroeconomics', 'Research', 'Government'],
    accent: '#a78bfa',
  },
];

const EDUCATION = [
  {
    degree: 'BA Economics',
    school: 'Brown University',
    period: '2015 – 2019',
    gpa: '4.0 / 4.0',
    flag: '🇺🇸',
  },
  {
    degree: 'MBA in AI & Big Data',
    school: 'Reichman University (IDC)',
    period: '2023 – 2024',
    gpa: 'First Year',
    flag: '🇮🇱',
  },
];

const PATENTS = [
  {
    id: 'reprium',
    name: 'Predictive Algorithm for Relationship Longevity & Offspring Prosperity',
    patentNo: 'US 11,847,293 B2',
    live: true,
    desc: 'Predicts how long a relationship will last and how well children will thrive — based on how culturally similar or different the two partners are. Built on 22,000+ real couples and 5M+ child outcomes.',
    tags: ['Relationship Science', 'Cultural Genetics', 'Predictive Modeling'],
    accent: '#C41E3A',
  },
  {
    id: 'attrition',
    name: 'Intra-Ancestral Divergence Model for Predicting Employee Attrition',
    patentNo: 'US 11,923,451 B1',
    live: true,
    desc: 'Predicts whether an employee will stay or leave based on their parents\' cultural backgrounds. Too similar or too different → higher job-hopping. Intermediate background diversity minimises attrition.',
    tags: ['HR Analytics', 'Organizational Behavior', 'Workforce Science'],
    accent: '#3b82f6',
  },
  {
    id: 'loan',
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

function ExperienceCard({ item }) {
  return (
    <div className="glass rounded-2xl p-6 hover:bg-white/6 transition-colors border-l-2"
      style={{ borderLeftColor: item.accent + '60' }}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-base font-semibold text-white">{item.role}</h3>
          <p className="text-sm font-medium" style={{ color: item.accent }}>{item.org}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-white/70">{item.period}</p>
          <p className="text-xs text-white/45">{item.location}</p>
        </div>
      </div>
      <p className="text-sm text-white/55 leading-relaxed mb-3">{item.desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {item.tags.map(t => <Tag key={t} label={t} />)}
      </div>
    </div>
  );
}

function PatentCard({ item, onOpen }) {
  return (
    <div
      className={`glass rounded-2xl p-6 flex flex-col gap-4 transition-all ${item.live ? 'hover:bg-white/6 card-lift cursor-pointer' : 'opacity-80 cursor-default'}`}
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
          <h3 className="text-sm font-semibold text-white/90 leading-snug">{item.name}</h3>
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

export default function Portfolio({ onOpenReprium, onOpenAttrition, onOpenLoan }) {
  const [openPaper, setOpenPaper] = useState(null);

  if (openPaper) {
    return (
      <div className="min-h-screen bg-premium flex flex-col">
        <div className="absolute inset-0 bg-glow-red pointer-events-none" />
        <div className="flex items-center gap-3 relative px-4 py-3 border-b border-white/8"
          style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)' }}>
          <button
            onClick={() => setOpenPaper(null)}
            className="text-xs text-white/58 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all"
          >
            ← Back
          </button>
          <span className="text-xs text-white/45">|</span>
          <span className="text-xs text-white/60 font-medium">{openPaper.title}</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full border font-mono"
            style={{ borderColor: openPaper.color + '50', color: openPaper.color, background: openPaper.color + '15' }}>
            {openPaper.type}
          </span>
        </div>
        <iframe
          src={openPaper.href}
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
            href="/Portfolio-Website-V1/resume.html"
            target="_blank"
            rel="noreferrer"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'Cultural Distance & Relationship Longevity',
                desc: 'Empirical study of 22,091 cross-national couples. Inverted-U relationship between ancestral cultural distance and separation probability. β₁=−0.31, β₂=0.64, ψ*=0.240.',
                type: 'Working Paper',
                tags: ['CPS Micro-data', 'HDFE Regression', 'Ancestral Distance'],
                href: '/papers/relationship-longevity.pdf',
                color: '#C41E3A',
              },
              {
                title: 'Cultural Diversity & Child Outcomes',
                desc: 'Effect of parental ancestral diversity on child wages, educational attainment, creativity, and focus. Inverted-U pattern consistent across all four outcomes.',
                type: 'Working Paper',
                tags: ['ACS Data', 'NLSY', 'Intergenerational'],
                href: '/papers/child-well-being.pdf',
                color: '#D4AF37',
              },
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => setOpenPaper(p)}
                className="glass rounded-2xl p-6 flex flex-col gap-3 hover:bg-white/6 card-lift transition-all group text-left w-full"
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

        {/* ── Resume divider ── */}
        <div className="flex items-center gap-4 py-6">
          <div className="h-px flex-1 bg-white/20" />
          <span className="text-sm font-bold text-white uppercase tracking-[0.2em] px-4">Résumé</span>
          <div className="h-px flex-1 bg-white/20" />
        </div>

        {/* ── Experience ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-display font-semibold text-white">Experience</h2>
          </div>
          <div className="space-y-4">
            {EXPERIENCE.map((e, i) => <ExperienceCard key={i} item={e} />)}
          </div>
        </section>

        {/* ── Education ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-display font-semibold text-white">Education</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {EDUCATION.map((e, i) => (
              <div key={i} className="glass rounded-2xl p-6 flex items-start gap-4">
                <div className="text-3xl shrink-0">{e.flag}</div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{e.degree}</h3>
                  <p className="text-sm text-white/70 mt-0.5">{e.school}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-white/50">{e.period}</span>
                    <span className="text-xs font-mono font-bold text-green-400">{e.gpa}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Skills ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-display font-semibold text-white">Technical Skills</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { group: 'Programming',  items: ['Python', 'R', 'JavaScript', 'SQL'] },
              { group: 'Quantitative Methods', items: ['HDFE Regression', 'Survival Analysis', 'Time Series', 'Monte Carlo', 'Econometrics'] },
              { group: 'Finance',    items: ['Fixed Income', 'Derivatives Pricing', 'LBO Modeling', 'DCF Valuation', 'M&A Analysis', 'Options Pricing', 'Credit Derivatives', 'Structured Products', 'Factor Models'] },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-5 space-y-3">
                <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">{s.group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.items.map(it => (
                    <span key={it} className="text-xs text-white/60 px-2 py-0.5 bg-white/5 rounded-full">{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Beyond the Equations ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-display font-semibold text-white">Beyond the Equations</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { emoji: '🎸', title: 'Classical Guitar', sub: 'Albéniz · Villa-Lobos' },
              { emoji: '🧩', title: "Rubik's Cube",     sub: '23 second avg' },
              { emoji: '🏂', title: 'Snowboarding',     sub: 'Regular — not goofy' },
            ].map(item => (
              <div key={item.title} className="glass rounded-2xl p-6 text-center space-y-2 hover:bg-white/5 transition-colors"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-4xl">{item.emoji}</div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-white/50">{item.sub}</p>
              </div>
            ))}
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
