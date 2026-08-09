import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

export default function FamilySessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [rateOpen, setRateOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [score, setScore] = useState('5');
  const [review, setReview] = useState('');
  const [formError, setFormError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/family/sessions');
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submitRate(e) {
    e.preventDefault();
    setFormError('');
    try {
      const data = await apiRequest(`/family/sessions/${sessionId}/rate`, {
        method: 'POST',
        body: JSON.stringify({
          score: Number(score),
          review,
        }),
      });
      setMessage(data.message || 'Rating saved');
      setRateOpen(false);
      setReview('');
      await load();
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <DashboardLayout title="Consultations">
      <div className="panel-section">
        <p className="muted">
          Ended video sessions appear here so you can rate the doctor (FR-15).
        </p>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="muted">No consultations yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Elder</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Minutes</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.elder?.name || s.elderId}</td>
                    <td>{s.doctor?.name || s.doctorId}</td>
                    <td>{s.status}</td>
                    <td>{s.durationMinutes || '—'}</td>
                    <td>
                      {s.status === 'ended' && !s.rated && (
                        <button
                          type="button"
                          onClick={() => {
                            setSessionId(s.id);
                            setFormError('');
                            setRateOpen(true);
                          }}
                        >
                          Rate doctor
                        </button>
                      )}
                      {s.rated && <span className="muted">Rated</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={rateOpen}
        onClose={() => setRateOpen(false)}
        title="Rate doctor"
      >
        <form className="form" onSubmit={submitRate}>
          {formError && <p className="error">{formError}</p>}
          <label>
            Score (1-5)
            <select value={score} onChange={(e) => setScore(e.target.value)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            Review (optional, max 300)
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              maxLength={300}
              rows={3}
            />
          </label>
          <button type="submit">Submit rating</button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
