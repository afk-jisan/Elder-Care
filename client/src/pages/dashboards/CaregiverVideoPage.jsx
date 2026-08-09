import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';

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

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [a, d, s] = await Promise.all([
        apiRequest('/caregiver/assignments/active'),
        apiRequest('/caregiver/doctors/available'),
        apiRequest('/caregiver/sessions'),
      ]);
      setAssignments(a.assignments || []);
      setDoctors(d.doctors || []);
      setSessions(s.sessions || []);
      if (!elderId && a.assignments?.[0]?.elder?.id) {
        setElderId(a.assignments[0].elder.id);
      }
      if (!doctorId && d.doctors?.[0]?.id) {
        setDoctorId(d.doctors[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
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
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function endSession(id) {
    setError('');
    try {
      await apiRequest(`/caregiver/sessions/${id}/end`, { method: 'POST' });
      setMessage('Session ended');
      await load();
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
      setMessage(data.message || 'SOS sent');
    } catch (err) {
      setError(err.message);
    } finally {
      setSosBusy(false);
    }
  }

  return (
    <DashboardLayout title="Video consult">
      <div className="panel-section">
        <p className="muted">
          Request a mock 100ms video session with an available doctor (FR-02).
          Doctor must accept within 60 seconds. SOS uses the same elder (FR-19).
        </p>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <>
            <form className="form" onSubmit={initiate}>
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
              {doctors.length === 0 && (
                <p className="muted">
                  No doctor is in an availability window right now. Ask the
                  doctor to add a slot covering the current time.
                </p>
              )}
              <div className="toolbar">
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
                      <th>Status</th>
                      <th>Room</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.elder?.name || s.elderId}</td>
                        <td>{s.doctor?.name || s.doctorId}</td>
                        <td>{s.status}</td>
                        <td>{s.roomId || '—'}</td>
                        <td>
                          {s.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => endSession(s.id)}
                            >
                              End
                            </button>
                          )}
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
    </DashboardLayout>
  );
}
