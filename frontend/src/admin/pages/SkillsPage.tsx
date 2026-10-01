import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Field } from '../components/Field';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';
import { createSkill, deleteSkill, getSkills, reorderSkills, updateSkill, type SkillData } from '../api/adminApi';

const categories = ['Frontend', 'Backend', 'Database', 'Tools & Deployment', 'Other'];

interface EditableSkill extends SkillData {
  clientKey: string;
}

const toEditableSkills = (items: SkillData[]): EditableSkill[] => items.map((item) => ({
  ...item,
  clientKey: item._id || `draft-${crypto.randomUUID()}`,
}));

const getSkillPayload = (skill: EditableSkill, order = skill.order ?? 0) => ({
  name: skill.name.trim(),
  category: skill.category,
  level: Math.max(0, Math.min(100, Number(skill.level) || 0)),
  visible: skill.visible !== false,
  order,
});

export function SkillsPage() {
  const { showToast } = useToast();
  const [skills, setSkills] = useState<EditableSkill[]>([]);
  const [savedSkills, setSavedSkills] = useState<EditableSkill[]>([]);
  const [pendingRemovalIds, setPendingRemovalIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [bulkText, setBulkText] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = useState<SkillData | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSkills = useCallback(async () => {
    try {
      const result = toEditableSkills(await getSkills());
      setSkills(result);
      setSavedSkills(result.map((skill) => ({ ...skill })));
      setPendingRemovalIds([]);
    } catch (error) {
      showToast((error as Error).message || 'Unable to load skills.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void loadSkills(); }, [loadSkills]);

  const pendingRemovalSet = useMemo(() => new Set(pendingRemovalIds), [pendingRemovalIds]);
  const activeSkills = useMemo(() => skills.filter((skill) => !pendingRemovalSet.has(skill.clientKey)), [pendingRemovalSet, skills]);
  const grouped = useMemo(() => categories.map((category) => ({
    category,
    items: activeSkills.filter((skill) => skill.category === category).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  })), [activeSkills]);
  const publicSkillCount = activeSkills.filter((skill) => skill.visible !== false).length;
  const hasChanges = pendingRemovalIds.length > 0 || activeSkills.length !== savedSkills.length || activeSkills.some((skill) => {
    const saved = savedSkills.find((item) => item.clientKey === skill.clientKey);
    return !saved || skill.name !== saved.name || skill.category !== saved.category || skill.level !== saved.level || skill.visible !== saved.visible || skill.order !== saved.order;
  }) || Object.values(draft).some((value) => value.trim()) || Object.values(bulkText).some((value) => value.trim());

  const stageSkill = (category: string) => {
    const key = `${category}-new`;
    const value = (draft[key] || '').trim();
    if (!value) {
      showToast('Skill name is required.', 'error');
      return;
    }
    const categoryItems = activeSkills.filter((skill) => skill.category === category);
    setSkills((current) => [...current, {
      clientKey: `draft-${crypto.randomUUID()}`,
      name: value,
      category,
      level: Number(levels[key] ?? 80),
      visible: true,
      order: categoryItems.length,
    }]);
    setDraft((current) => ({ ...current, [key]: '' }));
    setLevels((current) => ({ ...current, [key]: 80 }));
    showToast('Skill staged. Save changes to apply it.', 'success');
  };

  const saveBulk = async (category: string) => {
    const names = (bulkText[category] ?? '').split(/[\n,]+/).map((value) => value.trim()).filter(Boolean);
    if (!names.length) return;
    const categoryItems = activeSkills.filter((skill) => skill.category === category);
    setSkills((current) => [...current, ...names.map((name, index) => ({
      clientKey: `draft-${crypto.randomUUID()}`,
      name,
      category,
      level: 80,
      visible: true,
      order: categoryItems.length + index,
    }))]);
    setBulkText((current) => ({ ...current, [category]: '' }));
    showToast(`${names.length} skills staged. Save changes to apply them.`, 'success');
  };

  const updateDraftSkill = (clientKey: string, updates: Partial<EditableSkill>) => {
    setSkills((current) => current.map((skill) => skill.clientKey === clientKey ? { ...skill, ...updates } : skill));
  };

  const moveSkill = async (skill: SkillData, direction: 'up' | 'down') => {
    const items = [...(grouped.find((group) => group.category === skill.category)?.items ?? [])];
    const clientKey = (skill as EditableSkill).clientKey;
    const index = items.findIndex((item) => item.clientKey === clientKey);
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;
    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
    const ordered = new Map(items.map((item, order) => [item.clientKey, order]));
    setSkills((current) => current.map((item) => ordered.has(item.clientKey) ? { ...item, order: ordered.get(item.clientKey) } : item));
  };

  const stageDelete = () => {
    if (!pendingDelete) return;
    const clientKey = (pendingDelete as EditableSkill).clientKey || pendingDelete._id;
    if (!clientKey) return;
    setPendingRemovalIds((current) => current.includes(clientKey) ? current : [...current, clientKey]);
    setPendingDelete(null);
    showToast('Skill marked for removal. Save changes to apply it.', 'success');
  };

  const saveChanges = async () => {
    if (activeSkills.some((skill) => !skill.name.trim())) {
      showToast('Every skill needs a name before saving.', 'error');
      return;
    }

    const pendingAdds: EditableSkill[] = [];
    for (const category of categories) {
      const categoryCount = activeSkills.filter((skill) => skill.category === category).length;
      const newKey = `${category}-new`;
      const typedName = (draft[newKey] || '').trim();
      if (typedName) {
        pendingAdds.push({
          clientKey: `draft-${crypto.randomUUID()}`,
          name: typedName,
          category,
          level: Number(levels[newKey] ?? 80),
          visible: true,
          order: categoryCount + pendingAdds.filter((skill) => skill.category === category).length,
        });
      }
      const bulkNames = (bulkText[category] ?? '').split(/[\n,]+/).map((value) => value.trim()).filter(Boolean);
      for (const name of bulkNames) {
        pendingAdds.push({
          clientKey: `draft-${crypto.randomUUID()}`,
          name,
          category,
          level: 80,
          visible: true,
          order: categoryCount + pendingAdds.filter((skill) => skill.category === category).length,
        });
      }
    }

    setSaving(true);
    let working = [...activeSkills, ...pendingAdds];
    let baseline = [...savedSkills];
    setSkills([...working, ...skills.filter((skill) => pendingRemovalSet.has(skill.clientKey))]);
    setDraft({});
    setLevels({});
    setBulkText({});

    try {
      for (let index = 0; index < working.length; index += 1) {
        const skill = working[index];
        const payload = getSkillPayload(skill);
        const saved = baseline.find((item) => item.clientKey === skill.clientKey);

        if (!skill._id) {
          const created = await createSkill(payload);
          const persisted = { ...created, clientKey: skill.clientKey };
          working[index] = persisted;
          baseline.push(persisted);
        } else if (!saved || skill.name !== saved.name || skill.category !== saved.category || skill.level !== saved.level || skill.visible !== saved.visible || skill.order !== saved.order) {
          const updated = await updateSkill(skill._id, payload);
          const persisted = { ...updated, clientKey: skill.clientKey };
          working[index] = persisted;
          baseline = baseline.map((item) => item.clientKey === skill.clientKey ? persisted : item);
        }

        setSkills([...working, ...skills.filter((item) => pendingRemovalSet.has(item.clientKey))]);
        setSavedSkills([...baseline]);
      }

      for (const id of pendingRemovalIds) {
        const removed = baseline.find((item) => item.clientKey === id);
        if (removed?._id) await deleteSkill(removed._id);
        working = working.filter((item) => item.clientKey !== id);
        baseline = baseline.filter((item) => item.clientKey !== id);
        setSkills([...working]);
        setSavedSkills([...baseline]);
        setPendingRemovalIds((current) => current.filter((item) => item !== id));
      }

      const reordered: EditableSkill[] = [];
      for (const category of categories) {
        reordered.push(...working.filter((skill) => skill.category === category).map((skill, order) => ({ ...skill, order })));
      }
      const orderPayload = reordered.filter((skill) => skill._id).map((skill) => ({ id: skill._id!, order: skill.order ?? 0 }));
      if (orderPayload.length) await reorderSkills(orderPayload);

      const latest = toEditableSkills(await getSkills());
      setSkills(latest);
      setSavedSkills(latest.map((skill) => ({ ...skill })));
      setPendingRemovalIds([]);
      showToast('All skill changes saved.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Some changes could not be saved. Review the remaining unsaved edits and try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setSkills(savedSkills.map((skill) => ({ ...skill })));
    setPendingRemovalIds([]);
    setDraft({});
    setLevels({});
    setBulkText({});
  };

  if (loading) return <div className="space-y-4"><div className="h-48 animate-pulse rounded-xl bg-slate-800" /><div className="h-48 animate-pulse rounded-xl bg-slate-800" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div>
          <h2 className="font-semibold text-white">Skill changes</h2>
          <p className="mt-1 text-xs text-slate-400">{hasChanges ? `${pendingRemovalIds.length ? `${pendingRemovalIds.length} marked for removal · ` : ''}Unsaved changes` : 'All skill changes are saved.'}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={discardChanges} disabled={!hasChanges || saving} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 disabled:opacity-40"><RotateCcw size={15} /> Discard</button>
          <button type="button" onClick={() => void saveChanges()} disabled={!hasChanges || saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"><Save size={15} /> {saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
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
            {items.length === 0 ? <div className="text-sm text-slate-400">No items in this category yet.</div> : items.map((skill, index) => (
              <div key={skill.clientKey} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3 md:flex-row md:items-center">
                <div className="flex-1">
                  <input aria-label={`${category} skill name`} value={skill.name} onChange={(event) => updateDraftSkill(skill.clientKey, { name: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={100} aria-label={`${skill.name} level`} value={Number(skill.level ?? 0)} onChange={(event) => updateDraftSkill(skill.clientKey, { level: Number(event.target.value) })} />
                  <span className="w-8 text-right text-xs text-slate-200">{Number(skill.level ?? 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Toggle checked={skill.visible !== false} onChange={(visible) => updateDraftSkill(skill.clientKey, { visible })} label="Visible" />
                  <button type="button" disabled={index === 0} onClick={() => void moveSkill(skill, 'up')} className="rounded-lg border border-slate-700 px-2 py-2 text-slate-200 disabled:opacity-40" aria-label={`Move ${skill.name} up`}><ArrowUp size={14} /></button>
                  <button type="button" disabled={index === items.length - 1} onClick={() => void moveSkill(skill, 'down')} className="rounded-lg border border-slate-700 px-2 py-2 text-slate-200 disabled:opacity-40" aria-label={`Move ${skill.name} down`}><ArrowDown size={14} /></button>
                  <button type="button" onClick={() => setPendingDelete(skill)} className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-2 text-red-200"><Trash2 size={14} /></button>
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
            <button type="button" onClick={() => stageSkill(category)} className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Add skill</button>
          </div>

          <div className="mt-4">
            <textarea value={bulkText[category] ?? ''} onChange={(event) => setBulkText((current) => ({ ...current, [category]: event.target.value }))} rows={3} className="w-full rounded-lg border border-slate-700 bg-slate-950/40 p-3 text-sm text-white" placeholder="Add several names separated by commas or new lines" />
            <div className="mt-2 flex justify-end">
              <button type="button" onClick={() => void saveBulk(category)} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100"><Plus size={14} /> Add several</button>
            </div>
          </div>
        </div>
      ))}

      <ConfirmDialog open={Boolean(pendingDelete)} title="Remove skill" message="The skill will be removed when you save all changes. Use Discard if you change your mind." confirmLabel="Mark for removal" onClose={() => setPendingDelete(null)} onConfirm={stageDelete} />
    </div>
  );
}
