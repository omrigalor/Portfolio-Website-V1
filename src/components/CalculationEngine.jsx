import { SeparationRiskMini } from './CurveVisualizer';

const fmt = (n, dec = 4) => (n >= 0 ? '+' : '') + n.toFixed(dec);
const fmtNoPlus = (n, dec = 4) => n.toFixed(dec);

export default function CalculationEngine({ result, revealStep = 20 }) {
  if (!result) return null;

  const {
    psi, psi2, alpha, betaPsi, betaPsi2,
    fe_age, fe_edu, fe_anc, fe_cont,
    B_hat, score, isYoung, coefs, optimalPsi,
  } = result;

  const terms = [
    { id: 0, label: 'α (constant)', value: alpha, color: '#c4b5fd', className: 'eq-term-alpha', show: revealStep >= 1 },
    { id: 1, label: 'β₁ψ', value: betaPsi, color: '#93c5fd', className: 'eq-term-beta1', show: revealStep >= 2 },
    { id: 2, label: 'β₂ψ²', value: betaPsi2, color: '#6ee7b7', className: 'eq-term-beta2', show: revealStep >= 3 },
    { id: 3, label: 'FE_age', value: fe_age, color: '#fde68a', className: 'eq-term-fe', show: revealStep >= 4 },
    { id: 4, label: 'FE_edu', value: fe_edu, color: '#fde68a', className: 'eq-term-fe', show: revealStep >= 4 },
    { id: 5, label: 'FE_ancestry', value: fe_anc, color: '#fde68a', className: 'eq-term-fe', show: revealStep >= 4 },
    { id: 6, label: 'FE_continent', value: fe_cont, color: '#fde68a', className: 'eq-term-fe', show: revealStep >= 4 },
  ];

  const runningSum = terms
    .filter(t => t.show)
    .reduce((s, t) => s + t.value, 0);

  return (
    <div className="space-y-5">
      {/* Equation banner */}
      <div className="glass rounded-xl p-4">
        <p className="text-xs text-white/40 mb-3 font-mono">Empirical Model</p>
        <div className="text-sm font-mono leading-relaxed text-white/80 break-all">
          <span className="text-white/40">B̂ = </span>
          <span className="eq-term eq-term-alpha">α</span>
          <span className="text-white/30"> + </span>
          <span className="eq-term eq-term-beta1">β₁ψ</span>
          <span className="text-white/30"> + </span>
          <span className="eq-term eq-term-beta2">β₂ψ²</span>
          <span className="text-white/30"> + </span>
          <span className="eq-term eq-term-fe">FE_age</span>
          <span className="text-white/30"> + </span>
          <span className="eq-term eq-term-fe">FE_edu</span>
          <span className="text-white/30"> + </span>
          <span className="eq-term eq-term-fe">FE_ancestry</span>
          <span className="text-white/30"> + </span>
          <span className="eq-term eq-term-fe">FE_continent</span>
        </div>
        <p className="text-xs text-white/30 mt-2">
          {isYoung ? 'Under-30 model' : 'Full-sample model'} · β₁ = {coefs.beta1}, β₂ = {coefs.beta2} · ψ* = {optimalPsi}
        </p>
      </div>

      {/* Variable values */}
      <div className="glass rounded-xl p-4 space-y-3">
        <p className="text-xs text-white/40 mb-2 font-mono">Step-by-step computation</p>

        {/* ψ */}
        {revealStep >= 1 && (
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="eq-term eq-term-psi text-sm w-20 text-center">ψ</span>
            <span className="text-white/40 text-sm">=</span>
            <span className="font-mono text-white font-bold">{fmtNoPlus(psi, 4)}</span>
            <span className="text-white/30 text-xs ml-auto">cultural distance</span>
          </div>
        )}

        {/* ψ² */}
        {revealStep >= 2 && (
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="eq-term eq-term-psi text-sm w-20 text-center">ψ²</span>
            <span className="text-white/40 text-sm">=</span>
            <span className="font-mono text-white font-bold">{fmtNoPlus(psi2, 5)}</span>
            <span className="text-white/30 text-xs ml-auto">distance squared</span>
          </div>
        )}

        <div className="border-t border-white/5 pt-2 space-y-2">
          {terms.map(term =>
            term.show ? (
              <div key={term.id} className="flex items-center gap-3 animate-fade-in">
                <span className={`eq-term text-xs w-24 text-center ${term.className}`}>{term.label}</span>
                <span className="text-white/40 text-sm">=</span>
                <span className="font-mono text-sm" style={{ color: term.color }}>
                  {fmt(term.value, 4)}
                </span>
              </div>
            ) : null
          )}
        </div>

        {/* Running total */}
        {revealStep >= 2 && (
          <div className="border-t border-white/10 pt-3 mt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-24">Σ so far</span>
              <span className="text-white/40 text-sm">=</span>
              <span className="font-mono font-bold text-white">{fmtNoPlus(runningSum, 4)}</span>
            </div>
          </div>
        )}

        {/* Final B̂ */}
        {revealStep >= 5 && (
          <div className="border-t border-white/10 pt-3 bg-white/3 rounded-lg px-3 py-2 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60 font-mono">B̂ (separation risk)</span>
              <span className="font-mono font-bold text-lg text-white">{fmtNoPlus(B_hat, 4)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-white/40">Optimal at ψ* = {optimalPsi}</span>
              <span className="text-xs" style={{ color: score >= 70 ? '#22c55e' : '#f59e0b' }}>
                Score: {score} / 100
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mini curve */}
      {revealStep >= 6 && (
        <div className="glass rounded-xl p-4 animate-fade-in">
          <p className="text-xs text-white/40 mb-2 font-mono">Separation risk curve</p>
          <SeparationRiskMini psi={psi} isYoung={isYoung} />
          <p className="text-xs text-white/30 text-center mt-1">
            Couple at ψ = {psi.toFixed(3)} · {psi < optimalPsi ? 'Below' : psi > optimalPsi ? 'Above' : 'At'} optimal ψ* = {optimalPsi}
          </p>
        </div>
      )}
    </div>
  );
}
