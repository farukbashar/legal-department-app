import { useEffect, useState } from 'react';
import { api } from '../api.js';
import DebtCaseList from './DebtCaseList.jsx';
import NewDebtCaseForm from './NewDebtCaseForm.jsx';
import DebtCaseDetail from './DebtCaseDetail.jsx';

export default function RecoveryModule() {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedId, setSelectedId] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '' });

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await api.listDebtCases({
        ...(filters.status ? { status: filters.status } : {}),
      });
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, filters]);

  return (
    <>
      {view === 'list' && (
        <DebtCaseList
          cases={cases}
          filters={filters}
          onFilterChange={setFilters}
          onSelect={(id) => {
            setSelectedId(id);
            setView('detail');
          }}
          onNew={() => setView('new')}
          loading={loading}
        />
      )}

      {view === 'new' && (
        <NewDebtCaseForm
          onCancel={() => setView('list')}
          onCreate={async (data) => {
            const c = await api.createDebtCase(data);
            setSelectedId(c.id);
            setView('detail');
          }}
        />
      )}

      {view === 'detail' && (
        <DebtCaseDetail caseId={selectedId} onBack={() => setView('list')} onChanged={loadCases} />
      )}
    </>
  );
}
