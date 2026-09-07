import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';

const TYPE_LABELS = {
  nid: 'National ID',
  blood_type: 'Blood type',
  allergy_list: 'Allergy list',
  ecg: 'ECG',
  prescription: 'Prescription',
  other: 'Document',
};

export default function SharedDocumentPage() {
  const { token } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await apiRequest(`/vault/shared/${token}`);
        if (!cancelled) setDoc(data.document);
      } catch (err) {
        if (!cancelled) {
          setDoc(null);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="app-auth">
      <div className="card share-card">
        <p className="muted" style={{ marginTop: 0 }}>
          Elder Care medical vault
        </p>
        <h1>Shared document</h1>
        {loading ? (
          <p className="muted">Opening link...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <p>
              <strong>{doc.title}</strong>
            </p>
            <p className="muted">
              {TYPE_LABELS[doc.type] || doc.type}
              {doc.fileType ? ` · ${doc.fileType}` : ''}
              {doc.elder?.name ? ` for ${doc.elder.name}` : ''}
            </p>
            {doc.notes ? <p>{doc.notes}</p> : null}
            {doc.shareExpiresAt ? (
              <p className="muted">
                This link expires {new Date(doc.shareExpiresAt).toLocaleString()}.
              </p>
            ) : null}
            {doc.url ? (
              <a
                className="landing-btn"
                href={doc.url}
                target="_blank"
                rel="noreferrer"
              >
                Open document
              </a>
            ) : (
              <p className="muted">No file is attached to this record.</p>
            )}
          </>
        )}
        <p className="muted">
          <Link to="/">Back to Elder Care</Link>
        </p>
      </div>
    </div>
  );
}
