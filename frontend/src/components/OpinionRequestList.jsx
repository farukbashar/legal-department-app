import OpinionStatusBadge from './OpinionStatusBadge.jsx';
import ArchivedToggle from './ArchivedToggle.jsx';
import ExportCSVButton from './ExportCSVButton.jsx';

const STATUS_OPTIONS = ['', 'submitted', 'assigned', 'drafting', 'in_review', 'completed'];
const PRIORITY_OPTIONS = ['', 'low', 'medium', 'high', 'urgent'];
const CSV_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'subject', label: 'Subject' },
  { key: 'requester.fullName', label: 'Requester' },
  { key: 'assignedTo.fullName', label: 'Assigned to' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
];

export default function OpinionRequestList({ requests, filters, onFilterChange, onSelect, onNew, onSearch, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
            REA · Legal Department
          </p>
          <h1 className="text-2xl font-serif font-semibold text-ink">Legal opinion requests</h1>
        </div>
        <div className="flex gap-2">
          <ExportCSVButton filename="legal-opinion-requests" rows={requests} columns={CSV_COLUMNS} />
          <button
            onClick={onSearch}
            className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5"
          >
            Search past opinions
          </button>
          <button
            onClick={onNew}
            className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light"
          >
            + New request
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
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
          className="text-sm border border-ink/20 rounded-sm px-2 py-1.5 bg-white"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p || 'All priorities'}</option>
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
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Subject</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Requester</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Assigned to</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Priority</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-light/60">Loading…</td></tr>
            )}
            {!loading && requests.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-light/60">No requests match these filters.</td></tr>
            )}
            {!loading &&
              requests.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  className="border-b border-ink/10 last:border-0 hover:bg-brass/5 cursor-pointer"
                >
                  <td className="px-4 py-2.5 font-medium text-ink">{r.subject}</td>
                  <td className="px-4 py-2.5 text-ink-light">{r.requester?.fullName || '—'}</td>
                  <td className="px-4 py-2.5 text-ink-light">{r.assignedTo?.fullName || '—'}</td>
                  <td className="px-4 py-2.5 text-ink-light font-mono text-xs uppercase">{r.priority}</td>
                  <td className="px-4 py-2.5"><OpinionStatusBadge status={r.status} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
