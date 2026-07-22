import { useState } from 'react';
import { api } from '../api.js';
import OpinionStatusBadge from './OpinionStatusBadge.jsx';

export default function OpinionSearch({ onBack }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.searchOpinions({ q });
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink mb-4">
        ← Back to requests
      </button>

      <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">Precedent search</p>
      <h1 className="text-2xl font-serif font-semibold text-ink mb-6">Search previous opinions</h1>

      <form onSubmit={runSearch} className="flex gap-2 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by subject or content"
          className="input"
        />
        <button type="submit" className="text-sm font-medium px-4 py-2 rounded-sm bg-ink text-paper hover:bg-ink-light whitespace-nowrap">
          Search
        </button>
      </form>

      {error && (
        <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading && <p className="text-sm text-ink-light/60">Searching…</p>}

      {results && !loading && (
        <div className="space-y-3">
          {results.length === 0 && <p className="text-sm text-ink-light/60 italic">No approved opinions match.</p>}
          {results.map((o) => (
            <div key={o.id} className="bg-white border border-ink/15 rounded-sm p-4">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium text-ink">{o.request?.subject}</p>
                <OpinionStatusBadge status={o.status} />
              </div>
              <p className="text-xs text-ink-light/60 mb-2">
                Drafted by {o.draftedBy?.fullName || '—'} · Reviewed by {o.reviewedBy?.fullName || '—'}
              </p>
              <p className="text-sm text-ink-light line-clamp-3">{o.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
