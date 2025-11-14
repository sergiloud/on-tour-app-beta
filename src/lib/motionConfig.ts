/**
 * Framer Motion configuration and optimizations
 * Reduce animation overhead by disabling animations in certain scenarios
 */

// Reduce motion preference
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Common animation variants optimized for performance
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

// Optimized transition settings
export const fastTransition = {
  type: 'tween' as const,
  duration: 0.2,
  ease: 'easeOut' as const,
};

export const normalTransition = {
  type: 'tween' as const,
  duration: 0.3,
  ease: 'easeInOut' as const,
};

// Layout animation optimization
export const layoutTransition = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
};

// Disable animations for low-end devices
export const getAnimationConfig = () => {
  if (shouldReduceMotion()) {
    return { transition: { duration: 0 } };
  }
  return {};
};
