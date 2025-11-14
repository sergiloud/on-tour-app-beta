/**
 * Performance monitoring hooks
 * Detect and prevent unnecessary re-renders
 */

import { useEffect, useRef } from 'react';

/**
 * Log when a component re-renders (dev only)
 * Use to detect unnecessary re-renders
 */
export function useRenderCount(componentName: string, props?: Record<string, unknown>) {
  const renderCount = useRef(0);
  const prevProps = useRef(props);

  if (import.meta.env.DEV) {
    renderCount.current += 1;

    useEffect(() => {
      if (renderCount.current > 1) {
        console.log(`[Render] ${componentName} rendered ${renderCount.current} times`);
        
        if (props && prevProps.current) {
          const changedProps = Object.keys(props).filter(
            key => props[key] !== prevProps.current?.[key]
          );
          if (changedProps.length > 0) {
            console.log(`  Changed props:`, changedProps);
          }
        }
      }
      prevProps.current = props;
    });
  }
}

/**
 * Detect slow renders (> 16ms)
 */
export function useSlowRenderDetection(componentName: string, threshold = 16) {
  if (import.meta.env.DEV) {
    const startTime = performance.now();
    
    useEffect(() => {
      const renderTime = performance.now() - startTime;
      if (renderTime > threshold) {
        console.warn(
          `[Slow Render] ${componentName} took ${renderTime.toFixed(2)}ms to render`
        );
      }
    });
  }
}

/**
 * Shallow compare objects (useful for memo)
 */
export function shallowEqual<T extends Record<string, unknown>>(
  obj1: T,
  obj2: T
): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Deep compare for complex objects (expensive, use sparingly)
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  
  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Measure component render performance
 */
export function measureRenderTime(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (import.meta.env.DEV && duration > 10) {
      console.log(`[Performance] ${componentName}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  };
}
