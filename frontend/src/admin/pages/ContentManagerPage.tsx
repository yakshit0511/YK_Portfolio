import { ArrowRight, BriefcaseBusiness, FileText, GraduationCap, LayoutGrid, ListFilter, PencilRuler, Settings, UserRound, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAdminLoginPath } from '../api/adminApi';

type ModuleCard = {
  key: string;
  label: string;
  description: string;
  to: string;
  status: string;
  icon: LucideIcon;
};

const contentModules: ModuleCard[] = [
  { key: 'profile', label: 'Profile & About', description: 'Edit your name, intro, resume, social links, SEO and theme settings.', to: '/profile', status: 'CRUD ready', icon: UserRound },
  { key: 'projects', label: 'Projects', description: 'Create, edit, reorder, feature and hide projects with media support.', to: '/projects', status: 'CRUD ready', icon: PencilRuler },
  { key: 'skills', label: 'Skills', description: 'Manage skill categories, levels, visibility and bulk inserts.', to: '/skills', status: 'CRUD ready', icon: Wrench },
  { key: 'education', label: 'Education', description: 'Add degrees, institutions, grades and academic details.', to: '/education', status: 'CRUD ready', icon: GraduationCap },
  { key: 'experience', label: 'Experience', description: 'Manage roles, employers, timelines and work highlights.', to: '/experience', status: 'CRUD ready', icon: BriefcaseBusiness },
  { key: 'sections', label: 'Sections', description: 'Toggle public sections, reorder them and control visibility.', to: '/sections', status: 'CRUD ready', icon: ListFilter },
  { key: 'contact', label: 'Contact & Inquiry', description: 'Review contact messages, statuses, email sending and support workflows.', to: '/inquiries', status: 'CRUD ready', icon: FileText },
  { key: 'settings', label: 'Settings', description: 'Update account access, password and admin preferences.', to: '/settings', status: 'CRUD ready', icon: Settings },
  { key: 'dashboard', label: 'Dashboard', description: 'Overview of quick stats, recent activity and admin shortcuts.', to: '/dashboard', status: 'Overview', icon: LayoutGrid },
];

export function ContentManagerPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Admin content</p>
            <h1 className="mt-2 text-2xl font-bold text-white">Portfolio content manager</h1>
          </div>
          <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-200">Future-proof CRUD hub</div>
        </div>
        <p className="mt-4 max-w-3xl text-sm text-slate-300">
          This module centralizes all editable portfolio sections. If a new user-facing section is added later, add it here and link it to a matching admin CRUD route to make it editable immediately.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contentModules.map(({ key, label, description, to, status, icon: Icon }) => (
          <Link
            key={key}
            to={`${getAdminLoginPath()}${to}`}
            className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-blue-500/40 hover:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <Icon size={18} />
              </div>
              <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">{status}</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">{label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-300">
              Open editor <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-white">Pattern for future sections</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-200">
          <pre className="whitespace-pre-wrap text-xs text-slate-300">{`const section = {
  key: 'newSection',
  label: 'New Section',
  description: 'Add the public UI section and its admin CRUD page.',
  to: '/new-section',
  status: 'CRUD ready'
};`}</pre>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          When a new portfolio section is added to the public site, the same pattern is used here: add the section config, connect its route, and enable create/update/delete controls in the admin module.
        </p>
      </div>
    </div>
  );
}
