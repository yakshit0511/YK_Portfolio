import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { createCertificate, deleteCertificate, getCertificates, reorderCertificates, updateCertificate, uploadCertificateImage, type CertificateData } from '../api/adminApi';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Field, SelectField } from '../components/Field';
import { TextArea } from '../components/TextArea';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';

const blankCertificate: CertificateData = { title: '', issuer: '', type: 'certificate', issueDate: '', credentialId: '', credentialUrl: '', description: '', visible: true, order: 0 };

export function CertificatesPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<CertificateData[]>([]);
  const [form, setForm] = useState<CertificateData>(blankCertificate);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await getCertificates()); }
    catch (error) { showToast((error as Error).message || 'Unable to load certificates.', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { void load(); }, [load]);

  const startNew = () => { setForm({ ...blankCertificate }); setEditingId(null); };
  const edit = (item: CertificateData) => { setForm({ ...item }); setEditingId(item._id ?? null); };
  const patch = (updates: Partial<CertificateData>) => setForm((current) => ({ ...current, ...updates }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) { showToast('Certificate title is required.', 'error'); return; }
    setSaving(true);
    try {
      const saved = editingId ? await updateCertificate(editingId, form) : await createCertificate(form);
      setForm(saved);
      setEditingId(saved._id ?? null);
      await load();
      showToast('Credential saved.', 'success');
    } catch (error) { showToast((error as Error).message || 'Unable to save credential.', 'error'); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!pendingDelete?._id) return;
    try {
      await deleteCertificate(pendingDelete._id);
      setPendingDelete(null);
      if (editingId === pendingDelete._id) startNew();
      await load();
      showToast('Credential deleted.', 'success');
    } catch (error) { showToast((error as Error).message || 'Unable to delete credential.', 'error'); }
  };

  const uploadImage = async (file?: File) => {
    if (!editingId || !file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { showToast('Use a JPG, PNG, or WEBP image.', 'error'); return; }
    try {
      const saved = await uploadCertificateImage(editingId, file);
      setForm(saved);
      await load();
      showToast('Credential image uploaded.', 'success');
    } catch (error) { showToast((error as Error).message || 'Image upload failed.', 'error'); }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    try { await reorderCertificates(next.map((item, order) => ({ id: item._id ?? '', order }))); }
    catch (error) { showToast((error as Error).message || 'Unable to save order.', 'error'); await load(); }
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-400">Manage public certificates, achievements, and awards.</p>
      <button type="button" onClick={startNew} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"><Plus size={16} /> Add credential</button>
    </div>

    <form onSubmit={save} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-white">{editingId ? 'Edit credential' : 'New credential'}</h2>{editingId && <button type="button" onClick={startNew} className="text-xs text-slate-300">New instead</button>}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" value={form.title} maxLength={120} onChange={(event) => patch({ title: event.target.value })} required />
        <Field label="Issuer" value={form.issuer ?? ''} maxLength={100} onChange={(event) => patch({ issuer: event.target.value })} />
        <SelectField label="Type" value={form.type ?? 'certificate'} onChange={(value) => patch({ type: value as CertificateData['type'] })} options={[{ value: 'certificate', label: 'Certificate' }, { value: 'achievement', label: 'Achievement' }, { value: 'award', label: 'Award' }]} />
        <Field label="Issue date" value={form.issueDate ?? ''} placeholder="2026 or May 2026" onChange={(event) => patch({ issueDate: event.target.value })} />
        <Field label="Credential ID" value={form.credentialId ?? ''} maxLength={80} onChange={(event) => patch({ credentialId: event.target.value })} />
        <Field label="Credential URL (HTTPS)" type="url" value={form.credentialUrl ?? ''} onChange={(event) => patch({ credentialUrl: event.target.value })} />
      </div>
      <TextArea label="Description" rows={3} maxLength={300} value={form.description ?? ''} onChange={(event) => patch({ description: event.target.value })} />
      <Toggle checked={form.visible !== false} onChange={(visible) => patch({ visible })} label="Visible on public site" />
      {editingId && <div className="flex flex-wrap items-center gap-3">
        {form.image?.url && <img src={form.image.url} alt="Credential preview" className="h-16 w-24 rounded-lg border border-slate-700 object-cover" />}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200"><ImagePlus size={16} /> Upload image<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => { void uploadImage(event.target.files?.[0]); event.target.value = ''; }} /></label>
      </div>}
      <div className="flex justify-end"><button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save credential'}</button></div>
    </form>

    <div className="space-y-3">
      {loading ? <div className="h-24 animate-pulse rounded-xl bg-slate-800" /> : items.map((item, index) => <article key={item._id ?? item.title} className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center">
        {item.image?.url ? <img src={item.image.url} alt="" className="h-16 w-24 rounded-lg object-cover" /> : null}
        <div className="min-w-0 flex-1"><h3 className="font-medium text-white">{item.title}</h3><p className="mt-1 text-sm text-slate-400">{[item.issuer, item.type, item.issueDate].filter(Boolean).join(' · ')}</p><span className={`mt-2 inline-flex rounded border px-2 py-0.5 text-[10px] uppercase ${item.visible === false ? 'border-slate-700 text-slate-400' : 'border-emerald-500/30 text-emerald-200'}`}>{item.visible === false ? 'Hidden' : 'Visible'}</span></div>
        <div className="flex gap-2"><button type="button" title="Move up" aria-label="Move credential up" disabled={index === 0} onClick={() => void move(index, -1)} className="rounded-lg border border-slate-700 p-2 text-slate-200 disabled:opacity-40"><ArrowUp size={15} /></button><button type="button" title="Move down" aria-label="Move credential down" disabled={index === items.length - 1} onClick={() => void move(index, 1)} className="rounded-lg border border-slate-700 p-2 text-slate-200 disabled:opacity-40"><ArrowDown size={15} /></button><button type="button" onClick={() => edit(item)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200"><Pencil size={14} /> Edit</button><button type="button" onClick={() => setPendingDelete(item)} aria-label={`Delete ${item.title}`} className="rounded-lg border border-red-500/40 p-2 text-red-200"><Trash2 size={15} /></button></div>
      </article>)}
      {!loading && !items.length && <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">No credentials yet.</div>}
    </div>
    <ConfirmDialog open={Boolean(pendingDelete)} title="Delete credential" message="This will remove the credential and its uploaded image." confirmLabel="Delete credential" onClose={() => setPendingDelete(null)} onConfirm={() => void remove()} />
  </div>;
}