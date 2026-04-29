import { useEffect, useState, useCallback } from 'react';
import { api, streamAI } from '../../lib/bdrApi';
import { tierLabel, tierClass, sourceLabel, statusLabel, fmtEur, fmtPct, scoreColor } from '../../lib/bdrUtils';
import { toast } from './Toast';

const FACTORS = [
  { key:'industry_fit',       label:'Industry Fit',            weight:0.15, guidance:['No fit','Low fit','Possible fit','Good fit (fintech/health/legal)','Perfect fit — core vertical'] },
  { key:'technical_ready',    label:'Technical Readiness',     weight:0.12, guidance:['No eng team','Basic IT only','Some API experience','API team, some ML','Strong eng, ML pipeline'] },
  { key:'usecase_clarity',    label:'Use Case Clarity',        weight:0.14, guidance:['"We want AI"','Vague idea','Rough use case','Specific workflow','Exact spec with success metrics'] },
  { key:'budget',             label:'Budget Identified',       weight:0.10, guidance:['No budget','Exploratory only','Some discretionary','Budget allocated','Signed-off, CFO approved'] },
  { key:'compelling_event',   label:'Compelling Event',        weight:0.13, guidance:['None','Mild interest','Soft deadline','Hard deadline/funding','Board mandate or competitor deployed'] },
  { key:'decision_access',    label:'Decision-Maker Access',   weight:0.08, guidance:['Gatekeeper only','Individual contributor','Manager-level','Director/VP','C-suite direct'] },
  { key:'compliance_ready',   label:'Compliance Readiness',    weight:0.08, guidance:['No awareness','Basic awareness','Some research done','DPA considered','GDPR/DPA process defined'] },
  { key:'company_scale',      label:'Company Scale',           weight:0.05, guidance:['<50 employees','50–200','200–1000','1000–10k','10k+ employees'] },
  { key:'engagement',         label:'Engagement Level',        weight:0.07, guidance:['No response','One reply','2–3 touches','Active multi-touch','Highly engaged, asks tech Qs'] },
  { key:'competitive_displace',label:'Competitive Displacement',weight:0.08, guidance:['Happy with status quo','No AI yet','Greenfield','Has competitor with pain','Active migration, committed'] },
];

const INDUSTRIES = ['Fintech','Finance','Insurance','Healthcare','Legal','E-commerce','Logistics/Tech','Telco','Media/Tech','Payments','SaaS','Other'];
const COUNTRIES = ['UK','Germany','France','Sweden','Netherlands','Ireland','Switzerland','Spain','Italy','Poland','Denmark','Norway','Other'];
const SOURCES = ['inbound_web','inbound_referral','inbound_event','outbound_cold','outbound_sequence','partner'];

function ScoreSlider({ factor, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/70 font-medium">{factor.label}</span>
        <span className="font-mono font-bold" style={{ color: scoreColor(value * 20) }}>{value}/5</span>
      </div>
      <input type="range" min="1" max="5" step="1" value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${scoreColor(value*20)} ${(value-1)/4*100}%, rgba(255,255,255,0.1) ${(value-1)/4*100}%)` }} />
      <p className="text-xs text-white/35 italic">{factor.guidance[value-1]}</p>
    </div>
  );
}

function TierBadge({ tier }) {
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${tierClass(tier)}`}>{tierLabel(tier)}</span>;
}

function LeadRow({ lead, onSelect, selected }) {
  return (
    <tr className={`table-row cursor-pointer ${selected ? 'bg-orange-400/5' : ''}`} onClick={() => onSelect(lead)}>
      <td className="py-2.5 px-4">
        <p className="text-sm text-white font-medium">{lead.company}</p>
        <p className="text-xs text-white/40">{lead.contact_name} · {lead.country}</p>
      </td>
      <td className="py-2.5 px-4"><TierBadge tier={lead.tier} /></td>
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold" style={{ color: scoreColor(lead.composite_score) }}>{Math.round(lead.composite_score)}</span>
          <div className="flex-1 score-bar-track w-16">
            <div className="h-full rounded-full" style={{ width:`${lead.composite_score}%`, background: scoreColor(lead.composite_score) }} />
          </div>
        </div>
      </td>
      <td className="py-2.5 px-4 text-xs text-white/60">{lead.industry}</td>
      <td className="py-2.5 px-4 text-xs text-white/60">{sourceLabel(lead.source)}</td>
      <td className="py-2.5 px-4 text-xs font-mono" style={{ color: '#60a5fa' }}>{fmtPct(lead.conversion_probability)}</td>
      <td className="py-2.5 px-4 text-xs text-white/60">{fmtEur(lead.expected_acv)}</td>
      <td className="py-2.5 px-4">
        <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">{statusLabel(lead.status)}</span>
      </td>
    </tr>
  );
}

