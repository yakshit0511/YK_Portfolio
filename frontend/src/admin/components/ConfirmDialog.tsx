interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onClose, onConfirm }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-300">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
