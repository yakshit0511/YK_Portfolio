import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  tone?: 'default' | 'warning' | 'danger';
  action?: ReactNode;
}

export function StatCard({ label, value, tone = 'default', action }: StatCardProps) {
  return (
    <div className={[
      'rounded-2xl border p-4',
      tone === 'warning' && 'border-amber-500/30 bg-amber-500/10',
      tone === 'danger' && 'border-red-500/30 bg-red-500/10',
      tone === 'default' && 'border-slate-700 bg-slate-900/60',
    ].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-400">{label}</div>
          <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
        </div>
        {action}
      </div>
    </div>
  );
}
