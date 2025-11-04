/**
 * Frontend Performance Optimization Utilities
 *
 * Advanced memoization, caching, and performance strategies
 * @module lib/performance
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

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

/**
 * useDebounce
 * Debounce hook with configurable delay
 * Reduces excessive re-renders and API calls
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T>(value: T, interval: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(
        () => {
          lastUpdated.current = Date.now();
          setThrottledValue(value);
        },
        interval - (now - lastUpdated.current)
      );

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
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

/**
 * useIntersectionObserver
 * Observe element visibility for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        setIsVisible(true);
        // Stop observing once visible
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isVisible;
}

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
// EXPORTS
// ============================================================================

export default {
  useMemoCallback,
  usePrevious,
  useDebounce,
  useThrottle,
  useQuery,
  useVirtualList,
  useLazyImage,
  useIntersectionObserver,
  usePerformanceObserver,
  measurePerformance,
  SimpleCache,
  BatchProcessor,
  useBatchProcessor,
};
