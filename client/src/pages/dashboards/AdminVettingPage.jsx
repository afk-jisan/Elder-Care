import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/client';

const emptyRefs = [
  { name: '', relation: 'Ward councilor', note: '', verified: true },
  { name: '', relation: 'Institution', note: '', verified: true },
];

export default function AdminVettingPage() {
  const [records, setRecords] = useState([]);
  const [unvetted, setUnvetted] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [nidNumber, setNidNumber] = useState('');
  const [policeUrl, setPoliceUrl] = useState('');
  const [references, setReferences] = useState(emptyRefs);
  const [probationStatus, setProbationStatus] = useState('passed');
  const [probationNote, setProbationNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [startCaregiverId, setStartCaregiverId] = useState('');

  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const [listData, unvettedData] = await Promise.all([
        apiRequest(`/admin/vetting${params}`),
        apiRequest('/admin/vetting/caregivers/unvetted'),
      ]);
      setRecords(listData.records || []);
      setUnvetted(unvettedData.caregivers || []);
    } catch (err) {
      setError(err.message);
      setRecords([]);
      setUnvetted([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelected(null);
    setFormError('');
    setNidNumber('');
    setPoliceUrl('');
    setReferences(emptyRefs);
    setProbationStatus('passed');
    setProbationNote('');
    setRejectReason('');
  }, []);

  function openRecord(record, mode) {
    setSelected(record);
    setModalMode(mode);
    setFormError('');
    setMessage('');
    setError('');
    setNidNumber(record.nidNumber || '');
    setPoliceUrl(record.policeDocumentUrl || '');
    setReferences(
      record.references?.length >= 2
        ? record.references.map((r) => ({
            name: r.name,
            relation: r.relation,
            note: r.note || '',
            verified: r.verified !== false,
          }))
        : emptyRefs
    );
    setProbationStatus(
      record.probationStatus === 'not_started'
        ? 'in_probation'
        : record.probationStatus || 'passed'
    );
    setProbationNote(record.probationNote || '');
    setRejectReason('');
  }

  async function handleStart(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (!startCaregiverId) {
        setFormError('Select a caregiver to start vetting');
        return;
      }
      await apiRequest(`/admin/vetting/${startCaregiverId}/start`, {
        method: 'POST',
      });
      setMessage('Vetting pipeline started');
      setStartCaregiverId('');
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function submitStep(e) {
    e.preventDefault();
    if (!selected) return;
    setFormError('');
    setSaving(true);
    try {
      if (modalMode === 'nid') {
        await apiRequest(`/admin/vetting/${selected.id}/nid`, {
          method: 'PATCH',
          body: JSON.stringify({ approved: true, nidNumber }),
        });
        setMessage('NID step approved');
      } else if (modalMode === 'police') {
        await apiRequest(`/admin/vetting/${selected.id}/police`, {
          method: 'PATCH',
          body: JSON.stringify({
            approved: true,
            documentUrl: policeUrl,
          }),
        });
        setMessage('Police clearance approved');
      } else if (modalMode === 'references') {
        await apiRequest(`/admin/vetting/${selected.id}/references`, {
          method: 'PATCH',
          body: JSON.stringify({
            references,
            approved: true,
          }),
        });
        setMessage('Reference checks approved');
      } else if (modalMode === 'probation') {
        await apiRequest(`/admin/vetting/${selected.id}/probation`, {
          method: 'PATCH',
          body: JSON.stringify({
            probationStatus,
            note: probationNote,
          }),
        });
        setMessage('Probation updated');
      } else if (modalMode === 'activate') {
        await apiRequest(`/admin/vetting/${selected.id}/activate`, {
          method: 'POST',
        });
        setMessage('Caregiver activated for the vetted pool');
      } else if (modalMode === 'reject') {
        await apiRequest(`/admin/vetting/${selected.id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason: rejectReason }),
        });
        setMessage('Vetting rejected');
      }
      closeModal();
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function updateRef(index, field, value) {
    setReferences((prev) =>
      prev.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref))
    );
  }

  const modalTitle = {
    nid: 'Approve NID verification',
    police: 'Approve police clearance',
    references: 'Approve reference checks',
    probation: 'Update probation',
    activate: 'Activate caregiver',
    reject: 'Reject vetting',
  }[modalMode];

  return (
    <DashboardLayout title="Caregiver vetting">
      <div className="panel-section">
        <p className="muted">
          Complete NID, police clearance, references, and probation before a
          caregiver can join the family assignment pool (FR-17).
        </p>

        <form className="toolbar" onSubmit={handleStart}>
          <div className="toolbar-filters">
            <label>
              Start vetting for
              <select
                value={startCaregiverId}
                onChange={(e) => setStartCaregiverId(e.target.value)}
              >
                <option value="">Select caregiver</option>
                {unvetted.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Filter by status
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="activated">Activated</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
          </div>
          <button type="submit" disabled={saving || !startCaregiverId}>
            Start pipeline
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {formError && !modalMode && <p className="error">{formError}</p>}

        {loading ? (
          <p className="muted">Loading vetting records...</p>
        ) : records.length === 0 ? (
          <p className="muted">No vetting records yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Caregiver</th>
                  <th>NID</th>
                  <th>Police</th>
                  <th>References</th>
                  <th>Probation</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div>{record.caregiver?.name || record.caregiverId}</div>
                      <div className="muted">{record.caregiver?.email}</div>
                    </td>
                    <td>{record.nidVerified ? 'Yes' : 'No'}</td>
                    <td>{record.policeClearance ? 'Yes' : 'No'}</td>
                    <td>{record.referenceCheck ? 'Yes' : 'No'}</td>
                    <td>{record.probationStatus}</td>
                    <td>
                      <span
                        className={
                          record.status === 'activated'
                            ? 'badge active'
                            : record.status === 'rejected'
                              ? 'badge inactive'
                              : 'badge'
                        }
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>
                      {record.status === 'activated' ||
                      record.status === 'rejected' ? (
                        <span className="muted">Closed</span>
                      ) : (
                        <div className="form-actions">
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => openRecord(record, 'nid')}
                          >
                            NID
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => openRecord(record, 'police')}
                          >
                            Police
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => openRecord(record, 'references')}
                          >
                            Refs
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => openRecord(record, 'probation')}
                          >
                            Probation
                          </button>
                          <button
                            type="button"
                            onClick={() => openRecord(record, 'activate')}
                          >
                            Activate
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => openRecord(record, 'reject')}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalMode !== null} title={modalTitle} onClose={closeModal}>
        <form onSubmit={submitStep} className="form">
          {modalMode === 'nid' && (
            <label>
              NID number
              <input
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                required
              />
            </label>
          )}

          {modalMode === 'police' && (
            <label>
              Clearance document URL
              <input
                value={policeUrl}
                onChange={(e) => setPoliceUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </label>
          )}

          {modalMode === 'references' && (
            <>
              {references.map((ref, index) => (
                <div key={index} className="form-row two">
                  <label>
                    Reference {index + 1} name
                    <input
                      value={ref.name}
                      onChange={(e) => updateRef(index, 'name', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Relation
                    <input
                      value={ref.relation}
                      onChange={(e) =>
                        updateRef(index, 'relation', e.target.value)
                      }
                      required
                    />
                  </label>
                  <label>
                    Note
                    <input
                      value={ref.note}
                      onChange={(e) => updateRef(index, 'note', e.target.value)}
                    />
                  </label>
                </div>
              ))}
              <p className="muted">
                Include at least one ward councilor or institution reference.
              </p>
            </>
          )}

          {modalMode === 'probation' && (
            <>
              <label>
                Probation status
                <select
                  value={probationStatus}
                  onChange={(e) => setProbationStatus(e.target.value)}
                >
                  <option value="not_started">Not started</option>
                  <option value="in_probation">In probation</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </label>
              <label>
                Review note
                <textarea
                  value={probationNote}
                  onChange={(e) => setProbationNote(e.target.value)}
                  rows={3}
                />
              </label>
            </>
          )}

          {modalMode === 'activate' && (
            <p>
              Activate {selected?.caregiver?.name} only after NID, police,
              references, and passed probation are complete.
            </p>
          )}

          {modalMode === 'reject' && (
            <label>
              Reason
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                required
              />
            </label>
          )}

          {formError && <p className="error">{formError}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Confirm'}
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
