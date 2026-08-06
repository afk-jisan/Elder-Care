import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      async login(email, password) {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem(STORAGE_KEY, data.token);
        setUser(data.user);
        return data.user;
      },
      async register(payload) {
        const data = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        localStorage.setItem(STORAGE_KEY, data.token);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        try {
          await apiRequest('/auth/logout', { method: 'POST' });
        } catch {
          // Clear local session even if the server call fails
        }
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
