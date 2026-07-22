import { useState } from 'react';

const EMPTY = { regulation: '', description: '', dueDate: '', responsibleOfficerId: '' };

export default function NewObligationForm({ onCancel, onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.regulation || !form.dueDate) {
      setError('Regulation and due date are required.');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate({ ...form, responsibleOfficerId: form.responsibleOfficerId ? Number(form.responsibleOfficerId) : null });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">New entry</p>
      <h1 className="text-2xl font-serif font-semibold text-ink mb-6">Track a compliance obligation</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-ink/15 rounded-sm p-6">
        {error && <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2">{error}</p>}

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Regulation</span>
          <input value={form.regulation} onChange={update('regulation')} className="input" placeholder="NERC quarterly tariff filing" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Description</span>
          <textarea value={form.description} onChange={update('description')} className="input min-h-[80px]" placeholder="What this obligation requires" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Due date</span>
            <input value={form.dueDate} onChange={update('dueDate')} type="date" className="input" />
          </label>
          <label className="block">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Responsible officer ID</span>
            <input value={form.responsibleOfficerId} onChange={update('responsibleOfficerId')} className="input" placeholder="Optional" />
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light disabled:opacity-50">
            {submitting ? 'Saving…' : 'Create obligation'}
          </button>
          <button type="button" onClick={onCancel} className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
