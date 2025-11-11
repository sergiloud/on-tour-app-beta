import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { PeriodPreset, DateRange } from '../components/finance/PeriodFilter';

export type ComparisonMode = 'none' | 'previous' | 'yearAgo';

interface FinancePeriodContextType {
  selectedPeriod: PeriodPreset;
  dateRange: DateRange;
  comparisonMode: ComparisonMode;
  comparisonDateRange: DateRange | null;
  setPeriod: (preset: PeriodPreset, range: DateRange) => void;
  setComparisonMode: (mode: ComparisonMode) => void;
  isInPeriod: (date: string) => boolean;
  isInComparisonPeriod: (date: string) => boolean;
}

const FinancePeriodContext = createContext<FinancePeriodContextType | undefined>(undefined);

const calculateInitialRange = (): DateRange => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // "Este mes" debe ir desde el día 1 hasta el ÚLTIMO día del mes, no hasta hoy
  const lastDayOfMonth = new Date(year, month + 1, 0);

  return {
    startDate: new Date(year, month, 1).toISOString().split('T')[0]!,
    endDate: lastDayOfMonth.toISOString().split('T')[0]!
  };
};

export const FinancePeriodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>('thisMonth');
  const [dateRange, setDateRange] = useState<DateRange>(calculateInitialRange());
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('none');

  const setPeriod = (preset: PeriodPreset, range: DateRange) => {
    console.log(`[FinancePeriodContext] Actualizando periodo: ${preset} (${range.startDate} a ${range.endDate})`);
    setSelectedPeriod(preset);
    setDateRange(range);
  };

  // Calculate comparison date range based on mode and current range
  const comparisonDateRange = useMemo<DateRange | null>(() => {
    if (comparisonMode === 'none') return null;

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    // Calculate duration in days
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (comparisonMode === 'previous') {
      // Previous period: same duration before current period
      const compEnd = new Date(start);
      compEnd.setDate(compEnd.getDate() - 1); // Day before current start

      const compStart = new Date(compEnd);
      compStart.setDate(compStart.getDate() - duration);

      return {
        startDate: compStart.toISOString().split('T')[0]!,
        endDate: compEnd.toISOString().split('T')[0]!
      };
    } else if (comparisonMode === 'yearAgo') {
      // Same period last year
      const compStart = new Date(start);
      compStart.setFullYear(compStart.getFullYear() - 1);

      const compEnd = new Date(end);
      compEnd.setFullYear(compEnd.getFullYear() - 1);

      return {
        startDate: compStart.toISOString().split('T')[0]!,
        endDate: compEnd.toISOString().split('T')[0]!
      };
    }

    return null;
  }, [comparisonMode, dateRange]);

  const isInPeriod = useMemo(() => {
    return (date: string): boolean => {
      if (!date) return false;

      // Normalizar todas las fechas a formato YYYY-MM-DD para comparación de strings
      // Manejar formatos: "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss.sssZ", etc.
      let checkDateStr = date.includes('T') ? date.split('T')[0] : date;

      // Si la fecha ya tiene guiones, es YYYY-MM-DD, si no intentar convertir
      if (!checkDateStr || checkDateStr.length < 10) {
        console.warn(`[FinancePeriod] Invalid date format: ${date}`);
        return false;
      }

      const startStr = dateRange.startDate;
      const endStr = dateRange.endDate;

      // Comparación de strings YYYY-MM-DD es confiable y rápida
      const result = checkDateStr >= startStr && checkDateStr <= endStr;

      return result;
    };
  }, [dateRange]);

  const isInComparisonPeriod = useMemo(() => {
    return (date: string): boolean => {
      if (!comparisonDateRange || !date) return false;

      let checkDateStr = date.includes('T') ? date.split('T')[0] : date;

      if (!checkDateStr || checkDateStr.length < 10) {
        return false;
      }

      const startStr = comparisonDateRange.startDate;
      const endStr = comparisonDateRange.endDate;

      return checkDateStr >= startStr && checkDateStr <= endStr;
    };
  }, [comparisonDateRange]);

  const value = {
    selectedPeriod,
    dateRange,
    setPeriod,
    isInPeriod,
    comparisonMode,
    comparisonDateRange,
    setComparisonMode,
    isInComparisonPeriod
  };

  return (
    <FinancePeriodContext.Provider value={value}>
      {children}
    </FinancePeriodContext.Provider>
  );
};

export const useFinancePeriod = (): FinancePeriodContextType => {
  const context = useContext(FinancePeriodContext);
  if (!context) {
    throw new Error('useFinancePeriod must be used within FinancePeriodProvider');
  }
  return context;
};
