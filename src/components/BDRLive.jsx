import { useState } from 'react';
import Toast from './bdr/Toast';
import Dashboard from './bdr/Dashboard';
import LeadScoring from './bdr/LeadScoring';
import OutboundTracker from './bdr/OutboundTracker';
import DiscoveryPlaybook from './bdr/DiscoveryPlaybook';
import FunnelAnalytics from './bdr/FunnelAnalytics';
import Configuration from './bdr/Configuration';

const NAV = [
  { id:'dashboard', label:'Dashboard',   icon:'⬛', sub:'Pipeline overview' },
  { id:'leads',     label:'Lead Scoring', icon:'◈',  sub:'Score & qualify' },
  { id:'outbound',  label:'Outbound',     icon:'◉',  sub:'Campaign tracker' },
  { id:'discovery', label:'Discovery',    icon:'◎',  sub:'BANT playbook' },
  { id:'funnel',    label:'Analytics',    icon:'▦',  sub:'Funnel & patterns' },
  { id:'config',    label:'Config',       icon:'◧',  sub:'Weights & thresholds' },
];

export default function BDRLive({ onBack }) {
  const [page, setPage] = useState('dashboard');
  const [leadDeeplink, setLeadDeeplink] = useState(null);

  function handleNav(target, id = null) {
    setPage(target);
    if (id) setLeadDeeplink(id);
  }

  const PAGES = {
    dashboard:  <Dashboard onNav={handleNav} />,
    leads:      <LeadScoring initialId={leadDeeplink} />,
    outbound:   <OutboundTracker />,
    discovery:  <DiscoveryPlaybook />,
    funnel:     <FunnelAnalytics />,
    config:     <Configuration />,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'#060612', color:'white', fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-52 flex flex-col flex-shrink-0 border-r border-white/8" style={{ background:'rgba(8,8,18,0.97)' }}>
        <div className="px-4 py-4 border-b border-white/8">
          <button onClick={onBack} className="text-xs text-white/40 hover:text-white/70 mb-3 flex items-center gap-1.5 transition-all">
            ← Portfolio
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background:'linear-gradient(135deg,#FFA040,#ff6b00)' }}>A</div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Anthropic BDR</p>
              <p className="text-xs text-white/30 mt-0.5">EMEA Pipeline OS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              className={`bdr-sidebar-btn ${page===item.id ? 'active' : ''}`}>
              <span className="text-base leading-none" style={{ opacity: page===item.id ? 1 : 0.5 }}>{item.icon}</span>
              <div>
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p className="text-xs text-white/30 mt-0.5">{item.sub}</p>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <p className="text-xs text-white/30">AI · Simulated</p>
          </div>
          <p className="text-xs text-white/15 mt-1">Data stored locally</p>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        {PAGES[page] || null}
      </main>

      <Toast />
    </div>
  );
}
