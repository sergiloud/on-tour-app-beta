import { useMemo, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';

/**
 * Hook optimizado para formatters que previene re-creación innecesaria
 * Útil en componentes pesados que formatean muchos valores
 */
export function useOptimizedFormatters() {
  const { fmtMoney, currency } = useSettings();

  // Memoizar formatter de dinero con configuración actual
  const formatMoney = useCallback(
    (amount: number) => fmtMoney(amount),
    [fmtMoney]
  );

  // Memoizar formatter de fecha
  const formatDate = useCallback(
    (date: string | Date) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
    []
  );

  // Memoizar formatter de porcentaje
  const formatPercent = useCallback(
    (value: number, decimals: number = 1) => {
      return `${value.toFixed(decimals)}%`;
    },
    []
  );

  // Memoizar formatter de números grandes
  const formatCompact = useCallback(
    (value: number) => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
    },
    []
  );

  return useMemo(
    () => ({
      formatMoney,
      formatDate,
      formatPercent,
      formatCompact,
      currency,
    }),
    [formatMoney, formatDate, formatPercent, formatCompact, currency]
  );
}
