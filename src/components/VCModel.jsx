import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer,
} from 'recharts';

// ─── Factors ──────────────────────────────────────────────────────────────────

const FACTORS = [
  { key: 'marketSize',  label: 'Market Size',        weight: 0.14 },
  { key: 'moat',        label: 'Competitive Moat',   weight: 0.13 },
  { key: 'team',        label: 'Team Quality',        weight: 0.13 },
  { key: 'pmf',         label: 'Product-Market Fit', weight: 0.12 },
  { key: 'growth',      label: 'Revenue Growth',     weight: 0.10 },
  { key: 'unitEcon',    label: 'Unit Economics',      weight: 0.09 },
  { key: 'network',     label: 'Network Effects',    weight: 0.08 },
  { key: 'tech',        label: 'Technology / IP',    weight: 0.08 },
  { key: 'timing',      label: 'Market Timing',      weight: 0.06 },
  { key: 'burn',        label: 'Burn Efficiency',    weight: 0.04 },
  { key: 'competition', label: 'Competitive Pos.',   weight: 0.02 },
  { key: 'regulatory',  label: 'Regulatory Risk',    weight: 0.01 },
];

// ─── Demo companies ───────────────────────────────────────────────────────────

const DEMO = [
  { name:'Stripe',       sector:'FinTech',       marketSize:95,moat:92,team:95,pmf:98,growth:85,unitEcon:88,network:90,tech:85,timing:90,burn:88,competition:70,regulatory:65 },
  { name:'Wiz',          sector:'CyberSec',      marketSize:90,moat:88,team:92,pmf:95,growth:95,unitEcon:82,network:70,tech:90,timing:92,burn:78,competition:72,regulatory:75 },
  { name:'Databricks',   sector:'Data / AI',     marketSize:93,moat:85,team:90,pmf:92,growth:88,unitEcon:75,network:78,tech:92,timing:88,burn:70,competition:68,regulatory:80 },
  { name:'Figma',        sector:'Design',        marketSize:85,moat:90,team:88,pmf:95,growth:82,unitEcon:85,network:92,tech:85,timing:85,burn:82,competition:65,regulatory:85 },
  { name:'Linear',       sector:'Productivity',  marketSize:72,moat:80,team:85,pmf:88,growth:75,unitEcon:82,network:72,tech:78,timing:78,burn:85,competition:58,regulatory:88 },
  { name:'Vercel',       sector:'Dev Tools',     marketSize:80,moat:82,team:85,pmf:90,growth:85,unitEcon:78,network:80,tech:88,timing:85,burn:80,competition:62,regulatory:88 },
  { name:'Hugging Face', sector:'AI / ML',       marketSize:90,moat:85,team:88,pmf:92,growth:90,unitEcon:62,network:95,tech:92,timing:95,burn:58,competition:70,regulatory:70 },
  { name:'Anthropic',    sector:'AI Safety',     marketSize:98,moat:90,team:98,pmf:88,growth:92,unitEcon:52,network:72,tech:98,timing:95,burn:42,competition:75,regulatory:62 },
  { name:'Scale AI',     sector:'AI Infra',      marketSize:88,moat:82,team:90,pmf:88,growth:82,unitEcon:72,network:68,tech:88,timing:90,burn:68,competition:68,regulatory:72 },
  { name:'OpenAI',       sector:'AI / LLM',      marketSize:99,moat:92,team:95,pmf:97,growth:98,unitEcon:58,network:95,tech:98,timing:97,burn:38,competition:78,regulatory:58 },
  { name:'Notion',       sector:'Productivity',  marketSize:82,moat:72,team:80,pmf:85,growth:72,unitEcon:80,network:80,tech:72,timing:75,burn:82,competition:52,regulatory:88 },
  { name:'Perplexity',   sector:'AI Search',     marketSize:88,moat:70,team:85,pmf:85,growth:95,unitEcon:55,network:75,tech:88,timing:95,burn:52,competition:65,regulatory:68 },
  { name:'W&B',          sector:'MLOps',         marketSize:78,moat:85,team:88,pmf:90,growth:78,unitEcon:75,network:72,tech:85,timing:82,burn:75,competition:60,regulatory:85 },
  { name:'Mistral',      sector:'AI / LLM',      marketSize:90,moat:78,team:85,pmf:80,growth:88,unitEcon:58,network:68,tech:92,timing:90,burn:52,competition:72,regulatory:65 },
  { name:'Chainalysis',  sector:'Crypto',        marketSize:72,moat:85,team:80,pmf:88,growth:70,unitEcon:78,network:68,tech:82,timing:72,burn:80,competition:65,regulatory:60 },
  { name:'Cohere',       sector:'Enterprise AI', marketSize:88,moat:70,team:82,pmf:78,growth:80,unitEcon:62,network:62,tech:88,timing:85,burn:60,competition:68,regulatory:72 },
  { name:'Airtable',     sector:'No-Code',       marketSize:80,moat:68,team:78,pmf:82,growth:65,unitEcon:78,network:72,tech:70,timing:70,burn:78,competition:50,regulatory:85 },
  { name:'Replit',       sector:'Dev Tools',     marketSize:82,moat:72,team:82,pmf:85,growth:82,unitEcon:58,network:82,tech:80,timing:88,burn:55,competition:58,regulatory:85 },
  { name:'Temporal',     sector:'Infra',         marketSize:70,moat:80,team:85,pmf:80,growth:70,unitEcon:72,network:60,tech:85,timing:75,burn:72,competition:55,regulatory:82 },
  { name:'Brex',         sector:'FinTech',       marketSize:82,moat:70,team:80,pmf:80,growth:72,unitEcon:70,network:65,tech:72,timing:72,burn:68,competition:52,regulatory:55 },
];

