import { motion } from 'framer-motion';
import type { ComponentProps, ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface RevealProps extends Omit<ComponentProps<typeof motion.div>, 'children'> {
  children: ReactNode;
  delay?: number;
  stagger?: number;
}

export function Reveal({ children, delay = 0, stagger = 0, className = '', ...props }: RevealProps) {
  const reducedMotion = useReducedMotion();
  return <motion.div
    className={className}
    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.12 }}
    transition={reducedMotion ? { duration: 0 } : { duration: 0.55, delay, staggerChildren: stagger }}
    {...props}
  >{children}</motion.div>;
}
