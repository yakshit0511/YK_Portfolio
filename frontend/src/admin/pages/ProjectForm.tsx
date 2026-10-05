import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { createProject, deleteProjectImage, getProjects, updateProject, uploadProjectImages, type ProjectData } from '../api/adminApi';
import { Field } from '../components/Field';
import { TextArea } from '../components/TextArea';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';
import { isValidUrl } from '../utils/validators';
import { cloudinaryImageUrl } from '../../utils/cloudinaryUrl';

interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string;
  onSaved?: () => void;
  onCreated?: (projectId: string) => void;
  onCancel?: () => void;
}

const emptyProject: Omit<ProjectData, '_id'> = {
  title: '',
  shortDescription: '',
  description: '',
  role: '',
  duration: '',
  status: 'completed',
  problem: '',
  solution: '',
  features: [],
  challenges: '',
  techStack: [],
  liveUrl: '',
  githubUrl: '',
  featured: false,
  visible: true,
};

export function ProjectForm({ mode, projectId, onSaved, onCreated, onCancel }: ProjectFormProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<ProjectData>(emptyProject as ProjectData);
  const [createdProjectId, setCreatedProjectId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; publicId?: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const activeProjectId = projectId || createdProjectId;

  useEffect(() => {
    if (mode !== 'edit' || !projectId) return;
    getProjects().then((all) => {
      const project = all.find((item) => item._id === projectId);
      if (project) {
        setForm({
          ...emptyProject,
          ...project,
          images: project.images ?? [],
          techStack: project.techStack ?? [],
        });
        setImages(project.images ?? []);
      }
    });
  }, [mode, projectId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title?.trim()) {
      showToast('Project title is required.', 'error');
      return;
    }
    if (form.liveUrl && !isValidUrl(form.liveUrl)) {
      showToast('Live URL must be a valid https URL.', 'error');
      return;
    }
    if (form.githubUrl && !isValidUrl(form.githubUrl)) {
      showToast('GitHub URL must be a valid https URL.', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.description,
        role: form.role,
        duration: form.duration,
        status: form.status,
        problem: form.problem,
        solution: form.solution,
        features: form.features,
        challenges: form.challenges,
        techStack: form.techStack,
        liveUrl: form.liveUrl || undefined,
        githubUrl: form.githubUrl || undefined,
        featured: form.featured,
        visible: form.visible,
      };

      if (activeProjectId) {
        const updated = await updateProject(activeProjectId, payload);
        setForm((current) => ({ ...current, ...updated }));
      } else {
        const created = await createProject(payload);
        if (created?._id) {
          setCreatedProjectId(created._id);
          setImages(created.images ?? []);
          setForm((current) => ({ ...current, ...created }));
          onCreated?.(created._id);
        }
      }
      showToast('Saved. Your live site updates within a minute.', 'success');
      onSaved?.();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: Array<{ message?: string }> } }; message?: string };
      const detailedMsg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || err.message || 'Unable to save project.';
      showToast(detailedMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!activeProjectId || !files.length) return;
    if (files.length > 5) {
      showToast('Choose up to 5 images per upload.', 'error');
      event.target.value = '';
      return;
    }
    if (images.length + files.length > 10) {
      showToast('A project can have at most 10 images.', 'error');
      event.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const result = await uploadProjectImages(activeProjectId, files);
      setImages(result.images ?? []);
      setForm((current) => ({ ...current, images: result.images ?? [] }));
      onSaved?.();
      showToast('Images uploaded.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Image upload failed.', 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteImage = async (publicId: string) => {
    if (!activeProjectId) return;
    try {
      const result = await deleteProjectImage(activeProjectId, publicId);
      setImages(result.images ?? []);
      setForm((current) => ({ ...current, images: result.images ?? [] }));
      onSaved?.();
      showToast('Image removed.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Delete failed.', 'error');
    }
  };

  const startAnotherProject = () => {
    setCreatedProjectId(undefined);
    setImages([]);
    setForm({ ...emptyProject } as ProjectData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" value={form.title ?? ''} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
        <Field label="Short description" value={form.shortDescription ?? ''} onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))} />
      </div>
      <TextArea label="Description" rows={6} value={form.description ?? ''} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Your role" value={form.role ?? ''} maxLength={80} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} />
        <Field label="Timeline" value={form.duration ?? ''} maxLength={60} placeholder="May 2026" onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} />
        <label className="flex flex-col gap-1.5 text-sm text-slate-200"><span className="font-medium text-slate-100">Project status</span><select value={form.status ?? 'completed'} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProjectData['status'] }))} className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-white"><option value="completed">Completed</option><option value="in-progress">In progress</option><option value="planned">Planned</option></select></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextArea label="Problem" rows={4} maxLength={800} value={form.problem ?? ''} onChange={(event) => setForm((current) => ({ ...current, problem: event.target.value }))} />
        <TextArea label="Solution" rows={4} maxLength={800} value={form.solution ?? ''} onChange={(event) => setForm((current) => ({ ...current, solution: event.target.value }))} />
      </div>
      <Field label="Key features (comma separated)" value={(form.features ?? []).join(', ')} onChange={(event) => setForm((current) => ({ ...current, features: event.target.value.split(',').map((value) => value.trim()).filter(Boolean).slice(0, 10) }))} />
      <TextArea label="Challenges & decisions" rows={4} maxLength={800} value={form.challenges ?? ''} onChange={(event) => setForm((current) => ({ ...current, challenges: event.target.value }))} />
      <Field label="Tech stack (comma separated)" value={(form.techStack ?? []).join(', ')} onChange={(event) => setForm((current) => ({ ...current, techStack: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) }))} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Live URL" value={form.liveUrl ?? ''} onChange={(event) => setForm((current) => ({ ...current, liveUrl: event.target.value }))} />
        <Field label="GitHub URL" value={form.githubUrl ?? ''} onChange={(event) => setForm((current) => ({ ...current, githubUrl: event.target.value }))} />
      </div>
      <div className="flex flex-wrap gap-4">
        <Toggle checked={Boolean(form.featured)} onChange={(value) => setForm((current) => ({ ...current, featured: value }))} label="Featured" />
        <Toggle checked={Boolean(form.visible)} onChange={(value) => setForm((current) => ({ ...current, visible: value }))} label="Visible" />
      </div>

      {activeProjectId ? (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-white">Project gallery</h3>
              <p className="text-xs text-slate-400">{images.length}/10 images. Upload up to 5 at a time; the first image is the project cover.</p>
            </div>
            <label className={`cursor-pointer rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 ${uploading || images.length >= 10 ? 'pointer-events-none opacity-50' : ''}`}>
              {uploading ? 'Uploading…' : 'Add photos'}
              <input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={uploading || images.length >= 10} className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.length ? images.map((image, index) => (
              <div key={`${image.publicId ?? image.url}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900 p-2">
                <img src={cloudinaryImageUrl(image.url, 800)} alt={`${form.title || 'Project'} photo ${index + 1}`} width={800} height={450} className="h-32 w-full rounded-lg object-cover" />
                <div className="mt-2 flex items-center justify-between gap-2">
                  {index === 0 ? <span className="text-xs text-blue-300">Cover photo</span> : <span className="text-xs text-slate-400">Photo {index + 1}</span>}
                  {image.publicId && <button type="button" className="text-xs text-red-300 hover:text-red-200" onClick={() => void handleDeleteImage(image.publicId!)}>Remove</button>}
                </div>
              </div>
            )) : <p className="text-sm text-slate-400 sm:col-span-2 lg:col-span-3">Save the project first, then add up to 10 photos.</p>}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        {mode === 'create' && createdProjectId && <button type="button" onClick={startAnotherProject} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">Create another</button>}
        {onCancel ? <button type="button" onClick={onCancel} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">Close</button> : null}
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-70">
          <Save size={16} />
          {loading ? 'Saving…' : activeProjectId ? 'Save changes' : 'Save project'}
        </button>
      </div>
    </form>
  );
}
