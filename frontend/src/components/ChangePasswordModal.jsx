import { useState } from 'react';
import { api } from '../api.js';

export default function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white border border-ink/15 rounded-sm p-6 w-full max-w-sm">
        <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">Account</p>
        <h2 className="text-xl font-serif font-semibold text-ink mb-4">Change password</h2>

        {success ? (
          <>
            <p className="text-sm text-status-active mb-4">Password updated successfully.</p>
            <button onClick={onClose} className="w-full bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light">
              Done
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2">
                {error}
              </p>
            )}
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Current password</span>
              <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="input" />
            </label>
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">New password</span>
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="input" />
            </label>
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Confirm new password</span>
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="input" />
            </label>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitting} className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light disabled:opacity-50">
                {submitting ? 'Saving…' : 'Update password'}
              </button>
              <button type="button" onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
