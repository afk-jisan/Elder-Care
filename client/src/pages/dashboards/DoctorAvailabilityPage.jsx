import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

const DEFAULT_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function DoctorAvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [form, setForm] = useState({
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '12:00',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setError('');
    setLoading(true);
    try {
      const data = await apiRequest('/doctor/availability');
      setSlots(data.availability || []);
      if (data.days?.length) setDays(data.days);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await apiRequest('/doctor/availability', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('Availability added');
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    setMessage('');
    try {
      await apiRequest(`/doctor/availability/${id}`, { method: 'DELETE' });
      setMessage('Availability removed');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <DashboardLayout title="Availability">
      <div className="toolbar">
        <p className="muted" style={{ margin: 0 }}>
          Set weekly windows when caregivers can request consultations.
        </p>
        <button type="button" onClick={() => setModalOpen(true)}>
          Add window
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {loading ? (
        <p className="muted">Loading...</p>
      ) : slots.length === 0 ? (
        <p className="muted">No availability set yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td>{slot.dayOfWeek}</td>
                  <td>{slot.startTime}</td>
                  <td>{slot.endTime}</td>
                  <td>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(slot.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title="Add availability"
        onClose={() => {
          setModalOpen(false);
          setFormError('');
        }}
      >
        <form className="form" onSubmit={handleCreate}>
          <label>
            Day
            <select
              value={form.dayOfWeek}
              onChange={(e) =>
                setForm((p) => ({ ...p, dayOfWeek: e.target.value }))
              }
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <div className="form-row two">
            <label>
              Start time
              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startTime: e.target.value }))
                }
                required
              />
            </label>
            <label>
              End time
              <input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endTime: e.target.value }))
                }
                required
              />
            </label>
          </div>
          {formError && <p className="error">{formError}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
