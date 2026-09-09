import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfigBar from './ConfigBar';

const NAV_BY_ROLE = {
  admin: [
    { to: '/admin', label: 'Command Setup', end: true },
    { to: '/leaderboard', label: 'Leaderboard' },
  ],
  mentor: [
    { to: '/mentor', label: 'Evaluate Cadets', end: true },
    { to: '/leaderboard', label: 'Leaderboard' },
  ],
  cadet: [
    { to: '/cadet', label: 'My Profile', end: true },
    { to: '/leaderboard', label: 'Leaderboard' },
  ],
};

export default function AppShell() {
  const { user, logout } = useAuth();
  const links = NAV_BY_ROLE[user?.role] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
        <div className="brand-lockup"><div className="brand-mark">N</div><h1>NCC Command</h1></div>
        <p className="brand-caption">Battalion operations suite</p>
          <span className="role-badge">{user?.role?.toUpperCase()}</span>
        </div>
        <nav>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-footer">
          <div style={{ fontSize: 12, color: 'var(--paper-dim)', marginBottom: 8 }}>{user?.email}</div>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <div>
        <ConfigBar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
