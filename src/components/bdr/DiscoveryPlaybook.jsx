import { useState } from 'react';
import { api } from '../../lib/bdrApi';
import { toast } from './Toast';

const SECTIONS = [
  {
    id: 'situation',
    label: 'Situation',
    color: '#60a5fa',
    icon: '🏢',
    questions: [
      {
        id: 'q1',
        text: 'Can you walk me through how your team currently handles AI/ML workloads or LLM-related tasks?',
        probe: 'What tools or providers are you using today?',
        ifPositive: 'Great — understand their stack. Note existing vendors to position displacement or co-existence.',
        ifNegative: 'They\'re pre-AI. Position Anthropic as the safe first step: Claude API > build vs. buy.',
        scoreKey: 'score_situation',
      },
      {
        id: 'q2',
        text: 'What\'s the size of the team that would be working with or impacted by an AI solution?',
        probe: 'How many engineers, data scientists, or business users would touch this?',
        ifPositive: 'Larger team → bigger ACVs. Map to Enterprise or Startup route early.',
        ifNegative: 'Small team is fine — focus on speed-to-value, API simplicity.',
        scoreKey: null,
      },
      {
        id: 'q3',
        text: 'What\'s driving interest in AI capabilities right now — is this a top-down initiative or bottoms-up?',
        probe: 'Is the CEO/CTO sponsoring this, or are engineers pulling it in?',
        ifPositive: 'Top-down = budget exists, faster close. Flag for AE handoff immediately.',
        ifNegative: 'Bottoms-up = longer but sticky. Nurture champion, provide free tier onboarding.',
        scoreKey: 'score_situation',
      },
    ],
  },
  {
    id: 'problem',
    label: 'Problem',
    color: '#fb923c',
    icon: '🔍',
    questions: [
      {
        id: 'q4',
        text: 'What\'s the biggest bottleneck your team faces that AI could address — speed, quality, cost, or compliance?',
        probe: 'Which of those is most painful right now?',
        ifPositive: 'Pain is explicit → this is a qualified lead. Match to Claude\'s strengths: reasoning, safety, long context.',
        ifNegative: 'No clear pain = risk of "nice to have." Reframe: "What would it mean to move 3× faster on X?"',
        scoreKey: 'score_pain',
      },
      {
        id: 'q5',
        text: 'Have you tried any AI solutions before? What worked, what didn\'t?',
        probe: 'What was the failure mode — hallucinations, cost, latency, data privacy?',
        ifPositive: 'Prior bad experience = warm lead. They know they need it. Position Claude\'s Constitutional AI, low hallucination rate.',
        ifNegative: 'First-time buyer = educate on evaluation criteria. Position Anthropic\'s safety-first brand.',
        scoreKey: 'score_pain',
      },
    ],
  },
  {
    id: 'impact',
    label: 'Impact',
    color: '#4ade80',
    icon: '📈',
    questions: [
      {
        id: 'q6',
        text: 'If this problem went unsolved for 12 months, what would that cost you — in time, revenue, or competitive position?',
        probe: 'Can you put a number on it?',
        ifPositive: 'Quantified pain = easy ROI math. Use to build business case for AE. Tie to expected ACV.',
        ifNegative: 'No number = low urgency. Ask: "What\'s the cost of your team spending X hours/week on this manually?"',
        scoreKey: 'score_impact',
      },
      {
        id: 'q7',
        text: 'What would "success" look like 6 months after deploying an AI solution? How would you measure it?',
        probe: 'What KPIs would move?',
        ifPositive: 'Clear success metrics = they\'ve thought this through. High conversion probability. Capture metrics for the handoff brief.',
        ifNegative: 'Vague = needs consultative selling. Help them define metrics — positions you as a strategic partner.',
        scoreKey: 'score_impact',
      },
    ],
  },
  {
    id: 'budget',
    label: 'Budget & Authority',
    color: '#a78bfa',
    icon: '💰',
    questions: [
      {
        id: 'q8',
        text: 'Do you have a budget allocated for AI tooling or API infrastructure this year?',
        probe: 'Is it part of an existing engineering budget or a new line item?',
        ifPositive: 'Budget exists → qualified. Ask range. Map: <€20K = Startup route; >€50K = Enterprise route.',
        ifNegative: 'No budget = check if they can create one. "Who owns the P&L for this initiative?" Find the budget holder.',
        scoreKey: 'score_budget',
      },
      {
        id: 'q9',
        text: 'Who else would be involved in the decision to move forward — technical, legal, procurement?',
        probe: 'Is there a security or data privacy review? Who signs off?',
        ifPositive: 'They know the process = faster close. Map the committee, get intro to economic buyer.',
        ifNegative: 'Unclear = risk of ghosting at legal. Set expectation: "Anthropic\'s security team has SOC2 docs ready — want me to send them pre-emptively?"',
        scoreKey: 'score_decision_access',
      },
      {
        id: 'q10',
        text: 'Are you evaluating any other vendors? Where are you in that process?',
        probe: 'OpenAI? Azure OpenAI? Cohere? Internal models?',
        ifPositive: 'In a bake-off = suggest a pilot. "We can have you in production in 48h — let results speak."',
        ifNegative: 'Sole vendor = great. Ask what\'s blocking them from moving forward.',
        scoreKey: 'score_budget',
      },
    ],
  },
  {
    id: 'timeline',
    label: 'Timeline & Next Steps',
    color: '#f472b6',
    icon: '⏱️',
    questions: [
      {
        id: 'q11',
        text: 'What does your ideal timeline look like — when would you want to have something in production?',
        probe: 'Is there a product launch, board review, or regulatory deadline driving this?',
        ifPositive: 'Hard deadline = urgency. Fast-track to AE. Use as lever to compress procurement.',
        ifNegative: 'No deadline = create one. "If we started technical evaluation next week, you\'d have results before Q3 planning."',
        scoreKey: 'score_timeline',
      },
      {
        id: 'q12',
        text: 'What would need to be true for you to be comfortable recommending Anthropic internally?',
        probe: 'Security docs, a pilot, pricing clarity, reference customers?',
        ifPositive: 'Concrete asks = they\'re serious. Match each ask to a specific Anthropic asset (SOC2, console.anthropic.com, case studies).',
        ifNegative: 'Abstract hesitation = uncover the real objection. "What concerns do you have that we haven\'t addressed yet?"',
        scoreKey: 'score_timeline',
      },
    ],
  },
];

