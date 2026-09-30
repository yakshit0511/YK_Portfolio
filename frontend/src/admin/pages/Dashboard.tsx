import { ArrowRight, BriefcaseBusiness, FolderKanban, LayoutGrid, MessageSquare, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminLoginPath, getDashboard, type DashboardData } from '../api/adminApi';
import { StatCard } from '../components/StatCard';
import { formatRelativeTime } from '../utils/format';

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getDashboard()
      .then((result) => { if (active) setData(result); })
      .catch(() => { if (active) setData(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="space-y-4"><div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5"><div className="h-28 animate-pulse rounded-2xl bg-slate-800" /><div className="h-28 animate-pulse rounded-2xl bg-slate-800" /><div className="h-28 animate-pulse rounded-2xl bg-slate-800" /><div className="h-28 animate-pulse rounded-2xl bg-slate-800" /><div className="h-28 animate-pulse rounded-2xl bg-slate-800" /></div></div>;
  }

  const dashboard = data ?? {
    projects: 0,
    skills: 0,
    unreadInquiries: 0,
    totalInquiries: 0,
    failedEmails: 0,
    recentInquiries: [],
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Projects" value={dashboard.projects} />
        <StatCard label="Skills" value={dashboard.skills} />
        <StatCard label="Unread inquiries" value={dashboard.unreadInquiries} />
        <StatCard label="Total inquiries" value={dashboard.totalInquiries} />
        <StatCard label="Failed emails" value={dashboard.failedEmails} tone={dashboard.failedEmails > 0 ? 'warning' : 'default'} action={dashboard.failedEmails > 0 ? <Link to={`${getAdminLoginPath()}/inquiries?emailFailed=true`} className="text-xs text-amber-300">Filter</Link> : null} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent inquiries</h2>
            <Link to={`${getAdminLoginPath()}/inquiries`} className="inline-flex items-center gap-1 text-sm text-blue-300">Open all <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            {dashboard.recentInquiries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">No inquiries yet.</div>
            ) : dashboard.recentInquiries.map((item) => (
              <Link key={item._id} to={`${getAdminLoginPath()}/inquiries`} className="block rounded-xl border border-slate-800 bg-slate-950/40 p-3 transition hover:border-blue-500/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="mt-1 text-sm text-slate-300">{item.subject || item.message.slice(0, 60)}</div>
                  </div>
                  <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">{item.status}</span>
                </div>
                <div className="mt-2 text-xs text-slate-400">{formatRelativeTime(item.createdAt)} </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">Quick actions</h2>
          <div className="mt-4 space-y-2">
            <Link to={`${getAdminLoginPath()}/content-manager`} className="flex items-center gap-2 rounded-lg bg-slate-800/80 p-2.5 text-sm text-slate-200 hover:bg-slate-800"><LayoutGrid size={16} /> Content manager</Link>
            <Link to={`${getAdminLoginPath()}/projects`} className="flex items-center gap-2 rounded-lg bg-slate-800/80 p-2.5 text-sm text-slate-200 hover:bg-slate-800"><FolderKanban size={16} /> Add project</Link>
            <Link to={`${getAdminLoginPath()}/skills`} className="flex items-center gap-2 rounded-lg bg-slate-800/80 p-2.5 text-sm text-slate-200 hover:bg-slate-800"><BriefcaseBusiness size={16} /> Add skill</Link>
            <Link to={`${getAdminLoginPath()}/profile`} className="flex items-center gap-2 rounded-lg bg-slate-800/80 p-2.5 text-sm text-slate-200 hover:bg-slate-800"><MessageSquare size={16} /> Edit about</Link>
            <Link to={`${getAdminLoginPath()}/profile`} className="flex items-center gap-2 rounded-lg bg-slate-800/80 p-2.5 text-sm text-slate-200 hover:bg-slate-800"><ShieldAlert size={16} /> Upload resume</Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-lg font-semibold text-white">Complete your portfolio</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            { label: 'About text', done: true },
            { label: 'Resume uploaded', done: true },
            { label: 'At least 1 project', done: (dashboard.projects > 0) },
            { label: 'Avatar', done: true },
            { label: 'Socials filled', done: true },
            { label: 'Experience added', done: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-200">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full ${item.done ? 'bg-emerald-500' : 'bg-slate-700'} text-[10px] text-white`}>{item.done ? '✓' : '•'}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
