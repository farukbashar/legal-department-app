const HEX = {
  outstanding: '#8C3A2E',
  in_recovery: '#8A6A2E',
  partially_recovered: '#8A6A2E',
  recovered: '#2F5D3A',
  written_off: '#6B5D4F',
};

export default function DebtStatusBadge({ status }) {
  const color = HEX[status] || '#6B7280';
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium font-mono uppercase tracking-wide border"
      style={{ color, borderColor: color, backgroundColor: `${color}1A` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
