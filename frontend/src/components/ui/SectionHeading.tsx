import { motion } from 'framer-motion';
import { GlowRing } from './GlowRing';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function SectionHeading({ label, title }: { label: string; title: string }) {
  const reducedMotion = useReducedMotion();
  const id = `${label.split('/').pop()?.trim().toLowerCase() || 'section'}-heading`;
  return (
    <div className="section-heading">
      <span className="eyebrow">{label}</span>
      <div className="section-title-row"><h2 id={id}>{title}</h2><GlowRing size={32} /></div>
      <motion.span className="heading-underline" initial={reducedMotion ? false : { scaleX: 0, transformOrigin: 'left' }} whileInView={reducedMotion ? undefined : { scaleX: 1 }} viewport={{ once: true }} transition={{ duration: reducedMotion ? 0 : 0.7 }} />
    </div>
  );
}
