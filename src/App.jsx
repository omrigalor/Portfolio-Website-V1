import { useState } from 'react';
import Portfolio from './components/Portfolio';
import AutoDemo from './components/AutoDemo';
import ProfileInput from './components/ProfileInput';
import InsightsPage from './components/InsightsPage';
import MarketValidation from './components/MarketValidation';
import AttritionApp from './components/AttritionApp';
import LoanApp from './components/LoanApp';
import VCModel from './components/VCModel';

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'home',     label: 'Home',     icon: '⌂' },
  { id: 'demo',     label: 'Demo',     icon: '▶' },
  { id: 'match',    label: 'Match',    icon: '⊕' },
  { id: 'insights', label: 'Insights', icon: '◈' },
  { id: 'market',   label: 'Market',   icon: '◆' },
];

function TabBar({ active, onChange, onBack }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10"
      style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-5xl mx-auto flex">
        <button
          onClick={onBack}
          className="flex flex-col items-center justify-center py-3 px-4 gap-1 transition-all text-white/38 hover:text-white/70 border-r border-white/8"
          title="Back to portfolio"
        >
          <span className="text-base leading-none">←</span>
          <span className="text-xs tracking-wide">Portfolio</span>
        </button>
        {TABS.filter(t => t.id !== 'home').map(t => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all"
              style={{ color: isActive ? '#C41E3A' : 'rgba(255,255,255,0.35)' }}
            >
              <span className="text-base leading-none">{t.icon}</span>
              <span className="text-xs font-medium tracking-wide">{t.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full"
                  style={{ background: '#C41E3A', boxShadow: '0 0 8px rgba(196,30,58,0.8)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Reprium home (choose Demo or Match) ─────────────────────────────────────

function RepriumHome({ onDemo, onMatch, onBack }) {
  return (
    <div className="min-h-screen bg-premium flex flex-col items-center justify-center px-6 pb-24">
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      <div className="absolute inset-0 bg-glow-gold pointer-events-none" />
      <div className="absolute top-4 left-4 z-10">
        <button onClick={onBack} className="text-xs text-white/55 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all">
          ← Portfolio
        </button>
      </div>

      <div className="relative max-w-xl w-full text-center space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-white/70 border border-white/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            US 11,847,293 B2 · Patent
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-3 tracking-tight">Reprium</h1>
          <p className="text-sm text-white/65 leading-relaxed max-w-sm mx-auto">
            Predictive Algorithm for Relationship Longevity & Offspring Prosperity. Science-based compatibility powered by ancestral migratory distance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onDemo}
            className="px-8 py-4 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #C41E3A, #8B0000)', boxShadow: '0 4px 30px rgba(196,30,58,0.4)' }}
          >
            <span className="flex items-center gap-2 justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Watch Demo
            </span>
          </button>
          <button
            onClick={onMatch}
            className="px-8 py-4 rounded-2xl text-white/80 font-semibold text-sm border border-white/15 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all"
          >
            Enter Your Match
          </button>
        </div>

        <div className="flex items-center justify-center gap-10 pt-2">
          {[
            { value: '839k', label: 'Couples analyzed' },
            { value: '120', label: 'Countries' },
            { value: 'ψ*=0.24', label: 'Optimal distance' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold font-mono text-white">{s.value}</p>
              <p className="text-xs text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Coming-soon model landing ────────────────────────────────────────────────

function ModelComingSoon({ name, patentNo, desc, accent, onBack }) {
  return (
    <div className="min-h-screen bg-premium flex flex-col items-center justify-center px-6 pb-24">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${accent}12, transparent)` }} />
      <div className="relative max-w-xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs border border-white/10 mb-2"
          style={{ color: accent }}>
          {patentNo} · Patent
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight">{name}</h1>
        <p className="text-sm text-white/65 leading-relaxed">{desc}</p>
        <div className="glass rounded-2xl p-6 border" style={{ borderColor: accent + '30' }}>
          <p className="text-sm font-semibold text-white/70 mb-1">Model in Development</p>
          <p className="text-xs text-white/50 leading-relaxed">
            Empirical validation underway. The model applies the same Intra-Ancestral Divergence framework established in the Relationship Longevity paper to this domain.
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-white/58 hover:text-white/70 border border-white/10 hover:border-white/20 px-5 py-2 rounded-full transition-all"
        >
          ← Back to Portfolio
        </button>
      </div>
    </div>
  );
}

// ─── Reprium app shell ────────────────────────────────────────────────────────

function RepriumApp({ onBack }) {
  const [tab, setTab] = useState('home');

  if (tab === 'home') return <RepriumHome onDemo={() => setTab('demo')} onMatch={() => setTab('match')} onBack={onBack} />;

  return (
    <div className="min-h-screen bg-premium pb-20">
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      <div className="absolute inset-0 bg-glow-gold pointer-events-none" />
      <div className="sticky top-0 z-50 flex items-center px-4 py-2.5 border-b border-white/8"
        style={{ background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(20px)' }}>
        <button onClick={onBack} className="text-xs text-white/55 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all">
          ← Portfolio
        </button>
      </div>
      <div className="relative">
        {tab === 'demo'     && <AutoDemo     onExit={() => setTab('home')} hideBack />}
        {tab === 'match'    && <ProfileInput onExit={() => setTab('home')} hideBack />}
        {tab === 'insights' && <InsightsPage onExit={() => setTab('home')} hideBack />}
        {tab === 'market'   && (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <MarketValidation />
          </div>
        )}
      </div>
      <TabBar active={tab} onChange={setTab} onBack={onBack} />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState('portfolio');

  if (mode === 'reprium')   return <RepriumApp onBack={() => setMode('portfolio')} />;

  if (mode === 'attrition') return <AttritionApp onBack={() => setMode('portfolio')} />;

  if (mode === 'loan') return <LoanApp onBack={() => setMode('portfolio')} />;

  if (mode === 'vc') return <VCModel onBack={() => setMode('portfolio')} />;

  return (
    <Portfolio
      onOpenReprium={()   => setMode('reprium')}
      onOpenAttrition={() => setMode('attrition')}
      onOpenLoan={()      => setMode('loan')}
      onOpenVC={()        => setMode('vc')}
    />
  );
}
