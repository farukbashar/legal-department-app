import { useEffect, useState } from 'react';
import { api } from '../api.js';

const ENTITY_TYPES = [
  '',
  'contract',
  'legal_opinion_request',
  'legal_opinion',
  'litigation_case',
  'mou',
  'board_resolution',
  'compliance_obligation',
  'debt_case',
  'knowledge_item',
];

export default function AuditLogModule() {
  const [entries, setEntries] = useState([]);
  const [entityType, setEntityType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listAuditLog(entityType ? { entityType } : {});
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
            REA · Legal Department
          </p>
          <h1 className="text-2xl font-serif font-semibold text-ink">Activity log</h1>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="text-sm border border-ink/20 rounded-sm px-2 py-1.5 bg-white"
        >
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>{t ? t.replace(/_/g, ' ') : 'All record types'}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="border border-ink/15 rounded-sm overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03] text-left">
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">When</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Record type</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Action</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">By</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-light/60">Loading…</td></tr>
            )}
            {!loading && entries.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-light/60">No activity recorded yet.</td></tr>
            )}
            {!loading &&
              entries.map((e) => (
                <tr key={e.id} className="border-b border-ink/10 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-light whitespace-nowrap">
                    {new Date(e.performedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-ink-light font-mono text-xs uppercase">{e.entityType.replace(/_/g, ' ')} #{e.entityId}</td>
                  <td className="px-4 py-2.5 font-medium text-ink">{e.action.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-2.5 text-ink-light">{e.performer?.fullName || '—'}</td>
                  <td className="px-4 py-2.5 text-ink-light/70 text-xs">{e.notes || ''}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
