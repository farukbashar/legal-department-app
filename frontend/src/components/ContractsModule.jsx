import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ContractList from './ContractList.jsx';
import ContractDetail from './ContractDetail.jsx';
import NewContractForm from './NewContractForm.jsx';

export default function ContractsModule({ jumpToId, onJumpHandled }) {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedId, setSelectedId] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', department: '', archived: '' });

  useEffect(() => {
    if (jumpToId) {
      setSelectedId(jumpToId);
      setView('detail');
      onJumpHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToId]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const data = await api.listContracts({
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.department ? { department: filters.department } : {}),
        ...(filters.archived ? { archived: filters.archived } : {}),
      });
      setContracts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') loadContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, filters]);

  return (
    <>
      {view === 'list' && (
        <ContractList
          contracts={contracts}
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
        <NewContractForm
          onCancel={() => setView('list')}
          onCreate={async (data) => {
            const contract = await api.createContract(data);
            setSelectedId(contract.id);
            setView('detail');
          }}
        />
      )}

      {view === 'detail' && (
        <ContractDetail contractId={selectedId} onBack={() => setView('list')} onChanged={loadContracts} />
      )}
    </>
  );
}
