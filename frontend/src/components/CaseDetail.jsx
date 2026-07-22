import { useEffect, useState } from 'react';
import { api } from '../api.js';
import CaseStatusBadge from './CaseStatusBadge.jsx';

const STATUS_OPTIONS = ['open', 'in_progress', 'settled', 'dismissed', 'judgment_entered', 'closed'];

export default function CaseDetail({ caseId, onBack, onChanged }) {
  const [c, setCase] = useState(null);
  const [error, setError] = useState('');
  const [hearingForm, setHearingForm] = useState({ hearingDate: '', purpose: '' });
  const [counselForm, setCounselForm] = useState({ name: '', firm: '', role: 'lead', contactEmail: '' });
  const [judgmentForm, setJudgmentForm] = useState({ outcome: 'won', amount: '', judgmentDate: '', notes: '' });

  const load = async () => {
    try {
      const data = await api.getCase(caseId);
      setCase(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const handleAction = async (fn) => {
    setError('');
    try {
      await fn();
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!c) {
    return error ? <p className="text-status-rejected text-sm">{error}</p> : <p className="text-ink-light/60 text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink mb-4">
        ← Back to docket
      </button>

      {error && (
        <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-ink/15 rounded-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">Case · {c.caseNumber}</p>
            <h1 className="text-2xl font-serif font-semibold text-ink">{c.opposingParty}</h1>
          </div>
          <div className="flex items-center gap-2">
            <CaseStatusBadge status={c.status} />
            <select
              value={c.status}
              onChange={(e) => handleAction(() => api.updateCase(caseId, { status: e.target.value }))}
              className="text-xs border border-ink/20 rounded-sm px-1.5 py-1 bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-4">
          <div>
            <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Court</dt>
            <dd className="text-ink">{c.court}</dd>
          </div>
          <div>
            <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Financial exposure</dt>
            <dd className="text-ink">{c.financialExposure ? `${c.currency} ${Number(c.financialExposure).toLocaleString()}` : '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Owner</dt>
            <dd className="text-ink">{c.owner?.fullName || '—'}</dd>
          </div>
        </dl>
        {c.subjectMatter && <p className="text-sm text-ink-light mt-3">{c.subjectMatter}</p>}
      </div>

      <div className="bg-white border border-ink/15 rounded-sm p-6 mb-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-4">Hearing schedule</h2>
        <ul className="space-y-2 mb-4">
          {(!c.hearings || c.hearings.length === 0) && <p className="text-sm text-ink-light/60 italic">No hearings scheduled.</p>}
          {c.hearings?.map((h) => (
            <li key={h.id} className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0">
              <div>
                <span className="font-medium text-ink font-mono text-xs">{new Date(h.hearingDate).toLocaleDateString()}</span>
                {h.purpose && <span className="text-ink-light ml-2">{h.purpose}</span>}
              </div>
              {h.outcome ? (
                <span className="text-xs text-ink-light/60">{h.outcome}</span>
              ) : (
                <button
                  onClick={() => {
                    const outcome = prompt('Outcome of this hearing:');
                    if (outcome) handleAction(() => api.recordHearingOutcome(h.id, outcome));
                  }}
                  className="text-xs px-2 py-1 border border-ink/20 rounded-sm hover:bg-ink/5"
                >
                  Record outcome
                </button>
              )}
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAction(() => api.scheduleHearing(caseId, hearingForm));
            setHearingForm({ hearingDate: '', purpose: '' });
          }}
          className="flex gap-2"
        >
          <input type="date" value={hearingForm.hearingDate} onChange={(e) => setHearingForm({ ...hearingForm, hearingDate: e.target.value })} className="input" />
          <input value={hearingForm.purpose} onChange={(e) => setHearingForm({ ...hearingForm, purpose: e.target.value })} placeholder="Purpose" className="input" />
          <button type="submit" className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5 whitespace-nowrap">
            Schedule
          </button>
        </form>
      </div>

      <div className="bg-white border border-ink/15 rounded-sm p-6 mb-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-4">Assigned counsel</h2>
        <ul className="space-y-2 mb-4">
          {(!c.counsel || c.counsel.length === 0) && <p className="text-sm text-ink-light/60 italic">No counsel assigned yet.</p>}
          {c.counsel?.map((co) => (
            <li key={co.id} className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0">
              <div>
                <span className="font-medium text-ink">{co.name}</span>
                {co.firm && <span className="text-ink-light ml-2">{co.firm}</span>}
                <span className="text-xs font-mono uppercase text-ink-light/60 ml-2">{co.role}</span>
              </div>
              <button
                onClick={() => handleAction(() => api.removeCounsel(co.id))}
                className="text-xs px-2 py-1 border border-ink/20 rounded-sm hover:bg-ink/5"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAction(() => api.assignCounsel(caseId, counselForm));
            setCounselForm({ name: '', firm: '', role: 'lead', contactEmail: '' });
          }}
          className="flex gap-2 flex-wrap"
        >
          <input value={counselForm.name} onChange={(e) => setCounselForm({ ...counselForm, name: e.target.value })} placeholder="Name" className="input" />
          <input value={counselForm.firm} onChange={(e) => setCounselForm({ ...counselForm, firm: e.target.value })} placeholder="Firm (optional)" className="input" />
          <select value={counselForm.role} onChange={(e) => setCounselForm({ ...counselForm, role: e.target.value })} className="input w-32">
            <option value="lead">Lead</option>
            <option value="co_counsel">Co-counsel</option>
            <option value="internal">Internal</option>
          </select>
          <button type="submit" className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5 whitespace-nowrap">
            Assign
          </button>
        </form>
      </div>

      <div className="bg-white border border-ink/15 rounded-sm p-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-4">Judgment</h2>
        {c.judgment ? (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Outcome</dt>
              <dd className="text-ink capitalize">{c.judgment.outcome}</dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Amount</dt>
              <dd className="text-ink">{c.judgment.amount ? Number(c.judgment.amount).toLocaleString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Date</dt>
              <dd className="text-ink">{new Date(c.judgment.judgmentDate).toLocaleDateString()}</dd>
            </div>
            {c.judgment.notes && (
              <div className="col-span-2">
                <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Notes</dt>
                <dd className="text-ink">{c.judgment.notes}</dd>
              </div>
            )}
          </dl>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction(() => api.recordJudgment(caseId, { ...judgmentForm, amount: judgmentForm.amount ? Number(judgmentForm.amount) : null }));
            }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <select value={judgmentForm.outcome} onChange={(e) => setJudgmentForm({ ...judgmentForm, outcome: e.target.value })} className="input w-32">
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="settled">Settled</option>
                <option value="dismissed">Dismissed</option>
              </select>
              <input type="date" value={judgmentForm.judgmentDate} onChange={(e) => setJudgmentForm({ ...judgmentForm, judgmentDate: e.target.value })} className="input" />
              <input type="number" value={judgmentForm.amount} onChange={(e) => setJudgmentForm({ ...judgmentForm, amount: e.target.value })} placeholder="Amount (optional)" className="input" />
            </div>
            <textarea value={judgmentForm.notes} onChange={(e) => setJudgmentForm({ ...judgmentForm, notes: e.target.value })} placeholder="Notes" className="input min-h-[60px]" />
            <button type="submit" className="text-sm font-medium px-4 py-2 rounded-sm bg-ink text-paper hover:bg-ink-light">
              Record judgment
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
