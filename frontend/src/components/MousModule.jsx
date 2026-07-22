import { useEffect, useState } from 'react';
import { api } from '../api.js';
import MouList from './MouList.jsx';
import NewMouForm from './NewMouForm.jsx';
import MouDetail from './MouDetail.jsx';

export default function MousModule() {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedId, setSelectedId] = useState(null);
  const [mous, setMous] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '' });

  const loadMous = async () => {
    setLoading(true);
    try {
      const data = await api.listMous({
        ...(filters.status ? { status: filters.status } : {}),
      });
      setMous(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') loadMous();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, filters]);

  return (
    <>
      {view === 'list' && (
        <MouList
          mous={mous}
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
        <NewMouForm
          onCancel={() => setView('list')}
          onCreate={async (data) => {
            const mou = await api.createMou(data);
            setSelectedId(mou.id);
            setView('detail');
          }}
        />
      )}

      {view === 'detail' && (
        <MouDetail mouId={selectedId} onBack={() => setView('list')} onChanged={loadMous} />
      )}
    </>
  );
}
