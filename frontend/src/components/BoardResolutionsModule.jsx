import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ResolutionList from './ResolutionList.jsx';
import NewResolutionForm from './NewResolutionForm.jsx';
import ResolutionDetail from './ResolutionDetail.jsx';

export default function BoardResolutionsModule({ jumpToId, onJumpHandled }) {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedId, setSelectedId] = useState(null);
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (jumpToId) {
      setSelectedId(jumpToId);
      setView('detail');
      onJumpHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToId]);

  const loadResolutions = async () => {
    setLoading(true);
    try {
      const data = await api.listResolutions({
        ...(q ? { q } : {}),
        ...(showArchived ? { archived: 'true' } : {}),
      });
      setResolutions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view !== 'list') return;
    const timeout = setTimeout(loadResolutions, 250); // light debounce on search typing
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, q, showArchived]);

  return (
    <>
      {view === 'list' && (
        <ResolutionList
          resolutions={resolutions}
          q={q}
          onQChange={setQ}
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
          onSelect={(id) => {
            setSelectedId(id);
            setView('detail');
          }}
          onNew={() => setView('new')}
          loading={loading}
        />
      )}

      {view === 'new' && (
        <NewResolutionForm
          onCancel={() => setView('list')}
          onCreate={async (data) => {
            const r = await api.createResolution(data);
            setSelectedId(r.id);
            setView('detail');
          }}
        />
      )}

      {view === 'detail' && (
        <ResolutionDetail resolutionId={selectedId} onBack={() => setView('list')} onChanged={loadResolutions} />
      )}
    </>
  );
}
