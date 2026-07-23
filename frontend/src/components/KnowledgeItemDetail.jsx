import { useEffect, useState } from 'react';
import { api } from '../api.js';
import KnowledgeTypeBadge from './KnowledgeTypeBadge.jsx';
import ArchiveActions from './ArchiveActions.jsx';

export default function KnowledgeItemDetail({ itemId, onBack, onChanged }) {
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(false);

  const load = async () => {
    try {
      const data = await api.getKnowledgeItem(itemId);
      setItem(data);
      setContent(data.content || '');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const handleSave = async () => {
    setError('');
    try {
      await api.updateKnowledgeItem(itemId, { content });
      setEditing(false);
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleArchive = () => handleActionSimple(() => api.archiveKnowledgeItem(itemId));
  const handleUnarchive = () => handleActionSimple(() => api.unarchiveKnowledgeItem(itemId));

  const handleActionSimple = async (fn) => {
    setError('');
    try {
      await fn();
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    setError('');
    try {
      await api.deleteKnowledgeItem(itemId);
      onChanged?.();
      onBack();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!item) {
    return error ? <p className="text-status-rejected text-sm">{error}</p> : <p className="text-ink-light/60 text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink mb-4">
        ← Back to knowledge base
      </button>

      {error && (
        <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-ink/15 rounded-sm p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
              Item · #{String(item.id).padStart(4, '0')}
            </p>
            <h1 className="text-2xl font-serif font-semibold text-ink">{item.title}</h1>
          </div>
          <KnowledgeTypeBadge type={item.type} />
        </div>

        {item.fileUrl && (
          <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-brass underline">
            {item.fileUrl}
          </a>
        )}

        <div className="mt-4">
          {editing ? (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input min-h-[200px] font-serif text-sm leading-relaxed"
              />
              <div className="flex gap-2 mt-3">
                <button onClick={handleSave} className="text-sm font-medium px-4 py-2 rounded-sm bg-ink text-paper hover:bg-ink-light">
                  Save
                </button>
                <button onClick={() => { setEditing(false); setContent(item.content || ''); }} className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-serif leading-relaxed text-ink whitespace-pre-wrap">
                {item.content || <span className="italic text-ink-light/60">No content yet.</span>}
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditing(true)} className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5">
                  Edit
                </button>
              </div>
              <ArchiveActions
                isArchived={Boolean(item.archivedAt)}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
                onDelete={handleDelete}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
