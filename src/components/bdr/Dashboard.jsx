import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { api, streamAI } from '../../lib/bdrApi';
import { fmtEur, scoreColor, tierClass, tierLabel } from '../../lib/bdrUtils';

const TIER_COLORS = { tier_1_hot:'#4ade80', tier_2_warm:'#fb923c', tier_3_nurture:'#a5b4fc', tier_4_archive:'#94a3b8' };
const ACCENT = '#FFA040';

function KPI({ label, value, sub, accent }) {
  return (
    <div className="bdr-kpi">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono" style={{ color: accent || 'white' }}>{value}</p>
      {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard({ onNav }) {
  const [kpis, setKpis] = useState(null);
  const [leads, setLeads] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [report, setReport] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    api.analytics.kpis().then(setKpis);
    api.leads.list().then(setLeads);
    api.outbound.weeklyStats().then(setWeekly);
  }, []);

  async function generateReport() {
    setGeneratingReport(true);
    setReport('');
    await streamAI('/ai/weekly-report', {}, chunk => setReport(p => p + chunk));
    setGeneratingReport(false);
  }

  const top10 = [...leads].sort((a,b) => b.composite_score - a.composite_score).slice(0,10);
  const tierDist = ['tier_1_hot','tier_2_warm','tier_3_nurture','tier_4_archive'].map(t => ({
    name: { tier_1_hot:'Hot', tier_2_warm:'Warm', tier_3_nurture:'Nurture', tier_4_archive:'Archive' }[t],
    value: leads.filter(l => l.tier === t).length,
    color: TIER_COLORS[t],
  })).filter(d => d.value > 0);
  const countryDist = Object.entries(leads.reduce((m,l) => { m[l.country]=(m[l.country]||0)+1; return m; }, {}))
    .sort((a,b)=>b[1]-a[1]).slice(0,8).map(([country,count])=>({country,count}));

  const CustomTip = ({ active, payload }) => active && payload?.length ? (
    <div style={{ background:'rgba(10,10,20,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
      {payload.map(p => <p key={p.name} style={{ color: p.fill || ACCENT }}>{p.name || ''}: {p.value}</p>)}
    </div>
  ) : null;

  const stale = leads.filter(l => {
    if (!l.updated_at) return false;
    const days = (Date.now() - new Date(l.updated_at).getTime()) / 86400000;
    return days > 5 && ['qualifying','new'].includes(l.status);
  });

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">EMEA Pipeline Dashboard</h1>
          <p className="text-xs text-white/40 mt-0.5">Anthropic BDR · Live view · {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}</p>
        </div>
        <button className="bdr-btn bdr-btn-secondary flex items-center gap-2" onClick={generateReport} disabled={generatingReport}>
          {generatingReport ? '⟳ Generating…' : '✦ Weekly Report'}
        </button>
      </div>

      {/* Weekly Report Modal */}
      {(report || generatingReport) && (
        <div className="glass rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">AI Weekly Summary</p>
            <button onClick={() => setReport('')} className="text-white/30 hover:text-white/70 text-xs">✕</button>
          </div>
          <pre className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-sans">
            {report}{generatingReport && <span className="animate-pulse text-orange-400">▊</span>}
          </pre>
        </div>
      )}

      {/* KPI Row */}
      {kpis && (
        <div className="grid grid-cols-4 gap-3">
          <KPI label="Total Active Leads" value={kpis.total_leads} sub={`+${kpis.new_this_week} this week`} />
          <KPI label="Avg Composite Score" value={`${kpis.avg_score}/100`} accent={scoreColor(kpis.avg_score)} />
          <KPI label="Tier-1 Hot Leads" value={kpis.tier1} sub="Immediate AE handoff" accent="#4ade80" />
          <KPI label="Weighted Pipeline" value={fmtEur(kpis.pipeline_value)} sub="Expected ACV × Conv. prob" accent={ACCENT} />
        </div>
      )}

      {/* Tier + Conversion Row */}
      {kpis && (
        <div className="grid grid-cols-4 gap-3">
          <KPI label="Tier-2 Warm" value={kpis.tier2} sub="BDR qualification call" accent="#fb923c" />
          <KPI label="Avg Conversion Prob." value={`${kpis.avg_conversion_prob}%`} />
          <KPI label="Enterprise Route" value={kpis.enterprise_count} sub={`€120K avg ACV`} accent="#60a5fa" />
          <KPI label="Startup Route" value={kpis.startup_count} sub={`€25K avg ACV`} accent="#a78bfa" />
        </div>
      )}

      {/* Outbound Activity */}
      {weekly && (
        <div className="glass rounded-xl p-5">
          <p className="bdr-section-title">Outbound Activity — This Week</p>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs text-white/40">Touches</p>
              <p className="text-2xl font-bold font-mono" style={{ color: weekly.touches >= weekly.target ? '#4ade80' : ACCENT }}>
                {weekly.touches}<span className="text-sm text-white/30 font-normal">/{weekly.target}</span>
              </p>
            </div>
            <div className="flex-1">
              <div className="bdr-score-track">
                <div className="h-full rounded-full transition-all" style={{ width:`${Math.min(100,(weekly.touches/weekly.target)*100)}%`, background: weekly.touches >= weekly.target ? '#4ade80' : ACCENT }} />
              </div>
              <p className="text-xs text-white/30 mt-1">{Math.round((weekly.touches/weekly.target)*100)}% of weekly target</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/40">Meetings</p>
              <p className="text-xl font-bold text-white">{weekly.meetings}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/40">Conversion</p>
              <p className="text-xl font-bold font-mono" style={{ color: '#60a5fa' }}>{weekly.conversion_rate}%</p>
            </div>
            <button className="bdr-btn bdr-btn-secondary text-xs" onClick={() => onNav('outbound')}>View Outbound →</button>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Top leads */}
        <div className="glass rounded-xl p-5 col-span-2">
          <p className="bdr-section-title">Top 10 Leads by Score</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={top10} layout="vertical" margin={{ left: 80, right: 20 }}>
              <XAxis type="number" domain={[0,100]} tick={{ fill:'rgba(255,255,255,0.3)', fontSize:11 }} />
              <YAxis type="category" dataKey="company" tick={{ fill:'rgba(255,255,255,0.6)', fontSize:11 }} width={80} />
              <Tooltip content={<CustomTip />} />
              <Bar dataKey="composite_score" radius={[0,4,4,0]} name="Score">
                {top10.map((l,i) => <Cell key={i} fill={TIER_COLORS[l.tier] || ACCENT} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tier donut */}
        <div className="glass rounded-xl p-5">
          <p className="bdr-section-title">Tier Distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={tierDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {tierDist.map((d,i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {tierDist.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-white/50">{d.name}</span>
                <span className="ml-auto text-white/70 font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Country + Stale Alerts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <p className="bdr-section-title">Pipeline by Country</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={countryDist}>
              <XAxis dataKey="country" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} />
              <YAxis tick={{ fill:'rgba(255,255,255,0.3)', fontSize:11 }} />
              <Tooltip content={<CustomTip />} />
              <Bar dataKey="count" fill={ACCENT} radius={[4,4,0,0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Action items */}
        <div className="glass rounded-xl p-5">
          <p className="bdr-section-title">Action Items</p>
          {stale.length === 0 ? (
            <p className="text-xs text-white/30 mt-4">No overdue items — pipeline is healthy ✓</p>
          ) : (
            <div className="space-y-2">
              {stale.slice(0,6).map(l => (
                <div key={l.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{l.company}</p>
                    <p className="text-xs text-white/35">{l.status} · stale {Math.floor((Date.now()-new Date(l.updated_at).getTime())/86400000)}d</p>
                  </div>
                  <button className="bdr-btn bdr-btn-secondary text-xs py-1 px-2 shrink-0" onClick={() => onNav('leads', l.id)}>Open</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
