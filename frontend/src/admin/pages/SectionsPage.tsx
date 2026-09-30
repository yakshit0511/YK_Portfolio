import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { getSections, updateSections, type SectionData } from '../api/adminApi';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';

const sectionOrder: Array<{ key: SectionData['key']; title: string }> = [
  { key: 'about', title: 'About' },
  { key: 'skills', title: 'Skills' },
  { key: 'projects', title: 'Projects' },
  { key: 'education', title: 'Education' },
  { key: 'experience', title: 'Experience' },
  { key: 'contact', title: 'Contact' },
];

export function SectionsPage() {
  const { showToast } = useToast();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSections = async () => {
    try {
      const result = await getSections();
      const ordered = sectionOrder.map((item) => {
        const match = result.find((entry) => entry.key === item.key);
        return match ?? { key: item.key, title: item.title || item.key, visible: true, order: 0 };
      });
      setSections(ordered);
    } catch (error) {
      showToast((error as Error).message || 'Unable to load section settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSections();
  }, []);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const next = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setSections(next.map((section, orderIndex) => ({ ...section, order: orderIndex })));
  };

  const saveSections = async () => {
    if (sections.every((section) => !section.visible)) {
      showToast('At least one section must stay visible.', 'error');
      return;
    }

    try {
      await updateSections(sections.map((section, index) => ({ ...section, order: index, title: section.title || section.key })));
      showToast('Saved. Your live site updates within a minute.', 'success');
      await loadSections();
    } catch (error) {
      showToast((error as Error).message || 'Unable to save sections.', 'error');
    }
  };

  if (loading) {
    return <div className="space-y-4"><div className="h-20 animate-pulse rounded-xl bg-slate-800" /><div className="h-20 animate-pulse rounded-xl bg-slate-800" /><div className="h-20 animate-pulse rounded-xl bg-slate-800" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Sections</h2>
            <p className="mt-1 text-sm text-slate-400">Hidden sections also disappear from the public navigation.</p>
          </div>
          <button type="button" onClick={() => void saveSections()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save changes</button>
        </div>

        <div className="space-y-3">
          {sections.map((section, index) => (
            <div key={section.key} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => moveSection(index, 'up')} disabled={index === 0} className="rounded border border-slate-700 p-1 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Move ${section.key} up`}>
                    <ArrowUp size={14} />
                  </button>
                  <button type="button" onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="rounded border border-slate-700 p-1 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Move ${section.key} down`}>
                    <ArrowDown size={14} />
                  </button>
                </div>
                <div>
                  <div className="font-medium text-white">{section.title || section.key}</div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">{section.key}</div>
                </div>
              </div>

              <Toggle
                checked={Boolean(section.visible)}
                onChange={(value) => setSections((current) => current.map((entry) => entry.key === section.key ? { ...entry, visible: value } : entry))}
                label="Visible"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
