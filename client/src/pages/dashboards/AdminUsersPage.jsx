import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
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
  const [modalMode, setModalMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
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
      setUsers([]);
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

  const closeModal = useCallback(() => {
    setModalMode(null);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  }, []);

  function openCreate() {
    setModalMode('create');
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setMessage('');
    setError('');
  }

  function openEdit(user) {
    setModalMode('edit');
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
    });
    setFormError('');
    setMessage('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (modalMode === 'edit' && editingId) {
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
      } else {
        await apiRequest('/admin/users', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setMessage('User created');
      }
      closeModal();
      await loadUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id) {
    setError('');
    setMessage('');
    try {
      await apiRequest(`/admin/users/${id}/deactivate`, { method: 'POST' });
      setMessage('User deactivated. Record kept.');
      if (editingId === id) closeModal();
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
        <div className="toolbar">
          <div className="toolbar-filters">
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
          <button type="button" onClick={openCreate}>
            Create user
          </button>
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
                          onClick={() => openEdit(user)}
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

      <Modal
        open={modalMode !== null}
        title={modalMode === 'edit' ? 'Edit user' : 'Create user'}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="form">
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
            {modalMode === 'edit'
              ? ' (leave blank to keep current)'
              : ' (min 8 characters)'}
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required={modalMode === 'create'}
              minLength={modalMode === 'create' ? 8 : undefined}
              autoComplete="new-password"
            />
          </label>
          {formError && <p className="error">{formError}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : modalMode === 'edit'
                  ? 'Save changes'
                  : 'Create user'}
            </button>
            <button type="button" className="secondary" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
