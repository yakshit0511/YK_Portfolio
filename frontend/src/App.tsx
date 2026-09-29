import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Lenis from 'lenis';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BackgroundScene } from './components/layout/BackgroundScene';
import { Loader } from './components/layout/Loader';
import { Home } from './pages/Home';
import { AdminPlaceholder } from './pages/AdminPlaceholder';
import { NotFound } from './pages/NotFound';
import { useReducedMotion } from './hooks/useReducedMotion';
import { setSmoothScroller } from './utils/smoothScroll';

const adminPath = (import.meta.env.VITE_ADMIN_PATH || '/yakshit-portfolio_5518').startsWith('/')
  ? (import.meta.env.VITE_ADMIN_PATH || '/yakshit-portfolio_5518')
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
    const posterReady = new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = '/videos/hero-poster.jpg';
    });
    const fontsReady = document.fonts?.ready.then(() => undefined).catch(() => undefined) ?? Promise.resolve();

    Promise.all([posterReady, fontsReady]).then(() => {
      const remaining = Math.max(0, 800 - (performance.now() - startedAt));
      window.setTimeout(() => {
        if (!active) return;
        setProgress(100);
        window.setTimeout(() => setVisible(false), 120);
      }, remaining);
    });

    return () => { active = false; window.clearInterval(progressTimer); };
  }, []);

  return { progress, visible };
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const { progress, visible } = useIntroReady();

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

  return <>
    <BackgroundScene />
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path={adminPath} element={<AdminPlaceholder />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Footer />
    <Loader progress={progress} visible={visible} />
  </>;
}
