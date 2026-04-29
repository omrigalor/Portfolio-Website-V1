import { useState, useEffect, useRef } from 'react';
import BDRLive from './BDRLive';

// ── Auto-demo data ────────────────────────────────────────────────────────────

const DEMO_LEAD = {
  company: 'Revolut', country: 'UK', industry: 'Fintech', employees: 8000,
  composite_score: 97, tier: 'tier_1_hot', conversion_probability: 0.35, expected_acv: 120000,
  contact_name: 'Nik Storonsky', contact_title: 'CEO',
  source: 'inbound_web', status: 'qualified',
  score_fit:5,score_intent:5,score_budget:4,score_decision_access:5,score_timeline:5,
  score_pain:5,score_compelling_event:5,score_champion:5,score_technical_fit:5,score_strategic_value:5,
  use_case_description: 'Fraud narrative generation + customer support deflection. Need 99.9% uptime SLA.',
  discovery_notes: 'Nik involved directly. €500K budget confirmed. Wants pilot in 3 weeks.',
};

const FACTOR_BARS = [
  { label:'Company Fit',      score:5, color:'#4ade80' },
  { label:'Buying Intent',    score:5, color:'#4ade80' },
  { label:'Budget Capacity',  score:4, color:'#fb923c' },
  { label:'Decision Access',  score:5, color:'#4ade80' },
  { label:'Timing / Urgency', score:5, color:'#4ade80' },
  { label:'Pain Clarity',     score:5, color:'#4ade80' },
  { label:'Compelling Event', score:5, color:'#4ade80' },
  { label:'Champion Strength',score:5, color:'#4ade80' },
  { label:'Technical Fit',    score:5, color:'#4ade80' },
  { label:'Strategic Value',  score:5, color:'#4ade80' },
];

const HANDOFF_TEXT = `**AE Handoff Brief — Revolut**

**Executive Summary**
Revolut is a Tier-1, immediately actionable deal with CEO-level sponsorship and a confirmed €500K budget. The champion (Nik Storonsky) has moved faster than any lead this quarter.

**Why Claude, Why Now**
FCA compliance requires audit trails for AI-generated outputs that GPT-4o cannot provide. Claude's Constitutional AI and native refusal logging directly address the MLRO's concerns. Our benchmarks show 3.1× fewer hallucinations on financial narrative tasks.

**Positioning Recommendation**
Lead with Claude API for fraud narrative generation (immediate pain), then expand to 8M+ customer support conversations/month.

**Competitive Landscape**
Active GPT-4o evaluation. Differentiators: (1) Constitutional AI = compliance by design, (2) 200K context window for full transaction history, (3) UK data residency option.

**Suggested Next Steps**
1. AE intro call with technical lead (Friday)
2. 2-week pilot: 10K fraud transactions → narrative generation
3. SLA proposal with 99.9% uptime commitment`;

