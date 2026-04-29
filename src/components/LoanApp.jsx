import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceDot, Area, AreaChart,
} from 'recharts';
import { computeLoanScore, generateLoanCurve, AVERAGE_DEFAULT } from '../lib/loan.js';
import { COUNTRIES } from '../data/countries.js';

const ACCENT = '#D4AF37';
const CURVE_DATA = generateLoanCurve();

function CountrySelect({ value, onChange, placeholder = 'Select country…' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);
  const [style, setStyle] = useState({});
  const triggerRef = useRef(null);
  const dropRef    = useRef(null);

  const selected = COUNTRIES.find(c => c.isoCode === value);
  const filtered = query.length === 0 ? COUNTRIES
    : COUNTRIES.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.isoCode.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handler = (e) => {
      if (!triggerRef.current?.contains(e.target) && !dropRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleOpen() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setStyle({ position: 'fixed', top: r.bottom + 4, left: r.left, width: r.width, zIndex: 99999 });
    }
    setOpen(o => !o);
    setQuery('');
  }

  const dropdown = open && (
    <div ref={dropRef} style={style} className="bg-slate-900 border border-white/15 rounded-lg shadow-2xl overflow-hidden">
      <div className="p-2 border-b border-white/10">
        <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Type to search…" className="w-full bg-white/5 rounded px-3 py-1.5 text-sm text-white placeholder-white/30 outline-none" />
      </div>
      <div className="overflow-y-auto max-h-52">
        {value && <div className="px-4 py-2 text-xs text-white/45 hover:bg-white/5 cursor-pointer"
          onClick={() => { onChange(''); setOpen(false); }}>— Clear —</div>}
        {filtered.map(c => (
          <div key={c.isoCode} onClick={() => { onChange(c.isoCode); setOpen(false); setQuery(''); }}
            className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-white/5 ${c.isoCode === value ? 'text-white' : 'text-white/70'}`}>
            <span>{c.label}</span>
            <span className="text-white/45 text-xs">{c.region}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div ref={triggerRef} onClick={handleOpen}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white cursor-pointer flex items-center justify-between gap-2 hover:border-white/20 transition-colors">
        <span className={selected ? 'text-white' : 'text-white/38'}>{selected ? `${selected.label} — ${selected.region}` : placeholder}</span>
        <span className="text-white/45 text-xs">{open ? '▲' : '▼'}</span>
      </div>
      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg p-3 text-xs border border-white/10 space-y-1">
      <p className="text-white/60 mb-1">ψ = {label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color ?? p.stroke ?? '#fff' }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>)}
    </div>
  );
};

function Results({ result }) {
  const { psi, pDefault, deltaVsAvg, creditScore, riskTier, riskColor, optPsi } = result;
  const couplePoint = CURVE_DATA.find(d => Math.abs(d.psi - psi) < 0.015) ?? { psi, default: pDefault * 100 };
  const avgPct = (AVERAGE_DEFAULT * 100).toFixed(1);
  const deltaPct = (Math.abs(deltaVsAvg) * 100).toFixed(1);
  const deltaColor = deltaVsAvg <= 0 ? '#22c55e' : '#ef4444';
  const deltaLabel = deltaVsAvg <= 0 ? `${deltaPct}% below average` : `${deltaPct}% above average`;

  return (
    <div className="space-y-6 mt-8">
      {/* Top KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-strong rounded-2xl p-5 text-center border" style={{ borderColor: ACCENT + '40' }}>
          <p className="text-4xl font-bold font-mono" style={{ color: riskColor }}>{(pDefault * 100).toFixed(1)}%</p>
          <p className="text-xs text-white/70 mt-1">Default Probability</p>
          <p className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block font-medium"
            style={{ background: riskColor + '20', color: riskColor, border: `1px solid ${riskColor}40` }}>
            {riskTier}
          </p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-4xl font-bold font-mono text-white">{avgPct}%</p>
          <p className="text-xs text-white/70 mt-1">Population Average</p>
          <p className="text-xs text-white/45">at mean parental ψ ≈ 0.15</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-4xl font-bold font-mono" style={{ color: deltaColor }}>
            {deltaVsAvg <= 0 ? '−' : '+'}{deltaPct}%
          </p>
          <p className="text-xs text-white/70 mt-1">vs. Average</p>
          <p className="text-xs mt-0.5" style={{ color: deltaColor }}>{deltaLabel}</p>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Default Risk Profile</h3>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/60">Credit Safety Score (lower default = higher score)</span>
            <span className="font-mono text-white">{creditScore}/100</span>
          </div>
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${creditScore}%`, background: '#22c55e' }} />
          </div>
          <p className="text-xs text-white/38 mt-0.5">ACS: P(low-income) = 0.254 − 0.434·ψ + 1.740·ψ²  · ψ*=0.125 · n=843,228</p>
        </div>
      </div>

      {/* Default probability curve */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-1">Default Probability vs Parental Cultural Distance</h3>
        <p className="text-xs text-white/50 mb-4">P(default) = 0.254 − 0.434·ψ + 1.740·ψ² · ACS n=843,228 · ψ*=0.125</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={CURVE_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C41E3A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#C41E3A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="psi" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={v => v.toFixed(2)} />
            <YAxis domain={[15, 45]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={v => v + '%'} />
            <Tooltip content={<Tip />} />
            <ReferenceLine x={parseFloat(optPsi.toFixed(2))} stroke={ACCENT} strokeDasharray="4 3"
              label={{ value: `ψ*=${optPsi}`, position: 'top', fill: ACCENT, fontSize: 10 }} />
            <ReferenceLine y={parseFloat((AVERAGE_DEFAULT * 100).toFixed(1))} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3"
              label={{ value: 'Avg', position: 'right', fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} />
            <Area type="monotone" dataKey="default" name="Default %" stroke="#C41E3A" strokeWidth={2.5} fill="url(#loanGrad)" dot={false} />
            <ReferenceDot x={parseFloat(psi.toFixed(2))} y={parseFloat((pDefault * 100).toFixed(1))} r={6} fill="#C41E3A" stroke="white" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Methodology */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Statistical Methodology</h3>
        <div className="space-y-2 text-xs text-white/70 leading-relaxed">
          <p><strong className="text-white/70">Data:</strong> ACS 5-year 2010 micro-data (n=843,228 individuals with both parents' ancestries identified by ISO country code).</p>
          <p><strong className="text-white/70">Cultural distance ψ:</strong> Pre-historic migratory distance between parental homelands, normalised to [0,1] (Pemberton et al. 2013).</p>
          <p><strong className="text-white/70">Default proxy:</strong> P(income below 25th percentile), regressed on ψ and ψ² via OLS with age, sex, and year fixed effects. Individual-level variables like loan amount, income, and age are deliberately excluded from the output — income is endogenous to ψ (itself predicted by the earnings model), and other factors introduce confounders not fully observed. The output is the pure ψ → default channel.</p>
          <p><strong className="text-white/70">Inverted-U mechanism:</strong> Intermediate parental diversity (ψ*≈0.125) balances cognitive focus and earnings capacity — minimising financial distress probability. Homogeneous parents produce focused but narrower earners; very diverse parents produce flexible but financially more volatile children.</p>
        </div>
      </div>

      {/* Effect size */}
      <div className="glass rounded-2xl p-5 border-l-4" style={{ borderLeftColor: ACCENT }}>
        <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">Effect Size — From Data</p>
        <p className="text-sm text-white/55 leading-relaxed">
          Moving from the least optimal parental diversity (ψ=0.45, default rate <strong className="text-white">41.1%</strong>) to optimal (ψ*=0.125, default rate <strong className="text-white">22.7%</strong>) reduces default probability by <strong className="text-white">18.4 percentage points — a 45% reduction</strong>. Predicted income simultaneously rises from $32k to $55k (+72%) at the optimum.
        </p>
        <p className="text-xs text-white/38 mt-2">Source: ACS 5yr 2010 micro-data, OLS regression on parental migratory distance (n=843,228).</p>
      </div>
    </div>
  );
}

export default function LoanApp({ onBack }) {
  const [parent1, setParent1] = useState('GBR');
  const [parent2, setParent2] = useState('FRA');
  const [result, setResult]   = useState(null);

  const isValid = parent1 && parent2;
  const live = isValid ? computeLoanScore({ parent1, parent2 }) : null;

  const handleCompute = () => {
    setResult(computeLoanScore({ parent1, parent2 }));
    setTimeout(() => document.getElementById('loan-results')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="min-h-screen pb-8" style={{ background: '#080600' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(212,175,55,0.10), transparent)` }} />

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', color: ACCENT }}>L</div>
            <div>
              <h1 className="font-display text-xl font-semibold text-white">Loan Default Model</h1>
              <p className="text-xs text-white/45">US 12,041,876 B2 · Patent</p>
            </div>
          </div>
          {onBack && (
            <button onClick={onBack} className="text-xs text-white/58 hover:text-white/70 border border-white/10 hover:border-white/20 px-4 py-2 rounded-full transition-colors">
              ← Portfolio
            </button>
          )}
        </div>

        <div className="text-center mb-10 space-y-3">
          <h2 className="font-display text-3xl text-white">Intra-Ancestral Divergence Model</h2>
          <p className="text-sm text-white/58 max-w-lg mx-auto leading-relaxed">
            Predicts loan default probability from the borrower's parental cultural distance. Intermediate parental diversity minimises default risk — the inverted-U pattern established across the full Reprium research programme.
          </p>
          <div className="flex items-center justify-center gap-8 pt-2">
            {[
              { v: 'ψ*=0.125', l: 'Optimal parental distance' },
              { v: '−45%', l: 'Default at ψ* vs worst' },
              { v: 'n=843k', l: 'ACS 2010 sample' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <p className="text-lg font-bold font-mono" style={{ color: ACCENT }}>{s.v}</p>
                <p className="text-xs text-white/50">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Input — parental origins only */}
        <div className="glass rounded-2xl p-6 space-y-5" style={{ borderTop: `2px solid ${ACCENT}40` }}>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Borrower's Parental Origins</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs text-white/58 font-medium">Parent 1 — Country of Origin</label>
              <CountrySelect value={parent1} onChange={setParent1} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/58 font-medium">Parent 2 — Country of Origin</label>
              <CountrySelect value={parent2} onChange={setParent2} />
            </div>
          </div>

          {live && (
            <div className="flex items-center justify-between glass rounded-xl px-5 py-3">
              <div>
                <p className="text-xs text-white/58">Parental Cultural Distance</p>
                <p className="text-2xl font-bold font-mono text-white">{live.psi.toFixed(3)} <span className="text-sm text-white/45">ψ</span></p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/58">Default Probability</p>
                <p className="text-xl font-bold font-mono" style={{ color: live.riskColor }}>{(live.pDefault * 100).toFixed(1)}%</p>
              </div>
              <button onClick={handleCompute} disabled={!isValid}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, #92400e)`, boxShadow: `0 4px 20px rgba(212,175,55,0.35)` }}>
                Compute Score →
              </button>
            </div>
          )}
        </div>

        {result && <div id="loan-results"><Results result={result} /></div>}
      </div>
    </div>
  );
}
