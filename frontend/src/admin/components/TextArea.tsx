interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, className = '', ...props }: TextAreaProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-slate-200">
      <span className="font-medium text-slate-100">{label}</span>
      <textarea
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
