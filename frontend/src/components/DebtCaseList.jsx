import DebtStatusBadge from './DebtStatusBadge.jsx';

const STATUS_OPTIONS = ['', 'outstanding', 'in_recovery', 'partially_recovered', 'recovered', 'written_off'];

export default function DebtCaseList({ cases, filters, onFilterChange, onSelect, onNew, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
            REA · Legal Department
          </p>
          <h1 className="text-2xl font-serif font-semibold text-ink">Recovery & debt cases</h1>
        </div>
        <button
          onClick={onNew}
          className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light"
        >
          + New debt case
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
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Debtor</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide text-right">Amount owed</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide text-right">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-light/60">Loading…</td></tr>
            )}
            {!loading && cases.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-light/60">No debt cases match these filters.</td></tr>
            )}
            {!loading &&
              cases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className="border-b border-ink/10 last:border-0 hover:bg-brass/5 cursor-pointer"
                >
                  <td className="px-4 py-2.5 font-medium text-ink">{c.debtor}</td>
                  <td className="px-4 py-2.5"><DebtStatusBadge status={c.status} /></td>
                  <td className="px-4 py-2.5 font-mono text-xs text-right text-ink-light">
                    {c.currency} {Number(c.amountOwed).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-right text-ink-light">
                    {c.currency} {Number(c.outstandingBalance).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
