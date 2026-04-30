import { useState } from 'react';
import Toast from './bdr/Toast';
import Dashboard from './bdr/Dashboard';
import LeadIntelligence from './bdr/LeadScoring';
import OutboundPlanner from './bdr/OutboundTracker';

const TABS = [
  { id: 'dashboard', label: 'Dashboard',         sub: 'Pipeline overview' },
  { id: 'leads',     label: 'Lead Intelligence', sub: 'AI research & scoring' },
  { id: 'outbound',  label: 'Outbound Planner',  sub: 'Target & track' },
];

const ACCENT = '#FFA040';

export default function BDRLive({ onBack }) {
  const [tab, setTab]                   = useState('dashboard');
  const [leadDeeplink, setLeadDeeplink] = useState(null);
  const [apiKey, setApiKey]             = useState(() => localStorage.getItem('bdr_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft]         = useState('');

  const hasKey = apiKey.startsWith('sk-ant-');

  function handleNav(target, id = null) {
    setTab(target);
    if (target === 'leads' && id) setLeadDeeplink(id);
  }

  // Saves the API key to localStorage so all AI calls can use it
  function saveKey() {
    const k = keyDraft.trim();
    setApiKey(k);
    localStorage.setItem('bdr_api_key', k);
    setShowKeyInput(false);
    setKeyDraft('');
  }

  function clearKey() {
    setApiKey('');
    localStorage.removeItem('bdr_api_key');
    setShowKeyInput(false);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background:'#060612', color:'white', fontFamily:"'Inter', system-ui, sans-serif" }}>

      {/* Top navigation bar */}
      <header className="flex-shrink-0 border-b border-white/8 px-6 flex items-center gap-0 relative" style={{ background:'rgba(8,8,18,0.98)', height:52 }}>
        <div className="flex items-center gap-2.5 mr-8">
          <button onClick={onBack} className="text-xs text-white/30 hover:text-white/60 transition-colors mr-2">← Portfolio</button>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background:'linear-gradient(135deg,#FFA040,#ff6b00)' }}>A</div>
          <span className="text-sm font-semibold text-white/90 tracking-tight whitespace-nowrap">BDR OS</span>
        </div>

        <nav className="flex items-center gap-1 flex-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                background: tab===t.id ? 'rgba(255,160,64,0.12)' : 'transparent',
                color:      tab===t.id ? ACCENT : 'rgba(255,255,255,0.4)',
                borderBottom: tab===t.id ? `2px solid ${ACCENT}` : '2px solid transparent',
                borderRadius: tab===t.id ? '8px 8px 0 0' : 8,
              }}>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Status + API key toggle */}
        <div className="flex items-center gap-4 ml-6">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: hasKey ? '#4ade80' : '#fb923c' }} />
            <span className="text-xs text-white/30">{hasKey ? 'Claude · Live' : 'Demo mode'}</span>
          </div>
          <button onClick={() => { setShowKeyInput(v => !v); setKeyDraft(''); }}
            className="text-white/25 hover:text-white/60 transition-colors text-base leading-none"
            title="Anthropic API key">⚙</button>
        </div>

        {/* API key dropdown */}
        {showKeyInput && (
          <div className="absolute top-14 right-4 z-50 rounded-xl border border-white/10 p-4 space-y-3 shadow-2xl"
            style={{ background:'rgba(12,12,24,0.98)', width:320 }}>
            <p className="text-xs text-white/40 uppercase tracking-wider">Anthropic API Key</p>
            <p className="text-xs text-white/30 leading-relaxed">
              Paste your key below to enable real Claude AI for research, handoffs, and outreach. Stored only in your browser.
            </p>
            {hasKey ? (
              <div className="space-y-2">
                <p className="text-xs text-green-400">✓ Key active — sk-ant-…{apiKey.slice(-6)}</p>
                <button onClick={clearKey}
                  className="text-xs text-white/35 hover:text-red-400 transition-colors">Remove key</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="input-field text-xs flex-1"
                  placeholder="sk-ant-api03-..."
                  value={keyDraft}
                  onChange={e => setKeyDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveKey()}
                  type="password"
                  autoFocus
                />
                <button onClick={saveKey} disabled={!keyDraft.trim()}
                  className="btn-primary text-xs px-3">Save</button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 overflow-hidden">
        {tab === 'dashboard' && <Dashboard onNav={handleNav} />}
        {tab === 'leads'     && <LeadIntelligence initialId={leadDeeplink} />}
        {tab === 'outbound'  && <OutboundPlanner />}
      </main>

      <Toast />
    </div>
  );
}
