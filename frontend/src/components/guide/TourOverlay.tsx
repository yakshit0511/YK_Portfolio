import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTour } from './TourProvider';
import { GlowRing } from '../ui/GlowRing';
import { scrollToTarget } from '../../utils/smoothScroll';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const TourPip = lazy(() => import('./TourPip').then((module) => ({ default: module.TourPip })));

export function TourOverlay() {
  const { active, currentStep, stepIndex, steps, next, back, stop } = useTour();
  const reducedMotion = useReducedMotion();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const focusRestoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active && !focusRestoreRef.current) focusRestoreRef.current = document.activeElement as HTMLElement | null;
    if (!active && focusRestoreRef.current) {
      focusRestoreRef.current.focus();
      focusRestoreRef.current = null;
    }
  }, [active]);

  useEffect(() => {
    if (!active || !currentStep) return;
    const target = document.querySelector<HTMLElement>(currentStep.targetSelector);
    if (!target) { next(); return; }
    scrollToTarget(target, { center: true, immediate: reducedMotion });
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const currentTarget = document.querySelector<HTMLElement>(currentStep.targetSelector);
        if (!currentTarget) { next(); return; }
        setTargetRect(currentTarget.getBoundingClientRect());
      });
    };
    const settle = window.setTimeout(update, reducedMotion ? 40 : 850);
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [active, currentStep, next, reducedMotion]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stop();
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, back, next, stop]);

  return <AnimatePresence>{active && currentStep && <div className="tour-layer" aria-live="polite">
    {targetRect && <div className="tour-spotlight" style={{ left: targetRect.left - 8, top: targetRect.top - 8, width: targetRect.width + 16, height: targetRect.height + 16 }} aria-hidden="true"><GlowRing size={40} className="tour-target-glow" /></div>}
    <Suspense fallback={null}>{targetRect && <TourPip step={currentStep} stepIndex={stepIndex} stepCount={steps.length} targetRect={targetRect} onBack={back} onNext={next} onStop={stop} />}</Suspense>
    <span className="sr-only">Site tour step {stepIndex + 1}: {currentStep.title}. {currentStep.text}</span>
  </div>}</AnimatePresence>;
}