const THRESHOLD = 78;

const TREE_SUBSETS = [
  ['Market Size','Moat','Team','PMF','Growth','Unit Econ','Network'],
  ['Moat','Team','PMF','Technology','Timing','Unit Econ','Market Size'],
  ['Team','PMF','Growth','Network','Market Size','Moat','Burn'],
  ['Technology','Market Size','Moat','Timing','Team','Growth','Network'],
  ['Network','PMF','Team','Unit Econ','Market Size','Technology','Timing'],
  ['Growth','Moat','Technology','Market Size','Team','Competition','PMF'],
  ['Unit Econ','Team','PMF','Network','Moat','Market Size','Technology'],
  ['Timing','Market Size','Team','Moat','Growth','Technology','Network'],
  ['PMF','Technology','Unit Econ','Moat','Network','Team','Market Size'],
  ['Burn','Market Size','Moat','Team','PMF','Growth','Technology'],
];

const LOG_FNS = [
  c => `> [${c.sector}] Fetching signal data for ${c.name}...`,
  c => `> TAM: ${c.marketSize >= 90 ? '>$100B addressable' : c.marketSize >= 80 ? '$10–100B market' : 'Niche <$10B'}`,
  c => `> Team=${c.team}  PMF=${c.pmf}  Moat=${c.moat}  UnitEcon=${c.unitEcon}  Growth=${c.growth}`,
  c => `✓ ${c.name} — confidence ${Math.min(99, 72 + Math.floor(c.team / 10))}%`,
];

// ─── Math ─────────────────────────────────────────────────────────────────────

function gaussian(mean, std) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.min(100, Math.max(0, mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)));
}
function weightedScore(c) { return FACTORS.reduce((s, f) => s + c[f.key] * f.weight, 0); }

function runMC(companies, n = 2000) {
  return companies.map(c => {
    const scores = Array.from({ length: n }, () => {
      const s = {}; FACTORS.forEach(f => { s[f.key] = gaussian(c[f.key], 10); }); return weightedScore(s);
    }).sort((a, b) => a - b);
    return { mean: scores.reduce((a, x) => a + x, 0) / n, p10: scores[Math.floor(n * 0.10)], p90: scores[Math.floor(n * 0.90)] };
  });
}

