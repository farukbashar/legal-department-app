import { useEffect, useState } from 'react';
import { api } from '../api.js';
import CaseList from './CaseList.jsx';
import NewCaseForm from './NewCaseForm.jsx';
import CaseDetail from './CaseDetail.jsx';

export default function LitigationModule({ jumpToId, onJumpHandled }) {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedId, setSelectedId] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', court: '' });

  useEffect(() => {
    if (jumpToId) {
      setSelectedId(jumpToId);
      setView('detail');
      onJumpHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToId]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await api.listCases({
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.court ? { court: filters.court } : {}),
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
        <CaseList
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
        <NewCaseForm
          onCancel={() => setView('list')}
          onCreate={async (data) => {
            const c = await api.createCase(data);
            setSelectedId(c.id);
            setView('detail');
          }}
        />
      )}

      {view === 'detail' && (
        <CaseDetail caseId={selectedId} onBack={() => setView('list')} onChanged={loadCases} />
      )}
    </>
  );
}
