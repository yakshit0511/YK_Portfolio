interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function SaveBar({ dirty, saving, onSave, onDiscard }: SaveBarProps) {
  if (!dirty) return null;

  return (
    <div className="sticky bottom-4 z-10 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-blue-500/30 bg-slate-900/90 p-3 shadow-lg backdrop-blur-sm">
      <span className="text-sm text-slate-100">You have unsaved changes</span>
      <div className="flex gap-2">
        <button type="button" onClick={onDiscard} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
          Discard
        </button>
        <button type="button" disabled={saving} onClick={onSave} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-70">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
