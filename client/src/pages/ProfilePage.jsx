import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) {
    return null;
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
      };
      if (form.password) {
        payload.password = form.password;
      }
      const data = await apiRequest('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      await refreshUser(data.user);
      setForm((prev) => ({ ...prev, password: '' }));
      setMessage('Profile updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Profile">
      <div className="panel-section">
        <p className="muted">
          Signed in as <strong>{user.email}</strong> ({user.role}).
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              required
            />
          </label>
          <label>
            New password (leave blank to keep current)
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
