import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const colors = ['#54e3ff', '#67e8a5', '#ffb347', '#70a9ff', '#f7faff'];
const pieces = Array.from({ length: 48 }, (_, index) => ({
  color: colors[index % colors.length],
  style: {
    left: `${(index * 37) % 100}%`,
    '--confetti-x': `${(index * 53) % 241 - 120}px`,
    '--confetti-turn': `${index * 137}deg`,
    animationDelay: `${(index % 8) * 0.025}s`,
    animationDuration: `${1.3 + (index % 4) * 0.05}s`,
  } as CSSProperties,
}));

export function Confetti() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 1600);
    return () => window.clearTimeout(timeout);
  }, []);

  if (reducedMotion || !visible) return null;

  return <div className="contact-confetti" aria-hidden="true">
    {pieces.map((piece, index) => <i key={index} style={{ ...piece.style, backgroundColor: piece.color }} />)}
  </div>;
}