import type { Variants } from 'framer-motion';

/**
 * iOS-native page transitions
 * Push: Slide from right with parallax
 * Pop: Slide to right with parallax
 */
export const pageTransitions: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 35,
      mass: 0.8,
      opacity: { duration: 0.15 },
    },
  },
  exit: {
    x: '-30%',
    opacity: 0.5,
    scale: 0.95,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * iOS-native page transitions with parallax effect
 * Background page moves slower (parallax depth)
 */
export const pageTransitionsParallax: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 35,
      mass: 0.8,
      opacity: { duration: 0.2 },
    },
  },
  exit: {
    x: '-30%',
    opacity: 0.7,
    scale: 0.92,
    filter: 'brightness(0.85)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * iOS-native modal transitions
 * Present: Slide up from bottom with spring overshoot
 * Dismiss: Slide down to bottom
 */
export const modalTransitions: Variants = {
  initial: {
    y: '100%',
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25, // Reduced for more bounce
      mass: 0.6,
      opacity: { duration: 0.15 },
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.6, 1],
    },
  },
};

/**
 * Enhanced modal with backdrop scale effect
 * Backdrop scales from 0.95 to 1 on dismiss for depth
 */
export const modalTransitionsWithBackdrop: Variants = {
  initial: {
    y: '100%',
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      mass: 0.6,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.6, 1],
    },
  },
};

/**
 * Backdrop transition for modal backgrounds
 * Scales content behind modal for depth effect
 */
export const backdropTransitions: Variants = {
  initial: {
    opacity: 0,
    scale: 1,
  },
  animate: {
    opacity: 1,
    scale: 0.95,
    transition: {
      opacity: { duration: 0.2 },
      scale: { type: 'spring', stiffness: 300, damping: 30 },
    },
  },
  exit: {
    opacity: 0,
    scale: 1,
    transition: {
      opacity: { duration: 0.15 },
      scale: { type: 'spring', stiffness: 300, damping: 30 },
    },
  },
};

/**
 * iOS-native card transitions
 * Scale and fade for cards/sheets
 */
export const cardTransitions: Variants = {
  initial: {
    scale: 0.92,
    opacity: 0,
    y: 20,
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 0.5,
    },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
};

/**
 * iOS-native overlay transitions
 * Backdrop fade
 */
export const overlayTransitions: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

/**
 * iOS-native list item transitions
 * Staggered entrance
 */
export const listItemTransitions: Variants = {
  initial: {
    opacity: 0,
    x: -10,
  },
  animate: (custom: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.04,
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
  exit: {
    opacity: 0,
    x: 10,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
};

/**
 * iOS-native button press
 * Scale down on tap
 */
export const buttonPressTransition = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
};

/**
 * iOS-native FAB entrance
 * Bounce in from bottom-right
 */
export const fabTransitions: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.3,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};
