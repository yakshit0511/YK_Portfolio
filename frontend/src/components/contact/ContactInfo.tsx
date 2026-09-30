import { Check, Copy, Download, Github, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { GlowButton } from '../ui/GlowButton';
import { GlassCard } from '../ui/GlassCard';

export function ContactInfo() {
  const { data } = usePortfolio();
  const profile = data.profile;
  const { copied, copy } = useCopyToClipboard();
  const phone = profile?.phone;
  const digits = phone?.replace(/\D/g, '') || '';
  const whatsappNumber = digits.length === 10 ? `91${digits}` : digits;
  const socials = [
    { href: profile?.socials.github, label: 'GitHub', Icon: Github },
    { href: profile?.socials.linkedin, label: 'LinkedIn', Icon: Linkedin },
    { href: profile?.socials.instagram, label: 'Instagram', Icon: Instagram },
  ].filter((social) => social.href);

  return <div className="contact-info">
    <figure className="contact-character" aria-hidden="true">
      <span />
      <img src="/images/cutouts/05_wave_10-12s%20(1).png" alt="" />
    </figure>
    <div className="contact-info-cards">
      {profile?.email && <GlassCard className="contact-info-card" tabIndex={0}>
        <span className="contact-info-icon"><Mail size={18} /></span>
        <div className="contact-info-copy"><span>Email</span><a href={`mailto:${profile.email}`}>{profile.email}</a></div>
        <button className="contact-copy-button" type="button" onClick={() => void copy(profile.email!)} aria-label={copied ? 'Email copied' : 'Copy email address'}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <span className="sr-only" aria-live="polite">{copied ? 'Email copied to clipboard.' : ''}</span>
      </GlassCard>}
      {phone && <GlassCard className="contact-info-card" tabIndex={0}>
        <span className="contact-info-icon"><Phone size={18} /></span>
        <div className="contact-info-copy"><span>Phone</span><a href={`tel:${phone}`}>{phone}</a></div>
        {whatsappNumber && <a className="contact-copy-button" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" aria-label="Open WhatsApp chat"><MessageCircle size={16} /><span>WhatsApp</span></a>}
      </GlassCard>}
      {profile?.location && <GlassCard className="contact-info-card" tabIndex={0}>
        <span className="contact-info-icon"><MapPin size={18} /></span>
        <div className="contact-info-copy"><span>Location</span><strong>{profile.location}</strong></div>
      </GlassCard>}
    </div>
    {socials.length > 0 && <nav className="contact-socials" aria-label="Social profiles">
      {socials.map(({ href, label, Icon }) => <a key={label} className="contact-social-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        <Icon size={18} />
      </a>)}
    </nav>}
    {profile?.resume?.url && <GlowButton className="contact-resume" href={profile.resume.url} target="_blank" rel="noopener noreferrer"><Download size={16} />Download Resume</GlowButton>}
    <p className="contact-availability"><i aria-hidden="true" />Open to internships and full-time roles</p>
  </div>;
}