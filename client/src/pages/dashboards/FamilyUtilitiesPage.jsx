import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

export default function FamilyUtilitiesPage() {
  const [elders, setElders] = useState([]);
  const [bills, setBills] = useState([]);
  const [providers, setProviders] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    elderId: '',
    provider: 'DESCO',
    accountNumber: '',
    amount: '',
    dueDate: '',
    billPhotoUrl: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [e, u] = await Promise.all([
        apiRequest('/family/elders'),
        apiRequest('/family/utilities'),
      ]);
      setElders(e.elders || []);
      setBills(u.bills || []);
      setProviders(u.providers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    try {
      await apiRequest('/family/utilities', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });
      setMessage('Bill saved');
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function pay(id) {
    setError('');
    setMessage('');
    try {
      await apiRequest(`/family/utilities/${id}/pay`, { method: 'POST' });
      setMessage('Bill paid');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <DashboardLayout title="Utility bills">
      <div className="panel-section">
        <div className="toolbar">
          <p className="muted" style={{ margin: 0 }}>
            Pay elder utility bills from the escrow wallet.
          </p>
          <button
            type="button"
            onClick={() => {
              setForm({
                elderId: elders[0]?.id || '',
                provider: providers[0] || 'DESCO',
                accountNumber: '',
                amount: '',
                dueDate: '',
                billPhotoUrl: '',
              });
              setOpen(true);
            }}
            disabled={elders.length === 0}
          >
            Add bill
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : bills.length === 0 ? (
          <p className="muted">No bills yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Elder</th>
                  <th>Provider</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id}>
                    <td>{b.elder?.name}</td>
                    <td>{b.provider}</td>
                    <td>{b.accountNumber}</td>
                    <td>{b.amount}</td>
                    <td>{b.paid ? 'Yes' : 'No'}</td>
                    <td>
                      {!b.paid && (
                        <button type="button" onClick={() => pay(b.id)}>
                          Pay
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

      <Modal open={open} title="Add utility bill" onClose={() => setOpen(false)}>
        <form className="form" onSubmit={submit}>
          <label>
            Elder
            <select
              value={form.elderId}
              onChange={(e) => setForm((p) => ({ ...p, elderId: e.target.value }))}
              required
            >
              {elders.map((elder) => (
                <option key={elder.id} value={elder.id}>
                  {elder.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Provider
            <select
              value={form.provider}
              onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}
            >
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            Account number
            <input
              value={form.accountNumber}
              onChange={(e) =>
                setForm((p) => ({ ...p, accountNumber: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Amount
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              required
            />
          </label>
          <label>
            Bill photo URL (optional)
            <input
              value={form.billPhotoUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, billPhotoUrl: e.target.value }))
              }
            />
          </label>
          {formError && <p className="error">{formError}</p>}
          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" className="secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
