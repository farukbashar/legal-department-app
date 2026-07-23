import { downloadCSV } from '../utils/csv.js';

export default function ExportCSVButton({ filename, rows, columns }) {
  return (
    <button
      onClick={() => downloadCSV(filename, rows, columns)}
      disabled={!rows || rows.length === 0}
      className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink border border-ink/20 rounded-sm px-3 py-1.5 disabled:opacity-40"
    >
      Export CSV
    </button>
  );
}
