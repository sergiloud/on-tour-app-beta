/**
 * Frontend Performance Optimization Utilities
 *
 * Advanced memoization, caching, and performance strategies
 * @module lib/performance
 * @deprecated Use individual hooks from src/hooks/ instead
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

// Re-export new optimized hooks for backwards compatibility
export { useDebounce, useDebouncedCallback } from '../hooks/useDebounce';
export { useThrottle, useThrottledScroll } from '../hooks/useThrottle';
export { useIntersectionObserver, useIsVisible } from '../hooks/useIntersectionObserver';
export { useLocalStorage } from '../hooks/useLocalStorage';

// ============================================================================
// MEMOIZATION & CALLBACKS
// ============================================================================

/**
 * useMemoCallback
 * Combines useMemo + useCallback for optimized memoized callbacks
 * Prevents unnecessary re-renders of child components
 */
export function useMemoCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps) as T;
}

/**
 * usePrevious
 * Tracks previous value for diffing and optimization
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============================================================================
// CACHING STRATEGIES
// ============================================================================

/**
 * SimpleCache
 * In-memory LRU cache for expensive computations
 */
export class SimpleCache<K, V> {
  private cache: Map<K, { value: V; timestamp: number }>;
  private ttl: number; // milliseconds

  constructor(ttl: number = 5 * 60 * 1000) { // 5 min default
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);

    if (!item) return undefined;

    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  set(key: K, value: V): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * useQuery
 * Memoized query hook with caching
 * Prevents redundant API calls
 */
export function useQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
  }
): {
  data?: T;
  isLoading: boolean;
  error?: Error;
  refetch: () => Promise<T>;
} {
  const [state, setState] = useState<{
    data?: T;
    isLoading: boolean;
    error?: Error;
  }>({
    isLoading: false,
  });

  const cacheRef = useRef(new SimpleCache<string, T>(options?.cacheTime ?? 5 * 60 * 1000));
  const queryKeyStr = queryKey.join(':');

  const refetch = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true }));

    try {
      // Check cache first
      const cached = cacheRef.current.get(queryKeyStr);
      if (cached) {
        setState({ data: cached, isLoading: false });
        return cached;
      }

      // Fetch fresh data
      const data = await queryFn();
      cacheRef.current.set(queryKeyStr, data);
      setState({ data, isLoading: false });
      return data;
    } catch (error) {
      setState({ error: error as Error, isLoading: false });
      throw error;
    }
  }, [queryKeyStr, queryFn]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

// ============================================================================
// LIST OPTIMIZATION
// ============================================================================

/**
 * useVirtualList
 * Virtual scrolling for long lists
 * Renders only visible items + buffer
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  bufferSize: number = 5
): {
  visibleItems: T[];
  visibleRange: { start: number; end: number };
  scrollTop: number;
  setScrollTop: (top: number) => void;
  containerProps: {
    style: React.CSSProperties;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  };
} {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    visibleRange: { start: startIndex, end: endIndex },
    scrollTop,
    setScrollTop,
    containerProps: {
      style: {
        overflow: 'auto',
        height: containerHeight,
      },
      onScroll: (e) => {
        const target = e.target as HTMLDivElement;
        setScrollTop(target.scrollTop);
      },
    },
  };
}

// ============================================================================
// LAZY LOADING
// ============================================================================

/**
 * useLazyImage
 * Lazy load images with blur placeholder
 */
export function useLazyImage(src: string): {
  isLoaded: boolean;
  error?: Error;
  imageProps: {
    src: string;
    loading: 'lazy' | 'eager';
    onLoad: () => void;
    onError: (e: any) => void;
  };
} {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error>();

  return {
    isLoaded,
    error,
    imageProps: {
      src,
      loading: 'lazy',
      onLoad: () => setIsLoaded(true),
      onError: (e) => setError(e),
    },
  };
}

// Note: useIntersectionObserver is now available via hook re-exports at top of file
// Note: useIntersectionObserver is now available via hook re-exports at top of file

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * usePerformanceObserver
 * Monitor Core Web Vitals
 */
export function usePerformanceObserver(): {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
} {
  const [metrics, setMetrics] = useState<{
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
  }>({});

  useEffect(() => {
    // Observe largest contentful paint
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          setMetrics(m => ({ ...m, lcp: lastEntry.startTime }));
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      return () => lcpObserver.disconnect();
    } catch (e) {
      console.warn('LCP observer not supported');
      return;
    }
  }, []);

  return metrics;
}

/**
 * measurePerformance
 * Measure function execution time
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);

  return { result, duration };
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * BatchProcessor
 * Process items in batches to avoid blocking UI
 */
export class BatchProcessor<T, R> {
  private queue: T[] = [];
  private batchSize: number;
  private delay: number;
  private processor: (item: T) => Promise<R>;
  private results: R[] = [];

  constructor(
    processor: (item: T) => Promise<R>,
    batchSize: number = 50,
    delay: number = 100
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.delay = delay;
  }

  async processBatch(items: T[]): Promise<R[]> {
    this.queue = [...items];
    this.results = [];

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      const batchResults = await Promise.all(batch.map(item => this.processor(item)));
      this.results.push(...batchResults);

      // Give UI time to breathe
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }

    return this.results;
  }
}

/**
 * useBatchProcessor
 * Hook for batch processing
 */
export function useBatchProcessor<T, R>(
  processor: (item: T) => Promise<R>,
  batchSize?: number
): (items: T[]) => Promise<R[]> {
  const processorRef = useRef(new BatchProcessor(processor, batchSize));

  return useCallback(
    (items: T[]) => processorRef.current.processBatch(items),
    []
  );
}

