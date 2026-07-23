import { useState } from 'react';
import { api, saveSession } from '../api.js';

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { token, user } = await api.login(email, password);
      saveSession(token, user);
      onLoggedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <form onSubmit={handleSubmit} className="bg-white border border-ink/15 rounded-sm p-8 w-full max-w-sm">
        <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">REA · Legal Department</p>
        <h1 className="text-2xl font-serif font-semibold text-ink mb-6">Sign in</h1>

        {error && (
          <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <label className="block mb-3">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="input" />
        </label>
        <label className="block mb-5">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="input" />
        </label>

        <button type="submit" disabled={submitting} className="w-full bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light disabled:opacity-50">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
