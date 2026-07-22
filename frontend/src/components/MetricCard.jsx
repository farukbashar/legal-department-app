export default function MetricCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white border border-ink/15 rounded-sm p-5">
      <p className="text-xs font-mono uppercase tracking-widest text-ink-light/60 mb-2">{label}</p>
      <p className="text-3xl font-serif font-semibold" style={{ color: accent || '#1E2A3C' }}>
        {value}
      </p>
      {sub && <p className="text-xs text-ink-light/70 mt-1">{sub}</p>}
    </div>
  );
}
