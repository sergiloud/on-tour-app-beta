// Centralized Framer Motion animation variants & helpers
// Respect reduced motion: components importing should gate heavy animations
// via prefers-reduced-motion or a provided flag.
import type { Variants } from 'framer-motion';

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export const fadeInFromBottom: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

export const fadeInSlow: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

export const scaleInSoft: Variants = {
  hidden: { scale: 0.96, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.45, ease: 'easeOut' } },
};

// Utility to noop variants when reduced motion is enabled
export function maybeReduce(variants: Variants, disabled: boolean): Variants {
  if (!disabled) return variants;
  return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
}

// ======= PERFORMANCE-OPTIMIZED VARIANTS (GPU-ACCELERATED) =======

// Optimized fade (GPU-accelerated with opacity only)
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

// Optimized slide (GPU-accelerated with transform)
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// Optimized scale (GPU-accelerated)
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// Stagger with capped delay for performance
export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03, // Faster stagger
      delayChildren: 0.05
    }
  }
};

// List item animation (optimized for many items)
export const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

// Hover states for interactive elements
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.15, ease: 'easeOut' }
};

export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get optimized variant with reduced motion fallback
 */
export const withReducedMotion = (variant: Variants): Variants => {
  return prefersReducedMotion() ? fadeIn : variant;
};
