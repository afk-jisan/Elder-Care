import { lazy, Suspense, useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';
import { VideoBadge } from '../../lib/doctorSessionUi';
import { isLiveVideoRoom } from '../../lib/videoSession';

const HmsVideoPanel = lazy(() => import('../../components/HmsVideoPanel'));

export default function DoctorSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [joinId, setJoinId] = useState('');

  async function load({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      const data = await apiRequest('/doctor/sessions');
      setSessions(data.sessions || []);
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

  const joinSession = joinId ? sessions.find((s) => s.id === joinId) : null;

  return (
    <DashboardLayout title="Video consult">
      <div className="panel-section">
        <p className="muted">
          Accept, join, and end live video consultations (FR-11 / D-01).
        </p>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : sessions.length === 0 ? (
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
    </DashboardLayout>
  );
}
