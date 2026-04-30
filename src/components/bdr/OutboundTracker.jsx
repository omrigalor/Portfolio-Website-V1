import { useEffect, useState } from 'react';
import { api, streamAI } from '../../lib/bdrApi';

const ACCENT = '#FFA040';

const TIER_META = {
  tier_a: { label: 'Tier A', color: '#4ade80' },
  tier_b: { label: 'Tier B', color: '#fb923c' },
  tier_c: { label: 'Tier C', color: '#94a3b8' },
};

function getUrgency(nextStepDate) {
  if (!nextStepDate) return 'ok';
  const today = new Date().toISOString().split('T')[0];
  const diff = Math.floor((new Date(nextStepDate) - new Date(today)) / 86400000);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 2) return 'soon';
  return 'ok';
}

const URGENCY_COLOR = { overdue:'#f87171', today:'#fb923c', soon:'#fbbf24', ok:'#4ade80' };

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}

function statusStyle(s) {
  const map = {
    active:    { bg:'rgba(74,222,128,0.12)', color:'#4ade80' },
    sequence_active: { bg:'rgba(74,222,128,0.12)', color:'#4ade80' },
    meeting_booked:  { bg:'rgba(255,160,64,0.12)', color:'#FFA040' },
    paused:    { bg:'rgba(148,163,184,0.12)', color:'#94a3b8' },
    researched:{ bg:'rgba(148,163,184,0.10)', color:'#64748b' },
    first_touch:{ bg:'rgba(96,165,250,0.12)', color:'#60a5fa' },
    archived:  { bg:'rgba(148,163,184,0.08)', color:'#475569' },
  };
  return map[s] || map.active;
}

