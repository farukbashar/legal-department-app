import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Scale,
  Gavel,
  Handshake,
  Archive,
  ShieldCheck,
  Landmark,
  BookOpen,
  Users as UsersIcon,
  LogOut,
} from 'lucide-react';
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
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'contracts', label: 'Contract management', icon: FileText },
  { key: 'legal-opinions', label: 'Legal opinions', icon: Scale },
  { key: 'litigation', label: 'Litigation', icon: Gavel },
  { key: 'mous', label: 'MoUs', icon: Handshake },
  { key: 'board-resolutions', label: 'Board resolutions', icon: Archive },
  { key: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { key: 'recovery', label: 'Recovery & debt', icon: Landmark },
  { key: 'knowledge-base', label: 'Knowledge base', icon: BookOpen },
];

export default function App() {
  const [authed, setAuthed] = useState(hasToken());
  const [module, setModule] = useState('dashboard');
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  if (!authed) {
    return <Login onLoggedIn={() => setAuthed(true)} />;
  }

  const visibleModules = isAdmin
    ? [...MODULES, { key: 'users', label: 'Users', icon: UsersIcon }]
    : MODULES;

  const activeModule = visibleModules.find((m) => m.key === module);

  return (
    <div className="min-h-screen bg-paper flex">
      <aside className="w-64 shrink-0 bg-white border-r border-ink/[0.06] flex flex-col">
        <div className="px-5 py-5 border-b border-ink/[0.06]">
          <div className="flex items-center gap-2.5">
            <img src="/rea-logo.png" alt="REA" className="w-9 h-9 object-contain" />
            <div>
              <p className="text-sm font-semibold text-ink leading-tight">REA Legal</p>
              <p className="text-xs text-ink-light">Department</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleModules.map((m) => {
            const Icon = m.icon;
            const active = module === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setModule(m.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brass text-white shadow-card'
                    : 'text-ink-light hover:bg-paper hover:text-ink'
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {m.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-ink/[0.06]">
          {currentUser && (
            <div className="px-3 mb-2">
              <p className="text-sm font-medium text-ink truncate">{currentUser.fullName}</p>
              <p className="text-xs text-ink-light truncate">{currentUser.role?.replace('_', ' ')}</p>
            </div>
          )}
          <button
            onClick={() => {
              clearToken();
              setAuthed(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-medium text-ink-light hover:bg-paper hover:text-ink transition-colors"
          >
            <LogOut size={17} strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <img
          src="/rea-logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute -right-40 -bottom-40 w-[900px] h-[900px] object-contain opacity-[0.04] z-0"
        />

        <header className="h-14 shrink-0 bg-white border-b border-ink/[0.06] flex items-center px-8 relative z-10">
          <p className="text-sm font-medium text-ink-light">{activeModule?.label}</p>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
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
    </div>
  );
}
