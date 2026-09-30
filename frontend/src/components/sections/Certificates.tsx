import { Award, ExternalLink } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SectionHeading } from '../ui/SectionHeading';

export function Certificates() {
  const { data } = usePortfolio();
  const certificates = [...data.certificates].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!certificates.length) return null;

  return <section id="certificates" className="portfolio-section certificates-section" aria-labelledby="certificates-heading">
    <div className="container">
      <SectionHeading label="04 / CREDENTIALS" title="Certificates & recognition" />
      <div className="certificates-grid">
        {certificates.map((certificate) => <article className="certificate-item" key={`${certificate.title}-${certificate.credentialId || certificate.issuer || ''}`}>
          {certificate.image?.url
            ? <img className="certificate-image" src={certificate.image.url} alt={`${certificate.title} credential`} loading="lazy" />
            : <div className="certificate-mark" aria-hidden="true"><Award size={24} /></div>}
          <div className="certificate-copy">
            <p className="eyebrow">{certificate.type || 'certificate'}{certificate.issueDate ? ` / ${certificate.issueDate}` : ''}</p>
            <h3>{certificate.title}</h3>
            {certificate.issuer && <p className="certificate-issuer">{certificate.issuer}</p>}
            {certificate.description && <p className="certificate-description">{certificate.description}</p>}
            {certificate.credentialUrl && <a href={certificate.credentialUrl} target="_blank" rel="noopener noreferrer">View credential <ExternalLink size={14} /></a>}
          </div>
        </article>)}
      </div>
    </div>
  </section>;
}