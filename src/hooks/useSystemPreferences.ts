import { useState, useEffect } from 'react';

interface SystemPreferences {
  /** User prefers dark color scheme */
  prefersDark: boolean;
  /** User prefers light color scheme */
  prefersLight: boolean;
  /** User prefers reduced motion */
  prefersReducedMotion: boolean;
  /** User prefers high contrast */
  prefersHighContrast: boolean;
  /** Current color scheme ('dark' | 'light') */
  colorScheme: 'dark' | 'light';
}

/**
 * Hook to detect and react to system preferences
 * Respects user's OS-level settings for accessibility and theming
 * 
 * @example
 * ```tsx
 * const { prefersDark, prefersReducedMotion } = useSystemPreferences();
 * 
 * // Apply theme
 * useEffect(() => {
 *   document.documentElement.classList.toggle('dark', prefersDark);
 * }, [prefersDark]);
 * 
 * // Simplify animations
 * const transition = prefersReducedMotion 
 *   ? { duration: 0 } 
 *   : { type: 'spring', stiffness: 300 };
 * ```
 */
export const useSystemPreferences = (): SystemPreferences => {
  const [prefersDark, setPrefersDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [prefersHighContrast, setPrefersHighContrast] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  });

  useEffect(() => {
    // Media query for dark mode
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setPrefersDark(e.matches);
    };
    
    darkModeQuery.addEventListener('change', handleDarkModeChange);

    // Media query for reduced motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Media query for high contrast
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };
    
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  return {
    prefersDark,
    prefersLight: !prefersDark,
    prefersReducedMotion,
    prefersHighContrast,
    colorScheme: prefersDark ? 'dark' : 'light',
  };
};

/**
 * Hook to get motion-safe transition values
 * Automatically respects prefers-reduced-motion
 * 
 * @example
 * ```tsx
 * const transition = useMotionSafeTransition({
 *   type: 'spring',
 *   stiffness: 300,
 *   damping: 25,
 * });
 * 
 * <motion.div transition={transition} />
 * ```
 */
export const useMotionSafeTransition = (
  fullMotion: any,
  reducedMotion: any = { duration: 0 }
) => {
  const { prefersReducedMotion } = useSystemPreferences();
  return prefersReducedMotion ? reducedMotion : fullMotion;
};

/**
 * Apply system preferences to document
 * Call once at app root to sync with OS settings
 */
export const applySystemPreferences = () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

  // Apply dark mode
  if (prefersDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Apply reduced motion
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduce-motion');
  } else {
    document.documentElement.classList.remove('reduce-motion');
  }

  // Apply high contrast
  if (prefersHighContrast) {
    document.documentElement.classList.add('high-contrast');
  } else {
    document.documentElement.classList.remove('high-contrast');
  }
};
