import CaseStatusBadge from './CaseStatusBadge.jsx';
import ArchivedToggle from './ArchivedToggle.jsx';
import ExportCSVButton from './ExportCSVButton.jsx';

const STATUS_OPTIONS = ['', 'open', 'in_progress', 'settled', 'dismissed', 'judgment_entered', 'closed'];
const CSV_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'caseNumber', label: 'Case number' },
  { key: 'court', label: 'Court' },
  { key: 'opposingParty', label: 'Opposing party' },
  { key: 'status', label: 'Status' },
  { key: 'currency', label: 'Currency' },
  { key: 'financialExposure', label: 'Financial exposure' },
];

export default function CaseList({ cases, filters, onFilterChange, onSelect, onNew, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
            REA · Legal Department
          </p>
          <h1 className="text-2xl font-serif font-semibold text-ink">Litigation docket</h1>
        </div>
        <div className="flex gap-2">
          <ExportCSVButton filename="litigation-cases" rows={cases} columns={CSV_COLUMNS} />
          <button
            onClick={onNew}
            className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light"
          >
            + New case
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-4 items-center">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="text-sm border border-ink/20 rounded-sm px-2 py-1.5 bg-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All statuses'}</option>
          ))}
        </select>
        <input
          value={filters.court}
          onChange={(e) => onFilterChange({ ...filters, court: e.target.value })}
          placeholder="Filter by court"
          className="text-sm border border-ink/20 rounded-sm px-2 py-1.5 bg-white flex-1 max-w-xs"
        />
        <ArchivedToggle
          checked={filters.archived === 'true'}
          onChange={(checked) => onFilterChange({ ...filters, archived: checked ? 'true' : '' })}
        />
      </div>

      <div className="border border-ink/15 rounded-sm overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03] text-left">
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Case no.</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Opposing party</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Court</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide text-right">Exposure</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-light/60">Loading…</td></tr>
            )}
            {!loading && cases.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-light/60">No cases match these filters.</td></tr>
            )}
            {!loading &&
              cases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className="border-b border-ink/10 last:border-0 hover:bg-brass/5 cursor-pointer"
                >
                  <td className="px-4 py-2.5 font-medium text-ink font-mono text-xs">{c.caseNumber}</td>
                  <td className="px-4 py-2.5 text-ink-light">{c.opposingParty}</td>
                  <td className="px-4 py-2.5 text-ink-light">{c.court}</td>
                  <td className="px-4 py-2.5"><CaseStatusBadge status={c.status} /></td>
                  <td className="px-4 py-2.5 font-mono text-xs text-right text-ink-light">
                    {c.financialExposure ? `${c.currency} ${Number(c.financialExposure).toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
