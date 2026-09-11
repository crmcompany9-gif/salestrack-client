import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { initials, avatarColor, PhoneIcon } from '../utils/helpers';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dialerOpen, setDialerOpen] = useState(false);
  const [dialNum, setDialNum] = useState('');
  const [banner, setBanner] = useState(null);

  const isManager = user?.role === 'manager';

  const handleLogout = () => { logout(); navigate('/login'); };

  const dialKey = (k) => setDialNum(p => p.length < 12 ? p + k : p);
  const dialDel = () => setDialNum(p => p.slice(0, -1));
  const dialCall = () => {
    if (!dialNum) return;
    setBanner({ name: 'Manual dial', phone: dialNum });
    window.location.href = `tel:+91${dialNum.replace(/\s/g, '')}`;
    setDialNum('');
    setDialerOpen(false);
  };

  const showBanner = (name, phone) => {
    setBanner({ name, phone });
    setTimeout(() => setBanner(null), 30000);
  };
  window.__stBanner = showBanner;

  return (
    <>
      {/* Call banner */}
      {banner && (
        <div className="call-banner visible">
          <div className="call-banner-left">
            <div className="pulse" />
            <span>Calling {banner.name} &bull; {banner.phone}</span>
          </div>
          <div className="call-banner-right">
            <button className="banner-btn" onClick={() => { setBanner(null); navigate('/log'); }}>Log this call</button>
            <button className="banner-btn end" onClick={() => setBanner(null)}>End call</button>
          </div>
        </div>
      )}

      <div className="app-shell">

        {/* ── Desktop Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              </div>
              <div>
                <div className="logo-name">SalesTrack</div>
                <div className="logo-co">Elbow Grease</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">Overview</div>
            <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
              Dashboard
            </NavLink>
            <NavLink to="/calls" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" /></svg>
              Call logs
            </NavLink>
            <NavLink to="/clients" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
              Clients
            </NavLink>
            {isManager && (
              <>
                <div className="nav-section">Management</div>
                <NavLink to="/targets" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                  Targets
                </NavLink>
                <NavLink to="/team" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                  Team
                </NavLink>
              </>
            )}
            <div className="nav-section">Actions</div>
            <NavLink to="/log" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
              Log a call
            </NavLink>
            {isManager && (
              <NavLink to="/password" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                Change password
              </NavLink>
            )}
           <NavLink to="/incentives" className={({isActive})=>`nav-item${isActive?' active':''}`}>
  <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
  Incentives
</NavLink>
          </nav>

          <div className="sidebar-footer">
            <div className="user-row">
              <div className={`avatar ${avatarColor(user?.name)}`}>{initials(user?.name)}</div>
              <div>
                <div className="user-name">{user?.name}</div>
                <div className="user-role">{isManager ? 'Manager' : 'Sales executive'}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main-area">
          <header className="topbar">
            <div className="topbar-left">
              {/* Logo shown on mobile (sidebar hidden) */}
              <div className="logo-icon" style={{ display: 'none' }} id="mobile-logo">
                <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              </div>
              <span className="page-title" id="page-title">Dashboard</span>
            </div>
            <div className="topbar-right">
              <span className="role-chip">{isManager ? 'Manager view' : 'Employee view'}</span>
              <button className="btn primary" onClick={() => navigate('/log')}>
                <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Log call
              </button>
              <button className="btn" onClick={handleLogout} title="Sign out">
                <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
            </div>
          </header>

          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `bn-item${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
          Home
        </NavLink>
        <NavLink to="/calls" className={({ isActive }) => `bn-item${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" /></svg>
          Calls
        </NavLink>
        <NavLink to="/log" className="bn-item log-btn">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Log
        </NavLink>
        <NavLink to="/clients" className={({ isActive }) => `bn-item${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
          Clients
        </NavLink>
        {isManager ? (
          <NavLink to="/password" className={({ isActive }) => `bn-item${isActive ? ' active' : ''}`}>
            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            Password
          </NavLink>
       ) : (
  <NavLink to="/incentives" className={({isActive})=>`bn-item${isActive?' active':''}`}>
    <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
    Incentive
  </NavLink>
)}
      </nav>

      {/* ── Floating dialer ── */}
      {dialerOpen && (
        <div className="dialer-popup">
          <div className="dialer-display">{dialNum || '\u200b'}</div>
          <div className="dialer-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k => (
              <button key={k} className="dial-key" onClick={() => dialKey(k)}>{k}</button>
            ))}
            <button className="dial-key del-key" onClick={dialDel}>⌫</button>
            <button className="dial-key" onClick={() => dialKey('0')}>0</button>
            <button className="dial-key call-key" onClick={dialCall}>Call</button>
          </div>
          <div className="dialer-hint">Opens your phone app</div>
        </div>
      )}
      <button className="fab" onClick={() => setDialerOpen(o => !o)} title="Dial a number">
        <PhoneIcon />
      </button>
    </>
  );
}
