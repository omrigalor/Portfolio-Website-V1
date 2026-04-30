import { useState, useEffect, useRef } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
         BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
import BDRLive from './BDRLive';

const ACCENT = '#FFA040';
const TIER_COLOR = { 'Tier 1': '#4ade80', 'Tier 2': '#fb923c', 'Tier 3': '#94a3b8' };

// ── Static demo data ──────────────────────────────────────────────────────────

const MC_HISTOGRAM = [
  {x:180,count:12},{x:210,count:28},{x:240,count:52},{x:270,count:89},{x:300,count:134},
  {x:330,count:187},{x:360,count:210},{x:390,count:198},{x:420,count:162},{x:450,count:118},
  {x:480,count:74},{x:510,count:41},{x:540,count:19},{x:570,count:8},{x:600,count:3},
].map((d,i) => ({ ...d, isP5: i < 2, isP95: i > 11 }));

const TOP_LEADS = [
  { company:'Klarna',     industry:'Fintech', country:'Sweden', tier:'Tier 1', overall_score:99 },
  { company:'Revolut',    industry:'Fintech', country:'UK',     tier:'Tier 1', overall_score:97 },
  { company:'Wise',       industry:'Fintech', country:'UK',     tier:'Tier 1', overall_score:81 },
  { company:'Doctolib',   industry:'HealthTech', country:'France', tier:'Tier 2', overall_score:78 },
  { company:'BNP Paribas',industry:'Banking', country:'France', tier:'Tier 2', overall_score:72 },
];

const ACTION_ITEMS = [
  { urgency:'high',   message:'Klarna is Tier 1 (score 99) but still in qualifying — ready for AE handoff', action:'Generate handoff brief' },
  { urgency:'high',   message:'Revolut is Tier 1 (score 97) but still in qualifying — ready for AE handoff', action:'Generate handoff brief' },
  { urgency:'medium', message:"Doctolib hasn't been touched in 6 days — Tier 2, score 78", action:'Follow up now' },
];

const KLARNA_RADAR = [
  { subject:'AI Readiness',    value:100 },
  { subject:'Use Case Fit',    value:100 },
  { subject:'Compliance Edge', value:100 },
  { subject:'Timing',          value:80  },
  { subject:'Entry Access',    value:80  },
];

const HANDOFF_TEXT = `**AE Handoff Brief — Klarna**

**Executive Summary**
Klarna is the highest-scoring lead in the pipeline (99/100). They've already replaced 700 support agents with AI — this is an infrastructure upgrade conversation, not a pilot. Budget confirmed at €720K ACV.

**Why Claude, Why Now**
IPO preparation is driving cost efficiency — AI CS must perform flawlessly. An OpenAI outage in March caused estimated €200K in degraded service. Claude's dedicated capacity + 99.9% SLA is the risk mitigation story.

**Recommended Products**
Claude API for CS automation + Batch Processing for async dispute resolution at scale.

**Competitive Positioning**
Displacing OpenAI GPT-4. Win with: (1) SLA and dedicated capacity, (2) superior Nordic language quality, (3) faster context switching across 35 markets.

**Suggested Next Steps**
1. Technical deep-dive with VP Engineering on migration architecture
2. Side-by-side multilingual quality demo (Swedish, Norwegian, Finnish)
3. SLA proposal with dedicated capacity tier`;

// ── Simulated top nav bar ─────────────────────────────────────────────────────

