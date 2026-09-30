import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightSlot?: ReactNode;
}

export function Field({ label, error, rightSlot, className = '', ...props }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-slate-200">
      <span className="flex items-center justify-between gap-3">
        <span className="font-medium text-slate-100">{label}</span>
        {rightSlot}
      </span>
      <input
        {...props}
        className={[
          'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 transition focus:border-blue-400 focus:outline-none',
          error ? 'border-red-500/60' : '',
          className,
        ].join(' ')}
      />
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-slate-200">
      <span className="font-medium text-slate-100">{label}</span>
      <select
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
        className={[
          'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-white focus:border-blue-400 focus:outline-none',
          error ? 'border-red-500/60' : '',
        ].join(' ')}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
