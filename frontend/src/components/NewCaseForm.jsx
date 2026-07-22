import { useState } from 'react';

const EMPTY = { caseNumber: '', court: '', opposingParty: '', subjectMatter: '', financialExposure: '', currency: 'NGN' };

export default function NewCaseForm({ onCancel, onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.caseNumber || !form.court || !form.opposingParty) {
      setError('Case number, court, and opposing party are required.');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate({ ...form, financialExposure: form.financialExposure ? Number(form.financialExposure) : null });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">New entry</p>
      <h1 className="text-2xl font-serif font-semibold text-ink mb-6">Open a case</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-ink/15 rounded-sm p-6">
        {error && <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2">{error}</p>}

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Case number</span>
          <input value={form.caseNumber} onChange={update('caseNumber')} className="input" placeholder="FHC/ABJ/CS/412/2026" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Court</span>
          <input value={form.court} onChange={update('court')} className="input" placeholder="Federal High Court, Abuja" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Opposing party</span>
          <input value={form.opposingParty} onChange={update('opposingParty')} className="input" placeholder="Northgate Construction Ltd" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Subject matter</span>
          <textarea value={form.subjectMatter} onChange={update('subjectMatter')} className="input min-h-[80px]" placeholder="Brief description of the dispute" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Financial exposure</span>
          <div className="flex gap-2">
            <input value={form.currency} onChange={update('currency')} className="input w-20" />
            <input value={form.financialExposure} onChange={update('financialExposure')} type="number" className="input" placeholder="0.00" />
          </div>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light disabled:opacity-50">
            {submitting ? 'Saving…' : 'Open case'}
          </button>
          <button type="button" onClick={onCancel} className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
