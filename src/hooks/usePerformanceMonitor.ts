import { useEffect, useRef } from 'react';

/**
 * usePerformanceMonitor - Hook para monitorear el rendimiento de componentes
 *
 * Útil para detectar componentes que se renderizan con demasiada frecuencia
 * Solo activo en desarrollo
 *
 * @param componentName - Nombre del componente para identificar en logs
 * @param props - Props del componente para detectar cambios
 *
 * @example
 * ```tsx
 * function MyComponent({ data, onUpdate }) {
 *   usePerformanceMonitor('MyComponent', { data, onUpdate });
 *   // ...
 * }
 * ```
 */
export function usePerformanceMonitor(
  componentName: string,
  props?: Record<string, any>
) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const prevProps = useRef(props);

  useEffect(() => {
    if (import.meta.env.DEV) {
      renderCount.current++;
      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTime.current;
      lastRenderTime.current = now;

      // Warn if component renders too frequently
      if (timeSinceLastRender < 16 && renderCount.current > 1) {
        console.warn(
          `⚠️ [Performance] ${componentName} rendered ${renderCount.current} times. Last render was ${timeSinceLastRender}ms ago (< 16ms).`
        );
      }

      // Log what props changed
      if (props && prevProps.current) {
        const changedProps = Object.keys(props).filter(
          key => props[key] !== prevProps.current?.[key]
        );

        if (changedProps.length > 0 && renderCount.current > 1) {
          console.log(
            `🔄 [Performance] ${componentName} re-rendered. Changed props:`,
            changedProps
          );
        }
      }

      prevProps.current = props;
    }
  });

  // Log component mount/unmount
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`✅ [Performance] ${componentName} mounted`);

      return () => {
        console.log(
          `❌ [Performance] ${componentName} unmounted after ${renderCount.current} renders`
        );
      };
    }
    return undefined;
  }, [componentName]);
}

/**
 * useRenderCount - Simple hook que solo cuenta renders
 *
 * @param componentName - Nombre del componente
 * @returns Número de renders
 */
export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;

    if (import.meta.env.DEV && renderCount.current % 10 === 0) {
      console.warn(
        `⚠️ [Performance] ${componentName} has rendered ${renderCount.current} times`
      );
    }
  });

  return renderCount.current;
}

/**
 * useWhyDidYouUpdate - Debug hook para entender por qué un componente se re-renderiza
 *
 * @param componentName - Nombre del componente
 * @param props - Props a monitorear
 */
export function useWhyDidYouUpdate(
  componentName: string,
  props: Record<string, any>
) {
  const previousProps = useRef<Record<string, any> | undefined>(undefined);

  useEffect(() => {
    if (previousProps.current && import.meta.env.DEV) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changesObj: Record<string, { from: any; to: any }> = {};

      allKeys.forEach(key => {
        if (previousProps.current?.[key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current?.[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changesObj).length > 0) {
        console.log(`[why-did-you-update] ${componentName}`, changesObj);
      }
    }

    previousProps.current = props;
  });
}

/**
 * measurePerformance - Función helper para medir performance de operaciones
 *
 * @param label - Etiqueta de la operación
 * @param fn - Función a ejecutar y medir
 * @returns Resultado de la función
 */
export async function measurePerformance<T>(
  label: string,
  fn: () => T | Promise<T>
): Promise<T> {
  if (!import.meta.env.DEV) {
    return fn();
  }

  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > 100) {
    console.warn(`⚠️ [Performance] ${label} took ${duration.toFixed(2)}ms (> 100ms)`);
  } else {
    console.log(`✓ [Performance] ${label} took ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * useDebouncedCallback - Hook para debounce de callbacks
 * Evita ejecutar funciones muy frecuentemente
 *
 * @param callback - Función a ejecutar
 * @param delay - Delay en ms
 * @returns Función debounced
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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
      callback(...args);
    }, delay);
  };
}
