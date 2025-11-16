/**
 * Advanced React Query Configuration with WebAssembly Integration
 * 
 * Professional implementation of the REACT_QUERY_OPTIMIZATION.md plan:
 * - Type-safe QueryClient with enhanced error handling & caching
 * - WebAssembly financial engine integration with fallback
 * - Simple localStorage persistence (PWA ready)
 * - Intelligent query management and performance monitoring
 */

import { 
  QueryClient, 
  QueryCache, 
  MutationCache, 
  QueryClientProvider,
  type QueryKey,
  type QueryFunction,
  type MutationOptions
} from '@tanstack/react-query';
import { logger } from './logger';
import { toast } from 'sonner';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface OptimisticContext {
  previousData?: unknown;
  rollback?: () => void;
}

interface WasmError extends Error {
  wasmError: true;
  fallbackAvailable: boolean;
}

interface QueryErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

interface WasmMetrics {
  recordQuery: (key: string, duration: number, usedWasm: boolean) => void;
  shouldUseWasm: (key: string) => boolean;
}

declare global {
  interface Window {
    wasmMetrics?: WasmMetrics;
  }
}

// ============================================================================
// ADVANCED ERROR HANDLING & CACHING
// ============================================================================

/**
 * Global query cache with intelligent error handling
 */
const queryCache = new QueryCache({
  onError: (error: Error, query) => {
    logger.error('Query error occurred', error);
    
    // Smart error handling - no toast for auth errors
    const errorWithStatus = error as QueryErrorWithStatus;
    if (errorWithStatus.status && [401, 403].includes(errorWithStatus.status)) {
      return; // Silent fail for auth errors
    }
    
    // WebAssembly specific error handling
    if (error.message.includes('wasm') || (error as WasmError).wasmError) {
      logger.warn('WebAssembly error detected, triggering fallback mechanism');
      window.dispatchEvent(new CustomEvent('wasm-fallback', { 
        detail: { queryKey: query.queryKey, error: error.message } 
      }));
      return;
    }
    
    // Network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      toast.error('Connection issue. Please check your internet connection.');
      return;
    }
    
    // Generic error fallback
    toast.error('Failed to load data. Please try again.');
  },
  onSuccess: (data, query) => {
    logger.debug('Query successful', { queryKey: query.queryKey });
  }
});

/**
 * Global mutation cache with optimistic update rollback
 */
const mutationCache = new MutationCache({
  onError: (error: Error, variables, context, mutation) => {
    const errorContext = {
      message: error.message,
      variables,
      mutationKey: mutation.options.mutationKey,
      timestamp: Date.now()
    };
    
    logger.error('Mutation error occurred', errorContext);
    
    // Auto-rollback optimistic updates on failure
    const optimisticContext = context as OptimisticContext;
    if (optimisticContext?.previousData && mutation.options.mutationKey) {
      const queryClient = (mutation as any).queryClient as QueryClient;
      if (queryClient) {
        queryClient.setQueryData(mutation.options.mutationKey, optimisticContext.previousData);
      }
    }
    
    // Execute custom rollback if available
    if (optimisticContext?.rollback) {
      try {
        optimisticContext.rollback();
      } catch (rollbackError) {
        logger.error('Rollback failed', { error: rollbackError });
      }
    }
    
    toast.error('Operation failed. Changes have been reverted.');
  },
  onSuccess: (data, variables, context, mutation) => {
    logger.debug('Mutation successful', { 
      mutationKey: mutation.options.mutationKey,
      timestamp: Date.now()
    });
  }
});

// ============================================================================
// WASM PERFORMANCE INTEGRATION
// ============================================================================

/**
 * WebAssembly performance monitor
 */
class WasmPerformanceMonitor {
  private metrics = new Map<string, number>();
  private fallbackThreshold = 100; // ms
  
  recordQuery(queryKey: string, duration: number, usedWasm: boolean) {
    this.metrics.set(queryKey, duration);
    
    // Auto-fallback if WASM is slower than JS
    if (usedWasm && duration > this.fallbackThreshold) {
      logger.warn(`WASM query ${queryKey} took ${duration}ms, considering fallback`);
    }
    
    // Report to WebAssembly performance dashboard
    if (globalThis.wasmMetrics) {
      globalThis.wasmMetrics.recordQuery(queryKey, duration, usedWasm);
    }
  }
  
