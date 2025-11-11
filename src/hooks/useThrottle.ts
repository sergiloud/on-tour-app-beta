import { useRef, useEffect, useCallback } from 'react';

/**
 * Throttle a callback - ensures function is called at most once per interval
 * Optimized for scroll, resize, and other high-frequency events
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): (...args: Parameters<T>) => void {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        callbackRef.current(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRun.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    },
    [delay]
  );
}

/**
 * Throttle scroll events with RAF for better performance
 */
export function useThrottledScroll(
  callback: (event: Event) => void,
  deps: React.DependencyList = []
): void {
  const rafRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      if (rafRef.current !== undefined) {
        return;
      }

      rafRef.current = requestAnimationFrame(() => {
        callbackRef.current(event);
        rafRef.current = undefined;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, deps);
}
