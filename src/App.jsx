import { useState } from 'react';
import AutoDemo from './components/AutoDemo';
import ProfileInput from './components/ProfileInput';

function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-white/35">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-3 hover:bg-white/6 transition-colors">
      <div className="text-2xl">{icon}</div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="text-xs text-white/45 leading-relaxed">{description}</p>
    </div>
  );
}

function Landing({ onDemo, onManual }) {
  return (
    <div className="min-h-screen bg-premium flex flex-col">
      <div className="absolute inset-0 bg-glow-red pointer-events-none" />
      <div className="absolute inset-0 bg-glow-gold pointer-events-none" />

      {/* Navigation bar */}
      <nav className="relative flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: 'rgba(196,30,58,0.2)', border: '1px solid rgba(196,30,58,0.4)', color: '#C41E3A' }}>
            R
          </div>
          <span className="font-display text-lg text-white font-semibold tracking-tight">Reprium</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs text-white/40">
          <span>Science-Based Fortune Teller</span>
        </div>
        <button
          onClick={onManual}
          className="text-xs border border-white/15 text-white/60 hover:text-white/80 hover:border-white/25 px-4 py-2 rounded-full transition-colors"
        >
          Try Manual Mode
        </button>
      </nav>

      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-white/60 border border-white/10 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Science-based compatibility modeling · Research-grade coefficients
          </div>

          {/* Title */}
          <div className="animate-fade-in-up delay-100">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white leading-none tracking-tight mb-4">
              Reprium
              <br />
              <span className="text-gradient-red">Compatibility</span>
              <br />
              <span className="text-4xl md:text-5xl lg:text-6xl text-white/60 font-normal italic">Engine</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-white/45 max-w-xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Science-based relationship and offspring prediction. Reprium maps where a couple sits on the cultural synergy curve.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <button
              onClick={onDemo}
              className="group relative px-8 py-4 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-2xl min-w-52"
              style={{
                background: 'linear-gradient(135deg, #C41E3A 0%, #8B0000 100%)',
                boxShadow: '0 4px 30px rgba(196,30,58,0.35)',
              }}
            >
              <span className="flex items-center gap-2 justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Watch Auto Demo
              </span>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent)' }} />
            </button>

            <button
              onClick={onManual}
              className="px-8 py-4 rounded-2xl text-white/80 font-semibold text-sm border border-white/15 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all min-w-52"
            >
              Enter Your Own Match
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-14 pt-6 animate-fade-in-up delay-500">
            <StatCard value="~1M" label="Couples analyzed" />
            <div className="w-px h-10 bg-white/10" />
            <StatCard value="2,000+" label="Ancestry pairs" />
            <div className="w-px h-10 bg-white/10" />
            <StatCard value="30yr" label="CPS data (1994–2024)" />
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative max-w-5xl mx-auto px-6 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in-up delay-700">
          <FeatureCard
            icon="📐"
            title="Relationship Synergy Score"
            description="Ranked 0–100 based on cultural distance, age, education, and ancestry fixed effects. The strongest matches are not always the most similar or the most different."
          />
          <FeatureCard
            icon="👶"
            title="Child Well-Being Prediction"
            description="Prosperity, educational attainment, creativity, and focus scores based on parental cultural distance. An intermediate mix delivers peak outcomes."
          />
          <FeatureCard
            icon="⚖️"
            title="Spark vs. Cohesion Tradeoff"
            description="Balanced cultural distance creates both cohesion and spark. Reprium identifies the optimal zone where both thrive."
          />
        </div>
      </div>

      {/* Quote banner */}
      <div className="relative border-t border-white/5 py-8 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-sm md:text-base text-white/40 italic leading-relaxed font-display">
            "An intermediate level of cultural dissimilarity strikes the ideal balance — sufficient similarities for cohesion and enough differences for spark."
          </blockquote>
          <p className="text-xs text-white/20 mt-3">— Reprium Research</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-6 px-6 text-center">
        <p className="text-xs text-white/20 max-w-2xl mx-auto">
          Prototype demonstration only. Scores are illustrative and based on simplified coefficients inspired by Reprium research, not the full proprietary model.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState('landing'); // 'landing' | 'demo' | 'manual'

  if (mode === 'demo') return <AutoDemo onExit={() => setMode('landing')} />;
  if (mode === 'manual') return <ProfileInput onExit={() => setMode('landing')} />;

  return <Landing onDemo={() => setMode('demo')} onManual={() => setMode('manual')} />;
}
