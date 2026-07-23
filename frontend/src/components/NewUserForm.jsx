import { useState } from 'react';

const EMPTY = { fullName: '', email: '', password: '', role: 'legal_officer', department: '' };

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'head_of_legal', label: 'Head of Legal' },
  { value: 'legal_officer', label: 'Legal Officer' },
  { value: 'counsel', label: 'Counsel' },
  { value: 'compliance_officer', label: 'Compliance Officer' },
  { value: 'executive', label: 'Executive (read-only)' },
];

export default function NewUserForm({ onCancel, onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.email || !form.password) {
      setError('Full name, email, and password are required.');
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
      <h1 className="text-2xl font-serif font-semibold text-ink mb-6">Add a user</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-ink/15 rounded-sm p-6">
        {error && <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2">{error}</p>}

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Full name</span>
          <input value={form.fullName} onChange={update('fullName')} className="input" placeholder="Fatima Aliyu" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Email</span>
          <input value={form.email} onChange={update('email')} type="email" className="input" placeholder="fatima.aliyu@rea.gov.ng" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Temporary password</span>
          <input value={form.password} onChange={update('password')} type="text" className="input" placeholder="They should change this after first login" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Role</span>
            <select value={form.role} onChange={update('role')} className="input">
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Department (optional)</span>
            <input value={form.department} onChange={update('department')} className="input" placeholder="Legal" />
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light disabled:opacity-50">
            {submitting ? 'Creating…' : 'Create user'}
          </button>
          <button type="button" onClick={onCancel} className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
