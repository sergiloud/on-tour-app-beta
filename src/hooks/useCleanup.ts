/**
 * useCleanup Hook
 * 
 * Provides utilities for automatic cleanup of timers, intervals, and event listeners
 */

import { useEffect, useRef } from 'react';

/**
 * Hook for managing timeouts with automatic cleanup
 * 
 * @example
 * const timeout = useTimeout();
 * 
 * const handleClick = () => {
 *   timeout.set(() => {
 *     console.log('Delayed action');
 *   }, 1000);
 * };
 * 
 * // Clear timeout manually if needed
 * const handleCancel = () => {
 *   timeout.clear();
 * };
 */
export function useTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const set = (callback: () => void, delay: number) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(callback, delay);
    return timeoutRef.current;
  };

  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  return {
    set,
    clear,
    isActive: () => timeoutRef.current !== null
  };
}

/**
 * Hook for managing intervals with automatic cleanup
 * 
 * @example
 * const interval = useInterval();
 * 
 * useEffect(() => {
 *   interval.set(() => {
 *     fetchData();
 *   }, 5000);
 * }, [interval]);
 */
export function useInterval() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const set = (callback: () => void, delay: number) => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(callback, delay);
    return intervalRef.current;
  };

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  return {
    set,
    clear,
    isActive: () => intervalRef.current !== null
  };
}

/**
 * Hook for managing event listeners with automatic cleanup
 * 
 * @example
 * const listeners = useEventListeners();
 * 
 * useEffect(() => {
 *   listeners.add(window, 'resize', handleResize);
 *   listeners.add(document, 'keydown', handleKeyDown);
 * }, [listeners]);
 */
export function useEventListeners() {
  const listenersRef = useRef<Array<{
    target: EventTarget;
    event: string;
    handler: EventListener;
    options?: boolean | AddEventListenerOptions;
  }>>([]);

  const add = (
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    // Remove existing listener if it exists
    remove(target, event, handler);

    // Add new listener
    target.addEventListener(event, handler, options);
    listenersRef.current.push({ target, event, handler, options });
  };

  const remove = (
    target: EventTarget,
    event: string,
    handler: EventListener
  ) => {
    const index = listenersRef.current.findIndex(
      listener => 
        listener.target === target && 
        listener.event === event && 
        listener.handler === handler
    );

    if (index >= 0) {
      const listener = listenersRef.current[index];
      if (listener) {
        target.removeEventListener(event, handler, listener.options);
        listenersRef.current.splice(index, 1);
      }
    }
  };

  const clear = () => {
    listenersRef.current.forEach(({ target, event, handler, options }) => {
      target.removeEventListener(event, handler, options);
    });
    listenersRef.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  return {
    add,
    remove,
    clear,
    count: listenersRef.current.length
  };
}

/**
 * Hook that combines timeout, interval, and event listener management
 * 
 * @example
 * const cleanup = useCleanup();
 * 
 * useEffect(() => {
 *   cleanup.timeout(() => console.log('Delayed'), 1000);
 *   cleanup.interval(() => console.log('Recurring'), 5000);
 *   cleanup.addEventListener(window, 'resize', handleResize);
 * }, [cleanup]);
 */
export function useCleanup() {
  const timeout = useTimeout();
  const interval = useInterval();
  const listeners = useEventListeners();

  const clearAll = () => {
    timeout.clear();
    interval.clear();
    listeners.clear();
  };

  return {
    // Timeout methods
    timeout: timeout.set,
    clearTimeout: timeout.clear,
    
    // Interval methods
    interval: interval.set,
    clearInterval: interval.clear,
    
    // Event listener methods
    addEventListener: listeners.add,
    removeEventListener: listeners.remove,
    clearEventListeners: listeners.clear,
    
    // Clear all
    clearAll,
    
    // Status
    hasActiveTimeout: timeout.isActive,
    hasActiveInterval: interval.isActive,
    eventListenerCount: listeners.count
  };
}