import { useState } from 'react';

const EMPTY = {
  title: '',
  counterparty: '',
  department: '',
  value: '',
  currency: 'NGN',
  startDate: '',
  endDate: '',
};

export default function NewContractForm({ onCancel, onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.counterparty || !form.startDate || !form.endDate) {
      setError('Title, counterparty, start date, and end date are required.');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate({ ...form, value: form.value ? Number(form.value) : null });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">New entry</p>
      <h1 className="text-2xl font-serif font-semibold text-ink mb-6">Register a contract</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-ink/15 rounded-sm p-6">
        {error && <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2">{error}</p>}

        <Field label="Title">
          <input value={form.title} onChange={update('title')} className="input" placeholder="Solar mini-grid supply agreement" />
        </Field>

        <Field label="Counterparty">
          <input value={form.counterparty} onChange={update('counterparty')} className="input" placeholder="Acme Energy Ltd" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Department">
            <input value={form.department} onChange={update('department')} className="input" placeholder="Procurement" />
          </Field>
          <Field label="Value">
            <div className="flex gap-2">
              <input value={form.currency} onChange={update('currency')} className="input w-20" />
              <input value={form.value} onChange={update('value')} type="number" className="input" placeholder="0.00" />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date">
            <input value={form.startDate} onChange={update('startDate')} type="date" className="input" />
          </Field>
          <Field label="End date">
            <input value={form.endDate} onChange={update('endDate')} type="date" className="input" />
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light disabled:opacity-50">
            {submitting ? 'Saving…' : 'Create contract'}
          </button>
          <button type="button" onClick={onCancel} className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">{label}</span>
      {children}
    </label>
  );
}
