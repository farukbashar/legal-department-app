export default function ResolutionList({ resolutions, q, onQChange, onSelect, onNew, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
            REA · Legal Department
          </p>
          <h1 className="text-2xl font-serif font-semibold text-ink">Board resolution archive</h1>
        </div>
        <button
          onClick={onNew}
          className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light"
        >
          + New resolution
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => onQChange(e.target.value)}
        placeholder="Search by title, resolution number, or summary"
        className="input mb-4 max-w-md"
      />

      <div className="border border-ink/15 rounded-sm overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/15 bg-ink/[0.03] text-left">
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Resolution no.</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Title</th>
              <th className="px-4 py-2.5 font-medium text-ink-light/80 font-mono text-xs uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-ink-light/60">Loading…</td></tr>
            )}
            {!loading && resolutions.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-ink-light/60">No resolutions match this search.</td></tr>
            )}
            {!loading &&
              resolutions.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  className="border-b border-ink/10 last:border-0 hover:bg-brass/5 cursor-pointer"
                >
                  <td className="px-4 py-2.5 font-medium text-ink font-mono text-xs">{r.resolutionNumber}</td>
                  <td className="px-4 py-2.5 text-ink-light">{r.title}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-light">
                    {new Date(r.resolutionDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
