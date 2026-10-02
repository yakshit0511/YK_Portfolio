import { motion } from 'framer-motion';
import { Reveal } from './Reveal';
import { TiltCard } from './TiltCard';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface TimelineEntry {
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  grade?: string;
  gradeNote?: string;
  current?: boolean;
  tags?: string[];
  percentage?: number;
}

export function Timeline({ items }: { items: TimelineEntry[] }) {
  const reducedMotion = useReducedMotion();
  return <div className="timeline">
    {items.map((item, index) => <Reveal className={`timeline-row${index % 2 ? ' timeline-row--reverse' : ''}`} key={`${item.title}-${index}`} delay={index * 0.08}>
      <span className="timeline-node" aria-hidden="true" />
      <TiltCard className="timeline-card glass-card">
        <div className="timeline-card-top"><span className="timeline-date">{item.date}</span>{item.current && <span className="current-badge"><i />Currently studying</span>}</div>
        <h3>{item.title}</h3>
        {item.subtitle && <p className="timeline-subtitle">{item.subtitle}</p>}
        {(item.grade || item.gradeNote) && <p className="timeline-grade">{item.grade}{item.gradeNote && <span>{item.gradeNote}</span>}</p>}
        {item.percentage !== undefined && <div className="timeline-percentage" aria-label={`${item.percentage}%`}><motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: item.percentage / 100 }} viewport={{ once: true }} transition={{ duration: 0.9 }} /></div>}
        {item.description && <p className="timeline-description">{item.description}</p>}
        {item.tags && item.tags.length > 0 && <div className="chip-row">{item.tags.map((tag) => <span className="skill-chip" key={tag}>{tag}</span>)}</div>}
      </TiltCard>
      <motion.span className="timeline-axis-marker" aria-hidden="true" initial={reducedMotion ? false : { scale: 0 }} whileInView={reducedMotion ? undefined : { scale: 1 }} viewport={{ once: true }} transition={{ duration: reducedMotion ? 0 : 0.3 }} />
    </Reveal>)}
  </div>;
}