export default function OutboundPlanner() {
  const [accounts, setAccounts]     = useState([]);
  const [stats, setStats]           = useState(null);
  const [expanded, setExpanded]     = useState(null);
  const [insight, setInsight]       = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [outreachFor, setOutreachFor]       = useState(null);
  const [outreachText, setOutreachText]     = useState('');
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [filter, setFilter]         = useState('all');

  useEffect(() => {
    Promise.all([api.outbound.list(), api.outbound.weeklyStats()])
      .then(([accs, s]) => { setAccounts(accs); setStats(s); });
  }, []);

  async function loadInsight() {
    setLoadingInsight(true); setInsight('');
    await streamAI('/ai/weekly-report', {}, chunk => setInsight(p => p + chunk));
    setLoadingInsight(false);
  }

  function toggleExpand(id) {
    setExpanded(prev => prev === id ? null : id);
    setOutreachFor(null); setOutreachText('');
  }

  async function generateOutreach(account, channel) {
    setOutreachFor(channel); setOutreachLoading(true); setOutreachText('');
    await streamAI(`/ai/outreach/${account.id}`, { channel }, chunk => setOutreachText(p => p + chunk));
    setOutreachLoading(false);
  }

  const visible = accounts.filter(a => {
    if (a.status === 'archived') return false;
    if (filter === 'all') return true;
    return a.outbound_tier === filter;
  });

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/8">
        <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">Outbound Targets</h2>
            <p className="text-xs text-white/35 mt-0.5">{visible.length} active accounts</p>
          </div>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {['all','tier_a','tier_b','tier_c'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                style={{ background:filter===f?'rgba(255,255,255,0.1)':'transparent', color:filter===f?'white':'rgba(255,255,255,0.35)' }}>
                {f==='all'?'All':TIER_META[f]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid px-6 py-2 border-b border-white/5 text-xs text-white/25 uppercase tracking-wider"
            style={{ gridTemplateColumns:'2fr 80px 130px 90px 1fr' }}>
            <span>Company</span><span>Tier</span><span>Status</span><span>Last Touch</span><span>Next Step</span>
          </div>

          {visible.map(acc => {
            const urgency = getUrgency(acc.next_step_date);
            const tier = TIER_META[acc.outbound_tier] || TIER_META.tier_c;
            const ss = statusStyle(acc.status);
            const isOpen = expanded === acc.id;

            return (
              <div key={acc.id} className="border-b border-white/5 last:border-0">
                <button onClick={() => toggleExpand(acc.id)}
                  className="w-full grid px-6 py-3.5 hover:bg-white/3 transition-colors text-left items-center"
                  style={{ gridTemplateColumns:'2fr 80px 130px 90px 1fr' }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:URGENCY_COLOR[urgency] }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{acc.company}</p>
                      <p className="text-xs text-white/30 truncate">{acc.vertical} · {acc.country}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded w-fit" style={{ background:tier.color+'18', color:tier.color }}>{tier.label}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded capitalize w-fit" style={{ background:ss.bg, color:ss.color }}>{acc.status.replace('_',' ')}</span>
                  <span className="text-xs text-white/40">{fmtDate(acc.last_touch)}</span>
                  <div className="min-w-0">
                    <p className="text-xs truncate" style={{ color:urgency==='ok'?'rgba(255,255,255,0.5)':URGENCY_COLOR[urgency] }}>{acc.next_step||'—'}</p>
                    {acc.next_step_date && <p className="text-xs text-white/25">{fmtDate(acc.next_step_date)}{urgency==='overdue'?' · overdue':urgency==='today'?' · today':''}</p>}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 bg-white/2 border-t border-white/5 fade-in">
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Messaging Angle</p>
                        <p className="text-sm text-white/70 leading-relaxed">{acc.messaging_angle||'No messaging angle set.'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Trigger Signal</p>
                        <p className="text-sm text-white/70 leading-relaxed">{acc.trigger_signal||'No trigger signal noted.'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-xs text-white/30">Generate outreach:</p>
                      {['email','linkedin'].map(ch => (
                        <button key={ch} onClick={() => generateOutreach(acc, ch)} disabled={outreachLoading}
                          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors capitalize"
                          style={{ color:outreachFor===ch?ACCENT:'rgba(255,255,255,0.5)' }}>
                          {ch==='email'?'✉ Email':'🔗 LinkedIn'}
                        </button>
                      ))}
                    </div>
                    {(outreachText || outreachLoading) && (
                      <div className="rounded-xl border border-white/8 p-4 bg-white/3 relative">
                        <pre className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap font-sans">
                          {outreachText}{outreachLoading && <span className="animate-pulse" style={{color:ACCENT}}>▊</span>}
                        </pre>
                        {outreachText && !outreachLoading && (
                          <button onClick={() => navigator.clipboard.writeText(outreachText)}
                            className="absolute top-3 right-3 text-xs text-white/30 hover:text-white/60 transition-colors">Copy</button>
                        )}
                      </div>
                    )}
                    {acc.touchpoints?.length > 0 && (
                      <p className="text-xs text-white/25 mt-3">
                        {acc.touchpoints.length} touchpoint{acc.touchpoints.length!==1?'s':''} logged
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {visible.length === 0 && (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-white/25">No active targets in this tier</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-72 flex-shrink-0 flex flex-col overflow-y-auto p-5 space-y-5">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Weekly Pulse</p>
          {stats && (
            <div className="glass rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex items-end justify-between mb-1">
                  <p className="text-3xl font-bold font-mono" style={{ color:stats.touches>=stats.target?'#4ade80':ACCENT }}>
                    {stats.touches}<span className="text-base text-white/25 font-normal">/{stats.target}</span>
                  </p>
                  <p className="text-xs text-white/35 mb-1">touches</p>
                </div>
                <div className="score-bar-track">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width:`${Math.min(100,(stats.touches/stats.target)*100)}%`, background:stats.touches>=stats.target?'#4ade80':ACCENT }} />
                </div>
                <p className="text-xs text-white/25 mt-1">{Math.round((stats.touches/stats.target)*100)}% of weekly target</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/8">
                <p className="text-xs text-white/40">Meetings booked</p>
                <p className="text-xl font-bold text-white font-mono">{stats.meetings}</p>
              </div>
              {stats.conversion_rate > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40">Touch → meeting rate</p>
                  <p className="text-sm font-semibold" style={{color:ACCENT}}>{stats.conversion_rate}%</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5 space-y-2.5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Pipeline Health</p>
          {[
            { label:'Overdue',     key:'overdue', color:'#f87171' },
            { label:'Due today',   key:'today',   color:'#fb923c' },
            { label:'Due in 1-2d', key:'soon',    color:'#fbbf24' },
            { label:'On track',    key:'ok',      color:'#4ade80' },
          ].map(({ label, key, color }) => {
            const count = accounts.filter(a => a.status!=='archived' && getUrgency(a.next_step_date)===key).length;
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background:color }} />
                  <p className="text-xs text-white/50">{label}</p>
                </div>
                <p className="text-sm font-semibold font-mono text-white">{count}</p>
              </div>
            );
          })}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/40 uppercase tracking-wider">AI Insight</p>
            <button onClick={loadInsight} disabled={loadingInsight}
              className="text-xs px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5 transition-colors" style={{color:ACCENT}}>
              {loadingInsight ? '⟳' : '✦ Generate'}
            </button>
          </div>
          {insight
            ? <p className="text-xs text-white/65 leading-relaxed">{insight}</p>
            : <p className="text-xs text-white/25 leading-relaxed">Click Generate to get an AI-powered suggestion based on this week's activity.</p>
          }
        </div>

        <div className="glass rounded-2xl p-5 space-y-2.5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">By Tier</p>
          {Object.entries(TIER_META).map(([key, { label, color }]) => {
            const count = accounts.filter(a => a.outbound_tier===key && a.status!=='archived').length;
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background:color+'18', color }}>{label}</span>
                <p className="text-sm font-mono text-white">{count} accounts</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
