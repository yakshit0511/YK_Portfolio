import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Eye, EyeOff, Star, StarOff } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { Field } from '../components/Field';
import { useToast } from '../components/Toast';
import { deleteProject, getProjects, reorderProjects, updateProject, type ProjectData } from '../api/adminApi';
import { ProjectForm } from './ProjectForm';
import { cloudinaryImageUrl } from '../../utils/cloudinaryUrl';

export function ProjectsPage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProjectData | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await getProjects();
      setProjects(result);
    } catch (error) {
      showToast((error as Error).message || 'Unable to load projects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadProjects(); }, []);

  const filtered = useMemo(() => projects.filter((project) => project.title?.toLowerCase().includes(search.toLowerCase())), [projects, search]);

  const saveOrder = async () => {
    const payload = projects.map((project, index) => ({ id: project._id ?? '', order: index }));
    try {
      await reorderProjects(payload);
      showToast('Project order saved.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Unable to save order.', 'error');
    }
  };

  const toggleVisible = async (project: ProjectData) => {
    try {
      const result = await updateProject(project._id ?? '', { visible: !project.visible });
      setProjects((current) => current.map((item) => item._id === result._id ? result : item));
      showToast('Project visibility updated.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Unable to update project.', 'error');
    }
  };

  const toggleFeatured = async (project: ProjectData) => {
    try {
      const result = await updateProject(project._id ?? '', { featured: !project.featured });
      setProjects((current) => current.map((item) => item._id === result._id ? result : item));
      showToast('Featured status updated.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Unable to update project.', 'error');
    }
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const next = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setProjects(next);
  };

  const handleDelete = async () => {
    if (!pendingDelete?._id) return;
    try {
      await deleteProject(pendingDelete._id);
      setProjects((current) => current.filter((item) => item._id !== pendingDelete._id));
      setPendingDelete(null);
      showToast('Project deleted.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Delete failed.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Field label="Search by title" value={search} onChange={(event) => setSearch(event.target.value)} className="md:max-w-xs" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelectedProjectId('__new__')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"><Plus size={16} /> Add project</button>
            {projects.some((project, index) => project !== projects[index]) ? <button type="button" onClick={() => void saveOrder()} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">Save order</button> : null}
          </div>
        </div>
      </div>

      {selectedProjectId ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{selectedProjectId === '__new__' ? 'Create project' : 'Edit project'}</h2>
            <button type="button" onClick={() => setSelectedProjectId(null)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">Close</button>
          </div>
          <ProjectForm
            mode={selectedProjectId === '__new__' ? 'create' : 'edit'}
            projectId={selectedProjectId === '__new__' ? undefined : selectedProjectId}
            onSaved={() => { void loadProjects(); }}
            onCreated={(projectId) => setSelectedProjectId(projectId)}
            onCancel={() => setSelectedProjectId(null)}
          />
        </div>
      ) : null}

      {loading ? <div className="space-y-3"><div className="h-28 animate-pulse rounded-xl bg-slate-800" /><div className="h-28 animate-pulse rounded-xl bg-slate-800" /></div> : null}

      {!loading && filtered.length === 0 ? (
        <EmptyState title="No projects yet" description="Create your first project to showcase your work." actionLabel="Add project" onAction={() => setSelectedProjectId('__new__')} />
      ) : null}

      <div className="space-y-4">
        {filtered.map((project, index) => (
          <div key={project._id ?? project.title} className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:flex-row md:items-center">
            <div className="h-20 w-20 overflow-hidden rounded-xl bg-slate-800">
              {project.images?.[0]?.url ? <img src={cloudinaryImageUrl(project.images[0].url, 800)} alt={project.title} width={800} height={450} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No cover</div>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                {project.featured ? <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">Featured</span> : null}
                {project.visible ? <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-200">Visible</span> : <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">Hidden</span>}
              </div>
              <p className="mt-1 text-sm text-slate-300">{project.shortDescription || 'No short description yet.'}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-300">
                {(project.techStack ?? []).slice(0, 5).map((item) => <span key={item} className="rounded-full border border-slate-700 px-2 py-1">{item}</span>)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <button type="button" onClick={() => setSelectedProjectId(project._id ?? null)} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"><Pencil size={14} /> Edit</button>
              <button type="button" onClick={() => void toggleVisible(project)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">{project.visible ? <EyeOff size={14} /> : <Eye size={14} />} {project.visible ? 'Hide' : 'Show'}</button>
              <button type="button" onClick={() => void toggleFeatured(project)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">{project.featured ? <StarOff size={14} /> : <Star size={14} />} {project.featured ? 'Unfeature' : 'Feature'}</button>
              <button type="button" onClick={() => moveProject(index, 'up')} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200" aria-label="Move project up"><ArrowUp size={14} /></button>
              <button type="button" onClick={() => moveProject(index, 'down')} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200" aria-label="Move project down"><ArrowDown size={14} /></button>
              <button type="button" onClick={() => setPendingDelete(project)} className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog open={Boolean(pendingDelete)} title="Delete project" message="This cannot be undone and its images will be removed too." confirmLabel="Delete project" onClose={() => setPendingDelete(null)} onConfirm={handleDelete} />
    </div>
  );
}
