const HEX = {
  act: '#1F4E4A',
  regulation: '#8A6A2E',
  policy: '#2F5D3A',
  precedent: '#8C3A2E',
  template: '#6B7280',
};

export default function KnowledgeTypeBadge({ type }) {
  const color = HEX[type] || '#6B7280';
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium font-mono uppercase tracking-wide border"
      style={{ color, borderColor: color, backgroundColor: `${color}1A` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {type}
    </span>
  );
}
