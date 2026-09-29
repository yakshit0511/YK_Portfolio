import { motion, useReducedMotion } from 'framer-motion';
import type { ComponentProps, ReactNode } from 'react';

type GlassCardProps = Omit<ComponentProps<typeof motion.div>, 'children'> & {
  children: ReactNode;
  tilt?: boolean;
};

export function GlassCard({ children, tilt = false, className = '', ...props }: GlassCardProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={`glass-card ${className}`}
      whileHover={tilt && !reducedMotion ? { rotateX: -2, rotateY: 3, y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
