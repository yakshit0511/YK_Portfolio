import { ArrowUp, Github, Instagram, Linkedin } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { scrollToSection } from '../../utils/smoothScroll';

export function Footer() {
  const { data } = usePortfolio();
  const socials = [
    { href: data.profile?.socials.github, label: 'GitHub', Icon: Github },
    { href: data.profile?.socials.linkedin, label: 'LinkedIn', Icon: Linkedin },
    { href: data.profile?.socials.instagram, label: 'Instagram', Icon: Instagram },
  ].filter((item) => item.href);

  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} Yakshit Koshiya. Built with the MERN stack.</span>
      <div className="footer-actions">
        {socials.map(({ href, label, Icon }) => (
          <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"><Icon size={17} /></a>
        ))}
        <button className="icon-button" type="button" aria-label="Back to top" onClick={() => scrollToSection('top')}><ArrowUp size={17} /></button>
      </div>
    </footer>
  );
}
