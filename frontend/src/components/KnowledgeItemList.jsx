import KnowledgeTypeBadge from './KnowledgeTypeBadge.jsx';

const TYPE_OPTIONS = ['', 'act', 'regulation', 'policy', 'precedent', 'template'];

export default function KnowledgeItemList({ items, filters, onFilterChange, onSelect, onNew, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
            REA · Legal Department
          </p>
          <h1 className="text-2xl font-serif font-semibold text-ink">Legal knowledge base</h1>
        </div>
        <button
          onClick={onNew}
          className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light"
        >
          + New item
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={filters.type}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
          className="text-sm border border-ink/20 rounded-sm px-2 py-1.5 bg-white"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t || 'All types'}</option>
          ))}
        </select>
        <input
          value={filters.q}
          onChange={(e) => onFilterChange({ ...filters, q: e.target.value })}
          placeholder="Search by title or content"
          className="text-sm border border-ink/20 rounded-sm px-2 py-1.5 bg-white flex-1 max-w-xs"
        />
      </div>

      <div className="border border-ink/15 rounded-sm overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03] text-left">
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Title</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Type</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Last updated</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-ink-light/60">Loading…</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-ink-light/60">No items match these filters.</td></tr>
            )}
            {!loading &&
              items.map((i) => (
                <tr
                  key={i.id}
                  onClick={() => onSelect(i.id)}
                  className="border-b border-ink/10 last:border-0 hover:bg-brass/5 cursor-pointer"
                >
                  <td className="px-4 py-2.5 font-medium text-ink">{i.title}</td>
                  <td className="px-4 py-2.5"><KnowledgeTypeBadge type={i.type} /></td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-light">
                    {new Date(i.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
