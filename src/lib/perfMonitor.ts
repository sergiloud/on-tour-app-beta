/**
 * Performance Monitoring for Beta Testing
 * 
 * Instrumentación simple para medir tiempos de interacciones clave.
 * Logs automáticos en desarrollo, silencioso en producción.
 */

/**
 * Ejemplo de uso:
 * 
 * // En un evento handler
 * const end = trackInteraction('filter-transactions');
 * applyFilters();
 * end();
 * 
 * // En un componente
 * const perf = usePerfMonitor('Calendar');
 * perf.track('change-view', () => setView('month'));
 */

const WARN_THRESHOLD = 100; // ms
const ERROR_THRESHOLD = 500; // ms

export function trackInteraction(name: string): () => void {
  if (typeof performance === 'undefined') {
    return () => {};
  }

  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;

    if (import.meta.env.DEV) {
      if (duration > ERROR_THRESHOLD) {
        console.error(`❌ SLOW: ${name} took ${duration.toFixed(2)}ms`);
      } else if (duration > WARN_THRESHOLD) {
        console.warn(`⚠️ ${name} took ${duration.toFixed(2)}ms`);
      } else {
        console.log(`✅ ${name}: ${duration.toFixed(2)}ms`);
      }
    }

    // En producción, solo logear si es muy lento
    if (import.meta.env.PROD && duration > ERROR_THRESHOLD) {
      console.warn(`Performance issue: ${name} took ${duration.toFixed(2)}ms`);
    }
  };
}

export function usePerfMonitor(componentName: string) {
  return {
    track: (actionName: string, fn: () => void) => {
      const end = trackInteraction(`${componentName}.${actionName}`);
      fn();
      end();
    },
    trackAsync: async (actionName: string, fn: () => Promise<void>) => {
      const end = trackInteraction(`${componentName}.${actionName}`);
      try {
        await fn();
      } finally {
        end();
      }
    },
  };
}
