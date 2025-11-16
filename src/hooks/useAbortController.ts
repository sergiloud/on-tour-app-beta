/**
 * useAbortController Hook
 * 
 * Provides automatic AbortController management for async operations
 * Automatically aborts pending requests when component unmounts
 */

import { useEffect, useRef } from 'react';

/**
 * Hook that provides AbortController with automatic cleanup
 * 
 * @example
 * const { signal, abort } = useAbortController();
 * 
 * useEffect(() => {
 *   fetch('/api/data', { signal })
 *     .then(response => response.json())
 *     .then(data => setData(data))
 *     .catch(error => {
 *       if (error.name !== 'AbortError') {
 *         console.error('Request failed:', error);
 *       }
 *     });
 * }, [signal]);
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  // Create new controller on mount or when previous is aborted
  if (!controllerRef.current || controllerRef.current.signal.aborted) {
    controllerRef.current = new AbortController();
  }

  const abort = () => {
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      controllerRef.current.abort();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abort();
    };
  }, []);

  return {
    signal: controllerRef.current.signal,
    abort,
    isAborted: controllerRef.current.signal.aborted
  };
}

/**
 * Hook for managing multiple AbortControllers
 * Useful when you need to manage multiple async operations independently
 * 
 * @example
 * const controllers = useAbortControllers();
 * 
 * const fetchUserData = () => {
 *   const signal = controllers.create('userData');
 *   fetch('/api/user', { signal }).then(...);
 * };
 * 
 * const fetchPosts = () => {
 *   const signal = controllers.create('posts');
 *   fetch('/api/posts', { signal }).then(...);
 * };
 * 
 * // Abort specific request
 * controllers.abort('userData');
 * 
 * // Abort all requests
 * controllers.abortAll();
 */
export function useAbortControllers() {
  const controllersRef = useRef<Map<string, AbortController>>(new Map());

  const create = (key: string): AbortSignal => {
    // Abort existing controller with same key
    const existing = controllersRef.current.get(key);
    if (existing && !existing.signal.aborted) {
      existing.abort();
    }

    // Create new controller
    const controller = new AbortController();
    controllersRef.current.set(key, controller);
    return controller.signal;
  };

  const abort = (key: string) => {
    const controller = controllersRef.current.get(key);
    if (controller && !controller.signal.aborted) {
      controller.abort();
      controllersRef.current.delete(key);
    }
  };

  const abortAll = () => {
    controllersRef.current.forEach((controller, key) => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });
    controllersRef.current.clear();
  };

  const getSignal = (key: string): AbortSignal | undefined => {
    return controllersRef.current.get(key)?.signal;
  };

  // Cleanup all controllers on unmount
  useEffect(() => {
    return () => {
      abortAll();
    };
  }, []);

  return {
    create,
    abort,
    abortAll,
    getSignal,
    has: (key: string) => controllersRef.current.has(key),
    size: controllersRef.current.size
  };
}