/**
 * Performance Monitoring for Beta Testing
 * 
 * Instrumentación simple para medir tiempos de interacciones clave.
 * Logs automáticos en desarrollo, silencioso en producción.
 */

import { logger } from './logger';

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
        logger.error(`SLOW: ${name} took ${duration.toFixed(2)}ms`, new Error('Performance threshold exceeded'), {
          component: 'perfMonitor',
          interaction: name,
          duration: duration.toFixed(2),
          threshold: ERROR_THRESHOLD
        });
      } else if (duration > WARN_THRESHOLD) {
        logger.warn(`${name} took ${duration.toFixed(2)}ms`, {
          component: 'perfMonitor',
          interaction: name,
          duration: duration.toFixed(2),
          threshold: WARN_THRESHOLD
        });
      } else {
        logger.info(`${name}: ${duration.toFixed(2)}ms`, {
          component: 'perfMonitor',
          interaction: name,
          duration: duration.toFixed(2)
        });
      }
    }

    // En producción, solo logear si es muy lento
    if (import.meta.env.PROD && duration > ERROR_THRESHOLD) {
      logger.warn(`Performance issue: ${name} took ${duration.toFixed(2)}ms`, {
        component: 'perfMonitor',
        interaction: name,
        duration: duration.toFixed(2),
        critical: true
      });
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
