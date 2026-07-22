import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function ResolutionDetail({ resolutionId, onBack }) {
  const [resolution, setResolution] = useState(null);
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState('');
  const [docForm, setDocForm] = useState({ fileName: '', fileUrl: '' });

  const load = async () => {
    try {
      const [r, d] = await Promise.all([
        api.getResolution(resolutionId),
        api.listResolutionDocuments(resolutionId),
      ]);
      setResolution(r);
      setDocs(d);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolutionId]);

  const handleLink = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.linkResolutionDocument(resolutionId, docForm);
      setDocForm({ fileName: '', fileUrl: '' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!resolution) {
    return error ? <p className="text-status-rejected text-sm">{error}</p> : <p className="text-ink-light/60 text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink mb-4">
        ← Back to archive
      </button>

      {error && (
        <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-ink/15 rounded-sm p-6 mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
          Resolution · {resolution.resolutionNumber}
        </p>
        <h1 className="text-2xl font-serif font-semibold text-ink mb-2">{resolution.title}</h1>
        <p className="text-xs text-ink-light/60 font-mono mb-3">
          {new Date(resolution.resolutionDate).toLocaleDateString()}
        </p>
        {resolution.summary && <p className="text-sm text-ink-light">{resolution.summary}</p>}
      </div>

      <div className="bg-white border border-ink/15 rounded-sm p-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-4">Linked supporting documents</h2>
        <ul className="space-y-2 mb-4">
          {docs.length === 0 && <p className="text-sm text-ink-light/60 italic">No documents linked yet.</p>}
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0">
              <span className="font-medium text-ink">{d.fileName}</span>
              <span className="text-xs text-ink-light/60 font-mono">
                {d.uploader?.fullName || 'unknown'} · {new Date(d.uploadedAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
        <form onSubmit={handleLink} className="flex gap-2">
          <input
            value={docForm.fileName}
            onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
            placeholder="File name"
            className="input"
          />
          <input
            value={docForm.fileUrl}
            onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
            placeholder="File URL"
            className="input"
          />
          <button type="submit" className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5 whitespace-nowrap">
            Link
          </button>
        </form>
      </div>
    </div>
  );
}
