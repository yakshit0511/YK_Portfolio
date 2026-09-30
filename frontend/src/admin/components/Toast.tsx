import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, type, message }]);
    window.setTimeout(() => dismissToast(id), 4000);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[999] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            aria-live="polite"
            className={[
              'rounded-lg border px-3 py-2 text-sm shadow-lg backdrop-blur-sm',
              item.type === 'success' && 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100',
              item.type === 'error' && 'border-red-500/40 bg-red-500/15 text-red-100',
              item.type === 'info' && 'border-blue-500/40 bg-slate-800/90 text-slate-100',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="leading-5">{item.message}</span>
              <button
                type="button"
                className="rounded-md p-1 text-current/80 hover:text-current"
                onClick={() => dismissToast(item.id)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
