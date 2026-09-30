interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <button
      type="button"
      aria-label={label ?? 'Toggle'}
      className="flex items-center gap-3 text-left"
      onClick={() => onChange(!checked)}
    >
      <span
        className={[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-blue-500' : 'bg-slate-700',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
        />
      </span>
      {(label || description) && (
        <span className="flex flex-col">
          {label ? <span className="text-sm font-medium text-slate-100">{label}</span> : null}
          {description ? <span className="text-xs text-slate-400">{description}</span> : null}
        </span>
      )}
    </button>
  );
}
