import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';

function statusBadge(status) {
  const map = {
    resolved: { label: 'Resolved', cls: 'badge active' },
    escalated: { label: 'Escalated', cls: 'badge inactive' },
    family_notified: { label: 'Family Notified', cls: 'badge' },
    triggered: { label: 'Triggered', cls: 'badge' },
  };
  const s = map[status] || { label: status, cls: 'badge' };
  return <span className={s.cls}>{s.label}</span>;
}

export default function AdminSosPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/admin/sos');
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  async function escalate(id) {
    setError('');
    try {
      const data = await apiRequest(`/admin/sos/${id}/escalate`, { method: 'POST' });
      setMessage(data.message);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function resolve(id) {
    setError('');
    try {
      const data = await apiRequest(`/admin/sos/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolutionNote: notes[id] || 'Resolved by admin' }),
      });
      setMessage(data.message);
      setNotes((prev) => ({ ...prev, [id]: '' }));
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <DashboardLayout title="SOS alerts">
      <div className="panel-section">
        <p className="muted">
          Monitor caregiver SOS events. Family is notified first; escalate if unresolved, then resolve.
        </p>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        {loading ? (
          <p className="muted">Loading...</p>
        ) : events.length === 0 ? (
          <p className="muted">No SOS events.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Elder</th>
                  <th>Caregiver</th>
                  <th>Status</th>
                  <th>GPS</th>
                  <th>When</th>
                  <th>Resolution Note</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>{e.elder}</td>
                    <td>{e.caregiver}</td>
                    <td>{statusBadge(e.status)}</td>
                    <td>
                      {e.latitude != null ? `${e.latitude}, ${e.longitude}` : '—'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {e.createdAt ? new Date(e.createdAt).toLocaleString() : '—'}
                    </td>
                    <td>
                      {e.status !== 'resolved' && (
                        <input
                          value={notes[e.id] || ''}
                          onChange={(ev) =>
                            setNotes((prev) => ({ ...prev, [e.id]: ev.target.value }))
                          }
                          placeholder="Add note…"
                          style={{ minWidth: 160 }}
                        />
                      )}
                    </td>
                    <td className="toolbar">
                      {e.status !== 'resolved' && e.status !== 'escalated' && (
                        <button type="button" onClick={() => escalate(e.id)}>
                          Escalate
                        </button>
                      )}
                      {e.status !== 'resolved' && (
                        <button type="button" onClick={() => resolve(e.id)}>
                          Resolve
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
    </DashboardLayout>
  );
}
