import { motion } from 'framer-motion';

export function Loader({ progress, visible }: { progress: number; visible: boolean }) {
  return (
    <motion.div
      className="intro-loader"
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
      transition={{ duration: 0.65, ease: 'easeInOut' }}
      aria-hidden={!visible}
    >
      <div className="loader-mark" style={{ '--progress': `${progress}%` } as React.CSSProperties}>
        <span>YK</span>
      </div>
      <p>Yakshit Portfolio</p>
    </motion.div>
  );
}
