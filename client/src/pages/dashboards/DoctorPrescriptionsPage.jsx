import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/doctor/prescriptions');
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout title="Prescriptions">
      <div className="panel-section">
        <p className="muted">
          Caregiver-uploaded prescription images for your elders. Review before
          and during consultations (FR-12).
        </p>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : prescriptions.length === 0 ? (
          <p className="muted">No prescriptions uploaded yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Elder</th>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Caption</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p.id}>
                    <td>{p.elder?.name || p.elderName || '—'}</td>
                    <td>{p.medicineName || '—'}</td>
                    <td>{p.dosage || '—'}</td>
                    <td>{p.caption || '—'}</td>
                    <td>
                      <a href={p.imageUrl} target="_blank" rel="noreferrer">
                        View
                      </a>
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
