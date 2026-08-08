import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

const PACKAGES = ['Companion', 'Medical', 'Errand'];

const emptyElder = {
  name: '',
  address: '',
  dateOfBirth: '',
  latitude: '',
  longitude: '',
};

const emptyPlan = {
  elderId: '',
  package: 'Companion',
  caregiverId: '',
};

export default function FamilyCarePlanPage() {
  const [elders, setElders] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [elderForm, setElderForm] = useState(emptyElder);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [elderModalOpen, setElderModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState('');

  async function loadAll() {
    setError('');
    setLoading(true);
    try {
      const [elderData, caregiverData, planData] = await Promise.all([
        apiRequest('/family/elders'),
        apiRequest('/family/caregivers'),
        apiRequest('/family/care-plans'),
      ]);
      setElders(elderData.elders || []);
      setCaregivers(caregiverData.caregivers || []);
      setPlans(planData.carePlans || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function lookupAddress() {
    setFormError('');
    setLookingUp(true);
    try {
      const data = await apiRequest('/geo/lookup', {
        method: 'POST',
        body: JSON.stringify({ address: elderForm.address }),
      });
      setElderForm((prev) => ({
        ...prev,
        latitude: String(data.latitude),
        longitude: String(data.longitude),
      }));
      setResolvedLocation(data.displayName || elderForm.address);
    } catch (err) {
      setFormError(err.message);
      setResolvedLocation('');
      setElderForm((prev) => ({ ...prev, latitude: '', longitude: '' }));
    } finally {
      setLookingUp(false);
    }
  }

  async function submitElder(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      let latitude = elderForm.latitude;
      let longitude = elderForm.longitude;

      if (!latitude || !longitude) {
        const data = await apiRequest('/geo/lookup', {
          method: 'POST',
          body: JSON.stringify({ address: elderForm.address }),
        });
        latitude = data.latitude;
        longitude = data.longitude;
        setResolvedLocation(data.displayName || elderForm.address);
      }

      await apiRequest('/family/elders', {
        method: 'POST',
        body: JSON.stringify({
          name: elderForm.name,
          address: elderForm.address,
          dateOfBirth: elderForm.dateOfBirth || undefined,
          latitude: Number(latitude),
          longitude: Number(longitude),
        }),
      });
      setMessage('Elder registered');
      setElderModalOpen(false);
      setElderForm(emptyElder);
      setResolvedLocation('');
      await loadAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function submitPlan(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await apiRequest('/family/care-plans', {
        method: 'POST',
        body: JSON.stringify({
          elderId: planForm.elderId,
          package: planForm.package,
          caregiverId: planForm.caregiverId || undefined,
        }),
      });
      setMessage('Care plan created');
      setPlanModalOpen(false);
      setPlanForm(emptyPlan);
      await loadAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Care plan">
      <div className="toolbar">
        <p className="muted" style={{ margin: 0 }}>
          Register an elder with GPS, choose a package, and assign a caregiver.
        </p>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={() => setElderModalOpen(true)}>
            Add elder
          </button>
          <button type="button" onClick={() => setPlanModalOpen(true)}>
            Create care plan
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <>
          <div className="panel-section">
            <h2>Elders</h2>
            {elders.length === 0 ? (
              <p className="muted">No elders yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elders.map((elder) => (
                      <tr key={elder.id}>
                        <td>{elder.name}</td>
                        <td>{elder.address}</td>
                        <td>{elder.latitude}</td>
                        <td>{elder.longitude}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="panel-section">
            <h2>Care plans</h2>
            {plans.length === 0 ? (
              <p className="muted">No care plans yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Elder</th>
                      <th>Package</th>
                      <th>Caregiver</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id}>
                        <td>{plan.elder?.name || plan.elderId}</td>
                        <td>{plan.package}</td>
                        <td>{plan.caregiver?.name || 'Unassigned'}</td>
                        <td>
                          <span className="badge">{plan.status}</span>
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
        open={elderModalOpen}
        title="Add elder"
        onClose={() => {
          setElderModalOpen(false);
          setFormError('');
          setResolvedLocation('');
          setElderForm(emptyElder);
        }}
      >
        <form className="form" onSubmit={submitElder}>
          <label>
            Full name
            <input
              value={elderForm.name}
              onChange={(e) =>
                setElderForm((p) => ({ ...p, name: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Address / location
            <input
              value={elderForm.address}
              onChange={(e) => {
                setElderForm((p) => ({
                  ...p,
                  address: e.target.value,
                  latitude: '',
                  longitude: '',
                }));
                setResolvedLocation('');
              }}
              required
              placeholder="House, road, area, city"
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="secondary"
              onClick={lookupAddress}
              disabled={lookingUp || !elderForm.address.trim()}
            >
              {lookingUp ? 'Looking up...' : 'Find coordinates'}
            </button>
          </div>
          {resolvedLocation && (
            <p className="muted">
              Matched: {resolvedLocation}
              <br />
              Lat {elderForm.latitude}, Lng {elderForm.longitude}
            </p>
          )}
          <label>
            Date of birth
            <input
              type="date"
              value={elderForm.dateOfBirth}
              onChange={(e) =>
                setElderForm((p) => ({ ...p, dateOfBirth: e.target.value }))
              }
            />
          </label>
          {formError && <p className="error">{formError}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save elder'}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setElderModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={planModalOpen}
        title="Create care plan"
        onClose={() => {
          setPlanModalOpen(false);
          setFormError('');
        }}
      >
        <form className="form" onSubmit={submitPlan}>
          <label>
            Elder
            <select
              value={planForm.elderId}
              onChange={(e) =>
                setPlanForm((p) => ({ ...p, elderId: e.target.value }))
              }
              required
            >
              <option value="">Select elder</option>
              {elders.map((elder) => (
                <option key={elder.id} value={elder.id}>
                  {elder.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Service package
            <select
              value={planForm.package}
              onChange={(e) =>
                setPlanForm((p) => ({ ...p, package: e.target.value }))
              }
            >
              {PACKAGES.map((pkg) => (
                <option key={pkg} value={pkg}>
                  {pkg}
                </option>
              ))}
            </select>
          </label>
          <label>
            Caregiver
            <select
              value={planForm.caregiverId}
              onChange={(e) =>
                setPlanForm((p) => ({ ...p, caregiverId: e.target.value }))
              }
            >
              <option value="">Assign later</option>
              {caregivers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {formError && <p className="error">{formError}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving || elders.length === 0}>
              {saving ? 'Saving...' : 'Create plan'}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setPlanModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
