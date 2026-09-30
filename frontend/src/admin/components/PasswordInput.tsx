import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function PasswordInput({ label, error, className = '', ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <label className="flex flex-col gap-1.5 text-sm text-slate-200">
      <span className="font-medium text-slate-100">{label}</span>
      <div className="relative">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          className={[
            'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none',
            error ? 'border-red-500/60' : '',
            className,
          ].join(' ')}
        />
        <button
          type="button"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow((value) => !value)}
          className="absolute inset-y-0 right-2 flex items-center text-slate-300 hover:text-white"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
