import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Optimized localStorage hook with debouncing and error handling
 * Automatically syncs across tabs and prevents excessive writes
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 500
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const valueRef = useRef(storedValue);

  // Update ref when value changes
  useEffect(() => {
    valueRef.current = storedValue;
  }, [storedValue]);

  // Debounced write to localStorage
  const writeToStorage = useCallback(
    (value: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        
        // Dispatch custom event for cross-tab sync
        window.dispatchEvent(
          new CustomEvent('localStorageChange', {
            detail: { key, value },
          })
        );
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Set value with debouncing
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(valueRef.current) : value;
        setStoredValue(valueToStore);

        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Debounce write to localStorage
        timeoutRef.current = setTimeout(() => {
          writeToStorage(valueToStore);
        }, debounceMs);
      } catch (error) {
        console.warn(`Error in setValue for key "${key}":`, error);
      }
    },
    [key, debounceMs, writeToStorage]
  );

  // Remove from localStorage
  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('key' in e) {
        // Native storage event (from other tabs)
        if (e.key === key && e.newValue) {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            console.warn(`Error parsing storage event for key "${key}":`, error);
          }
        }
      } else if ('detail' in e) {
        // Custom event (from same tab)
        const detail = e.detail as { key: string; value: T };
        if (detail.key === key) {
          setStoredValue(detail.value);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('localStorageChange', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('localStorageChange', handleStorageChange as EventListener);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key]);

  return [storedValue, setValue, remove];
}
