import { motion } from 'framer-motion';
import { ArrowDownRight, Download, Eye, Sparkles } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { GuideCharacter } from '../guide/GuideCharacter';
import { CountUp } from '../ui/CountUp';
import { GlowButton } from '../ui/GlowButton';
import { GlowRing } from '../ui/GlowRing';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { TiltCard } from '../ui/TiltCard';
import { scrollToSection } from '../../utils/smoothScroll';
import { getResumeDeliveryUrl } from '../../utils/resumeUrl';

const highlights = ['Business Websites', 'ERP Systems', 'Admin Panels', 'REST APIs', 'WhatsApp API Integrations'];

export function About() {
  const { data } = usePortfolio();
  const profile = data.profile;
  const resumeUrl = profile?.resume?.url;
  const resumePreviewUrl = resumeUrl ? getResumeDeliveryUrl(resumeUrl) : undefined;
  const resumeDownloadUrl = resumeUrl ? getResumeDeliveryUrl(resumeUrl, true) : undefined;
  const paragraphs = (profile?.about ?? '').split(/\n\s*\n/).filter(Boolean);
  const orderedEducation = [...data.education].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const grade = orderedEducation[0]?.grade?.match(/[0-9]+(?:\.[0-9]+)?/)?.[0] ?? '0';
  const cgpa = Number.parseFloat(grade);
  const projectCount = data.projects.length;
  const technologyCount = data.skills.reduce((total, group) => total + group.items.filter((skill) => skill.visible !== false).length, 0);

  return <section id="about" className="portfolio-section about-section" aria-labelledby="about-heading">
    <div className="container">
      <SectionHeading label="01 / ABOUT" title="A little about me" />
      <div className="about-grid">
        <div className="about-copy">
          <div className="about-text">
            {paragraphs.map((paragraph, index) => <Reveal key={`${index}-${paragraph.slice(0, 10)}`} delay={index * 0.1}><p>{paragraph}</p></Reveal>)}
            <div className="about-highlights">{highlights.map((item) => <span className="about-highlight" key={item}><Sparkles size={13} />{item}</span>)}</div>
            <div className="about-actions">
              {resumePreviewUrl && resumeDownloadUrl && (
                <>
                  <GlowButton href={resumePreviewUrl} target="_blank" rel="noopener noreferrer"><Eye size={16} />View Resume</GlowButton>
                  <a href={resumeDownloadUrl} className="inline-flex items-center gap-2 rounded-full border border-blue-400/50 bg-slate-900/70 px-4 py-2 text-sm font-medium text-blue-200 transition hover:border-blue-300 hover:text-white"><Download size={16} />Download PDF</a>
                </>
              )}
              <GlowButton variant="outline" href="#projects" onClick={(event) => { event.preventDefault(); scrollToSection('projects'); }}><GlowRing size={24} />View Projects <ArrowDownRight size={16} /></GlowButton>
            </div>
          </div>
          <div className="about-stats">
            <TiltCard className="stat-card"><span className="stat-value"><CountUp value={cgpa} decimals={grade.includes('.') ? 2 : 0} /></span><span className="stat-label">CGPA</span></TiltCard>
            <TiltCard className="stat-card"><span className="stat-value"><CountUp value={projectCount} suffix="+" /></span><span className="stat-label">Projects</span></TiltCard>
            <TiltCard className="stat-card"><span className="stat-value"><CountUp value={technologyCount} suffix="+" /></span><span className="stat-label">Technologies</span></TiltCard>
          </div>
        </div>
        <motion.div className="about-art" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <GuideCharacter src="/images/cutouts/02_looks_left_3-5s%20(1).png" side="right" alt="Yakshit looking toward his introduction" />
        </motion.div>
      </div>
    </div>
  </section>;
}