function runRF(companies) {
  const trees = TREE_SUBSETS.map(subset => {
    const keys = FACTORS.filter(f => subset.some(s => f.label.toLowerCase().startsWith(s.toLowerCase().split(' ')[0])));
    const tw = keys.reduce((s, f) => s + f.weight, 0) || 1;
    return companies.map(c => keys.reduce((s, f) => s + c[f.key] * f.weight / tw, 0));
  });
  return companies.map((_, i) => ({ rf: Math.round(trees.reduce((s, t) => s + t[i], 0) / trees.length) }));
}

function getFI(companies) {
  const raw = FACTORS.map(f => {
    const vals = companies.map(c => c[f.key]);
    const mean = vals.reduce((a, v) => a + v, 0) / vals.length;
    const v = vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length;
    return { label: f.label, score: v * f.weight };
  });
  const max = Math.max(...raw.map(r => r.score)) || 1;
  return raw.map(r => ({ label: r.label, imp: Math.round((r.score / max) * 100) })).sort((a, b) => b.imp - a.imp);
}

function xy(c) {
  return {
    x: Math.round(c.marketSize * 0.35 + c.moat * 0.35 + c.network * 0.30),
    y: Math.round(c.team * 0.40 + c.pmf * 0.30 + c.unitEcon * 0.30),
  };
}
function quad(x, y) {
  if (x >= THRESHOLD && y >= THRESHOLD) return { label: 'Champion',       color: '#22c55e' };
  if (x <  THRESHOLD && y >= THRESHOLD) return { label: "Operator's Bet", color: '#60a5fa' };
  if (x >= THRESHOLD && y <  THRESHOLD) return { label: 'Market Bet',     color: '#D4AF37' };
  return                                         { label: 'Pass',          color: '#ef4444' };
}
function buildPoint(c, mc, rf) {
  return { name: c.name, sector: c.sector, ...xy(c), mcMean: mc.mean, mcP10: mc.p10, mcP90: mc.p90, rfScore: rf.rf, finalScore: Math.round(mc.mean * 0.6 + rf.rf * 0.4) };
}
function buildDemoEvents() { return DEMO.flatMap(c => LOG_FNS.map(fn => fn(c))); }

// ─── Anthropic API research ───────────────────────────────────────────────────

