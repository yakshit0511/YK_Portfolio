import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Github, Instagram, Linkedin, Menu, X } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { scrollToSection } from '../../utils/smoothScroll';

export function Navbar() {
  const { data } = usePortfolio();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sections = [...data.sections].filter((section) => section.visible).sort((a, b) => a.order - b.order);
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
    const targets = data.sections.filter((section) => section.visible).map(({ key }) => document.getElementById(key)).filter((item): item is HTMLElement => Boolean(item));
    if (!targets.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.2, 0.5] });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [data.sections]);

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
    scrollToSection(id);
    setOpen(false);
  };

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      <nav className="navbar container" aria-label="Main navigation">
        <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); navigate('top'); }}>
          <img className="brand-logo" src="/images/brand/Logo.png" alt="" /><span>{data.profile?.siteName ?? 'Yakshit Portfolio'}</span>
        </a>
        <div className="nav-links" aria-label="Portfolio sections">
          {sections.map((section) => (
            <a key={section.key} className={active === section.key ? 'is-active' : ''} href={`#${section.key}`} onClick={(event) => { event.preventDefault(); navigate(section.key); }}>{section.title}</a>
          ))}
        </div>
        <div className="nav-actions">
          {data.profile?.resume?.url && <a className="resume-link" href={data.profile.resume.url} target="_blank" rel="noopener noreferrer">Resume</a>}
          <div className="nav-socials">
            {socials.map(({ href, label, Icon }) => <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"><Icon size={17} /></a>)}
          </div>
          <button ref={triggerRef} className="menu-toggle" type="button" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </nav>
      <AnimatePresence>
        {open && <motion.div id="mobile-navigation" ref={drawerRef} className="mobile-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.28, ease: 'easeOut' }}>
          <p className="drawer-label">Navigate</p>
          {sections.map((section) => <a key={section.key} className={active === section.key ? 'is-active' : ''} href={`#${section.key}`} onClick={(event) => { event.preventDefault(); navigate(section.key); }}>{section.title}</a>)}
          {data.profile?.resume?.url && <a className="resume-link" href={data.profile.resume.url} target="_blank" rel="noopener noreferrer">Resume</a>}
          <div className="drawer-socials">{socials.map(({ href, label, Icon }) => <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"><Icon size={18} /></a>)}</div>
        </motion.div>}
      </AnimatePresence>
    </header>
  );
}