const SCORE_LABELS = { 1: 'Weak', 2: 'Developing', 3: 'Moderate', 4: 'Strong', 5: 'Excellent' };
const SCORE_COLORS = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#84cc16', 5: '#4ade80' };

function ScoreInput({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color: SCORE_COLORS[value] || '#94a3b8' }}>
          {value ? `${value}/5 — ${SCORE_LABELS[value]}` : 'Not scored'}
        </span>
      </div>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => onChange(n)}
            className="flex-1 h-6 rounded transition-all"
            style={{ background: value >= n ? (SCORE_COLORS[value] || '#94a3b8') : 'rgba(255,255,255,0.07)', opacity: value >= n ? 1 : 0.5 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function DiscoveryPlaybook() {
  const [activeSection, setActiveSection] = useState('situation');
  const [openQ, setOpenQ] = useState(null);
  const [scores, setScores] = useState({ score_situation:0, score_pain:0, score_impact:0, score_budget:0, score_decision_access:0, score_timeline:0 });
  const [notes, setNotes] = useState('');
  const [leadId, setLeadId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showIfThen, setShowIfThen] = useState({});

  const setScore = (key, val) => setScores(p => ({ ...p, [key]: val }));

  const totalScore = Object.values(scores).reduce((a,b) => a+b, 0);
  const maxScore = Object.keys(scores).length * 5;
  const pct = Math.round((totalScore / maxScore) * 100);
  const verdict = pct >= 75 ? { label: 'Qualified — Hand to AE', color: '#4ade80' }
    : pct >= 50 ? { label: 'Developing — Continue Nurture', color: '#fb923c' }
    : { label: 'Unqualified — Recycle', color: '#94a3b8' };

  async function saveToLead() {
    if (!leadId) return toast('Paste a Lead ID first', 'error');
    setSaving(true);
    try {
      await api.discovery.save(leadId, { ...scores, notes });
      setSaved(true);
      toast('Discovery saved & lead score updated');
    } catch { toast('Save failed — check Lead ID', 'error'); }
    finally { setSaving(false); }
  }

  const section = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: section nav + score panel */}
      <div className="w-72 border-r border-white/8 overflow-y-auto flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-white/8">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Discovery Playbook</p>
          <p className="text-sm text-white/70">BANT qualification guide</p>
        </div>

        {/* Section nav */}
        <div className="p-3 space-y-1 flex-1">
          {SECTIONS.map(s => {
            const sectionQs = s.questions.filter(q => q.scoreKey);
            const sectionScored = sectionQs.every(q => scores[q.scoreKey] > 0);
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full text-left rounded-xl px-4 py-3 transition-all ${activeSection===s.id ? 'glass-strong' : 'hover:bg-white/5'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-base">{s.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{s.label}</p>
                    <p className="text-xs text-white/35">{s.questions.length} questions</p>
                  </div>
                  {sectionScored && <span className="text-xs text-green-400">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Score summary */}
        <div className="p-4 border-t border-white/8 space-y-3">
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/40 uppercase tracking-wider">BANT Score</p>
              <p className="text-2xl font-bold font-mono" style={{ color: verdict.color }}>{pct}%</p>
            </div>
            <div className="bdr-score-track">
              <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background: verdict.color }} />
            </div>
            <p className="text-xs font-medium" style={{ color: verdict.color }}>{verdict.label}</p>
          </div>

          <div className="space-y-2">
            {Object.entries(scores).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-white/40 capitalize">{key.replace('score_','').replace('_',' ')}</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className="w-2 h-2 rounded-full" style={{ background: val >= n ? SCORE_COLORS[val] : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-white/40">Save to Lead ID</label>
            <input className="bdr-input mt-1 text-xs" placeholder="lead_XXXXXXXX" value={leadId} onChange={e=>setLeadId(e.target.value)} />
          </div>
          <button className="bdr-btn bdr-btn-primary w-full text-sm" onClick={saveToLead} disabled={saving || saved}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : '↑ Save Discovery'}
          </button>
        </div>
      </div>

      {/* Right: questions */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4 max-w-2xl">
          {/* Section header */}
          <div className="flex items-center gap-3 pb-2 border-b border-white/8">
            <span className="text-2xl">{section.icon}</span>
            <div>
              <p className="font-bold text-white text-lg">{section.label}</p>
              <p className="text-xs text-white/40">{section.questions.length} questions · Click to expand coaching notes</p>
            </div>
          </div>

          {/* Scores for this section */}
          {[...new Set(section.questions.map(q => q.scoreKey).filter(Boolean))].map(key => (
            <div key={key} className="glass rounded-xl p-4">
              <ScoreInput
                label={`${key.replace('score_','').replace('_',' ')} signal strength`}
                value={scores[key]}
                onChange={v => setScore(key, v)}
              />
            </div>
          ))}

          {/* Questions */}
          <div className="space-y-3">
            {section.questions.map((q, i) => (
              <div key={q.id} className="glass rounded-xl overflow-hidden">
                <button className="w-full text-left px-5 py-4 flex items-start gap-4" onClick={() => setOpenQ(openQ===q.id ? null : q.id)}>
                  <span className="text-lg font-bold font-mono mt-0.5" style={{ color: section.color }}>Q{i+1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium leading-relaxed">{q.text}</p>
                    <p className="text-xs text-white/35 mt-1 italic">↳ {q.probe}</p>
                  </div>
                  <span className="text-white/30 text-xs mt-1">{openQ===q.id ? '▲' : '▼'}</span>
                </button>

                {openQ===q.id && (
                  <div className="px-5 pb-5 space-y-3 border-t border-white/8 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg p-3 space-y-1" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                        <p className="text-xs font-semibold text-green-400">If they respond positively:</p>
                        <p className="text-xs text-white/65 leading-relaxed">{q.ifPositive}</p>
                      </div>
                      <div className="rounded-lg p-3 space-y-1" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                        <p className="text-xs font-semibold text-red-400">If they push back or hesitate:</p>
                        <p className="text-xs text-white/65 leading-relaxed">{q.ifNegative}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Notes for this section */}
          <div className="glass rounded-xl p-4">
            <label className="text-xs text-white/40 uppercase tracking-wider">Call Notes</label>
            <textarea className="bdr-input mt-2 text-sm" rows={4}
              placeholder="Capture key quotes, objections, and next steps here…"
              value={notes} onChange={e=>setNotes(e.target.value)} />
          </div>

          {/* Quick reference card */}
          <div className="glass rounded-xl p-5 space-y-3" style={{ borderTop: '2px solid rgba(255,160,64,0.3)' }}>
            <p className="text-xs text-white/40 uppercase tracking-wider">Quick Reference — Qualification Thresholds</p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                ['Tier 1 Route', 'Enterprise', '€80K–€150K ACV · 500+ employees · Regulated industry'],
                ['Tier 2 Route', 'Growth', '€25K–€60K ACV · 50–500 employees · Series B+'],
                ['Tier 3 Route', 'Startup', '<€20K ACV · Invite to Claude for Teams / API sandbox'],
              ].map(([tier, label, desc]) => (
                <div key={tier} className="rounded-lg p-3 bg-white/4">
                  <p className="font-semibold text-orange-400">{tier}</p>
                  <p className="text-white/70 font-medium mt-0.5">{label}</p>
                  <p className="text-white/40 mt-1 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
