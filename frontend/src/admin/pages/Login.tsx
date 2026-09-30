import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Field } from '../components/Field';
import { PasswordInput } from '../components/PasswordInput';
import { getEnvAdminPath } from '../api/adminApi';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, setSessionExpiredMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`${getEnvAdminPath()}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const input = document.getElementById('admin-email');
    input?.focus();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setSessionExpiredMessage(null);

    try {
      await login(email.trim(), password);
      navigate(`${getEnvAdminPath()}/dashboard`, { replace: true });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
            <LockKeyhole size={24} />
          </div>
        </div>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-white">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-400">Secure portfolio dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            id="admin-email"
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            error={error ? ' ' : undefined}
          />
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            error={error ? ' ' : undefined}
          />
          {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-70">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
