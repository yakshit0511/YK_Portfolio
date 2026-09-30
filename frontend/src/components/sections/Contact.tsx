import { useEffect, useRef } from 'react';
import { warmUpServer } from '../../api/contact';
import { usePortfolio } from '../../context/PortfolioContext';
import { useInView } from '../../hooks/useInView';
import { SectionHeading } from '../ui/SectionHeading';
import { ContactForm } from '../contact/ContactForm';
import { ContactInfo } from '../contact/ContactInfo';

export function Contact() {
  const { data } = usePortfolio();
  const { ref, inView } = useInView<HTMLElement>({ rootMargin: '400px' });
  const warmed = useRef(false);
  const visibleSections = data.sections
    .filter((section) => section.visible && !(section.key === 'experience' && data.experience.length === 0))
    .sort((first, second) => first.order - second.order);
  const contactPosition = Math.max(1, visibleSections.findIndex((section) => section.key === 'contact') + 1);

  useEffect(() => {
    if (inView && !warmed.current) {
      warmed.current = true;
      warmUpServer();
    }
  }, [inView]);

  return <section ref={ref} id="contact" className="portfolio-section contact-section" aria-labelledby="contact-heading">
    <div className="container">
      <SectionHeading label={`${String(contactPosition).padStart(2, '0')} / CONTACT`} title="Let's Talk" />
      <p className="contact-lead">Have an idea, a project, or an opportunity? Send me a message and I&apos;ll get back to you soon.</p>
      <div className="contact-layout">
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  </section>;
}