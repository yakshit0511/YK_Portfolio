import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getEnvAdminPath } from './api/adminApi';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { AdminLayout } from './layout/AdminLayout';
import { Login } from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((module) => ({ default: module.ProjectsPage })));
const SkillsPage = lazy(() => import('./pages/SkillsPage').then((module) => ({ default: module.SkillsPage })));
const EducationPage = lazy(() => import('./pages/EducationPage').then((module) => ({ default: module.EducationPage })));
const ExperiencePage = lazy(() => import('./pages/ExperiencePage').then((module) => ({ default: module.ExperiencePage })));
const SectionsPage = lazy(() => import('./pages/SectionsPage').then((module) => ({ default: module.SectionsPage })));
const ContentManagerPage = lazy(() => import('./pages/ContentManagerPage').then((module) => ({ default: module.ContentManagerPage })));
const InquiriesPage = lazy(() => import('./pages/InquiriesPage').then((module) => ({ default: module.InquiriesPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const AdminNotFound = lazy(() => import('./pages/AdminNotFound').then((module) => ({ default: module.AdminNotFound })));

const adminPath = getEnvAdminPath();

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">Loading admin…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={adminPath} replace />;
  }

  return children;
}

function AppShell() {
  const { isAuthenticated } = useAuth();
  const unreadCount = 0;

  return (
    <Routes>
      <Route path={adminPath} element={isAuthenticated ? <Navigate to={`${adminPath}/dashboard`} replace /> : <Login />} />

      <Route path={`${adminPath}/dashboard`} element={<ProtectedRoute><AdminLayout title="Dashboard" unreadCount={unreadCount}><Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-300">Loading dashboard…</div>}><Dashboard /></Suspense></AdminLayout></ProtectedRoute>} />
      <Route path={`${adminPath}/content-manager`} element={<ProtectedRoute><AdminLayout title="Content manager"><Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-300">Loading content manager…</div>}><ContentManagerPage /></Suspense></AdminLayout></ProtectedRoute>} />
      <Route path={`${adminPath}/profile`} element={<ProtectedRoute><AdminLayout title="Profile & About"><Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-300">Loading profile…</div>}><ProfilePage /></Suspense></AdminLayout></ProtectedRoute>} />
      <Route path={`${adminPath}/projects`} element={<ProtectedRoute><AdminLayout title="Projects"><Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-300">Loading projects…</div>}><ProjectsPage /></Suspense></AdminLayout></ProtectedRoute>} />
      <Route path={`${adminPath}/skills`} element={<ProtectedRoute><AdminLayout title="Skills"><Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-300">Loading skills…</div>}><SkillsPage /></Suspense></AdminLayout></ProtectedRoute>} />
      <Route path={`${adminPath}/education`} element={<ProtectedRoute><AdminLayout title="Education"><Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-300">Loading education…</div>}><EducationPage /></Suspense></AdminLayout></ProtectedRoute>} />
      <Route path={`${adminPath}/experience`} element={<ProtectedRoute><AdminLayout title="Experience"><Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-300">Loading experience…</div>}><ExperiencePage /></Suspense></AdminLayout></ProtectedRoute>} />
      <Route path={`${adminPath}/sections`} element={<ProtectedRoute><AdminLayout title="Sections"><Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-300">Loading sections…</div>}><SectionsPage /></Suspense></AdminLayout></ProtectedRoute>} />
      <Route path={`${adminPath}/inquiries`} element={<ProtectedRoute><AdminLayout title="Inquiries" unreadCount={unreadCount}><Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-300">Loading inquiries…</div>}><InquiriesPage /></Suspense></AdminLayout></ProtectedRoute>} />
      <Route path={`${adminPath}/settings`} element={<ProtectedRoute><AdminLayout title="Settings"><Suspense fallback={<div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-300">Loading settings…</div>}><SettingsPage /></Suspense></AdminLayout></ProtectedRoute>} />
      <Route path={`${adminPath}/*`} element={<ProtectedRoute><AdminNotFound /></ProtectedRoute>} />
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <>
      <Helmet>
        <title>Admin | Yakshit Portfolio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AuthProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </>
  );
}
