import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="card wide">
      <header className="dashboard-header">
        <div>
          <h1>{title}</h1>
          <p className="muted">
            Signed in as {user.name} ({user.role})
          </p>
        </div>
        <button type="button" className="secondary" onClick={() => logout()}>
          Log out
        </button>
      </header>
      {children}
    </div>
  );
}
