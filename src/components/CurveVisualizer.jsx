import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceDot, ResponsiveContainer, Area, AreaChart, Legend,
} from 'recharts';
import { generateSeparationCurveData, generateChildCurveData } from '../lib/scoring';

const curveData = generateSeparationCurveData(false);
const youngCurveData = generateSeparationCurveData(true);
const childData = generateChildCurveData();

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg p-3 text-xs space-y-1">
      <p className="text-white/60 mb-1">ψ = {label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

/** Main inverted-U synergy curve with couple's position */
export function SynergyChartMain({ psi, optimalPsi = 0.195, isYoung = false, animated = true }) {
  const data = isYoung ? youngCurveData : curveData;
  const couplePoint = data.find(d => Math.abs(d.psi - psi) < 0.015) ?? { psi, synergy: 0 };

  return (
    <div>
      <p className="text-xs text-white/40 mb-3 text-center italic">
        Relationship synergy vs. cultural distance — couple positioned at ψ = {psi.toFixed(3)}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="synergyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C41E3A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#C41E3A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="psi" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => v.toFixed(2)} label={{ value: 'Cultural Distance ψ', position: 'insideBottom', offset: -2, fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => `${v}`} label={{ value: 'Synergy', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={optimalPsi} stroke="#D4AF37" strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: `ψ* = ${optimalPsi}`, position: 'top', fill: '#D4AF37', fontSize: 10 }} />
          <Area type="monotone" dataKey="synergy" stroke="#C41E3A" strokeWidth={2.5} fill="url(#synergyGrad)" dot={false} name="Synergy" />
          <ReferenceDot x={psi.toFixed(2)} y={couplePoint.synergy}
            r={7} fill="#ffffff" stroke="#C41E3A" strokeWidth={2.5}
            label={{ value: 'You', position: 'top', fill: 'white', fontSize: 11, fontWeight: 700 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Spark & Cohesion trade-off chart */
export function SparkCohesionChart({ psi }) {
  return (
    <div>
      <p className="text-xs text-white/40 mb-3 text-center italic">
        Spark increases with cultural distance; Cohesion decreases
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={curveData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="psi" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => v.toFixed(2)} label={{ value: 'Cultural Distance ψ', position: 'insideBottom', offset: -2, fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: '8px' }} />
          <ReferenceLine x={psi.toFixed(2)} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="spark" stroke="#C41E3A" strokeWidth={2} dot={false} name="Spark" />
          <Line type="monotone" dataKey="cohesion" stroke="#60a5fa" strokeWidth={2} dot={false} name="Cohesion" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Child outcomes inverted-U chart */
export function ChildOutcomesChart({ psi }) {
  return (
    <div>
      <p className="text-xs text-white/40 mb-3 text-center italic">
        Child prosperity, education, and creativity peak at intermediate cultural distance
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={childData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="psi" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => v.toFixed(2)} label={{ value: 'Cultural Distance ψ', position: 'insideBottom', offset: -2, fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
          <YAxis domain={[0, 110]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => `${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: '8px' }} />
          <ReferenceLine x={psi.toFixed(2)} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3"
            label={{ value: 'You', position: 'top', fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
          <Line type="monotone" dataKey="prosperity" stroke="#D4AF37" strokeWidth={2} dot={false} name="Prosperity" />
          <Line type="monotone" dataKey="education" stroke="#60a5fa" strokeWidth={2} dot={false} name="Education" />
          <Line type="monotone" dataKey="creativity" stroke="#a78bfa" strokeWidth={2} dot={false} name="Creativity" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Compact separation risk U-curve (for calculation engine) */
export function SeparationRiskMini({ psi, isYoung }) {
  const data = isYoung ? youngCurveData : curveData;
  const opt = isYoung ? 0.140 : 0.195;
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C41E3A" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#C41E3A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="psi" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickFormatter={(v) => v.toFixed(2)} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} domain={[0, 0.15]} tickFormatter={(v) => v.toFixed(2)} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={opt.toFixed(2)} stroke="#D4AF37" strokeDasharray="3 2" strokeWidth={1} />
        <Area type="monotone" dataKey="risk" stroke="#C41E3A" strokeWidth={2} fill="url(#riskGrad)" dot={false} name="Separation Risk" />
        <ReferenceDot x={psi.toFixed(2)} y={data.find(d => Math.abs(d.psi - psi) < 0.015)?.risk ?? 0.05}
          r={5} fill="white" stroke="#C41E3A" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
