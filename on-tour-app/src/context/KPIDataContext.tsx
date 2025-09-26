import React, { createContext, useContext } from 'react';
import { useFinanceKpis } from '../hooks/useFinanceKpis';

const KPIDataContext = createContext<ReturnType<typeof useFinanceKpis> | null>(null);

export const KPIDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useFinanceKpis();
  return <KPIDataContext.Provider value={value}>{children}</KPIDataContext.Provider>;
};

export function useKpi() {
  const ctx = useContext(KPIDataContext);
  if (!ctx) throw new Error('useKpi must be used within KPIDataProvider');
  return ctx;
}
