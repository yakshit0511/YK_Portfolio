import { Link } from 'react-router-dom';
import { getEnvAdminPath } from '../api/adminApi';

export function AdminNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-slate-200">
      <div className="text-6xl font-bold text-blue-400">404</div>
      <h1 className="mt-3 text-2xl font-semibold text-white">Admin page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">The page you requested is not available in the admin dashboard.</p>
      <Link to={`${getEnvAdminPath()}/dashboard`} className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
        Back to dashboard
      </Link>
    </div>
  );
}
