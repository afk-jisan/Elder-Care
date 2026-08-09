import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

const TYPES = [
  'nid',
  'blood_type',
  'allergy_list',
  'ecg',
  'prescription',
  'other',
];

export default function FamilyVaultPage() {
  const [elders, setElders] = useState([]);
  const [docs, setDocs] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    elderId: '',
    type: 'nid',
    title: '',
    url: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [e, d] = await Promise.all([
        apiRequest('/family/elders'),
        apiRequest('/family/vault'),
      ]);
      setElders(e.elders || []);
      setDocs(d.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await apiRequest('/family/vault', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('Document saved');
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function share(id) {
    setError('');
    setMessage('');
    try {
      const data = await apiRequest(`/family/vault/${id}/share`, {
        method: 'POST',
        body: JSON.stringify({ hours: 24 }),
      });
      setMessage(`Share path: ${data.sharePath} (expires ${new Date(data.shareExpiresAt).toLocaleString()})`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <DashboardLayout title="Medical vault">
      <div className="panel-section">
        <div className="toolbar">
          <p className="muted" style={{ margin: 0 }}>
            Store elder health documents and create time-limited share links
            (FR-09).
          </p>
          <button
            type="button"
            onClick={() => {
              setForm({
                elderId: elders[0]?.id || '',
                type: 'nid',
                title: '',
                url: '',
                notes: '',
              });
              setOpen(true);
              setFormError('');
            }}
            disabled={elders.length === 0}
          >
            Add document
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : docs.length === 0 ? (
          <p className="muted">Vault is empty.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Elder</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.elder?.name}</td>
                    <td>{doc.type}</td>
                    <td>{doc.title}</td>
                    <td>
                      <a href={doc.url} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => share(doc.id)}
                      >
                        Share 24h
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} title="Add vault document" onClose={() => setOpen(false)}>
        <form className="form" onSubmit={submit}>
          <label>
            Elder
            <select
              value={form.elderId}
              onChange={(e) => setForm((p) => ({ ...p, elderId: e.target.value }))}
              required
            >
              <option value="">Select</option>
              {elders.map((elder) => (
                <option key={elder.id} value={elder.id}>
                  {elder.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </label>
          <label>
            Document URL
            <input
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              required
            />
          </label>
          <label>
            Notes
            <input
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </label>
          {formError && <p className="error">{formError}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
