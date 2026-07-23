import { useEffect, useState } from 'react';
import { api } from '../api.js';
import KnowledgeItemList from './KnowledgeItemList.jsx';
import NewKnowledgeItemForm from './NewKnowledgeItemForm.jsx';
import KnowledgeItemDetail from './KnowledgeItemDetail.jsx';

export default function KnowledgeBaseModule({ jumpToId, onJumpHandled }) {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedId, setSelectedId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: '', q: '' });

  useEffect(() => {
    if (jumpToId) {
      setSelectedId(jumpToId);
      setView('detail');
      onJumpHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToId]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await api.listKnowledgeItems({
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.q ? { q: filters.q } : {}),
      });
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view !== 'list') return;
    const timeout = setTimeout(loadItems, 250); // light debounce on search typing
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, filters]);

  return (
    <>
      {view === 'list' && (
        <KnowledgeItemList
          items={items}
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
        <NewKnowledgeItemForm
          onCancel={() => setView('list')}
          onCreate={async (data) => {
            const item = await api.createKnowledgeItem(data);
            setSelectedId(item.id);
            setView('detail');
          }}
        />
      )}

      {view === 'detail' && (
        <KnowledgeItemDetail itemId={selectedId} onBack={() => setView('list')} onChanged={loadItems} />
      )}
    </>
  );
}