// Score gauge SVG
function ScoreGauge({ score, size = 100 }) {
  const R = size * 0.4;
  const cx = size / 2, cy = size / 2;
  const totalArc = Math.PI * 1.5;
  const start = Math.PI + Math.PI * 0.25;
  const sx = cx + R * Math.cos(start), sy = cy + R * Math.sin(start);
  const ex = cx + R * Math.cos(start + totalArc), ey = cy + R * Math.sin(start + totalArc);
  const fillAngle = start + totalArc * (score / 100);
  const fx = cx + R * Math.cos(fillAngle), fy = cy + R * Math.sin(fillAngle);
  const d = `M ${sx} ${sy} A ${R} ${R} 0 ${totalArc > Math.PI ? 1 : 0} 1 ${ex} ${ey}`;
  const df = `M ${sx} ${sy} A ${R} ${R} 0 ${fillAngle - start > Math.PI ? 1 : 0} 1 ${fx} ${fy}`;
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#fb923c' : '#a5b4fc';
  return (
    <svg width={size} height={size}>
      <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={size * 0.07} strokeLinecap="round" />
      <path d={df} fill="none" stroke={color} strokeWidth={size * 0.07} strokeLinecap="round" style={{ transition: 'all 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x={cx} y={cy + 6} textAnchor="middle" fill={color} fontSize={size * 0.22} fontWeight="800" fontFamily="monospace">{score}</text>
      <text x={cx} y={cy + size * 0.25} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={size * 0.1}>/ 100</text>
    </svg>
  );
}

// ── Demo component ────────────────────────────────────────────────────────────

function BDRDemo({ onExit }) {
  const [step, setStep] = useState(0);
  const [barWidths, setBarWidths] = useState(FACTOR_BARS.map(() => 0));
  const [briefText, setBriefText] = useState('');
  const [briefDone, setBriefDone] = useState(false);
  const timerRef = useRef(null);

  // Steps: 0=intro, 1=dashboard, 2=lead-list, 3=lead-detail, 4=score-bars, 5=generate-brief, 6=brief-typing, 7=done
  useEffect(() => {
    const delays = { 0:800, 1:1400, 2:1200, 3:1000, 4:600, 5:2200, 6:0, 7:1200 };
    timerRef.current = setTimeout(() => setStep(s => s + 1), delays[step] || 1200);
    return () => clearTimeout(timerRef.current);
  }, [step]);

  // Animate score bars at step 4
  useEffect(() => {
    if (step !== 4) return;
    FACTOR_BARS.forEach((f, i) => {
      setTimeout(() => {
        setBarWidths(p => { const n=[...p]; n[i]=(f.score/5)*100; return n; });
      }, i * 80);
    });
  }, [step]);

  // Stream brief at step 6
  useEffect(() => {
    if (step !== 6) return;
    const words = HANDOFF_TEXT.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      if (i >= words.length) { clearInterval(interval); setBriefDone(true); return; }
      setBriefText(p => p + (i === 0 ? '' : ' ') + words[i]);
      i++;
    }, 22);
    return () => clearInterval(interval);
  }, [step]);

  const show = (n) => step >= n;
  const ACCENT = '#FFA040';

  return (
    <div className="flex h-full overflow-hidden" style={{ background: '#060612' }}>
      {/* Simulated sidebar */}
      <div className="w-48 border-r border-white/8 flex flex-col flex-shrink-0" style={{ background: 'rgba(8,8,18,0.95)' }}>
        <div className={`px-4 py-4 border-b border-white/8 transition-all duration-500 ${show(1) ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg,#FFA040,#ff6b00)' }}>A</div>
            <div>
              <p className="text-xs font-bold text-white">Anthropic BDR</p>
              <p className="text-xs text-white/30">EMEA Pipeline OS</p>
            </div>
          </div>
        </div>
        <nav className={`p-2 space-y-0.5 transition-all duration-700 ${show(1) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
          {[['⬛','Dashboard'],['◈','Lead Scoring'],['◉','Outbound'],['◎','Discovery'],['▦','Analytics'],['◧','Config']].map(([icon,label], i) => (
            <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${i===1 ? 'text-white' : 'text-white/40'}`}
              style={{ background: i===1 ? 'rgba(255,160,64,0.12)' : 'transparent', border: i===1 ? '1px solid rgba(255,160,64,0.2)' : '1px solid transparent' }}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </nav>
        <div className={`mt-auto p-3 border-t border-white/8 transition-all duration-500 ${show(1) ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <p className="text-xs text-white/30">Claude Haiku · Live</p>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-y-auto">
        {/* Lead list panel (steps 1-2) */}
        {step < 3 && (
          <div className={`p-5 space-y-4 transition-all duration-500 ${show(1) ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-white">EMEA Lead Scoring</p>
                <p className="text-xs text-white/40">10 leads · 6 Tier-1 Hot</p>
              </div>
              <div className="flex gap-6 text-center">
                {[['€302K','Pipeline'],['80/100','Avg Score'],['60%','Conv.']].map(([v,l]) => (
                  <div key={l}><p className="text-sm font-bold font-mono text-white">{v}</p><p className="text-xs text-white/30">{l}</p></div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {['Revolut','Klarna','Stripe','Deutsche Telekom'].map((company, i) => (
                <div key={company} className={`glass rounded-xl p-3 transition-all duration-300 ${show(2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${company==='Revolut' ? 'border-orange-400/40' : ''}`}
                  style={{ transitionDelay:`${i*80}ms`, borderColor: company==='Revolut' ? 'rgba(255,160,64,0.4)' : undefined }}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{company}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded bdr-tier-1">Tier 1</span>
                      </div>
                      <p className="text-xs text-white/40">Fintech · {company === 'Deutsche Telekom' ? 'Germany' : 'UK'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono" style={{ color:'#4ade80' }}>{company==='Revolut'?97:company==='Klarna'?99:company==='Stripe'?96:83}</p>
                      <p className="text-xs text-white/30">score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lead detail panel (steps 3+) */}
        {step >= 3 && (
          <div className={`flex h-full transition-all duration-500 ${step>=3 ? 'opacity-100' : 'opacity-0'}`}>
            {/* Left: lead info */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
              <div className="glass rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-white text-lg">Revolut</p>
                    <p className="text-xs text-white/40">Fintech · UK · 8,000 employees</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bdr-tier-1">Tier 1 — Hot</span>
                </div>
                <div className="flex items-center gap-4">
                  <ScoreGauge score={show(3) ? 97 : 0} size={90} />
                  <div className="space-y-1.5">
                    <div><p className="text-xs text-white/40">Contact</p><p className="text-sm text-white">Nik Storonsky · CEO</p></div>
                    <div><p className="text-xs text-white/40">Expected ACV</p><p className="text-sm font-bold" style={{color:ACCENT}}>€120K</p></div>
                    <div><p className="text-xs text-white/40">Conv. Probability</p><p className="text-sm font-bold text-green-400">35%</p></div>
                  </div>
                </div>
              </div>

              {/* Factor bars */}
              {show(4) && (
                <div className="glass rounded-xl p-4 space-y-2">
                  <p className="bdr-section-title mb-3">Score Breakdown</p>
                  {FACTOR_BARS.map((f,i) => (
                    <div key={f.label} className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">{f.label}</span>
                        <span className="font-mono text-white/70">{f.score}/5</span>
                      </div>
                      <div className="bdr-score-track">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${barWidths[i]}%`, background:f.color, transitionDelay:`${i*60}ms` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: AI Brief generator */}
            {show(5) && (
              <div className="w-80 border-l border-white/8 p-4 overflow-y-auto flex-shrink-0">
                <p className="bdr-section-title mb-3">✦ AI Handoff Brief</p>
                <div className="flex gap-2 mb-3">
                  <button className="bdr-btn bdr-btn-primary text-xs py-1.5 flex-1" disabled>
                    {step === 5 ? '⟳ Generating…' : '✦ Generated'}
                  </button>
                </div>
                {show(6) && (
                  <div className="glass rounded-xl p-4">
                    <pre className="text-xs text-white/75 leading-relaxed whitespace-pre-wrap font-sans">
                      {briefText}{!briefDone && <span className="animate-pulse" style={{color:ACCENT}}>▊</span>}
                    </pre>
                    {briefDone && (
                      <div className="mt-3 pt-3 border-t border-white/8">
                        <p className="text-xs text-green-400">✓ Brief ready — copy to CRM</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Demo controls overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        <div className="glass rounded-full px-4 py-2 flex items-center gap-3">
          <div className="flex gap-1">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: step >= n ? ACCENT : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
          <span className="text-xs text-white/40">
            {step <= 1 ? 'Loading pipeline…' : step <= 2 ? 'Lead list — 6 Tier-1 leads' : step <= 3 ? 'Selecting Revolut (score: 97)' : step <= 4 ? 'Analysing 10 factors…' : step <= 5 ? 'Generating AI brief…' : 'AE handoff ready'}
          </span>
        </div>
        <button onClick={onExit} className="bdr-btn bdr-btn-secondary text-xs">Exit Demo</button>
      </div>
    </div>
  );
}

// ── BDR App home (choose Demo or Live) ───────────────────────────────────────

function BDRHome({ onDemo, onLive, onBack }) {
  const ACCENT = '#FFA040';
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24"
      style={{ background: 'linear-gradient(160deg, #060612 0%, #0d0a00 45%, #060612 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,160,64,0.07), transparent)' }} />
      <div className="absolute top-4 left-4 z-10">
        <button onClick={onBack} className="text-xs text-white/55 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all">
          ← Portfolio
        </button>
      </div>

      <div className="relative max-w-xl w-full text-center space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-white/70 border border-white/10 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Claude Haiku · Live AI
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold" style={{ background: 'linear-gradient(135deg,#FFA040,#ff6b00)' }}>A</div>
            <h1 className="font-display text-4xl md:text-5xl text-white tracking-tight">BDR OS</h1>
          </div>
          <p className="text-base font-semibold text-white/70">Anthropic EMEA Pipeline System</p>
          <p className="text-sm text-white/45 mt-2 leading-relaxed max-w-sm mx-auto">
            Full-stack BDR operating system — AI-powered lead scoring, outbound tracking, discovery playbook, and funnel analytics. Built for the Anthropic EMEA role.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onDemo}
            className="px-8 py-4 rounded-2xl text-black font-semibold text-sm transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#ff8c00,#FFA040)', boxShadow:'0 4px 30px rgba(255,160,64,0.4)' }}>
            <span className="flex items-center gap-2 justify-center">
              <span className="w-2 h-2 rounded-full bg-black/40 animate-pulse" />
              Watch Demo
            </span>
          </button>
          <button onClick={onLive}
            className="px-8 py-4 rounded-2xl text-white/80 font-semibold text-sm border border-white/15 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all">
            Open Live App →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          {[
            { value:'10', label:'Live EMEA leads', sub:'Seeded from real companies' },
            { value:'6', label:'AI endpoints', sub:'Scoring, briefs, outreach' },
            { value:'6', label:'App modules', sub:'Full BDR workflow' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold font-mono" style={{ color: ACCENT }}>{s.value}</p>
              <p className="text-xs text-white/60 font-medium mt-0.5">{s.label}</p>
              <p className="text-xs text-white/30 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export default function BDRApp({ onBack }) {
  const [mode, setMode] = useState('home'); // home | demo | live

  if (mode === 'demo') {
    return (
      <div className="h-screen relative" style={{ background: '#060612' }}>
        <BDRDemo onExit={() => setMode('home')} />
      </div>
    );
  }

  if (mode === 'live') return <BDRLive onBack={() => setMode('home')} />;

  return <BDRHome onDemo={() => setMode('demo')} onLive={() => setMode('live')} onBack={onBack} />;
}
