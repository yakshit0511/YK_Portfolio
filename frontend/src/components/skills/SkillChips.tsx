import { motion } from 'framer-motion';
import type { Skill } from '../../types/portfolio';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function SkillChips({ skills }: { skills: Skill[] }) {
  const reducedMotion = useReducedMotion();
  const visible = skills.filter((skill) => skill.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return <div className="skill-chip-list">{visible.map((skill, index) => <motion.span
    key={`${skill.name}-${index}`}
    className="skill-chip"
    initial={reducedMotion ? false : { opacity: 0, scale: 0.88 }}
    whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: reducedMotion ? 0 : 0.25, delay: reducedMotion ? 0 : Math.min(index * 0.035, 0.28) }}
  >{skill.name}</motion.span>)}</div>;
}
