import { useEffect, useState } from 'react';
import { api } from '../../lib/bdrApi';
import { toast } from './Toast';

const SECTIONS = [
  {
    label: 'Lead Scoring Weights',
    desc: 'Adjust the relative importance of each scoring factor. Higher values amplify that signal in the composite score.',
    color: '#fb923c',
    keys: [
      { key: 'weight_fit', label: 'Company Fit', desc: 'Industry alignment, regulatory profile, AI readiness' },
      { key: 'weight_intent', label: 'Buying Intent', desc: 'Signal strength from source and engagement' },
      { key: 'weight_capacity', label: 'Budget Capacity', desc: 'Company size, funding stage, revenue' },
      { key: 'weight_access', label: 'Decision Access', desc: 'Seniority and authority of contact' },
      { key: 'weight_timing', label: 'Timing', desc: 'Regulatory deadlines, fundraising, product cycles' },
    ],
  },
  {
    label: 'Tier Thresholds',
    desc: 'Score cutoffs that determine how leads are classified into tiers.',
    color: '#4ade80',
    keys: [
      { key: 'tier1_threshold', label: 'Tier 1 — Hot (min score)', desc: 'Immediate AE handoff, high-priority' },
      { key: 'tier2_threshold', label: 'Tier 2 — Warm (min score)', desc: 'BDR qualification call, nurture sequence' },
      { key: 'tier3_threshold', label: 'Tier 3 — Nurture (min score)', desc: 'Long-cycle, low-touch nurture' },
    ],
  },
  {
    label: 'ACV Assumptions',
    desc: 'Expected Annual Contract Value by route. Used to compute weighted pipeline value.',
    color: '#60a5fa',
    keys: [
      { key: 'acv_enterprise', label: 'Enterprise ACV (€)', desc: 'Regulated industries, large orgs, premium contracts' },
      { key: 'acv_startup', label: 'Startup ACV (€)', desc: 'Series A-B, API-first, developer-driven adoption' },
    ],
  },
  {
    label: 'Outbound Targets',
    desc: 'Weekly activity targets for BDR outbound pacing.',
    color: '#a78bfa',
    keys: [
      { key: 'weekly_touch_target', label: 'Weekly Touch Target', desc: 'Total outreach touchpoints per week' },
      { key: 'weekly_meeting_target', label: 'Weekly Meeting Target', desc: 'Discovery calls booked per week' },
    ],
  },
];

const WEIGHT_RANGES = {
  weight_fit: [1, 10], weight_intent: [1, 10], weight_capacity: [1, 10],
  weight_access: [1, 10], weight_timing: [1, 10],
  tier1_threshold: [50, 100], tier2_threshold: [20, 80], tier3_threshold: [0, 60],
  acv_enterprise: [10000, 300000], acv_startup: [5000, 100000],
  weekly_touch_target: [10, 200], weekly_meeting_target: [1, 30],
};

