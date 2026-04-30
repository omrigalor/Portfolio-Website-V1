import { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { api, streamAI, researchCompany } from '../../lib/bdrApi';
import { singleLeadMonteCarlo, fmtEur } from '../../lib/monteCarlo';
import { toast } from './Toast';

const ACCENT = '#FFA040';
const TIER_COLOR = { 'Tier 1':'#4ade80', 'Tier 2':'#fb923c', 'Tier 3':'#94a3b8' };
const STATUS_OPTS = ['new','qualifying','qualified','handed_off','nurture','archived'];

const MCTip = ({ active, payload }) => active && payload?.length ? (
  <div style={{ background:'rgba(10,10,20,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'6px 10px', fontSize:11 }}>
    <p style={{ color: ACCENT }}>~€{payload[0]?.payload?.x}K · {payload[0]?.value} outcomes</p>
  </div>
) : null;

function buildRadarData(lead) {
  return [
    { subject:'AI Readiness',    value:(lead.ai_readiness_score||3)*20 },
    { subject:'Use Case Fit',    value:(lead.use_case_fit_score||3)*20 },
    { subject:'Compliance Edge', value:(lead.compliance_sensitivity_score||3)*20 },
    { subject:'Timing',          value:Math.min(100,((lead.compelling_events?.length||0)*34))||40 },
    { subject:'Entry Access',    value:lead.entry_point_title?80:40 },
  ];
}

function inferProducts(lead) {
  const cases = lead.use_case_fit_top_cases || [];
  const products = new Set(lead.recommended_products || []);
  if (cases.some(c => /code|engineer|developer|documentation/i.test(c))) products.add('Claude Code');
  if (cases.some(c => /support|customer|chat/i.test(c))) products.add('Claude API (high-volume messaging)');
  if (cases.some(c => /compliance|audit|regulatory|legal/i.test(c))) products.add('Claude Enterprise (audit logs + DPA)');
  if (cases.some(c => /document|batch|process|summar/i.test(c))) products.add('Claude API + Batch Processing');
  return [...products].slice(0, 4);
}

export default function LeadIntelligence({ initialId }) {
  const [leads, setLeads]         = useState([]);
  const [selected, setSelected]   = useState(null);
  const [researching, setRes]     = useState(false);
  const [query, setQuery]         = useState('');
  const [filter, setFilter]       = useState('');
  const [handoff, setHandoff]     = useState('');
  const [genHandoff, setGenH]     = useState(false);
  const [mc, setMC]               = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving]       = useState(false);
  const [activeTab, setActiveTab] = useState('brief');

  useEffect(() => {
    api.leads.list().then(ls => {
      setLeads(ls);
      if (initialId) {
        const found = ls.find(l => l.id === initialId);
        if (found) selectLead(found);
      }
    });
  }, [initialId]);

  function selectLead(lead) {
    setSelected(lead); setHandoff(''); setEditNotes(lead.notes || ''); setActiveTab('brief');
    if (lead.expected_acv && lead.conversion_probability) setMC(singleLeadMonteCarlo(lead));
  }

  async function handleResearch() {
    if (!query.trim()) return;
    setRes(true);
    try {
      const data = await researchCompany(query.trim());
      const lead = await api.leads.create(data);
      const fresh = await api.leads.list();
      setLeads(fresh); selectLead(lead); setQuery('');
      toast(`${lead.company} researched and added`);
    } catch (e) {
      toast('Research failed', 'error');
    } finally { setRes(false); }
  }

  async function generateHandoff() {
    if (!selected) return;
    setGenH(true); setHandoff(''); setActiveTab('brief');
    await streamAI(`/ai/handoff/${selected.id}`, {}, chunk => setHandoff(p => p + chunk));
    setGenH(false);
  }

  async function saveEdits(patch) {
    if (!selected) return;
    setSaving(true);
    const updated = await api.leads.update(selected.id, patch);
    setSelected(updated);
    setLeads(await api.leads.list());
    setSaving(false);
    toast('Saved');
  }

  async function deleteLead() {
    if (!selected || !confirm(`Delete ${selected.company}?`)) return;
    await api.leads.delete(selected.id);
    setSelected(null); setLeads(await api.leads.list()); toast('Deleted');
  }

  const filtered = leads.filter(l => !filter || l.company.toLowerCase().includes(filter.toLowerCase()) || l.industry?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-72 border-r border-white/8 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/8 space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-wider">AI Auto-Research</p>
          <div className="flex gap-2">
            <input className="input-field flex-1 text-sm" placeholder="Company name…"
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleResearch()} />
            <button className="btn-primary text-sm px-3" onClick={handleResearch} disabled={researching||!query.trim()}>
              {researching ? '⟳' : '✦'}
            </button>
          </div>
          {researching && <p className="text-xs text-white/40 animate-pulse">Researching {query}…</p>}
          <input className="input-field text-xs" placeholder="Filter leads…" value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map(l => (
            <button key={l.id} onClick={() => selectLead(l)}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all ${selected?.id===l.id?'glass-strong':'hover:bg-white/4'}`}
              style={{ borderLeft: selected?.id===l.id?`2px solid ${TIER_COLOR[l.tier]||'#94a3b8'}`:'2px solid transparent' }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-white truncate">{l.company}</p>
                <span className="text-xs font-bold font-mono shrink-0" style={{ color:TIER_COLOR[l.tier]||'#94a3b8' }}>{l.overall_score}</span>
              </div>
              <p className="text-xs text-white/35 mt-0.5">{l.industry} · {l.country}</p>
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white">{selected.company}</h2>
                  <span className="text-sm px-2 py-0.5 rounded font-semibold" style={{ background:(TIER_COLOR[selected.tier]||'#94a3b8')+'18', color:TIER_COLOR[selected.tier]||'#94a3b8' }}>{selected.tier}</span>
                  <span className="text-2xl font-bold font-mono" style={{ color:TIER_COLOR[selected.tier]||'#94a3b8' }}>{selected.overall_score}</span>
                </div>
                <p className="text-sm text-white/45">{selected.industry} · {selected.country} · {selected.employee_count_estimate?.toLocaleString()} employees</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select className="input-field text-xs py-1.5 w-32" value={selected.status} onChange={e => saveEdits({ status:e.target.value })}>
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
                <button onClick={deleteLead} className="btn-secondary text-xs py-1.5 px-2 text-white/30 hover:text-red-400">✕</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Score Dimensions</p>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={buildRadarData(selected)}>
                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:10 }} />
                    <Radar dataKey="value" fill={ACCENT} fillOpacity={0.15} stroke={ACCENT} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass rounded-2xl p-5 space-y-3">
                <p className="text-xs text-white/40 uppercase tracking-wider">Key Facts</p>
                {[
                  ['Entry Point', selected.entry_point_title||'—'],
                  ['Contact', selected.contact_name?`${selected.contact_name} · ${selected.contact_title}`:'—'],
                  ['Expected ACV', fmtEur(selected.expected_acv)],
                  ['Conversion', `${Math.round((selected.conversion_probability||0)*100)}%`],
                ].map(([label, value]) => (
                  <div key={label}><p className="text-xs text-white/30">{label}</p><p className="text-sm text-white/80">{value}</p></div>
                ))}
              </div>
            </div>

            <div className="border-b border-white/8 flex gap-6">
              {[['brief','Intelligence Brief'],['battlecard','Battlecard'],['monte_carlo','Monte Carlo']].map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className="text-sm pb-3 transition-colors border-b-2"
                  style={{ color:activeTab===id?'white':'rgba(255,255,255,0.35)', borderColor:activeTab===id?ACCENT:'transparent' }}>
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'brief' && (
              <div className="space-y-5">
                <p className="text-sm text-white/70 leading-relaxed">{selected.company_overview}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4 space-y-2">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Top Use Cases</p>
                    {(selected.use_case_fit_top_cases||[]).map((c,i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:ACCENT }} />{c}
                      </div>
                    ))}
                  </div>
                  <div className="glass rounded-xl p-4 space-y-2">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Compelling Events</p>
                    {(selected.compelling_events||[]).map((e,i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-green-400 mt-0.5 shrink-0">⚡</span>{e}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-xl p-4 space-y-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Recommended Claude Products</p>
                  <div className="flex flex-wrap gap-2">
                    {inferProducts(selected).map(p => (
                      <span key={p} className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor:'rgba(255,160,64,0.3)', color:ACCENT, background:'rgba(255,160,64,0.08)' }}>{p}</span>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Messaging Angle</p>
                  <p className="text-sm text-white/75 leading-relaxed italic">"{selected.messaging_angle}"</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40 uppercase tracking-wider">AE Handoff Brief</p>
                    <button className="btn-primary text-xs py-1.5 px-3" onClick={generateHandoff} disabled={genHandoff}>
                      {genHandoff ? '⟳ Generating…' : '✦ Generate'}
                    </button>
                  </div>
                  {(handoff || genHandoff) && (
                    <div className="glass rounded-xl p-5">
                      <pre className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap font-sans">
                        {handoff}{genHandoff && <span className="animate-pulse" style={{color:ACCENT}}>▊</span>}
                      </pre>
                      {handoff && (
                        <button className="btn-secondary text-xs mt-4"
                          onClick={() => navigator.clipboard.writeText(handoff).then(()=>toast('Copied'))}>
                          Copy to clipboard
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider">BDR Notes</p>
                  <textarea className="input-field text-sm" rows={3} placeholder="Add your own observations…"
                    value={editNotes} onChange={e => setEditNotes(e.target.value)}
                    onBlur={() => editNotes !== selected.notes && saveEdits({ notes: editNotes })} />
                </div>
              </div>
            )}

            {activeTab === 'battlecard' && (
              <div className="space-y-4">
                <p className="text-sm text-white/50">Auto-generated from AI research on {selected.company}'s current AI stack.</p>
                {[
                  ['If they mention OpenAI / Azure', selected.battlecard_openai, '#fb923c'],
                  ['If they mention Google / Gemini', selected.battlecard_google, '#60a5fa'],
                  ['If they have no AI yet',           selected.battlecard_greenfield, '#4ade80'],
                ].map(([scenario, text, color]) => (
                  <div key={scenario} className="glass rounded-xl p-5 space-y-2" style={{ borderLeft:`2px solid ${color}50` }}>
                    <p className="text-xs font-semibold" style={{ color }}>{scenario}</p>
                    <p className="text-sm text-white/70 leading-relaxed">{text||'—'}</p>
                  </div>
                ))}
                <div className="glass rounded-xl p-5 space-y-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Their Current Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {(selected.current_ai_tools||[]).map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded border border-white/10 text-white/55">{t}</span>
                    ))}
                  </div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mt-3">Their Pain Points</p>
                  {(selected.likely_pain_points||[]).map((p,i) => <p key={i} className="text-sm text-white/65">· {p}</p>)}
                </div>
              </div>
            )}

            {activeTab === 'monte_carlo' && mc && (
              <div className="space-y-5">
                <div className="glass rounded-2xl p-6 space-y-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider">1,000 Simulated Outcomes — {selected.company}</p>
                  <div className="flex items-end gap-8">
                    <div><p className="text-xs text-white/30">Expected</p><p className="text-3xl font-bold font-mono" style={{color:ACCENT}}>{fmtEur(mc.mean)}</p></div>
                    <div><p className="text-xs text-white/30">95% Confidence Range</p><p className="text-xl font-bold text-white">{fmtEur(mc.p5)} – {fmtEur(mc.p95)}</p></div>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={mc.histogram} barCategoryGap={3}>
                      <XAxis dataKey="x" tick={{ fill:'rgba(255,255,255,0.3)', fontSize:10 }} tickFormatter={v=>`€${v}K`} />
                      <YAxis hide />
                      <Tooltip content={<MCTip />} cursor={false} />
                      <Bar dataKey="count" radius={[3,3,0,0]} fill={ACCENT} fillOpacity={0.75} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="glass rounded-xl p-5 space-y-3">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Simulation Inputs</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-white/30">Base ACV</p>
                      <input className="input-field mt-1 text-sm" type="number" defaultValue={selected.expected_acv}
                        onBlur={e => saveEdits({ expected_acv: parseInt(e.target.value) })} />
                    </div>
                    <div>
                      <p className="text-xs text-white/30">Conversion Probability</p>
                      <input className="input-field mt-1 text-sm" type="number" step="0.01" min="0" max="1" defaultValue={selected.conversion_probability}
                        onBlur={e => { saveEdits({ conversion_probability: parseFloat(e.target.value) }); setMC(singleLeadMonteCarlo({ ...selected, conversion_probability: parseFloat(e.target.value) })); }} />
                    </div>
                  </div>
                  <p className="text-xs text-white/25">ACV varies ±40% per simulation · conversion probability varies ±10pp · 1,000 iterations</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-4xl">✦</p>
            <p className="text-sm text-white/40">Type a company name above and click Research</p>
            <p className="text-xs text-white/25">or select an existing lead from the list</p>
          </div>
        </div>
      )}
    </div>
  );
}
