import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { api } from '../../lib/bdrApi';

const ACCENT = '#FFA040';
const COLORS = ['#4ade80', '#fb923c', '#a5b4fc', '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#94a3b8'];

const CustomTip = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{ background:'rgba(10,10,20,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 12px', fontSize:12, minWidth:120 }}>
    {label && <p className="text-white/50 mb-1">{label}</p>}
    {payload.map((p,i) => <p key={i} style={{ color: p.fill || p.color || ACCENT }}>{p.name}: {typeof p.value === 'number' && p.value > 100 ? `€${(p.value/1000).toFixed(0)}K` : p.value}</p>)}
  </div>
) : null;

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bdr-kpi">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono" style={{ color: color || 'white' }}>{value}</p>
      {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function FunnelAnalytics() {
  const [funnel, setFunnel] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.analytics.funnel(), api.analytics.patterns()])
      .then(([f, p]) => { setFunnel(f); setPatterns(p); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-3">
        <div className="text-3xl animate-pulse">📊</div>
        <p className="text-white/40">Loading analytics…</p>
      </div>
    </div>
  );

  const funnelStages = funnel?.stages || [];
  const top = funnelStages[0]?.count || 1;
  const funnelViz = funnelStages.map((s, i) => ({
    ...s,
    pct: Math.round((s.count / top) * 100),
    color: COLORS[i] || '#94a3b8',
  }));

  const verticalData = (patterns?.by_vertical || []).map(v => ({
    vertical: v.vertical?.length > 12 ? v.vertical.slice(0,12)+'…' : v.vertical,
    leads: v.count,
    avgScore: Math.round(v.avg_score || 0),
    pipeline: Math.round(v.total_pipeline || 0),
  }));

  const sourceData = (patterns?.by_source || []).map(s => ({
    source: { inbound_web:'Inbound Web', inbound_referral:'Referral', inbound_event:'Event', outbound_cold:'Outbound', outbound_sequence:'Sequence', partner:'Partner' }[s.source] || s.source,
    leads: s.count,
    avgScore: Math.round(s.avg_score || 0),
  }));

  const insights = patterns?.insights || [];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Funnel Analytics</h1>
        <p className="text-xs text-white/40 mt-0.5">Pipeline health · Conversion patterns · Actionable insights</p>
      </div>

      {/* Summary KPIs */}
      {funnel && (
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Total Leads" value={funnel.total} color="white" />
          <StatCard label="Qualified" value={funnel.qualified} sub={`${funnel.total ? Math.round((funnel.qualified/funnel.total)*100) : 0}% qual. rate`} color="#fb923c" />
          <StatCard label="Meetings Booked" value={funnel.meetings} sub="Discovery calls" color="#4ade80" />
          <StatCard label="AE Handoffs" value={funnel.handoffs} sub={`${funnel.qualified ? Math.round((funnel.handoffs/funnel.qualified)*100) : 0}% of qualified`} color="#a78bfa" />
        </div>
      )}

      {/* Funnel visualization + conversion rates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <p className="bdr-section-title mb-4">Pipeline Funnel</p>
          <div className="space-y-2">
            {funnelViz.map((stage, i) => (
              <div key={stage.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 capitalize">{stage.status.replace('_',' ')}</span>
                  <span className="font-mono text-white">{stage.count}</span>
                </div>
                <div className="bdr-score-track">
                  <div className="h-full rounded-full transition-all" style={{ width:`${stage.pct}%`, background: stage.color }} />
                </div>
                {i < funnelViz.length - 1 && stage.count > 0 && funnelViz[i+1] && (
                  <p className="text-xs text-white/25 text-right">
                    ↓ {Math.round((funnelViz[i+1].count / stage.count) * 100)}% convert
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stage conversion rates table */}
        <div className="glass rounded-xl p-5">
          <p className="bdr-section-title mb-4">Stage Conversion Rates</p>
          <div className="space-y-2">
            {(funnel?.conversions || []).map(c => (
              <div key={c.from} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="flex-1">
                  <p className="text-xs text-white/60 capitalize">{c.from.replace('_',' ')} → {c.to.replace('_',' ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 score-bar-track">
                    <div className="h-full rounded-full" style={{ width:`${c.rate}%`, background: c.rate >= 50 ? '#4ade80' : c.rate >= 25 ? '#fb923c' : '#f87171' }} />
                  </div>
                  <span className="text-xs font-mono text-white/70 w-8 text-right">{c.rate}%</span>
                </div>
              </div>
            ))}
            {(!funnel?.conversions || funnel.conversions.length === 0) && (
              <p className="text-xs text-white/30">Not enough stage transitions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* By Vertical */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <p className="bdr-section-title">Leads by Vertical</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={verticalData} margin={{ left: 0, right: 10 }}>
              <XAxis dataKey="vertical" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:10 }} />
              <YAxis tick={{ fill:'rgba(255,255,255,0.3)', fontSize:10 }} />
              <Tooltip content={<CustomTip />} />
              <Bar dataKey="leads" fill={ACCENT} radius={[4,4,0,0]} name="Leads">
                {verticalData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5">
          <p className="bdr-section-title">Avg Score by Vertical</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={verticalData} margin={{ left: 0, right: 10 }}>
              <XAxis dataKey="vertical" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:10 }} />
              <YAxis domain={[0,100]} tick={{ fill:'rgba(255,255,255,0.3)', fontSize:10 }} />
              <Tooltip content={<CustomTip />} />
              <Bar dataKey="avgScore" radius={[4,4,0,0]} name="Avg Score">
                {verticalData.map((v,i) => <Cell key={i} fill={v.avgScore >= 70 ? '#4ade80' : v.avgScore >= 50 ? '#fb923c' : '#a5b4fc'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* By Source */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <p className="bdr-section-title">Lead Sources</p>
          <div className="space-y-3 mt-2">
            {sourceData.map((s, i) => (
              <div key={s.source} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">{s.source}</span>
                  <span className="font-mono text-white">{s.leads} leads · avg {s.avgScore}/100</span>
                </div>
                <div className="bdr-score-track">
                  <div className="h-full rounded-full" style={{ width:`${(s.leads / (sourceData[0]?.leads || 1)) * 100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass rounded-xl p-5" style={{ borderTop: '2px solid rgba(255,160,64,0.3)' }}>
          <p className="bdr-section-title mb-4">✦ Pattern Insights</p>
          {insights.length === 0 ? (
            <p className="text-xs text-white/30">Need more data for pattern detection</p>
          ) : (
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-white/5 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: ACCENT }} />
                  <div>
                    <p className="text-xs font-semibold text-white/80">{ins.title}</p>
                    <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{ins.body}</p>
                    {ins.action && <p className="text-xs text-orange-400 mt-1">→ {ins.action}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
