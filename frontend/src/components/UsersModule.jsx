import { useEffect, useState } from 'react';
import { api } from '../api.js';
import UserList from './UserList.jsx';
import NewUserForm from './NewUserForm.jsx';
import UserDetail from './UserDetail.jsx';

export default function UsersModule() {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedId, setSelectedId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (error) {
    return <p className="text-status-rejected text-sm">{error}</p>;
  }

  return (
    <>
      {view === 'list' && (
        <UserList
          users={users}
          onSelect={(id) => {
            setSelectedId(id);
            setView('detail');
          }}
          onNew={() => setView('new')}
          loading={loading}
        />
      )}

      {view === 'new' && (
        <NewUserForm
          onCancel={() => setView('list')}
          onCreate={async (data) => {
            await api.registerUser(data);
            await loadUsers();
            setView('list');
          }}
        />
      )}

      {view === 'detail' && (
        <UserDetail
          userId={selectedId}
          users={users}
          onBack={() => setView('list')}
          onChanged={loadUsers}
        />
      )}
    </>
  );
}
