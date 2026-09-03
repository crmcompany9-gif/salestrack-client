import React, { useState, useEffect } from 'react';
import { toTel } from '../utils/helpers';

// Global event system so any page can trigger the banner
export const callEvents = {
  listeners: [],
  trigger(name, phone) {
    this.listeners.forEach(fn => fn(name, phone));
  },
};

const phoneIcon = (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
  </svg>
);

const Dialer = () => {
  const [open,   setOpen]   = useState(false);
  const [num,    setNum]    = useState('');
  const [banner, setBanner] = useState(null); // { name, phone }

  // Listen for call events from other pages
  useEffect(() => {
    const handler = (name, phone) => {
      setBanner({ name, phone });
      const timer = setTimeout(() => setBanner(null), 30000);
      return () => clearTimeout(timer);
    };
    callEvents.listeners.push(handler);
    return () => { callEvents.listeners = callEvents.listeners.filter(f => f !== handler); };
  }, []);

  const dialKey = (k) => setNum(prev => prev.length < 12 ? prev + k : prev);
  const dialDel = () => setNum(prev => prev.slice(0, -1));

  const dialCall = () => {
    if (!num) return;
    callEvents.trigger('Manual dial', num);
    window.location.href = toTel(num);
    setNum('');
    setOpen(false);
  };

  return (
    <>
      {/* Active call banner */}
      {banner && (
        <div className="call-banner visible">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div className="pulse" />
            <span>Calling {banner.name} · {banner.phone}</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="banner-btn" onClick={() => { setBanner(null); window.location.href = '/log-call'; }}>
              Log this call
            </button>
            <button className="banner-btn end" onClick={() => setBanner(null)}>
              End call
            </button>
          </div>
        </div>
      )}

      {/* Keypad popup */}
      {open && (
        <div className="dialer-popup open">
          <div className="dialer-display">{num || '\u200b'}</div>
          <div className="dialer-grid">
            {['1','2','3','4','5','6','7','8','9'].map(k => (
              <button key={k} className="dial-key" onClick={() => dialKey(k)}>{k}</button>
            ))}
            <button className="dial-key del-key" onClick={dialDel}>⌫</button>
            <button className="dial-key" onClick={() => dialKey('0')}>0</button>
            <button className="dial-key call-key" onClick={dialCall}>Call</button>
          </div>
          <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center' }}>Opens your phone app</div>
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setOpen(o => !o)} aria-label="Open dialer">
        {phoneIcon}
      </button>
    </>
  );
};

export default Dialer;
