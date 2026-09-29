import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, Github, Instagram, Linkedin } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { scrollToSection } from '../../utils/smoothScroll';
import { GlowButton } from '../ui/GlowButton';
import { HeroVideo } from './HeroVideo';
import { TypingText } from './TypingText';

const ParticlesCanvas = lazy(() => import('./ParticlesCanvas'));

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.warn('Decorative 3D scene is unavailable.', error, info.componentStack); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function Hero() {
  const { data } = usePortfolio();
  const reducedMotion = useReducedMotion();
  const profile = data.profile;
  const [posterReady, setPosterReady] = useState(false);
  const intro = profile?.about.split(/(?<=[.!?])\s/)[0] ?? '';
  const socials = [
    { href: profile?.socials.github, label: 'GitHub', Icon: Github },
    { href: profile?.socials.linkedin, label: 'LinkedIn', Icon: Linkedin },
    { href: profile?.socials.instagram, label: 'Instagram', Icon: Instagram },
  ].filter((item) => item.href);

  useEffect(() => {
    const markReady = () => setPosterReady(true);
    window.addEventListener('hero-poster-ready', markReady);
    const poster = new Image();
    poster.onload = markReady;
    poster.onerror = markReady;
    poster.src = '/videos/hero-poster.jpg';
    return () => window.removeEventListener('hero-poster-ready', markReady);
  }, []);

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      {!reducedMotion && <SceneBoundary><Suspense fallback={null}><ParticlesCanvas /></Suspense></SceneBoundary>}
      <div className="hero-grid container">
        <motion.div className="hero-copy" initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, staggerChildren: 0.12 }}>
          <motion.div className="availability" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <span className="availability-dot" />Available for opportunities
          </motion.div>
          <motion.p className="hero-kicker eyebrow" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>PORTFOLIO · 2026</motion.p>
          <motion.h1 id="hero-title" initial={reducedMotion ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            Hi, I’m<br /><span className="gradient-text">{profile?.fullName ?? 'Yakshit Koshiya'}</span>
          </motion.h1>
          <motion.div className="hero-role" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <span className="role-marker" aria-hidden="true">&gt;</span><TypingText titles={profile?.typingTitles ?? []} />
          </motion.div>
          <motion.p className="hero-intro" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>{intro}</motion.p>
          <motion.div className="hero-actions" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}>
            <GlowButton href="#projects" onClick={(event) => { event.preventDefault(); scrollToSection('projects'); }}>View Projects <ArrowDownRight size={17} /></GlowButton>
            <GlowButton variant="outline" href="#contact" onClick={(event) => { event.preventDefault(); scrollToSection('contact'); }}>Contact Me</GlowButton>
          </motion.div>
          <motion.div className="hero-socials" aria-label="Social profiles" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
            <span className="social-caption">FIND ME ON</span>
            {socials.map(({ href, label, Icon }) => <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"><Icon size={18} /></a>)}
          </motion.div>
        </motion.div>
        <motion.div className="hero-visual" initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }}>
          <HeroVideo />
          <span className="visual-index" aria-hidden="true">01 <i /> INTRODUCTION</span>
        </motion.div>
      </div>
      <span className="hero-side-note" aria-hidden="true">BUILDING IDEAS INTO DIGITAL EXPERIENCES</span>
      <span className="sr-only" aria-live="polite">{posterReady ? 'Hero poster loaded.' : 'Loading hero poster.'}</span>
    </section>
  );
}
