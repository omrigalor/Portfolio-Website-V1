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
      <div className="text-sm text-white/50 leading-relaxed">{children}</div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white/90">{title}</h3>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function ResultsDashboard({ result, personA, personB, animated = true }) {
  if (!result) return null;

  const {
    psi, score, overall, isYoung, optimalPsi,
    child, sparkCohesion,
  } = result;

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
          <p className="text-xs text-white/40 mb-4 tracking-widest uppercase">Overall Compatibility</p>
          <ScoreGauge score={overall} label="" size={160} animate={animated} />
          <p className="text-xs text-white/40 mt-3 font-mono">Relationship + Child Well-Being</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <ScoreGauge score={score} label="Relationship Synergy" sublabel="Endurance prediction" size={130} color="#C41E3A" animate={animated} />
          </div>
          <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <ScoreGauge score={child.overall} label="Child Well-Being" sublabel="Prosperity, Education & more" size={130} color="#D4AF37" animate={animated} />
          </div>
        </div>
      </div>

      {/* Cultural distance meter */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Cultural Distance</h3>
            <p className="text-xs text-white/40 mt-0.5">
              {personA?.name ?? 'Person A'} × {personB?.name ?? 'Person B'} · {psi.toFixed(4)}
            </p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{psi.toFixed(3)}</p>
              <p className="text-xs text-white/40">ψ measured</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>{optimalPsi}</p>
              <p className="text-xs text-white/40">ψ* optimal</p>
            </div>
          </div>
        </div>
        <div className="relative h-3 bg-white/5 rounded-full overflow-visible mb-2">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(100, (psi / 0.55) * 100)}%`,
              background: 'linear-gradient(90deg, #C41E3A, #ff6b6b)',
              boxShadow: '0 0 12px rgba(196,30,58,0.5)',
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
            style={{
              left: `${(optimalPsi / 0.55) * 100}%`,
              background: '#D4AF37',
              boxShadow: '0 0 8px rgba(212,175,55,0.8)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/25">
          <span>0.00 — Same cultural origin</span>
          <span className="text-yellow-500/60">ψ* = {optimalPsi}</span>
          <span>0.55 — Maximum distance</span>
        </div>
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
              <p className="text-xs text-white/40 leading-relaxed">
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

      {/* Main synergy curve */}
      <div className="glass rounded-2xl p-6">
        <Section title="Cultural Synergy Curve" subtitle="Where this couple sits on the relationship endurance curve">
          <SynergyChartMain psi={psi} optimalPsi={optimalPsi} isYoung={isYoung} animated={animated} />
          <p className="text-xs text-white/40 text-center mt-2 italic">
            "Reprium maps where a couple sits on the cultural synergy curve."
          </p>
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
          Reprium maps cultural distance using pre-historic migratory distance between ancestry pairs, drawing on data from ~1 million couples across 2,000+ ancestry combinations. The quadratic model captures the inverted-U relationship where intermediate distance minimizes separation risk.
        </InsightCard>
        <InsightCard title="Risk Factor" accent="gold">
          Separation risk level: <strong className="text-white">{riskLevel}</strong>. This couple places in the {score >= 80 ? 'top 20%' : score >= 65 ? 'top 35%' : score >= 50 ? 'top 50%' : 'lower 50%'} of predicted relationship endurance across comparable ancestry pairs in the US.
        </InsightCard>
        <InsightCard title="Best Match Dynamic" accent="red">
          {dynamicLabel}. {psi < optimalPsi
            ? 'Cultural proximity provides strong shared values. Seek partners with slightly more cultural contrast to unlock additional spark.'
            : psi > optimalPsi + 0.05
            ? 'Rich diversity creates excitement and perspective. Invest in shared routines and communication to reinforce cohesion.'
            : 'This pairing sits near the optimal cultural synergy zone — where cohesion and spark are naturally balanced.'}
        </InsightCard>
        <InsightCard title="Model Note" accent="gold">
          Prototype demonstration only. Scores are illustrative and based on simplified coefficients inspired by Reprium research, not the full proprietary model. Fixed effects shown are placeholder approximations; the full model uses fitted values from the CPS regression across 18,187 observations.
        </InsightCard>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center pt-4 border-t border-white/5">
        <p className="text-xs text-white/25 max-w-2xl mx-auto leading-relaxed">
          Prototype demonstration only. Scores are illustrative and based on simplified coefficients inspired by Reprium research, not the full proprietary model.
        </p>
      </div>
    </div>
  );
}
