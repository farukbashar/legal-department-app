import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ComplianceStatusBadge from './ComplianceStatusBadge.jsx';
import ArchiveActions from './ArchiveActions.jsx';

const STATUS_OPTIONS = ['pending', 'in_progress', 'compliant', 'overdue', 'non_compliant'];

export default function ObligationDetail({ obligationId, onBack, onChanged }) {
  const [o, setObligation] = useState(null);
  const [error, setError] = useState('');
  const [officerId, setOfficerId] = useState('');

  const load = async () => {
    try {
      const data = await api.getObligation(obligationId);
      setObligation(data);
      setOfficerId(data.responsibleOfficerId || '');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obligationId]);

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

  if (!o) {
    return error ? <p className="text-status-rejected text-sm">{error}</p> : <p className="text-ink-light/60 text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink mb-4">
        ← Back to tracker
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
              Obligation · #{String(o.id).padStart(4, '0')}
            </p>
            <h1 className="text-2xl font-serif font-semibold text-ink">{o.regulation}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ComplianceStatusBadge status={o.status} />
            <select
              value={o.status}
              onChange={(e) => handleAction(() => api.updateObligation(obligationId, { status: e.target.value }))}
              className="text-xs border border-ink/20 rounded-sm px-1.5 py-1 bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {o.description && <p className="text-sm text-ink-light mt-2 mb-4">{o.description}</p>}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Due date</dt>
            <dd className="text-ink">
              <input
                type="date"
                defaultValue={new Date(o.dueDate).toISOString().slice(0, 10)}
                onBlur={(e) => e.target.value && handleAction(() => api.updateObligation(obligationId, { dueDate: e.target.value }))}
                className="text-sm border border-ink/20 rounded-sm px-2 py-1 bg-white mt-1"
              />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Responsible officer</dt>
            <dd className="text-ink">
              <div className="flex gap-2 mt-1">
                <input
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="Officer user ID"
                  className="text-sm border border-ink/20 rounded-sm px-2 py-1 bg-white w-28"
                />
                <button
                  onClick={() => handleAction(() => api.updateObligation(obligationId, { responsibleOfficerId: officerId ? Number(officerId) : null }))}
                  className="text-xs px-2 py-1 border border-ink/20 rounded-sm hover:bg-ink/5"
                >
                  Save
                </button>
              </div>
              {o.responsibleOfficer && <p className="text-xs text-ink-light/60 mt-1">{o.responsibleOfficer.fullName}</p>}
            </dd>
          </div>
        </dl>

        <ArchiveActions
          isArchived={Boolean(o.archivedAt)}
          onArchive={() => handleAction(() => api.archiveObligation(obligationId))}
          onUnarchive={() => handleAction(() => api.unarchiveObligation(obligationId))}
          onDelete={async () => {
            await api.deleteObligation(obligationId);
            onChanged?.();
            onBack();
          }}
        />
      </div>
    </div>
  );
}
