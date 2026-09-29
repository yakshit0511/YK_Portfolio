import { useRef, type ComponentProps, type ReactNode } from 'react';
import { motion } from 'framer-motion';

type GlowButtonProps = Omit<ComponentProps<typeof motion.a>, 'children'> & {
  children: ReactNode;
  variant?: 'primary' | 'outline';
};

export function GlowButton({ children, variant = 'primary', className = '', onPointerMove, onPointerLeave, ...props }: GlowButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null);

  const moveMagnet = (event: React.PointerEvent<HTMLAnchorElement>) => {
    onPointerMove?.(event);
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) * 0.08;
    const y = (event.clientY - bounds.top - bounds.height / 2) * 0.08;
    if (buttonRef.current) buttonRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const resetMagnet = (event: React.PointerEvent<HTMLAnchorElement>) => {
    onPointerLeave?.(event);
    if (buttonRef.current) buttonRef.current.style.transform = '';
  };

  return (
    <motion.a
      ref={buttonRef}
      className={`glow-button glow-button--${variant} ${className}`}
      whileHover={window.matchMedia('(prefers-reduced-motion: reduce)').matches ? undefined : { y: -2 }}
      whileTap={{ scale: 0.98 }}
      onPointerMove={moveMagnet}
      onPointerLeave={resetMagnet}
      {...props}
    >
      {children}
    </motion.a>
  );
}
