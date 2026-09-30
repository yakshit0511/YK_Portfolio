import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { Field } from '../components/Field';
import { TextArea } from '../components/TextArea';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';
import { createEducation, deleteEducation, getEducation, reorderEducation, updateEducation, type EducationData } from '../api/adminApi';

export function EducationPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<EducationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<EducationData | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EducationData | null>(null);

  const loadItems = async () => {
    try {
      const result = await getEducation();
      setItems(result);
    } catch (error) {
      showToast((error as Error).message || 'Unable to load education.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, []);

  const submit = async () => {
    if (!draft?.institution?.trim()) {
      showToast('Institution is required.', 'error');
      return;
    }
    try {
      if (draft._id) {
        await updateEducation(draft._id, { ...draft, institution: draft.institution.trim() });
      } else {
        await createEducation({ ...draft, institution: draft.institution.trim() });
      }
      setDraft(null);
      await loadItems();
      showToast('Saved. Your live site updates within a minute.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Unable to save education.', 'error');
    }
  };

  const moveItem = async (item: EducationData, direction: 'up' | 'down') => {
    const index = items.findIndex((entry) => entry._id === item._id);
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    try {
      await reorderEducation(reordered.map((entry, idx) => ({ id: entry._id ?? '', order: idx })));
      await loadItems();
    } catch (error) {
      showToast((error as Error).message || 'Unable to reorder education.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete?._id) return;
    try {
      await deleteEducation(pendingDelete._id);
      setPendingDelete(null);
      await loadItems();
      showToast('Education item deleted.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Delete failed.', 'error');
    }
  };

  if (loading) return <div className="space-y-3"><div className="h-28 animate-pulse rounded-xl bg-slate-800" /><div className="h-28 animate-pulse rounded-xl bg-slate-800" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Education</h2>
          <button type="button" onClick={() => setDraft({ institution: '', degree: '', field: '', startYear: '', endYear: '', currentSemester: '', grade: '', gradeNote: '', description: '', visible: true })} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white"><Plus size={15} /> Add entry</button>
        </div>
        <p className="mt-2 text-sm text-slate-400">Portfolio CGPA comes from Grade on the first visible education entry. Use the arrows to change its order, and make sure Visible is enabled.</p>

        {draft ? (
          <div className="mt-5 space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Institution" value={draft.institution ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, institution: event.target.value } : current)} />
              <Field label="Degree" value={draft.degree ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, degree: event.target.value } : current)} />
              <Field label="Field" value={draft.field ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, field: event.target.value } : current)} />
              <Field label="Current semester" value={draft.currentSemester ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, currentSemester: event.target.value } : current)} />
              <Field label="Start year" value={String(draft.startYear ?? '')} onChange={(event) => setDraft((current) => current ? { ...current, startYear: event.target.value } : current)} />
              <Field label="End year" value={String(draft.endYear ?? '')} onChange={(event) => setDraft((current) => current ? { ...current, endYear: event.target.value } : current)} />
              <Field label="Grade" value={draft.grade ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, grade: event.target.value } : current)} />
              <Field label="Grade note" value={draft.gradeNote ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, gradeNote: event.target.value } : current)} />
            </div>
            <TextArea label="Description" rows={4} value={draft.description ?? ''} onChange={(event) => setDraft((current) => current ? { ...current, description: event.target.value } : current)} />
            <Toggle checked={Boolean(draft.visible)} onChange={(value) => setDraft((current) => current ? { ...current, visible: value } : current)} label="Visible" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDraft(null)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">Cancel</button>
              <button type="button" onClick={() => void submit()} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">Save</button>
            </div>
          </div>
        ) : null}
      </div>

      {items.length === 0 ? <EmptyState title="No education entries" description="Add an education entry to show your academic background." actionLabel="Add entry" onAction={() => setDraft({ institution: '', degree: '', field: '', startYear: '', endYear: '', currentSemester: '', grade: '', gradeNote: '', description: '', visible: true })} /> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item._id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold text-white">{item.institution}</div>
                <div className="text-sm text-slate-300">{item.degree}{item.field ? ` · ${item.field}` : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={Boolean(item.visible)} onChange={async (value) => { const next = { ...item, visible: value }; await updateEducation(item._id ?? '', next); await loadItems(); }} label="Visible" />
                <button type="button" onClick={() => setDraft(item)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200"><Pencil size={14} /></button>
                <button type="button" onClick={() => void moveItem(item, 'up')} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200"><ArrowUp size={14} /></button>
                <button type="button" onClick={() => void moveItem(item, 'down')} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200"><ArrowDown size={14} /></button>
                <button type="button" onClick={() => setPendingDelete(item)} className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog open={Boolean(pendingDelete)} title="Delete education" message="This cannot be undone." confirmLabel="Delete education" onClose={() => setPendingDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
