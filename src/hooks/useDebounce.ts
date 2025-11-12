import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce a value - delays updating until after wait period of inactivity
 * Optimized for search inputs and filters
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function
 * Returns a memoized debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
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

  return (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };
}

/**
 * Hook para prevenir múltiples ejecuciones rápidas (anti-doble-click)
 * Ejecuta inmediatamente y bloquea llamadas subsecuentes durante el delay
 */
export function useInstantDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const isExecutingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
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
      // Si ya está ejecutando, ignorar
      if (isExecutingRef.current) {
        return;
      }

      // Ejecutar inmediatamente
      isExecutingRef.current = true;
      callbackRef.current(...args);

      // Resetear flag después del delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        isExecutingRef.current = false;
      }, delay);
    },
    [delay]
  );
}

/**
 * Hook para throttle - limita la frecuencia de ejecución
 * Útil para eventos continuos como scroll, resize, drag
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): (...args: Parameters<T>) => void {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
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
        // Programar para ejecutar cuando se cumpla el delay
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
