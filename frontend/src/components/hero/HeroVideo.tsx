import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { HeroFallback, isSlowConnection } from './HeroFallback';
import { ScrollCue } from './ScrollCue';

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [fallback, setFallback] = useState(reducedMotion || isSlowConnection());
  const [ready, setReady] = useState(false);
  const [ended, setEnded] = useState(false);
  const [fallbackEnded, setFallbackEnded] = useState(false);

  const finishFallback = useCallback(() => setFallbackEnded(true), []);

  useEffect(() => {
    if (reducedMotion || isSlowConnection()) setFallback(true);
  }, [reducedMotion]);

  const startPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setReady(true);
    } catch {
      setFallback(true);
    }
  }, []);

  const replay = async () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setEnded(false);
    setFallback(false);
    try {
      await video.play();
      setReady(true);
    } catch {
      setFallback(true);
    }
  };

  return (
    <div className="hero-media-wrap">
      <motion.div className="hero-video-frame" whileHover={reducedMotion ? undefined : { rotateX: -1.5, rotateY: 2 }} transition={{ type: 'spring', stiffness: 140, damping: 18 }}>
        <div className="video-frame-glow" aria-hidden="true" />
        <video
          ref={videoRef}
          className={`hero-video${ready && !fallback ? ' is-ready' : ''}`}
          src={fallback ? undefined : '/videos/hero.mp4'}
          poster="/videos/hero-poster.jpg"
          muted
          playsInline
          autoPlay={!fallback}
          preload={fallback ? 'none' : 'auto'}
          aria-hidden="true"
          onCanPlay={() => { void startPlayback(); }}
          onEnded={() => setEnded(true)}
          onError={() => setFallback(true)}
        />
        {fallback && <HeroFallback onComplete={finishFallback} />}
        {!fallback && !ready && <img className="video-poster" src="/videos/hero-poster.jpg" alt="Animated character illustration representing Yakshit" onLoad={() => window.dispatchEvent(new Event('hero-poster-ready'))} onError={() => window.dispatchEvent(new Event('hero-poster-ready'))} />}
        {ended && !fallback && <button className="replay-button" type="button" onClick={() => void replay()} aria-label="Replay hero animation" title="Replay animation"><RotateCcw size={17} /></button>}
      </motion.div>
      {ended && !fallback && <ScrollCue />}
      {fallback && fallbackEnded && <ScrollCue />}
      <span className="sr-only">An animated portfolio character plays once and remains on its final frame.</span>
    </div>
  );
}
