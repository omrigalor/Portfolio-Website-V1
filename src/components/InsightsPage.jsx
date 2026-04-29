import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

// ─── Religion data — computed from actual CPS data ────────────────────────────
// Stability score = round(100 × (1 − divorce_rate / 0.15))
// Pairing prob = share of marriages of this anchor religion with this partner (Pew Research 2015)
const CHRISTIAN_PARTNER_DATA = [
  { partner: 'Hindu',       score: 85, pairProb: 0.005, note: 'n=130 · divorce 2.3%',     color: '#22c55e' },
  { partner: 'No Religion', score: 80, pairProb: 0.080, note: 'n=165 · divorce 3.0%',     color: '#22c55e' },
  { partner: 'Jewish',      score: 75, pairProb: 0.020, note: 'n=54  · divorce 3.7%',     color: '#22c55e' },
  { partner: 'Muslim',      score: 67, pairProb: 0.010, note: 'n=367 · divorce 4.9%',     color: '#84cc16' },
  { partner: 'Christian',   score: 57, pairProb: 0.790, note: 'n=62,995 · divorce 6.4%',  color: '#f59e0b' },
  { partner: 'Buddhist',    score: 41, pairProb: 0.005, note: 'n=284 · divorce 8.9%',     color: '#ef4444' },
];

const JEWISH_PARTNER_DATA = [
  { partner: 'Jewish',   score: 100, pairProb: 0.440, note: 'n=15 · divorce 0.0% (small sample)', color: '#22c55e' },
  { partner: 'Christian',score:  75, pairProb: 0.510, note: 'n=54 · divorce 3.7%',                color: '#22c55e' },
  { partner: 'Muslim',   score: 100, pairProb: 0.050, note: 'n=5  · divorce 0.0% (very small)',   color: '#22c55e' },
];

const MUSLIM_PARTNER_DATA = [
  { partner: 'Muslim',    score: 72, pairProb: 0.720, note: 'n=192 · divorce 4.2%', color: '#22c55e' },
  { partner: 'Christian', score: 67, pairProb: 0.250, note: 'n=367 · divorce 4.9%', color: '#84cc16' },
];

// Compute market-adjusted scores: stability × (pairProb / maxPairProb), normalised to 0–100
function computeAdjusted(data) {
  const raw = data.map(d => ({ ...d, adj: d.score * d.pairProb }));
  const maxAdj = Math.max(...raw.map(d => d.adj));
  return raw.map(d => ({ ...d, adjustedScore: Math.round(100 * d.adj / maxAdj) }));
}

// ─── Age FE from CPS regression (3-pt smoothed to remove estimation noise) ────
const AGE_FE = {
  18: 0.1280, 19: 0.1170, 20: 0.0717, 21: 0.0230, 22: -0.0060,
  23:-0.0147, 24:-0.0217, 25:-0.0377, 26:-0.0283, 27:-0.0333,
  28:-0.0377, 29:-0.0323, 30: 0.0010, 31: 0.0373, 32: 0.0457,
  33: 0.0463, 34: 0.0410, 35: 0.0427,
};
// Extrapolate for 36–65: slight upward trend from 35
function getAgeFE(age) {
  if (age <= 35) return AGE_FE[Math.round(age)] ?? 0.043;
  return 0.043 + (age - 35) * 0.001;
}

// Stability for a pairing = base stability (from FE) - age-gap penalty
// Gap penalty: 0 for gaps ≤ 3 yrs, +3pts per year beyond that
function pairingStability(myAge, partnerAge) {
  const partnerFE = getAgeFE(partnerAge);
  const baseStability = Math.max(20, Math.min(90, 70 - partnerFE * 250));
  const gap = Math.abs(myAge - partnerAge);
  const gapPenalty = Math.max(0, (gap - 3) * 2.5);
  return Math.round(Math.max(5, baseStability - gapPenalty));
}

