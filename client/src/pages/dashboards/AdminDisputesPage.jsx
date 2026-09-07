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
          If a family reports a payment problem, review their note and decide
          who should get the money.
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
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Family note</th>
                  <th>Decision</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id}>
                    <td>{d.family}</td>
                    <td>{d.caregiver}</td>
                    <td>{d.amount != null ? `${d.amount} BDT` : '-'}</td>
                    <td>{d.status === 'open' ? 'Needs a decision' : 'Decided'}</td>
                    <td>{d.evidence || '-'}</td>
                    <td>
                      {d.ruling === 'release_caregiver'
                        ? 'Caregiver keeps it'
                        : d.ruling === 'refund_family'
                          ? 'Returned to family'
                          : d.ruling === 'split'
                            ? 'Split'
                            : '-'}
                    </td>
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
                                  Caregiver keeps the money
                                </option>
                                <option value="refund_family">
                                  Return money to family
                                </option>
                                <option value="split">
                                  Split 50 / 50
                                </option>
                              </select>
                              <input
                                placeholder="Why did you decide this?"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                              />
                              <button type="button" onClick={() => resolve(d.id)}>
                                Save decision
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
                              Decide
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
