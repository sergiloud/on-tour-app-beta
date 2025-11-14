import React from 'react';
import { motion, useReducedMotion } from '../framer-entry';
import { useHighContrast } from '../context/HighContrastContext';

export interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'primary' | 'ghost';
  glow?: boolean; // disable inner glow if false
}

/**
 * Elevated CTA button with subtle center glow + scale / press feedback.
 * Respects prefers-reduced-motion & high-contrast (disables animation + replaces glow with solid outline).
 */
// Framer's motion.button typing can conflict with extended HTML button handlers in strict TS.
// We cast to any for this wrapper component to avoid verbose generic plumbing while keeping external props typed.
// This is safe as we constrain outward interface via AnimatedButtonProps.
const MotionButton: any = motion.button;

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className = '',
  tone = 'primary',
  glow = true,
  ...rest
}) => {
  const prefersReduced = useReducedMotion();
  const { highContrast } = useHighContrast();

  const base = tone === 'primary'
    ? 'relative inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 disabled:opacity-60 disabled:cursor-not-allowed'
    : 'relative inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 disabled:opacity-60 disabled:cursor-not-allowed';

  const bg = tone === 'primary'
    ? 'bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 text-ink-900'
    : 'bg-slate-100 dark:bg-white/5 text-white hover:bg-white/10';

  return (
    <MotionButton
      className={`${base} ${bg} ${className}`}
      whileHover={prefersReduced ? undefined : { scale: 1.03 }}
      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20, mass: 0.4 }}
      {...rest}
    >
      {glow && !highContrast && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-md overflow-hidden"
          style={{ pointerEvents: 'none' }}
          initial={false}
        >
          {/* radial glow */}
          <motion.span
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(var(--accent-rgb),0.55), rgba(var(--accent-rgb),0) 70%)' }}
            animate={prefersReduced ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [0.9, 1.05, 0.9] }}
            transition={prefersReduced ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* rotating subtle sheen */}
          <motion.span
            className="absolute -inset-6 opacity-40 mix-blend-overlay"
            style={{ background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.4), transparent 60%)' }}
            animate={prefersReduced ? undefined : { rotate: 360 }}
            transition={prefersReduced ? undefined : { duration: 18, repeat: Infinity, ease: 'linear' }}
          />
        </motion.span>
      )}
      <span className="relative z-10">{children}</span>
      {highContrast && (
        <span aria-hidden className="absolute inset-0 rounded-md ring-2 ring-current" />
      )}
    </MotionButton>
  );
};

export default AnimatedButton;
