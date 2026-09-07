import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';

export default function DoctorRatingsPage() {
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [s, r] = await Promise.all([
        apiRequest('/doctor/sessions'),
        apiRequest('/doctor/rating'),
      ]);
      setSessions((s.sessions || []).filter((sess) => sess.rating));
      setSummary(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout title="Ratings">
      <div className="panel-section">
        <p className="muted">
          Family-submitted ratings and reviews after consultations (FR-15).
        </p>
        {error && <p className="error">{error}</p>}
        <div className="summary-row">
          <p>
            <strong>Average score:</strong> {summary.average || '—'}
          </p>
          <p>
            <strong>Total ratings:</strong> {summary.count}
          </p>
        </div>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="muted">No ratings received yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Elder</th>
                  <th>Caregiver</th>
                  <th>Rating</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.elder?.name || s.elderId}</td>
                    <td>{s.caregiver?.name || s.caregiverId}</td>
                    <td>
                      <span className="rating-stars">
                        {'★'.repeat(s.rating.score)}
                        {'☆'.repeat(5 - s.rating.score)}
                        <span className="rating-score">{s.rating.score}/5</span>
                      </span>
                    </td>
                    <td className="review-cell">
                      {s.rating.review || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
