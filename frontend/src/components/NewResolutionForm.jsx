import { useState } from 'react';

const EMPTY = { resolutionNumber: '', title: '', summary: '', resolutionDate: '' };

export default function NewResolutionForm({ onCancel, onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.resolutionNumber || !form.title || !form.resolutionDate) {
      setError('Resolution number, title, and date are required.');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">New entry</p>
      <h1 className="text-2xl font-serif font-semibold text-ink mb-6">Archive a board resolution</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-ink/15 rounded-sm p-6">
        {error && <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2">{error}</p>}

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Resolution number</span>
          <input value={form.resolutionNumber} onChange={update('resolutionNumber')} className="input" placeholder="REA/BR/2026/014" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Title</span>
          <input value={form.title} onChange={update('title')} className="input" placeholder="Approval of FY2026 capital budget" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Summary</span>
          <textarea value={form.summary} onChange={update('summary')} className="input min-h-[80px]" placeholder="Brief summary of the resolution" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Resolution date</span>
          <input value={form.resolutionDate} onChange={update('resolutionDate')} type="date" className="input" />
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light disabled:opacity-50">
            {submitting ? 'Saving…' : 'Archive resolution'}
          </button>
          <button type="button" onClick={onCancel} className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
