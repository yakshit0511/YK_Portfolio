import { useRef, type ComponentProps, type ReactNode } from 'react';
import { motion } from 'framer-motion';

type GlowButtonCommonProps = {
  children: ReactNode;
  variant?: 'primary' | 'outline';
};

type GlowAnchorProps = Omit<ComponentProps<typeof motion.a>, 'children'> & GlowButtonCommonProps & { as?: 'a' };
type GlowButtonElementProps = Omit<ComponentProps<typeof motion.button>, 'children'> & GlowButtonCommonProps & { as: 'button' };

export function GlowButton(props: GlowAnchorProps | GlowButtonElementProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null);

  if (props.as === 'button') {
    const { children, variant = 'primary', className = '', ...buttonProps } = props;
    return (
      <motion.button
        className={`glow-button glow-button--${variant} ${className}`}
        whileHover={window.matchMedia('(prefers-reduced-motion: reduce)').matches ? undefined : { y: -2 }}
        whileTap={{ scale: 0.98 }}
        {...buttonProps}
      >
        {children}
      </motion.button>
    );
  }

  const { children, variant = 'primary', className = '', onPointerMove, onPointerLeave, ...propsForAnchor } = props;

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
      {...propsForAnchor}
    >
      {children}
    </motion.a>
  );
}
