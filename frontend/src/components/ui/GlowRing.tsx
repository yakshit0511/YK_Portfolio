import { useReducedMotion } from '../../hooks/useReducedMotion';

export function GlowRing({ size = 42, className = '' }: { size?: number; className?: string }) {
  const reducedMotion = useReducedMotion();
  return <span className={`glow-ring${reducedMotion ? ' glow-ring--static' : ''} ${className}`} style={{ '--ring-size': `${size}px` } as React.CSSProperties} aria-hidden="true"><i /><i /></span>;
}
