import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Field } from '../components/Field';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';
import { createSkill, deleteSkill, getSkills, reorderSkills, updateSkill, type SkillData } from '../api/adminApi';

const categories = ['Frontend', 'Backend', 'Database', 'Tools & Deployment', 'Other'];

export function SkillsPage() {
  const { showToast } = useToast();
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [bulkText, setBulkText] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = useState<SkillData | null>(null);

  const loadSkills = async () => {
    try {
      const result = await getSkills();
      setSkills(result);
    } catch (error) {
      showToast((error as Error).message || 'Unable to load skills.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadSkills(); }, []);

  const grouped = useMemo(() => categories.map((category) => ({ category, items: skills.filter((skill) => skill.category === category) })), [skills]);
  const publicSkillCount = skills.filter((skill) => skill.visible !== false).length;

  const manageSkill = async (category: string, item?: SkillData) => {
    const inputName = draft[`${category}-${item?._id ?? 'new'}`] || '';
    const value = inputName.trim();
    if (!value) {
      showToast('Skill name is required.', 'error');
      return;
    }
    try {
      if (item) {
        await updateSkill(item._id ?? '', { name: value, level: Number(levels[`${category}-${item._id}`] ?? item.level ?? 0) });
      } else {
        await createSkill({ name: value, category, level: Number(levels[`${category}-new`] ?? 0) });
      }
      setDraft((current) => ({ ...current, [`${category}-${item?._id ?? 'new'}`]: '' }));
      setLevels((current) => ({ ...current, [`${category}-${item?._id ?? 'new'}`]: 0 }));
      await loadSkills();
    } catch (error) {
      showToast((error as Error).message || 'Unable to save skill.', 'error');
    }
  };

  const saveBulk = async (category: string) => {
    const names = (bulkText[category] ?? '').split(/[\n,]+/).map((value) => value.trim()).filter(Boolean);
    if (!names.length) return;
    try {
      await Promise.all(names.map((name) => createSkill({ name, category })));
      setBulkText((current) => ({ ...current, [category]: '' }));
      await loadSkills();
      showToast('Skills added.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Unable to add skill group.', 'error');
    }
  };

  const toggleVisible = async (skill: SkillData) => {
    try {
      await updateSkill(skill._id ?? '', { visible: !skill.visible });
      await loadSkills();
    } catch (error) {
      showToast((error as Error).message || 'Unable to update skill.', 'error');
    }
  };

  const moveSkill = async (skill: SkillData, direction: 'up' | 'down') => {
    const items = skills.filter((item) => item.category === skill.category);
    const index = items.findIndex((item) => item._id === skill._id);
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    const payload = reordered.map((item, idx) => ({ id: item._id ?? '', order: idx }));
    try {
      await reorderSkills(payload);
      await loadSkills();
    } catch (error) {
      showToast((error as Error).message || 'Unable to reorder skills.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete?._id) return;
    try {
      await deleteSkill(pendingDelete._id);
      setPendingDelete(null);
      await loadSkills();
      showToast('Skill deleted.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Delete failed.', 'error');
    }
  };

  if (loading) return <div className="space-y-4"><div className="h-48 animate-pulse rounded-xl bg-slate-800" /><div className="h-48 animate-pulse rounded-xl bg-slate-800" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-slate-300">
        <span className="font-medium text-white">Portfolio Technologies count: {publicSkillCount}.</span> This updates automatically from skills marked Visible.
      </div>
      {grouped.map(({ category, items }) => (
        <div key={category} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{category}</h2>
            <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{items.length} items</span>
          </div>

          <div className="space-y-3">
            {items.length === 0 ? <div className="text-sm text-slate-400">No items in this category yet.</div> : items.map((skill) => (
              <div key={skill._id} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3 md:flex-row md:items-center">
                <div className="flex-1">
                  <input value={draft[`${category}-${skill._id}`] ?? skill.name ?? ''} onChange={(event) => setDraft((current) => ({ ...current, [`${category}-${skill._id}`]: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={100} value={Number(levels[`${category}-${skill._id}`] ?? skill.level ?? 0)} onChange={(event) => setLevels((current) => ({ ...current, [`${category}-${skill._id}`]: Number(event.target.value) }))} />
                  <span className="w-8 text-right text-xs text-slate-200">{Number(levels[`${category}-${skill._id}`] ?? skill.level ?? 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Toggle checked={Boolean(skill.visible)} onChange={() => void toggleVisible(skill)} label="Visible" />
                  <button type="button" onClick={() => void moveSkill(skill, 'up')} className="rounded-lg border border-slate-700 px-2 py-2 text-slate-200"><ArrowUp size={14} /></button>
                  <button type="button" onClick={() => void moveSkill(skill, 'down')} className="rounded-lg border border-slate-700 px-2 py-2 text-slate-200"><ArrowDown size={14} /></button>
                  <button type="button" onClick={() => setPendingDelete(skill)} className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-2 text-red-200"><Trash2 size={14} /></button>
                  <button type="button" onClick={() => void manageSkill(category, skill)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">Save</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <Field label="Add skill" value={draft[`${category}-new`] ?? ''} onChange={(event) => setDraft((current) => ({ ...current, [`${category}-new`]: event.target.value }))} />
            <label className="flex flex-col gap-1.5 text-sm text-slate-200">
              <span className="font-medium text-slate-100">Level</span>
              <input type="range" min={0} max={100} value={Number(levels[`${category}-new`] ?? 0)} onChange={(event) => setLevels((current) => ({ ...current, [`${category}-new`]: Number(event.target.value) }))} />
            </label>
            <button type="button" onClick={() => void manageSkill(category)} className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Add skill</button>
          </div>

          <div className="mt-4">
            <textarea value={bulkText[category] ?? ''} onChange={(event) => setBulkText((current) => ({ ...current, [category]: event.target.value }))} rows={3} className="w-full rounded-lg border border-slate-700 bg-slate-950/40 p-3 text-sm text-white" placeholder="Add several names separated by commas or new lines" />
            <div className="mt-2 flex justify-end">
              <button type="button" onClick={() => void saveBulk(category)} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100"><Plus size={14} /> Add several</button>
            </div>
          </div>
        </div>
      ))}

      <ConfirmDialog open={Boolean(pendingDelete)} title="Delete skill" message="This cannot be undone." confirmLabel="Delete skill" onClose={() => setPendingDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
