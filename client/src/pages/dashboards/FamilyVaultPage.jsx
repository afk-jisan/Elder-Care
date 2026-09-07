import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

const TYPES = [
  { value: 'nid', label: 'National ID' },
  { value: 'blood_type', label: 'Blood type' },
  { value: 'allergy_list', label: 'Allergy list' },
  { value: 'ecg', label: 'ECG' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'other', label: 'Other' },
];

function typeLabel(value) {
  return TYPES.find((t) => t.value === value)?.label || value;
}

function shareUrlFromToken(token) {
  return `${window.location.origin}/share/${token}`;
}

export default function FamilyVaultPage() {
  const [elders, setElders] = useState([]);
  const [docs, setDocs] = useState([]);
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [form, setForm] = useState({
    elderId: '',
    type: 'nid',
    title: '',
    url: '',
    notes: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharingId, setSharingId] = useState('');

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
    if (!form.url && !imageFile) {
      setFormError('Provide a document URL or image file');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (imageFile) {
        const imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('Failed to read image'));
          reader.readAsDataURL(imageFile);
        });
        payload.imageBase64 = imageBase64;
        payload.fileName = imageFile.name;
        payload.mimeType = imageFile.type;
        delete payload.url;
      }
      await apiRequest('/family/vault', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setMessage('Document saved');
      setOpen(false);
      setImageFile(null);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function activeShare(doc) {
    if (!doc.shareToken || !doc.shareExpiresAt) return null;
    if (new Date(doc.shareExpiresAt).getTime() < Date.now()) return null;
    return {
      url: shareUrlFromToken(doc.shareToken),
      expiresAt: doc.shareExpiresAt,
    };
  }

  async function copyLink(url, id) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setMessage('Share link copied');
      setTimeout(() => setCopiedId(''), 2000);
    } catch {
      setError('Could not copy. Try again.');
    }
  }

  async function createShare(id) {
    setError('');
    setMessage('');
    setSharingId(id);
    try {
      const data = await apiRequest(`/family/vault/${id}/share`, {
        method: 'POST',
        body: JSON.stringify({ hours: 24 }),
      });
      const url = data.shareUrl || shareUrlFromToken(data.shareToken);
      await load();
      await copyLink(url, id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSharingId('');
    }
  }

  return (
    <DashboardLayout title="Medical vault">
      <div className="panel-section">
        <div className="toolbar">
          <p className="muted" style={{ margin: 0 }}>
            Store health records and send a 24-hour link to a doctor or hospital.
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
              setImageFile(null);
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
                  <th>File type</th>
                  <th>File</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => {
                  const existing = activeShare(doc);
                  return (
                    <tr key={doc.id}>
                      <td>{doc.elder?.name}</td>
                      <td>{typeLabel(doc.type)}</td>
                      <td>{doc.title}</td>
                      <td>{doc.fileType || 'Unknown'}</td>
                      <td>
                        {doc.url ? (
                          <a href={doc.url} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        ) : (
                          <span className="muted">None</span>
                        )}
                      </td>
                      <td>
                        {existing ? (
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => copyLink(existing.url, doc.id)}
                          >
                            {copiedId === doc.id ? 'Copied' : 'Copy link'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => createShare(doc.id)}
                            disabled={sharingId === doc.id}
                          >
                            {sharingId === doc.id
                              ? 'Creating...'
                              : 'Create 24h link'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
                <option key={t.value} value={t.value}>
                  {t.label}
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
            Document URL (optional if uploading a file)
            <input
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              placeholder="https://"
            />
          </label>
          <label>
            Or upload image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
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
