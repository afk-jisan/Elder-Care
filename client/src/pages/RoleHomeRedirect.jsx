import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homePathForRole } from '../lib/rolePaths';

export default function RoleHomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="muted">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={homePathForRole(user.role)} replace />;
}
