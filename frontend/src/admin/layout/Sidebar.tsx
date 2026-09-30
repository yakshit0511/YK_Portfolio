import { Award, BarChart3, BriefcaseBusiness, Building2, FileText, GraduationCap, LayoutGrid, ListFilter, LockKeyhole, PencilRuler, Settings, UserRound, Wrench } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { getEnvAdminPath } from '../api/adminApi';

const basePath = getEnvAdminPath();

const navItems = [
  { label: 'Dashboard', to: `${basePath}/dashboard`, icon: LayoutGrid },
  { label: 'Content manager', to: `${basePath}/content-manager`, icon: ListFilter },
  { label: 'Profile & About', to: `${basePath}/profile`, icon: UserRound },
  { label: 'Projects', to: `${basePath}/projects`, icon: PencilRuler },
  { label: 'Certificates', to: `${basePath}/certificates`, icon: Award },
  { label: 'Insights', to: `${basePath}/insights`, icon: BarChart3 },
  { label: 'Skills', to: `${basePath}/skills`, icon: Wrench },
  { label: 'Education', to: `${basePath}/education`, icon: GraduationCap },
  { label: 'Experience', to: `${basePath}/experience`, icon: BriefcaseBusiness },
  { label: 'Sections', to: `${basePath}/sections`, icon: ListFilter },
  { label: 'Inquiries', to: `${basePath}/inquiries`, icon: FileText },
  { label: 'Settings', to: `${basePath}/settings`, icon: Settings },
];

export function Sidebar({ open, onClose, unreadCount = 0 }: { open: boolean; onClose: () => void; unreadCount?: number }) {
  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-800 bg-slate-950/95 p-4 backdrop-blur-md transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="mb-6 flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
            <Building2 size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Yakshit Admin</div>
            <div className="text-xs text-slate-400">Portfolio control</div>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === `${basePath}/dashboard`}
              onClick={onClose}
              className={({ isActive }) => [
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                isActive ? 'bg-blue-600/20 text-white ring-1 ring-blue-500/40' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
              ].join(' ')}
            >
              <Icon size={16} />
              <span>{label}</span>
              {label === 'Inquiries' && unreadCount > 0 ? (
                <span className="ml-auto inline-flex min-w-5 justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-slate-950">{unreadCount}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-400">
          <div className="mb-1 flex items-center gap-2 text-slate-200"><LockKeyhole size={14} /> Secure admin</div>
          <div>Session is kept in cookie memory only.</div>
        </div>
      </aside>
      <div className={`fixed inset-0 z-20 bg-slate-950/50 md:hidden ${open ? 'block' : 'hidden'}`} onClick={onClose} />
    </>
  );
}
