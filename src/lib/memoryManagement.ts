/**
 * Advanced Memory Management System
 * 
 * Professional implementation of memory leak prevention, performance monitoring,
 * and resource cleanup for React applications with WebAssembly integration.
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { logger } from './logger';

// ============================================================================
// MEMORY MONITORING UTILITIES
// ============================================================================

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
  componentCounts: Record<string, number>;
  listenerCounts: Record<string, number>;
}

class MemoryMonitor {
  private metrics: MemoryMetrics[] = [];
  private maxMetrics = 100;
  private isMonitoring = false;
  private interval: NodeJS.Timeout | null = null;
  private componentRegistry = new Map<string, Set<string>>();
  private listenerRegistry = new Map<string, Set<() => void>>();
  
  startMonitoring(intervalMs = 5000): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.interval = setInterval(() => {
      this.recordMetrics();
    }, intervalMs);
    
    logger.info('Memory monitoring started');
  }
  
  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    logger.info('Memory monitoring stopped');
  }
  
  private recordMetrics(): void {
    if (!('memory' in performance)) {
      logger.warn('Performance.memory not available');
      return;
    }
    
    const memory = (performance as any).memory;
    const metrics: MemoryMetrics = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now(),
      componentCounts: Object.fromEntries(
        Array.from(this.componentRegistry.entries()).map(([name, instances]) => [name, instances.size])
      ),
      listenerCounts: Object.fromEntries(
        Array.from(this.listenerRegistry.entries()).map(([name, listeners]) => [name, listeners.size])
      )
    };
    
    this.metrics.push(metrics);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
    
    // Check for memory leaks
    this.detectMemoryLeaks(metrics);
  }
  
  private detectMemoryLeaks(current: MemoryMetrics): void {
    if (this.metrics.length < 10) return; // Need history for comparison
    
    const previous = this.metrics[this.metrics.length - 10];
    if (!previous) return; // Safety check
    
    const memoryGrowth = current.usedJSHeapSize - previous.usedJSHeapSize;
    const timeElapsed = current.timestamp - previous.timestamp;
    
    // If memory grew by more than 50MB in 50 seconds, flag potential leak
    if (memoryGrowth > 50 * 1024 * 1024 && timeElapsed < 50000) {
      logger.warn('Potential memory leak detected', {
        memoryGrowth: `${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`,
        timeElapsed: `${(timeElapsed / 1000).toFixed(1)}s`,
        currentUsage: `${(current.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`
      });
      
      // Dispatch memory leak event
      window.dispatchEvent(new CustomEvent('memory-leak-detected', {
        detail: { memoryGrowth, current, previous }
      }));
    }
  }
  
  registerComponent(componentName: string, instanceId: string): void {
    if (!this.componentRegistry.has(componentName)) {
      this.componentRegistry.set(componentName, new Set());
    }
    this.componentRegistry.get(componentName)!.add(instanceId);
  }
  
  unregisterComponent(componentName: string, instanceId: string): void {
    const instances = this.componentRegistry.get(componentName);
    if (instances) {
      instances.delete(instanceId);
      if (instances.size === 0) {
        this.componentRegistry.delete(componentName);
      }
    }
  }
  
  registerListener(listenerName: string, cleanup: () => void): void {
    if (!this.listenerRegistry.has(listenerName)) {
      this.listenerRegistry.set(listenerName, new Set());
    }
    this.listenerRegistry.get(listenerName)!.add(cleanup);
  }
  
  unregisterListener(listenerName: string, cleanup: () => void): void {
    const listeners = this.listenerRegistry.get(listenerName);
    if (listeners) {
      listeners.delete(cleanup);
      if (listeners.size === 0) {
        this.listenerRegistry.delete(listenerName);
      }
    }
  }
  
  getMetrics(): MemoryMetrics[] {
    return [...this.metrics];
  }

  getCurrentMetrics(): MemoryMetrics & { current: MemoryInfo; leakDetectionScore?: number } {
    const memory = (performance as any).memory;
    const current: MemoryInfo = {
      usedJSHeapSize: memory?.usedJSHeapSize || 0,
      totalJSHeapSize: memory?.totalJSHeapSize || 0,
      jsHeapSizeLimit: memory?.jsHeapSizeLimit || 0
    };

    const baseMetrics: MemoryMetrics = {
      usedJSHeapSize: current.usedJSHeapSize,
      totalJSHeapSize: current.totalJSHeapSize,
      jsHeapSizeLimit: current.jsHeapSizeLimit,
      timestamp: Date.now(),
      componentCounts: Object.fromEntries(
        Array.from(this.componentRegistry.entries()).map(([name, instances]) => [name, instances.size])
      ),
      listenerCounts: Object.fromEntries(
        Array.from(this.listenerRegistry.entries()).map(([name, listeners]) => [name, listeners.size])
      )
    };

    let leakDetectionScore = 0;
    if (this.metrics.length >= 10) {
      const previous = this.metrics[this.metrics.length - 10];
      if (previous) {
        const memoryGrowth = current.usedJSHeapSize - previous.usedJSHeapSize;
        const timeElapsed = Date.now() - previous.timestamp;
        leakDetectionScore = memoryGrowth > 50 * 1024 * 1024 && timeElapsed < 50000 ? 80 : 20;
      }
    }

    return {
      ...baseMetrics,
      current,
      leakDetectionScore
    };
  }
  
  getCurrentUsage(): number {
    if (!('memory' in performance)) return 0;
    return (performance as any).memory.usedJSHeapSize;
  }
  
  forceGarbageCollection(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      logger.info('Manual garbage collection triggered');
    } else {
      logger.warn('Garbage collection not available');
    }
  }
}

export const memoryMonitor = new MemoryMonitor();

// ============================================================================
// REACT HOOKS FOR MEMORY MANAGEMENT
// ============================================================================

/**
 * Professional hook for automatic memory leak prevention
 */
