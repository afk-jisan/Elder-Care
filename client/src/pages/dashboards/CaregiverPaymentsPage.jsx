import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';

const TYPE_LABELS = {
  manual_release: 'Family payment',
  task_release: 'Task payment',
};

const STATUS_LABELS = {
  completed: 'Received',
  pending: 'Waiting',
  held: 'Under review',
  refunded: 'Returned to family',
};

export default function CaregiverPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await apiRequest('/caregiver/payments');
        setPayments(data.payments || []);
        setTotalReceived(data.totalReceived || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Payments">
      <p className="muted">
        Money families release to you from their escrow wallet.
      </p>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <>
          <div className="wallet-balance one">
            <div className="wallet-stat-card">
              <p className="muted" style={{ margin: 0 }}>
                Total received
              </p>
              <p className="wallet-amount">{totalReceived} BDT</p>
            </div>
          </div>

          <div className="panel-section">
            <h2>Payment history</h2>
            {payments.length === 0 ? (
              <p className="muted">No payments yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>What</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>{p.family?.name || 'Family'}</td>
                        <td>{TYPE_LABELS[p.type] || p.type}</td>
                        <td>{p.amount} BDT</td>
                        <td>{STATUS_LABELS[p.status] || p.status}</td>
                        <td>{new Date(p.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
