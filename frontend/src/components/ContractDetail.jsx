import { useEffect, useState } from 'react';
import { api } from '../api.js';
import StatusBadge from './StatusBadge.jsx';
import LedgerStamps from './LedgerStamps.jsx';

export default function ContractDetail({ contractId, onBack, onChanged }) {
  const [contract, setContract] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [versions, setVersions] = useState([]);
  const [error, setError] = useState('');
  const [signerForm, setSignerForm] = useState({ signerName: '', signerEmail: '' });
  const [versionForm, setVersionForm] = useState({ fileName: '', fileUrl: '' });

  const load = async () => {
    try {
      const [c, a, s, v] = await Promise.all([
        api.getContract(contractId),
        api.listApprovals(contractId),
        api.listSignatures(contractId),
        api.listVersions(contractId),
      ]);
      setContract(c);
      setApprovals(a);
      setSignatures(s);
      setVersions(v);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

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

  if (!contract) {
    return error ? (
      <p className="text-status-rejected text-sm">{error}</p>
    ) : (
      <p className="text-ink-light/60 text-sm">Loading…</p>
    );
  }

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink mb-4">
        ← Back to registry
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
              Contract file · #{String(contract.id).padStart(4, '0')}
            </p>
            <h1 className="text-2xl font-serif font-semibold text-ink">{contract.title}</h1>
          </div>
          <StatusBadge status={contract.status} />
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-4">
          <Row label="Counterparty" value={contract.counterparty} />
          <Row label="Department" value={contract.department || '—'} />
          <Row label="Value" value={contract.value ? `${contract.currency} ${Number(contract.value).toLocaleString()}` : '—'} />
          <Row label="Owner" value={contract.owner?.fullName || '—'} />
          <Row label="Start date" value={new Date(contract.startDate).toLocaleDateString()} />
          <Row label="End date" value={new Date(contract.endDate).toLocaleDateString()} />
        </dl>

        {contract.status === 'draft' && (
          <button
            onClick={() => handleAction(() => api.startApprovals(contractId))}
            className="mt-4 text-sm font-medium px-4 py-2 rounded-sm bg-ink text-paper hover:bg-ink-light"
          >
            Start approval workflow
          </button>
        )}
      </div>

      <Section title="Approval workflow">
        <LedgerStamps
          entries={approvals}
          renderLabel={(a) => `Step ${a.step} — ${a.approver?.fullName || 'awaiting approver'}`}
          renderMeta={(a) => a.comments}
          onDecide={(entry, decision) =>
            handleAction(() => api.decideApproval(entry.id, decision, decision === 'rejected' ? 'Rejected' : 'Approved'))
          }
          decideLabels={[
            { value: 'approved', label: 'Approve' },
            { value: 'rejected', label: 'Reject' },
          ]}
        />
      </Section>

      <Section title="Digital signatures">
        {contract.status === 'active' || contract.status === 'executed' ? (
          <>
            <LedgerStamps
              entries={signatures.map((s) => ({ ...s, status: s.status }))}
              renderLabel={(s) => s.signerName}
              renderMeta={(s) => s.signerEmail}
              onDecide={(entry, decision) => handleAction(() => api.recordSignature(entry.id, decision))}
              decideLabels={[
                { value: 'signed', label: 'Mark signed' },
                { value: 'declined', label: 'Mark declined' },
              ]}
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAction(() => api.requestSignature(contractId, signerForm));
                setSignerForm({ signerName: '', signerEmail: '' });
              }}
              className="flex gap-2 mt-4"
            >
              <input
                value={signerForm.signerName}
                onChange={(e) => setSignerForm({ ...signerForm, signerName: e.target.value })}
                placeholder="Signer name"
                className="input"
              />
              <input
                value={signerForm.signerEmail}
                onChange={(e) => setSignerForm({ ...signerForm, signerEmail: e.target.value })}
                placeholder="Signer email"
                className="input"
              />
              <button type="submit" className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5 whitespace-nowrap">
                Request
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-ink-light/60 italic">Available once the contract is fully approved.</p>
        )}
      </Section>

      <Section title="Version history">
        <ul className="space-y-2 mb-4">
          {versions.length === 0 && <p className="text-sm text-ink-light/60 italic">No versions uploaded yet.</p>}
          {versions.map((v) => (
            <li key={v.id} className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0">
              <span className="font-medium text-ink">
                v{v.version} — {v.fileName}
              </span>
              <span className="text-xs text-ink-light/60 font-mono">
                {v.uploader?.fullName || 'unknown'} · {new Date(v.uploadedAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAction(() => api.uploadVersion(contractId, versionForm));
            setVersionForm({ fileName: '', fileUrl: '' });
          }}
          className="flex gap-2"
        >
          <input
            value={versionForm.fileName}
            onChange={(e) => setVersionForm({ ...versionForm, fileName: e.target.value })}
            placeholder="File name"
            className="input"
          />
          <input
            value={versionForm.fileUrl}
            onChange={(e) => setVersionForm({ ...versionForm, fileUrl: e.target.value })}
            placeholder="File URL"
            className="input"
          />
          <button type="submit" className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5 whitespace-nowrap">
            Upload
          </button>
        </form>
      </Section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-mono uppercase tracking-wide text-ink-light/60">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-ink/15 rounded-sm p-6 mb-6">
      <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-4">{title}</h2>
      {children}
    </div>
  );
}
