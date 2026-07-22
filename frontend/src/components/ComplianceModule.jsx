import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ObligationList from './ObligationList.jsx';
import NewObligationForm from './NewObligationForm.jsx';
import ObligationDetail from './ObligationDetail.jsx';

export default function ComplianceModule() {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedId, setSelectedId] = useState(null);
  const [obligations, setObligations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '' });

  const loadObligations = async () => {
    setLoading(true);
    try {
      const data = await api.listObligations({
        ...(filters.status ? { status: filters.status } : {}),
      });
      setObligations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') loadObligations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, filters]);

  return (
    <>
      {view === 'list' && (
        <ObligationList
          obligations={obligations}
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
        <NewObligationForm
          onCancel={() => setView('list')}
          onCreate={async (data) => {
            const o = await api.createObligation(data);
            setSelectedId(o.id);
            setView('detail');
          }}
        />
      )}

      {view === 'detail' && (
        <ObligationDetail obligationId={selectedId} onBack={() => setView('list')} onChanged={loadObligations} />
      )}
    </>
  );
}
