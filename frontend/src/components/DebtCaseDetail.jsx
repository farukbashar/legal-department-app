import { useEffect, useState } from 'react';
import { api } from '../api.js';
import DebtStatusBadge from './DebtStatusBadge.jsx';

export default function DebtCaseDetail({ caseId, onBack, onChanged }) {
  const [c, setCase] = useState(null);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentDate: '', method: '', notes: '' });

  const load = async () => {
    try {
      const [caseData, paymentData] = await Promise.all([
        api.getDebtCase(caseId),
        api.listDebtPayments(caseId),
      ]);
      setCase(caseData);
      setPayments(paymentData);
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
        ← Back to cases
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
              Debt case · #{String(c.id).padStart(4, '0')}
            </p>
            <h1 className="text-2xl font-serif font-semibold text-ink">{c.debtor}</h1>
          </div>
          <DebtStatusBadge status={c.status} />
        </div>
        {c.description && <p className="text-sm text-ink-light mt-2 mb-4">{c.description}</p>}

        <dl className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Amount owed</dt>
            <dd className="text-ink font-mono">{c.currency} {Number(c.amountOwed).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Total paid</dt>
            <dd className="text-ink font-mono">{c.currency} {Number(c.totalPaid).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">Outstanding</dt>
            <dd className="text-ink font-mono">{c.currency} {Number(c.outstandingBalance).toLocaleString()}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white border border-ink/15 rounded-sm p-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-4">Payment history</h2>
        <ul className="space-y-2 mb-4">
          {payments.length === 0 && <p className="text-sm text-ink-light/60 italic">No payments recorded yet.</p>}
          {payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0">
              <div>
                <span className="font-medium text-ink font-mono">{c.currency} {Number(p.amount).toLocaleString()}</span>
                {p.method && <span className="text-ink-light ml-2">{p.method}</span>}
                {p.notes && <span className="text-ink-light/70 ml-2 text-xs">{p.notes}</span>}
              </div>
              <span className="text-xs font-mono text-ink-light/60">
                {new Date(p.paymentDate).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAction(() => api.recordDebtPayment(caseId, { ...paymentForm, amount: Number(paymentForm.amount) }));
            setPaymentForm({ amount: '', paymentDate: '', method: '', notes: '' });
          }}
          className="flex gap-2 flex-wrap"
        >
          <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="Amount" className="input w-32" />
          <input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} className="input" />
          <input value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} placeholder="Method (optional)" className="input" />
          <button type="submit" className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5 whitespace-nowrap">
            Record payment
          </button>
        </form>
      </div>
    </div>
  );
}
