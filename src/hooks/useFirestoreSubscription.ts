/**
 * useFirestoreSubscription Hook
 * 
 * Provides automatic subscription management for Firestore listeners
 * Automatically unsubscribes when component unmounts
 */

import { useEffect, useRef } from 'react';
import type { Unsubscribe } from 'firebase/firestore';

/**
 * Hook that manages a single Firestore subscription with automatic cleanup
 * 
 * @example
 * const unsubscribe = useFirestoreSubscription();
 * 
 * useEffect(() => {
 *   const unsub = FirestoreService.subscribeToData(userId, (data) => {
 *     setData(data);
 *   });
 *   unsubscribe.set(unsub);
 * }, [userId, unsubscribe]);
 */
export function useFirestoreSubscription() {
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  const set = (unsubscribe: Unsubscribe) => {
    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    unsubscribeRef.current = unsubscribe;
  };

  const clear = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
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
    isActive: () => unsubscribeRef.current !== null
  };
}

/**
 * Hook for managing multiple Firestore subscriptions
 * Useful when you need to manage multiple listeners independently
 * 
 * @example
 * const subscriptions = useFirestoreSubscriptions();
 * 
 * useEffect(() => {
 *   const unsubUser = FirestoreService.subscribeToUser(userId, setUser);
 *   const unsubSettings = FirestoreService.subscribeToSettings(userId, setSettings);
 *   
 *   subscriptions.add('user', unsubUser);
 *   subscriptions.add('settings', unsubSettings);
 * }, [userId, subscriptions]);
 * 
 * // Remove specific subscription
 * subscriptions.remove('user');
 * 
 * // Clear all subscriptions
 * subscriptions.clear();
 */
export function useFirestoreSubscriptions() {
  const subscriptionsRef = useRef<Map<string, Unsubscribe>>(new Map());

  const add = (key: string, unsubscribe: Unsubscribe) => {
    // Clean up existing subscription with same key
    const existing = subscriptionsRef.current.get(key);
    if (existing) {
      existing();
    }
    
    subscriptionsRef.current.set(key, unsubscribe);
  };

  const remove = (key: string) => {
    const unsubscribe = subscriptionsRef.current.get(key);
    if (unsubscribe) {
      unsubscribe();
      subscriptionsRef.current.delete(key);
    }
  };

  const clear = () => {
    subscriptionsRef.current.forEach((unsubscribe) => {
      unsubscribe();
    });
    subscriptionsRef.current.clear();
  };

  const has = (key: string): boolean => {
    return subscriptionsRef.current.has(key);
  };

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  return {
    add,
    remove,
    clear,
    has,
    size: subscriptionsRef.current.size
  };
}

/**
 * Hook that creates a subscription and automatically manages it
 * 
 * @example
 * useFirestoreSubscription(
 *   () => FirestoreService.subscribeToUser(userId, setUser),
 *   [userId]
 * );
 */
export function useFirestoreAutoSubscription(
  createSubscription: () => Unsubscribe | undefined,
  dependencies: React.DependencyList
) {
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Create new subscription
    const unsubscribe = createSubscription();
    if (unsubscribe) {
      unsubscribeRef.current = unsubscribe;
    }

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, dependencies);

  return {
    isActive: () => unsubscribeRef.current !== null
  };
}