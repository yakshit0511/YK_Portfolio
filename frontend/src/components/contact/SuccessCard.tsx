import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, RotateCcw } from 'lucide-react';
import { scrollToSection } from '../../utils/smoothScroll';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { GlowRing } from '../ui/GlowRing';
import { Confetti } from './Confetti';
import { Picture } from '../ui/Picture';

interface SuccessCardProps {
  firstName: string;
  email: string;
  onSendAnother: () => void;
}

export function SuccessCard({ firstName, email, onSendAnother }: SuccessCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return <motion.div
    className="contact-success"
    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
    transition={{ duration: reducedMotion ? 0.1 : 0.28 }}
  >
    <Confetti />
    <motion.div
      className="contact-success-art"
      initial={reducedMotion ? false : { scale: 0.72, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 13 }}
      aria-hidden="true"
    >
      <GlowRing size={158} className="contact-success-ring" />
      <Picture src="/images/cutouts/07_final_pose%20(1).png" alt="" width={420} height={480} />
    </motion.div>
    <span className="eyebrow">MESSAGE RECEIVED</span>
    <h3 ref={headingRef} tabIndex={-1} aria-live="polite">Message sent!</h3>
    <p>Thanks {firstName}, I&apos;ll reply to <a href={`mailto:${email}`}>{email}</a> soon.</p>
    <div className="contact-success-actions">
      <button className="glow-button glow-button--outline" type="button" onClick={onSendAnother}><RotateCcw size={16} />Send another message</button>
      <button className="glow-button glow-button--primary" type="button" onClick={() => scrollToSection('top')}><ArrowUp size={16} />Back to top</button>
    </div>
  </motion.div>;
}