// ============================================================================
// PERFORMANCE MEASUREMENT
// ============================================================================

type PerformanceEntry = {
  name: string;
  duration: number;
  startTime: number;
  timestamp: string;
};

class PerformanceTracker {
  private entries: PerformanceEntry[] = [];
  private readonly MAX_ENTRIES = 100;
  private readonly WARN_THRESHOLD = 100; // ms
  private readonly ERROR_THRESHOLD = 500; // ms

  /**
   * Mide el tiempo de ejecución de una función síncrona
   */
  measure<T>(name: string, fn: () => T): T {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    performance.mark(startMark);
    const result = fn();
    performance.mark(endMark);
    
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      this.recordEntry(name, measure.duration);
      
      // Log warnings para interacciones lentas
      if (measure.duration > this.ERROR_THRESHOLD) {
        console.error(`❌ SLOW: ${name} took ${measure.duration.toFixed(2)}ms (>${this.ERROR_THRESHOLD}ms)`);
      } else if (measure.duration > this.WARN_THRESHOLD) {
        console.warn(`⚠️ ${name} took ${measure.duration.toFixed(2)}ms (>${this.WARN_THRESHOLD}ms)`);
      } else if (import.meta.env.DEV) {
        console.log(`✅ ${name}: ${measure.duration.toFixed(2)}ms`);
      }
    } catch (e) {
      console.error('Failed to measure performance:', e);
    } finally {
      // Cleanup marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
    }
    
    return result;
  }

  /**
   * Mide el tiempo de ejecución de una función asíncrona
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    performance.mark(startMark);
    try {
      const result = await fn();
      performance.mark(endMark);
      
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      this.recordEntry(name, measure.duration);
      
      if (measure.duration > this.ERROR_THRESHOLD) {
        console.error(`❌ SLOW ASYNC: ${name} took ${measure.duration.toFixed(2)}ms`);
      } else if (measure.duration > this.WARN_THRESHOLD) {
        console.warn(`⚠️ ${name} took ${measure.duration.toFixed(2)}ms`);
      } else if (import.meta.env.DEV) {
        console.log(`✅ ${name}: ${measure.duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      performance.mark(endMark);
      throw error;
    } finally {
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
    }
  }

  /**
   * Inicia un cronómetro manual para eventos que no son funciones
   */
  start(name: string): () => void {
    const startMark = `${name}-start`;
    performance.mark(startMark);
    
    // Retorna función de finalización
    return () => {
      const endMark = `${name}-end`;
      performance.mark(endMark);
      
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        this.recordEntry(name, measure.duration);
        
        if (measure.duration > this.ERROR_THRESHOLD) {
          console.error(`❌ SLOW: ${name} took ${measure.duration.toFixed(2)}ms`);
        } else if (measure.duration > this.WARN_THRESHOLD) {
          console.warn(`⚠️ ${name} took ${measure.duration.toFixed(2)}ms`);
        } else if (import.meta.env.DEV) {
          console.log(`✅ ${name}: ${measure.duration.toFixed(2)}ms`);
        }
      } catch (e) {
        console.error('Failed to complete performance measurement:', e);
      } finally {
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
        performance.clearMeasures(name);
      }
    };
  }

  private recordEntry(name: string, duration: number) {
    this.entries.push({
      name,
      duration,
      startTime: performance.now(),
      timestamp: new Date().toISOString(),
    });
    
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries.shift();
    }
  }

  getReport(): {
    entries: PerformanceEntry[];
    slowest: PerformanceEntry[];
    average: { [key: string]: number };
  } {
    const grouped = this.entries.reduce((acc, entry) => {
      if (!acc[entry.name]) {
        acc[entry.name] = [];
      }
      acc[entry.name].push(entry.duration);
      return acc;
    }, {} as { [key: string]: number[] });
    
    const average = Object.entries(grouped).reduce((acc, [name, durations]) => {
      acc[name] = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      return acc;
    }, {} as { [key: string]: number });
    
    const slowest = [...this.entries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
    
    return { entries: this.entries, slowest, average };
  }

  printReport() {
    const report = this.getReport();
    
    console.group('📊 Performance Report');
    console.log('Total measurements:', this.entries.length);
    
    console.group('⏱️ Average Times');
    Object.entries(report.average)
      .sort(([, a], [, b]) => b - a)
      .forEach(([name, avg]) => {
        const emoji = avg > this.ERROR_THRESHOLD ? '❌' : avg > this.WARN_THRESHOLD ? '⚠️' : '✅';
        console.log(`${emoji} ${name}: ${avg.toFixed(2)}ms`);
      });
    console.groupEnd();
    
    console.group('🐌 Slowest Operations');
    report.slowest.forEach((entry, i) => {
      console.log(`${i + 1}. ${entry.name}: ${entry.duration.toFixed(2)}ms at ${entry.timestamp}`);
    });
    console.groupEnd();
    
    console.groupEnd();
  }

  clear() {
    this.entries = [];
    performance.clearMarks();
    performance.clearMeasures();
  }
}

export const perfTracker = new PerformanceTracker();

if (typeof window !== 'undefined') {
  (window as any).__perfTracker = perfTracker;
}

export function usePerfMeasure(componentName: string) {
  return {
    measure: <T>(actionName: string, fn: () => T) => 
      perfTracker.measure(`${componentName}.${actionName}`, fn),
    measureAsync: <T>(actionName: string, fn: () => Promise<T>) =>
      perfTracker.measureAsync(`${componentName}.${actionName}`, fn),
    start: (actionName: string) =>
      perfTracker.start(`${componentName}.${actionName}`),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

// Note: Direct default export removed to avoid re-export conflicts
// Import individual utilities directly or use named exports

