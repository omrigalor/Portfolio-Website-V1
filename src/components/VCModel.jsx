import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer,
} from 'recharts';

// ─── Stage-dependent weights ──────────────────────────────────────────────────

const STAGE_WEIGHTS = {
  early:   { team:0.22, pmf:0.16, marketSize:0.14, tech:0.12, timing:0.10, moat:0.08, growth:0.07, network:0.05, unitEcon:0.03, burn:0.02, competition:0.01, regulatory:0.00 },
  seriesA: { marketSize:0.16, team:0.15, pmf:0.14, growth:0.13, moat:0.12, unitEcon:0.10, tech:0.08, network:0.06, timing:0.04, burn:0.01, competition:0.01, regulatory:0.00 },
  growth:  { growth:0.16, marketSize:0.14, unitEcon:0.14, moat:0.13, team:0.11, pmf:0.10, network:0.08, tech:0.06, burn:0.04, timing:0.02, competition:0.01, regulatory:0.01 },
};

const STAGE_LABELS = {
  early:   { label: 'Pre-Seed / Seed', hint: 'Team & idea dominate' },
  seriesA: { label: 'Series A / B',    hint: 'Traction + market size' },
  growth:  { label: 'Series C+ / Growth', hint: 'Unit econ & scale' },
};

const FACTOR_META = [
  { key: 'marketSize',  label: 'Market Size'       },
  { key: 'moat',        label: 'Competitive Moat'  },
  { key: 'team',        label: 'Team Quality'       },
  { key: 'pmf',         label: 'Product-Market Fit'},
  { key: 'growth',      label: 'Revenue Growth'    },
  { key: 'unitEcon',    label: 'Unit Economics'     },
  { key: 'network',     label: 'Network Effects'   },
  { key: 'tech',        label: 'Technology / IP'   },
  { key: 'timing',      label: 'Market Timing'     },
  { key: 'burn',        label: 'Burn Efficiency'   },
  { key: 'competition', label: 'Competitive Pos.'  },
  { key: 'regulatory',  label: 'Regulatory Risk'   },
];

function getFactors(stage) {
  const w = STAGE_WEIGHTS[stage];
  return FACTOR_META.map(f => ({ ...f, weight: w[f.key] }));
}

// ─── Demo companies ───────────────────────────────────────────────────────────