function DemoNav({ activeTab }) {
  const tabs = ['Dashboard', 'Lead Intelligence', 'Outbound Planner'];
  return (
    <div className="flex-shrink-0 border-b border-white/8 px-6 flex items-center" style={{ background:'rgba(8,8,18,0.98)', height:52 }}>
      <div className="flex items-center gap-2.5 mr-8">
        <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold" style={{ background:'linear-gradient(135deg,#FFA040,#ff6b00)' }}>A</div>
        <span className="text-sm font-semibold text-white/90">BDR OS</span>
      </div>
      <div className="flex items-center gap-1 flex-1">
        {tabs.map(t => (
          <div key={t} className="px-3.5 py-1.5 text-sm font-medium"
            style={{
              color: activeTab===t ? ACCENT : 'rgba(255,255,255,0.4)',
              borderBottom: activeTab===t ? `2px solid ${ACCENT}` : '2px solid transparent',
              background: activeTab===t ? 'rgba(255,160,64,0.12)' : 'transparent',
              borderRadius: activeTab===t ? '8px 8px 0 0' : 8,
            }}>{t}</div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 ml-6">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <span className="text-xs text-white/30">Claude · Live</span>
      </div>
    </div>
  );
}

// ── Demo steps ────────────────────────────────────────────────────────────────

function DemoDashboard({ show }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ maxWidth:860, margin:'0 auto', width:'100%' }}>

      {/* Header */}
      <div className={`flex items-start justify-between transition-all duration-500 ${show(1)?'opacity-100':'opacity-0 translate-y-2'}`}>
        <div>
          <h1 className="text-xl font-bold text-white">Pipeline Overview</h1>
          <p className="text-xs text-white/40 mt-0.5">{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <button className="btn-secondary text-xs py-1.5 px-3">✦ Weekly Summary</button>
      </div>

      {/* Monte Carlo */}
      <div className={`glass rounded-2xl p-5 space-y-3 transition-all duration-700 ${show(1)?'opacity-100':'opacity-0 translate-y-3'}`} style={{ transitionDelay:'100ms' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Pipeline Forecast · 2,000 Monte Carlo Simulations</p>
            <p className="text-2xl font-bold font-mono" style={{ color:ACCENT }}>€151K – €538K</p>
            <p className="text-xs text-white/40 mt-0.5">95% confidence interval · expected €340K</p>
          </div>
          <div><p className="text-xs text-white/30">Tier 1 leads</p><p className="text-xl font-bold text-green-400">3</p></div>
        </div>
        <ResponsiveContainer width="100%" height={70}>
          <BarChart data={MC_HISTOGRAM} margin={{top:0,right:0,bottom:0,left:0}} barCategoryGap={2}>
            <XAxis dataKey="x" hide /><YAxis hide />
            <Bar dataKey="count" radius={[2,2,0,0]}>
              {MC_HISTOGRAM.map((d,i) => <Cell key={i} fill={d.isP5||d.isP95?'rgba(255,160,64,0.25)':ACCENT} fillOpacity={d.isP5||d.isP95?1:0.7} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-white/20 text-center">Shaded tails = outside 95% CI</p>
      </div>

      {/* Two columns */}
      <div className={`grid grid-cols-2 gap-5 transition-all duration-700 ${show(1)?'opacity-100':'opacity-0 translate-y-3'}`} style={{ transitionDelay:'200ms' }}>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Top Leads by Score</p>
          {TOP_LEADS.map((l,i) => (
            <div key={l.company} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
              <span className="text-xs text-white/25 font-mono w-4">{i+1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{l.company}</p>
                <p className="text-xs text-white/30">{l.industry} · {l.country}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background:(TIER_COLOR[l.tier]||'#94a3b8')+'18', color:TIER_COLOR[l.tier]||'#94a3b8' }}>{l.tier}</span>
                <span className="text-sm font-bold font-mono" style={{ color:TIER_COLOR[l.tier]||'#94a3b8' }}>{l.overall_score}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Action Items</p>
          {ACTION_ITEMS.map((item,i) => (
            <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background:item.urgency==='high'?'#f87171':'#fb923c' }} />
              <div>
                <p className="text-xs text-white/70 leading-snug">{item.message}</p>
                <p className="text-xs mt-0.5" style={{ color:ACCENT }}>{item.action} →</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoLeadIntel({ show, typedQuery, radarVisible, handoffText, handoffDone, genHandoff }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel */}
      <div className="w-64 border-r border-white/8 flex flex-col flex-shrink-0">
        <div className={`p-4 border-b border-white/8 space-y-2.5 transition-all duration-500 ${show(3)?'opacity-100':'opacity-0'}`}>
          <p className="text-xs text-white/40 uppercase tracking-wider">AI Auto-Research</p>
          <div className="flex gap-2">
            <div className="input-field flex-1 text-sm flex items-center gap-1">
              <span className="text-white/70">{typedQuery}</span>
              {show(3) && !show(4) && <span className="animate-pulse" style={{color:ACCENT}}>|</span>}
            </div>
            <button className="btn-primary text-sm px-3">✦</button>
          </div>
          {show(3) && !show(4) && <p className="text-xs text-white/40 animate-pulse">Researching Klarna…</p>}
        </div>
        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          {TOP_LEADS.map(l => (
            <div key={l.company}
              className={`px-3 py-2.5 rounded-xl transition-all ${l.company==='Klarna'?'glass-strong':'hover:bg-white/4'}`}
              style={{ borderLeft: l.company==='Klarna'?`2px solid ${TIER_COLOR[l.tier]}`:'2px solid transparent' }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-white truncate">{l.company}</p>
                <span className="text-xs font-bold font-mono" style={{ color:TIER_COLOR[l.tier] }}>{l.overall_score}</span>
              </div>
              <p className="text-xs text-white/35">{l.industry} · {l.country}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-5 transition-all duration-500 ${show(4)?'opacity-100':'opacity-0 translate-x-3'}`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-white">Klarna</h2>
              <span className="text-sm px-2 py-0.5 rounded font-semibold" style={{ background:'#4ade8018', color:'#4ade80' }}>Tier 1</span>
              <span className="text-2xl font-bold font-mono text-green-400">99</span>
            </div>
            <p className="text-sm text-white/45">Fintech · Sweden · 3,800 employees</p>
          </div>
        </div>

        {/* Radar + key facts */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`glass rounded-2xl p-4 transition-all duration-700 ${radarVisible?'opacity-100 scale-100':'opacity-0 scale-95'}`}>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Score Dimensions</p>
            <ResponsiveContainer width="100%" height={170}>
              <RadarChart data={KLARNA_RADAR}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:9 }} />
                <Radar dataKey="value" fill={ACCENT} fillOpacity={0.15} stroke={ACCENT} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className={`glass rounded-2xl p-4 space-y-3 transition-all duration-500 ${show(4)?'opacity-100':'opacity-0'}`} style={{ transitionDelay:'200ms' }}>
            <p className="text-xs text-white/40 uppercase tracking-wider">Key Facts</p>
            {[['Entry Point','VP Engineering'],['Contact','David Sandström · VP Eng'],['Expected ACV','€720K'],['Conversion','55%']].map(([l,v]) => (
              <div key={l}><p className="text-xs text-white/30">{l}</p><p className="text-sm text-white/80">{v}</p></div>
            ))}
          </div>
        </div>

        {/* Overview */}
        <div className={`glass rounded-xl p-4 transition-all duration-500 ${show(4)?'opacity-100':'opacity-0'}`} style={{ transitionDelay:'300ms' }}>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">AI Research Summary</p>
          <p className="text-sm text-white/70 leading-relaxed">BNPL and payments leader, 85M users, 500K merchants. Pre-IPO. Already replaced 700 support agents with AI — Claude's multilingual quality is critical for 35-country coverage.</p>
        </div>

        {/* Handoff brief */}
        <div className={`space-y-3 transition-all duration-500 ${show(4)?'opacity-100':'opacity-0'}`} style={{ transitionDelay:'400ms' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/40 uppercase tracking-wider">AE Handoff Brief</p>
            <button className="btn-primary text-xs py-1.5 px-3" disabled={genHandoff}>
              {genHandoff ? '⟳ Generating…' : show(5) ? '✦ Generate' : '✦ Generate'}
            </button>
          </div>
          {(handoffText || genHandoff) && (
            <div className="glass rounded-xl p-4">
              <pre className="text-xs text-white/75 leading-relaxed whitespace-pre-wrap font-sans">
                {handoffText}{!handoffDone && <span className="animate-pulse" style={{color:ACCENT}}>▊</span>}
              </pre>
              {handoffDone && <p className="text-xs text-green-400 mt-3 pt-3 border-t border-white/8">✓ Brief ready — copy to CRM</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BDRDemo orchestrator ──────────────────────────────────────────────────────

function BDRDemo({ onExit }) {
  const [step, setStep]               = useState(0);
  const [typedQuery, setTypedQuery]   = useState('');
  const [radarVisible, setRadarV]     = useState(false);
  const [handoffText, setHandoffText] = useState('');
  const [handoffDone, setHandoffDone] = useState(false);
  const [genHandoff, setGenHandoff]   = useState(false);
  const timerRef = useRef(null);

  // Steps: 0=blank, 1=dashboard, 2=switch-to-leads, 3=typing, 4=research-done, 5=generate, 6=streaming, 7=done
  useEffect(() => {
    const delays = { 0:600, 1:2000, 2:1000, 3:1200, 4:1400, 5:800, 6:0, 7:999999 };
    timerRef.current = setTimeout(() => setStep(s => s + 1), delays[step] ?? 1200);
    return () => clearTimeout(timerRef.current);
  }, [step]);

  // Type "Klarna" character by character at step 3
  useEffect(() => {
    if (step !== 3) return;
    const target = 'Klarna';
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedQuery(target.slice(0, i));
      if (i >= target.length) clearInterval(interval);
    }, 90);
    return () => clearInterval(interval);
  }, [step]);

  // Show radar when research result appears
  useEffect(() => {
    if (step >= 4) setTimeout(() => setRadarV(true), 300);
  }, [step]);

  // Stream handoff text at step 6
  useEffect(() => {
    if (step !== 6) return;
    setGenHandoff(true);
    const words = HANDOFF_TEXT.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      if (i >= words.length) { clearInterval(interval); setGenHandoff(false); setHandoffDone(true); return; }
      setHandoffText(p => p + (i === 0 ? '' : ' ') + words[i]);
      i++;
    }, 18);
    return () => clearInterval(interval);
  }, [step]);

  const show = (n) => step >= n;
  const activeTab = step < 2 ? 'Dashboard' : 'Lead Intelligence';

  const STEP_LABELS = {
    0: 'Loading…',
    1: 'Dashboard — Monte Carlo pipeline forecast',
    2: 'Navigating to Lead Intelligence…',
    3: 'Typing company name…',
    4: 'Claude researched Klarna — intelligence brief ready',
    5: 'Generating AE handoff brief…',
    6: 'Streaming handoff brief…',
    7: 'Handoff ready — copy to CRM',
  };

  return (
    <div className="flex flex-col h-full" style={{ background:'#060612' }}>
      <DemoNav activeTab={activeTab} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {step < 2
          ? <DemoDashboard show={show} />
          : <DemoLeadIntel show={show} typedQuery={typedQuery} radarVisible={radarVisible}
              handoffText={handoffText} handoffDone={handoffDone} genHandoff={genHandoff} />
        }
      </div>

      {/* Progress bar + controls */}
      <div className="flex-shrink-0 border-t border-white/8 px-6 py-3 flex items-center justify-between"
        style={{ background:'rgba(8,8,18,0.95)' }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7].map(n => (
              <div key={n} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{ background: step >= n ? ACCENT : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
          <span className="text-xs text-white/40">{STEP_LABELS[Math.min(step, 7)]}</span>
        </div>
        <button onClick={onExit} className="btn-secondary text-xs py-1.5 px-3">Exit Demo</button>
      </div>
    </div>
  );
}

// ── BDRHome ───────────────────────────────────────────────────────────────────

function BDRHome({ onDemo, onLive, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24"
      style={{ background:'linear-gradient(160deg,#060612 0%,#0d0a00 45%,#060612 100%)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(255,160,64,0.07),transparent)' }} />
      <div className="absolute top-4 left-4 z-10">
        <button onClick={onBack} className="text-xs text-white/55 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all">
          ← Portfolio
        </button>
      </div>

      <div className="relative max-w-xl w-full text-center space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-white/70 border border-white/10 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Claude Sonnet · Real AI (add API key)
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold"
              style={{ background:'linear-gradient(135deg,#FFA040,#ff6b00)' }}>A</div>
            <h1 className="font-display text-4xl md:text-5xl text-white tracking-tight">BDR OS</h1>
          </div>
          <p className="text-base font-semibold text-white/70">Anthropic EMEA Pipeline System</p>
          <p className="text-sm text-white/45 mt-2 leading-relaxed max-w-sm mx-auto">
            3-screen BDR operating system — AI auto-research, Monte Carlo pipeline forecasting, radar scoring, and AI-generated handoffs &amp; outreach.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onDemo}
            className="px-8 py-4 rounded-2xl text-black font-semibold text-sm transition-all hover:scale-105"
            style={{ background:'linear-gradient(135deg,#ff8c00,#FFA040)', boxShadow:'0 4px 30px rgba(255,160,64,0.4)' }}>
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
            { value:'5',   label:'EMEA leads', sub:'AI-researched intelligence briefs' },
            { value:'MC',  label:'Monte Carlo', sub:'2,000-simulation pipeline forecast' },
            { value:'✦',   label:'Real Claude', sub:'Research · Handoff · Outreach' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold font-mono" style={{ color:ACCENT }}>{s.value}</p>
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
  const [mode, setMode] = useState('home');

  if (mode === 'demo') return (
    <div className="h-screen" style={{ background:'#060612' }}>
      <BDRDemo onExit={() => setMode('home')} />
    </div>
  );
  if (mode === 'live') return <BDRLive onBack={() => setMode('home')} />;
  return <BDRHome onDemo={() => setMode('demo')} onLive={() => setMode('live')} onBack={onBack} />;
}
