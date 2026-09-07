import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiRequest } from '../../api/client';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read photo'));
    reader.readAsDataURL(file);
  });
}

export default function CaregiverCheckInPage() {
  const [assignments, setAssignments] = useState([]);
  const [activeVisit, setActiveVisit] = useState(null);
  const [visits, setVisits] = useState([]);
  const [selectedElderId, setSelectedElderId] = useState('');
  const [coords, setCoords] = useState({ latitude: '', longitude: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);

  async function load() {
    setError('');
    setLoading(true);
    try {
      const [assignData, activeData, visitData] = await Promise.all([
        apiRequest('/caregiver/assignments/active'),
        apiRequest('/caregiver/visits/active'),
        apiRequest('/caregiver/visits'),
      ]);
      setAssignments(assignData.assignments || []);
      setActiveVisit(activeData.visit || null);
      setVisits(visitData.visits || []);
      if (!selectedElderId && assignData.assignments?.[0]) {
        setSelectedElderId(assignData.assignments[0].elder.id);
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

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        });
        setLocating(false);
      },
      () => {
        setError('Could not read device location');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleCheckIn(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiRequest('/caregiver/check-in', {
        method: 'POST',
        body: JSON.stringify({
          elderId: selectedElderId,
          latitude: Number(coords.latitude),
          longitude: Number(coords.longitude),
        }),
      });
      setMessage('Checked in successfully');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (!photoFile) {
        setError('Checkout photo is required');
        setBusy(false);
        return;
      }
      const photoUrl = await readFileAsDataUrl(photoFile);
      await apiRequest('/caregiver/check-out', {
        method: 'POST',
        body: JSON.stringify({
          latitude: Number(coords.latitude),
          longitude: Number(coords.longitude),
          photoUrl,
        }),
      });
      setMessage('Checked out successfully');
      setPhotoFile(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout title="Check-in">
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <>
          <div className="panel-section">
            <h2>Location</h2>
            <div className="form-row two">
              <label>
                Latitude
                <input
                  value={coords.latitude}
                  onChange={(e) =>
                    setCoords((p) => ({ ...p, latitude: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Longitude
                <input
                  value={coords.longitude}
                  onChange={(e) =>
                    setCoords((p) => ({ ...p, longitude: e.target.value }))
                  }
                  required
                />
              </label>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="secondary"
                onClick={useDeviceLocation}
                disabled={locating}
              >
                {locating ? 'Locating...' : 'Use device GPS'}
              </button>
            </div>
          </div>

          {activeVisit ? (
            <div className="panel-section">
              <h2>Active visit</h2>
              <p>
                Checked in with{' '}
                <strong>{activeVisit.elder?.name || 'elder'}</strong> at{' '}
                {new Date(activeVisit.checkInAt).toLocaleString()} (
                {activeVisit.checkInDistanceMeters} m from address).
              </p>
              <form className="form" onSubmit={handleCheckOut}>
                <label>
                  Checkout photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    required
                  />
                </label>
                <button type="submit" disabled={busy}>
                  {busy ? 'Checking out...' : 'Check out'}
                </button>
              </form>
            </div>
          ) : (
            <div className="panel-section">
              <h2>Check in</h2>
              {assignments.length === 0 ? (
                <p className="muted">
                  No active elder assignments. Accept a care plan first.
                </p>
              ) : (
                <form className="form" onSubmit={handleCheckIn}>
                  <label>
                    Elder
                    <select
                      value={selectedElderId}
                      onChange={(e) => setSelectedElderId(e.target.value)}
                      required
                    >
                      {assignments.map((a) => (
                        <option key={a.elder.id} value={a.elder.id}>
                          {a.elder.name} ({a.elder.address})
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" disabled={busy}>
                    {busy ? 'Checking in...' : 'Check in'}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="panel-section">
            <h2>Recent visits</h2>
            {visits.length === 0 ? (
              <p className="muted">No visits yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Elder</th>
                      <th>Status</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((v) => (
                      <tr key={v.id}>
                        <td>{v.elder?.name || v.elderId}</td>
                        <td>
                          <span className="badge">{v.status}</span>
                        </td>
                        <td>{new Date(v.checkInAt).toLocaleString()}</td>
                        <td>
                          {v.checkOutAt
                            ? new Date(v.checkOutAt).toLocaleString()
                            : '-'}
                        </td>
                        <td>{v.checkInDistanceMeters} m</td>
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
