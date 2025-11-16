/**
 * Advanced React Query Configuration with WebAssembly Integration
 * 
 * Professional implementation following REACT_QUERY_OPTIMIZATION.md:
 * - Type-safe QueryClient with enhanced error handling & caching
 * - WebAssembly financial engine integration with intelligent fallback
 * - PWA background sync with offline queue management
 * - Performance monitoring and intelligent prefetching
 */

import { 
  QueryClient, 
  QueryCache, 
  MutationCache, 
  QueryClientProvider,
  type QueryKey,
  type QueryFunction
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

interface QueryErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

interface WasmMetrics {
  recordQuery: (key: string, duration: number, usedWasm: boolean) => void;
  shouldUseWasm: (key: string) => boolean;
}

interface PerformanceMetrics {
  queryKey: string;
  duration: number;
  usedWasm: boolean;
  timestamp: number;
  success: boolean;
}

// ============================================================================
// WASM PERFORMANCE MONITOR
// ============================================================================

class WebAssemblyPerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics[]>();
  private fallbackThreshold = 100; // ms
  private maxMetricsPerQuery = 10;
  
  recordQuery(queryKey: string, duration: number, usedWasm: boolean, success = true): void {
    const metrics = this.metrics.get(queryKey) || [];
    
    // Add new metric
    metrics.push({
      queryKey,
      duration,
      usedWasm,
      timestamp: Date.now(),
      success
    });
    
    // Keep only recent metrics
    if (metrics.length > this.maxMetricsPerQuery) {
      metrics.shift();
    }
    
    this.metrics.set(queryKey, metrics);
    
    // Log performance warnings
    if (usedWasm && duration > this.fallbackThreshold) {
      logger.warn(`WASM query ${queryKey} took ${duration}ms, considering JS fallback`);
    }
  }
  
  shouldUseWasm(queryKey: string): boolean {
    const metrics = this.metrics.get(queryKey);
    if (!metrics || metrics.length === 0) return true;
    
    // Calculate average WASM performance
    const wasmMetrics = metrics.filter(m => m.usedWasm && m.success);
    const jsMetrics = metrics.filter(m => !m.usedWasm && m.success);
    
    if (wasmMetrics.length === 0) return true;
    if (jsMetrics.length === 0) return true;
    
    const wasmAvg = wasmMetrics.reduce((sum, m) => sum + m.duration, 0) / wasmMetrics.length;
    const jsAvg = jsMetrics.reduce((sum, m) => sum + m.duration, 0) / jsMetrics.length;
    
    // Use WASM if it's faster or within 20% of JS performance
    return wasmAvg <= jsAvg * 1.2;
  }
  
  getMetrics(): Record<string, PerformanceMetrics[]> {
    return Object.fromEntries(this.metrics.entries());
  }
  
  clearMetrics(): void {
    this.metrics.clear();
  }
}

const wasmMonitor = new WebAssemblyPerformanceMonitor();

// ============================================================================
// BACKGROUND SYNC QUEUE
// ============================================================================

interface SyncRequest {
  id: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  timestamp: number;
  retries: number;
}

class BackgroundSyncQueue {
  private queue: SyncRequest[] = [];
  private isOnline = navigator.onLine;
  private maxRetries = 3;
  private storageKey = 'on-tour-sync-queue';
  
