import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, X } from 'lucide-react';
import { useHeroContext } from '../../context/HeroContext';
import { useTour } from './TourProvider';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const dismissedKey = 'yakshit-portfolio-tour-dismissed';

export function TourInvite() {
  const { sequenceDone } = useHeroContext();
  const { start } = useTour();
  const reducedMotion = useReducedMotion();
  const [dismissed, setDismissed] = useState(() => {
    try { return window.localStorage.getItem(dismissedKey) === 'true'; }
    catch { return false; }
  });

  if (dismissed || !sequenceDone) return null;
  const dismiss = () => {
    setDismissed(true);
    try { window.localStorage.setItem(dismissedKey, 'true'); }
    catch { /* Dismissal still lasts for this page session. */ }
  };

  return <motion.aside className="tour-invite glass" initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.25 }} aria-label="Guided tour invitation">
    <button className="tour-invite-close icon-button" type="button" onClick={dismiss} aria-label="Dismiss tour invitation"><X size={15} /></button>
    <span className="tour-invite-icon"><Map size={18} /></span>
    <div><strong>New here?</strong><p>Let me show you around.</p><div className="tour-invite-actions"><button className="tour-next" type="button" onClick={() => { dismiss(); start(); }}>Start tour</button><button className="tour-text-button" type="button" onClick={dismiss}>No thanks</button></div></div>
  </motion.aside>;
}
