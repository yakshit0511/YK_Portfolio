import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Github, Instagram, Linkedin, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { scrollToSection } from '../../utils/smoothScroll';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useTour } from '../guide/TourProvider';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getResumeDeliveryUrl } from '../../utils/resumeUrl';
import { trackPortfolioEvent } from '../../utils/analytics';

export function Navbar() {
  const { data } = usePortfolio();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [liteMode, setLiteMode] = useState(() => {
    try { return window.localStorage.getItem('portfolio-lite-mode') === 'on'; } catch { return false; }
  });
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { start } = useTour();
  const reducedMotion = useReducedMotion();
  const sections = [...data.sections].filter((section) => section.visible && !(section.key === 'experience' && data.experience.length === 0)).sort((a, b) => a.order - b.order);
  const active = useActiveSection(sections.map((section) => section.key));
  const resumeUrl = data.profile?.resume?.url;
  const resumePreviewUrl = resumeUrl ? getResumeDeliveryUrl(resumeUrl) : undefined;

  useEffect(() => {
    document.documentElement.dataset.lite = liteMode ? 'true' : 'false';
    try { window.localStorage.setItem('portfolio-lite-mode', liteMode ? 'on' : 'off'); } catch { /* Storage is optional. */ }
  }, [liteMode]);

  useEffect(() => {
    const toggleLiteMode = () => setLiteMode((value) => !value);
    window.addEventListener('portfolio:toggle-lite', toggleLiteMode);
    return () => window.removeEventListener('portfolio:toggle-lite', toggleLiteMode);
  }, []);
  const socials = [
    { href: data.profile?.socials.github, label: 'GitHub', Icon: Github },
    { href: data.profile?.socials.linkedin, label: 'LinkedIn', Icon: Linkedin },
    { href: data.profile?.socials.instagram, label: 'Instagram', Icon: Instagram },
  ].filter((item) => item.href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    focusable?.[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (event.key !== 'Tab' || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const navigate = (id: string) => {
    setOpen(false);
    if (location.pathname !== '/') {
      routerNavigate(`/#${id}`);
      return;
    }
    scrollToSection(id);
  };

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      <nav className="navbar container" aria-label="Main navigation">
        <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); navigate('top'); }}>
          <img className="brand-logo" src="/images/brand/Logo.png" alt="" width={42} height={38} /><span>{data.profile?.siteName ?? 'Yakshit Portfolio'}</span>
        </a>
        <div className="nav-links" aria-label="Portfolio sections">
          {sections.map((section) => (
            <a key={section.key} className={active === section.key ? 'is-active' : ''} href={`#${section.key}`} onClick={(event) => { event.preventDefault(); navigate(section.key); }}>{section.title}</a>
          ))}
        </div>
        <div className="nav-actions">
          <button className="nav-icon-button" type="button" aria-label="Open command palette" title="Search sections and projects (Ctrl+K)" onClick={() => window.dispatchEvent(new CustomEvent('portfolio:open-command-palette'))}><Search size={17} /></button>
          <button className="nav-icon-button" type="button" aria-label={liteMode ? 'Disable lite mode' : 'Enable lite mode'} aria-pressed={liteMode} title={liteMode ? 'Disable lite mode' : 'Enable lite mode'} onClick={() => setLiteMode((value) => !value)}>{liteMode ? <Sun size={17} /> : <Moon size={17} />}</button>
          {resumePreviewUrl && <a className="resume-link" href={resumePreviewUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackPortfolioEvent('resume_download')}>Resume</a>}
          <div className="nav-socials">
            {socials.map(({ href, label, Icon }) => <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" onClick={() => trackPortfolioEvent('social_click', label.toLowerCase())}><Icon size={17} /></a>)}
          </div>
          <button className="nav-tour-button" type="button" onClick={start}><Compass size={16} />Tour</button>
          <button ref={triggerRef} className="menu-toggle" type="button" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </nav>
      <AnimatePresence>
        {open && <motion.div id="mobile-navigation" ref={drawerRef} className="mobile-drawer" initial={reducedMotion ? false : { x: '100%' }} animate={{ x: 0 }} exit={reducedMotion ? undefined : { x: '100%' }} transition={{ duration: reducedMotion ? 0 : 0.28, ease: 'easeOut' }}>
          <p className="drawer-label">Navigate</p>
          {sections.map((section) => <a key={section.key} className={active === section.key ? 'is-active' : ''} href={`#${section.key}`} onClick={(event) => { event.preventDefault(); navigate(section.key); }}>{section.title}</a>)}
          <button className="nav-tour-button" type="button" onClick={() => { setOpen(false); start(); }}><Compass size={17} />Take a quick tour</button>
          <button className="nav-icon-button" type="button" aria-label="Open command palette" onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('portfolio:open-command-palette')); }}><Search size={17} /> Search</button>
          <button className="nav-icon-button" type="button" aria-pressed={liteMode} onClick={() => setLiteMode((value) => !value)}>{liteMode ? <Sun size={17} /> : <Moon size={17} />} {liteMode ? 'Standard mode' : 'Lite mode'}</button>
          {resumePreviewUrl && <a className="resume-link" href={resumePreviewUrl} target="_blank" rel="noopener noreferrer">Resume</a>}
          <div className="drawer-socials">{socials.map(({ href, label, Icon }) => <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" onClick={() => trackPortfolioEvent('social_click', label.toLowerCase())}><Icon size={18} /></a>)}</div>
        </motion.div>}
      </AnimatePresence>
    </header>
  );
}