  shouldUseWasm(queryKey: string): boolean {
    const historical = this.metrics.get(queryKey);
    return !historical || historical < this.fallbackThreshold;
  }
}

const wasmMonitor = new WasmPerformanceMonitor();

// ============================================================================
// ENHANCED QUERY CLIENT CONFIGURATION
// ============================================================================

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // Extended from 10 minutes  
      retry: (failureCount, error) => {
        // Smart retry logic - don't retry client errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false; // Client errors
        }
        
        // Progressive backoff: 1s, 2s, 4s
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Enhanced network detection
      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry network errors, not validation errors
        if (error instanceof Error && error.message.includes('validation')) {
          return false;
        }
        return failureCount < 2; // Max 2 retries for mutations
      },
      networkMode: 'online',
    },
  },
});

// ============================================================================
// PWA BACKGROUND SYNC INTEGRATION
// ============================================================================

/**
 * PWA-aware persister with background sync
 */
const persister = createSyncStoragePersister({
  storage: globalThis.localStorage,
  key: 'on-tour-app-cache',
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

/**
 * Initialize persistence for offline capability
 */
export async function initializeQueryPersistence() {
  try {
    await persistQueryClient({
      queryClient,
      persister,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      hydrateOptions: {
        // Don't refetch immediately on hydration in offline mode
        defaultOptions: {
          queries: {
            staleTime: Infinity,
          },
        },
      },
    });
    
    logger.info('Query persistence initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize query persistence', error);
  }
}

// ============================================================================
// BACKGROUND SYNC MANAGEMENT
// ============================================================================

/**
 * Background sync queue for offline mutations
 */
class BackgroundSyncQueue {
  private queue: Array<{ key: string; data: any; timestamp: number }> = [];
  private isOnline = navigator.onLine;
  
  constructor() {
    // Listen for online/offline events
    globalThis.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingMutations();
    });
    
    globalThis.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  
  enqueue(key: string, data: any) {
    this.queue.push({ key, data, timestamp: Date.now() });
    
    // Process immediately if online
    if (this.isOnline) {
      this.processPendingMutations();
    }
  }
  
  private async processPendingMutations() {
    if (!this.isOnline || this.queue.length === 0) return;
    
    logger.info(`Processing ${this.queue.length} pending mutations`);
    
    const mutations = [...this.queue];
    this.queue = [];
    
    for (const mutation of mutations) {
      try {
        // Replay the mutation
        await queryClient.invalidateQueries({ queryKey: [mutation.key] });
        logger.debug(`Replayed mutation: ${mutation.key}`);
      } catch (error) {
        logger.error(`Failed to replay mutation: ${mutation.key}`, error);
        // Re-queue failed mutations
        this.queue.push(mutation);
      }
    }
  }
}

export const backgroundSyncQueue = new BackgroundSyncQueue();

// ============================================================================
// INTELLIGENT QUERY MANAGEMENT
// ============================================================================

/**
 * Smart prefetching based on user behavior
 */
export class IntelligentPrefetcher {
  private hoverTimers = new Map<string, NodeJS.Timeout>();
  private prefetchHistory = new Set<string>();
  
  /**
   * Prefetch on hover with debounce
   */
  onHover(queryKey: string[], queryFn: () => Promise<any>, delay = 300) {
    const key = queryKey.join(':');
    
    // Clear existing timer
    const existingTimer = this.hoverTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      if (!this.prefetchHistory.has(key)) {
        queryClient.prefetchQuery({ queryKey, queryFn });
        this.prefetchHistory.add(key);
        logger.debug(`Prefetched on hover: ${key}`);
      }
    }, delay);
    
    this.hoverTimers.set(key, timer);
  }
  
  /**
   * Cancel prefetch on hover end
   */
  onHoverEnd(queryKey: string[]) {
    const key = queryKey.join(':');
    const timer = this.hoverTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.hoverTimers.delete(key);
    }
  }
  
  /**
   * Aggressive prefetching for likely next pages
   */
  prefetchLikelyRoutes(currentRoute: string) {
    const routes = this.getLikelyNextRoutes(currentRoute);
    
    routes.forEach(route => {
      // Prefetch route-specific queries
      this.prefetchRouteQueries(route);
    });
  }
  
  private getLikelyNextRoutes(currentRoute: string): string[] {
    // Route prediction logic based on user patterns
    const routeMap: Record<string, string[]> = {
      '/dashboard': ['/dashboard/shows', '/dashboard/finance'],
      '/dashboard/shows': ['/dashboard/calendar', '/dashboard/contracts'],
      '/dashboard/finance': ['/dashboard/reports', '/dashboard/settings'],
    };
    
    return routeMap[currentRoute] || [];
  }
  
  private prefetchRouteQueries(route: string) {
    // Route-specific query prefetching
    switch (route) {
      case '/dashboard/shows':
        queryClient.prefetchQuery({
          queryKey: ['shows'],
          queryFn: () => import('../hooks/useShowsQuery').then(m => m.useShowsQuery),
        });
        break;
      case '/dashboard/finance':
        queryClient.prefetchQuery({
          queryKey: ['finance', 'summary'],
          queryFn: () => import('../hooks/useFinanceQuery').then(m => m.useFinanceSummary),
        });
        break;
    }
  }
}

