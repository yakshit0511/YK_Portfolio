import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BackgroundScene } from './components/layout/BackgroundScene';
import { Loader } from './components/layout/Loader';
import { Home } from './pages/Home';
import { ProjectCaseStudy } from './pages/ProjectCaseStudy';
import { NotFound } from './pages/NotFound';
import { useReducedMotion } from './hooks/useReducedMotion';
import { scrollToSection, setSmoothScroller } from './utils/smoothScroll';
import { HeroProvider, useHeroContext } from './context/HeroContext';
import { TourProvider, useTour } from './components/guide/TourProvider';
import { getOptimizedImageSrc } from './utils/imageSources';
import { CommandPalette } from './components/layout/CommandPalette';
import { PrivacyConsent } from './components/layout/PrivacyConsent';
import { trackPortfolioEvent } from './utils/analytics';

const AdminApp = lazy(() => import('./admin/AdminApp'));

const TourOverlay = lazy(() => import('./components/guide/TourOverlay').then((module) => ({ default: module.TourOverlay })));
const TourInvite = lazy(() => import('./components/guide/TourInvite').then((module) => ({ default: module.TourInvite })));

function TourWidgets() {
  const { active } = useTour();
  const { sequenceDone } = useHeroContext();
  const [inviteDelayReached, setInviteDelayReached] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setInviteDelayReached(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  return <>
    {(sequenceDone || inviteDelayReached) && <Suspense fallback={null}><TourInvite /></Suspense>}
    {active && <Suspense fallback={null}><TourOverlay /></Suspense>}
  </>;
}

const configuredAdminPath = import.meta.env.VITE_ADMIN_PATH || '/admin';
const adminPath = configuredAdminPath.startsWith('/')
  ? configuredAdminPath
  : `/${import.meta.env.VITE_ADMIN_PATH}`;

function useIntroReady() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let active = true;
    const startedAt = performance.now();
    const progressTimer = window.setInterval(() => {
      setProgress((value) => Math.min(value + 7, 92));
    }, 65);
    const firstImageReady = new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      const source = '/images/cutouts/01_coding_0-3s%20(1).png';
      image.src = getOptimizedImageSrc(source) ?? source;
    });
    const fontsReady = document.fonts?.ready.then(() => undefined).catch(() => undefined) ?? Promise.resolve();

    let readyTimer = 0;
    let hideTimer = 0;
    Promise.all([firstImageReady, fontsReady]).then(() => {
      const remaining = Math.max(0, 800 - (performance.now() - startedAt));
      readyTimer = window.setTimeout(() => {
        if (!active) return;
        setProgress(100);
        hideTimer = window.setTimeout(() => setVisible(false), 120);
      }, remaining);
    });

    return () => {
      active = false;
      window.clearInterval(progressTimer);
      window.clearTimeout(readyTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return { progress, visible };
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const { progress, visible } = useIntroReady();
  const location = useLocation();
  const isAdminRoute = location.pathname === adminPath || location.pathname.startsWith(`${adminPath}/`);

  useEffect(() => {
    if (isAdminRoute) return;
    trackPortfolioEvent('pageview');
    const projectSlug = location.pathname.match(/^\/projects\/([a-z0-9-]+)$/)?.[1];
    if (projectSlug) trackPortfolioEvent('project_view', projectSlug);
  }, [isAdminRoute, location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => setTimeout(() => scrollToSection(id), 0));
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (reducedMotion) {
      setSmoothScroller(null);
      return;
    }
    const lenis = new Lenis({ smoothWheel: true, autoRaf: false });
    setSmoothScroller(lenis);
    let frame = 0;
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setSmoothScroller(null);
    };
  }, [reducedMotion]);

  if (isAdminRoute) {
    return <Suspense fallback={null}><AdminApp /></Suspense>;
  }

  return <HeroProvider>
    <TourProvider>
      <BackgroundScene />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectCaseStudy />} />
        <Route path={adminPath} element={<Suspense fallback={null}><AdminApp /></Suspense>} />
        <Route path={`${adminPath}/*`} element={<Suspense fallback={null}><AdminApp /></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <Loader progress={progress} visible={visible} />
      <TourWidgets />
      <CommandPalette />
      <PrivacyConsent />
    </TourProvider>
  </HeroProvider>;
}
