import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useIsMobile } from '../../hooks/useIsMobile';

export function BackgroundScene() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion || isMobile) return;
    const onMove = (event: MouseEvent) => {
      setOffset({
        x: ((event.clientX / window.innerWidth) - 0.5) * -30,
        y: ((event.clientY / window.innerHeight) - 0.5) * -30,
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [isMobile, reducedMotion]);

  return (
    <div className={`background-scene${isMobile ? ' background-scene--mobile' : ''}`} aria-hidden="true">
      <div className="background-image" style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1.04)` }} />
      <div className="background-overlay" />
    </div>
  );
}