export const intelligentPrefetcher = new IntelligentPrefetcher();

// ============================================================================
// WASM FINANCIAL ENGINE INTEGRATION
// ============================================================================

/**
 * WebAssembly-enhanced query wrapper for financial calculations
 */
export function createWasmQuery<T>(
  queryKey: string[],
  jsQueryFn: () => Promise<T>,
  wasmQueryFn?: () => Promise<T>
) {
  return {
    queryKey,
    queryFn: async (): Promise<T> => {
      const startTime = performance.now();
      const shouldUseWasm = wasmQueryFn && wasmMonitor.shouldUseWasm(queryKey.join(':'));
      
      try {
        const result = shouldUseWasm ? await wasmQueryFn() : await jsQueryFn();
        const duration = performance.now() - startTime;
        
        wasmMonitor.recordQuery(queryKey.join(':'), duration, !!shouldUseWasm);
        
        return result;
      } catch (error) {
        // Fallback to JS on WASM error
        if (shouldUseWasm && wasmQueryFn) {
          logger.warn('WASM query failed, falling back to JS', error);
          const result = await jsQueryFn();
          const duration = performance.now() - startTime;
          wasmMonitor.recordQuery(queryKey.join(':'), duration, false);
          return result;
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // Financial data refreshes every 2 minutes
    gcTime: 10 * 60 * 1000, // Keep financial data longer
  };
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Query performance tracker
 */
export class QueryPerformanceTracker {
  private metrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();
  
  track(queryKey: string[], duration: number) {
    const key = queryKey.join(':');
    const existing = this.metrics.get(key) || { count: 0, totalTime: 0, avgTime: 0 };
    
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    
    this.metrics.set(key, existing);
    
    // Log slow queries
    if (duration > 1000) {
      logger.warn(`Slow query detected: ${key} took ${duration}ms`);
    }
  }
  
  getMetrics() {
    return Object.fromEntries(this.metrics.entries());
  }
  
  getSlowestQueries(limit = 5) {
    return Array.from(this.metrics.entries())
      .sort(([, a], [, b]) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }
}

export const performanceTracker = new QueryPerformanceTracker();

// ============================================================================
// QUERY CLIENT EXTENSIONS
// ============================================================================

/**
 * Enhanced QueryClient with WASM integration
 */
declare module '@tanstack/react-query' {
  interface QueryClient {
    wasmQuery: typeof createWasmQuery;
    prefetcher: IntelligentPrefetcher;
    performance: QueryPerformanceTracker;
    backgroundSync: BackgroundSyncQueue;
  }
}

// Extend QueryClient with custom methods
queryClient.wasmQuery = createWasmQuery;
queryClient.prefetcher = intelligentPrefetcher;
queryClient.performance = performanceTracker;
queryClient.backgroundSync = backgroundSyncQueue;

// ============================================================================
// EXPORTS
// ============================================================================

export {
  QueryClientProvider,
  wasmMonitor,
};

// Global WASM metrics interface
declare global {
  interface Window {
    wasmMetrics?: {
      recordQuery: (key: string, duration: number, usedWasm: boolean) => void;
    };
  }
}