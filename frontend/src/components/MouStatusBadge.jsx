const HEX = {
  draft: '#6B7280',
  in_review: '#1F4E4A',
  approved: '#2F5D3A',
  renewed: '#2F5D3A',
  expired: '#6B5D4F',
  terminated: '#8C3A2E',
};

export default function MouStatusBadge({ status }) {
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
