import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHeroContext, useSetSequenceDone } from '../../context/HeroContext';
import { ScrollCue } from './ScrollCue';
import { Picture } from '../ui/Picture';
import { getOptimizedImageSrc } from '../../utils/imageSources';

const frames = [
  { src: '/images/cutouts/01_coding_0-3s%20(1).png', duration: 3000 },
  { src: '/images/cutouts/02_looks_left_3-5s%20(1).png', duration: 2000 },
  { src: '/images/cutouts/03_looks_right_5-6.5s%20(1).png', duration: 1500 },
  { src: '/images/cutouts/04_remove_headset_8-10s%20(1).png', duration: 2000 },
  { src: '/images/cutouts/05_wave_10-12s%20(1).png', duration: 2000 },
  { src: '/images/cutouts/06_point_down_12-15s%20(1).png', duration: 3000 },
  { src: '/images/cutouts/07_final_pose%20(1).png', duration: 0 },
] as const;

const objectPositions = ['50% 50%', '50% 50%', '50% 50%', '50% 50%', '50% 50%', '50% 50%', '50% 50%'];

interface NavigatorWithConnection extends Navigator {
  connection?: { saveData?: boolean; effectiveType?: string };
}

function prefersStaticSequence(): boolean {
  if (typeof navigator === 'undefined') return false;
  const connection = (navigator as NavigatorWithConnection).connection;
  return connection?.saveData === true || connection?.effectiveType === '2g' || connection?.effectiveType === '3g';
}

