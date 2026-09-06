import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';
import { getToken } from '../../lib/authStorage';

export default function AdminAnalyticsPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/admin/analytics');
      setReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function downloadCsv() {
    setError('');
    try {
      const token = getToken();
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${base}/admin/analytics?format=csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('CSV download failed');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'eldercare-analytics.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <DashboardLayout title="Analytics">
      <div className="panel-section">
        <p className="muted">
          Platform metrics for elders, tasks, escrow, and video sessions.
          Export CSV for reporting.
        </p>
        {error && <p className="error">{error}</p>}
        <div className="toolbar">
          <button type="button" onClick={load}>
            Refresh
          </button>
          <button type="button" onClick={downloadCsv}>
            Download CSV
          </button>
        </div>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : !report ? (
          <p className="muted">No report.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <tbody>
                {Object.entries(report).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>
                      {value instanceof Date ||
                      (typeof value === 'string' &&
                        /^\d{4}-\d{2}-\d{2}/.test(value))
                        ? new Date(value).toLocaleString()
                        : String(value)}
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
