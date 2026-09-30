import { LogOut, Menu, ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';

interface TopbarProps {
  title: string;
  email?: string;
  onLogout: () => void;
  onMenuToggle: () => void;
  rightSlot?: ReactNode;
}

export function Topbar({ title, email, onLogout, onMenuToggle, rightSlot }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 md:hidden" aria-label="Open menu" onClick={onMenuToggle}>
            <Menu size={18} />
          </button>
          <h1 className="text-lg font-semibold text-white md:text-xl">{title}</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {rightSlot}
          <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 md:inline-flex hover:bg-slate-800">
            <ExternalLink size={14} />
            View site
          </a>
          {email ? <span className="hidden rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 md:inline-flex">{email}</span> : null}
          <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
