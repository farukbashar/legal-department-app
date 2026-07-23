import MouStatusBadge from './MouStatusBadge.jsx';
import ArchivedToggle from './ArchivedToggle.jsx';
import ExportCSVButton from './ExportCSVButton.jsx';

const STATUS_OPTIONS = ['', 'draft', 'in_review', 'approved', 'renewed', 'expired', 'terminated'];
const CSV_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'parties', label: 'Parties' },
  { key: 'status', label: 'Status' },
  { key: 'renewalDate', label: 'Renewal date' },
];

export default function MouList({ mous, filters, onFilterChange, onSelect, onNew, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
            REA · Legal Department
          </p>
          <h1 className="text-2xl font-serif font-semibold text-ink">MoU register</h1>
        </div>
        <div className="flex gap-2">
          <ExportCSVButton filename="mous" rows={mous} columns={CSV_COLUMNS} />
          <button
            onClick={onNew}
            className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light"
          >
            + New MoU
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
        <ArchivedToggle
          checked={filters.archived === 'true'}
          onChange={(checked) => onFilterChange({ ...filters, archived: checked ? 'true' : '' })}
        />
      </div>

      <div className="border border-ink/15 rounded-sm overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03] text-left">
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Title</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Parties</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Renewal date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-light/60">Loading…</td></tr>
            )}
            {!loading && mous.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-light/60">No MoUs match these filters.</td></tr>
            )}
            {!loading &&
              mous.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => onSelect(m.id)}
                  className="border-b border-ink/10 last:border-0 hover:bg-brass/5 cursor-pointer"
                >
                  <td className="px-4 py-2.5 font-medium text-ink">{m.title}</td>
                  <td className="px-4 py-2.5 text-ink-light">{m.parties}</td>
                  <td className="px-4 py-2.5"><MouStatusBadge status={m.status} /></td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-light">
                    {m.renewalDate ? new Date(m.renewalDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
