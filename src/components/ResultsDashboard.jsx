import ScoreGauge, { ScoreBar } from './ScoreGauge';
import { SynergyChartMain, SparkCohesionChart, ChildOutcomesChart } from './CurveVisualizer';

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
    child, sparkCohesion,
  } = result;

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

  const riskLevel = score >= 80 ? 'Low' : score >= 60 ? 'Moderate' : score >= 40 ? 'Elevated' : 'High';

  return (
    <div className="space-y-10 pb-12">
      {/* Top — overall + main scores */}
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

      {/* Cultural distance meter */}
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

      {/* Spark vs Cohesion */}
      <div className="glass rounded-2xl p-6">
        <Section title="Spark vs. Cohesion" subtitle={dynamicLabel}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <ScoreBar score={sparkCohesion.spark} label="Spark" color="#C41E3A" animate={animated} />
                </div>
                <div className="flex-1">
                  <ScoreBar score={sparkCohesion.cohesion} label="Cohesion" color="#60a5fa" animate={animated} />
                </div>
              </div>
              <p className="text-xs text-white/58 leading-relaxed">
                Balanced cultural distance creates both cohesion and spark. The strongest matches are not always the most similar or the most different.
              </p>
              <InsightCard title="Cohesion vs Spark" accent="red">
                Cultural similarities promote cohesion — effective communication and shared values. Cultural differences create spark — exploration and discovery. {personA?.name ?? 'Person A'} and {personB?.name ?? 'Person B'} sit {placement}, yielding a {sparkCohesion.cohesion > 60 ? 'cohesion-dominant' : sparkCohesion.spark > 60 ? 'spark-dominant' : 'balanced'} dynamic.
              </InsightCard>
            </div>
            <SparkCohesionChart psi={psi} />
          </div>
        </Section>
      </div>

      {/* Child well-being */}
      <div className="glass rounded-2xl p-6">
        <Section title="Child Well-Being Outlook" subtitle="Predicted outcomes for prospective children based on cultural synergy">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <ScoreBar score={child.prosperity} label="Economic Prosperity" color="#D4AF37" animate={animated} />
              <ScoreBar score={child.education} label="Educational Attainment" color="#60a5fa" animate={animated} />
              <ScoreBar score={child.creativity} label="Creativity & Originality" color="#a78bfa" animate={animated} />
              <ScoreBar score={child.focus} label="Focus & Attention Span" color="#34d399" animate={animated} />
              <InsightCard title="Child Outlook" accent="gold">
                Children from {personA?.name ?? 'Person A'} × {personB?.name ?? 'Person B'}'s cultural pairing show {child.creativity >= 75 ? 'strong' : 'moderate'} creative potential and {child.focus >= 75 ? 'high' : 'moderate'} focus. An intermediate cultural mix delivers the strongest cognitive outcomes.
              </InsightCard>
            </div>
            <ChildOutcomesChart psi={psi} />
          </div>
        </Section>
      </div>

      {/* Insights grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightCard title="Why This Score" accent="red">
          Reprium analyzed over 22,000 real cross-national couples to find that an intermediate cultural background difference — not too similar, not too different — leads to the most stable, lasting relationships. Your score reflects where this pairing sits on that curve.
        </InsightCard>
        <InsightCard title="Longevity vs. Reality" accent="gold">
          Relationship longevity score: <strong className="text-white">{score}/100</strong>. Adjusted for real-world pairing likelihood: <strong className="text-white">{marketScore}/100</strong>. {isCrossContinent ? `Couples from these two backgrounds make up only ${marriagePct}% of international pairings in our data.` : 'This background combination is common in real-world couples.'}
        </InsightCard>
        <InsightCard title="Best Match Dynamic" accent="red">
          {dynamicLabel}. {psi < optimalPsi
            ? 'Cultural proximity provides strong shared values. Seek partners with slightly more cultural contrast to unlock additional spark.'
            : psi > optimalPsi + 0.05
            ? 'Rich diversity creates excitement and perspective. Invest in shared routines and communication to reinforce cohesion.'
            : 'This pairing sits near the optimal cultural synergy zone — where cohesion and spark are naturally balanced.'}
        </InsightCard>
        <InsightCard title="Model Note" accent="gold">
          Coefficients from Reprium's published regressions: separation β₁=−0.31, β₂=0.64, ψ*=0.240 (n=22,091); child wages β₁=0.79, β₂=−1.89; education β₁=2.21, β₂=−5.82; creativity β₁=0.11, β₂=−0.27. Market adjustment derived from CPS micro-data (n=839k couples, 1994–2023). Fixed effects remain approximate.
        </InsightCard>
      </div>

      {/* Methodology */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Statistical Methodology</h3>
        <div className="space-y-2 text-xs text-white/65 leading-relaxed">
          <p><strong className="text-white/85">Data:</strong> CPS micro-data, 22,091 cross-national married couples (1994–2023). Each observation is a couple where both partners have known non-US ancestral origins identified by ISO country code.</p>
          <p><strong className="text-white/85">Cultural distance ψ:</strong> Pre-historic migratory distance between ancestral homelands, normalised to [0,1] (Pemberton et al. 2013). Captures genetic, linguistic, and institutional divergence accumulated over millennia — not modern political borders.</p>
          <p><strong className="text-white/85">Separation regression:</strong> reghdfe divorce ma mas [pw=lnkfw1ywt], absorb(year cohortFE ancestry1 ancestry2 continent_pair ageFE educFE), cluster(ancestry1 ancestry2). The quadratic in ψ captures the inverted-U: β₁=−0.31 (linear, negative) and β₂=+0.64 (squared, positive) → minimum separation at ψ*=0.240.</p>
          <p><strong className="text-white/85">Fixed effects:</strong> Per-country ancestry FEs from the regression predictions file; age FEs (ageFE2 HDFE component, ages 18–35); religion pair FEs from CPS–religion merge (mean divorce rate deviation by religion pair, n≥30).</p>
          <p><strong className="text-white/85">Market adjustment:</strong> P(ever marry) = geometric mean of observed intermarriage rates for this continental pairing in the CPS sample, computed symmetrically. Actual survival = P(survive | married) × P(marry).</p>
          <p><strong className="text-white/85">Child outcomes:</strong> ACS 5yr + NLSY79 data (n=5.3M). Four separate OLS regressions of log wages, educational attainment, originality, and total activities on ψ and ψ² with ancestry and age FEs.</p>
        </div>
      </div>

      {/* Effect size callout */}
      <div className="glass rounded-2xl p-5 border-l-4 border-yellow-500/40">
        <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">Effect Size — From Baseline Regression</p>
        <p className="text-sm text-white/65 leading-relaxed">
          Moving from ψ_min to the optimal ψ*=0.240 reduces separation probability by <strong className="text-white/90">−56%</strong>. Moving from ψ_max to ψ* reduces it by <strong className="text-white/90">−62%</strong>. Both effects are statistically significant at p≤0.002 (U-test for the inverted-U). The effect is robust across age, education, and ancestry controls — and strengthens for couples below age 30.
        </p>
        <p className="text-xs text-white/45 mt-2">Source: baseline.tex Column (3), full fixed-effects model · n=22,091 couples · 2,007 ancestry pairs.</p>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center pt-4 border-t border-white/5">
        <p className="text-xs text-white/45 max-w-2xl mx-auto leading-relaxed">
          Coefficients and market-adjustment probabilities sourced directly from Reprium empirical research. Fixed effects are approximate; the full model uses fitted values from the complete CPS regression.
        </p>
      </div>
    </div>
  );
}