  constructor() {
    this.loadFromStorage();
    this.setupNetworkListeners();
  }
  
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingRequests();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      logger.warn('Failed to load sync queue from storage', error as Error);
    }
  }
  
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      logger.warn('Failed to save sync queue to storage', error as Error);
    }
  }
  
  enqueue(request: Omit<SyncRequest, 'id' | 'timestamp' | 'retries'>): string {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const syncRequest: SyncRequest = {
      ...request,
      id,
      timestamp: Date.now(),
      retries: 0
    };
    
    this.queue.push(syncRequest);
    this.saveToStorage();
    
    // Process immediately if online
    if (this.isOnline) {
      this.processPendingRequests();
    }
    
    return id;
  }
  
  private async processPendingRequests(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) return;
    
    logger.info(`Processing ${this.queue.length} pending sync requests`);
    
    const requests = [...this.queue];
    
    for (const request of requests) {
      try {
        await this.executeRequest(request);
        this.removeFromQueue(request.id);
        logger.debug(`Successfully synced: ${request.url}`);
      } catch (error) {
        request.retries++;
        if (request.retries >= this.maxRetries) {
          logger.error(`Max retries exceeded for sync request: ${request.url}`, error as Error);
          this.removeFromQueue(request.id);
        } else {
          logger.warn(`Sync request failed, will retry: ${request.url}`, error as Error);
        }
      }
    }
    
    this.saveToStorage();
  }
  
  private async executeRequest(request: SyncRequest): Promise<void> {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body ? JSON.stringify(request.body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
  
  private removeFromQueue(id: string): void {
    this.queue = this.queue.filter(req => req.id !== id);
  }
  
  getQueueSize(): number {
    return this.queue.length;
  }
  
  clearQueue(): void {
    this.queue = [];
    this.saveToStorage();
  }
}

const syncQueue = new BackgroundSyncQueue();

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
    if (error.message.includes('wasm')) {
      logger.warn('WebAssembly error detected, triggering fallback');
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
    logger.error('Mutation error occurred', error);
    
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
        logger.error('Rollback failed', rollbackError as Error);
      }
    }
    
    toast.error('Operation failed. Changes have been reverted.');
  },
  onSuccess: (data, variables, context, mutation) => {
    logger.debug('Mutation successful', { 
      mutationKey: mutation.options.mutationKey 
    });
  }
});

// ============================================================================
// ENHANCED QUERY CLIENT CONFIGURATION
// ============================================================================

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // Extended cache time
      retry: (failureCount, error) => {
        // Smart retry logic - don't retry client errors
        const errorWithStatus = error as QueryErrorWithStatus;
        if (errorWithStatus.status && errorWithStatus.status >= 400 && errorWithStatus.status < 500) {
          return false; // Client errors
        }
        
        // Progressive backoff: max 3 retries
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
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
// SIMPLE PERSISTENCE FOR PWA
// ============================================================================

interface PersistedQuery {
  queryKey: QueryKey;
  queryHash: string;
  data: unknown;
  timestamp: number;
}

class SimpleQueryPersister {
  private storageKey = 'on-tour-query-cache';
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  async persistQuery(queryKey: QueryKey, data: unknown): Promise<void> {
    try {
      const persistedQueries = this.getPersistedQueries();
      const queryHash = JSON.stringify(queryKey);
      
      persistedQueries[queryHash] = {
        queryKey,
        queryHash,
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(persistedQueries));
    } catch (error) {
      logger.warn('Failed to persist query', error as Error);
    }
  }
  
  async restoreQuery(queryKey: QueryKey): Promise<unknown | undefined> {
    try {
      const persistedQueries = this.getPersistedQueries();
      const queryHash = JSON.stringify(queryKey);
      const persisted = persistedQueries[queryHash];
      
      if (!persisted) return undefined;
      
      // Check if data is stale
      if (Date.now() - persisted.timestamp > this.maxAge) {
        delete persistedQueries[queryHash];
        localStorage.setItem(this.storageKey, JSON.stringify(persistedQueries));
        return undefined;
      }
      
      return persisted.data;
    } catch (error) {
      logger.warn('Failed to restore query', error as Error);
      return undefined;
    }
  }
  
  private getPersistedQueries(): Record<string, PersistedQuery> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }
  
  clearPersistedData(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      logger.warn('Failed to clear persisted data', error as Error);
    }
  }
}

const queryPersister = new SimpleQueryPersister();

// ============================================================================
// WASM FINANCIAL ENGINE INTEGRATION
// ============================================================================

/**
 * Creates WebAssembly-enhanced query with intelligent fallback
 */
