import { lazy, Suspense, useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';
import { isLiveVideoRoom, videoRoomLabel } from '../../lib/videoSession';

const HmsVideoPanel = lazy(() => import('../../components/HmsVideoPanel'));

function VideoBadge({ roomId }) {
  const live = isLiveVideoRoom(roomId);
  return (
    <span className={`video-badge ${live ? 'live' : 'unavailable'}`}>
      {videoRoomLabel(roomId)}
    </span>
  );
}

export default function CaregiverVideoPage() {
  const [assignments, setAssignments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [elderId, setElderId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sosBusy, setSosBusy] = useState(false);
  const [joinId, setJoinId] = useState('');

  async function load({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      const [a, d, s] = await Promise.all([
        apiRequest('/caregiver/assignments/active'),
        apiRequest('/caregiver/doctors/available'),
        apiRequest('/caregiver/sessions'),
      ]);
      setAssignments(a.assignments || []);
      setDoctors(d.doctors || []);
      setSessions(s.sessions || []);
      if (!silent) {
        setElderId((current) => current || a.assignments?.[0]?.elder?.id || '');
        setDoctorId((current) => current || d.doctors?.[0]?.id || '');
      }
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(() => load({ silent: true }), 8000);
    return () => clearInterval(t);
  }, []);

  async function initiate(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await apiRequest('/caregiver/sessions', {
        method: 'POST',
        body: JSON.stringify({ elderId, doctorId }),
      });
      setMessage(data.message || 'Session requested');
      await load({ silent: true });
    } catch (err) {
      setError(err.message);
    }
  }

  async function endSession(id) {
    setError('');
    try {
      await apiRequest(`/caregiver/sessions/${id}/end`, { method: 'POST' });
      setMessage('Session ended');
      setJoinId('');
      await load({ silent: true });
    } catch (err) {
      setError(err.message);
    }
  }

  async function triggerSos() {
    if (!elderId) return;
    setSosBusy(true);
    setError('');
    try {
      const data = await apiRequest('/caregiver/sos', {
        method: 'POST',
        body: JSON.stringify({
          elderId,
          latitude: 23.8103,
          longitude: 90.4125,
        }),
      });
      setMessage(data.message || 'SOS sent to the family');
    } catch (err) {
      setError(err.message);
    } finally {
      setSosBusy(false);
    }
  }

  const joinSession = joinId ? sessions.find((s) => s.id === joinId) : null;

  return (
    <DashboardLayout title="Video consult">
      <div className="panel-section">
        <p className="muted">
          Request a video consultation with an available doctor for your assigned elder.
          SOS alerts the family for the selected elder.
        </p>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <>
            <div className="consult-request-card">
              <h2>Request consult</h2>
              <form className="form consult-form" onSubmit={initiate}>
                <div className="form-row two">
                  <label>
                    Elder
                    <select
                      value={elderId}
                      onChange={(e) => setElderId(e.target.value)}
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
                  <label>
                    Available doctor
                    <select
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      required
                    >
                      <option value="">Select doctor</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {doctors.length === 0 && (
                  <p className="form-hint">
                    No doctor is available right now. Ask the doctor to add an
                    availability slot for the current time.
                  </p>
                )}
                <div className="form-actions">
                  <button type="submit" disabled={!elderId || !doctorId}>
                    Request session
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={triggerSos}
                    disabled={!elderId || sosBusy}
                  >
                    {sosBusy ? 'Sending SOS...' : 'Trigger SOS'}
                  </button>
                </div>
              </form>
            </div>

            <h2>Sessions</h2>
            {sessions.length === 0 ? (
              <p className="muted">No sessions yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Elder</th>
                      <th>Doctor</th>
                      <th className="col-status">Status</th>
                      <th className="col-video">Video</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.elder?.name || s.elderId}</td>
                        <td>{s.doctor?.name || s.doctorId}</td>
                        <td>{s.status}</td>
                        <td>
                          <VideoBadge roomId={s.roomId} />
                        </td>
                        <td>
                          <div className="table-actions">
                            {s.status === 'active' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setJoinId(s.id)}
                                  disabled={!isLiveVideoRoom(s.roomId)}
                                  title={
                                    isLiveVideoRoom(s.roomId)
                                      ? 'Join the live video call'
                                      : 'This session cannot join video. Request a new consult.'
                                  }
                                >
                                  Join
                                </button>
                                <button
                                  type="button"
                                  onClick={() => endSession(s.id)}
                                >
                                  End
                                </button>
                              </>
                            )}
                          </div>
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
          <Suspense fallback={<p className="muted hms-loading">Loading video...</p>}>
            <HmsVideoPanel
              sessionId={joinId}
              roomId={joinSession.roomId}
              rolePath="caregiver"
              elderName={joinSession.elder?.name}
              doctorName={joinSession.doctor?.name}
              caregiverName={joinSession.caregiver?.name}
              onClose={() => setJoinId('')}
            />
          </Suspense>
        )}
      </Modal>
    </DashboardLayout>
  );
}
