import { motion } from 'framer-motion';

export function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{label}</span>
      <h2>{title}</h2>
      <motion.span className="heading-underline" initial={{ scaleX: 0, transformOrigin: 'left' }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} />
    </div>
  );
}