export function createWasmQuery<T>(
  queryKey: QueryKey,
  jsQueryFn: QueryFunction<T>,
  wasmQueryFn?: QueryFunction<T>
) {
  return {
    queryKey,
    queryFn: async (context: any): Promise<T> => {
      const startTime = performance.now();
      const keyString = JSON.stringify(queryKey);
      const shouldUseWasm = wasmQueryFn !== undefined && wasmMonitor.shouldUseWasm(keyString);
      
      try {
        const result = shouldUseWasm ? await wasmQueryFn!(context) : await jsQueryFn(context);
        const duration = performance.now() - startTime;
        
        wasmMonitor.recordQuery(keyString, duration, shouldUseWasm, true);
        
        // Persist successful queries for offline use
        await queryPersister.persistQuery(queryKey, result);
        
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        wasmMonitor.recordQuery(keyString, duration, shouldUseWasm, false);
        
        // Fallback to JS on WASM error
        if (shouldUseWasm && wasmQueryFn) {
          logger.warn('WASM query failed, falling back to JS implementation');
          try {
            const fallbackResult = await jsQueryFn(context);
            const fallbackDuration = performance.now() - startTime;
            wasmMonitor.recordQuery(keyString, fallbackDuration, false, true);
            return fallbackResult;
          } catch (fallbackError) {
            // Try to restore from persistence as last resort
            const restored = await queryPersister.restoreQuery(queryKey);
            if (restored !== undefined) {
              logger.info('Restored query from cache after WASM and JS failures');
              return restored as T;
            }
            throw fallbackError;
          }
        }
        
        // Try to restore from persistence
        const restored = await queryPersister.restoreQuery(queryKey);
        if (restored !== undefined) {
          logger.info('Restored query from cache after failure');
          return restored as T;
        }
        
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // Financial data refreshes every 2 minutes
    gcTime: 10 * 60 * 1000, // Keep financial data longer in cache
  };
}

// ============================================================================
// INTELLIGENT PREFETCHER
// ============================================================================

class IntelligentPrefetcher {
  private hoverTimers = new Map<string, NodeJS.Timeout>();
  private prefetchHistory = new Set<string>();
  private prefetchDelay = 300; // ms
  
  /**
   * Prefetch query on hover with debounce
   */
  onHover<T>(queryKey: QueryKey, queryFn: QueryFunction<T>, delay = this.prefetchDelay): void {
    const key = JSON.stringify(queryKey);
    
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
  onHoverEnd(queryKey: QueryKey): void {
    const key = JSON.stringify(queryKey);
    const timer = this.hoverTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.hoverTimers.delete(key);
    }
  }
  
  /**
   * Clear prefetch history to allow re-prefetching
   */
  clearHistory(): void {
    this.prefetchHistory.clear();
  }
}

// ============================================================================
// PERFORMANCE TRACKER
// ============================================================================

class QueryPerformanceTracker {
  private metrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();
  
  track(queryKey: QueryKey, duration: number): void {
    const key = JSON.stringify(queryKey);
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
  
  getMetrics(): Record<string, { count: number; totalTime: number; avgTime: number }> {
    return Object.fromEntries(this.metrics.entries());
  }
  
  getSlowestQueries(limit = 5): Array<[string, { count: number; totalTime: number; avgTime: number }]> {
    return Array.from(this.metrics.entries())
      .sort(([, a], [, b]) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }
  
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const intelligentPrefetcher = new IntelligentPrefetcher();
export const performanceTracker = new QueryPerformanceTracker();
export const backgroundSyncQueue = syncQueue;
export const webAssemblyMonitor = wasmMonitor;

export {
  QueryClientProvider,
  type QueryKey,
  type QueryFunction,
  type OptimisticContext,
  type PerformanceMetrics
};

// Initialize global monitoring
if (typeof window !== 'undefined') {
  (window as any).reactQueryMetrics = {
    wasmMonitor,
    performanceTracker,
    syncQueue,
    queryPersister
  };
}

logger.info('Advanced React Query configuration initialized successfully');