import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';

export default function FamilyWalletPage() {
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loadAmount, setLoadAmount] = useState('5000');
  const [releaseAmount, setReleaseAmount] = useState('2000');
  const [caregiverId, setCaregiverId] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingId, setPendingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [w, c] = await Promise.all([
        apiRequest('/family/wallet'),
        apiRequest('/family/caregivers'),
      ]);
      setWallet(w.wallet);
      setPayments(w.payments || []);
      setCaregivers(c.caregivers || []);
      if (!caregiverId && c.caregivers?.[0]) {
        setCaregiverId(c.caregivers[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleLoad(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiRequest('/family/wallet/load', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(loadAmount) }),
      });
      setMessage('Funds loaded');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRelease(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await apiRequest('/family/wallet/release', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(releaseAmount),
          caregiverId,
          otp: otp || undefined,
        }),
      });
      if (data.payment?.status === 'pending') {
        setPendingId(data.payment.id);
        setMessage(data.message);
      } else {
        setPendingId('');
        setMessage('Payment released');
      }
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmOtp(e) {
    e.preventDefault();
    if (!pendingId) return;
    setError('');
    try {
      await apiRequest(`/family/wallet/payments/${pendingId}/confirm-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp }),
      });
      setMessage('OTP confirmed and payment released');
      setPendingId('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <DashboardLayout title="Escrow wallet">
      <div className="panel-section">
        <p className="muted">
          Load monthly escrow and release payments to caregivers (FR-07). Mock
          gateway; releases above 10,000 BDT need OTP 123456.
        </p>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <>
            <p>
              Remaining: <strong>{wallet?.remainingBudget ?? 0}</strong> BDT /
              budget {wallet?.monthlyBudget ?? 0}
            </p>
            <form className="form" onSubmit={handleLoad}>
              <label>
                Load amount
                <input
                  type="number"
                  value={loadAmount}
                  onChange={(e) => setLoadAmount(e.target.value)}
                />
              </label>
              <button type="submit">Load funds</button>
            </form>
            <form className="form" onSubmit={handleRelease}>
              <label>
                Caregiver
                <select
                  value={caregiverId}
                  onChange={(e) => setCaregiverId(e.target.value)}
                >
                  {caregivers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Release amount
                <input
                  type="number"
                  value={releaseAmount}
                  onChange={(e) => setReleaseAmount(e.target.value)}
                />
              </label>
              <label>
                OTP (if required)
                <input value={otp} onChange={(e) => setOtp(e.target.value)} />
              </label>
              <button type="submit">Release</button>
            </form>
            {pendingId && (
              <form className="form" onSubmit={confirmOtp}>
                <button type="submit">Confirm pending OTP</button>
              </form>
            )}
            <h2>Ledger</h2>
            {payments.length === 0 ? (
              <p className="muted">No payments yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>{p.type}</td>
                        <td>{p.amount}</td>
                        <td>{p.status}</td>
                        <td>{new Date(p.createdAt).toLocaleString()}</td>
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
