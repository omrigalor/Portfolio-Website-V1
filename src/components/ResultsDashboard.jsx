import ScoreGauge, { ScoreBar } from './ScoreGauge';
import { SynergyChartMain, SparkCohesionChart } from './CurveVisualizer';

function InsightCard({ title, children, accent = 'red' }) {
  const borderColor = accent === 'gold' ? 'border-yellow-500/20' : 'border-red-700/20';
  const dotColor = accent === 'gold' ? 'bg-yellow-500' : 'bg-red-700';
  return (
    <div className={`glass rounded-xl p-5 border-l-2 ${borderColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <h4 className="text-sm font-semibold text-white/80">{title}</h4>
      </div>
      <div className="text-sm text-white/70 leading-relaxed">{children}</div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white/90">{title}</h3>
        {subtitle && <p className="text-xs text-white/58 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function ResultsDashboard({ result, personA, personB, animated = true }) {
  if (!result) return null;

  const {
    psi, score, marketScore, marriageProb, overall, isYoung, optimalPsi,
    child, sparkCohesion, fe_age, fe_edu, fe_rel,
  } = result;

  // Normalize FEs to 0–100 compatibility scores (lower FE = less separation risk = better)
  const ageScore       = Math.round(Math.max(0, Math.min(100, 100 * (0.128 - fe_age)           / 0.182)));
  const religiousScore = Math.round(Math.max(0, Math.min(100, 100 * (0.025 - (fe_rel ?? 0))    / 0.089)));
  const eduScore       = Math.round(Math.max(0, Math.min(100, 100 * (0.007 - fe_edu)           / 0.018)));

  const marriagePct = Math.round((marriageProb ?? 1) * 100);
  const isCrossContinent = (marriageProb ?? 1) < 0.99;

  const psiDiff = psi - optimalPsi;
  const placement =
    Math.abs(psiDiff) < 0.02 ? 'right at the optimal cultural distance' :
    psiDiff < 0 ? `${Math.abs(psiDiff * 100).toFixed(1)} points below the optimal cultural distance` :
    `${(psiDiff * 100).toFixed(1)} points above the optimal cultural distance`;

  const dynamicLabel =
    sparkCohesion.cohesion > 70 && sparkCohesion.spark < 40 ? 'High Cohesion / Moderate Spark' :
    sparkCohesion.spark > 60 && sparkCohesion.cohesion < 50 ? 'High Spark / Lower Cohesion' :
    'Balanced Cultural Synergy';

  return (
    <div className="space-y-8 pb-12">

      {/* ── 1. Main gauges ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-strong rounded-2xl p-6 flex flex-col items-center justify-center text-center md:col-span-1 animate-pulse-glow">
          <p className="text-xs text-white/58 mb-4 tracking-widest uppercase">Overall Compatibility</p>
          <ScoreGauge score={overall} label="" size={160} animate={animated} />
          <p className="text-xs text-white/58 mt-3 font-mono">Market-adjusted · Relationship + Child</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <ScoreGauge score={score} label="Relationship Longevity" sublabel="How long they'll last" size={130} animate={animated} />
          </div>
          <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <ScoreGauge score={child.overall} label="Child Well-Being" sublabel="Prosperity, Education & more" size={130} animate={animated} />
          </div>
        </div>
      </div>

      {/* ── 2. Child Well-Being Breakdown (near top) ── */}
      <div className="glass rounded-2xl p-6 space-y-5" style={{ borderTop: '2px solid rgba(212,175,55,0.35)' }}>
        <div>
          <h3 className="text-base font-semibold text-white">Child Well-Being</h3>
          <p className="text-xs text-white/50 mt-0.5">Predicted outcomes for prospective children · ACS 5yr + NLSY79 data (n=5.3M)</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Economic Prosperity', score: child.prosperity, color: '#D4AF37', note: 'Peaks at ψ*=0.208' },
            { label: 'Educational Attainment', score: child.education, color: '#60a5fa', note: 'Peaks at ψ*=0.189' },
            { label: 'Creativity', score: child.creativity, color: '#a78bfa', note: 'Peaks at ψ*=0.205' },
            { label: 'Focus', score: child.focus, color: '#34d399', note: 'Linear — lower ψ better' },
          ].map(d => (
            <div key={d.label} className="glass rounded-xl p-4 text-center space-y-2">
              <p className="text-3xl font-bold font-mono" style={{ color: d.color }}>{d.score}</p>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${d.score}%`, background: d.color }} />
              </div>
              <p className="text-xs font-medium text-white/65">{d.label}</p>
              <p className="text-xs text-white/30">{d.note}</p>
            </div>
          ))}
        </div>
        <InsightCard title="Child Outlook" accent="gold">
          Children from {personA?.name ?? 'Person A'} × {personB?.name ?? 'Person B'}'s cultural pairing show {child.creativity >= 75 ? 'strong' : 'moderate'} creative potential and {child.focus >= 75 ? 'high' : 'moderate'} focus. An intermediate cultural mix delivers the strongest cognitive and economic outcomes.
        </InsightCard>
      </div>

      {/* ── 3. Relationship Compatibility Factors ── */}
      <div className="glass rounded-2xl p-6 space-y-5" style={{ borderTop: '2px solid rgba(196,30,58,0.3)' }}>
        <div>
          <h3 className="text-base font-semibold text-white">Relationship Compatibility Factors</h3>
          <p className="text-xs text-white/50 mt-0.5">Fixed effects from the CPS separation regression — each factor's individual contribution to stability</p>
        </div>
        <div className="space-y-5">
          {[
            { label: 'Age Compatibility', score: ageScore, color: '#fb923c', note: 'Based on HDFE age fixed effects from predictions.dta — younger couples average higher separation risk' },
            { label: 'Religious Alignment', score: religiousScore, color: '#f472b6', note: 'Same-religion couples are meaningfully more stable — religion-pair FEs from CPS micro-data' },
            { label: 'Education Alignment', score: eduScore, color: '#34d399', note: 'Higher education levels correlate with lower separation rates; computed from education FEs' },
          ].map(d => (
            <div key={d.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/75 font-medium">{d.label}</span>
                <span className="font-mono text-white font-bold">{d.score} <span className="text-white/30 font-normal">/ 100</span></span>
              </div>
              <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${d.score}%`, background: d.color }} />
              </div>
              <p className="text-xs text-white/35 mt-1">{d.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Cultural distance meter ── */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">How Different Are Their Backgrounds?</h3>
            <p className="text-sm mt-1 leading-relaxed" style={{
              color: Math.abs(psi - optimalPsi) < 0.04 ? '#22c55e' : psi < optimalPsi ? '#f59e0b' : '#fb923c'
            }}>
              {Math.abs(psi - optimalPsi) < 0.04
                ? '✓ Right at the sweet spot — not too similar, not too different'
                : psi < optimalPsi
                  ? 'Very similar backgrounds. A bit more cultural contrast tends to produce stronger, longer-lasting relationships.'
                  : 'Quite different backgrounds. Couples with less contrast tend to last longer on average.'}
            </p>
          </div>
          <div className="flex gap-6 text-center shrink-0">
            <div>
              <p className="text-2xl font-bold text-white">{psi.toFixed(3)}</p>
              <p className="text-xs text-white/58">This pair</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>{optimalPsi}</p>
              <p className="text-xs text-white/58">Sweet spot</p>
            </div>
          </div>
        </div>
        <div className="relative h-3 bg-white/5 rounded-full overflow-visible mb-2">
          <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, (psi / 0.55) * 100)}%`, background: 'linear-gradient(90deg, #C41E3A, #ff6b6b)', boxShadow: '0 0 12px rgba(196,30,58,0.5)' }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
            style={{ left: `${(optimalPsi / 0.55) * 100}%`, background: '#D4AF37', boxShadow: '0 0 8px rgba(212,175,55,0.8)' }} />
        </div>
        <div className="flex justify-between text-xs text-white/45">
          <span>Same background</span>
          <span className="text-yellow-500/70">Sweet spot</span>
          <span>Very different</span>
        </div>
        <p className="text-xs text-white/40 mt-3">
          Measured using pre-historic migratory distance between ancestral homelands — a proxy for how different two family traditions, communication styles, and long-run values tend to be.
        </p>
      </div>

      {/* ── 5. Spark vs Cohesion ── */}
      <div className="glass rounded-2xl p-6">
        <Section title="Spark vs. Cohesion" subtitle={dynamicLabel}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <ScoreBar score={sparkCohesion.spark} label="Spark" color="#C41E3A" animate={animated} />
              </div>
              <div className="flex-1">
                <ScoreBar score={sparkCohesion.cohesion} label="Cohesion" color="#60a5fa" animate={animated} />
              </div>
            </div>
            <InsightCard title="Cohesion vs Spark" accent="red">
              Cultural similarities promote cohesion — effective communication and shared values. Cultural differences create spark — exploration and discovery. {personA?.name ?? 'Person A'} and {personB?.name ?? 'Person B'} sit {placement}, yielding a {sparkCohesion.cohesion > 60 ? 'cohesion-dominant' : sparkCohesion.spark > 60 ? 'spark-dominant' : 'balanced'} dynamic.
            </InsightCard>
          </div>
        </Section>
      </div>

      {/* ── 6. Insights ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightCard title="Why This Score" accent="red">
          Reprium analyzed over 22,000 real cross-national couples to find that an intermediate cultural background difference — not too similar, not too different — leads to the most stable, lasting relationships. Your score reflects where this pairing sits on that curve.
        </InsightCard>
        <InsightCard title="Longevity vs. Reality" accent="gold">
          Relationship longevity score: <strong className="text-white">{score}/100</strong>. Adjusted for real-world pairing likelihood: <strong className="text-white">{marketScore}/100</strong>. {isCrossContinent ? `Couples from these two backgrounds make up only ${marriagePct}% of international pairings in our data.` : 'This background combination is common in real-world couples.'}
        </InsightCard>
      </div>

      {/* ── 7. Methodology ── */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Statistical Methodology</h3>
        <div className="space-y-2 text-xs text-white/65 leading-relaxed">
          <p><strong className="text-white/85">Data:</strong> CPS micro-data, 22,091 cross-national married couples (1994–2023). Cultural distance ψ = pre-historic migratory distance between ancestral homelands, normalised to [0,1] (Pemberton et al. 2013).</p>
          <p><strong className="text-white/85">Separation regression:</strong> reghdfe with ancestry, age, education, religion, and continent-pair fixed effects. β₁=−0.31, β₂=+0.64, ψ*=0.240 (full-sample); β₁=−0.16, β₂=+0.24, ψ*=0.338 (under-30 subgroup).</p>
          <p><strong className="text-white/85">Child outcomes:</strong> ACS 5yr + NLSY79 (n=5.3M). Four OLS regressions of log wages, educational attainment, originality, and total activities on ψ and ψ² with ancestry and age FEs.</p>
          <p><strong className="text-white/85">Market adjustment:</strong> P(ever marry) = geometric mean of observed intermarriage rates for this continental pairing in CPS. Overall = P(survive | married) × P(marry).</p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="text-center pt-4 border-t border-white/5">
        <p className="text-xs text-white/45 max-w-2xl mx-auto leading-relaxed">
          Coefficients and market-adjustment probabilities sourced directly from Reprium empirical research. Fixed effects are approximate; the full model uses fitted values from the complete CPS regression.
        </p>
      </div>
    </div>
  );
}