const DEMO = [
  { name:'Stripe',       sector:'FinTech',       dataConfidence:'high',   marketSize:95,moat:92,team:95,pmf:98,growth:85,unitEcon:88,network:90,tech:85,timing:90,burn:88,competition:70,regulatory:65 },
  { name:'Wiz',          sector:'CyberSec',      dataConfidence:'high',   marketSize:90,moat:88,team:92,pmf:95,growth:95,unitEcon:82,network:70,tech:90,timing:92,burn:78,competition:72,regulatory:75 },
  { name:'Databricks',   sector:'Data / AI',     dataConfidence:'high',   marketSize:93,moat:85,team:90,pmf:92,growth:88,unitEcon:75,network:78,tech:92,timing:88,burn:70,competition:68,regulatory:80 },
  { name:'Figma',        sector:'Design',        dataConfidence:'high',   marketSize:85,moat:90,team:88,pmf:95,growth:82,unitEcon:85,network:92,tech:85,timing:85,burn:82,competition:65,regulatory:85 },
  { name:'Linear',       sector:'Productivity',  dataConfidence:'medium', marketSize:72,moat:80,team:85,pmf:88,growth:75,unitEcon:82,network:72,tech:78,timing:78,burn:85,competition:58,regulatory:88 },
  { name:'Vercel',       sector:'Dev Tools',     dataConfidence:'medium', marketSize:80,moat:82,team:85,pmf:90,growth:85,unitEcon:78,network:80,tech:88,timing:85,burn:80,competition:62,regulatory:88 },
  { name:'Hugging Face', sector:'AI / ML',       dataConfidence:'high',   marketSize:90,moat:85,team:88,pmf:92,growth:90,unitEcon:62,network:95,tech:92,timing:95,burn:58,competition:70,regulatory:70 },
  { name:'Anthropic',    sector:'AI Safety',     dataConfidence:'high',   marketSize:98,moat:90,team:98,pmf:88,growth:92,unitEcon:52,network:72,tech:98,timing:95,burn:42,competition:75,regulatory:62 },
  { name:'Scale AI',     sector:'AI Infra',      dataConfidence:'high',   marketSize:88,moat:82,team:90,pmf:88,growth:82,unitEcon:72,network:68,tech:88,timing:90,burn:68,competition:68,regulatory:72 },
  { name:'OpenAI',       sector:'AI / LLM',      dataConfidence:'high',   marketSize:99,moat:92,team:95,pmf:97,growth:98,unitEcon:58,network:95,tech:98,timing:97,burn:38,competition:78,regulatory:58 },
  { name:'Notion',       sector:'Productivity',  dataConfidence:'high',   marketSize:82,moat:72,team:80,pmf:85,growth:72,unitEcon:80,network:80,tech:72,timing:75,burn:82,competition:52,regulatory:88 },
  { name:'Perplexity',   sector:'AI Search',     dataConfidence:'medium', marketSize:88,moat:70,team:85,pmf:85,growth:95,unitEcon:55,network:75,tech:88,timing:95,burn:52,competition:65,regulatory:68 },
  { name:'W&B',          sector:'MLOps',         dataConfidence:'medium', marketSize:78,moat:85,team:88,pmf:90,growth:78,unitEcon:75,network:72,tech:85,timing:82,burn:75,competition:60,regulatory:85 },
  { name:'Mistral',      sector:'AI / LLM',      dataConfidence:'medium', marketSize:90,moat:78,team:85,pmf:80,growth:88,unitEcon:58,network:68,tech:92,timing:90,burn:52,competition:72,regulatory:65 },
  { name:'Chainalysis',  sector:'Crypto',        dataConfidence:'medium', marketSize:72,moat:85,team:80,pmf:88,growth:70,unitEcon:78,network:68,tech:82,timing:72,burn:80,competition:65,regulatory:60 },
  { name:'Cohere',       sector:'Enterprise AI', dataConfidence:'medium', marketSize:88,moat:70,team:82,pmf:78,growth:80,unitEcon:62,network:62,tech:88,timing:85,burn:60,competition:68,regulatory:72 },
  { name:'Airtable',     sector:'No-Code',       dataConfidence:'high',   marketSize:80,moat:68,team:78,pmf:82,growth:65,unitEcon:78,network:72,tech:70,timing:70,burn:78,competition:50,regulatory:85 },
  { name:'Replit',       sector:'Dev Tools',     dataConfidence:'medium', marketSize:82,moat:72,team:82,pmf:85,growth:82,unitEcon:58,network:82,tech:80,timing:88,burn:55,competition:58,regulatory:85 },
  { name:'Temporal',     sector:'Infra',         dataConfidence:'low',    marketSize:70,moat:80,team:85,pmf:80,growth:70,unitEcon:72,network:60,tech:85,timing:75,burn:72,competition:55,regulatory:82 },
  { name:'Brex',         sector:'FinTech',       dataConfidence:'high',   marketSize:82,moat:70,team:80,pmf:80,growth:72,unitEcon:70,network:65,tech:72,timing:72,burn:68,competition:52,regulatory:55 },
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
function weightedScore(c, factors) { return factors.reduce((s, f) => s + c[f.key] * f.weight, 0); }

function runMC(companies, factors, n = 2000) {
  return companies.map(c => {
    const scores = Array.from({ length: n }, () => {
      const s = {}; factors.forEach(f => { s[f.key] = gaussian(c[f.key], 10); }); return weightedScore(s, factors);
    }).sort((a, b) => a - b);
    return { mean: scores.reduce((a, x) => a + x, 0) / n, p10: scores[Math.floor(n * 0.10)], p90: scores[Math.floor(n * 0.90)] };
  });
}

function runRF(companies, factors) {
  const trees = TREE_SUBSETS.map(subset => {
    const keys = factors.filter(f => subset.some(s => f.label.toLowerCase().startsWith(s.toLowerCase().split(' ')[0])));
    const tw = keys.reduce((s, f) => s + f.weight, 0) || 1;
    return companies.map(c => keys.reduce((s, f) => s + c[f.key] * f.weight / tw, 0));
  });
  return companies.map((_, i) => ({ rf: Math.round(trees.reduce((s, t) => s + t[i], 0) / trees.length) }));
}

function getFI(companies, factors) {
  const raw = factors.map(f => {
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
  return { name: c.name, sector: c.sector, dataConfidence: c.dataConfidence || 'medium',
    baseFactors: FACTOR_META.reduce((o, f) => { o[f.key] = c[f.key]; return o; }, {}),
    ...xy(c), mcMean: mc.mean, mcP10: mc.p10, mcP90: mc.p90, rfScore: rf.rf,
    finalScore: Math.round(mc.mean * 0.6 + rf.rf * 0.4) };
}
function buildDemoEvents() { return DEMO.flatMap(c => LOG_FNS.map(fn => fn(c))); }

// ─── Anthropic API research ───────────────────────────────────────────────────

async function researchCompany(name, apiKey, dataRoom = null) {
  const drSection = dataRoom?.trim()
    ? `\n\nProprietary data room data has been provided for ${name}:\n${dataRoom.trim()}\n\nIncorporate this data into your factor estimates where relevant. If the data room provides meaningful financials or metrics, upgrade dataConfidence to "high".`
    : '';

  const prompt = `You are a venture capital analyst. Based on publicly available information about "${name}", score it on these 12 VC investment factors (0–100).${drSection}

Also rate your data confidence: "high" = well-known company or substantive data room provided, "medium" = some data available, "low" = limited public data (early-stage, stealth, or niche).

Return ONLY valid JSON, no prose:
{"sector":"Industry","dataConfidence":"medium","marketSize":0,"moat":0,"team":0,"pmf":0,"growth":0,"unitEcon":0,"network":0,"tech":0,"timing":0,"burn":0,"competition":0,"regulatory":0}`;

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

  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `API ${res.status}`); }
  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error('Could not parse response');
  const parsed = JSON.parse(match[0]);
  FACTOR_META.forEach(f => { if (typeof parsed[f.key] !== 'number') parsed[f.key] = 50; });
  if (!['high','medium','low'].includes(parsed.dataConfidence)) parsed.dataConfidence = 'medium';
  return parsed;
}

// ─── Confidence badge ─────────────────────────────────────────────────────────

const CONF = {
  high:   { label: 'High data',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',  title: 'High data confidence — substantial public information available (press, financials, funding history)' },
  medium: { label: 'Med data',    color: '#D4AF37', bg: 'rgba(212,175,55,0.1)',  border: 'rgba(212,175,55,0.3)', title: 'Medium data confidence — some public data available; unit economics or financials may be limited' },
  low:    { label: 'Low data ⚠',  color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', title: 'Low data confidence — limited public information; early-stage, stealth, or niche company. Use Refine to add proprietary data.' },
};

function ConfBadge({ level }) {
  const c = CONF[level] || CONF.medium;
  return (
    <span className="text-xs px-1.5 py-0.5 rounded-full font-mono cursor-help"
      title={c.title}
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  );
}

// ─── Scatter tooltip ──────────────────────────────────────────────────────────

function ScatterTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const q = quad(d.x, d.y);
  return (
    <div className="glass rounded-xl px-3 py-2.5 border border-white/15 text-xs pointer-events-none"
      style={{ background: 'rgba(10,10,20,0.95)' }}>
      <p className="font-bold text-white mb-0.5">{d.name} {d.isRefined ? '✏' : ''}</p>
      <p className="font-medium mb-1" style={{ color: q.color }}>{q.label}</p>
      <p className="text-white/45">Market Opp  <span className="text-white/75 font-mono">{d.x}</span></p>
      <p className="text-white/45">Execution   <span className="text-white/75 font-mono">{d.y}</span></p>
      <p className="text-white/45">Score       <span className="text-white/75 font-mono">{d.finalScore}</span></p>
      {d.dataConfidence === 'low' && <p className="text-orange-400/70 mt-1.5 text-xs">⚠ Limited public data — consider refining below</p>}
    </div>
  );
}

// ─── Refinement panel ─────────────────────────────────────────────────────────

function RefinementPanel({ company, baseFactors, overrides, stage, onChange }) {
  const factors = getFactors(stage);
  return (
    <div className="mt-2 mb-1 rounded-xl p-4 space-y-3"
      style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-blue-400/70 uppercase tracking-widest">Data Room Override</p>
        <button onClick={() => onChange({})}
          className="text-xs text-white/35 hover:text-white/55 transition-colors">Reset all</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        {factors.map(f => {
          const current = overrides[f.key] ?? baseFactors[f.key];
          const ai = baseFactors[f.key];
          const changed = overrides[f.key] !== undefined && overrides[f.key] !== ai;
          return (
            <div key={f.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className={changed ? 'text-blue-300/80' : 'text-white/50'}>{f.label}</span>
                <span className="font-mono" style={{ color: changed ? '#60a5fa' : 'rgba(255,255,255,0.5)' }}>
                  {current}
                  {changed && <span className="text-white/25 ml-1">← {ai}</span>}
                </span>
              </div>
              <input type="range" min={0} max={100} value={current}
                onChange={e => onChange({ ...overrides, [f.key]: Number(e.target.value) })}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: changed ? '#60a5fa' : 'rgba(255,255,255,0.3)' }} />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-white/28 pt-1">
        Scores update live. Use to incorporate data room figures, founder meeting signals, or proprietary research.
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VCModel({ onBack }) {
  const [stage, setStage]                 = useState('seriesA');
  const [idleMode, setIdleMode]           = useState('choice');
  const [inputCompanies, setInputCompanies] = useState([]);
  const [newName, setNewName]             = useState('');
  const [apiKey, setApiKey]               = useState(() => localStorage.getItem('vc_api_key') || '');
  const [showKey, setShowKey]             = useState(false);

  const [phase, setPhase]                 = useState('idle');
  const [runMode, setRunMode]             = useState(null);
  const [analyzeStep, setAnalyzeStep]     = useState(0);
  const [termLines, setTermLines]         = useState([]);
  const [analyzeError, setAnalyzeError]  = useState(null);
  const [mcProgress, setMcProgress]       = useState(0);
  const [rfDone, setRfDone]               = useState(0);
  const [results, setResults]             = useState(null);

  const [refinements, setRefinements]     = useState({});
  const [expandedRefine, setExpandedRefine] = useState(null);
  const [howOpen, setHowOpen]             = useState(false);
  const [dataRooms, setDataRooms]         = useState({});
  const [expandedDataRoom, setExpandedDataRoom] = useState(null);

  const timerRef   = useRef(null);
  const termRef    = useRef(null);
  const demoEvents = useRef(buildDemoEvents());
  const abortRef   = useRef(false);

  useEffect(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, [analyzeStep, termLines]);

  useEffect(() => {
    if (phase !== 'analyzing' || runMode !== 'demo') return;
    timerRef.current = setInterval(() => {
      setAnalyzeStep(s => {
        if (s + 1 >= demoEvents.current.length) { clearInterval(timerRef.current); setPhase('computing'); return s + 1; }
        return s + 1;
      });
    }, 55);
    return () => clearInterval(timerRef.current);
  }, [phase, runMode]);

  useEffect(() => {
    if (phase !== 'computing') return;
    setMcProgress(0);
    timerRef.current = setInterval(() => {
      setMcProgress(p => { const n = p + 40; if (n >= 2000) { clearInterval(timerRef.current); setRfDone(0); setPhase('rf'); return 2000; } return n; });
    }, 40);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'rf') return;
    let t = 0;
    timerRef.current = setInterval(() => {
      t++; setRfDone(t);
      if (t >= TREE_SUBSETS.length) { clearInterval(timerRef.current); setTimeout(() => setPhase('results'), 600); }
    }, 200);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Live display data — merges base results with data-room refinements
  const displayData = useMemo(() => {
    if (!results) return [];
    const factors = getFactors(stage);
    return results.baseData.map(d => {
      const overrides = refinements[d.name] || {};
      if (Object.keys(overrides).length === 0) return d;
      const merged = { ...d.baseFactors, ...overrides };
      const pt = xy(merged);
      const ws = weightedScore(merged, factors);
      return { ...d, ...pt, finalScore: Math.round(ws * 0.6 + d.rfScore * 0.4), isRefined: true };
    });
  }, [results, refinements, stage]);

  const addLine = useCallback(line => setTermLines(prev => [...prev, line]), []);
  function saveApiKey(k) { setApiKey(k); localStorage.setItem('vc_api_key', k); }
  function addCompany() { const n = newName.trim(); if (!n || inputCompanies.includes(n)) return; setInputCompanies(p => [...p, n]); setNewName(''); }

  function compute(companies) {
    const factors = getFactors(stage);
    const mc = runMC(companies, factors);
    const rf = runRF(companies, factors);
    const fi = getFI(companies, factors);
    return { baseData: companies.map((c, i) => buildPoint(c, mc[i], rf[i])), fi };
  }

  function handleRunDemo() {
    setResults(compute(DEMO));
    setRefinements({});
    setRunMode('demo'); setAnalyzeStep(0); setMcProgress(0); setRfDone(0); setPhase('analyzing');
  }

  async function handleRunManual() {
    if (!apiKey.trim() || inputCompanies.length === 0) return;
    abortRef.current = false;
    setRunMode('manual');
    setTermLines([`$ vc-agent --research --n=${inputCompanies.length} --stage=${stage}`]);
    setAnalyzeError(null); setPhase('analyzing');
    const researched = [];
    for (let i = 0; i < inputCompanies.length; i++) {
      if (abortRef.current) return;
      const name = inputCompanies[i];
      const hasDR = !!dataRooms[name]?.trim();
      addLine(`> [${i + 1}/${inputCompanies.length}] Researching ${name}${hasDR ? ' · data room provided' : ''}...`);
      try {
        const f = await researchCompany(name, apiKey, dataRooms[name] || null);
        addLine(`  marketSize=${f.marketSize}  moat=${f.moat}  team=${f.team}  pmf=${f.pmf}  growth=${f.growth}`);
        addLine(`  unitEcon=${f.unitEcon}  network=${f.network}  tech=${f.tech}  timing=${f.timing}  burn=${f.burn}`);
        addLine(`✓ ${name} — ${f.sector} · data confidence: ${f.dataConfidence}`);
        researched.push({ name, sector: f.sector || 'Unknown', ...f });
      } catch (err) {
        addLine(`✗ ${name} — ${err.message}`);
        setAnalyzeError(err.message); return;
      }
    }
    addLine(''); addLine('> Research complete. Running simulations...');
    setResults(compute(researched)); setRefinements({});
    setMcProgress(0); setRfDone(0); setPhase('computing');
  }

  function handleReset() {
    abortRef.current = true; clearInterval(timerRef.current);
    setPhase('idle'); setRunMode(null); setIdleMode('choice');
    setAnalyzeStep(0); setTermLines([]); setAnalyzeError(null);
    setMcProgress(0); setRfDone(0); setResults(null); setRefinements({}); setExpandedRefine(null);
    setDataRooms({}); setExpandedDataRoom(null);
  }

  const topBar = (
    <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-white/8"
      style={{ background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(20px)' }}>
      <button onClick={onBack} className="text-xs text-white/55 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all">← Portfolio</button>
      <span className="text-xs text-white/25">|</span>
      <span className="text-xs text-white/65 font-medium">Venture Capital Agent</span>
      <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full border font-mono" style={{ borderColor:'#3b82f650',color:'#60a5fa',background:'#3b82f610' }}>Monte Carlo · Random Forest</span>
    </div>
  );

  // ── Stage selector (reused in idle screens) ───────────────────────────────────

  const StageSelector = (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Investment Stage — adjusts factor weights</p>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(STAGE_LABELS).map(([key, { label, hint }]) => (
          <button key={key} onClick={() => setStage(key)}
            className="rounded-xl px-3 py-3 text-left transition-all"
            style={{
              background: stage === key ? 'rgba(196,30,58,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${stage === key ? 'rgba(196,30,58,0.5)' : 'rgba(255,255,255,0.08)'}`,
            }}>
            <p className="text-xs font-semibold" style={{ color: stage === key ? '#ff8fa3' : 'rgba(255,255,255,0.7)' }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: stage === key ? 'rgba(255,143,163,0.6)' : 'rgba(255,255,255,0.3)' }}>{hint}</p>
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-1.5">
        {getFactors(stage).filter(f => f.weight > 0).sort((a,b) => b.weight-a.weight).map(f => (
          <div key={f.key} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <span className="text-xs text-white/55">{f.label}</span>
            <span className="text-xs font-mono font-semibold text-white/75">{Math.round(f.weight * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── How It Works ─────────────────────────────────────────────────────────────

  const HowItWorks = (
    <div>
      <button onClick={() => setHowOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all"
        style={{ background: howOpen ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)' }}>
        <span className="text-sm font-semibold text-white/60">How It Works</span>
        <span className="text-white/30 text-xs">{howOpen ? '▲ Close' : '▼ Expand'}</span>
      </button>

      {howOpen && (
        <div className="mt-3 space-y-4">

          {/* Pipeline */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Analysis Pipeline</p>
            <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
              {[
                { icon: '⚡', label: '12 Factors', sub: 'per company', color: '#60a5fa' },
                { icon: '⚖', label: 'Stage Weights', sub: 'Early / A / Growth', color: '#ff8fa3' },
                { icon: '🔬', label: 'AI Research', sub: 'Claude Haiku', color: '#a78bfa', note: 'research mode' },
                { icon: '∿', label: 'Monte Carlo', sub: '2,000 iter · σ=10', color: '#D4AF37' },
                { icon: '🌲', label: 'Random Forest', sub: '10 trees', color: '#22c55e' },
                { icon: '🏆', label: 'Final Score', sub: 'MC 60% + RF 40%', color: '#f97316' },
              ].map((s, i, arr) => (
                <div key={s.label} className="flex items-center gap-1 shrink-0">
                  <div className="rounded-xl px-2.5 py-2 text-center" style={{ width: 86, background: s.color + '14', border: `1px solid ${s.color}30` }}>
                    <p className="text-sm mb-0.5">{s.icon}</p>
                    <p className="text-xs font-semibold leading-tight" style={{ color: s.color }}>{s.label}</p>
                    <p className="text-xs text-white/28 leading-tight mt-0.5">{s.sub}</p>
                    {s.note && <p className="text-xs text-white/18 italic mt-0.5">{s.note}</p>}
                  </div>
                  {i < arr.length - 1 && <span className="text-white/18 text-sm shrink-0">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 12 Factors + Composite formula */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">12 Factors — {STAGE_LABELS[stage].label}</p>
              <div className="space-y-1.5">
                {getFactors(stage).sort((a, b) => b.weight - a.weight).map(f => {
                  const w = Math.round(f.weight * 100);
                  const barColor = w >= 14 ? '#C41E3A' : w >= 8 ? '#D4AF37' : '#60a5fa';
                  return (
                    <div key={f.key} className="flex items-center gap-2">
                      <span className="text-xs text-white/50 w-28 shrink-0">{f.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/6 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, w * 5)}%`, background: barColor }} />
                      </div>
                      <span className="text-xs font-mono text-white/35 w-6 text-right shrink-0">{w}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {/* Monte Carlo */}
              <div className="glass rounded-2xl p-5 space-y-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Monte Carlo — Uncertainty</p>
                <p className="text-xs text-white/40 leading-relaxed">Each factor sampled 2,000× with Gaussian noise (σ=10). Outputs P10–P90 confidence band around mean score.</p>
                <div className="flex items-end gap-0.5 h-12 mt-2">
                  {[1,2,4,7,11,15,18,15,11,7,4,2,1].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t transition-all"
                      style={{ height: `${h * 3.5}px`, background: i >= 4 && i <= 8 ? 'rgba(212,175,55,0.65)' : 'rgba(212,175,55,0.2)' }} />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-white/22 mt-1">
                  <span>P10</span><span className="text-amber-400/50">Mean</span><span>P90</span>
                </div>
              </div>

              {/* Random Forest */}
              <div className="glass rounded-2xl p-5 space-y-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Random Forest — 10 Trees</p>
                <p className="text-xs text-white/40 leading-relaxed">Each tree uses a random 7-factor subset. Ensemble average reduces single-metric bias.</p>
                <div className="space-y-1 mt-1">
                  {[
                    { t: 'T1', f: 'Mkt · Moat · Team · PMF · Growth · Network · UnitEc', s: 82 },
                    { t: 'T2', f: 'Team · PMF · Tech · Timing · Mkt · Moat · Burn',       s: 79 },
                    { t: 'T3', f: 'Net · PMF · Team · UnitEc · Mkt · Tech · Timing',       s: 85 },
                    { t: '⋯', f: '7 more trees with bootstrapped subsets…',                s: null },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs"
                      style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
                      <span className="font-mono text-green-400/40 w-4 shrink-0">{row.t}</span>
                      <span className="text-white/30 flex-1 truncate">{row.f}</span>
                      {row.s && <span className="font-mono text-green-400/55 shrink-0">{row.s}</span>}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)' }}>
                    <span className="font-mono text-green-400 w-4 shrink-0">avg</span>
                    <span className="text-green-300/55 flex-1">ensemble vote</span>
                    <span className="font-mono font-bold text-green-400">RF Score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Confidence */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Data Confidence Rating</p>
            <p className="text-xs text-white/40 leading-relaxed">In Research mode, Claude evaluates how much credible public information exists for each company and assigns a badge automatically. Low-confidence companies can be overridden with proprietary data room inputs.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(CONF).map(([k, c]) => (
                <div key={k} className="rounded-xl px-4 py-3 space-y-2" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>{c.label}</span>
                  <p className="text-xs text-white/42 leading-relaxed">{c.title.split('—')[1]?.trim()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Score formula */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Final Score Formula</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-4 py-2 rounded-xl text-xs font-mono font-semibold" style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)', color: '#D4AF37' }}>MC Mean × 0.60</div>
              <span className="text-white/30 text-lg">+</span>
              <div className="px-4 py-2 rounded-xl text-xs font-mono font-semibold" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e' }}>RF Score × 0.40</div>
              <span className="text-white/30 text-lg">=</span>
              <div className="px-4 py-2 rounded-xl text-xs font-mono font-semibold" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', color: 'white' }}>Final Score (0–100)</div>
            </div>
            <p className="text-xs text-white/25">Scatter axes: X = Market Opp (TAM 35% · Moat 35% · Network 30%) · Y = Execution (Team 40% · PMF 30% · UnitEcon 30%)</p>
          </div>

        </div>
      )}
    </div>
  );

  // ── Idle: choice ──────────────────────────────────────────────────────────────

  if (phase === 'idle' && idleMode === 'choice') return (
    <div className="min-h-screen bg-premium">
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      {topBar}
      <div className="relative max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-display text-3xl text-white tracking-tight">Venture Capital Agent</h1>
          <p className="text-sm text-white/50 max-w-lg mx-auto">AI research + Monte Carlo simulation + Random Forest across 12 stage-adjusted factors.</p>
          <div className="flex items-center justify-center gap-8 pt-1">
            {[['12','Stage-adj. factors'],['2,000','MC iterations'],['10','RF trees']].map(([v,l]) => (
              <div key={l} className="text-center"><p className="text-xl font-bold font-mono text-white">{v}</p><p className="text-xs text-white/35">{l}</p></div>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-white/28 text-xs">ℹ</span>
            <p className="text-xs text-white/35">Structured sanity check — use alongside founder meetings, data room access, and qualitative judgment.</p>
          </div>
        </div>

        {StageSelector}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass rounded-2xl p-6 flex flex-col gap-4" style={{ borderTop:'2px solid rgba(34,197,94,0.4)' }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Instant
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Live Demo</h3>
              <p className="text-xs text-white/48 leading-relaxed">20 pre-loaded companies with data confidence ratings. No API key needed.</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEMO.slice(0,6).map(c => <span key={c.name} className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/45">{c.name}</span>)}
              <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/30">+{DEMO.length-6} more</span>
            </div>
            <button onClick={handleRunDemo} className="mt-auto w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{ background:'linear-gradient(135deg,rgba(34,197,94,0.25),rgba(34,197,94,0.12))',border:'1px solid rgba(34,197,94,0.35)' }}>
              <span className="flex items-center justify-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Run Live Demo</span>
            </button>
          </div>

          <div className="glass rounded-2xl p-6 flex flex-col gap-4" style={{ borderTop:'2px solid rgba(59,130,246,0.4)' }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400">AI Research</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Research Portfolio</h3>
              <p className="text-xs text-white/48 leading-relaxed">Enter any company names. Claude researches each one, rates data confidence, and estimates all 12 factors. Refine with data room inputs after.</p>
            </div>
            <button onClick={() => setIdleMode('manual')} className="mt-auto w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{ background:'linear-gradient(135deg,rgba(59,130,246,0.25),rgba(59,130,246,0.12))',border:'1px solid rgba(59,130,246,0.35)' }}>
              Set Up Portfolio →
            </button>
          </div>
        </div>

        {HowItWorks}
      </div>
    </div>
  );

  // ── Idle: manual form ─────────────────────────────────────────────────────────

  if (phase === 'idle' && idleMode === 'manual') {
    const canRun = apiKey.trim().length > 10 && inputCompanies.length > 0;
    return (
      <div className="min-h-screen bg-premium">
        <div className="absolute inset-0 bg-glow-red pointer-events-none" />
        {topBar}
        <div className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setIdleMode('choice')} className="text-xs text-white/40 hover:text-white/60 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all">← Back</button>
            <h2 className="font-display text-xl text-white">Research Portfolio</h2>
          </div>

          {StageSelector}

          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/45 uppercase tracking-widest">Anthropic API Key</p>
              {apiKey && <span className="text-xs text-green-400">✓ Saved</span>}
            </div>
            <div className="flex gap-2">
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => saveApiKey(e.target.value)} placeholder="sk-ant-..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white/80 placeholder-white/25 outline-none focus:border-blue-500/50 transition-colors font-mono" />
              <button onClick={() => setShowKey(s => !s)} className="px-3 py-2 rounded-xl border border-white/10 text-xs text-white/38 hover:text-white/60 transition-all">{showKey ? 'Hide' : 'Show'}</button>
            </div>
            <p className="text-xs text-white/28">Stored locally in your browser only. <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-blue-400/65 hover:text-blue-400 underline">Get a key →</a></p>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-white/45 uppercase tracking-widest">Companies</p>
            <div className="flex gap-2">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCompany()}
                placeholder="Company name (press Enter to add)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white/80 placeholder-white/25 outline-none focus:border-blue-500/50 transition-colors" />
              <button onClick={addCompany} disabled={!newName.trim()} className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background:newName.trim()?'rgba(59,130,246,0.2)':'rgba(255,255,255,0.04)', border:`1px solid ${newName.trim()?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.08)'}`, color:newName.trim()?'#60a5fa':'rgba(255,255,255,0.22)' }}>Add</button>
            </div>
            {inputCompanies.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {inputCompanies.map(n => {
                  const isOpen = expandedDataRoom === n;
                  const hasDR  = !!dataRooms[n]?.trim();
                  return (
                    <div key={n}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-xs" style={{ background:'rgba(255,255,255,0.04)' }}>
                        <span className="text-white/72 flex-1 font-medium">{n}</span>
                        {hasDR && <span className="text-amber-400/65 text-xs">✓ data room</span>}
                        <button
                          onClick={() => setExpandedDataRoom(isOpen ? null : n)}
                          className="px-2.5 py-0.5 rounded-lg border text-xs transition-all"
                          style={{ borderColor: isOpen ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.12)', color: isOpen ? '#D4AF37' : 'rgba(255,255,255,0.42)', background: isOpen ? 'rgba(212,175,55,0.10)' : 'transparent' }}>
                          📁 {isOpen ? 'Close' : 'Data Room'}
                        </button>
                        <button onClick={() => setInputCompanies(p => p.filter(x => x !== n))} className="text-white/28 hover:text-white/60 transition-colors leading-none ml-1">×</button>
                      </div>
                      {isOpen && (
                        <div className="mx-0.5 rounded-b-xl px-4 py-3 space-y-2"
                          style={{ background:'rgba(212,175,55,0.04)', border:'1px solid rgba(212,175,55,0.18)', borderTop:'none' }}>
                          <p className="text-xs font-semibold text-amber-400/70">Data Room — {n}</p>
                          <p className="text-xs text-white/35 leading-relaxed">
                            Paste key financial metrics from the data room. Claude will incorporate these into the factor scores and upgrade data confidence to High.
                          </p>
                          <p className="text-xs text-white/25 italic">e.g. ARR, growth rate, burn rate, gross margin, customer count, team size, key KPIs, runway, cap table highlights…</p>
                          <textarea
                            value={dataRooms[n] || ''}
                            onChange={e => setDataRooms(prev => ({ ...prev, [n]: e.target.value }))}
                            placeholder="ARR $12M · growing 180% YoY · gross margin 72% · burn $800k/mo · 45 FTEs · 320 enterprise customers · 18mo runway…"
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 placeholder-white/22 outline-none focus:border-amber-500/40 resize-none transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {inputCompanies.length === 0 && <p className="text-xs text-white/22 italic">Add at least one company to continue.</p>}
          </div>

          {analyzeError && <div className="rounded-xl px-4 py-3 text-xs text-red-400 border border-red-500/25" style={{ background:'rgba(239,68,68,0.08)' }}>{analyzeError}</div>}

          <button onClick={handleRunManual} disabled={!canRun} className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all"
            style={{ background:canRun?'linear-gradient(135deg,#C41E3A,#8B0000)':'rgba(255,255,255,0.05)', boxShadow:canRun?'0 4px 30px rgba(196,30,58,0.4)':'none', color:canRun?'white':'rgba(255,255,255,0.22)', cursor:canRun?'pointer':'not-allowed' }}>
            <span className="flex items-center justify-center gap-2">
              {canRun && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              {canRun ? `Run Agent — ${inputCompanies.length} ${inputCompanies.length===1?'company':'companies'}` : 'Add companies + API key to continue'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── Analyzing ────────────────────────────────────────────────────────────────

  if (phase === 'analyzing') {
    const isDemo = runMode === 'demo';
    const visible = isDemo ? demoEvents.current.slice(0, analyzeStep) : termLines;
    const progress = isDemo ? (analyzeStep / demoEvents.current.length) * 100 : null;
    return (
      <div className="min-h-screen bg-premium">
        <div className="absolute inset-0 bg-glow-red pointer-events-none" />
        {topBar}
        <div className="relative max-w-3xl mx-auto px-4 py-10 space-y-5">
          <div className="text-center">
            <h2 className="font-display text-2xl text-white mb-1">{isDemo ? 'Analyzing Demo Portfolio' : 'Researching Portfolio'}</h2>
            <p className="text-xs text-white/38">{isDemo ? `${DEMO.length} companies · ${STAGE_LABELS[stage].label}` : `Calling Anthropic API · ${inputCompanies.length} companies · ${STAGE_LABELS[stage].label}`}</p>
          </div>
          {isDemo && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/32"><span>{Math.min(Math.floor(analyzeStep/LOG_FNS.length)+1,DEMO.length)} / {DEMO.length}</span><span>{Math.round(progress)}%</span></div>
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden"><div className="h-full rounded-full transition-all duration-75" style={{ width:`${progress}%`,background:'linear-gradient(90deg,#C41E3A,#ff6b6b)' }} /></div>
            </div>
          )}
          <div ref={termRef} className="rounded-2xl p-5 font-mono text-xs leading-relaxed overflow-y-auto"
            style={{ minHeight:420,maxHeight:520,background:'rgba(0,0,0,0.45)',border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-emerald-400/55 mb-3">{isDemo?`$ vc-agent --demo --stage=${stage}`:`$ vc-agent --research --stage=${stage} --n=${inputCompanies.length}`}</div>
            {visible.map((line,i) => (
              <div key={i} className={`mb-0.5 ${line.startsWith('✓')?'text-emerald-400':line.startsWith('✗')?'text-red-400':line.startsWith('  ')?'text-blue-300/65':'text-white/65'}`}>{line}</div>
            ))}
            {!analyzeError && <span className="inline-block w-2 h-3.5 bg-white/55 animate-pulse ml-0.5" />}
            {analyzeError && <div className="mt-4 pt-4 border-t border-red-500/20"><p className="text-red-400 mb-3">Error: {analyzeError}</p><button onClick={handleReset} className="text-xs border border-white/15 hover:border-white/28 px-4 py-2 rounded-full text-white/50 hover:text-white/70 transition-all">← Try Again</button></div>}
          </div>
        </div>
      </div>
    );
  }

  // ── Computing / RF ───────────────────────────────────────────────────────────

  if (phase === 'computing' || phase === 'rf') return (
    <div className="min-h-screen bg-premium">
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      {topBar}
      <div className="relative max-w-2xl mx-auto px-4 py-16 space-y-8">
        <div className="text-center"><h2 className="font-display text-2xl text-white mb-1">Running Simulations</h2><p className="text-xs text-white/38">Quantifying uncertainty and training ensemble model</p></div>
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold text-white/42 uppercase tracking-widest">Monte Carlo</span><span className="text-xs font-mono text-white/65">{mcProgress.toLocaleString()} / 2,000</span></div>
          <div className="h-2 rounded-full bg-white/8 overflow-hidden"><div className="h-full rounded-full transition-all duration-75" style={{ width:`${(mcProgress/2000)*100}%`,background:'linear-gradient(90deg,#C41E3A,#ff6b6b)' }} /></div>
          <p className="text-xs text-white/25">σ = 10 per factor · Box-Muller Gaussian · {mcProgress>=2000?'✓ Complete':'Running...'}</p>
        </div>
        <div className="glass rounded-2xl p-6 space-y-2.5">
          <div className="flex items-center justify-between mb-3"><span className="text-xs font-semibold text-white/42 uppercase tracking-widest">Random Forest</span><span className="text-xs font-mono text-white/65">{rfDone} / {TREE_SUBSETS.length} trees</span></div>
          {TREE_SUBSETS.map((subset,i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={i<rfDone?'text-white/52':'text-white/18'}>Tree {i+1} <span className="text-white/25 font-mono">[{subset.slice(0,3).join(', ')}, …]</span></span>
                <span className={i<rfDone?'text-emerald-400':'text-white/15'}>{i<rfDone?'✓':'○'}</span>
              </div>
              <div className="h-1 rounded-full bg-white/6 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width:i<rfDone?'100%':'0%',background:'linear-gradient(90deg,#3b82f6,#60a5fa)' }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Results ──────────────────────────────────────────────────────────────────

  if (phase === 'results' && results) {
    const sorted = [...displayData].sort((a,b) => b.finalScore - a.finalScore);
    const lowDataCount = displayData.filter(d => d.dataConfidence === 'low').length;

    return (
      <div className="min-h-screen bg-premium pb-12">
        <div className="absolute inset-0 bg-glow-red pointer-events-none" />
        <div className="absolute inset-0 bg-glow-gold pointer-events-none" />
        {topBar}
        <div className="relative max-w-5xl mx-auto px-4 py-10 space-y-7">

          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl text-white">Analysis Complete</h2>
              <p className="text-xs text-white/38 mt-1">{displayData.length} companies · {STAGE_LABELS[stage].label} · 2,000 MC iterations · 10-tree RF</p>
            </div>
            <button onClick={handleReset} className="text-xs text-white/35 hover:text-white/55 border border-white/10 hover:border-white/20 px-4 py-2 rounded-full transition-all">↺ Reset</button>
          </div>

          {/* Sanity check note */}
          <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.18)' }}>
            <span className="text-blue-400/70 mt-0.5 shrink-0">ℹ</span>
            <div>
              <p className="text-xs text-blue-300/75 font-medium mb-0.5">Structured framework — not a standalone investment decision</p>
              <p className="text-xs text-white/38 leading-relaxed">
                Use to structure diligence conversations and surface relative strengths. Always combine with founder meetings, data room access, reference checks, and qualitative team assessment.
                {lowDataCount > 0 && ` ${lowDataCount} company${lowDataCount>1?'ies':''} flagged ⚠ low data — refine with proprietary inputs below.`}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2.5">
            {[{label:'Champion',color:'#22c55e',desc:'High market + high execution'},{label:"Operator's Bet",color:'#60a5fa',desc:'Strong execution, smaller market'},{label:'Market Bet',color:'#D4AF37',desc:'Large market, execution TBD'},{label:'Pass',color:'#ef4444',desc:'Caution on both dimensions'}].map(q => (
              <div key={q.label} className="flex items-center gap-2 glass rounded-full px-3 py-1.5 border border-white/8 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background:q.color }} />
                <span className="text-white/62 font-medium">{q.label}</span>
                <span className="text-white/25 hidden sm:inline">— {q.desc}</span>
              </div>
            ))}
          </div>

          {/* Scatter */}
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-1">Portfolio Map</p>
            <p className="text-xs text-white/25 mb-5">X = Market Opp (TAM · Moat · Network) · Y = Execution (Team · PMF · Unit Econ) · Hover for details · ✏ = data room refined</p>
            <ResponsiveContainer width="100%" height={420}>
              <ScatterChart margin={{ top:10,right:40,bottom:30,left:10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" dataKey="x" domain={[55,100]} stroke="rgba(255,255,255,0.1)" tick={{ fill:'rgba(255,255,255,0.28)',fontSize:11 }} label={{ value:'Market Opportunity →',position:'insideBottom',fill:'rgba(255,255,255,0.2)',fontSize:11,offset:-15 }} />
                <YAxis type="number" dataKey="y" domain={[55,100]} stroke="rgba(255,255,255,0.1)" tick={{ fill:'rgba(255,255,255,0.28)',fontSize:11 }} label={{ value:'Execution Quality →',angle:-90,position:'insideLeft',fill:'rgba(255,255,255,0.2)',fontSize:11,dy:70 }} />
                <ReferenceArea x1={THRESHOLD} x2={100} y1={THRESHOLD} y2={100} fill="rgba(34,197,94,0.05)"  stroke="none" />
                <ReferenceArea x1={55} x2={THRESHOLD} y1={THRESHOLD} y2={100} fill="rgba(96,165,250,0.05)"  stroke="none" />
                <ReferenceArea x1={THRESHOLD} x2={100} y1={55} y2={THRESHOLD} fill="rgba(212,175,55,0.05)" stroke="none" />
                <ReferenceArea x1={55} x2={THRESHOLD} y1={55} y2={THRESHOLD} fill="rgba(239,68,68,0.05)"   stroke="none" />
                <ReferenceLine x={THRESHOLD} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <ReferenceLine y={THRESHOLD} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <Tooltip content={<ScatterTip />} cursor={{ strokeDasharray:'3 3',stroke:'rgba(255,255,255,0.12)' }} />
                <Scatter data={displayData}
                  shape={({ cx,cy,payload }) => {
                    const q = quad(payload.x,payload.y);
                    return <circle cx={cx} cy={cy} r={payload.isRefined?7:6} fill={q.color} fillOpacity={0.85} stroke={payload.isRefined?'white':q.color} strokeWidth={payload.isRefined?1.5:1} strokeOpacity={0.4} />;
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Ranked list + Feature importance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-4">Ranked — MC + RF Composite</p>
              <div className="space-y-1">
                {sorted.map((c,i) => {
                  const q = quad(c.x,c.y);
                  const isOpen = expandedRefine === c.name;
                  return (
                    <div key={c.name}>
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-white/4 transition-colors"
                        style={{ background:isOpen?'rgba(59,130,246,0.06)':'rgba(255,255,255,0.025)' }}>
                        <span className="text-xs font-mono text-white/22 w-5 text-right shrink-0">{i+1}</span>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background:q.color }} />
                        <span className="text-xs font-semibold text-white/80 flex-1 truncate">
                          {c.name} {c.isRefined && <span className="text-blue-400/60 font-normal">✏</span>}
                        </span>
                        <ConfBadge level={c.dataConfidence} />
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold" style={{ color:q.color }}>{c.finalScore}</span>
                          <span className="text-xs text-white/20 font-mono ml-1">[{c.mcP10?.toFixed(0)}–{c.mcP90?.toFixed(0)}]</span>
                        </div>
                        <button onClick={() => setExpandedRefine(isOpen ? null : c.name)}
                          className="text-xs px-2 py-1 rounded-lg border transition-all shrink-0"
                          style={{ borderColor:isOpen?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.1)', color:isOpen?'#60a5fa':'rgba(255,255,255,0.35)', background:isOpen?'rgba(59,130,246,0.1)':'transparent' }}>
                          {isOpen ? 'Close' : 'Refine'}
                        </button>
                      </div>
                      {isOpen && (
                        <RefinementPanel
                          company={c.name}
                          baseFactors={c.baseFactors}
                          overrides={refinements[c.name] || {}}
                          stage={stage}
                          onChange={overrides => setRefinements(prev => ({ ...prev, [c.name]: overrides }))}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-4">Feature Importance</p>
              <div className="space-y-3">
                {results.fi.map(f => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-white/55">{f.label}</span><span className="font-mono text-white/65">{f.imp}%</span></div>
                    <div className="h-1.5 rounded-full bg-white/8 overflow-hidden"><div className="h-full rounded-full" style={{ width:`${f.imp}%`,background:'linear-gradient(90deg,#C41E3A,#ff6b6b)' }} /></div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/8 space-y-2">
                <p className="text-xs font-semibold text-white/35 uppercase tracking-widest">Data Confidence</p>
                {[['high','High','#22c55e'],['medium','Medium','#D4AF37'],['low','Low ⚠','#f97316']].map(([k,l,c]) => {
                  const count = displayData.filter(d => d.dataConfidence === k).length;
                  return count > 0 ? (
                    <p key={k} className="text-xs" style={{ color:c }}>{count} {count===1?'company':'companies'} — {l} data quality{k==='low'?' · use Refine to override':''}</p>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
