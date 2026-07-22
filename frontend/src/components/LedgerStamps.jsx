// Renders a vertical registry-ledger line of stamped seals.
// Each entry gets an ink-stamp badge: outlined + hollow while pending,
// filled solid once decided (green seal = approved/signed, red seal = rejected/declined).
export default function LedgerStamps({ entries, renderLabel, renderMeta, onDecide, decideLabels }) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm text-ink-light/60 italic">Not started yet.</p>;
  }

  return (
    <ol className="relative pl-8">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-ink/15" />
      {entries.map((entry, idx) => {
        const decided = entry.status !== 'pending';
        const rejected = entry.status === 'rejected' || entry.status === 'declined';
        const sealColor = !decided ? '#B4B2A9' : rejected ? '#8C3A2E' : '#2F5D3A';

        return (
          <li key={entry.id} className="relative pb-6 last:pb-0">
            <div
              className="absolute -left-8 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-mono font-semibold"
              style={{
                borderColor: sealColor,
                color: decided ? '#fff' : sealColor,
                backgroundColor: decided ? sealColor : 'transparent',
              }}
            >
              {decided ? (rejected ? '✕' : '✓') : idx + 1}
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-ink">{renderLabel(entry)}</p>
              <span
                className="text-xs font-mono uppercase tracking-wide"
                style={{ color: sealColor }}
              >
                {entry.status}
              </span>
            </div>
            {renderMeta && <p className="text-xs text-ink-light/70 mt-0.5">{renderMeta(entry)}</p>}
            {!decided && onDecide && decideLabels && (
              <div className="flex gap-2 mt-2">
                {decideLabels.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => onDecide(entry, d.value)}
                    className="text-xs px-2.5 py-1 border border-ink/20 rounded-sm hover:bg-ink/5 font-medium"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
