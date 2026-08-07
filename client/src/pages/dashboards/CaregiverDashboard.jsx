import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';

export default function CaregiverDashboard() {
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadPending() {
    setError('');
    setLoading(true);
    try {
      const data = await apiRequest('/caregiver/assignments/pending');
      setPending(data.carePlans || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function respond(id, decision) {
    setError('');
    setMessage('');
    try {
      await apiRequest(`/caregiver/assignments/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ decision }),
      });
      setMessage(
        decision === 'accept' ? 'Assignment accepted' : 'Assignment rejected'
      );
      await loadPending();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <DashboardLayout title="Caregiver overview">
      <p>
        On-ground visits for assigned elders. Use Check-in for GPS check-in and
        check-out with photo proof.
      </p>

      <div className="panel-section">
        <h2>Pending assignments</h2>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : pending.length === 0 ? (
          <p className="muted">No pending assignments.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Elder</th>
                  <th>Package</th>
                  <th>Family</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((plan) => (
                  <tr key={plan.id}>
                    <td>{plan.elder?.name || plan.elderId}</td>
                    <td>{plan.package}</td>
                    <td>{plan.family?.name || 'Family'}</td>
                    <td>
                      <div className="form-actions">
                        <button
                          type="button"
                          onClick={() => respond(plan.id, 'accept')}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => respond(plan.id, 'reject')}
                        >
                          Reject
                        </button>
                      </div>
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
