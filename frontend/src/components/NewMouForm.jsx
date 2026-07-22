import { useState } from 'react';

const EMPTY = { title: '', parties: '', purpose: '', renewalDate: '' };

export default function NewMouForm({ onCancel, onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.parties) {
      setError('Title and parties are required.');
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
      <h1 className="text-2xl font-serif font-semibold text-ink mb-6">Draft a memorandum of understanding</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-ink/15 rounded-sm p-6">
        {error && <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2">{error}</p>}

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Title</span>
          <input value={form.title} onChange={update('title')} className="input" placeholder="MoU on rural electrification data sharing" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Parties</span>
          <input value={form.parties} onChange={update('parties')} className="input" placeholder="REA and Kaduna State Ministry of Energy" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Purpose</span>
          <textarea value={form.purpose} onChange={update('purpose')} className="input min-h-[80px]" placeholder="What this MoU covers" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Renewal date (optional)</span>
          <input value={form.renewalDate} onChange={update('renewalDate')} type="date" className="input" />
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light disabled:opacity-50">
            {submitting ? 'Saving…' : 'Create draft'}
          </button>
          <button type="button" onClick={onCancel} className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
