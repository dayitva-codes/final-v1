import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfigBar from './ConfigBar';

const NAV_BY_ROLE = {
  admin: [
    { to: '/admin', label: 'Command Setup', icon: '⚡', end: true },
    { to: '/leaderboard', label: 'Live Leaderboard', icon: '🏆' },
  ],
  mentor: [
    { to: '/mentor', label: 'Cadet Evaluation Terminal', icon: '🎯', end: true },
    { to: '/leaderboard', label: 'Live Leaderboard', icon: '🏆' },
  ],
  cadet: [
    { to: '/cadet', label: 'Cadet Dossier & AI', icon: '👤', end: true },
    { to: '/leaderboard', label: 'Live Leaderboard', icon: '🏆' },
  ],
};

export default function AppShell() {
  const { user, logout } = useAuth();
  const links = NAV_BY_ROLE[user?.role] || [];

  const roleLabels = {
    admin: { name: 'HQ COMMANDER', color: 'var(--neon-cyan)', bg: 'rgba(0, 240, 255, 0.15)' },
    mentor: { name: 'BATTALION MENTOR', color: 'var(--gold)', bg: 'rgba(255, 184, 0, 0.15)' },
    cadet: { name: 'ACTIVE CADET', color: 'var(--neon-emerald)', bg: 'rgba(0, 255, 170, 0.15)' },
  };

  const roleMeta = roleLabels[user?.role] || { name: 'GUEST', color: 'var(--paper-dim)', bg: 'rgba(255,255,255,0.05)' };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-lockup">
            <div className="brand-mark">NCC</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ margin: 0, fontSize: 18, letterSpacing: '0.06em' }}>COMMAND OS</h1>
              <span style={{ fontSize: 10, color: 'var(--paper-dim)', fontFamily: 'var(--font-mono)' }}>v2.4.0 · SUPABASE</span>
            </div>
          </div>
          
          <div style={{
            marginTop: 14,
            padding: '4px 10px',
            background: roleMeta.bg,
            border: `1px solid ${roleMeta.color}`,
            borderRadius: 4,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: roleMeta.color, boxShadow: `0 0 6px ${roleMeta.color}` }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 11,
              color: roleMeta.color,
              letterSpacing: '0.08em'
            }}>
              {roleMeta.name}
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <span style={{ fontSize: 14 }}>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="nav-footer">
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '8px 10px',
            marginBottom: 10
          }}>
            <div style={{ fontSize: 10, color: 'var(--paper-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Authenticated User</div>
            <div style={{ fontSize: 12, color: 'var(--paper-bright)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <button className="logout-btn" onClick={logout} style={{ width: '100%' }}>
            ⏻ Terminate Session
          </button>
        </div>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ConfigBar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
