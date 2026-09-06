import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

function RatingCell({ rating, rated, onRate, canRate }) {
  if (rating) {
    return (
      <span className="rating-stars" title={rating.review || 'No written review'}>
        {'★'.repeat(rating.score)}
        {'☆'.repeat(5 - rating.score)}
        <span className="rating-score">{rating.score}/5</span>
      </span>
    );
  }
  if (canRate) {
    return (
      <button type="button" onClick={onRate}>
        Rate doctor
      </button>
    );
  }
  if (rated) {
    return <span className="muted">Rated</span>;
  }
  return <span className="muted">—</span>;
}

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

  function openRate(id) {
    setSessionId(id);
    setFormError('');
    setScore('5');
    setReview('');
    setRateOpen(true);
  }

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
          Ended video sessions appear here so you can rate the doctor.
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
                  <th>Caregiver</th>
                  <th>Doctor</th>
                  <th className="col-status">Status</th>
                  <th>Minutes</th>
                  <th>Rating</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.elder?.name || s.elderId}</td>
                    <td>{s.caregiver?.name || '—'}</td>
                    <td>{s.doctor?.name || s.doctorId}</td>
                    <td>{s.status}</td>
                    <td>{s.durationMinutes || '—'}</td>
                    <td>
                      <RatingCell
                        rating={s.rating}
                        rated={s.rated}
                        canRate={s.status === 'ended' && !s.rated}
                        onRate={() => openRate(s.id)}
                      />
                    </td>
                    <td className="review-cell">
                      {s.rating?.review ? s.rating.review : '—'}
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
