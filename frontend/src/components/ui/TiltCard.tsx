import { useState, type PointerEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const disabled = isMobile || reducedMotion;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setTilt({ x: (0.5 - y) * 8, y: (x - 0.5) * 8, glareX: x * 100, glareY: y * 100 });
  };

  return <motion.div
    className={`tilt-card ${className}`}
    onPointerMove={onPointerMove}
    onPointerLeave={() => setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 })}
    style={disabled ? undefined : {
      transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      '--glare-x': `${tilt.glareX}%`, '--glare-y': `${tilt.glareY}%`,
    } as React.CSSProperties}
    transition={{ type: 'spring', stiffness: 180, damping: 20 }}
  >{children}</motion.div>;
}
