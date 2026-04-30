import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api, streamAI } from '../../lib/bdrApi';
import { portfolioMonteCarlo, fmtEur } from '../../lib/monteCarlo';

const ACCENT = '#FFA040';
const TIER_COLOR = { 'Tier 1': '#4ade80', 'Tier 2': '#fb923c', 'Tier 3': '#94a3b8' };

const MCTip = ({ active, payload }) => active && payload?.length ? (
  <div style={{ background:'rgba(10,10,20,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'6px 10px', fontSize:11 }}>
    <p style={{ color: ACCENT }}>~€{payload[0]?.payload?.x}K · {payload[0]?.value} outcomes</p>
  </div>
) : null;

export default function Dashboard({ onNav }) {
  const [kpis, setKpis]       = useState(null);
  const [leads, setLeads]     = useState([]);
  const [actions, setActions] = useState([]);
  const [report, setReport]   = useState('');
  const [generating, setGen]  = useState(false);
  const [mc, setMC]           = useState(null);

  useEffect(() => {
    Promise.all([api.analytics.kpis(), api.leads.list(), api.analytics.actionItems()])
      .then(([k, l, a]) => { setKpis(k); setLeads(l); setActions(a); setMC(portfolioMonteCarlo(l)); });
  }, []);

  async function generateReport() {
    setGen(true); setReport('');
    await streamAI('/ai/weekly-report', {}, chunk => setReport(p => p + chunk));
    setGen(false);
  }

  const top5 = leads.slice(0, 5);

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline Overview</h1>
          <p className="text-sm text-white/40 mt-1">{new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
        <button className="btn-secondary flex items-center gap-2 text-sm" onClick={generateReport} disabled={generating}>
          {generating ? '⟳ Generating…' : '✦ Weekly Summary'}
        </button>
      </div>

      {(report || generating) && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">AI Weekly Summary</p>
            <button onClick={() => setReport('')} className="text-white/25 hover:text-white/60 text-xs transition-colors">✕</button>
          </div>
          <pre className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-sans">
            {report}{generating && <span className="animate-pulse" style={{ color: ACCENT }}>▊</span>}
          </pre>
        </div>
      )}

      {mc && kpis && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Pipeline Forecast · 2,000 Monte Carlo Simulations</p>
              <p className="text-3xl font-bold font-mono" style={{ color: ACCENT }}>{fmtEur(mc.p5)} – {fmtEur(mc.p95)}</p>
              <p className="text-xs text-white/40 mt-1">95% confidence interval · expected {fmtEur(mc.mean)}</p>
            </div>
            <div><p className="text-xs text-white/30">Tier 1 leads</p><p className="text-xl font-bold text-green-400">{kpis.tier1}</p></div>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={mc.histogram} margin={{ top:0,right:0,bottom:0,left:0 }} barCategoryGap={2}>
              <XAxis dataKey="x" hide /><YAxis hide />
              <Tooltip content={<MCTip />} cursor={false} />
              <Bar dataKey="count" radius={[2,2,0,0]}>
                {mc.histogram.map((d,i) => <Cell key={i} fill={d.isP5||d.isP95?'rgba(255,160,64,0.25)':ACCENT} fillOpacity={d.isP5||d.isP95?1:0.7} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-white/25 text-center">Each bar = simulated portfolio outcomes · shaded tails = outside 95% CI</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-1">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Top Leads by Score</p>
          {top5.map((l, i) => (
            <button key={l.id} onClick={() => onNav('leads', l.id)}
              className="w-full flex items-center gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 rounded-lg px-2 -mx-2 transition-colors text-left group">
              <span className="text-xs text-white/25 font-mono w-4">{i+1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-white/90">{l.company}</p>
                <p className="text-xs text-white/35">{l.industry} · {l.country}</p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background:(TIER_COLOR[l.tier]||'#94a3b8')+'18', color:TIER_COLOR[l.tier]||'#94a3b8' }}>{l.tier}</span>
                <span className="text-sm font-bold font-mono" style={{ color:TIER_COLOR[l.tier]||'#94a3b8' }}>{l.overall_score}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 space-y-1">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Action Items</p>
          {actions.length === 0
            ? <p className="text-sm text-white/30 mt-6 text-center">Pipeline is healthy — no overdue items ✓</p>
            : actions.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: item.urgency==='high'?'#f87171':'#fb923c' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/75 leading-snug">{item.message}</p>
                  <button className="text-xs mt-1" style={{ color:ACCENT }}
                    onClick={() => onNav(item.lead_id?'leads':'outbound', item.lead_id||item.account_id)}>
                    {item.action} →
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {kpis && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/40 uppercase tracking-wider">Outbound Activity — This Week</p>
            <button className="text-xs text-white/35 hover:text-white/60 transition-colors" onClick={() => onNav('outbound')}>View planner →</button>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-3xl font-bold font-mono" style={{ color: kpis.touches_this_week>=kpis.touch_target?'#4ade80':ACCENT }}>
                {kpis.touches_this_week}<span className="text-base text-white/25 font-normal">/{kpis.touch_target}</span>
              </p>
              <p className="text-xs text-white/35">touches</p>
            </div>
            <div className="flex-1">
              <div className="score-bar-track">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width:`${Math.min(100,(kpis.touches_this_week/kpis.touch_target)*100)}%`, background:kpis.touches_this_week>=kpis.touch_target?'#4ade80':ACCENT }} />
              </div>
              <p className="text-xs text-white/25 mt-1">{Math.round((kpis.touches_this_week/kpis.touch_target)*100)}% of weekly target</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{kpis.meetings_this_week}</p>
              <p className="text-xs text-white/35">meetings</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
