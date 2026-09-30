import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIdleLogout } from '../hooks/useIdleLogout';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AdminLayoutProps {
  title: string;
  children: ReactNode;
  unreadCount?: number;
}

export function AdminLayout({ title, children, unreadCount = 0 }: AdminLayoutProps) {
  const location = useLocation();
  const { user, logout, sessionExpiredMessage, setSessionExpiredMessage } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { showWarning, keepSignedIn } = useIdleLogout({
    onLogout: async () => {
      setSessionExpiredMessage('Your session expired. Please sign in again.');
      await logout();
    },
  });

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const topbarRight = useMemo(() => {
    if (!user?.email) return null;
    return <span className="hidden rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 md:inline-flex">{user.email}</span>;
  }, [user?.email]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Sidebar open={sidebarOpen} unreadCount={unreadCount} onClose={() => setSidebarOpen(false)} />
        <div className="md:pl-72">
          <Topbar title={title} email={user?.email} onLogout={() => void logout()} onMenuToggle={() => setSidebarOpen((value) => !value)} rightSlot={topbarRight} />
          <main className="p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {children}
              </motion.div>
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showWarning ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="fixed bottom-4 right-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-amber-500/40 bg-slate-900 p-3 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Session timeout warning</p>
                <p className="mt-1 text-xs text-slate-300">You will be signed out soon due to inactivity.</p>
              </div>
              <button type="button" onClick={keepSignedIn} className="rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-medium text-slate-900 hover:bg-amber-400">
                Stay signed in
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {sessionExpiredMessage ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg border border-blue-500/30 bg-slate-900 px-3 py-2 text-sm text-blue-100 shadow-lg">
          {sessionExpiredMessage}
        </div>
      ) : null}
    </>
  );
}
