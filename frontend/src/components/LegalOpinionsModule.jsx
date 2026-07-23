import { useEffect, useState } from 'react';
import { api } from '../api.js';
import OpinionRequestList from './OpinionRequestList.jsx';
import NewOpinionRequestForm from './NewOpinionRequestForm.jsx';
import OpinionRequestDetail from './OpinionRequestDetail.jsx';
import OpinionSearch from './OpinionSearch.jsx';

export default function LegalOpinionsModule({ jumpToId, onJumpHandled }) {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new' | 'search'
  const [selectedId, setSelectedId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  useEffect(() => {
    if (jumpToId) {
      setSelectedId(jumpToId);
      setView('detail');
      onJumpHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToId]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.listOpinionRequests({
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
      });
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, filters]);

  return (
    <>
      {view === 'list' && (
        <OpinionRequestList
          requests={requests}
          filters={filters}
          onFilterChange={setFilters}
          onSelect={(id) => {
            setSelectedId(id);
            setView('detail');
          }}
          onNew={() => setView('new')}
          onSearch={() => setView('search')}
          loading={loading}
        />
      )}

      {view === 'new' && (
        <NewOpinionRequestForm
          onCancel={() => setView('list')}
          onCreate={async (data) => {
            const request = await api.createOpinionRequest(data);
            setSelectedId(request.id);
            setView('detail');
          }}
        />
      )}

      {view === 'detail' && (
        <OpinionRequestDetail requestId={selectedId} onBack={() => setView('list')} onChanged={loadRequests} />
      )}

      {view === 'search' && <OpinionSearch onBack={() => setView('list')} />}
    </>
  );
}
