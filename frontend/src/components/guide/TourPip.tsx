import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { guideImagePaths, type TourStep } from '../../data/tourSteps';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface TourPipProps {
  step: TourStep;
  stepIndex: number;
  stepCount: number;
  targetRect: DOMRect;
  onBack: () => void;
  onNext: () => void;
  onStop: () => void;
}

function guideForTarget(rect: DOMRect): number {
  const column = rect.left + rect.width / 2 < window.innerWidth / 3 ? 2 : rect.left + rect.width / 2 > window.innerWidth * 2 / 3 ? 0 : 1;
  const row = rect.top + rect.height / 2 < window.innerHeight / 3 ? 2 : rect.top + rect.height / 2 > window.innerHeight * 2 / 3 ? 0 : 1;
  return row * 3 + column;
}

function pipPosition(rect: DOMRect): React.CSSProperties {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const horizontal = centerX < window.innerWidth / 2 ? 'right' : 'left';
  const vertical = centerY < window.innerHeight / 2 ? 'bottom' : 'top';
  return { [vertical]: '22px', [horizontal]: '22px' };
}

export function TourPip({ step, stepIndex, stepCount, targetRect, onBack, onNext, onStop }: TourPipProps) {
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const pipRef = useRef<HTMLElement>(null);
  const guideIndex = guideForTarget(targetRect);
  const imagePath = guideImagePaths[guideIndex];

  useEffect(() => {
    for (const path of guideImagePaths.slice(1)) {
      const image = new Image();
      image.src = path;
    }
  }, []);

  useEffect(() => setFailed(false), [imagePath]);
  useEffect(() => { pipRef.current?.focus(); }, [stepIndex]);

  return <motion.aside ref={pipRef} tabIndex={-1} className="tour-pip glass" style={pipPosition(targetRect)} role="dialog" aria-label="Site tour" initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.25 }}>
    <button className="tour-close icon-button" type="button" onClick={onStop} aria-label="Close site tour"><X size={16} /></button>
    {!failed && <div className="tour-pip-image"><AnimatePresence mode="wait" initial={false}><motion.img key={imagePath} src={imagePath} alt="" aria-hidden="true" width="300" height="170" loading="lazy" onError={() => setFailed(true)} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.3 }} /></AnimatePresence></div>}
    <div className="tour-pip-copy" aria-live="polite"><span className="eyebrow">TOUR {String(stepIndex + 1).padStart(2, '0')} / {String(stepCount).padStart(2, '0')}</span><h2>{step.title}</h2><p>{step.text}</p></div>
    <div className="tour-controls">
      <button type="button" className="tour-text-button" onClick={onStop}>Skip</button>
      <div className="tour-control-main">
        <button type="button" className="icon-button" onClick={onBack} disabled={stepIndex === 0} aria-label="Previous tour step"><ArrowLeft size={16} /></button>
        <div className="tour-dots" aria-label={`Step ${stepIndex + 1} of ${stepCount}`}>{Array.from({ length: stepCount }, (_, index) => <i key={index} className={index === stepIndex ? 'is-active' : ''} />)}</div>
        <button type="button" className="tour-next" onClick={onNext}>{stepIndex === stepCount - 1 ? 'Finish' : <>Next <ArrowRight size={14} /></>}</button>
      </div>
    </div>
  </motion.aside>;
}
