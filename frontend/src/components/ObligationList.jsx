import ComplianceStatusBadge from './ComplianceStatusBadge.jsx';

const STATUS_OPTIONS = ['', 'pending', 'in_progress', 'compliant', 'overdue', 'non_compliant'];

export default function ObligationList({ obligations, filters, onFilterChange, onSelect, onNew, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
            REA · Legal Department
          </p>
          <h1 className="text-2xl font-serif font-semibold text-ink">Compliance tracker</h1>
        </div>
        <button
          onClick={onNew}
          className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light"
        >
          + New obligation
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="text-sm border border-ink/20 rounded-sm px-2 py-1.5 bg-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All statuses'}</option>
          ))}
        </select>
      </div>

      <div className="border border-ink/15 rounded-sm overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03] text-left">
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Regulation</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Responsible officer</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Due date</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-light/60">Loading…</td></tr>
            )}
            {!loading && obligations.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-light/60">No obligations match these filters.</td></tr>
            )}
            {!loading &&
              obligations.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => onSelect(o.id)}
                  className="border-b border-ink/10 last:border-0 hover:bg-brass/5 cursor-pointer"
                >
                  <td className="px-4 py-2.5 font-medium text-ink">{o.regulation}</td>
                  <td className="px-4 py-2.5 text-ink-light">{o.responsibleOfficer?.fullName || '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-light">
                    {new Date(o.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5"><ComplianceStatusBadge status={o.status} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
