import { useEffect, useState } from 'react';
import { api } from '../api.js';
import MetricCard from './MetricCard.jsx';

export default function DashboardModule() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) return <p className="text-status-rejected text-sm">{error}</p>;
  if (!summary) return <p className="text-ink-light/60 text-sm">Loading…</p>;

  const {
    activeContracts,
    expiringContracts,
    pendingOpinions,
    courtCases,
    highRiskLitigation,
    complianceScore,
    monthlyPerformance,
  } = summary;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
            REA · Legal Department
          </p>
          <h1 className="text-2xl font-serif font-semibold text-ink">Executive dashboard</h1>
        </div>
        <button onClick={load} className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink border border-ink/20 rounded-sm px-3 py-1.5">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Active contracts" value={activeContracts.count} />
        <MetricCard
          label="Expiring soon"
          value={expiringContracts.count}
          sub={`within ${expiringContracts.withinDays} days`}
          accent={expiringContracts.count > 0 ? '#8A6A2E' : undefined}
        />
        <MetricCard label="Pending opinions" value={pendingOpinions.count} />
        <MetricCard
          label="Compliance score"
          value={complianceScore.score === null ? '—' : `${complianceScore.score}%`}
          sub={`${complianceScore.compliant}/${complianceScore.total} compliant`}
          accent={complianceScore.score !== null && complianceScore.score < 80 ? '#8C3A2E' : '#2F5D3A'}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-ink/15 rounded-sm p-5">
          <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-3">Court cases</h2>
          <p className="text-sm text-ink mb-1">
            <span className="font-mono font-medium">{courtCases.openCount}</span> open cases
          </p>
          <p className="text-sm text-ink-light">
            Total exposure: <span className="font-mono">{courtCases.totalExposure.toLocaleString()}</span>
          </p>
        </div>

        <div className="bg-white border border-ink/15 rounded-sm p-5">
          <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-3">
            High-risk litigation <span className="text-ink-light/50 normal-case">(≥ {highRiskLitigation.threshold.toLocaleString()})</span>
          </h2>
          {highRiskLitigation.count === 0 ? (
            <p className="text-sm text-ink-light/60 italic">No high-risk cases currently.</p>
          ) : (
            <ul className="space-y-1">
              {highRiskLitigation.cases.map((c) => (
                <li key={c.id} className="text-sm flex justify-between">
                  <span className="text-ink">{c.caseNumber} — {c.opposingParty}</span>
                  <span className="font-mono text-status-rejected">{Number(c.financialExposure).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white border border-ink/15 rounded-sm p-5 mb-6">
        <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-3">
          Contracts expiring within {expiringContracts.withinDays} days
        </h2>
        {expiringContracts.contracts.length === 0 ? (
          <p className="text-sm text-ink-light/60 italic">None coming up.</p>
        ) : (
          <ul className="space-y-1">
            {expiringContracts.contracts.map((c) => (
              <li key={c.id} className="text-sm flex justify-between">
                <span className="text-ink">{c.title} — {c.counterparty}</span>
                <span className="font-mono text-ink-light">{new Date(c.endDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-ink/15 rounded-sm p-5">
        <h2 className="text-xs font-mono uppercase tracking-widest text-brass mb-3">
          Monthly performance — {monthlyPerformance.month}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Contracts created" value={monthlyPerformance.contractsCreated} />
          <Stat label="Contracts executed" value={monthlyPerformance.contractsExecuted} />
          <Stat label="Opinions approved" value={monthlyPerformance.opinionsCompleted} />
          <Stat label="Cases resolved" value={monthlyPerformance.casesResolved} />
          <Stat label="MoUs approved" value={monthlyPerformance.mousApproved} />
          <Stat label="Debt recovered" value={monthlyPerformance.debtRecoveredThisMonth.toLocaleString()} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-wide text-ink-light/60">{label}</p>
      <p className="text-lg font-serif font-semibold text-ink">{value}</p>
    </div>
  );
}
