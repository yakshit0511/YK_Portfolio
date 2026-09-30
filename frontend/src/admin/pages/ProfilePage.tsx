import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Link as LinkIcon, UploadCloud, X } from 'lucide-react';
import { getProfile, updateProfile, uploadAvatar, uploadResume, removeResume, type ProfileData, getApiMessage } from '../api/adminApi';
import { Field, SelectField } from '../components/Field';
import { TextArea } from '../components/TextArea';
import { Toggle } from '../components/Toggle';
import { SaveBar } from '../components/SaveBar';
import { useToast } from '../components/Toast';
import { cleanTrackingQuery, isValidEmail, isValidPhone, isValidUrl, validateHexColor } from '../utils/validators';
import { getResumeDeliveryUrl } from '../../utils/resumeUrl';
import { cloudinaryImageUrl } from '../../utils/cloudinaryUrl';

const initialState: ProfileData = {
  fullName: '',
  siteName: '',
  typingTitles: [],
  about: '',
  email: '',
  phone: '',
  location: '',
  socials: { github: '', linkedin: '', instagram: '' },
  seo: { title: '', description: '' },
  availability: { status: 'open', message: '' },
  currentlyLearning: [],
  accentColor: '#2f7bff',
  showPhone: false,
};

export function ProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileData>(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getProfile().then((result) => {
      setProfile({
        ...initialState,
        ...result,
        typingTitles: result.typingTitles ?? [],
        socials: { github: '', linkedin: '', instagram: '', ...(result.socials ?? {}) },
        seo: { title: '', description: '', ...(result.seo ?? {}) },
        availability: { status: 'open', message: '', ...(result.availability ?? {}) },
        currentlyLearning: result.currentlyLearning ?? [],
        showPhone: Boolean(result.showPhone),
      });
    }).catch(() => showToast('Could not load profile', 'error')).finally(() => setLoading(false));
  }, [showToast]);

  const paragraphs = useMemo(() => profile.about?.split(/\n\s*\n/).filter(Boolean) ?? [], [profile.about]);

  const patchProfile = (updates: Partial<ProfileData>) => {
    setProfile((current) => ({ ...current, ...updates }));
    setDirty(true);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!profile.fullName?.trim()) nextErrors.fullName = 'Full name is required.';
    if (!profile.siteName?.trim()) nextErrors.siteName = 'Site name is required.';
    if (!profile.email || !isValidEmail(profile.email)) nextErrors.email = 'Enter a valid email.';
    if (profile.phone && !isValidPhone(profile.phone)) nextErrors.phone = 'Use only digits, +, spaces, dashes, or parentheses.';
    if (profile.seo?.title && profile.seo.title.length > 60) nextErrors.seoTitle = 'Keep title under 60 characters.';
    if (profile.seo?.description && profile.seo.description.length > 160) nextErrors.seoDescription = 'Keep description under 160 characters.';
    if (profile.accentColor && !validateHexColor(profile.accentColor)) nextErrors.accentColor = 'Use a valid 6-digit hex color.';
    const socials = profile.socials ?? {};
    for (const key of ['github', 'linkedin', 'instagram'] as const) {
      const value = socials[key];
      if (value && (!isValidUrl(value) || !value.startsWith('https://'))) {
        nextErrors[`socials.${key}`] = 'Use a full https URL for this social link.';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: Partial<ProfileData> = {
        fullName: profile.fullName,
        siteName: profile.siteName,
        typingTitles: profile.typingTitles,
        about: profile.about,
        email: profile.email,
        phone: profile.phone || undefined,
        showPhone: profile.showPhone,
        location: profile.location || undefined,
        socials: profile.socials,
        seo: profile.seo,
        availability: profile.availability,
        currentlyLearning: profile.currentlyLearning,
        accentColor: profile.accentColor,
      };
      await updateProfile(payload);
      setDirty(false);
      showToast('Saved. Your live site updates within a minute.', 'success');
    } catch (error) {
      showToast(getApiMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPG, PNG, or WEBP images are allowed.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Avatar must be under 5 MB.', 'error');
      return;
    }
    setUploadingAvatar(true);
    try {
      const result = await uploadAvatar(file);
      setProfile((current) => ({ ...current, avatarUrl: result.url }));
      showToast('Avatar updated.', 'success');
    } catch (error) {
      showToast(getApiMessage(error), 'error');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleUploadResume = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Only PDF resumes are allowed.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Resume must be under 5 MB.', 'error');
      return;
    }
    setUploadingResume(true);
    try {
      const result = await uploadResume(file);
      setProfile((current) => ({ ...current, resume: { url: result.url, publicId: result.publicId } }));
      showToast('Resume uploaded.', 'success');
    } catch (error) {
      showToast(getApiMessage(error), 'error');
    } finally {
      setUploadingResume(false);
      event.target.value = '';
    }
  };

  const handleRemoveResume = async () => {
    try {
      await removeResume();
      setProfile((current) => ({ ...current, resume: undefined }));
      showToast('Resume removed.', 'success');
    } catch (error) {
      showToast(getApiMessage(error), 'error');
    }
  };

  if (loading) {
    return <div className="space-y-4"><div className="h-16 animate-pulse rounded-xl bg-slate-800" /><div className="h-64 animate-pulse rounded-xl bg-slate-800" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">Live status</h2>
          <div className="mt-4 grid gap-4">
            <SelectField label="Availability" value={profile.availability?.status ?? 'open'} onChange={(value) => patchProfile({ availability: { ...(profile.availability ?? {}), status: value as NonNullable<ProfileData['availability']>['status'] } })} options={[{ value: 'open', label: 'Open to opportunities' }, { value: 'limited', label: 'Limited availability' }, { value: 'closed', label: 'Not available' }]} />
            <Field label="Status message" value={profile.availability?.message ?? ''} maxLength={100} onChange={(event) => patchProfile({ availability: { ...(profile.availability ?? {}), message: event.target.value } })} />
            <Field label="Currently learning (comma separated)" value={(profile.currentlyLearning ?? []).join(', ')} onChange={(event) => patchProfile({ currentlyLearning: event.target.value.split(',').map((value) => value.trim()).filter(Boolean).slice(0, 5) })} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">Basic info</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Full name" value={profile.fullName ?? ''} onChange={(event) => patchProfile({ fullName: event.target.value })} error={errors.fullName} />
            <Field label="Site name" value={profile.siteName ?? ''} onChange={(event) => patchProfile({ siteName: event.target.value })} error={errors.siteName} />
            <Field label="Email" type="email" value={profile.email ?? ''} onChange={(event) => patchProfile({ email: event.target.value })} error={errors.email} />
            <Field label="Location" value={profile.location ?? ''} onChange={(event) => patchProfile({ location: event.target.value })} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">Avatar</h2>
          <div className="mt-4 flex items-center gap-4">
            {profile.avatarUrl ? <img src={cloudinaryImageUrl(profile.avatarUrl, 800)} alt="Avatar preview" width={80} height={80} className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-slate-300"><ImagePlus size={24} /></div>}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">
              <UploadCloud size={16} />
              {uploadingAvatar ? 'Uploading…' : 'Upload avatar'}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleUploadAvatar} />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-white">Typing titles</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(profile.typingTitles ?? []).map((title, index) => (
            <div key={`${title}-${index}`} className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200">
              <span>{title}</span>
              <button type="button" onClick={() => { const next = [...(profile.typingTitles ?? [])]; next.splice(index,1); patchProfile({ typingTitles: next }); }} className="text-slate-400 hover:text-white" aria-label={`Remove ${title}`}><X size={14} /></button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Field label="Add a title" value={''} onChange={() => undefined} placeholder="Type a title and press Enter" className="!mb-0" />
          <button type="button" onClick={() => {
            const input = document.querySelector<HTMLInputElement>('[placeholder="Type a title and press Enter"]');
            const value = input?.value?.trim();
            if (!value) return;
            patchProfile({ typingTitles: [...(profile.typingTitles ?? []), value].slice(0, 6) });
            if (input) input.value = '';
          }} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">Add</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-white">About</h2>
        <div className="mt-4 space-y-4">
          <TextArea label="About" rows={8} value={profile.about ?? ''} onChange={(event) => patchProfile({ about: event.target.value })} />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Leave a blank line between paragraphs</span>
            <span>{(profile.about ?? '').length} chars</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300">
            {paragraphs.length ? paragraphs.map((line, index) => <p key={index} className="mb-2 last:mb-0">{line}</p>) : <span>No about text yet.</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <div className="mt-4 space-y-4">
            <Field label="Phone" value={profile.phone ?? ''} onChange={(event) => patchProfile({ phone: event.target.value })} error={errors.phone} />
            <Toggle checked={Boolean(profile.showPhone)} onChange={(value) => patchProfile({ showPhone: value })} label="Show my phone number on the public site" description="Turning this on makes your number visible to everyone and bots." />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">Socials</h2>
          <div className="mt-4 grid gap-4">
            {(['github', 'linkedin', 'instagram'] as const).map((key) => (
              <div key={key} className="space-y-1">
                <Field label={key.charAt(0).toUpperCase() + key.slice(1)} placeholder={key === 'github' ? 'https://github.com/username' : `https://${key}.com/username`} value={profile.socials?.[key] ?? ''} onChange={(event) => patchProfile({ socials: { ...(profile.socials ?? {}), [key]: event.target.value } })} />
                <button type="button" className="inline-flex items-center gap-2 text-xs text-blue-300" onClick={() => patchProfile({ socials: { ...(profile.socials ?? {}), [key]: cleanTrackingQuery(profile.socials?.[key]) } })}><LinkIcon size={12} /> Clean link</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">SEO</h2>
          <div className="mt-4 space-y-4">
            <Field label="Title" value={profile.seo?.title ?? ''} maxLength={60} onChange={(event) => patchProfile({ seo: { ...(profile.seo ?? {}), title: event.target.value } })} error={errors.seoTitle} />
            <TextArea label="Description" rows={4} value={profile.seo?.description ?? ''} maxLength={160} onChange={(event) => patchProfile({ seo: { ...(profile.seo ?? {}), description: event.target.value } })} error={errors.seoDescription} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">Theme</h2>
          <div className="mt-4 flex items-center gap-4">
            <input type="color" value={profile.accentColor ?? '#2f7bff'} onChange={(event) => patchProfile({ accentColor: event.target.value })} className="h-12 w-16 rounded-lg border border-slate-700 bg-transparent" />
            <Field label="Hex color" value={profile.accentColor ?? '#2f7bff'} onChange={(event) => patchProfile({ accentColor: event.target.value })} error={errors.accentColor} className="flex-1" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-white">Resume</h2>
        <p className="mt-2 text-sm text-slate-400">If the current PDF is blocked or downloads instead of opening, enable public PDF delivery in Cloudinary, then replace it here.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {profile.resume?.url ? (
            <>
              <a href={getResumeDeliveryUrl(profile.resume.url)} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-blue-300">Open</a>
              <label className="cursor-pointer rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">
                Replace
                <input type="file" accept="application/pdf" className="hidden" onChange={handleUploadResume} />
              </label>
              <button type="button" onClick={handleRemoveResume} className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">Remove</button>
            </>
          ) : (
            <label className="cursor-pointer rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">
              Upload PDF
              <input type="file" accept="application/pdf" className="hidden" onChange={handleUploadResume} />
            </label>
          )}
          {uploadingResume ? <span className="text-sm text-slate-300">Uploading…</span> : null}
        </div>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={() => { setProfile({ ...initialState, ...profile }); setDirty(false); }} />
    </div>
  );
}
