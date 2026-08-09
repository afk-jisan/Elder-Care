import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [ruling, setRuling] = useState('release_caregiver');
  const [reason, setReason] = useState('');
  const [activeId, setActiveId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/admin/disputes');
      setDisputes(data.disputes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(id) {
    setError('');
    setMessage('');
    try {
      const data = await apiRequest(`/admin/disputes/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ ruling, reason }),
      });
      setMessage(data.message);
      setActiveId('');
      setReason('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <DashboardLayout title="Disputes">
      <div className="panel-section">
        <p className="muted">
          Resolve escrow disputes with a ruling and reason (FR-18). Both parties
          receive a mock notification.
        </p>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : disputes.length === 0 ? (
          <p className="muted">No disputes.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Family</th>
                  <th>Caregiver</th>
                  <th>Status</th>
                  <th>Evidence</th>
                  <th>Ruling</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id}>
                    <td>{d.family}</td>
                    <td>{d.caregiver}</td>
                    <td>{d.status}</td>
                    <td>{d.evidence || '—'}</td>
                    <td>{d.ruling || '—'}</td>
                    <td>
                      {d.status === 'open' && (
                        <div className="form">
                          {activeId === d.id ? (
                            <>
                              <select
                                value={ruling}
                                onChange={(e) => setRuling(e.target.value)}
                              >
                                <option value="release_caregiver">
                                  Release to caregiver
                                </option>
                                <option value="refund_family">
                                  Refund family
                                </option>
                                <option value="split">Split</option>
                              </select>
                              <input
                                placeholder="Reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                              />
                              <button type="button" onClick={() => resolve(d.id)}>
                                Confirm
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveId(d.id);
                                setReason('');
                              }}
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      )}
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
