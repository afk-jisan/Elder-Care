import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

const emptyForm = {
  elderId: '',
  bloodPressure: '',
  bloodSugar: '',
  weight: '',
  temperature: '',
  behavioralNotes: '',
};

export default function CaregiverVitalsPage() {
  const [assignments, setAssignments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setError('');
    setLoading(true);
    try {
      const [assignData, vitalsData] = await Promise.all([
        apiRequest('/caregiver/assignments/active'),
        apiRequest('/caregiver/vitals'),
      ]);
      setAssignments(assignData.assignments || []);
      setLogs(vitalsData.vitalsLogs || []);
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
      const payload = {
        elderId: form.elderId,
        bloodPressure: form.bloodPressure,
        bloodSugar: Number(form.bloodSugar),
        weight: Number(form.weight),
        behavioralNotes: form.behavioralNotes,
      };
      if (form.temperature !== '') {
        payload.temperature = Number(form.temperature);
      }
      const data = await apiRequest('/caregiver/vitals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setMessage(data.message || 'Vitals saved');
      setModalOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Vitals">
      <div className="panel-section">
        <div className="toolbar">
          <p className="muted" style={{ margin: 0 }}>
            Log blood pressure, blood sugar, weight, and optional notes after a
            visit. Decline keywords are flagged for family review.
          </p>
          <button
            type="button"
            onClick={() => {
              setForm({
                ...emptyForm,
                elderId: assignments[0]?.elder?.id || '',
              });
              setFormError('');
              setModalOpen(true);
            }}
            disabled={assignments.length === 0}
          >
            Log vitals
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        {loading ? (
          <p className="muted">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="muted">No vitals logged yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Elder</th>
                  <th>BP</th>
                  <th>Sugar</th>
                  <th>Weight</th>
                  <th>Temp</th>
                  <th>Notes</th>
                  <th>Flag</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.elder?.name || log.elderId}</td>
                    <td>{log.bloodPressure}</td>
                    <td>{log.bloodSugar}</td>
                    <td>{log.weight}</td>
                    <td>{log.temperature ?? '-'}</td>
                    <td>{log.behavioralNotes || '-'}</td>
                    <td>
                      {log.flagged ? (
                        <span className="badge inactive">Flagged</span>
                      ) : (
                        <span className="muted">No</span>
                      )}
                    </td>
                    <td>{new Date(log.recordedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title="Log vitals"
        onClose={() => setModalOpen(false)}
      >
        <form className="form" onSubmit={submit}>
          <label>
            Elder
            <select
              value={form.elderId}
              onChange={(e) =>
                setForm((p) => ({ ...p, elderId: e.target.value }))
              }
              required
            >
              <option value="">Select elder</option>
              {assignments.map((a) => (
                <option key={a.elder.id} value={a.elder.id}>
                  {a.elder.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-row two">
            <label>
              Blood pressure
              <input
                value={form.bloodPressure}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bloodPressure: e.target.value }))
                }
                placeholder="120/80"
                required
              />
            </label>
            <label>
              Blood sugar
              <input
                type="number"
                step="0.1"
                value={form.bloodSugar}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bloodSugar: e.target.value }))
                }
                required
              />
            </label>
          </div>
          <div className="form-row two">
            <label>
              Weight (kg)
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) =>
                  setForm((p) => ({ ...p, weight: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Temperature (optional)
              <input
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={(e) =>
                  setForm((p) => ({ ...p, temperature: e.target.value }))
                }
              />
            </label>
          </div>
          <label>
            Behavioral notes
            <textarea
              value={form.behavioralNotes}
              onChange={(e) =>
                setForm((p) => ({ ...p, behavioralNotes: e.target.value }))
              }
              rows={3}
            />
          </label>
          {formError && <p className="error">{formError}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save vitals'}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
