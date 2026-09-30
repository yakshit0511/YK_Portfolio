import { ArrowUp, Github, Instagram, Linkedin, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { scrollToSection } from '../../utils/smoothScroll';

export function Footer() {
  const { data } = usePortfolio();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const quickLinks = data.sections.filter((section) =>
    section.visible && !(section.key === 'experience' && data.experience.length === 0)
  );
  const socials = [
    { href: data.profile?.socials.github, label: 'GitHub', Icon: Github },
    { href: data.profile?.socials.linkedin, label: 'LinkedIn', Icon: Linkedin },
    { href: data.profile?.socials.instagram, label: 'Instagram', Icon: Instagram },
  ].filter((item) => item.href);

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <span>© {new Date().getFullYear()} Yakshit Koshiya. Built with the MERN stack.</span>
        <nav className="footer-quick-links" aria-label="Quick links">
          {quickLinks.map((section) => <a key={section.key} href={`/#${section.key}`} onClick={(event) => { event.preventDefault(); if (location.pathname !== '/') routerNavigate(`/#${section.key}`); else scrollToSection(section.key); }}>{section.title}</a>)}
        </nav>
      </div>
      <div className="footer-actions">
        {socials.map(({ href, label, Icon }) => (
          <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"><Icon size={17} /></a>
        ))}
        <button className="icon-button" type="button" aria-label="Privacy settings" title="Privacy settings" onClick={() => window.dispatchEvent(new CustomEvent('portfolio:privacy-settings'))}><ShieldCheck size={16} /></button>
        <button className="icon-button" type="button" aria-label="Back to top" onClick={() => { if (location.pathname !== '/') routerNavigate('/#top'); else scrollToSection('top'); }}><ArrowUp size={17} /></button>
      </div>
    </footer>
  );
}
