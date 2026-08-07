import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_NAV } from '../lib/navConfig';
import { homePathForRole } from '../lib/rolePaths';

export default function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const links = ROLE_NAV[user.role] || [];

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <Link to={homePathForRole(user.role)}>Elder Care</Link>
        </div>
        <div className="topbar-user">
          <span className="muted">
            {user.name} · {user.role}
          </span>
          <button type="button" className="secondary" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          <nav className="sidebar-nav" aria-label="Dashboard">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={Boolean(link.end)}
                className={({ isActive }) =>
                  isActive ? 'sidebar-link active' : 'sidebar-link'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          <h1 className="page-title">{title}</h1>
          <div className="page-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
