import React, { createContext, useContext, useMemo } from 'react';
import { useFinanceKpis } from '../hooks/useFinanceKpis';

const KPIDataContext = createContext<ReturnType<typeof useFinanceKpis> | null>(null);

export const KPIDataProvider = ({ children }: { children: React.ReactNode }) => {
  const kpiData = useFinanceKpis();
  
  // Memoize the value to prevent unnecessary re-renders
  const value = useMemo(() => kpiData, [
    kpiData.display,
    kpiData.raw,
    kpiData.targets,
  ]);
  
  return <KPIDataContext.Provider value={value}>{children}</KPIDataContext.Provider>;
};

export function useKpi() {
  const ctx = useContext(KPIDataContext);
  if (!ctx) throw new Error('useKpi must be used within KPIDataProvider');
  return ctx;
}
