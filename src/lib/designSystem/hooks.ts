/**
 * Custom Hooks para Animaciones y Efectos del Design System
 */

import { useEffect, useState } from 'react';
import { animationPresets, transitionTokens } from './tokens';

/**
 * Hook para controlar el estado de carga/error con animación
 */
export function useAnimatedState(initialState: boolean = false, delay: number = 300) {
  const [state, setState] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggle = (newState: boolean) => {
    setIsAnimating(true);
    setTimeout(() => {
      setState(newState);
      setIsAnimating(false);
    }, delay);
  };

  return { state, isAnimating, toggle, setState };
}

/**
 * Hook para detectar cuando un elemento entra en viewport (Intersection Observer)
 */
export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(ref);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, options]);

  return { isInView, ref: setRef };
}

/**
 * Hook para animación de contador (incremento gradual)
 */
export function useCounterAnimation(finalValue: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startValue = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentValue = Math.floor(startValue + (finalValue - startValue) * progress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [finalValue, duration]);

  return displayValue;
}

/**
 * Hook para manejar hover effects con debounce
 */
export function useHoverEffect(onEnter?: () => void, onLeave?: () => void, delay: number = 0) {
  const [isHovered, setIsHovered] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => {
      setIsHovered(true);
      onEnter?.();
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsHovered(false);
    onLeave?.();
  };

  return {
    isHovered,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}

/**
 * Hook para animación de carga (skeleton)
 */
export function useSkeletonAnimation() {
  return animationPresets.fadeIn;
}

/**
 * Hook para gestionar animaciones staggered (en cascada)
 */
export function useStaggerAnimation(itemCount: number, delay: number = 0.1) {
  return {
    container: animationPresets.staggerContainer,
    item: (index: number) => ({
      ...animationPresets.staggerItem,
      transition: {
        ...animationPresets.staggerItem.transition,
        delay: index * delay,
      },
    }),
  };
}

/**
 * Hook para detectar scroll y aplicar animaciones
 */
export function useScrollAnimation() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
}

/**
 * Hook para animar valores con Spring physics
 */
export function useSpringValue(targetValue: number, stiffness: number = 100, damping: number = 10) {
  const [value, setValue] = useState(targetValue);
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    let animationId: number;
    let currentVelocity = velocity;
    let currentValue = value;

    const animate = () => {
      const displacement = targetValue - currentValue;
      const acceleration = (displacement * stiffness) / 1000 - (currentVelocity * damping) / 1000;

      currentVelocity += acceleration;
      currentValue += currentVelocity;

      setValue(currentValue);
      setVelocity(currentVelocity);

      if (Math.abs(displacement) > 0.01 || Math.abs(currentVelocity) > 0.01) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [targetValue, stiffness, damping, velocity]);

  return value;
}

/**
 * Hook para pulse animation (latido)
 */
export function usePulseAnimation() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return pulse;
}

/**
 * Hook para transiciones suaves entre temas
 */
export function useThemeTransition(duration: number = transitionTokens.duration.normal * 1000) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transition = (callback: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setIsTransitioning(false);
    }, duration);
  };

  return { isTransitioning, transition };
}

/**
 * Hook para detectar modo oscuro/claro del sistema
 */
export function useSystemTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    setIsDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isDark;
}

/**
 * Hook para animaciones de page transition
 */
export function usePageTransition() {
  return {
    enter: animationPresets.fadeInUp,
    exit: animationPresets.fadeInUp,
  };
}
