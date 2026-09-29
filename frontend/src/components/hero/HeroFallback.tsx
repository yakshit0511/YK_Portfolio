import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const frameDurations = [3000, 2000, 1500, 2000, 2000, 3000];
const frames = Array.from({ length: 7 }, (_, index) => `/images/hero/hero-${index + 1}.jpg`);

interface NavigatorWithConnection extends Navigator {
  connection?: { saveData?: boolean; effectiveType?: string };
}

export function isSlowConnection(): boolean {
  const connection = (navigator as NavigatorWithConnection).connection;
  return connection?.saveData === true || connection?.effectiveType === '2g' || connection?.effectiveType === '3g';
}

export function HeroFallback({ onReady, onComplete }: { onReady?: () => void; onComplete?: () => void }) {
  const reducedMotion = useReducedMotion();
  const [frame, setFrame] = useState(reducedMotion ? frames.length - 1 : 0);

  useEffect(() => {
    onReady?.();
    if (reducedMotion) {
      setFrame(frames.length - 1);
      onComplete?.();
      return;
    }
    let index = 0;
    let timer = 0;
    const advance = () => {
      if (index >= frames.length - 1) {
        onComplete?.();
        return;
      }
      timer = window.setTimeout(() => {
        index += 1;
        setFrame(index);
        advance();
      }, frameDurations[index] ?? 3000);
    };
    advance();
    return () => window.clearTimeout(timer);
  }, [onComplete, onReady, reducedMotion]);

  return (
    <div className="hero-fallback" aria-label="Animated portfolio character illustration" role="img">
      {frames.map((src, index) => <img key={src} src={src} alt="" className={index === frame ? 'is-visible' : ''} onError={(event) => { event.currentTarget.style.display = 'none'; }} />)}
    </div>
  );
}
