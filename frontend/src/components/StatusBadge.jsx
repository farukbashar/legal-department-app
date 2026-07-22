const LABELS = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  active: 'Active',
  executed: 'Executed',
  expired: 'Expired',
  terminated: 'Terminated',
};

const COLOR_KEY = {
  draft: 'draft',
  pending_approval: 'pending',
  active: 'active',
  executed: 'executed',
  expired: 'expired',
  terminated: 'rejected',
};

export default function StatusBadge({ status }) {
  const colorKey = COLOR_KEY[status] || 'draft';
  const label = LABELS[status] || status;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium font-mono uppercase tracking-wide border"
      style={{
        color: STATUS_HEX[colorKey],
        borderColor: STATUS_HEX[colorKey],
        backgroundColor: `${STATUS_HEX[colorKey]}1A`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: STATUS_HEX[colorKey] }}
      />
      {label}
    </span>
  );
}

const STATUS_HEX = {
  draft: '#6B7280',
  pending: '#8A6A2E',
  active: '#2F5D3A',
  executed: '#1F4E4A',
  rejected: '#8C3A2E',
  expired: '#6B5D4F',
};
