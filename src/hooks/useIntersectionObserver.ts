import { useEffect, useRef, useState } from 'react';

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  onChange?: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void;
}

/**
 * Optimized Intersection Observer hook for lazy loading and visibility detection
 * Perfect for infinite scroll, image lazy loading, and viewport-triggered animations
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T | null>, boolean, IntersectionObserverEntry | undefined] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
    onChange,
  } = options;

  const elementRef = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !element) {
      return;
    }

    // Skip if already frozen
    if (frozen.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        
        const isElementIntersecting = entry.isIntersecting;

        setEntry(entry);
        setIsIntersecting(isElementIntersecting);

        if (onChange) {
          onChange(isElementIntersecting, entry);
        }

        // Freeze once visible if requested
        if (freezeOnceVisible && isElementIntersecting) {
          frozen.current = true;
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, onChange]);

  return [elementRef, isIntersecting, entry];
}

/**
 * Simple visibility hook - returns true when element is visible
 */
export function useIsVisible<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T | null>, boolean] {
  const [ref, isIntersecting] = useIntersectionObserver<T>(options);
  return [ref, isIntersecting];
}
