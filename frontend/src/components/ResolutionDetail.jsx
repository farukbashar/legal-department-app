import { useEffect, useState } from 'react';
import { api } from '../api.js';
import FileUploadField from './FileUploadField.jsx';
import ArchiveActions from './ArchiveActions.jsx';
import { exportReportPDF } from '../utils/pdf.js';

export default function ResolutionDetail({ resolutionId, onBack, onChanged }) {
  const [resolution, setResolution] = useState(null);
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState('');

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

  const handleAction = async (fn) => {
    setError('');
    try {
      await fn();
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLink = (fileName, fileUrl) =>
    handleAction(() => api.linkResolutionDocument(resolutionId, { fileName, fileUrl }));

  const handleExportPDF = () => {
    exportReportPDF({
      title: resolution.title,
      subtitle: `Resolution ${resolution.resolutionNumber} — REA Legal Department`,
      filename: `resolution-${resolution.resolutionNumber}`,
      sections: [
        {
          heading: 'Details',
          rows: [
            ['Resolution number', resolution.resolutionNumber],
            ['Date', new Date(resolution.resolutionDate).toLocaleDateString()],
            ['Created by', resolution.createdBy?.fullName || '—'],
          ],
        },
        ...(resolution.summary ? [{ heading: 'Summary', text: resolution.summary }] : []),
        {
          heading: 'Linked supporting documents',
          rows: docs.length > 0 ? docs.map((d) => [d.fileName, d.fileUrl]) : [['None', '—']],
        },
      ],
    });
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
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
              Resolution · {resolution.resolutionNumber}
            </p>
            <h1 className="text-2xl font-serif font-semibold text-ink mb-2">{resolution.title}</h1>
            <p className="text-xs text-ink-light/60 font-mono mb-3">
              {new Date(resolution.resolutionDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink border border-ink/20 rounded-sm px-3 py-1.5 whitespace-nowrap"
          >
            Export PDF
          </button>
        </div>
        {resolution.summary && <p className="text-sm text-ink-light">{resolution.summary}</p>}

        <ArchiveActions
          isArchived={Boolean(resolution.archivedAt)}
          onArchive={() => handleAction(() => api.archiveResolution(resolutionId))}
          onUnarchive={() => handleAction(() => api.unarchiveResolution(resolutionId))}
          onDelete={async () => {
            await api.deleteResolution(resolutionId);
            onChanged?.();
            onBack();
          }}
        />
      </div>

      <div className="bg-white border border-ink/15 rounded-sm p-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-4">Linked supporting documents</h2>
        <ul className="space-y-2 mb-4">
          {docs.length === 0 && <p className="text-sm text-ink-light/60 italic">No documents linked yet.</p>}
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0">
              <a href={d.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-ink hover:text-brass">
                {d.fileName}
              </a>
              <span className="text-xs text-ink-light/60 font-mono">
                {d.uploader?.fullName || 'unknown'} · {new Date(d.uploadedAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
        <FileUploadField label="Link a new document" onUploaded={handleLink} />
      </div>
    </div>
  );
}
