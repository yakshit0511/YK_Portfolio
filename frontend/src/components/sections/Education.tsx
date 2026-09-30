import { motion } from 'framer-motion';
import { usePortfolio } from '../../context/PortfolioContext';
import { GuideCharacter } from '../guide/GuideCharacter';
import { CountUp } from '../ui/CountUp';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { Timeline } from '../ui/Timeline';
import { GlassCard } from '../ui/GlassCard';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function Education() {
  const { data } = usePortfolio();
  const reducedMotion = useReducedMotion();
  const items = [...data.education].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const firstGrade = items[0]?.grade?.match(/[0-9]+(?:\.[0-9]+)?/)?.[0];
  const cgpa = firstGrade ? Number.parseFloat(firstGrade) : 0;
  const ringCircumference = 2 * Math.PI * 49;

  return <section id="education" className="portfolio-section education-section" aria-labelledby="education-heading">
    <div className="container">
      <SectionHeading label="04 / EDUCATION" title="Learning by doing" />
      <div className="education-layout">
        <Timeline items={items.map((item) => ({
          title: item.institution,
          subtitle: [item.degree, item.field].filter(Boolean).join(' · '),
          date: [item.startYear, item.endYear].filter(Boolean).join(' — '),
          description: item.description,
          grade: item.grade,
          gradeNote: item.gradeNote,
          percentage: item.grade?.includes('%') ? Number.parseFloat(item.grade) : undefined,
          current: Boolean(item.currentSemester),
        }))} />
        {firstGrade && <Reveal><GlassCard className="cgpa-card">
          <span className="eyebrow">ACADEMIC HIGHLIGHT</span>
          <div className="cgpa-ring-wrap">
            <svg className="cgpa-ring" viewBox="0 0 112 112" role="img" aria-label={`${cgpa} out of 10 CGPA`}>
              <circle className="cgpa-track" cx="56" cy="56" r="49" />
              <motion.circle className="cgpa-progress" cx="56" cy="56" r="49" initial={reducedMotion ? false : { strokeDashoffset: ringCircumference }} whileInView={reducedMotion ? undefined : { strokeDashoffset: ringCircumference * (1 - Math.min(cgpa / 10, 1)) }} viewport={{ once: true }} transition={{ duration: reducedMotion ? 0 : 1.2, ease: 'easeOut' }} style={{ strokeDasharray: ringCircumference, strokeDashoffset: reducedMotion ? ringCircumference * (1 - Math.min(cgpa / 10, 1)) : undefined }} />
            </svg>
            <strong><CountUp value={cgpa} decimals={firstGrade.includes('.') ? 2 : 0} /></strong>
          </div>
          <span className="cgpa-caption">{items[0]?.gradeNote || 'CGPA'} · out of 10</span>
        </GlassCard></Reveal>}
        <GuideCharacter src="/images/cutouts/04_education_grad-cap.png" side="right" alt="Yakshit celebrating his education" />
      </div>
    </div>
  </section>;
}
