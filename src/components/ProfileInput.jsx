import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { COUNTRIES, EDUCATION_OPTIONS } from '../data/countries';
import { computeFullScore } from '../lib/scoring';
import ResultsDashboard from './ResultsDashboard';
import CalculationEngine from './CalculationEngine';

const DEFAULT_PERSON = { name: '', age: '', education: 'college', country1: 'GBR', country2: '' };

// ─── Searchable country combobox ─────────────────────────────────────────────
function CountrySelect({ value, onChange, placeholder = 'Search country…' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const triggerRef = useRef(null);
  const ref = useRef(null);

  const selected = COUNTRIES.find(c => c.isoCode === value);

  const filtered = query.length === 0
    ? COUNTRIES
    : COUNTRIES.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.region.toLowerCase().includes(query.toLowerCase()) ||
        c.isoCode.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleOpen() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
    setOpen(o => !o);
    setQuery('');
  }

  const dropdown = open && (
    <div
      ref={ref}
      style={dropdownStyle}
      className="bg-slate-900 border border-white/15 rounded-lg shadow-2xl overflow-hidden"
    >
      <div className="p-2 border-b border-white/10">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type to search…"
          className="w-full bg-white/5 rounded px-3 py-1.5 text-sm text-white placeholder-white/30 outline-none"
        />
      </div>
      <div className="overflow-y-auto max-h-56">
        {value && (
          <div
            className="px-4 py-2 text-xs text-white/30 hover:bg-white/5 cursor-pointer"
            onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
          >
            — Clear selection —
          </div>
        )}
        {filtered.length === 0 && (
          <div className="px-4 py-3 text-xs text-white/30">No countries found</div>
        )}
        {filtered.map(c => (
          <div
            key={c.isoCode}
            onClick={() => { onChange(c.isoCode); setOpen(false); setQuery(''); }}
            className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between gap-2 transition-colors ${c.isoCode === value ? 'text-white bg-white/8' : 'text-white/70 hover:bg-white/5'}`}
          >
            <span>{c.label}</span>
            <span className="text-white/30 text-xs shrink-0">{c.region}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div
        ref={triggerRef}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white cursor-pointer flex items-center justify-between gap-2 hover:border-white/20 transition-colors"
        onClick={handleOpen}
      >
        <span className={selected ? 'text-white' : 'text-white/25'}>
          {selected ? `${selected.label} — ${selected.region}` : placeholder}
        </span>
        <span className="text-white/30 text-xs shrink-0">{open ? '▲' : '▼'}</span>
      </div>
      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}

// ─── Person form ──────────────────────────────────────────────────────────────
function PersonForm({ data, onChange, label, accentColor, side }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-5" style={{ borderTop: `2px solid ${accentColor}40` }}>
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40`, color: accentColor }}
        >
          {side}
        </div>
        <h3 className="text-sm font-semibold text-white/80">{label}</h3>
      </div>

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

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">Age</label>
        <input
          type="number"
          value={data.age}
          onChange={e => onChange({ ...data, age: Number(e.target.value) })}
          placeholder="e.g. 28"
          min="18" max="80"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
        />
      </div>

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

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">Primary Country of Ancestry</label>
        <CountrySelect
          value={data.country1}
          onChange={v => onChange({ ...data, country1: v })}
          placeholder="Select country…"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">
          Secondary Country <span className="text-white/20">(optional — mixed heritage)</span>
        </label>
        <CountrySelect
          value={data.country2}
          onChange={v => onChange({ ...data, country2: v })}
          placeholder="— None —"
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProfileInput({ onExit, hideBack = false }) {
  const [personA, setPersonA] = useState({ ...DEFAULT_PERSON, name: '', country1: 'GBR' });
  const [personB, setPersonB] = useState({ ...DEFAULT_PERSON, name: '', country1: 'DEU' });
  const [result, setResult] = useState(null);
  const [showCalc, setShowCalc] = useState(false);
  const [calcStep, setCalcStep] = useState(0);
  const resultsRef = useRef(null);

  // Scroll to results whenever overlay closes (showCalc goes false while result exists)
  useEffect(() => {
    if (showCalc || !result) return;
    const t = setTimeout(() => {
      if (!resultsRef.current) return;
      const top = resultsRef.current.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 300);
    return () => clearTimeout(t);
  }, [showCalc, result]);

  const ancestriesA = [personA.country1, personA.country2].filter(Boolean);
  const ancestriesB = [personB.country1, personB.country2].filter(Boolean);

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
    setShowCalc(true);
    setCalcStep(0);
    // Animate steps: 0→1→2→3→4→5→6, one every 500ms
    [100, 600, 1100, 1600, 2100, 2600].forEach((delay, i) => {
      setTimeout(() => setCalcStep(i + 1), delay);
    });
    // Auto-dismiss after animation completes (scroll handled by effect)
    setTimeout(() => setShowCalc(false), 3300);
  };

  const dismissCalc = () => setShowCalc(false);

  const isValid = personA.country1 && personB.country1;

  const liveScore = isValid ? computeFullScore({
    ancestriesA, ancestriesB,
    ageA: Number(personA.age) || 28, ageB: Number(personB.age) || 28,
    eduA: personA.education, eduB: personB.education,
  }) : null;

  return (
    <div className="min-h-screen bg-premium">
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      <div className="absolute inset-0 bg-glow-gold pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-8">
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
          {!hideBack && (
            <button onClick={onExit} className="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 px-4 py-2 rounded-full">
              ← Back
            </button>
          )}
        </div>

        <div className="text-center mb-8">
          <h2 className="font-display text-2xl text-white mb-2">Enter Your Match</h2>
          <p className="text-sm text-white/40">Fill in both profiles to compute your Relationship Synergy Score</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PersonForm data={personA} onChange={setPersonA} label="Person A" accentColor="#C41E3A" side="A" />
          <PersonForm data={personB} onChange={setPersonB} label="Person B" accentColor="#3b82f6" side="B" />
        </div>

        {isValid && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleCompute}
              className="px-10 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #C41E3A, #8B0000)', boxShadow: '0 4px 20px rgba(196,30,58,0.4)' }}
            >
              Compute Compatibility Score →
            </button>
          </div>
        )}

        {!isValid && (
          <div className="text-center py-8 text-white/25 text-sm">
            Select countries for both people to compute compatibility
          </div>
        )}

        {result && (
          <div ref={resultsRef} id="results-section" className="animate-fade-in-up">
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

      {/* Calculation loading overlay */}
      {showCalc && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(6,6,20,0.92)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-lg w-full mx-4 animate-scale-in">
            <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-mono mb-0.5">Analyzing Profiles</p>
                  <p className="text-sm font-semibold text-white">
                    {personA.name || 'Person A'} × {personB.name || 'Person B'}
                  </p>
                </div>
                <button
                  onClick={dismissCalc}
                  className="text-xs text-white/30 hover:text-white/60 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all"
                >
                  Skip →
                </button>
              </div>
              <CalculationEngine result={result} revealStep={calcStep} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