function ConfigSlider({ configKey, label, desc, value, onChange, range }) {
  const [min, max] = range || [0, 100];
  const pct = ((value - min) / (max - min)) * 100;
  const isCurrency = configKey.startsWith('acv_');

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white font-medium">{label}</p>
          <p className="text-xs text-white/35 mt-0.5">{desc}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold font-mono text-white">
            {isCurrency ? `€${Number(value).toLocaleString()}` : value}
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="bdr-score-track">
          <div className="h-full rounded-full" style={{ width:`${pct}%`, background: 'rgba(255,160,64,0.6)' }} />
        </div>
        <input
          type="range" min={min} max={max}
          step={isCurrency ? 5000 : configKey.includes('threshold') ? 1 : 1}
          value={value}
          onChange={e => onChange(configKey, parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>
      <div className="flex justify-between text-xs text-white/20">
        <span>{isCurrency ? `€${min.toLocaleString()}` : min}</span>
        <span>{isCurrency ? `€${max.toLocaleString()}` : max}</span>
      </div>
    </div>
  );
}

export default function Configuration() {
  const [config, setConfig] = useState({});
  const [original, setOriginal] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api.config.getAll().then(data => {
      const mapped = {};
      data.forEach(({ key, value }) => { mapped[key] = parseFloat(value) || value; });
      setConfig(mapped);
      setOriginal(mapped);
    });
  }, []);

  function handleChange(key, val) {
    setConfig(p => ({ ...p, [key]: val }));
    setDirty(true);
  }

  async function saveAll() {
    setSaving(true);
    try {
      const changed = Object.entries(config).filter(([k, v]) => original[k] !== v);
      await Promise.all(changed.map(([key, value]) => api.config.set(key, value)));
      setOriginal({ ...config });
      setDirty(false);
      toast(`${changed.length} setting${changed.length !== 1 ? 's' : ''} saved`);
    } catch { toast('Save failed', 'error'); }
    finally { setSaving(false); }
  }

  function reset() {
    setConfig({ ...original });
    setDirty(false);
  }

  // Compute preview score distribution
  const totalWeights = ['weight_fit','weight_intent','weight_capacity','weight_access','weight_timing']
    .reduce((s, k) => s + (config[k] || 0), 0);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: config sections */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6 max-w-2xl fade-in">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Configuration</h1>
              <p className="text-xs text-white/40 mt-0.5">Tune scoring weights, thresholds, and activity targets</p>
            </div>
            <div className="flex gap-2">
              {dirty && <button className="bdr-btn bdr-btn-secondary text-sm" onClick={reset}>Reset</button>}
              <button className="bdr-btn bdr-btn-primary text-sm" onClick={saveAll} disabled={saving || !dirty}>
                {saving ? 'Saving…' : dirty ? '↑ Save Changes' : 'Saved'}
              </button>
            </div>
          </div>

          {SECTIONS.map(section => (
            <div key={section.label} className="glass rounded-xl p-6 space-y-5" style={{ borderTop: `2px solid ${section.color}30` }}>
              <div>
                <p className="font-semibold text-white">{section.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{section.desc}</p>
              </div>
              <div className="space-y-6">
                {section.keys.map(({ key, label, desc }) => (
                  config[key] !== undefined && (
                    <ConfigSlider
                      key={key}
                      configKey={key}
                      label={label}
                      desc={desc}
                      value={config[key]}
                      onChange={handleChange}
                      range={WEIGHT_RANGES[key]}
                    />
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: live preview */}
      <div className="w-72 border-l border-white/8 overflow-y-auto flex-shrink-0">
        <div className="p-5 space-y-5">
          <p className="text-xs text-white/40 uppercase tracking-wider">Live Preview</p>

          {/* Weight distribution */}
          <div className="glass rounded-xl p-4 space-y-3">
            <p className="text-xs text-white/50 font-medium">Scoring Weight Distribution</p>
            {['weight_fit','weight_intent','weight_capacity','weight_access','weight_timing'].map(k => {
              const w = config[k] || 0;
              const pct = totalWeights > 0 ? Math.round((w / totalWeights) * 100) : 0;
              const label = { weight_fit:'Fit', weight_intent:'Intent', weight_capacity:'Capacity', weight_access:'Access', weight_timing:'Timing' }[k];
              return (
                <div key={k} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">{label}</span>
                    <span className="font-mono text-white/70">{pct}%</span>
                  </div>
                  <div className="bdr-score-track">
                    <div className="h-full rounded-full" style={{ width:`${pct}%`, background: '#FFA040' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tier thresholds visual */}
          <div className="glass rounded-xl p-4 space-y-3">
            <p className="text-xs text-white/50 font-medium">Tier Threshold Map</p>
            <div className="relative h-6 rounded-full overflow-hidden" style={{ background: '#1a1a2e' }}>
              {[
                { key:'tier3_threshold', color:'#a5b4fc', label:'T3' },
                { key:'tier2_threshold', color:'#fb923c', label:'T2' },
                { key:'tier1_threshold', color:'#4ade80', label:'T1' },
              ].map(({ key, color, label }) => (
                <div key={key} className="absolute top-0 h-full flex items-center" style={{ left:`${config[key] || 0}%`, paddingLeft: 4 }}>
                  <div className="w-0.5 h-full" style={{ background: color }} />
                  <span className="text-xs font-bold ml-1" style={{ color }}>{label}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-xs">
              {[
                { key:'tier1_threshold', label:'Tier 1 Hot', color:'#4ade80' },
                { key:'tier2_threshold', label:'Tier 2 Warm', color:'#fb923c' },
                { key:'tier3_threshold', label:'Tier 3 Nurture', color:'#a5b4fc' },
              ].map(({ key, label, color }) => (
                <div key={key} className="flex justify-between">
                  <span className="text-white/40">{label}</span>
                  <span className="font-mono" style={{ color }}>{config[key] || 0}+</span>
                </div>
              ))}
            </div>
          </div>

          {/* ACV preview */}
          <div className="glass rounded-xl p-4 space-y-3">
            <p className="text-xs text-white/50 font-medium">ACV Assumptions</p>
            {[
              { key: 'acv_enterprise', label: 'Enterprise', color: '#60a5fa' },
              { key: 'acv_startup', label: 'Startup', color: '#a78bfa' },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-xs text-white/40">{label}</span>
                <span className="text-sm font-bold font-mono" style={{ color }}>
                  €{Number(config[key] || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Reset to defaults */}
          <button className="bdr-btn bdr-btn-secondary w-full text-xs" onClick={async () => {
            const defaults = {
              weight_fit:3, weight_intent:2, weight_capacity:2, weight_access:2, weight_timing:1,
              tier1_threshold:70, tier2_threshold:40, tier3_threshold:20,
              acv_enterprise:120000, acv_startup:25000,
              weekly_touch_target:50, weekly_meeting_target:5,
            };
            setConfig(prev => ({ ...prev, ...defaults }));
            setDirty(true);
            toast('Defaults loaded — click Save to apply');
          }}>
            ↺ Load Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
