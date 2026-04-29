import { useEffect, useState } from 'react';

let setToastGlobal = null;
export function toast(msg, type = 'success') {
  setToastGlobal?.({ msg, type, id: Date.now() });
}

export default function Toast() {
  const [t, setT] = useState(null);
  setToastGlobal = setT;
  useEffect(() => {
    if (!t) return;
    const timer = setTimeout(() => setT(null), 3000);
    return () => clearTimeout(timer);
  }, [t]);
  if (!t) return null;
  const bg = t.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(34,197,94,0.95)';
  return (
    <div className="bdr-toast" style={{ background: bg, color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      {t.msg}
    </div>
  );
}