export function useMemoryManagement(componentName: string) {
  const instanceId = useRef(`${componentName}_${Math.random().toString(36).substr(2, 9)}`);
  const mounted = useRef(true);
  
  useEffect(() => {
    // Register component
    memoryMonitor.registerComponent(componentName, instanceId.current);
    
    return () => {
      mounted.current = false;
      // Unregister component
      memoryMonitor.unregisterComponent(componentName, instanceId.current);
    };
  }, [componentName]);
  
  // Safe state updater that checks if component is still mounted
  const safeSetState = useCallback(<T>(setter: (value: T) => void) => {
    return (value: T) => {
      if (mounted.current) {
        setter(value);
      }
    };
  }, []);
  
  return {
    instanceId: instanceId.current,
    isMounted: () => mounted.current,
    safeSetState
  };
}

/**
 * Professional hook for listener cleanup management
 */
export function useListenerCleanup(listenerName: string) {
  const cleanupFunctions = useRef<Set<() => void>>(new Set());
  
  const addListener = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.add(cleanup);
    memoryMonitor.registerListener(listenerName, cleanup);
  }, [listenerName]);
  
  const removeListener = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.delete(cleanup);
    memoryMonitor.unregisterListener(listenerName, cleanup);
  }, [listenerName]);
  
  useEffect(() => {
    return () => {
      // Cleanup all registered listeners
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
          memoryMonitor.unregisterListener(listenerName, cleanup);
        } catch (error) {
          logger.error(`Cleanup failed for listener ${listenerName}`, error as Error);
        }
      });
      cleanupFunctions.current.clear();
    };
  }, [listenerName]);
  
  return { addListener, removeListener };
}

/**
 * Professional AbortController hook for fetch operations
 */
export function useAbortController() {
  const controllers = useRef<Set<AbortController>>(new Set());
  
  const createController = useCallback(() => {
    const controller = new AbortController();
    controllers.current.add(controller);
    
    // Auto-cleanup when signal is aborted
    controller.signal.addEventListener('abort', () => {
      controllers.current.delete(controller);
    });
    
    return controller;
  }, []);
  
  const abortAll = useCallback(() => {
    controllers.current.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });
    controllers.current.clear();
  }, []);
  
  useEffect(() => {
    return () => {
      // Abort all controllers on unmount
      abortAll();
    };
  }, [abortAll]);
  
  return { createController, abortAll };
}

// ============================================================================
// FIRESTORE LISTENER MANAGEMENT
// ============================================================================

interface FirestoreListenerConfig {
  collectionPath: string;
  queryConstraints?: any[];
  onData: (data: any) => void;
  onError?: (error: Error) => void;
  debounceMs?: number;
}

/**
 * Professional Firestore listener with automatic cleanup and debouncing
 */
