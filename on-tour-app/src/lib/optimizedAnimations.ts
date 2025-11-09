/**
 * Optimized Animation Utilities
 *
 * Alternativas CSS-first a Framer Motion para mejor rendimiento
 * Usar cuando no se necesiten animaciones complejas
 */

/**
 * Clases de animación CSS optimizadas
 * Usa CSS transitions en lugar de JS para mejor performance
 */
export const cssAnimations = {
  fadeIn: 'animate-fadeIn',
  slideUp: 'animate-slideUp',
  slideDown: 'animate-slideDown',
  scaleIn: 'animate-scaleIn',
  spinner: 'animate-spin',
} as const;

/**
 * Animaciones de Framer Motion optimizadas
 * Reducidas a lo esencial para minimizar cálculos JS
 */
export const optimizedMotion = {
  // Fade simple (mejor rendimiento que slideUp completo)
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 } // Más rápido = mejor UX
  },

  // Slide minimalista (solo translateY, sin scale)
  slideSimple: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } // Custom easing
  },

  // Scale simple para modals/tooltips
  scaleSimple: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15 }
  },

  // Hover interaction optimizada
  hover: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 }
  },

  // Stagger reducido (menos delay = más rápido)
  staggerFast: {
    animate: {
      transition: {
        staggerChildren: 0.03 // Reducido de 0.05-0.1
      }
    }
  }
} as const;

/**
 * Configuración de AnimatePresence optimizada
 */
export const presenceConfig = {
  mode: 'wait' as const, // Evita animaciones simultáneas
  initial: false // Previene animación inicial en mount
};

/**
 * Helper para crear variantes lazy (solo cuando se necesitan)
 */
export const createVariant = (
  from: Record<string, any>,
  to: Record<string, any>,
  duration: number = 0.2
) => ({
  initial: from,
  animate: to,
  transition: { duration, ease: [0.4, 0, 0.2, 1] }
});

/**
 * Reduce motion para usuarios que lo prefieren
 */
export const shouldReduceMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Wrapper condicional para animaciones
 */
export const conditionalMotion = (enabled: boolean) =>
  enabled && !shouldReduceMotion()
    ? optimizedMotion
    : { initial: {}, animate: {}, exit: {}, transition: {} };
