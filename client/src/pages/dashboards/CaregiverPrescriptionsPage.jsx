import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

export default function CaregiverPrescriptionsPage() {
  const [assignments, setAssignments] = useState([]);
  const [items, setItems] = useState([]);
  const [elderId, setElderId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [a, p] = await Promise.all([
        apiRequest('/caregiver/assignments/active'),
        apiRequest('/caregiver/prescriptions'),
      ]);
      setAssignments(a.assignments || []);
      setItems(p.prescriptions || []);
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
      await apiRequest('/caregiver/prescriptions', {
        method: 'POST',
        body: JSON.stringify({ elderId, imageUrl, caption }),
      });
      setMessage('Prescription uploaded (stored URL; imgbb mocked locally)');
      setOpen(false);
      setImageUrl('');
      setCaption('');
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Prescriptions">
      <div className="panel-section">
        <div className="toolbar">
          <p className="muted" style={{ margin: 0 }}>
            Upload prescription images for assigned elders (FR-03). URLs are
            stored locally (imgbb mocked).
          </p>
          <button
            type="button"
            onClick={() => {
              setElderId(assignments[0]?.elder?.id || '');
              setOpen(true);
              setFormError('');
            }}
            disabled={assignments.length === 0}
          >
            Upload
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : items.length === 0 ? (
          <p className="muted">No prescriptions uploaded yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Elder</th>
                  <th>Caption</th>
                  <th>URL</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.elder?.name}</td>
                    <td>{item.caption || '-'}</td>
                    <td>
                      <a href={item.imageUrl} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} title="Upload prescription" onClose={() => setOpen(false)}>
        <form className="form" onSubmit={submit}>
          <label>
            Elder
            <select
              value={elderId}
              onChange={(e) => setElderId(e.target.value)}
              required
            >
              <option value="">Select</option>
              {assignments.map((a) => (
                <option key={a.elder.id} value={a.elder.id}>
                  {a.elder.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Image URL (mock imgbb)
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              placeholder="https://i.ibb.co/..."
            />
          </label>
          <label>
            Caption
            <input value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
          {formError && <p className="error">{formError}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Upload'}
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
