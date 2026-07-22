import { useEffect, useState } from 'react';
import { api } from '../api.js';
import MouStatusBadge from './MouStatusBadge.jsx';
import LedgerStamps from './LedgerStamps.jsx';

export default function MouDetail({ mouId, onBack, onChanged }) {
  const [mou, setMou] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [error, setError] = useState('');
  const [renewalDate, setRenewalDate] = useState('');

  const load = async () => {
    try {
      const [m, a, r] = await Promise.all([
        api.getMou(mouId),
        api.listMouApprovals(mouId),
        api.listMouReminders(mouId),
      ]);
      setMou(m);
      setApprovals(a);
      setReminders(r);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouId]);

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

  if (!mou) {
    return error ? <p className="text-status-rejected text-sm">{error}</p> : <p className="text-ink-light/60 text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink mb-4">
        ← Back to register
      </button>

      {error && (
        <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-ink/15 rounded-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
              MoU · #{String(mou.id).padStart(4, '0')}
            </p>
            <h1 className="text-2xl font-serif font-semibold text-ink">{mou.title}</h1>
          </div>
          <MouStatusBadge status={mou.status} />
        </div>
        <p className="text-sm text-ink-light mt-2">{mou.parties}</p>
        {mou.purpose && <p className="text-sm text-ink-light mt-1">{mou.purpose}</p>}
        {mou.renewalDate && (
          <p className="text-xs text-ink-light/60 mt-3 font-mono">
            Renewal date: {new Date(mou.renewalDate).toLocaleDateString()}
          </p>
        )}

        {mou.status === 'draft' && (
          <button
            onClick={() => handleAction(() => api.submitMouForReview(mouId))}
            className="mt-4 text-sm font-medium px-4 py-2 rounded-sm bg-ink text-paper hover:bg-ink-light"
          >
            Submit for review
          </button>
        )}

        {mou.status === 'in_review' && approvals.length === 0 && (
          <button
            onClick={() => handleAction(() => api.startMouApprovals(mouId))}
            className="mt-4 text-sm font-medium px-4 py-2 rounded-sm bg-ink text-paper hover:bg-ink-light"
          >
            Start approval workflow
          </button>
        )}

        {['approved', 'renewed'].includes(mou.status) && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction(() => api.renewMou(mouId, renewalDate));
              setRenewalDate('');
            }}
            className="flex gap-2 mt-4"
          >
            <input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} className="input" />
            <button type="submit" className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5 whitespace-nowrap">
              Renew
            </button>
          </form>
        )}
      </div>

      {approvals.length > 0 && (
        <div className="bg-white border border-ink/15 rounded-sm p-6 mb-6">
          <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-4">Approval workflow</h2>
          <LedgerStamps
            entries={approvals}
            renderLabel={(a) => `Step ${a.step} — ${a.approver?.fullName || 'awaiting approver'}`}
            renderMeta={(a) => a.comments}
            onDecide={(entry, decision) =>
              handleAction(() => api.decideMouApproval(entry.id, decision, decision === 'rejected' ? 'Rejected' : 'Approved'))
            }
            decideLabels={[
              { value: 'approved', label: 'Approve' },
              { value: 'rejected', label: 'Reject' },
            ]}
          />
        </div>
      )}

      <div className="bg-white border border-ink/15 rounded-sm p-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-4">Renewal reminders</h2>
        {reminders.length === 0 ? (
          <p className="text-sm text-ink-light/60 italic">No reminders scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0">
                <span className="text-ink">{r.message}</span>
                <span className="text-xs font-mono text-ink-light/60">
                  {new Date(r.remindAt).toLocaleDateString()} {r.isSent ? '· sent' : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
