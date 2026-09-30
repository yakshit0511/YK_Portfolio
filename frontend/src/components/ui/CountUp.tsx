import { useEffect, useState } from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CountUpProps {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

export function CountUp({ value, suffix = '', decimals = 0, duration = 1200 }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion || !Number.isFinite(value)) {
      setCount(value || 0);
      return;
    }
    let frame = 0;
    const startedAt = performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setCount(value * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration, inView, reducedMotion, value]);

  return <span ref={ref}>{count.toFixed(decimals)}{suffix}</span>;
}
