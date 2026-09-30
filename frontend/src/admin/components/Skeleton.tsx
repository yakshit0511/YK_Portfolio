export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={['animate-pulse rounded-md bg-slate-700/60', className].join(' ')} />;
}
