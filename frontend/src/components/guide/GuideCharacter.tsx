import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface GuideCharacterProps {
  src: string;
  side?: 'left' | 'right';
  flip?: boolean;
  alt?: string;
  className?: string;
}

export function GuideCharacter({ src, side = 'right', flip = false, alt = '', className = '' }: GuideCharacterProps) {
  const [available, setAvailable] = useState(true);
  const reducedMotion = useReducedMotion();
  if (!available) return null;
  return <motion.figure
    className={`guide-character guide-character--${side} ${className}`}
    initial={reducedMotion ? false : { opacity: 0, x: side === 'left' ? -22 : 22 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
    transition={{ duration: 4, repeat: reducedMotion ? 0 : Infinity, ease: 'easeInOut' }}
    aria-hidden={alt ? undefined : true}
  >
    <span className="guide-character-glow" aria-hidden="true" />
    <img src={src} alt={alt} aria-hidden={alt ? undefined : true} loading="lazy" width="420" height="480" style={{ transform: flip ? 'scaleX(-1)' : undefined }} onError={() => setAvailable(false)} />
  </motion.figure>;
}