const emptyLead = () => ({
  company:'', country:'UK', industry:'Fintech', employees:'', source:'inbound_web',
  contact_name:'', contact_title:'', date_added:'',
  score_industry_fit:3, score_technical_ready:3, score_usecase_clarity:3, score_budget:3,
  score_compelling_event:3, score_decision_access:3, score_compliance_ready:3,
  score_company_scale:3, score_engagement:3, score_competitive_displace:3,
  use_case_description:'', competitive_landscape:'', compliance_context:'', technical_environment:'', next_steps:'',
  status:'new',
});

export default function LeadScoring({ initialId }) {
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [filter, setFilter] = useState({ tier:'', source:'', q:'' });
  const [narrative, setNarrative] = useState('');
  const [genNarr, setGenNarr] = useState(false);
  const [handoff, setHandoff] = useState('');
  const [genHandoff, setGenHandoff] = useState(false);

  const load = useCallback(() => api.leads.list().then(setLeads), []);
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (initialId && leads.length) {
      const l = leads.find(x => x.id === initialId);
      if (l) setSelected(l);
    }
  }, [initialId, leads]);

  // Live score preview while editing
  function liveScore(e) {
    if (!e) return null;
    let weighted = 0, maxW = 0;
    for (const f of FACTORS) {
      const s = e[`score_${f.key}`] ?? 3;
      weighted += s * f.weight;
      maxW += 5 * f.weight;
    }
    return Math.round((weighted/maxW)*1000)/10;
  }

  async function save() {
    if (!editing.company) return toast('Company name required', 'error');
    try {
      if (isNew) {
        const created = await api.leads.create(editing);
        await load();
        setSelected(created);
      } else {
        const updated = await api.leads.update(selected.id, editing);
        await load();
        setSelected(updated);
      }
      setEditing(null);
      setIsNew(false);
      toast('Lead saved');
    } catch { toast('Save failed', 'error'); }
  }

  async function genNarrative() {
    if (!selected) return;
    setGenNarr(true); setNarrative('');
    try {
      const r = await fetch(`/api/ai/score-narrative/${selected.id}`, { method:'POST' });
      const d = await r.json();
      setNarrative(d.narrative);
    } catch { toast('AI unavailable — check ANTHROPIC_API_KEY', 'error'); }
    setGenNarr(false);
  }

  async function genHandoffBrief() {
    if (!selected) return;
    setGenHandoff(true); setHandoff('');
    await streamAI(`/ai/handoff/${selected.id}`, {}, chunk => setHandoff(p => p + chunk));
    setGenHandoff(false);
  }

  const filtered = leads.filter(l => {
    if (filter.tier && l.tier !== filter.tier) return false;
    if (filter.source && l.source !== filter.source) return false;
    if (filter.q && !l.company.toLowerCase().includes(filter.q.toLowerCase()) && !l.contact_name?.toLowerCase().includes(filter.q.toLowerCase())) return false;
    return true;
  });

  const ls = liveScore(editing);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Lead list */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/8 flex items-center gap-3">
          <input className="bdr-input max-w-xs" placeholder="Search company or contact…" value={filter.q} onChange={e => setFilter(p=>({...p,q:e.target.value}))} />
          <select className="bdr-input w-auto" value={filter.tier} onChange={e => setFilter(p=>({...p,tier:e.target.value}))}>
            <option value="">All Tiers</option>
            <option value="tier_1_hot">Tier 1 — Hot</option>
            <option value="tier_2_warm">Tier 2 — Warm</option>
            <option value="tier_3_nurture">Tier 3 — Nurture</option>
            <option value="tier_4_archive">Tier 4 — Archive</option>
          </select>
          <select className="bdr-input w-auto" value={filter.source} onChange={e => setFilter(p=>({...p,source:e.target.value}))}>
            <option value="">All Sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{sourceLabel(s)}</option>)}
          </select>
          <div className="ml-auto flex gap-2">
            <span className="text-xs text-white/30">{filtered.length} leads</span>
            <button className="bdr-btn bdr-btn-primary" onClick={() => { setEditing(emptyLead()); setIsNew(true); setSelected(null); }}>+ New Lead</button>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/8">
                {['Company','Tier','Score','Industry','Source','Conv. Prob','Exp. ACV','Status'].map(h => (
                  <th key={h} className="py-2.5 px-4 text-xs text-white/30 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => <LeadRow key={l.id} lead={l} onSelect={l => { setSelected(l); setEditing(null); setNarrative(''); setHandoff(''); }} selected={selected?.id === l.id} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right panel */}
      {(selected || editing) && (
        <div className="w-96 border-l border-white/8 overflow-y-auto flex-shrink-0">
          {editing ? (
            /* Edit form */
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{isNew ? 'New Lead' : `Edit — ${selected?.company}`}</p>
                <button className="text-white/30 hover:text-white/70 text-xs" onClick={() => { setEditing(null); setIsNew(false); }}>✕</button>
              </div>

              {/* Live score preview */}
              <div className="glass rounded-lg p-3 text-center">
                <p className="text-xs text-white/40 mb-1">Live Score Preview</p>
                <p className="text-3xl font-bold font-mono" style={{ color: scoreColor(ls||0) }}>{ls || 0}</p>
                <p className="text-xs text-white/30">/ 100</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-white/40">Company *</label><input className="bdr-input mt-1" value={editing.company} onChange={e => setEditing(p=>({...p,company:e.target.value}))} /></div>
                <div><label className="text-xs text-white/40">Country</label>
                  <select className="bdr-input mt-1" value={editing.country} onChange={e => setEditing(p=>({...p,country:e.target.value}))}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-white/40">Industry</label>
                  <select className="bdr-input mt-1" value={editing.industry} onChange={e => setEditing(p=>({...p,industry:e.target.value}))}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-white/40">Employees</label><input type="number" className="bdr-input mt-1" value={editing.employees} onChange={e => setEditing(p=>({...p,employees:parseInt(e.target.value)||0}))} /></div>
                <div><label className="text-xs text-white/40">Contact Name</label><input className="bdr-input mt-1" value={editing.contact_name} onChange={e => setEditing(p=>({...p,contact_name:e.target.value}))} /></div>
                <div><label className="text-xs text-white/40">Contact Title</label><input className="bdr-input mt-1" value={editing.contact_title} onChange={e => setEditing(p=>({...p,contact_title:e.target.value}))} /></div>
                <div><label className="text-xs text-white/40">Source</label>
                  <select className="bdr-input mt-1" value={editing.source} onChange={e => setEditing(p=>({...p,source:e.target.value}))}>
                    {SOURCES.map(s => <option key={s} value={s}>{sourceLabel(s)}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-white/40">Status</label>
                  <select className="bdr-input mt-1" value={editing.status} onChange={e => setEditing(p=>({...p,status:e.target.value}))}>
                    {['new','qualifying','qualified','handed_off','nurture','archived'].map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </div>
              </div>

              <div className="border-t border-white/8 pt-4 space-y-4">
                <p className="text-xs text-white/40 uppercase tracking-wider">Scoring Factors</p>
                {FACTORS.map(f => (
                  <ScoreSlider key={f.key} factor={f} value={editing[`score_${f.key}`] ?? 3}
                    onChange={v => setEditing(p => ({ ...p, [`score_${f.key}`]: v }))} />
                ))}
              </div>

              <div className="border-t border-white/8 pt-4 space-y-3">
                <p className="text-xs text-white/40 uppercase tracking-wider">Qualification Notes</p>
                {[['use_case_description','Use Case (specific)'],['competitive_landscape','Competitive Landscape'],['compliance_context','Compliance Context'],['next_steps','Next Steps']].map(([k,l]) => (
                  <div key={k}><label className="text-xs text-white/40">{l}</label>
                    <textarea className="bdr-input mt-1" rows={2} value={editing[k]||''} onChange={e => setEditing(p=>({...p,[k]:e.target.value}))} />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button className="bdr-btn bdr-btn-primary flex-1" onClick={save}>Save Lead</button>
                <button className="bdr-btn bdr-btn-secondary" onClick={() => { setEditing(null); setIsNew(false); }}>Cancel</button>
              </div>
            </div>
          ) : selected ? (
            /* Detail view */
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-lg">{selected.company}</p>
                  <p className="text-xs text-white/40">{selected.id} · {selected.country} · {selected.industry}</p>
                </div>
                <button className="bdr-btn bdr-btn-secondary text-xs" onClick={() => setEditing({...selected})}>Edit</button>
              </div>

              {/* Score + tier */}
              <div className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold font-mono" style={{ color: scoreColor(selected.composite_score) }}>{Math.round(selected.composite_score)}</p>
                  <p className="text-xs text-white/30">/ 100</p>
                </div>
                <div className="flex-1 space-y-2">
                  <TierBadge tier={selected.tier} />
                  <p className="text-xs text-white/50">Conv. prob: <span className="font-mono text-blue-400">{fmtPct(selected.conversion_probability)}</span></p>
                  <p className="text-xs text-white/50">Exp. ACV: <span className="font-mono text-orange-400">{fmtEur(selected.expected_acv)}</span></p>
                  <p className="text-xs text-white/50">Route: <span className="text-white/70">{selected.route_to?.replace('_',' ')}</span></p>
                </div>
              </div>

              {/* Factor breakdown */}
              <div className="space-y-2">
                <p className="text-xs text-white/40 uppercase tracking-wider">Factor Breakdown</p>
                {FACTORS.map(f => (
                  <div key={f.key} className="flex items-center gap-2">
                    <span className="text-xs text-white/50 w-36 truncate">{f.label}</span>
                    <div className="flex-1 score-bar-track">
                      <div className="h-full rounded-full" style={{ width:`${(selected[`score_${f.key}`]||3)/5*100}%`, background: scoreColor((selected[`score_${f.key}`]||3)*20) }} />
                    </div>
                    <span className="text-xs font-mono text-white/60">{selected[`score_${f.key}`]||3}/5</span>
                  </div>
                ))}
              </div>

              {/* AI Narrative */}
              <div className="border-t border-white/8 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider">AI Score Narrative</p>
                  <button className="bdr-btn bdr-btn-secondary text-xs py-1 px-2" onClick={genNarrative} disabled={genNarr}>
                    {genNarr ? '⟳' : '✦ Explain'}
                  </button>
                </div>
                {narrative && <p className="text-sm text-white/70 leading-relaxed">{narrative}</p>}
              </div>

              {/* Use case + notes */}
              {selected.use_case_description && (
                <div className="border-t border-white/8 pt-3">
                  <p className="text-xs text-white/40 mb-1">Use Case</p>
                  <p className="text-sm text-white/70 leading-relaxed">{selected.use_case_description}</p>
                </div>
              )}
              {selected.competitive_landscape && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Competitive Landscape</p>
                  <p className="text-sm text-white/70 leading-relaxed">{selected.competitive_landscape}</p>
                </div>
              )}

              {/* Handoff brief */}
              {(selected.tier === 'tier_1_hot' || selected.tier === 'tier_2_warm') && (
                <div className="border-t border-white/8 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-white/40 uppercase tracking-wider">AE Handoff Brief</p>
                    <button className="bdr-btn bdr-btn-primary text-xs py-1.5 px-3" onClick={genHandoffBrief} disabled={genHandoff}>
                      {genHandoff ? '⟳ Generating…' : '✦ Generate Brief'}
                    </button>
                  </div>
                  {(handoff || genHandoff) && (
                    <div className="glass rounded-lg p-4">
                      <pre className="text-xs text-white/75 leading-relaxed whitespace-pre-wrap font-sans">
                        {handoff}{genHandoff && <span className="animate-pulse text-orange-400">▊</span>}
                      </pre>
                      {handoff && (
                        <button className="bdr-btn bdr-btn-secondary text-xs mt-3" onClick={() => navigator.clipboard.writeText(handoff).then(()=>toast('Copied!'))}>
                          Copy to Clipboard
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
