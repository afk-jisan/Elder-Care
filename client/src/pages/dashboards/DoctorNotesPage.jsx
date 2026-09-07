import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';
import { emptyNotes } from '../../lib/doctorSessionUi';

export default function DoctorNotesPage() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesSessionId, setNotesSessionId] = useState('');
  const [notesForm, setNotesForm] = useState(emptyNotes);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/doctor/sessions');
      setSessions((data.sessions || []).filter((s) => s.status === 'ended'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openNotes(session) {
    setNotesSessionId(session.id);
    setNotesForm({
      ...emptyNotes,
      notes: session.notes || '',
      diagnosis: session.diagnosis || '',
      followUp: session.followUp || '',
    });
    setFormError('');
    setNotesOpen(true);
  }

  async function saveNotes(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        notes: notesForm.notes,
        diagnosis: notesForm.diagnosis,
        followUp: notesForm.followUp,
      };
      if (notesForm.medicineName.trim()) {
        payload.prescription = {
          medicineName: notesForm.medicineName,
          dosage: notesForm.dosage,
          frequency: notesForm.frequency,
          duration: notesForm.duration,
        };
      }
      const data = await apiRequest(`/doctor/sessions/${notesSessionId}/notes`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setMessage(data.message || 'Notes saved');
      setNotesOpen(false);
      setNotesForm(emptyNotes);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Session notes">
      <div className="panel-section">
        <p className="muted">
          Write diagnosis, follow-up, and digital prescriptions after ended
          consultations. Locked 24 hours after save (FR-13).
        </p>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="muted">No ended sessions yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Elder</th>
                  <th>Caregiver</th>
                  <th>Minutes</th>
                  <th>Diagnosis</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.elder?.name || s.elderId}</td>
                    <td>{s.caregiver?.name || s.caregiverId}</td>
                    <td>{s.durationMinutes || '—'}</td>
                    <td>{s.diagnosis || '—'}</td>
                    <td>
                      <button type="button" onClick={() => openNotes(s)}>
                        Notes / Rx
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        title="Session notes"
      >
        <form className="form" onSubmit={saveNotes}>
          {formError && <p className="error">{formError}</p>}
          <label>
            Notes
            <textarea
              value={notesForm.notes}
              onChange={(e) =>
                setNotesForm({ ...notesForm, notes: e.target.value })
              }
              rows={3}
            />
          </label>
          <label>
            Diagnosis
            <input
              value={notesForm.diagnosis}
              onChange={(e) =>
                setNotesForm({ ...notesForm, diagnosis: e.target.value })
              }
            />
          </label>
          <label>
            Follow-up
            <input
              value={notesForm.followUp}
              onChange={(e) =>
                setNotesForm({ ...notesForm, followUp: e.target.value })
              }
            />
          </label>
          <h3>Digital prescription (optional)</h3>
          <label>
            Medicine
            <input
              value={notesForm.medicineName}
              onChange={(e) =>
                setNotesForm({ ...notesForm, medicineName: e.target.value })
              }
            />
          </label>
          <label>
            Dosage
            <input
              value={notesForm.dosage}
              onChange={(e) =>
                setNotesForm({ ...notesForm, dosage: e.target.value })
              }
            />
          </label>
          <label>
            Frequency
            <input
              value={notesForm.frequency}
              onChange={(e) =>
                setNotesForm({ ...notesForm, frequency: e.target.value })
              }
            />
          </label>
          <label>
            Duration
            <input
              value={notesForm.duration}
              onChange={(e) =>
                setNotesForm({ ...notesForm, duration: e.target.value })
              }
            />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save notes'}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
