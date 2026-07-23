export default function ArchivedToggle({ checked, onChange }) {
  return (
    <label className="flex items-center gap-1.5 text-sm text-ink-light cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded-sm"
      />
      Show archived
    </label>
  );
}
