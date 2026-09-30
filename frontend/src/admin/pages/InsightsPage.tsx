import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { getInsights, type InsightsData } from '../api/adminApi';
import { StatCard } from '../components/StatCard';

export function InsightsPage() {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getInsights(range).then((result) => { if (active) { setData(result); setError(''); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load insights.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [range]);

  const maxViews = Math.max(1, ...(data?.daily.map((day) => day.views) ?? [1]));
  const totals = data?.totals;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-400">Aggregated activity from visitors who opted in to anonymous analytics.</p>
      <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1" role="group" aria-label="Insights date range">
        {([7, 30, 90] as const).map((value) => <button type="button" key={value} aria-pressed={range === value} onClick={() => setRange(value)} className={`rounded-md px-3 py-1.5 text-xs ${range === value ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>{value} days</button>)}
      </div>
    </div>
    {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Page views" value={loading ? '…' : totals?.views ?? 0} />
      <StatCard label="Daily unique visitors" value={loading ? '…' : totals?.uniqueVisitors ?? 0} />
      <StatCard label="Project link clicks" value={loading ? '…' : totals?.projectLinkClicks ?? 0} />
      <StatCard label="Resume downloads" value={loading ? '…' : totals?.resumeDownloads ?? 0} />
    </div>
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="text-base font-semibold text-white">Daily page views</h2>
      <div className="mt-5 flex h-48 items-end gap-1 overflow-x-auto border-b border-slate-700 pb-1" aria-label={`Daily page views during the last ${range} days`}>
        {(data?.daily ?? []).map((day) => <div key={day.day} className="group flex h-full min-w-4 flex-1 flex-col justify-end" title={`${day.day}: ${day.views} views`}><span className="mb-1 text-center text-[9px] text-slate-400 opacity-0 group-hover:opacity-100">{day.views}</span><div className="min-h-1 rounded-t bg-cyan-500/80" style={{ height: `${Math.max(2, (day.views / maxViews) * 78)}%` }} /><span className="mt-2 text-center text-[8px] text-slate-500">{day.day.slice(8)}</span></div>)}
        {!data?.daily.length && !loading && <p className="mb-4 text-sm text-slate-400">No visits recorded for this period.</p>}
      </div>
    </section>
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><h2 className="font-semibold text-white">Top projects</h2><div className="mt-3 space-y-3">{data?.topProjects.map((item) => <div key={item.slug} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-slate-200">{item.title}</span><span className="shrink-0 text-xs text-slate-400">{item.views} views · {item.linkClicks} clicks</span></div>)}{!data?.topProjects.length && <p className="text-sm text-slate-400">No project activity yet.</p>}</div></section>
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><h2 className="font-semibold text-white">Referrers</h2><div className="mt-3 space-y-3">{data?.topReferrers.map((item) => <div key={item.host} className="flex justify-between gap-3 text-sm"><span className="truncate text-slate-200">{item.host}</span><span className="text-slate-400">{item.count}</span></div>)}{!data?.topReferrers.length && <p className="text-sm text-slate-400">No referrer data yet.</p>}</div></section>
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><h2 className="font-semibold text-white">Other activity</h2><div className="mt-3 space-y-3 text-sm text-slate-300"><p>Project views <b className="float-right text-white">{totals?.projectViews ?? 0}</b></p><p>Social clicks <b className="float-right text-white">{totals?.socialClicks ?? 0}</b></p><p>Contact submissions <b className="float-right text-white">{totals?.contactSubmits ?? 0}</b></p><p className="flex items-center gap-2"><Smartphone size={14} /> Mobile <b className="ml-auto text-white">{data?.devices.mobile ?? 0}</b></p><p>Desktop <b className="float-right text-white">{data?.devices.desktop ?? 0}</b></p></div></section>
    </div>
  </div>;
}