/**
 * Accessibility Utilities & Hooks
 *
 * WCAG AA compliant accessibility helpers
 * Screen reader support, keyboard navigation, focus management
 * @module lib/accessibility
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * useKeyboard
 * Handle keyboard events with proper event delegation
 */
export function useKeyboard(
  onKeyDown?: Record<string, (e: KeyboardEvent) => void>,
  onKeyUp?: Record<string, (e: KeyboardEvent) => void>
) {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const handler = onKeyDown?.[e.key];
      if (handler) {
        e.preventDefault();
        handler(e);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const handler = onKeyUp?.[e.key];
      if (handler) {
        handler(e);
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('keyup', handleKeyUp);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('keyup', handleKeyUp);
    };
  }, [onKeyDown, onKeyUp]);

  return elementRef;
}

/**
 * useFocusManagement
 * Manage focus restoration after modals close
 */
export function useFocusManagement() {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    previousActiveElement.current?.focus();
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * useFocusTrap
 * Keep focus within a container (for modals, menus)
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || !ref.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const container = ref.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] || null;
      const lastElement = focusableElements[focusableElements.length - 1] || null;
      const activeElement = document.activeElement;

      if (e.shiftKey) {
        if (activeElement === firstElement && lastElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (activeElement === lastElement && firstElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ref, enabled]);
}

/**
 * useAriaLabel
 * Generate proper ARIA labels
 */
export function useAriaLabel(
  label?: string,
  description?: string
): React.AriaAttributes {
  return {
    'aria-label': label,
    'aria-description': description,
  };
}

// ============================================================================
// SCREEN READER SUPPORT
// ============================================================================

/**
 * Announce
 * Announce messages to screen readers using live regions
 */
export class ScreenReaderAnnouncer {
  private liveRegion: HTMLElement | null = null;

  constructor(politeness: 'polite' | 'assertive' = 'polite') {
    if (typeof document === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', politeness);
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';

    document.body.appendChild(this.liveRegion);
  }

  announce(message: string): void {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = message;
  }

  clear(): void {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = '';
  }

  destroy(): void {
    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
    }
  }
}

/**
 * useAnnounce
 * Hook for screen reader announcements
 */
export function useAnnounce(politeness: 'polite' | 'assertive' = 'polite') {
  const announcerRef = useRef<ScreenReaderAnnouncer | null>(null);

  useEffect(() => {
    announcerRef.current = new ScreenReaderAnnouncer(politeness);
    return () => {
      announcerRef.current?.destroy();
    };
  }, [politeness]);

  return useCallback((message: string) => {
    announcerRef.current?.announce(message);
  }, []);
}

// ============================================================================
// SKIP LINKS
// ============================================================================

/**
 * SkipLink
 * Accessibility skip link component
 */
export function createSkipLink(href: string, label: string = 'Skip to main content'): HTMLElement {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = label;
  link.className = 'skip-link';
  link.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 100;

    &:focus {
      top: 0;
    }
  `;

  return link;
}

// ============================================================================
// CONTRAST & COLOR
// ============================================================================

/**
 * checkContrast
 * Check WCAG AA contrast ratio between two colors
 */
export function checkContrast(color1: string, color2: string): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  const getLuminance = (color: string): number => {
    // Simple hex parsing (would need more robust parser for production)
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const calc = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    const rs = calc(r);
    const gs = calc(g);
    const bs = calc(b);

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: parseFloat(ratio.toFixed(2)),
    wcagAA: ratio >= 4.5, // 1.4.3
    wcagAAA: ratio >= 7,  // 1.4.6
  };
}

// ============================================================================
// MOTION & ANIMATIONS
// ============================================================================

/**
 * prefersReducedMotion
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * useReducedMotion
 * Hook to check and respect prefers-reduced-motion
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    setPrefersReduced(prefersReducedMotion());

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReduced(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}

// ============================================================================
// DARK MODE SUPPORT
// ============================================================================

/**
 * prefersDarkMode
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * useDarkMode
 * Hook to detect and respond to dark mode preference
 */
export function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(prefersDarkMode());

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setIsDark(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isDark;
}

// ============================================================================
// LANGUAGE & DIRECTION
// ============================================================================

/**
 * getTextDirection
 * Get text direction (LTR/RTL) for language
 */
export function getTextDirection(lang: string): 'ltr' | 'rtl' {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  const langCode = lang.split('-')[0]?.toLowerCase();
  return rtlLanguages.includes(langCode || '') ? 'rtl' : 'ltr';
}

/**
 * useTextDirection
 * Hook for text direction detection
 */
export function useTextDirection(lang?: string): 'ltr' | 'rtl' {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const documentLang = lang || document.documentElement.lang || 'en';
    setDirection(getTextDirection(documentLang));
  }, [lang]);

  return direction;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  useKeyboard,
  useFocusManagement,
  useFocusTrap,
  useAriaLabel,
  useAnnounce,
  createSkipLink,
  checkContrast,
  prefersReducedMotion,
  useReducedMotion,
  prefersDarkMode,
  useDarkMode,
  getTextDirection,
  useTextDirection,
  ScreenReaderAnnouncer,
};
