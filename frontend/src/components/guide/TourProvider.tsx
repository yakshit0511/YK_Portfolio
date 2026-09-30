import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { guideImagePaths, tourSteps, type TourStep } from '../../data/tourSteps';

interface TourContextValue {
  active: boolean;
  stepIndex: number;
  steps: TourStep[];
  currentStep: TourStep | null;
  start: () => void;
  next: () => void;
  back: () => void;
  stop: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  const start = useCallback(() => {
    const available = tourSteps.filter((step) => Boolean(document.querySelector(step.targetSelector)));
    if (!available.length) return;
    setSteps(available);
    setStepIndex(0);
    setActive(true);
    try {
      const firstGuide = new Image();
      firstGuide.src = guideImagePaths[0];
    } catch { /* Browser image preloading is optional. */ }
  }, []);

  const stop = useCallback(() => setActive(false), []);
  const next = useCallback(() => {
    let nextIndex = stepIndex + 1;
    while (nextIndex < steps.length && !document.querySelector(steps[nextIndex].targetSelector)) nextIndex += 1;
    if (nextIndex >= steps.length) stop();
    else setStepIndex(nextIndex);
  }, [stepIndex, steps, stop]);
  const back = useCallback(() => {
    let previousIndex = stepIndex - 1;
    while (previousIndex >= 0 && !document.querySelector(steps[previousIndex].targetSelector)) previousIndex -= 1;
    if (previousIndex >= 0) setStepIndex(previousIndex);
  }, [stepIndex, steps]);
  const value = useMemo(() => ({ active, stepIndex, steps, currentStep: steps[stepIndex] ?? null, start, next, back, stop }), [active, back, next, start, stepIndex, steps, stop]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const value = useContext(TourContext);
  if (!value) throw new Error('useTour must be used within TourProvider.');
  return value;
}
