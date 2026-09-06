import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

function formatWhen(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export default function CaregiverTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [completionNote, setCompletionNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  async function loadTasks() {
    setError('');
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const data = await apiRequest(`/caregiver/tasks${params}`);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [filterStatus]);

  function openComplete(task) {
    setSelected(task);
    setCompletionNote('');
    setPhotoUrl('');
    setFormError('');
    setMessage('');
    setError('');
  }

  function closeModal() {
    setSelected(null);
    setFormError('');
  }

  async function handleComplete(e) {
    e.preventDefault();
    if (!selected) return;
    setFormError('');
    setSaving(true);
    try {
      const body = {};
      if (selected.completionMethod === 'photo') {
        body.photoUrl = photoUrl;
      } else {
        body.completionNote = completionNote;
      }
      await apiRequest(`/caregiver/tasks/${selected.id}/complete`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setMessage('Task completed');
      closeModal();
      await loadTasks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Tasks">
      <div className="panel-section">
        <p className="muted">
          View scheduled tasks for your elders. Completing a task requires an
          active check-in at that elder.
        </p>

        <div className="toolbar">
          <div className="toolbar-filters">
            <label>
              Filter by status
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>
          <button type="button" className="secondary" onClick={loadTasks}>
            Refresh
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        {loading ? (
          <p className="muted">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="muted">No tasks found.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Elder</th>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Scheduled</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.elder?.name || task.elderId}</td>
                    <td>{task.elder?.address || '-'}</td>
                    <td>
                      <div>{task.title}</div>
                      <div className="muted">{task.type}</div>
                    </td>
                    <td>{formatWhen(task.scheduledTime)}</td>
                    <td>{task.completionMethod}</td>
                    <td>
                      <span
                        className={
                          task.status === 'completed'
                            ? 'badge active'
                            : 'badge'
                        }
                      >
                        {task.status}
                      </span>
                    </td>
                    <td>
                      {task.status === 'completed' ? (
                        <span className="muted">Locked</span>
                      ) : task.status === 'cancelled' ? (
                        <span className="muted">Cancelled</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openComplete(task)}
                        >
                          Complete
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

      <Modal
        open={selected !== null}
        title="Complete task"
        onClose={closeModal}
      >
        <form onSubmit={handleComplete} className="form">
          <p>
            {selected?.title} for {selected?.elder?.name}. You must be checked
            in at this elder.
          </p>
          {selected?.completionMethod === 'photo' ? (
            <label>
              Photo URL
              <input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                required
              />
            </label>
          ) : (
            <label>
              Completion note
              <textarea
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                rows={3}
                required
              />
            </label>
          )}
          {formError && <p className="error">{formError}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Mark complete'}
            </button>
            <button type="button" className="secondary" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
