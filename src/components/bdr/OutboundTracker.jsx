import { useEffect, useState } from 'react';
import { api, streamAI } from '../../lib/bdrApi';
import { outboundTierLabel, channelLabel } from '../../lib/bdrUtils';
import { toast } from './Toast';

const STATUSES = ['researched','first_touch','sequence_active','meeting_booked','handed_off','stalled','archived'];
const STATUS_COLORS = { researched:'#94a3b8', first_touch:'#60a5fa', sequence_active:'#fb923c', meeting_booked:'#4ade80', handed_off:'#a78bfa', stalled:'#f87171', archived:'#475569' };
const CHANNELS = ['email','linkedin','call','event','other'];
const RESPONSES = ['no_response','positive','negative','meeting_booked'];

export default function OutboundTracker() {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [tpForm, setTpForm] = useState(null);
  const [outreach, setOutreach] = useState('');
  const [genOut, setGenOut] = useState(false);
  const [outChannel, setOutChannel] = useState('email');
  const [filter, setFilter] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newAcct, setNewAcct] = useState({ company:'', country:'UK', vertical:'Fintech', employees:'', outbound_tier:'tier_a', trigger_signal:'', entry_point_name:'', entry_point_title:'', messaging_angle:'' });

  const load = () => api.outbound.list().then(setAccounts);
  const loadDetail = (id) => api.outbound.get(id).then(setDetail);

  useEffect(() => { load(); api.outbound.weeklyStats().then(setWeekly); }, []);
  useEffect(() => { if (selected) loadDetail(selected.id); }, [selected]);

  async function addTouchpoint() {
    if (!tpForm || !detail) return;
    await api.outbound.addTouchpoint(detail.id, tpForm);
    setTpForm(null);
    await loadDetail(detail.id);
    await load();
    toast('Touchpoint logged');
  }

  async function updateStatus(status) {
    await api.outbound.update(detail.id, { ...detail, status });
    await loadDetail(detail.id);
    await load();
    toast('Status updated');
  }

  async function generateOutreach() {
    if (!detail) return;
    setGenOut(true); setOutreach('');
    await streamAI(`/ai/outreach/${detail.id}`, { channel: outChannel }, chunk => setOutreach(p => p + chunk));
    setGenOut(false);
  }

  async function createAccount() {
    if (!newAcct.company) return toast('Company name required', 'error');
    await api.outbound.create({ ...newAcct, employees: parseInt(newAcct.employees)||0 });
    await load();
    setShowNew(false);
    setNewAcct({ company:'', country:'UK', vertical:'Fintech', employees:'', outbound_tier:'tier_a', trigger_signal:'', entry_point_name:'', entry_point_title:'', messaging_angle:'' });
    toast('Account added');
  }

  const filtered = accounts.filter(a => !filter || a.company.toLowerCase().includes(filter.toLowerCase()) || a.vertical?.toLowerCase().includes(filter.toLowerCase()));
  const byTier = { tier_a: filtered.filter(a=>a.outbound_tier==='tier_a'), tier_b: filtered.filter(a=>a.outbound_tier==='tier_b'), tier_c: filtered.filter(a=>a.outbound_tier==='tier_c') };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: account list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-white/8 space-y-3">
          {/* Weekly activity */}
          {weekly && (
            <div className="glass rounded-xl p-4 flex items-center gap-6">
              <div>
                <p className="text-xs text-white/40">Touches This Week</p>
                <p className="text-2xl font-bold font-mono" style={{ color: weekly.touches >= weekly.target ? '#4ade80' : '#FFA040' }}>
                  {weekly.touches}<span className="text-sm text-white/30">/{weekly.target}</span>
                </p>
              </div>
              <div className="flex-1">
                <div className="bdr-score-track">
                  <div className="h-full rounded-full" style={{ width:`${Math.min(100,(weekly.touches/weekly.target)*100)}%`, background:'#FFA040' }} />
                </div>
              </div>
              <div className="text-center"><p className="text-xs text-white/40">Meetings</p><p className="text-xl font-bold text-white">{weekly.meetings}</p></div>
              <div className="text-center"><p className="text-xs text-white/40">Conv. Rate</p><p className="text-xl font-bold text-blue-400">{weekly.conversion_rate}%</p></div>
            </div>
          )}
          <div className="flex gap-3">
            <input className="bdr-input flex-1" placeholder="Search accounts…" value={filter} onChange={e => setFilter(e.target.value)} />
            <button className="bdr-btn bdr-btn-primary" onClick={() => setShowNew(true)}>+ Add Account</button>
          </div>
        </div>

        {showNew && (
          <div className="p-4 border-b border-white/8 glass">
            <p className="text-sm font-semibold text-white mb-3">New Outbound Account</p>
            <div className="grid grid-cols-3 gap-3">
              {[['company','Company *'],['country','Country'],['vertical','Vertical'],['entry_point_name','Contact Name'],['entry_point_title','Contact Title'],['employees','Employees']].map(([k,l]) => (
                <div key={k}><label className="text-xs text-white/40">{l}</label><input className="bdr-input mt-1" value={newAcct[k]} onChange={e => setNewAcct(p=>({...p,[k]:e.target.value}))} /></div>
              ))}
              <div><label className="text-xs text-white/40">Tier</label>
                <select className="bdr-input mt-1" value={newAcct.outbound_tier} onChange={e => setNewAcct(p=>({...p,outbound_tier:e.target.value}))}>
                  {['tier_a','tier_b','tier_c'].map(t=><option key={t} value={t}>{outboundTierLabel(t)}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-white/40">Trigger Signal</label>
              <input className="bdr-input mt-1" value={newAcct.trigger_signal} onChange={e => setNewAcct(p=>({...p,trigger_signal:e.target.value}))} />
            </div>
            <div className="mt-3">
              <label className="text-xs text-white/40">Messaging Angle</label>
              <textarea className="bdr-input mt-1" rows={2} value={newAcct.messaging_angle} onChange={e => setNewAcct(p=>({...p,messaging_angle:e.target.value}))} />
            </div>
            <div className="flex gap-2 mt-3">
              <button className="bdr-btn bdr-btn-primary" onClick={createAccount}>Save</button>
              <button className="bdr-btn bdr-btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="p-4 space-y-6">
          {['tier_a','tier_b','tier_c'].map(tier => (
            byTier[tier].length > 0 && (
              <div key={tier}>
                <p className="bdr-section-title mb-3">{outboundTierLabel(tier)} ({byTier[tier].length})</p>
                <div className="space-y-2">
                  {byTier[tier].map(a => (
                    <div key={a.id} className={`glass rounded-xl p-4 cursor-pointer transition-all ${selected?.id===a.id ? 'border-orange-400/40' : 'hover:border-white/15'}`}
                      style={{ borderColor: selected?.id===a.id ? 'rgba(255,160,64,0.4)' : undefined }}
                      onClick={() => setSelected(a)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{a.company}</p>
                            <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: STATUS_COLORS[a.status]+'22', color: STATUS_COLORS[a.status] }}>{a.status.replace('_',' ')}</span>
                          </div>
                          <p className="text-xs text-white/40 mt-0.5">{a.vertical} · {a.country} · {a.entry_point_title}</p>
                          <p className="text-xs text-white/55 mt-1.5 line-clamp-2">{a.trigger_signal}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-white/30">{a.touchpoint_count} touches</p>
                          {a.next_step_date && <p className="text-xs text-orange-400 mt-1">Due {a.next_step_date}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Right: detail */}
      {detail && (
        <div className="w-96 border-l border-white/8 overflow-y-auto flex-shrink-0">
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-white text-lg">{detail.company}</p>
                <p className="text-xs text-white/40">{detail.id} · {detail.vertical} · {detail.country}</p>
              </div>
              <select className="text-xs border rounded px-2 py-1 font-medium cursor-pointer"
                style={{ background:'transparent', borderColor: STATUS_COLORS[detail.status]+'60', color: STATUS_COLORS[detail.status] }}
                value={detail.status} onChange={e => updateStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>

            <div className="glass rounded-lg p-3 space-y-2">
              <p className="text-xs text-white/40">Entry Point</p>
              <p className="text-sm text-white">{detail.entry_point_name} · <span className="text-white/50">{detail.entry_point_title}</span></p>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-1">Trigger Signal</p>
              <p className="text-sm text-white/70 leading-relaxed">{detail.trigger_signal}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Messaging Angle</p>
              <p className="text-sm text-white/70 leading-relaxed">{detail.messaging_angle}</p>
            </div>
            {detail.next_step && (
              <div className="glass rounded-lg p-3">
                <p className="text-xs text-white/40">Next Step</p>
                <p className="text-sm text-white/80 mt-1">{detail.next_step}</p>
                {detail.next_step_date && <p className="text-xs text-orange-400 mt-1">Due {detail.next_step_date}</p>}
              </div>
            )}

            {/* AI Outreach Generator */}
            <div className="border-t border-white/8 pt-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">AI Outreach Generator</p>
              <div className="flex gap-2 mb-3">
                {['email','linkedin'].map(c => (
                  <button key={c} className={outChannel===c ? 'btn-primary text-xs py-1.5 px-3' : 'btn-secondary text-xs py-1.5 px-3'}
                    onClick={() => setOutChannel(c)}>{c.charAt(0).toUpperCase()+c.slice(1)}</button>
                ))}
                <button className="bdr-btn bdr-btn-primary text-xs py-1.5 px-3 ml-auto" onClick={generateOutreach} disabled={genOut}>
                  {genOut ? '⟳' : '✦ Generate'}
                </button>
              </div>
              {(outreach || genOut) && (
                <div className="glass rounded-lg p-4">
                  <pre className="text-xs text-white/75 leading-relaxed whitespace-pre-wrap font-sans">
                    {outreach}{genOut && <span className="animate-pulse text-orange-400">▊</span>}
                  </pre>
                  {outreach && (
                    <button className="bdr-btn bdr-btn-secondary text-xs mt-3" onClick={() => navigator.clipboard.writeText(outreach).then(()=>toast('Copied!'))}>Copy</button>
                  )}
                </div>
              )}
            </div>

            {/* Touchpoints */}
            <div className="border-t border-white/8 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/40 uppercase tracking-wider">Touchpoints ({detail.touchpoints?.length||0})</p>
                <button className="bdr-btn bdr-btn-secondary text-xs py-1 px-2" onClick={() => setTpForm({ date:new Date().toISOString().split('T')[0], channel:'email', content_summary:'', response:'no_response' })}>+ Log</button>
              </div>

              {tpForm && (
                <div className="glass rounded-lg p-3 space-y-3 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs text-white/40">Date</label><input type="date" className="bdr-input mt-1 text-xs" value={tpForm.date} onChange={e=>setTpForm(p=>({...p,date:e.target.value}))} /></div>
                    <div><label className="text-xs text-white/40">Channel</label>
                      <select className="bdr-input mt-1 text-xs" value={tpForm.channel} onChange={e=>setTpForm(p=>({...p,channel:e.target.value}))}>
                        {CHANNELS.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="text-xs text-white/40">Content</label><textarea className="bdr-input mt-1 text-xs" rows={2} value={tpForm.content_summary} onChange={e=>setTpForm(p=>({...p,content_summary:e.target.value}))} /></div>
                  <div><label className="text-xs text-white/40">Response</label>
                    <select className="bdr-input mt-1 text-xs" value={tpForm.response} onChange={e=>setTpForm(p=>({...p,response:e.target.value}))}>
                      {RESPONSES.map(r=><option key={r} value={r}>{r.replace('_',' ')}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button className="bdr-btn bdr-btn-primary text-xs" onClick={addTouchpoint}>Save</button>
                    <button className="bdr-btn bdr-btn-secondary text-xs" onClick={()=>setTpForm(null)}>Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {(detail.touchpoints||[]).map(tp => (
                  <div key={tp.id} className="text-xs border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{tp.date}</span>
                      <span className="text-white/60 font-medium">{channelLabel(tp.channel)}</span>
                      <span className="ml-auto px-1.5 py-0.5 rounded text-xs" style={{ background: tp.response==='meeting_booked' ? '#4ade8022' : tp.response==='positive' ? '#fb923c22' : '#ffffff11', color: tp.response==='meeting_booked' ? '#4ade80' : tp.response==='positive' ? '#fb923c' : '#94a3b8' }}>
                        {tp.response.replace('_',' ')}
                      </span>
                    </div>
                    <p className="text-white/50 mt-1">{tp.content_summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
