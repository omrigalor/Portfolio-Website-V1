import { useEffect, useState } from 'react';

export default function ScoreGauge({ score, label, sublabel, color = '#C41E3A', size = 140, animate = true }) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) { setDisplayed(score); return; }
    let start = null;
    const duration = 1600;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score, animate]);

  const strokeWidth = size * 0.075;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Semicircular arc: from 210° to 330° (240° span) — matches classic gauge
  const startAngle = 210;
  const endAngle = 330;
  const sweepDeg = 300; // 360 - 60 gap

  const toRad = (deg) => (deg * Math.PI) / 180;

  const arcPath = (angleDeg) => {
    const rad = toRad(angleDeg);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const bgStart = arcPath(startAngle);
  const bgEnd = arcPath(endAngle);

  const fgEnd = arcPath(startAngle + sweepDeg * (displayed / 100));

  const describeArc = (startDeg, endDeg) => {
    const start = arcPath(startDeg);
    const end = arcPath(endDeg);
    const span = endDeg - startDeg;
    const large = span > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
  };

  const bgPath = describeArc(startAngle, endAngle + 360 - (360 - sweepDeg)); // Approximate full background
  const fgSpan = sweepDeg * (displayed / 100);
  const fgPath = fgSpan > 0 ? describeArc(startAngle, startAngle + fgSpan) : null;

  // Score color
  const scoreColor =
    displayed >= 80 ? '#22c55e' :
    displayed >= 60 ? color :
    displayed >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <path
          d={bgPath}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Fill */}
        {fgPath && (
          <path
            d={fgPath}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${scoreColor}80)`,
              transition: 'none',
            }}
          />
        )}
        {/* Score number */}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="DM Sans, sans-serif"
        >
          {displayed}
        </text>
        {/* /100 */}
        <text
          x={cx}
          y={cy + size * 0.20}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={size * 0.10}
          fontFamily="DM Sans, sans-serif"
        >
          / 100
        </text>
      </svg>
      <div className="text-center">
        <div className="text-sm font-semibold text-white/90">{label}</div>
        {sublabel && <div className="text-xs text-white/40 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}

/** Compact horizontal bar score */
export function ScoreBar({ score, label, color = '#C41E3A', animate = true }) {
  const [width, setWidth] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) { setWidth(score); return; }
    const t = setTimeout(() => setWidth(score), 100);
    return () => clearTimeout(t);
  }, [score, animate]);

  const barColor =
    score >= 80 ? '#22c55e' :
    score >= 60 ? color :
    score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs font-bold" style={{ color: barColor }}>{score}</span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            backgroundColor: barColor,
            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 0 8px ${barColor}60`,
          }}
        />
      </div>
    </div>
  );
}
