import { Link, NavLink } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserCircleIcon } from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';
import { ROLE_NAV } from '../lib/navConfig';

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
          <Link to="/">Elder Care</Link>
        </div>
        <div className="topbar-actions">
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
                {link.icon && (
                  <HugeiconsIcon
                    icon={link.icon}
                    size={18}
                    strokeWidth={1.8}
                    className="sidebar-link-icon"
                  />
                )}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <Link to="/profile" className="sidebar-profile">
              <span className="sidebar-profile-icon" aria-hidden="true">
                <HugeiconsIcon
                  icon={UserCircleIcon}
                  size={22}
                  strokeWidth={1.8}
                />
              </span>
              <span className="sidebar-profile-text">
                <span className="sidebar-profile-name">{user.name}</span>
                <span className="sidebar-profile-role">{user.role}</span>
              </span>
            </Link>
          </div>
        </aside>

        <main className="dashboard-main">
          <h1 className="page-title">{title}</h1>
          <div className="page-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
