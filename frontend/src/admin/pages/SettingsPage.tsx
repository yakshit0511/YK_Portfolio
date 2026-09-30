import { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PasswordInput } from '../components/PasswordInput';
import { useToast } from '../components/Toast';
import { changePassword } from '../api/adminApi';

function getPasswordStrength(value: string) {
  let score = 0;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const strengthLabel = strength <= 2 ? 'Weak' : strength <= 4 ? 'Good' : 'Strong';
  const strengthWidth = `${Math.min((strength / 5) * 100, 100)}%`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please complete all password fields.', 'error');
      return;
    }

    if (newPassword.length < 12) {
      showToast('New password must be at least 12 characters long.', 'error');
      return;
    }

    if (newPassword === currentPassword) {
      showToast('New password must differ from the current password.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('The new passwords do not match.', 'error');
      return;
    }

    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated. Your session stays active.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to change password.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
              <LockKeyhole size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Change password</h2>
              <p className="text-sm text-slate-400">Passwords are hashed and never shown.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput label="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Enter current password" autoComplete="current-password" />
            <PasswordInput label="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Enter a new password" autoComplete="new-password" />
            <PasswordInput label="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm your new password" autoComplete="new-password" />

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                <span>Password strength</span>
                <span className={strength <= 2 ? 'text-red-300' : strength <= 4 ? 'text-amber-300' : 'text-emerald-300'}>{strengthLabel}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div className={['h-full rounded-full transition-all', strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-amber-500' : 'bg-emerald-500'].join(' ')} style={{ width: strengthWidth }} />
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-70">
              {saving ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Account</h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Email</div>
              <div className="mt-1 font-medium text-white">{user?.email || 'Not available'}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Last login</div>
              <div className="mt-1 font-medium text-white">{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Unknown'}</div>
            </div>
            <button type="button" onClick={() => void logout()} className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 hover:bg-red-500/20">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
