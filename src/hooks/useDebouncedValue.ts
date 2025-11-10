import { useEffect, useState } from 'react';

/**
 * Hook que debouncea un valor para evitar re-renders excesivos
 * @param value - El valor a debouncer
 * @param delay - El delay en milisegundos (default: 300ms)
 * @returns El valor debouncedo
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
