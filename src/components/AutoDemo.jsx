import { useEffect, useState, useRef } from 'react';
import { computeFullScore } from '../lib/scoring';
import CalculationEngine from './CalculationEngine';
import ResultsDashboard from './ResultsDashboard';

const DEMO_PERSON_A = {
  name: 'Elizabeth',
  age: 25,
  education: 'college',
  ancestries: ['GBR'],
  educationLabel: 'College Graduate',
  ancestriesLabel: 'United Kingdom',
  region: 'Western Europe',
};

const DEMO_PERSON_B = {
  name: 'Johann',
  age: 27,
  education: 'phd',
  ancestries: ['DEU', 'POL'],
  educationLabel: 'PhD',
  ancestriesLabel: 'Germany · Poland',
  region: 'Central / Eastern Europe',
};

// Steps and their trigger times (ms)
const TIMELINE = [
  { step: 1, at: 600 },    // Profiles appear
  { step: 2, at: 1400 },   // Elizabeth name
  { step: 3, at: 2000 },   // Elizabeth age
  { step: 4, at: 2500 },   // Elizabeth education
  { step: 5, at: 3000 },   // Elizabeth ancestry
  { step: 6, at: 3800 },   // Johann name
  { step: 7, at: 4400 },   // Johann age
  { step: 8, at: 4900 },   // Johann education
  { step: 9, at: 5400 },   // Johann ancestry
  { step: 10, at: 6400 },  // Calculation panel appears, ψ computed
  { step: 11, at: 7400 },  // ψ² & β₁ψ
  { step: 12, at: 8400 },  // β₂ψ²
  { step: 13, at: 9400 },  // Fixed effects
  { step: 14, at: 10800 }, // B̂ & score
  { step: 15, at: 11800 }, // Mini curve
  { step: 16, at: 13200 }, // Results appear
];