function getOptimalPartnerAge(myAge) {
  let best = { age: myAge, score: -1, gap: Infinity };
  for (let age = 18; age <= 65; age++) {
    const score = pairingStability(myAge, age);
    const gap   = Math.abs(myAge - age);
    if (score > best.score || (score === best.score && gap < best.gap)) {
      best = { age, score, gap };
    }
  }
  return best.age;
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg p-3 text-xs border border-white/10 space-y-1 shadow-xl">
      <p className="text-white/70 font-semibold mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.fill ?? '#fff' }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

// ─── Religion section ──────────────────────────────────────────────────────────
function ReligionSection() {
  const [myReligion, setMyReligion] = useState('Christian');

  const anchors = {
    Christian: { data: CHRISTIAN_PARTNER_DATA, note: null },
    Jewish:    { data: JEWISH_PARTNER_DATA,    note: 'Jewish anchor uses Israeli-ancestry CPS subset (n=80 couples). Small samples — treat as directional.' },
    Muslim:    { data: MUSLIM_PARTNER_DATA,    note: 'Muslim anchor: only same-Muslim and Muslim×Christian have n≥30. Other pairings excluded.' },
  };

  const adjData = computeAdjusted(anchors[myReligion].data);

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Religious Compatibility</h2>
        <p className="text-xs text-white/65 mt-1">
          Which partner religion leads to the most stable relationship? Combines actual divorce rates with how likely each pairing is to form in the real world.
        </p>
      </div>

      {/* Anchor selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/65">I am:</span>
        {Object.keys(anchors).map(r => (
          <button key={r} onClick={() => setMyReligion(r)}
            className="text-xs px-3 py-1.5 rounded-full border transition-all"
            style={{
              borderColor: myReligion === r ? '#C41E3A' : 'rgba(255,255,255,0.15)',
              background:  myReligion === r ? 'rgba(196,30,58,0.15)' : 'transparent',
              color:       myReligion === r ? '#C41E3A' : 'rgba(255,255,255,0.65)',
            }}>
            {r}
          </button>
        ))}
      </div>

      {anchors[myReligion].note && (
        <div className="glass rounded-xl px-4 py-3 border border-yellow-500/20">
          <p className="text-xs text-yellow-400/80">{anchors[myReligion].note}</p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={adjData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="partner" tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<Tip />} formatter={v => `${v}/100`} />
          <Bar dataKey="adjustedScore" name="Compatibility score" radius={[5, 5, 0, 0]} label={{ position: 'top', fill: 'rgba(255,255,255,0.6)', fontSize: 11, formatter: v => v }}>
            {adjData.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-white/45">
        Score = stability × likelihood this pairing forms (Pew Research, 2015). Same-faith dominates because it is both stable and common. Interfaith pairs that do form can be very stable — but they're rare.
      </p>
    </div>
  );
}

// ─── Age section ──────────────────────────────────────────────────────────────
function AgeSection() {
  const [myAge, setMyAge] = useState(28);
  const optAge = getOptimalPartnerAge(myAge);
  const myFE   = getAgeFE(myAge);
  const myRiskLabel = myFE < -0.02 ? 'Low' : myFE < 0.02 ? 'Average' : 'Elevated';
  const myRiskColor = myFE < -0.02 ? '#22c55e' : myFE < 0.02 ? '#f59e0b' : '#ef4444';

  // Generate partner age chart 18–60
  const chartData = Array.from({ length: 43 }, (_, i) => {
    const age = i + 18;
    return { age, stability: pairingStability(myAge, age) };
  });

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Age Compatibility</h2>
        <p className="text-xs text-white/65 mt-1">
          Move the slider to your age. The chart shows how stable each partner age would be for you — combining their stability profile with the age gap between you.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-white/65 shrink-0">My age:</span>
        <input type="range" min="18" max="65" value={myAge}
          onChange={e => setMyAge(Number(e.target.value))}
          className="flex-1 accent-red-600" />
        <span className="text-2xl font-bold font-mono text-white w-10 text-center">{myAge}</span>
      </div>

      {/* Insight row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono" style={{ color: myRiskColor }}>{myRiskLabel}</p>
          <p className="text-xs text-white/58 mt-1">Your age group's<br/>stability profile</p>
        </div>
        <div className="glass rounded-xl p-4 text-center border border-green-500/25">
          <p className="text-2xl font-bold font-mono text-green-400">{Math.abs(myAge - optAge)} yrs</p>
          <p className="text-xs text-white/58 mt-1">Ideal age gap<br/>for you</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono text-white">{optAge}</p>
          <p className="text-xs text-white/58 mt-1">Optimal partner age<br/>specifically</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-white/58 mb-3">Partner age vs combined relationship stability (your age = {myAge})</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="age" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 9 }}
              tickFormatter={v => v % 5 === 0 ? v : ''} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 95]} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} formatter={v => `${v}/100`} />
            <ReferenceLine x={optAge} stroke="#D4AF37" strokeDasharray="4 2"
              label={{ value: `Best: ${optAge}`, position: 'top', fill: '#D4AF37', fontSize: 10 }} />
            <Bar dataKey="stability" name="Stability" radius={[2, 2, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.stability >= 65 ? '#22c55e' : d.stability >= 45 ? '#f59e0b' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-white/45">Combines CPS age fixed effects (ages 18–35, extrapolated beyond) with an age-gap penalty — large gaps reduce stability regardless of the partner's individual risk profile.</p>
    </div>
  );
}

// ─── Cultural distance section ────────────────────────────────────────────────
function CulturalSection() {
  const examples = [
    { pair: 'French × German',          dist: 'Very close',  score: 71, color: '#22c55e' },
    { pair: 'British × American',       dist: 'Close',       score: 73, color: '#22c55e' },
    { pair: 'Italian × Mexican',        dist: 'Moderate',    score: 74, color: '#22c55e' },
    { pair: 'German × Indian',          dist: 'Far',         score: 55, color: '#f59e0b' },
    { pair: 'Japanese × Nigerian',      dist: 'Very far',    score: 35, color: '#ef4444' },
  ];

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Cultural Background Distance</h2>
        <p className="text-xs text-white/65 mt-1">
          Partners with some cultural differences — but not extreme ones — consistently produce the most stable long-term relationships. This holds across 22,000+ couples and is statistically robust.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-white">−56%</p>
          <p className="text-xs text-white/65 mt-2">Lower breakup rate at the sweet spot compared to couples from the same background</p>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-white">−62%</p>
          <p className="text-xs text-white/65 mt-2">Lower breakup rate at the sweet spot compared to couples from very different backgrounds</p>
        </div>
      </div>

      <div className="space-y-2">
        {examples.map(e => (
          <div key={e.pair} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
            <span className="text-sm text-white font-medium w-48 shrink-0">{e.pair}</span>
            <span className="text-xs text-white/58 w-20 shrink-0">{e.dist}</span>
            <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${e.score}%`, background: e.color }} />
            </div>
            <span className="text-sm font-bold font-mono text-white w-8 text-right">{e.score}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/45">Based on Reprium's regression on 22,091 cross-national couples. Effect significant at p≤0.002 (inverted-U test).</p>
    </div>
  );
}

// ─── Who Marries Whom ─────────────────────────────────────────────────────────
// Stability scores: approximate relationship longevity for a typical pair from each
// continental pairing, derived from the Reprium separation regression at representative ψ values.
function computeMarriageAdj(data) {
  const raw = data.map(d => ({ ...d, adj: (d.pct / 100) * d.stability }));
  const maxAdj = Math.max(...raw.map(d => d.adj));
  return raw.map(d => ({ ...d, adjScore: Math.round(100 * d.adj / maxAdj) }));
}

function MarriageSection() {
  const [focus, setFocus] = useState('EU');

  const DATA = {
    EU: { label: 'European', data: [
      { region: 'European',    pct: 77.6, stability: 71, color: '#60a5fa' },
      { region: 'American',    pct: 17.2, stability: 74, color: '#a78bfa' },
      { region: 'Asian',       pct:  2.7, stability: 55, color: '#f59e0b' },
      { region: 'Middle East', pct:  1.8, stability: 63, color: '#fb923c' },
      { region: 'African',     pct:  0.4, stability: 42, color: '#ef4444' },
    ]},
    AM: { label: 'American', data: [
      { region: 'American',    pct: 69.7, stability: 73, color: '#60a5fa' },
      { region: 'European',    pct: 24.7, stability: 74, color: '#a78bfa' },
      { region: 'Asian',       pct:  4.0, stability: 59, color: '#f59e0b' },
      { region: 'Middle East', pct:  0.9, stability: 64, color: '#fb923c' },
      { region: 'African',     pct:  0.6, stability: 52, color: '#ef4444' },
    ]},
    AS: { label: 'Asian', data: [
      { region: 'Asian',       pct: 77.2, stability: 72, color: '#60a5fa' },
      { region: 'American',    pct: 10.8, stability: 59, color: '#a78bfa' },
      { region: 'European',    pct: 10.5, stability: 55, color: '#f59e0b' },
      { region: 'Middle East', pct:  0.7, stability: 60, color: '#fb923c' },
      { region: 'African',     pct:  0.6, stability: 46, color: '#ef4444' },
    ]},
    ME: { label: 'Middle Eastern', data: [
      { region: 'European',    pct: 41.5, stability: 63, color: '#a78bfa' },
      { region: 'Middle East', pct: 41.2, stability: 67, color: '#60a5fa' },
      { region: 'American',    pct: 13.3, stability: 64, color: '#f59e0b' },
      { region: 'Asian',       pct:  4.0, stability: 60, color: '#fb923c' },
    ]},
    AF: { label: 'African', data: [
      { region: 'African',     pct: 50.2, stability: 68, color: '#60a5fa' },
      { region: 'American',    pct: 21.9, stability: 52, color: '#a78bfa' },
      { region: 'European',    pct: 19.1, stability: 42, color: '#f59e0b' },
      { region: 'Asian',       pct:  8.4, stability: 46, color: '#fb923c' },
    ]},
  };

  const selected = DATA[focus];
  const adjData  = computeMarriageAdj(selected.data);

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Who Marries Whom?</h2>
        <p className="text-xs text-white/65 mt-1">
          Combined score: how likely this pairing is to form × how stable it tends to be. Same-region pairings dominate because they're both common and stable.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/65">I am:</span>
        {Object.entries(DATA).map(([key, val]) => (
          <button key={key} onClick={() => setFocus(key)}
            className="text-xs px-3 py-1.5 rounded-full border transition-all"
            style={{
              borderColor: focus === key ? '#C41E3A' : 'rgba(255,255,255,0.15)',
              background:  focus === key ? 'rgba(196,30,58,0.15)' : 'transparent',
              color:       focus === key ? '#C41E3A' : 'rgba(255,255,255,0.65)',
            }}>
            {val.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={adjData} layout="vertical" margin={{ top: 0, right: 50, left: 90, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="region" tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<Tip />} formatter={v => `${v}/100`} />
          <Bar dataKey="adjScore" name="Combined score" radius={[0, 4, 4, 0]}
            label={{ position: 'right', fill: 'rgba(255,255,255,0.60)', fontSize: 11, formatter: v => v }}>
            {adjData.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-white/45">
        Pairing probability from CPS married sample (n=839,575 couples, 1994–2023). Stability from Reprium regression at representative ψ values per continental pair.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InsightsPage({ onExit, hideBack = false }) {
  return (
    <div className="min-h-screen bg-premium">
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      <div className="absolute inset-0 bg-glow-gold pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-700/20 border border-red-700/40 flex items-center justify-center">
              <span className="text-xs font-bold text-red-400">R</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-white">Reprium</h1>
              <p className="text-xs text-white/58">Data Insights</p>
            </div>
          </div>
          {!hideBack && (
            <button onClick={onExit} className="text-xs text-white/65 hover:text-white/85 border border-white/10 hover:border-white/25 px-4 py-2 rounded-full transition-all">← Back</button>
          )}
        </div>

        <div className="text-center mb-10">
          <h2 className="font-display text-3xl text-white mb-2">What the Data Shows</h2>
          <p className="text-sm text-white/65 max-w-xl mx-auto">Explore what 30 years of marriage data tells us about age, religion, cultural background, and who ends up together.</p>
        </div>

        <div className="space-y-8">
          <CulturalSection />
          <ReligionSection />
          <AgeSection />
          <MarriageSection />
        </div>

        <div className="mt-8 glass rounded-2xl p-5 text-center">
          <p className="text-xs text-white/45 leading-relaxed">
            All figures derived from CPS micro-data (n=839,575 couples, 1994–2023) and Reprium's published regressions on 22,091 cross-national couples.
          </p>
        </div>
      </div>
    </div>
  );
}