export function useFirestoreListener(config: FirestoreListenerConfig) {
  const { collectionPath, queryConstraints = [], onData, onError, debounceMs = 300 } = config;
  const { addListener } = useListenerCleanup(`firestore:${collectionPath}`);
  const debouncedCallbackRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const setupListener = async () => {
      try {
        // Dynamic import to avoid bundle bloat
        const { onSnapshot, collection, query } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        
        if (!db) {
          throw new Error('Firestore database not initialized');
        }
        
        let firestoreQuery = collection(db, collectionPath);
        
        if (queryConstraints.length > 0) {
          firestoreQuery = query(firestoreQuery, ...queryConstraints) as any;
        }
        
        unsubscribe = onSnapshot(
          firestoreQuery,
          (snapshot) => {
            // Debounce rapid updates
            if (debouncedCallbackRef.current) {
              clearTimeout(debouncedCallbackRef.current);
            }
            
            debouncedCallbackRef.current = setTimeout(() => {
              const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              onData(data);
            }, debounceMs);
          },
          (error) => {
            logger.error(`Firestore listener error for ${collectionPath}`, error);
            if (onError) onError(error);
          }
        );
        
        // Register cleanup
        addListener(() => {
          if (unsubscribe) unsubscribe();
          if (debouncedCallbackRef.current) {
            clearTimeout(debouncedCallbackRef.current);
          }
        });
        
      } catch (error) {
        logger.error(`Failed to setup Firestore listener for ${collectionPath}`, error as Error);
        if (onError) onError(error as Error);
      }
    };
    
    setupListener();
    
    return () => {
      if (unsubscribe) unsubscribe();
      if (debouncedCallbackRef.current) {
        clearTimeout(debouncedCallbackRef.current);
      }
    };
  }, [collectionPath, JSON.stringify(queryConstraints), onData, onError, debounceMs, addListener]);
}

// ============================================================================
// SOCKET.IO CONNECTION MANAGEMENT
// ============================================================================

interface SocketConfig {
  url: string;
  options?: any;
  events: Record<string, (data: any) => void>;
  reconnectConfig?: {
    attempts: number;
    delay: number;
  };
}

/**
 * Professional Socket.IO hook with connection pooling and cleanup
 */
export function useSocketConnection(config: SocketConfig) {
  const { url, options = {}, events, reconnectConfig = { attempts: 5, delay: 1000 } } = config;
  const { addListener } = useListenerCleanup(`socket:${url}`);
  const socketRef = useRef<any>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout>();
  
  const connect = useCallback(async () => {
    try {
      // Dynamic import to avoid bundle bloat
      const { io } = await import('socket.io-client');
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      socketRef.current = io(url, {
        ...options,
        autoConnect: false
      });
      
      // Setup event listeners
      Object.entries(events).forEach(([event, handler]) => {
        socketRef.current.on(event, handler);
      });
      
      // Connection management
      socketRef.current.on('connect', () => {
        logger.info(`Socket connected to ${url}`);
        reconnectAttempts.current = 0;
      });
      
      socketRef.current.on('disconnect', () => {
        logger.warn(`Socket disconnected from ${url}`);
        scheduleReconnect();
      });
      
      socketRef.current.on('error', (error: Error) => {
        logger.error(`Socket error for ${url}`, error);
        scheduleReconnect();
      });
      
      socketRef.current.connect();
      
      // Register cleanup
      const cleanup = () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
        }
      };
      
      addListener(cleanup);
      
    } catch (error) {
      logger.error(`Failed to connect socket to ${url}`, error as Error);
    }
  }, [url, options, events, addListener]);
  
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= reconnectConfig.attempts) {
      logger.error(`Max reconnection attempts reached for ${url}`);
      return;
    }
    
    reconnectAttempts.current++;
    const delay = reconnectConfig.delay * reconnectAttempts.current;
    
    reconnectTimer.current = setTimeout(() => {
      logger.info(`Reconnecting to ${url} (attempt ${reconnectAttempts.current})`);
      connect();
    }, delay);
  }, [url, connect, reconnectConfig]);
  
  useEffect(() => {
    connect();
  }, [connect]);
  
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);
  
  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);
  
  return {
    socket: socketRef.current,
    disconnect,
    emit,
    isConnected: socketRef.current?.connected || false
  };
}

// ============================================================================
// INITIALIZATION AND GLOBAL SETUP
// ============================================================================

// Start memory monitoring in development
if (process.env.NODE_ENV === 'development') {
  memoryMonitor.startMonitoring();
  
  // Global memory leak detection
  window.addEventListener('memory-leak-detected', (event: any) => {
    const { memoryGrowth, current } = event.detail;
    console.warn('🚨 Memory leak detected!', {
      growth: `${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`,
      current: `${(current.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(current.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    });
  });
}

// Global cleanup on page unload
window.addEventListener('beforeunload', () => {
  memoryMonitor.stopMonitoring();
});

logger.info('Advanced Memory Management System initialized');