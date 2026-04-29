import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

// ─── Survey 4 data (n=285, Prolific, 2024) ───────────────────────────────────

const Tip = ({ active, payload, label, fmt = v => v }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg p-3 text-xs border border-white/10 space-y-1 shadow-xl">
      <p className="text-white/60 font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill ?? p.color ?? '#fff' }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

function MetricCard({ value, label, sub, color = '#C41E3A', delta }) {
  return (
    <div className="glass rounded-2xl p-5 text-center space-y-1">
      <p className="text-3xl font-bold font-mono" style={{ color }}>{value}</p>
      <p className="text-xs font-semibold text-white/70">{label}</p>
      {sub && <p className="text-xs text-white/50">{sub}</p>}
      {delta && (
        <p className="text-xs font-mono mt-1 px-2 py-0.5 rounded-full inline-block"
          style={{ background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e30' }}>
          {delta}
        </p>
      )}
    </div>
  );
}

function ChartSection({ title, sub, children, note }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {sub && <p className="text-xs text-white/50 mt-0.5">{sub}</p>}
      </div>
      {children}
      {note && <p className="text-xs text-white/38 italic">{note}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MarketValidation() {
  return (
    <div className="space-y-10 pb-4">

      <div className="text-center">
        <h2 className="font-display text-2xl text-white mb-1">Market Validation</h2>
        <p className="text-xs text-white/50">Survey 4 · n=285 · Prolific Academic · Median age 47 · 51% female · 2024</p>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard value="67%" label="Would adopt Reprium"    sub="vs 41% existing apps"    color="#C41E3A" delta="+62% lift" />
        <MetricCard value="$8.66" label="Mean WTP"             sub="vs $3.64 existing apps"  color="#D4AF37" delta="2.4× higher" />
        <MetricCard value="$18.14" label="WTP among payers"   sub="out of $30 max"           color="#22c55e" />
        <MetricCard value="44%" label="Non-users converted"    sub="new addressable market"   color="#60a5fa" />
      </div>

      <div className="glass rounded-2xl p-6 space-y-8">

        {/* ── Adoption rate ── */}
        <ChartSection
          title="Adoption Rate"
          sub="'Would you use this app?' — % answering yes (n=285)"
          note="Reprium adoption rate is 62% higher than existing dating apps."
        >
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={[
                { label: 'Existing App', value: 41.4, fill: '#475569' },
                { label: 'Reprium',       value: 67.0, fill: '#C41E3A' },
              ]}
              margin={{ top: 8, right: 24, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 85]} tickFormatter={v => v + '%'} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip fmt={v => v.toFixed(1) + '%'} />} />
              <Bar dataKey="value" name="Adoption rate" radius={[6, 6, 0, 0]} maxBarSize={90} label={{ position: 'top', fill: 'rgba(255,255,255,0.5)', fontSize: 12, formatter: v => v.toFixed(1) + '%' }}>
                {[{ fill: '#475569' }, { fill: '#C41E3A' }].map((c, i) => <Cell key={i} fill={c.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        <div className="border-t border-white/5" />

        {/* ── Would pay + WTP side-by-side ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ChartSection
            title="% Willing to Pay"
            sub="Full sample, n=285"
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { label: 'Existing App',   value: 28.8, fill: '#475569' },
                  { label: 'Long-Lasting',   value: 52.3, fill: '#60a5fa' },
                  { label: 'Prosperity',     value: 42.8, fill: '#a78bfa' },
                  { label: 'Reprium',        value: 47.7, fill: '#C41E3A' },
                ]}
                margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 70]} tickFormatter={v => v + '%'} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip fmt={v => v.toFixed(1) + '%'} />} />
                <Bar dataKey="value" name="Would pay" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: 'rgba(255,255,255,0.4)', fontSize: 10, formatter: v => v.toFixed(0) + '%' }}>
                  {['#475569','#60a5fa','#a78bfa','#C41E3A'].map((c, i) => <Cell key={i} fill={c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>

          <ChartSection
            title="Mean WTP ($/month)"
            sub="Full sample including non-payers"
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { label: 'Existing App', value: 3.64,  fill: '#475569' },
                  { label: 'Long-Lasting', value: 8.26,  fill: '#60a5fa' },
                  { label: 'Prosperity',   value: 7.38,  fill: '#a78bfa' },
                  { label: 'Reprium',      value: 8.66,  fill: '#C41E3A' },
                ]}
                margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => '$' + v} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip fmt={v => '$' + v.toFixed(2)} />} />
                <Bar dataKey="value" name="Mean WTP" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: 'rgba(255,255,255,0.4)', fontSize: 10, formatter: v => '$' + v.toFixed(2) }}>
                  {['#475569','#60a5fa','#a78bfa','#C41E3A'].map((c, i) => <Cell key={i} fill={c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>
        </div>

        <div className="border-t border-white/5" />

        {/* ── Gender + Age ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ChartSection
            title="WTP by Gender"
            sub="Existing app vs Reprium ($/month)"
          >
            <ResponsiveContainer width="100%" height={190}>
              <BarChart
                data={[
                  { label: 'Male',   app: 4.65,  reprium: 9.93  },
                  { label: 'Female', app: 2.64,  reprium: 7.41  },
                ]}
                margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => '$' + v} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip fmt={v => '$' + v.toFixed(2)} />} />
                <Bar dataKey="app"     name="Existing App" fill="#475569" radius={[4,4,0,0]} />
                <Bar dataKey="reprium" name="Reprium"      fill="#C41E3A" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>

          <ChartSection
            title="Reprium WTP by Age"
            sub="40+ cohort pays 49% more ($/month)"
            note="Older users seeking serious relationships show highest intent-to-pay."
          >
            <ResponsiveContainer width="100%" height={190}>
              <BarChart
                data={[
                  { label: 'Under 40', value: 6.70 },
                  { label: '40+',      value: 10.00 },
                ]}
                margin={{ top: 8, right: 24, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 14]} tickFormatter={v => '$' + v} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip fmt={v => '$' + v.toFixed(2)} />} />
                <Bar dataKey="value" name="WTP Reprium" radius={[6, 6, 0, 0]} maxBarSize={90} label={{ position: 'top', fill: 'rgba(255,255,255,0.5)', fontSize: 13, formatter: v => '$' + v.toFixed(2) }}>
                  <Cell fill="#60a5fa" />
                  <Cell fill="#C41E3A" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>
        </div>

        <div className="border-t border-white/5" />

        {/* ── Feature importance ── */}
        <ChartSection
          title="What Users Value (1–5 scale)"
          sub="Both core Reprium features rate near ceiling — strong product-market fit signal"
        >
          <div className="grid grid-cols-2 gap-6 mt-3">
            {[
              { label: 'Long-lasting relationship', value: 4.57, color: '#C41E3A' },
              { label: 'Child prosperity',           value: 4.45, color: '#D4AF37' },
            ].map(d => (
              <div key={d.label} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs text-white/55">{d.label}</p>
                  <p className="text-lg font-bold font-mono" style={{ color: d.color }}>{d.value}<span className="text-xs text-white/38 ml-0.5">/5</span></p>
                </div>
                <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(d.value / 5) * 100}%`, background: `linear-gradient(90deg, ${d.color}99, ${d.color})` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartSection>

      </div>

      {/* ── New market callout ── */}
      <div className="glass rounded-2xl p-6 border-l-4" style={{ borderLeftColor: '#D4AF37' }}>
        <p className="text-sm font-semibold text-white mb-2">New Market — Not Just Re-Engaging Existing Users</p>
        <p className="text-sm text-white/70 leading-relaxed">
          Of the <strong className="text-white">167 respondents who don't use existing dating apps</strong>, <strong className="text-white">43.7% would adopt Reprium</strong>. Reprium isn't competing for the same swipe-fatigue audience — it's opening a new segment of relationship-serious adults who find swipe-based apps unappealing.
        </p>
      </div>

      {/* ── Revenue opportunity ── */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-white">Revenue Opportunity</h3>
        <p className="text-xs text-white/65">Based on the survey's willingness-to-pay data, applied to the existing dating app market.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-5 text-center">
            <p className="text-3xl font-bold font-mono" style={{ color: '#D4AF37' }}>2.4×</p>
            <p className="text-xs font-semibold text-white/70 mt-1">Higher WTP than existing apps</p>
            <p className="text-xs text-white/45 mt-0.5">$8.66 vs $3.64 mean willingness to pay per month</p>
          </div>
          <div className="glass rounded-xl p-5 text-center">
            <p className="text-3xl font-bold font-mono text-white">$363M+</p>
            <p className="text-xs font-semibold text-white/70 mt-1">Conservative annual revenue</p>
            <p className="text-xs text-white/45 mt-0.5">Bumble's 3.5M payers × Reprium's WTP × 12 months</p>
          </div>
          <div className="glass rounded-xl p-5 text-center">
            <p className="text-3xl font-bold font-mono" style={{ color: '#C41E3A' }}>$3.7B</p>
            <p className="text-xs font-semibold text-white/70 mt-1">Full market potential</p>
            <p className="text-xs text-white/45 mt-0.5">75M active dating users × 47.7% payer rate × WTP</p>
          </div>
        </div>
        <p className="text-xs text-white/38">
          Among users already paying for existing apps, <strong className="text-white/65">71% would pay for Reprium</strong> vs 69% for their current app — a direct apples-to-apples measure of switching intent.
        </p>
      </div>

    </div>
  );
}
