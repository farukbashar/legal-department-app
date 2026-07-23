import { useEffect, useState } from 'react';
import { api } from '../api.js';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'head_of_legal', label: 'Head of Legal' },
  { value: 'legal_officer', label: 'Legal Officer' },
  { value: 'counsel', label: 'Counsel' },
  { value: 'compliance_officer', label: 'Compliance Officer' },
  { value: 'executive', label: 'Executive (read-only)' },
];

export default function UserDetail({ userId, users, onBack, onChanged }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [department, setDepartment] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    const found = users.find((u) => u.id === userId);
    setUser(found || null);
    setDepartment(found?.department || '');
  }, [userId, users]);

  const handleAction = async (fn) => {
    setError('');
    try {
      await fn();
      await onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    return error ? <p className="text-status-rejected text-sm">{error}</p> : <p className="text-ink-light/60 text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-2xl">
      <button onClick={onBack} className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink mb-4">
        ← Back to users
      </button>

      {error && (
        <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-ink/15 rounded-sm p-6">
        <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
          User · #{String(user.id).padStart(4, '0')}
        </p>
        <h1 className="text-2xl font-serif font-semibold text-ink mb-1">{user.fullName}</h1>
        <p className="text-sm text-ink-light mb-6">{user.email}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <label className="block">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Role</span>
            <select
              value={user.role}
              onChange={(e) => handleAction(() => api.updateUser(userId, { role: e.target.value }))}
              className="input"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Department</span>
            <div className="flex gap-2">
              <input value={department} onChange={(e) => setDepartment(e.target.value)} className="input" />
              <button
                onClick={() => handleAction(() => api.updateUser(userId, { department }))}
                className="text-xs px-2 py-1 border border-ink/20 rounded-sm hover:bg-ink/5 whitespace-nowrap"
              >
                Save
              </button>
            </div>
          </label>
        </div>

        <button
          onClick={() => handleAction(() => api.updateUser(userId, { isActive: !user.isActive }))}
          className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5"
        >
          {user.isActive ? 'Deactivate this user' : 'Reactivate this user'}
        </button>
      </div>

      <div className="bg-white border border-ink/15 rounded-sm p-6 mt-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-4">Reset password</h2>
        <p className="text-sm text-ink-light mb-3">
          Sets a new password for this user directly — no need for their old one. Share it with them securely.
        </p>
        {resetDone ? (
          <p className="text-sm text-status-active">Password reset successfully.</p>
        ) : (
          <div className="flex gap-2">
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New temporary password"
              className="input"
            />
            <button
              onClick={() =>
                handleAction(async () => {
                  await api.adminResetPassword(userId, newPassword);
                  setNewPassword('');
                  setResetDone(true);
                })
              }
              className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5 whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
