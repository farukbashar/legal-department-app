import StatusBadge from './StatusBadge.jsx';

const STATUS_OPTIONS = ['', 'draft', 'pending_approval', 'active', 'executed', 'expired', 'terminated'];

export default function ContractList({ contracts, filters, onFilterChange, onSelect, onNew, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
            REA · Legal Department
          </p>
          <h1 className="text-2xl font-serif font-semibold text-ink">Contract registry</h1>
        </div>
        <button
          onClick={onNew}
          className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light"
        >
          + New contract
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="text-sm border border-ink/20 rounded-sm px-2 py-1.5 bg-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s ? s.replace('_', ' ') : 'All statuses'}
            </option>
          ))}
        </select>
        <input
          value={filters.department}
          onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
          placeholder="Filter by department"
          className="text-sm border border-ink/20 rounded-sm px-2 py-1.5 bg-white flex-1 max-w-xs"
        />
      </div>

      <div className="border border-ink/15 rounded-sm overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03] text-left">
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Title</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Counterparty</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Ends</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-light/60">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && contracts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-light/60">
                  No contracts match these filters.
                </td>
              </tr>
            )}
            {!loading &&
              contracts.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className="border-b border-ink/10 last:border-0 hover:bg-brass/5 cursor-pointer"
                >
                  <td className="px-4 py-2.5 font-medium text-ink">{c.title}</td>
                  <td className="px-4 py-2.5 text-ink-light">{c.counterparty}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-light">
                    {new Date(c.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-right text-ink-light">
                    {c.value ? `${c.currency} ${Number(c.value).toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
