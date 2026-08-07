import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';

const ROLES = ['family', 'caregiver', 'doctor', 'admin'];

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'family',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadUsers() {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRole) params.set('role', filterRole);
      if (filterActive) params.set('active', filterActive);
      const query = params.toString() ? `?${params}` : '';
      const data = await apiRequest(`/admin/users${query}`);
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [filterRole, filterActive]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(user) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
    });
    setMessage('');
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      if (editingId) {
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
        };
        if (form.password) {
          payload.password = form.password;
        }
        await apiRequest(`/admin/users/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setMessage('User updated');
        cancelEdit();
      } else {
        await apiRequest('/admin/users', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setMessage('User created');
        setForm(emptyForm);
      }
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id) {
    setError('');
    setMessage('');
    try {
      await apiRequest(`/admin/users/${id}/deactivate`, { method: 'POST' });
      setMessage('User deactivated (record kept)');
      if (editingId === id) cancelEdit();
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReactivate(id) {
    setError('');
    setMessage('');
    try {
      await apiRequest(`/admin/users/${id}/reactivate`, { method: 'POST' });
      setMessage('User reactivated');
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <DashboardLayout title="Users">
      <div className="panel-section">
        <h2>{editingId ? 'Edit user' : 'Create user'}</h2>
        <form onSubmit={handleSubmit} className="form" style={{ marginTop: 0 }}>
          <div className="form-row two">
            <label>
              Full name
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-row two">
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                required
              />
            </label>
            <label>
              Role
              <select
                value={form.role}
                onChange={(e) => updateField('role', e.target.value)}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Password
            {editingId ? ' (leave blank to keep current)' : ' (min 8 characters)'}
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required={!editingId}
              minLength={editingId ? undefined : 8}
              autoComplete="new-password"
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Save changes'
                  : 'Create user'}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="panel-section">
        <h2>All users</h2>
        <div className="form-row two" style={{ marginBottom: '1rem' }}>
          <label>
            Filter by role
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All roles</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label>
            Filter by status
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
        </div>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="muted">No users found.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span
                        className={
                          user.isActive ? 'badge active' : 'badge inactive'
                        }
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="form-actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => startEdit(user)}
                        >
                          Edit
                        </button>
                        {user.isActive ? (
                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDeactivate(user.id)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => handleReactivate(user.id)}
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