export function HeroSequence() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { sequenceDone } = useHeroContext();
  const setSequenceDone = useSetSequenceDone();
  const [staticMode, setStaticMode] = useState(() => reducedMotion || prefersStaticSequence());
  const [frameIndex, setFrameIndex] = useState(() => reducedMotion || prefersStaticSequence() ? frames.length - 1 : 0);
  const [loaded, setLoaded] = useState<boolean[]>(() => frames.map(() => false));
  const [failed, setFailed] = useState<boolean[]>(() => frames.map(() => false));
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState === 'visible');
  const loadedRef = useRef(loaded);
  const failedRef = useRef(failed);
  const currentRef = useRef(frameIndex);
  const timerRef = useRef<number | null>(null);
  const requestFrameRef = useRef<(index: number) => void>(() => undefined);
  const deadlineRef = useRef(0);
  const remainingRef = useRef(0);
  const pendingIndexRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const showFrame = useCallback((index: number) => {
    clearTimer();
    pendingIndexRef.current = null;
    currentRef.current = index;
    setFrameIndex(index);
    if (index === frames.length - 1) {
      remainingRef.current = 0;
      setSequenceDone(true);
      return;
    }
    setSequenceDone(false);
    remainingRef.current = frames[index].duration;
    if (!tabVisible) return;
    deadlineRef.current = Date.now() + remainingRef.current;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      remainingRef.current = 0;
      requestFrameRef.current(index + 1);
    }, remainingRef.current);
  }, [clearTimer, setSequenceDone, tabVisible]);

  const requestFrame = useCallback((index: number) => {
    let nextIndex = index;
    while (nextIndex < frames.length && failedRef.current[nextIndex]) nextIndex += 1;
    if (nextIndex >= frames.length) {
      setSequenceDone(true);
      return;
    }
    if (!loadedRef.current[nextIndex]) {
      pendingIndexRef.current = nextIndex;
      return;
    }
    showFrame(nextIndex);
  }, [setSequenceDone, showFrame]);

  useEffect(() => { requestFrameRef.current = requestFrame; }, [requestFrame]);

  useEffect(() => {
    const nextStaticMode = reducedMotion || prefersStaticSequence();
    setStaticMode(nextStaticMode);
    if (nextStaticMode) {
      clearTimer();
      pendingIndexRef.current = frames.length - 1;
      setSequenceDone(true);
    } else setSequenceDone(false);
  }, [clearTimer, reducedMotion, setSequenceDone]);

  useEffect(() => {
    const selectedIndexes = staticMode ? [0, frames.length - 1] : frames.map((_, index) => index);
    const images: HTMLImageElement[] = [];
    let active = true;

    const updateLoaded = (index: number, success: boolean) => {
      if (!active) return;
      if (success) {
        loadedRef.current[index] = true;
        setLoaded([...loadedRef.current]);
        if (index === 0 && !startedRef.current && !staticMode) {
          startedRef.current = true;
          showFrame(0);
        }
        if (pendingIndexRef.current === index && tabVisible && !staticMode) showFrame(index);
      } else {
        failedRef.current[index] = true;
        setFailed([...failedRef.current]);
        if (pendingIndexRef.current === index && !staticMode) requestFrame(index + 1);
        if (index === 0 && !startedRef.current && !staticMode) {
          startedRef.current = true;
          requestFrame(1);
        }
        if (index === frames.length - 1 && staticMode) setSequenceDone(true);
      }
    };

    for (const index of selectedIndexes) {
      const image = new Image();
      images.push(image);
      image.onload = () => updateLoaded(index, true);
      image.onerror = () => updateLoaded(index, false);
      image.src = getOptimizedImageSrc(frames[index].src) ?? frames[index].src;
      if (image.complete) updateLoaded(index, image.naturalWidth > 0);
    }

    return () => {
      active = false;
      for (const image of images) {
        image.onload = null;
        image.onerror = null;
      }
    };
  }, [requestFrame, setSequenceDone, showFrame, staticMode, tabVisible]);

  useEffect(() => {
    if (!staticMode) return;
    if (loadedRef.current[frames.length - 1]) setFrameIndex(frames.length - 1);
  }, [loaded, staticMode]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setTabVisible(visible);
      if (!visible) {
        if (timerRef.current !== null) {
          remainingRef.current = Math.max(0, deadlineRef.current - Date.now());
          clearTimer();
        }
        return;
      }
      if (staticMode) return;
      const pendingIndex = pendingIndexRef.current;
      if (pendingIndex !== null && (loadedRef.current[pendingIndex] || failedRef.current[pendingIndex])) {
        requestFrame(failedRef.current[pendingIndex] ? pendingIndex + 1 : pendingIndex);
      } else if (timerRef.current === null && remainingRef.current > 0 && currentRef.current < frames.length - 1) {
        const currentIndex = currentRef.current;
        deadlineRef.current = Date.now() + remainingRef.current;
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          remainingRef.current = 0;
          requestFrame(currentIndex + 1);
        }, remainingRef.current);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [clearTimer, requestFrame, staticMode]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const replay = () => {
    clearTimer();
    startedRef.current = true;
    setSequenceDone(false);
    requestFrame(0);
  };

  return (
    <div className="hero-sequence-wrap">
      <motion.div
        className="hero-sequence-frame"
        whileHover={!isMobile && !reducedMotion ? { rotateX: -1.5, rotateY: 2 } : undefined}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      >
        <div className="sequence-frame-glow" aria-hidden="true" />
        <AnimatePresence initial={false} mode="sync">
          {loaded[frameIndex] && !failed[frameIndex] && <motion.div
            key={frameIndex}
            className="hero-sequence-image-wrap"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: staticMode ? 1 : 1.03 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: staticMode ? 0 : 0.6 }, scale: { duration: staticMode ? 0 : frames[frameIndex].duration / 1000, ease: 'linear' } }}
          >
            <Picture className="hero-sequence-image" src={frames[frameIndex].src} alt="" aria-hidden="true" width={720} height={900} style={{ objectPosition: objectPositions[frameIndex] }} />
          </motion.div>}
        </AnimatePresence>
        {loaded[frameIndex] && frameIndex === frames.length - 1 && !staticMode && <button className="sequence-replay" type="button" onClick={replay} aria-label="Replay hero image sequence" title="Replay sequence"><RotateCcw size={17} /></button>}
      </motion.div>
      <span className="sr-only">Yakshit waving hello and pointing down</span>
      {sequenceDone && <ScrollCue />}
    </div>
  );
}
