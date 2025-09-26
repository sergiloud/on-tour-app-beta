import { useEffect, useState } from 'react';

/**
 * useDebounce returns a debounced version of a value that only updates
 * after the specified delay has elapsed without further changes.
 */
export function useDebounce<T>(value: T, delay = 180) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
