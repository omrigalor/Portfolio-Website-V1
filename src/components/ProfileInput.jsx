import { useState } from 'react';
import { ANCESTRIES, EDUCATION_OPTIONS } from '../data/ancestries';
import { computeFullScore } from '../lib/scoring';
import ResultsDashboard from './ResultsDashboard';
import CalculationEngine from './CalculationEngine';

const DEFAULT_PERSON = {
  name: '',
  age: '',
  education: 'college',
  ancestry1: 'british',
  ancestry2: '',
};

function PersonForm({ data, onChange, label, accentColor, side }) {
  return (
    <div
      className="glass rounded-2xl p-6 space-y-5"
      style={{ borderTop: `2px solid ${accentColor}40` }}
    >
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40`, color: accentColor }}
        >
          {side}
        </div>
        <h3 className="text-sm font-semibold text-white/80">{label}</h3>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">Name</label>
        <input
          type="text"
          value={data.name}
          onChange={e => onChange({ ...data, name: e.target.value })}
          placeholder="e.g. Elizabeth"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
        />
      </div>

      {/* Age */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">Age</label>
        <input
          type="number"
          value={data.age}
          onChange={e => onChange({ ...data, age: Number(e.target.value) })}
          placeholder="e.g. 25"
          min="18"
          max="80"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
        />
      </div>

      {/* Education */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">Education</label>
        <select
          value={data.education}
          onChange={e => onChange({ ...data, education: e.target.value })}
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 transition-colors"
        >
          {EDUCATION_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Primary ancestry */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">Primary Ancestry</label>
        <select
          value={data.ancestry1}
          onChange={e => onChange({ ...data, ancestry1: e.target.value })}
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 transition-colors"
        >
          {ANCESTRIES.map(a => (
            <option key={a.id} value={a.id}>{a.label} — {a.region}</option>
          ))}
        </select>
      </div>

      {/* Secondary ancestry (optional) */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">
          Secondary Ancestry <span className="text-white/20">(optional)</span>
        </label>
        <select
          value={data.ancestry2}
          onChange={e => onChange({ ...data, ancestry2: e.target.value })}
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 transition-colors"
        >
          <option value="">— None —</option>
          {ANCESTRIES.map(a => (
            <option key={a.id} value={a.id}>{a.label} — {a.region}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function ProfileInput({ onExit }) {
  const [personA, setPersonA] = useState({ ...DEFAULT_PERSON, name: '', ancestry1: 'british' });
  const [personB, setPersonB] = useState({ ...DEFAULT_PERSON, name: '', ancestry1: 'german' });
  const [result, setResult] = useState(null);
  const [showCalc, setShowCalc] = useState(false);

  const ancestriesA = [personA.ancestry1, personA.ancestry2].filter(Boolean);
  const ancestriesB = [personB.ancestry1, personB.ancestry2].filter(Boolean);

  const handleCompute = () => {
    const res = computeFullScore({
      ancestriesA,
      ancestriesB,
      ageA: Number(personA.age) || 28,
      ageB: Number(personB.age) || 28,
      eduA: personA.education,
      eduB: personB.education,
    });
    setResult(res);
    setShowCalc(false);
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const isValid = personA.ancestry1 && personB.ancestry1;

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
              <p className="text-xs text-white/30">Manual Match Input</p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 px-4 py-2 rounded-full"
          >
            ← Back
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="font-display text-2xl text-white mb-2">Enter Your Match</h2>
          <p className="text-sm text-white/40">Fill in both profiles to compute your Relationship Synergy Score</p>
        </div>

        {/* Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PersonForm data={personA} onChange={setPersonA} label="Person A" accentColor="#C41E3A" side="A" />
          <PersonForm data={personB} onChange={setPersonB} label="Person B" accentColor="#3b82f6" side="B" />
        </div>

        {/* Live preview */}
        {isValid && (
          <div className="glass rounded-2xl p-5 mb-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-white/40 mb-1">Cultural Distance Preview</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-white">
                  {computeFullScore({ ancestriesA, ancestriesB, ageA: Number(personA.age)||28, ageB: Number(personB.age)||28, eduA: personA.education, eduB: personB.education }).psi.toFixed(3)}
                </span>
                <span className="text-white/40 text-sm">ψ</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCalc(v => !v)}
                className="text-xs border border-white/15 text-white/60 hover:text-white/80 hover:border-white/25 px-4 py-2 rounded-full transition-colors"
              >
                {showCalc ? 'Hide' : 'Show'} Calculation
              </button>
              <button
                onClick={handleCompute}
                className="px-6 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #C41E3A, #8B0000)',
                  boxShadow: '0 4px 20px rgba(196,30,58,0.4)',
                }}
              >
                Compute Score →
              </button>
            </div>
          </div>
        )}

        {/* Inline calculation */}
        {showCalc && isValid && (
          <div className="glass rounded-2xl p-6 mb-6 animate-scale-in">
            <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-widest">Step-by-Step Calculation</h3>
            <CalculationEngine
              result={computeFullScore({
                ancestriesA,
                ancestriesB,
                ageA: Number(personA.age)||28,
                ageB: Number(personB.age)||28,
                eduA: personA.education,
                eduB: personB.education,
              })}
              revealStep={6}
            />
          </div>
        )}

        {!isValid && (
          <div className="text-center py-8 text-white/25 text-sm">
            Select ancestries for both people to compute compatibility
          </div>
        )}

        {/* Results */}
        {result && (
          <div id="results-section" className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-white/5" />
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest px-4">Compatibility Results</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <ResultsDashboard
              result={result}
              personA={{ name: personA.name || 'Person A' }}
              personB={{ name: personB.name || 'Person B' }}
              animated
            />
          </div>
        )}
      </div>
    </div>
  );
}
