import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { Field } from '../components/Field';
import { TextArea } from '../components/TextArea';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';
import { createExperience, deleteExperience, getExperience, reorderExperience, updateExperience, type ExperienceData } from '../api/adminApi';

export function ExperiencePage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ExperienceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<ExperienceData | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ExperienceData | null>(null);

  const loadItems = async () => {
    try {
      const result = await getExperience();
      setItems(result);
    } catch (error) {
      showToast((error as Error).message || 'Unable to load experience.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, []);

  const submit = async () => {
    if (!draft?.company?.trim()) {
      showToast('Company name is required.', 'error');
      return;
    }
    try {
      if (draft._id) {
        await updateExperience(draft._id, { ...draft, company: draft.company.trim() });
      } else {
        await createExperience({ ...draft, company: draft.company.trim() });
      }
      setDraft(null);
      await loadItems();
      showToast('Saved. Your live site updates within a minute.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Unable to save experience.', 'error');
    }
  };

  const moveItem = async (item: ExperienceData, direction: 'up' | 'down') => {
    const index = items.findIndex((entry) => entry._id === item._id);
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    try {
      await reorderExperience(reordered.map((entry, idx) => ({ id: entry._id ?? '', order: idx })));
      await loadItems();
    } catch (error) {
      showToast((error as Error).message || 'Unable to reorder experience.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete?._id) return;
    try {
      await deleteExperience(pendingDelete._id);
      setPendingDelete(null);
      await loadItems();
      showToast('Experience item deleted.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Delete failed.', 'error');
    }
  };

  if (loading) return <div className="space-y-3"><div className="h-28 animate-pulse rounded-xl bg-slate-800" /><div className="h-28 animate-pulse rounded-xl bg-slate-800" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Experience</h2>
          <button type="button" onClick={() => setDraft({ company: '', role: '', startDate: '', endDate: '', current: false, description: '', visible: true })} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white"><Plus size={15} /> Add entry</button>
        </div>

        {draft ? (
          <div className="mt-5 space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company" value={draft.company ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, company: event.target.value } : current)} />
              <Field label="Role" value={draft.role ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, role: event.target.value } : current)} />
              <Field label="Start date" value={draft.startDate ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, startDate: event.target.value } : current)} />
              <Field label="End date" value={draft.endDate ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, endDate: event.target.value } : current)} />
            </div>
            <TextArea label="Description" rows={5} value={draft.description ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, description: event.target.value } : current)} />
            <div className="flex flex-wrap items-center gap-4">
              <Toggle checked={Boolean(draft.current)} onChange={(value) => setDraft((current) => current ? { ...current, current: value } : current)} label="Current role" />
              <Toggle checked={Boolean(draft.visible)} onChange={(value) => setDraft((current) => current ? { ...current, visible: value } : current)} label="Visible" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDraft(null)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">Cancel</button>
              <button type="button" onClick={() => void submit()} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">Save</button>
            </div>
          </div>
        ) : null}
      </div>

      {items.length === 0 ? <EmptyState title="No experience entries" description="Add your career timeline to tell your story." actionLabel="Add entry" onAction={() => setDraft({ company: '', role: '', startDate: '', endDate: '', current: false, description: '', visible: true })} /> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item._id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-lg font-semibold text-white">{item.role} · {item.company}</div>
                <div className="text-sm text-slate-300">{item.startDate} – {item.current ? 'Present' : item.endDate}</div>
                <p className="mt-2 text-sm text-slate-300">{item.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={Boolean(item.visible)} onChange={async (value) => { await updateExperience(item._id ?? '', { visible: value }); await loadItems(); }} label="Visible" />
                <button type="button" onClick={() => setDraft(item)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200"><Pencil size={14} /></button>
                <button type="button" onClick={() => void moveItem(item, 'up')} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200"><ArrowUp size={14} /></button>
                <button type="button" onClick={() => void moveItem(item, 'down')} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200"><ArrowDown size={14} /></button>
                <button type="button" onClick={() => setPendingDelete(item)} className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog open={Boolean(pendingDelete)} title="Delete experience" message="This cannot be undone." confirmLabel="Delete experience" onClose={() => setPendingDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
