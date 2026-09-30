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
  onCancel?: () => void;
}

const emptyProject: Omit<ProjectData, '_id'> = {
  title: '',
  shortDescription: '',
  description: '',
  techStack: [],
  liveUrl: '',
  githubUrl: '',
  featured: false,
  visible: true,
};

export function ProjectForm({ mode, projectId, onSaved, onCancel }: ProjectFormProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<ProjectData>(emptyProject as ProjectData);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; publicId?: string }>>([]);
  const [uploading, setUploading] = useState(false);

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
      if (mode === 'edit' && projectId) {
        await updateProject(projectId, {
          title: form.title,
          shortDescription: form.shortDescription,
          description: form.description,
          techStack: form.techStack,
          liveUrl: form.liveUrl || undefined,
          githubUrl: form.githubUrl || undefined,
          featured: form.featured,
          visible: form.visible,
        });
      } else {
        const created = await createProject({
          title: form.title,
          shortDescription: form.shortDescription,
          description: form.description,
          techStack: form.techStack,
          liveUrl: form.liveUrl || undefined,
          githubUrl: form.githubUrl || undefined,
          featured: form.featured,
          visible: form.visible,
        });
        if (onSaved) onSaved();
        if (created?._id) {
          setForm({ ...emptyProject as ProjectData, _id: created._id });
        }
      }
      showToast('Saved. Your live site updates within a minute.', 'success');
      onSaved?.();
    } catch (error) {
      showToast((error as Error).message || 'Unable to save project.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!projectId || !files.length) return;
    if (images.length + files.length > 10) {
      showToast('A project can have at most 10 images.', 'error');
      return;
    }
    setUploading(true);
    try {
      const result = await uploadProjectImages(projectId, files);
      setImages(result.images ?? []);
      showToast('Images uploaded.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Image upload failed.', 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteImage = async (publicId: string) => {
    if (!projectId) return;
    try {
      const result = await deleteProjectImage(projectId, publicId);
      setImages(result.images ?? []);
      showToast('Image removed.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Delete failed.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" value={form.title ?? ''} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
        <Field label="Short description" value={form.shortDescription ?? ''} onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))} />
      </div>
      <TextArea label="Description" rows={6} value={form.description ?? ''} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
      <Field label="Tech stack (comma separated)" value={(form.techStack ?? []).join(', ')} onChange={(event) => setForm((current) => ({ ...current, techStack: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) }))} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Live URL" value={form.liveUrl ?? ''} onChange={(event) => setForm((current) => ({ ...current, liveUrl: event.target.value }))} />
        <Field label="GitHub URL" value={form.githubUrl ?? ''} onChange={(event) => setForm((current) => ({ ...current, githubUrl: event.target.value }))} />
      </div>
      <div className="flex flex-wrap gap-4">
        <Toggle checked={Boolean(form.featured)} onChange={(value) => setForm((current) => ({ ...current, featured: value }))} label="Featured" />
        <Toggle checked={Boolean(form.visible)} onChange={(value) => setForm((current) => ({ ...current, visible: value }))} label="Visible" />
      </div>

      {mode === 'edit' && projectId ? (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Project images</h3>
            <label className="cursor-pointer rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">
              Add images
              <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          {uploading ? <div className="text-sm text-slate-300">Uploading…</div> : null}
          <div className="grid gap-3 md:grid-cols-3">
            {images.length ? images.map((image, index) => (
              <div key={`${image.publicId ?? image.url}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900 p-2">
                <img src={cloudinaryImageUrl(image.url, 800)} alt="Project file" width={800} height={450} className="h-28 w-full rounded-lg object-cover" />
                {index === 0 ? <div className="mt-2 text-xs text-blue-300">Cover</div> : null}
                <button type="button" className="mt-2 text-xs text-red-300" onClick={() => image.publicId && handleDeleteImage(image.publicId)}>Delete</button>
              </div>
            )) : <div className="text-sm text-slate-400">Save the project first, then add images.</div>}
          </div>
        </div>
      ) : null}

      <div className="flex justify-end gap-3">
        {onCancel ? <button type="button" onClick={onCancel} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">Cancel</button> : null}
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-70">
          <Save size={16} />
          {loading ? 'Saving…' : 'Save project'}
        </button>
      </div>
    </form>
  );
}
