import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';

function when(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export default function FamilyCareFeedPage() {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setError('');
    setLoading(true);
    try {
      const data = await apiRequest('/family/feed');
      setFeed(data.feed);
    } catch (err) {
      setError(err.message);
      setFeed(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout title="Care status feed">
      <div className="panel-section">
        <div className="toolbar">
          <p className="muted" style={{ margin: 0 }}>
            Live summary of check-ins, vitals, and tasks for your elders today
            (FR-10).
          </p>
          <button type="button" className="secondary" onClick={load}>
            Refresh
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading feed...</p>
        ) : !feed ? (
          <p className="muted">No feed data.</p>
        ) : (
          <>
            {feed.alerts?.length > 0 && (
              <div className="panel-section">
                <h2>Alerts</h2>
                <ul>
                  {feed.alerts.map((a, i) => (
                    <li key={`${a.type}-${i}`}>
                      <strong>{a.elderName}</strong>: {a.message}{' '}
                      <span className="muted">({when(a.at)})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="panel-section">
              <h2>Check-in / check-out</h2>
              {feed.checkIns.length === 0 ? (
                <p className="muted">No visits recorded for today yet.</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Elder</th>
                        <th>Caregiver</th>
                        <th>Status</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feed.checkIns.map((v) => (
                        <tr key={v.id}>
                          <td>{v.elderName}</td>
                          <td>{v.caregiverName}</td>
                          <td>{v.status}</td>
                          <td>{when(v.checkInAt)}</td>
                          <td>{when(v.checkOutAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="panel-section">
              <h2>Today&apos;s vitals</h2>
              {feed.vitals.length === 0 ? (
                <p className="muted">No vitals submitted today.</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Elder</th>
                        <th>BP</th>
                        <th>Sugar</th>
                        <th>Weight</th>
                        <th>Flag</th>
                        <th>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feed.vitals.map((v) => (
                        <tr key={v.id}>
                          <td>{v.elderName}</td>
                          <td>{v.bloodPressure}</td>
                          <td>{v.bloodSugar}</td>
                          <td>{v.weight}</td>
                          <td>{v.flagged ? 'Yes' : 'No'}</td>
                          <td>{when(v.recordedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="panel-section">
              <h2>Tasks</h2>
              {feed.tasks.length === 0 ? (
                <p className="muted">No tasks scheduled from today onward.</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Elder</th>
                        <th>Status</th>
                        <th>Scheduled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feed.tasks.map((t) => (
                        <tr key={t.id}>
                          <td>{t.title}</td>
                          <td>{t.elderName}</td>
                          <td>{t.status}</td>
                          <td>{when(t.scheduledTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="panel-section">
              <h2>Medical activity</h2>
              {feed.medicalSessions.length === 0 ? (
                <p className="muted">
                  No video sessions yet. This section fills in after FR-02 /
                  FR-11.
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
