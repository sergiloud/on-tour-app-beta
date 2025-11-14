import React, { useMemo } from 'react';
import { useHighContrast } from '../context/HighContrastContext';

export interface SimpleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'primary' | 'ghost';
  glow?: boolean; // disable inner glow if false
}

/**
 * Simple CTA button with CSS animations (NO framer-motion).
 * Use this instead of AnimatedButton to avoid vendor bundle circular dependencies.
 * For complex animations, use AnimatedButton.
 */
export const SimpleButton: React.FC<SimpleButtonProps> = ({
  children,
  className = '',
  tone = 'primary',
  glow = true,
  ...rest
}) => {
  const { highContrast } = useHighContrast();
  
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const base = tone === 'primary'
    ? 'relative inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200'
    : 'relative inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200';

  const bg = tone === 'primary'
    ? 'bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 text-ink-900'
    : 'bg-slate-100 dark:bg-white/5 text-white hover:bg-white/10';

  const hoverScale = !prefersReducedMotion ? 'hover-scale active-scale' : '';

  return (
    <button
      className={`${base} ${bg} ${hoverScale} ${className}`}
      {...rest}
    >
      {glow && !highContrast && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-md overflow-hidden pointer-events-none"
        >
          {/* radial glow */}
          <span
            className="absolute inset-0 animate-pulse-slow"
            style={{ 
              background: 'radial-gradient(circle at 50% 50%, rgba(var(--accent-rgb),0.55), rgba(var(--accent-rgb),0) 70%)',
              animationDuration: '6s'
            }}
          />
        </span>
      )}
      {children}
    </button>
  );
};
