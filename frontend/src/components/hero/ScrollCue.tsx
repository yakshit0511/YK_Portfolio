import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { scrollToSection } from '../../utils/smoothScroll';

export function ScrollCue() {
  const { data } = usePortfolio();
  const nextSection = [...data.sections].filter((section) => section.visible).sort((a, b) => a.order - b.order)[0]?.key;
  return (
    <motion.button className="scroll-cue" type="button" onClick={() => nextSection && scrollToSection(nextSection)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <span className="scroll-cue-mouse" aria-hidden="true"><span /></span>
      <span>Scroll down</span>
      <motion.span aria-hidden="true" animate={{ y: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity }}><ArrowDown size={15} /></motion.span>
    </motion.button>
  );
}
