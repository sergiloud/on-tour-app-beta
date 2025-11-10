// Centralized Framer Motion animation variants & helpers
// Optimized for speed and smoothness with custom easing curves
// Respect reduced motion: components importing should gate heavy animations
// via prefers-reduced-motion or a provided flag.
import type { Variants } from 'framer-motion';

// Custom easing curves for smooth, fast feel
const EASING = {
  // Ease out with overshoot for natural feel
  smooth: [0.16, 1, 0.3, 1] as const,
  // Sharp exit for quick transitions
  exit: [0.7, 0, 0.84, 0] as const,
  // Subtle bounce for playful interactions
  bounce: [0.34, 1.56, 0.64, 1] as const,
  // Default ease for standard animations
  default: [0.4, 0, 0.2, 1] as const,
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05, // Faster than 0.2
      delayChildren: 0.02,
    },
  },
};

export const fadeInFromBottom: Variants = {
  hidden: { y: 12, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: EASING.smooth }
  },
};

export const fadeInSlow: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASING.default } },
};

export const scaleInSoft: Variants = {
  hidden: { scale: 0.97, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.25, ease: EASING.smooth }
  },
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
    transition: { duration: 0.15, ease: EASING.smooth }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: EASING.exit }
  }
};

// Optimized slide (GPU-accelerated with transform)
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: EASING.smooth }
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.15, ease: EASING.exit }
  }
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.18, ease: EASING.smooth }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.15, ease: EASING.exit }
  }
};

// Optimized scale (GPU-accelerated)
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: EASING.smooth }
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.15, ease: EASING.exit }
  }
};

// Stagger with faster rhythm for snappy feel
export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.02, // Ultra-fast stagger
      delayChildren: 0.03
    }
  }
};

// List item animation (optimized for many items)
export const listItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: EASING.smooth }
  }
};

// Hover states for interactive elements - instant response
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.12, ease: EASING.smooth }
};

export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.08, ease: EASING.exit }
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

/**
 * Spring configs optimized for smooth, fast animations
 */
export const SPRING = {
  // Snappy spring for quick interactions
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8
  },
  // Smooth spring for page transitions
  smooth: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 35,
    mass: 1
  },
  // Bouncy spring for playful elements
  bouncy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 25,
    mass: 0.6
  },
  // Gentle spring for large elements
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 30,
    mass: 1.2
  }
};
