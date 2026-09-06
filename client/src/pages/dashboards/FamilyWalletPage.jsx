import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

const OTP_THRESHOLD = 10000;

const TYPE_LABELS = {
  escrow_load: 'Money added',
  manual_release: 'Paid caregiver',
  task_release: 'Task payment',
  refund: 'Returned to you',
};

const STATUS_LABELS = {
  completed: 'Completed',
  pending: 'Waiting for confirmation',
  held: 'Under review',
  refunded: 'Returned to you',
};

export default function FamilyWalletPage() {
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loadAmount, setLoadAmount] = useState('');
  const [releaseAmount, setReleaseAmount] = useState('');
  const [caregiverId, setCaregiverId] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingPayment, setPendingPayment] = useState(null);
  const [disputePayment, setDisputePayment] = useState(null);
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const releaseNeedsOtp = Number(releaseAmount) > OTP_THRESHOLD;

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
      const pending = (w.payments || []).find(
        (p) => p.status === 'pending' && p.otpRequired
      );
      setPendingPayment(pending || null);
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
      setMessage('Money added to escrow');
      setLoadAmount('');
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
          otp: releaseNeedsOtp ? otp || undefined : undefined,
        }),
      });
      if (data.payment?.status === 'pending') {
        setPendingPayment(data.payment);
        setOtp('');
        setMessage('This payment needs a confirmation code before it is sent.');
      } else {
        setPendingPayment(null);
        setMessage('Payment sent to caregiver');
        setReleaseAmount('');
        setOtp('');
      }
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmOtp(e) {
    e.preventDefault();
    if (!pendingPayment) return;
    setError('');
    setMessage('');
    try {
      await apiRequest(`/family/wallet/payments/${pendingPayment.id}/confirm-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp }),
      });
      setMessage('Payment confirmed and sent');
      setPendingPayment(null);
      setOtp('');
      setReleaseAmount('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitDispute(e) {
    e.preventDefault();
    if (!disputePayment) return;
    setError('');
    setMessage('');
    try {
      const data = await apiRequest('/family/disputes', {
        method: 'POST',
        body: JSON.stringify({
          paymentId: disputePayment.id,
          evidence: disputeEvidence.trim() || 'Service issue reported by family',
        }),
      });
      setMessage(data.message || 'Problem reported. An admin will review it.');
      setDisputePayment(null);
      setDisputeEvidence('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <DashboardLayout title="Escrow wallet">
      <p className="muted">
        Load a monthly budget, pay caregivers from escrow, and confirm amounts
        over 10,000 BDT with a one-time code.
      </p>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <>
          <div className="wallet-balance">
            <div className="wallet-stat-card">
              <p className="muted" style={{ margin: 0 }}>
                Available
              </p>
              <p className="wallet-amount">
                {wallet?.remainingBudget ?? 0} BDT
              </p>
            </div>
            <div className="wallet-stat-card">
              <p className="muted" style={{ margin: 0 }}>
                Monthly budget
              </p>
              <p className="wallet-amount">
                {wallet?.monthlyBudget ?? 0} BDT
              </p>
            </div>
          </div>

          {pendingPayment && (
            <div className="panel-section wallet-otp-card">
              <h2>Confirm large payment</h2>
              <p>
                {pendingPayment.amount} BDT is waiting. Enter the confirmation
                code to release it.
              </p>
              <p className="muted">Demo code: 123456</p>
              <form className="form" onSubmit={confirmOtp}>
                <label>
                  Confirmation code
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    inputMode="numeric"
                  />
                </label>
                <button type="submit">Confirm and send</button>
              </form>
            </div>
          )}

          <div className="wallet-grid">
            <div className="panel-section">
              <h2>1. Add money</h2>
              <form className="form" onSubmit={handleLoad}>
                <label>
                  Amount (BDT)
                  <input
                    type="number"
                    min="1"
                    value={loadAmount}
                    onChange={(e) => setLoadAmount(e.target.value)}
                    required
                    placeholder="5000"
                  />
                </label>
                <button type="submit">Add to wallet</button>
              </form>
            </div>

            <div className="panel-section">
              <h2>2. Pay a caregiver</h2>
              <form className="form" onSubmit={handleRelease}>
                <label>
                  Caregiver
                  <select
                    value={caregiverId}
                    onChange={(e) => setCaregiverId(e.target.value)}
                    required
                  >
                    <option value="">Select caregiver</option>
                    {caregivers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Amount (BDT)
                  <input
                    type="number"
                    min="1"
                    value={releaseAmount}
                    onChange={(e) => setReleaseAmount(e.target.value)}
                    required
                    placeholder="2000"
                  />
                </label>
                {releaseNeedsOtp && (
                  <label>
                    Confirmation code (required over 10,000 BDT)
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                    />
                  </label>
                )}
                <button type="submit" disabled={!caregiverId}>
                  Send payment
                </button>
              </form>
            </div>
          </div>

          <div className="panel-section">
            <h2>Ledger</h2>
            {payments.length === 0 ? (
              <p className="muted">No payments yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>What</th>
                      <th>To</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>When</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>{TYPE_LABELS[p.type] || p.type}</td>
                        <td>{p.caregiver?.name || (p.caregiverId ? 'Caregiver' : '-')}</td>
                        <td>{p.amount} BDT</td>
                        <td>{STATUS_LABELS[p.status] || p.status}</td>
                        <td>{new Date(p.createdAt).toLocaleString()}</td>
        <td>
                          {p.status === 'completed' &&
                            p.caregiverId &&
                            (p.type === 'task_release' ||
                              p.type === 'manual_release') && (
                              <button
                                type="button"
                                className="secondary"
                                onClick={() => {
                                  setDisputePayment(p);
                                  setDisputeEvidence('');
                                }}
                              >
                                Report a problem
                              </button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <Modal
        open={Boolean(disputePayment)}
        title="Report a payment problem"
        onClose={() => setDisputePayment(null)}
      >
        <form className="form" onSubmit={submitDispute}>
          <p>
            Something wrong with this {disputePayment?.amount} BDT payment?
            Tell us what happened. We will pause the payment while an admin
            checks, then decide if the caregiver keeps it or you get it back.
          </p>
          <label>
            What happened?
            <textarea
              value={disputeEvidence}
              onChange={(e) => setDisputeEvidence(e.target.value)}
              rows={3}
              required
              placeholder="Example: The caregiver did not show up for the visit."
            />
          </label>
          <div className="form-actions">
            <button type="submit">Send report</button>
            <button
              type="button"
              className="secondary"
              onClick={() => setDisputePayment(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
