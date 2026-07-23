import { useState } from 'react';
import { hasToken, clearToken, getCurrentUser } from './api.js';
import Login from './components/Login.jsx';
import DashboardModule from './components/DashboardModule.jsx';
import ContractsModule from './components/ContractsModule.jsx';
import LegalOpinionsModule from './components/LegalOpinionsModule.jsx';
import LitigationModule from './components/LitigationModule.jsx';
import MousModule from './components/MousModule.jsx';
import BoardResolutionsModule from './components/BoardResolutionsModule.jsx';
import ComplianceModule from './components/ComplianceModule.jsx';
import RecoveryModule from './components/RecoveryModule.jsx';
import KnowledgeBaseModule from './components/KnowledgeBaseModule.jsx';
import UsersModule from './components/UsersModule.jsx';

const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'contracts', label: 'Contract management' },
  { key: 'legal-opinions', label: 'Legal opinions' },
  { key: 'litigation', label: 'Litigation' },
  { key: 'mous', label: 'MoUs' },
  { key: 'board-resolutions', label: 'Board resolutions' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'recovery', label: 'Recovery & debt' },
  { key: 'knowledge-base', label: 'Knowledge base' },
];

export default function App() {
  const [authed, setAuthed] = useState(hasToken());
  const [module, setModule] = useState('dashboard');
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  if (!authed) {
    return <Login onLoggedIn={() => setAuthed(true)} />;
  }

  const visibleModules = isAdmin ? [...MODULES, { key: 'users', label: 'Users' }] : MODULES;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/15 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-serif font-semibold text-ink">REA Legal Department</span>
          <nav className="flex gap-1 flex-wrap">
            {visibleModules.map((m) => (
              <button
                key={m.key}
                onClick={() => setModule(m.key)}
                className={`text-xs font-mono uppercase tracking-wide px-3 py-1.5 rounded-sm ${
                  module === m.key ? 'bg-ink text-paper' : 'text-ink-light/70 hover:bg-ink/5'
                }`}
              >
                {m.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => {
              clearToken();
              setAuthed(false);
            }}
            className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {module === 'dashboard' && <DashboardModule />}
        {module === 'contracts' && <ContractsModule />}
        {module === 'legal-opinions' && <LegalOpinionsModule />}
        {module === 'litigation' && <LitigationModule />}
        {module === 'mous' && <MousModule />}
        {module === 'board-resolutions' && <BoardResolutionsModule />}
        {module === 'compliance' && <ComplianceModule />}
        {module === 'recovery' && <RecoveryModule />}
        {module === 'knowledge-base' && <KnowledgeBaseModule />}
        {module === 'users' && isAdmin && <UsersModule />}
      </main>
    </div>
  );
}