function ProfileField({ label, value, show }) {
  if (!show) return null;
  return (
    <div className="flex items-start gap-2 animate-fade-in-up text-sm">
      <span className="text-white/50 w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

function ProfileCard({ person, fieldsVisible, side, pulse }) {
  const gradClass = side === 'A'
    ? 'from-red-900/10 to-transparent'
    : 'from-blue-900/10 to-transparent';

  return (
    <div
      className={`glass rounded-2xl p-6 space-y-4 transition-all duration-500 ${
        fieldsVisible >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${pulse ? 'animate-pulse-glow' : ''}`}
    >
      <div className={`h-1 rounded-full bg-gradient-to-r ${gradClass} w-full mb-2`}
        style={{ background: side === 'A' ? '#C41E3A' : '#3b82f6', opacity: 0.6 }} />

      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
          style={{
            background: side === 'A' ? 'rgba(196,30,58,0.2)' : 'rgba(59,130,246,0.2)',
            border: `1px solid ${side === 'A' ? 'rgba(196,30,58,0.4)' : 'rgba(59,130,246,0.4)'}`,
            color: side === 'A' ? '#C41E3A' : '#60a5fa',
          }}
        >
          {fieldsVisible >= 2 ? person.name[0] : '?'}
        </div>
        <div>
          {fieldsVisible >= 2
            ? <p className="font-semibold text-white animate-fade-in">{person.name}</p>
            : <p className="text-white/20 text-sm">Loading…</p>}
          <p className="text-xs text-white/45">Person {side}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <ProfileField label="Age" value={`${person.age} years old`} show={fieldsVisible >= 3} />
        <ProfileField label="Education" value={person.educationLabel} show={fieldsVisible >= 4} />
        <ProfileField label="Ancestry" value={person.ancestriesLabel} show={fieldsVisible >= 5} />
        <ProfileField label="Region" value={person.region} show={fieldsVisible >= 5} />
      </div>
    </div>
  );
}

function StepIndicator({ step, label, active, done }) {
  return (
    <div className={`flex items-center gap-3 transition-all duration-300 ${active ? 'opacity-100' : done ? 'opacity-50' : 'opacity-20'}`}>
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
          done ? 'bg-green-500/20 border-green-500/50 text-green-400' :
          active ? 'bg-red-700/20 border-red-700/50 text-red-400 animate-pulse' :
          'border-white/10 text-white/20'
        }`}
      >
        {done ? '✓' : step}
      </div>
      <span className={`text-xs ${active ? 'text-white' : 'text-white/58'}`}>{label}</span>
    </div>
  );
}

export default function AutoDemo({ onExit, hideBack = false }) {
  const [demoStep, setDemoStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const timersRef = useRef([]);

  const result = computeFullScore({
    ancestriesA: DEMO_PERSON_A.ancestries,
    ancestriesB: DEMO_PERSON_B.ancestries,
    ageA: DEMO_PERSON_A.age,
    ageB: DEMO_PERSON_B.age,
    eduA: DEMO_PERSON_A.education,
    eduB: DEMO_PERSON_B.education,
  });

  useEffect(() => {
    TIMELINE.forEach(({ step, at }) => {
      const t = setTimeout(() => setDemoStep(step), at);
      timersRef.current.push(t);
    });
    const resultsTimer = setTimeout(() => setShowResults(true), 13200);
    timersRef.current.push(resultsTimer);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // Map demoStep → calculation engine reveal step
  const calcReveal =
    demoStep < 10 ? 0 :
    demoStep === 10 ? 1 :
    demoStep === 11 ? 2 :
    demoStep === 12 ? 3 :
    demoStep === 13 ? 4 :
    demoStep >= 14 ? 5 :
    demoStep >= 15 ? 6 : 0;

  const showCalcPanel = demoStep >= 10;
  const showCurveInCalc = demoStep >= 15;

  // Profile A fields visible count
  const aFields =
    demoStep < 1 ? 0 :
    demoStep === 1 ? 1 :
    demoStep === 2 ? 2 :
    demoStep === 3 ? 3 :
    demoStep === 4 ? 4 :
    demoStep >= 5 ? 5 : 0;

  // Profile B fields visible count
  const bFields =
    demoStep < 6 ? 0 :
    demoStep === 6 ? 2 :
    demoStep === 7 ? 3 :
    demoStep === 8 ? 4 :
    demoStep >= 9 ? 5 : 0;

  const steps = [
    { step: 1, label: 'Profiles loaded', done: demoStep > 5, active: demoStep <= 5 && demoStep >= 1 },
    { step: 2, label: 'Cultural distance ψ computed', done: demoStep > 10, active: demoStep === 10 },
    { step: 3, label: 'Regression terms evaluated', done: demoStep > 13, active: demoStep >= 11 && demoStep <= 13 },
    { step: 4, label: 'Fixed effects applied', done: demoStep > 14, active: demoStep === 13 || demoStep === 14 },
    { step: 5, label: 'Synergy score computed', done: demoStep >= 16, active: demoStep === 15 },
  ];

  return (
    <div className="min-h-screen bg-premium">
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      <div className="absolute inset-0 bg-glow-gold pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-700/20 border border-red-700/40 flex items-center justify-center">
              <span className="text-xs font-bold text-red-400">R</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-white">Reprium</h1>
              <p className="text-xs text-white/45">Compatibility Engine — Live Demo</p>
            </div>
          </div>
          {!hideBack && (
            <button onClick={onExit} className="text-xs text-white/58 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 px-4 py-2 rounded-full">
              ← Back
            </button>
          )}
        </div>

        {/* Progress steps */}
        <div className="flex flex-wrap gap-4 mb-8 glass rounded-xl p-4">
          {steps.map(s => (
            <StepIndicator key={s.step} {...s} />
          ))}
        </div>

        {/* Main layout */}
        <div className={`grid gap-6 mb-8 ${showCalcPanel ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
          {/* Profiles column */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Profiles</h2>

            {demoStep >= 1 && (
              <ProfileCard
                person={DEMO_PERSON_A}
                fieldsVisible={aFields}
                side="A"
                pulse={demoStep >= 10 && demoStep < 16}
              />
            )}

            {demoStep >= 1 && (
              <ProfileCard
                person={DEMO_PERSON_B}
                fieldsVisible={bFields}
                side="B"
                pulse={demoStep >= 10 && demoStep < 16}
              />
            )}

            {/* ψ highlight card */}
            {demoStep >= 10 && (
              <div className="glass-strong rounded-2xl p-5 animate-scale-in border border-red-700/20">
                <p className="text-xs text-white/58 mb-3 font-mono">Cultural Distance</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-white font-mono">{result.psi.toFixed(3)}</span>
                  <div>
                    <p className="text-xs text-white/70">ψ (psi)</p>
                    <p className="text-xs text-white/45">vs optimal {result.optimalPsi}</p>
                  </div>
                </div>
                {demoStep >= 11 && (
                  <div className="mt-3 flex items-baseline gap-3 animate-fade-in">
                    <span className="text-2xl font-bold text-white/70 font-mono">{result.psi2.toFixed(5)}</span>
                    <p className="text-xs text-white/58">ψ² = ψ²</p>
                  </div>
                )}
                <div className="mt-3 text-xs text-white/45">
                  {DEMO_PERSON_A.ancestriesLabel} × {DEMO_PERSON_B.ancestriesLabel} · {result.isYoung ? 'Under-30 model' : 'Full model'}
                </div>
              </div>
            )}
          </div>

          {/* Calculation column */}
          {showCalcPanel && (
            <div className="animate-slide-right">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-4">Calculation</h2>
              <CalculationEngine
                result={result}
                revealStep={
                  demoStep === 10 ? 1 :
                  demoStep === 11 ? 2 :
                  demoStep === 12 ? 3 :
                  demoStep === 13 ? 4 :
                  demoStep >= 14 ? 5 :
                  demoStep >= 15 ? 6 : 0
                }
              />
            </div>
          )}
        </div>

        {/* Final score reveal */}
        {demoStep >= 14 && !showResults && (
          <div className="glass-strong rounded-2xl p-6 mb-8 animate-scale-in border border-red-700/20">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div>
                <p className="text-xs text-white/58 mb-1 tracking-widest uppercase">Conditional Survival</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-white">{result.score}</span>
                  <span className="text-2xl text-white/45">/100</span>
                </div>
                <p className="text-xs text-white/45 mt-1">Given they marry</p>
              </div>
              <div className="text-white/20 text-2xl hidden md:block">×</div>
              <div className="text-center">
                <p className="text-xs text-white/58 mb-1 tracking-widest uppercase">Marriage Prob.</p>
                <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
                  {Math.round((result.marriageProb ?? 1) * 100)}%
                </p>
                <p className="text-xs text-white/45 mt-1">vs same-group baseline</p>
              </div>
              <div className="text-white/20 text-2xl hidden md:block">=</div>
              <div className="text-center">
                <p className="text-xs text-white/58 mb-1 tracking-widest uppercase">Market Score</p>
                <p className="text-3xl font-bold" style={{ color: '#C41E3A' }}>{result.marketScore}</p>
                <p className="text-xs text-white/45 mt-1">Adjusted</p>
              </div>
              <div className="h-16 w-px bg-white/10 hidden md:block" />
              <div className="md:ml-auto text-center">
                <p className="text-xs text-white/58 mb-1 tracking-widest uppercase">Overall</p>
                <p className="text-3xl font-bold" style={{ color: '#D4AF37' }}>{result.overall}</p>
                <p className="text-xs text-white/45 mt-1">Rel. + Child</p>
              </div>
            </div>
          </div>
        )}

        {/* Full results dashboard */}
        {showResults && (
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-white/5" />
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest px-4">Full Results Dashboard</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <ResultsDashboard
              result={result}
              personA={DEMO_PERSON_A}
              personB={DEMO_PERSON_B}
              animated
            />
          </div>
        )}
      </div>
    </div>
  );
}