async function researchCompany(name, apiKey) {
  const prompt = `You are a venture capital analyst. Based on publicly available information about "${name}", score it on these 12 VC investment factors (0–100).

Return ONLY valid JSON, no prose, no markdown:
{"sector":"Industry","marketSize":0,"moat":0,"team":0,"pmf":0,"growth":0,"unitEcon":0,"network":0,"tech":0,"timing":0,"burn":0,"competition":0,"regulatory":0}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error('Could not parse response');
  const parsed = JSON.parse(match[0]);
  FACTORS.forEach(f => { if (typeof parsed[f.key] !== 'number') parsed[f.key] = 50; });
  return parsed;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function ScatterTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const q = quad(d.x, d.y);
  return (
    <div className="glass rounded-xl px-3 py-2.5 border border-white/15 text-xs pointer-events-none"
      style={{ background: 'rgba(10,10,20,0.95)' }}>
      <p className="font-bold text-white mb-0.5">{d.name}</p>
      <p className="font-medium mb-1.5" style={{ color: q.color }}>{q.label}</p>
      <p className="text-white/50">Market Opp  <span className="text-white/80 font-mono">{d.x}</span></p>
      <p className="text-white/50">Execution   <span className="text-white/80 font-mono">{d.y}</span></p>
      <p className="text-white/50">MC Score    <span className="text-white/80 font-mono">{d.mcMean?.toFixed(1)}</span></p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VCModel({ onBack }) {
  const [idleMode, setIdleMode]           = useState('choice'); // 'choice' | 'manual'
  const [inputCompanies, setInputCompanies] = useState([]);
  const [newName, setNewName]             = useState('');
  const [apiKey, setApiKey]               = useState(() => localStorage.getItem('vc_api_key') || '');
  const [showKey, setShowKey]             = useState(false);

  const [phase, setPhase]                 = useState('idle');
  const [runMode, setRunMode]             = useState(null); // 'demo' | 'manual'
  const [analyzeStep, setAnalyzeStep]     = useState(0);
  const [termLines, setTermLines]         = useState([]);
  const [analyzeError, setAnalyzeError]  = useState(null);
  const [mcProgress, setMcProgress]       = useState(0);
  const [rfDone, setRfDone]               = useState(0);
  const [results, setResults]             = useState(null);

  const timerRef  = useRef(null);
  const termRef   = useRef(null);
  const demoEvents = useRef(buildDemoEvents());
  const abortRef  = useRef(false);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [analyzeStep, termLines]);

  // Demo analyzing timer
  useEffect(() => {
    if (phase !== 'analyzing' || runMode !== 'demo') return;
    timerRef.current = setInterval(() => {
      setAnalyzeStep(s => {
        if (s + 1 >= demoEvents.current.length) {
          clearInterval(timerRef.current);
          setPhase('computing');
          return s + 1;
        }
        return s + 1;
      });
    }, 55);
    return () => clearInterval(timerRef.current);
  }, [phase, runMode]);

  // Computing phase
  useEffect(() => {
    if (phase !== 'computing') return;
    setMcProgress(0);
    timerRef.current = setInterval(() => {
      setMcProgress(p => {
        const next = p + 40;
        if (next >= 2000) { clearInterval(timerRef.current); setRfDone(0); setPhase('rf'); return 2000; }
        return next;
      });
    }, 40);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // RF phase
  useEffect(() => {
    if (phase !== 'rf') return;
    let t = 0;
    timerRef.current = setInterval(() => {
      t++; setRfDone(t);
      if (t >= TREE_SUBSETS.length) { clearInterval(timerRef.current); setTimeout(() => setPhase('results'), 600); }
    }, 200);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const addLine = useCallback(line => setTermLines(prev => [...prev, line]), []);

  function saveApiKey(key) { setApiKey(key); localStorage.setItem('vc_api_key', key); }

  function addCompany() {
    const name = newName.trim();
    if (!name || inputCompanies.includes(name)) return;
    setInputCompanies(prev => [...prev, name]);
    setNewName('');
  }

  function handleRunDemo() {
    const mc = runMC(DEMO), rf = runRF(DEMO), fi = getFI(DEMO);
    setResults({ scatter: DEMO.map((c, i) => buildPoint(c, mc[i], rf[i])), fi });
    setRunMode('demo'); setAnalyzeStep(0); setMcProgress(0); setRfDone(0); setPhase('analyzing');
  }

  async function handleRunManual() {
    if (!apiKey.trim() || inputCompanies.length === 0) return;
    abortRef.current = false;
    setRunMode('manual');
    setTermLines([`$ vc-agent --mode=research --model=claude-haiku --n=${inputCompanies.length}`]);
    setAnalyzeError(null);
    setPhase('analyzing');

    const researched = [];
    for (let i = 0; i < inputCompanies.length; i++) {
      if (abortRef.current) return;
      const name = inputCompanies[i];
      addLine(`> [${i + 1}/${inputCompanies.length}] Researching ${name}...`);
      try {
        const f = await researchCompany(name, apiKey);
        addLine(`  marketSize=${f.marketSize}  moat=${f.moat}  team=${f.team}  pmf=${f.pmf}  growth=${f.growth}`);
        addLine(`  unitEcon=${f.unitEcon}  network=${f.network}  tech=${f.tech}  timing=${f.timing}  burn=${f.burn}`);
        addLine(`✓ ${name} — sector: ${f.sector || 'Unknown'}`);
        researched.push({ name, sector: f.sector || 'Unknown', ...f });
      } catch (err) {
        addLine(`✗ ${name} — ${err.message}`);
        setAnalyzeError(err.message);
        return;
      }
    }

    addLine('');
    addLine('> Research complete. Running Monte Carlo + Random Forest...');
    const mc = runMC(researched), rf = runRF(researched), fi = getFI(researched);
    setResults({ scatter: researched.map((c, i) => buildPoint(c, mc[i], rf[i])), fi });
    setMcProgress(0); setRfDone(0); setPhase('computing');
  }

  function handleReset() {
    abortRef.current = true;
    clearInterval(timerRef.current);
    setPhase('idle'); setRunMode(null); setIdleMode('choice');
    setAnalyzeStep(0); setTermLines([]); setAnalyzeError(null);
    setMcProgress(0); setRfDone(0); setResults(null);
  }

  // ── Top bar ───────────────────────────────────────────────────────────────────

  const topBar = (
    <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-white/8"
      style={{ background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(20px)' }}>
      <button onClick={onBack}
        className="text-xs text-white/55 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all">
        ← Portfolio
      </button>
      <span className="text-xs text-white/25">|</span>
      <span className="text-xs text-white/65 font-medium">Venture Capital Agent</span>
      <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full border font-mono"
        style={{ borderColor: '#3b82f650', color: '#60a5fa', background: '#3b82f610' }}>
        Monte Carlo · Random Forest
      </span>
    </div>
  );

  // ── Phase: idle ───────────────────────────────────────────────────────────────

  if (phase === 'idle') {
    if (idleMode === 'choice') return (
      <div className="min-h-screen bg-premium">
        <div className="absolute inset-0 bg-glow-red pointer-events-none" />
        {topBar}
        <div className="relative max-w-4xl mx-auto px-4 py-12 space-y-10">

          <div className="text-center space-y-3">
            <h1 className="font-display text-3xl text-white tracking-tight">Venture Capital Agent</h1>
            <p className="text-sm text-white/50 max-w-lg mx-auto">
              AI-powered portfolio ranking using Monte Carlo simulation and a 10-tree Random Forest across 12 investment factors.
            </p>
            <div className="flex items-center justify-center gap-8 pt-1">
              {[['12','Factors'],['2,000','MC iterations'],['10','RF trees']].map(([v,l]) => (
                <div key={l} className="text-center">
                  <p className="text-xl font-bold font-mono text-white">{v}</p>
                  <p className="text-xs text-white/38">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Factor weights */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-semibold text-white/38 uppercase tracking-widest mb-3">Investment Factors & Weights</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              {FACTORS.map(f => (
                <div key={f.key} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-xs text-white/60">{f.label}</span>
                  <span className="text-xs font-mono font-semibold text-white/80">{Math.round(f.weight * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mode cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Live Demo */}
            <div className="glass rounded-2xl p-6 flex flex-col gap-4" style={{ borderTop: '2px solid rgba(34,197,94,0.4)' }}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Instant
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Live Demo</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Runs immediately with 20 pre-loaded companies — Stripe, OpenAI, Anthropic, Figma, and 16 more. No API key needed.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEMO.slice(0, 6).map(c => (
                  <span key={c.name} className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/50">{c.name}</span>
                ))}
                <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/35">+{DEMO.length - 6} more</span>
              </div>
              <button onClick={handleRunDemo}
                className="mt-auto w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.25),rgba(34,197,94,0.12))', border: '1px solid rgba(34,197,94,0.35)' }}>
                <span className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Run Live Demo
                </span>
              </button>
            </div>

            {/* Custom analysis */}
            <div className="glass rounded-2xl p-6 flex flex-col gap-4" style={{ borderTop: '2px solid rgba(59,130,246,0.4)' }}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400">
                    AI Research
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Research Portfolio</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Enter any company names. The agent calls Claude to research each one and estimate the 12 factors before running the simulation.
                </p>
              </div>
              <button onClick={() => setIdleMode('manual')}
                className="mt-auto w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.25),rgba(59,130,246,0.12))', border: '1px solid rgba(59,130,246,0.35)' }}>
                <span className="flex items-center justify-center gap-2">
                  Set Up Portfolio →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    // Manual input form
    const canRun = apiKey.trim().length > 10 && inputCompanies.length > 0;
    return (
      <div className="min-h-screen bg-premium">
        <div className="absolute inset-0 bg-glow-red pointer-events-none" />
        {topBar}
        <div className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">

          <div className="flex items-center gap-3">
            <button onClick={() => setIdleMode('choice')}
              className="text-xs text-white/45 hover:text-white/65 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all">
              ← Back
            </button>
            <h2 className="font-display text-xl text-white">Research Portfolio</h2>
          </div>

          {/* API Key */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Anthropic API Key</p>
              {apiKey && <span className="text-xs text-green-400">✓ Saved</span>}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => saveApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white/80 placeholder-white/25 outline-none focus:border-blue-500/50 transition-colors font-mono"
                />
              </div>
              <button onClick={() => setShowKey(s => !s)}
                className="px-3 py-2 rounded-xl border border-white/10 text-xs text-white/40 hover:text-white/65 transition-all">
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-white/30">
              Stored in your browser only — never sent anywhere except Anthropic's API.{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer"
                className="text-blue-400/70 hover:text-blue-400 underline">Get a key →</a>
            </p>
          </div>

          {/* Company input */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Companies</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCompany()}
                placeholder="Company name (e.g. Stripe)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white/80 placeholder-white/25 outline-none focus:border-blue-500/50 transition-colors"
              />
              <button onClick={addCompany}
                disabled={!newName.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: newName.trim() ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newName.trim() ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`, color: newName.trim() ? '#60a5fa' : 'rgba(255,255,255,0.25)' }}>
                Add
              </button>
            </div>
            {inputCompanies.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {inputCompanies.map(name => (
                  <div key={name} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/10 text-xs"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-white/75">{name}</span>
                    <button onClick={() => setInputCompanies(prev => prev.filter(n => n !== name))}
                      className="text-white/30 hover:text-white/60 leading-none transition-colors">×</button>
                  </div>
                ))}
              </div>
            )}
            {inputCompanies.length === 0 && (
              <p className="text-xs text-white/25 italic">Add at least one company to continue.</p>
            )}
          </div>

          {analyzeError && (
            <div className="rounded-xl px-4 py-3 text-xs text-red-400 border border-red-500/25" style={{ background: 'rgba(239,68,68,0.08)' }}>
              {analyzeError}
            </div>
          )}

          <button onClick={handleRunManual} disabled={!canRun}
            className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all"
            style={{
              background: canRun ? 'linear-gradient(135deg,#C41E3A,#8B0000)' : 'rgba(255,255,255,0.05)',
              boxShadow: canRun ? '0 4px 30px rgba(196,30,58,0.4)' : 'none',
              color: canRun ? 'white' : 'rgba(255,255,255,0.25)',
              cursor: canRun ? 'pointer' : 'not-allowed',
            }}>
            <span className="flex items-center justify-center gap-2">
              {canRun && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              {canRun ? `Run Agent — ${inputCompanies.length} ${inputCompanies.length === 1 ? 'company' : 'companies'}` : 'Add companies + API key to continue'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: analyzing ──────────────────────────────────────────────────────────

  if (phase === 'analyzing') {
    const isDemo = runMode === 'demo';
    const visibleDemo = demoEvents.current.slice(0, analyzeStep);
    const progress = isDemo ? (analyzeStep / demoEvents.current.length) * 100 : null;

    return (
      <div className="min-h-screen bg-premium">
        <div className="absolute inset-0 bg-glow-red pointer-events-none" />
        {topBar}
        <div className="relative max-w-3xl mx-auto px-4 py-10 space-y-5">
          <div className="text-center">
            <h2 className="font-display text-2xl text-white mb-1">
              {isDemo ? 'Analyzing Demo Portfolio' : 'Researching Portfolio'}
            </h2>
            <p className="text-xs text-white/40">
              {isDemo
                ? `Agent analyzing ${DEMO.length} companies across ${FACTORS.length} investment factors`
                : `Agent calling Anthropic API for ${inputCompanies.length} ${inputCompanies.length === 1 ? 'company' : 'companies'}`}
            </p>
          </div>

          {isDemo && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/35">
                <span>{Math.min(Math.floor(analyzeStep / LOG_FNS.length) + 1, DEMO.length)} / {DEMO.length} companies</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-75"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#C41E3A,#ff6b6b)' }} />
              </div>
            </div>
          )}

          <div ref={termRef} className="rounded-2xl p-5 font-mono text-xs leading-relaxed overflow-y-auto"
            style={{ minHeight: 420, maxHeight: 520, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-emerald-400/60 mb-3">
              {isDemo
                ? '$ vc-agent --demo --n=20 --mc=2000 --rf=10'
                : `$ vc-agent --research --n=${inputCompanies.length} --mc=2000 --rf=10`}
            </div>
            {(isDemo ? visibleDemo : termLines).map((line, i) => (
              <div key={i} className={`mb-0.5 ${
                line.startsWith('✓') ? 'text-emerald-400' :
                line.startsWith('✗') ? 'text-red-400' :
                line.startsWith('>') ? 'text-white/70' :
                line.startsWith('  ') ? 'text-blue-300/70' : 'text-white/45'
              }`}>{line}</div>
            ))}
            {isDemo && analyzeStep < demoEvents.current.length && (
              <span className="inline-block w-2 h-3.5 bg-white/60 animate-pulse ml-0.5" />
            )}
            {!isDemo && !analyzeError && phase === 'analyzing' && (
              <span className="inline-block w-2 h-3.5 bg-white/60 animate-pulse ml-0.5" />
            )}
            {analyzeError && (
              <div className="mt-4 pt-4 border-t border-red-500/20">
                <p className="text-red-400 mb-3">API error: {analyzeError}</p>
                <button onClick={handleReset}
                  className="text-xs border border-white/15 hover:border-white/30 px-4 py-2 rounded-full text-white/55 hover:text-white/75 transition-all">
                  ← Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: computing / rf ─────────────────────────────────────────────────────

  if (phase === 'computing' || phase === 'rf') return (
    <div className="min-h-screen bg-premium">
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      {topBar}
      <div className="relative max-w-2xl mx-auto px-4 py-16 space-y-8">
        <div className="text-center">
          <h2 className="font-display text-2xl text-white mb-1">Running Simulations</h2>
          <p className="text-xs text-white/40">Quantifying uncertainty and training ensemble model</p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/45 uppercase tracking-widest">Monte Carlo</span>
            <span className="text-xs font-mono text-white/70">{mcProgress.toLocaleString()} / 2,000</span>
          </div>
          <div className="h-2 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-75"
              style={{ width: `${(mcProgress / 2000) * 100}%`, background: 'linear-gradient(90deg,#C41E3A,#ff6b6b)' }} />
          </div>
          <p className="text-xs text-white/28">σ = 10 per factor · Box-Muller Gaussian sampling · {mcProgress >= 2000 ? '✓ Complete' : 'Running...'}</p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-2.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white/45 uppercase tracking-widest">Random Forest</span>
            <span className="text-xs font-mono text-white/70">{rfDone} / {TREE_SUBSETS.length} trees</span>
          </div>
          {TREE_SUBSETS.map((subset, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={i < rfDone ? 'text-white/55' : 'text-white/18'}>
                  Tree {i + 1} <span className="text-white/28 font-mono">[{subset.slice(0, 3).join(', ')}, …]</span>
                </span>
                <span className={i < rfDone ? 'text-emerald-400' : 'text-white/15'}>{i < rfDone ? '✓' : '○'}</span>
              </div>
              <div className="h-1 rounded-full bg-white/6 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: i < rfDone ? '100%' : '0%', background: 'linear-gradient(90deg,#3b82f6,#60a5fa)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Phase: results ────────────────────────────────────────────────────────────

  if (phase === 'results' && results) {
    const sorted = [...results.scatter].sort((a, b) => b.finalScore - a.finalScore);
    return (
      <div className="min-h-screen bg-premium pb-12">
        <div className="absolute inset-0 bg-glow-red pointer-events-none" />
        <div className="absolute inset-0 bg-glow-gold pointer-events-none" />
        {topBar}
        <div className="relative max-w-5xl mx-auto px-4 py-10 space-y-8">

          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl text-white">Analysis Complete</h2>
              <p className="text-xs text-white/40 mt-1">
                {results.scatter.length} companies · 2,000 Monte Carlo iterations · 10-tree Random Forest · 12 factors
              </p>
            </div>
            <button onClick={handleReset}
              className="text-xs text-white/38 hover:text-white/60 border border-white/10 hover:border-white/20 px-4 py-2 rounded-full transition-all">
              ↺ Reset
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {[
              { label:'Champion',       color:'#22c55e', desc:'High market + high execution' },
              { label:"Operator's Bet", color:'#60a5fa', desc:'Strong execution, smaller market' },
              { label:'Market Bet',     color:'#D4AF37', desc:'Large market, execution TBD' },
              { label:'Pass',           color:'#ef4444', desc:'Caution on both dimensions' },
            ].map(q => (
              <div key={q.label} className="flex items-center gap-2 glass rounded-full px-3 py-1.5 border border-white/8 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: q.color }} />
                <span className="text-white/65 font-medium">{q.label}</span>
                <span className="text-white/28 hidden sm:inline">— {q.desc}</span>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-semibold text-white/38 uppercase tracking-widest mb-1">Portfolio Map</p>
            <p className="text-xs text-white/28 mb-5">
              X = Market Opportunity (TAM · Moat · Network) &nbsp;·&nbsp; Y = Execution Quality (Team · PMF · Unit Econ) &nbsp;·&nbsp; Hover for details
            </p>
            <ResponsiveContainer width="100%" height={420}>
              <ScatterChart margin={{ top: 10, right: 40, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" dataKey="x" domain={[55, 100]} stroke="rgba(255,255,255,0.12)"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  label={{ value: 'Market Opportunity →', position: 'insideBottom', fill: 'rgba(255,255,255,0.22)', fontSize: 11, offset: -15 }} />
                <YAxis type="number" dataKey="y" domain={[55, 100]} stroke="rgba(255,255,255,0.12)"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  label={{ value: 'Execution Quality →', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.22)', fontSize: 11, dy: 70 }} />
                <ReferenceArea x1={THRESHOLD} x2={100} y1={THRESHOLD} y2={100} fill="rgba(34,197,94,0.05)"  stroke="none" />
                <ReferenceArea x1={55} x2={THRESHOLD} y1={THRESHOLD} y2={100} fill="rgba(96,165,250,0.05)"  stroke="none" />
                <ReferenceArea x1={THRESHOLD} x2={100} y1={55} y2={THRESHOLD} fill="rgba(212,175,55,0.05)" stroke="none" />
                <ReferenceArea x1={55} x2={THRESHOLD} y1={55} y2={THRESHOLD} fill="rgba(239,68,68,0.05)"   stroke="none" />
                <ReferenceLine x={THRESHOLD} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                <ReferenceLine y={THRESHOLD} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                <Tooltip content={<ScatterTip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.15)' }} />
                <Scatter data={results.scatter}
                  shape={({ cx, cy, payload }) => {
                    const q = quad(payload.x, payload.y);
                    return <circle cx={cx} cy={cy} r={6} fill={q.color} fillOpacity={0.85} stroke={q.color} strokeWidth={1.5} strokeOpacity={0.35} />;
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-semibold text-white/38 uppercase tracking-widest mb-4">Ranked — MC + RF Composite</p>
              <div className="space-y-1.5">
                {sorted.map((c, i) => {
                  const q = quad(c.x, c.y);
                  return (
                    <div key={c.name} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <span className="text-xs font-mono text-white/22 w-5 text-right shrink-0">{i + 1}</span>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: q.color }} />
                      <span className="text-xs font-semibold text-white/82 flex-1 truncate">{c.name}</span>
                      <span className="text-xs text-white/28 hidden sm:inline truncate max-w-[80px]">{c.sector}</span>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold" style={{ color: q.color }}>{c.finalScore}</span>
                        <span className="text-xs text-white/22 font-mono ml-1">[{c.mcP10?.toFixed(0)}–{c.mcP90?.toFixed(0)}]</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-semibold text-white/38 uppercase tracking-widest mb-4">Feature Importance</p>
              <div className="space-y-3">
                {results.fi.map(f => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/58">{f.label}</span>
                      <span className="font-mono text-white/70">{f.imp}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${f.imp}%`, background: 'linear-gradient(90deg,#C41E3A,#ff6b6b)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 pt-3 border-t border-white/8 text-xs text-white/30 leading-relaxed">
                Weighted variance across the portfolio — factors with high spread across companies drive the most differentiation.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
