import { lazy, Suspense, useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';
import { isLiveVideoRoom, videoRoomLabel } from '../../lib/videoSession';

const HmsVideoPanel = lazy(() => import('../../components/HmsVideoPanel'));

const emptyNotes = {
  notes: '',
  diagnosis: '',
  followUp: '',
  medicineName: '',
  dosage: '',
  frequency: '',
  duration: '',
};

function VideoBadge({ roomId }) {
  const live = isLiveVideoRoom(roomId);
  return (
    <span className={`video-badge ${live ? 'live' : 'unavailable'}`}>
      {videoRoomLabel(roomId)}
    </span>
  );
}

export default function DoctorSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesSessionId, setNotesSessionId] = useState('');
  const [notesForm, setNotesForm] = useState(emptyNotes);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [joinId, setJoinId] = useState('');

  async function load({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      const [s, p, r] = await Promise.all([
        apiRequest('/doctor/sessions'),
        apiRequest('/doctor/prescriptions'),
        apiRequest('/doctor/rating'),
      ]);
      setSessions(s.sessions || []);
      setPrescriptions(p.prescriptions || []);
      setRating(r);
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(() => load({ silent: true }), 5000);
    return () => clearInterval(t);
  }, []);

  async function respond(id, decision) {
    setError('');
    setMessage('');
    try {
      const data = await apiRequest(`/doctor/sessions/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ decision }),
      });
      setMessage(data.message);
      await load({ silent: true });
    } catch (err) {
      setError(err.message);
    }
  }

  async function endSession(id) {
    setError('');
    try {
      await apiRequest(`/doctor/sessions/${id}/end`, { method: 'POST' });
      setMessage('Session ended');
      setJoinId('');
      await load({ silent: true });
    } catch (err) {
      setError(err.message);
    }
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
      await load({ silent: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const joinSession = joinId ? sessions.find((s) => s.id === joinId) : null;

  return (
    <DashboardLayout title="Consultations">
      <div className="panel-section">
        <p className="muted">
          Accept video consultation requests, review prescriptions, and write post-session notes.
          Family ratings average: {rating.average} ({rating.count}).
        </p>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <>
            <h2>Sessions</h2>
            {sessions.length === 0 ? (
              <p className="muted">No session requests.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Elder</th>
                      <th>Caregiver</th>
                      <th className="col-status">Status</th>
                      <th className="col-video">Video</th>
                      <th>Rating</th>
                      <th>Review</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.elder?.name || s.elderId}</td>
                        <td>{s.caregiver?.name || s.caregiverId}</td>
                        <td>{s.status}</td>
                        <td>
                          <VideoBadge roomId={s.roomId} />
                        </td>
                        <td>
                          {s.rating ? (
                            <span className="rating-stars">
                              {'★'.repeat(s.rating.score)}
                              {'☆'.repeat(5 - s.rating.score)}
                              <span className="rating-score">{s.rating.score}/5</span>
                            </span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td className="review-cell">
                          {s.rating?.review || '—'}
                        </td>
                        <td>
                          <div className="table-actions">
                            {s.status === 'requested' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => respond(s.id, 'accept')}
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => respond(s.id, 'decline')}
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {s.status === 'active' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setJoinId(s.id)}
                                  disabled={!isLiveVideoRoom(s.roomId)}
                                  title={
                                    isLiveVideoRoom(s.roomId)
                                      ? 'Join the live 100ms call'
                                      : 'This session cannot join video. Request a new consult.'
                                  }
                                >
                                  Join video
                                </button>
                                <button
                                  type="button"
                                  onClick={() => endSession(s.id)}
                                >
                                  End
                                </button>
                              </>
                            )}
                            {s.status === 'ended' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setNotesSessionId(s.id);
                                  setNotesForm({
                                    ...emptyNotes,
                                    notes: s.notes || '',
                                    diagnosis: s.diagnosis || '',
                                    followUp: s.followUp || '',
                                  });
                                  setFormError('');
                                  setNotesOpen(true);
                                }}
                              >
                                Notes / Rx
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

            <h2>Prescriptions</h2>
            {prescriptions.length === 0 ? (
              <p className="muted">No prescriptions uploaded yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Elder</th>
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((p) => (
                      <tr key={p.id}>
                        <td>{p.elder?.name || p.elderName || '—'}</td>
                        <td>{p.medicineName}</td>
                        <td>{p.dosage || '—'}</td>
                        <td>
                          <a href={p.imageUrl} target="_blank" rel="noreferrer">
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={Boolean(joinId && joinSession)}
        onClose={() => setJoinId('')}
        title="Live video consult"
        className="modal-wide modal-video"
      >
        {joinSession && (
          <Suspense fallback={<p className="muted">Loading video module...</p>}>
            <HmsVideoPanel
              sessionId={joinId}
              roomId={joinSession.roomId}
              rolePath="doctor"
              elderName={joinSession.elder?.name}
              caregiverName={joinSession.caregiver?.name}
              doctorName={joinSession.doctor?.name}
              onClose={() => setJoinId('')}
            />
          </Suspense>
        )}
      </Modal>

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
