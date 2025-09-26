// Unified Finance Core (Phase 0 Skeleton)
// Provides a single typed facade for finance data & chart consumption.
// Non-breaking: existing modules keep working while new dashboard migrates here.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { summarizeMonth } from './finance-calcs';
import { demoShows } from '../../../data/demo';
import type { FinanceCoreApi, FinanceSnapshot } from './finance-types';
import { buildSnapshot } from './snapshot-builder';
import { startFinanceRealtime, onFinanceSnapshot } from './finance-realtime';

// ---------------- Context ----------------
const FinanceCoreContext = createContext<FinanceCoreApi | null>(null);

export const FinanceCoreProvider: React.FC<{ children?: React.ReactNode; realtime?: boolean }> = ({ children, realtime=false }) => {
  const [snapshot, setSnapshot] = useState<FinanceSnapshot | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | undefined>(undefined);

  async function refresh(){
    const snap = buildSnapshot();
    const final = selectedScenarioId && snap.forecasts?.some(f=> f.id===selectedScenarioId)
      ? { ...snap, selectedScenarioId }
      : snap;
    setSnapshot(final);
  }

  useEffect(()=> { 
    refresh();
    if(realtime){
      startFinanceRealtime();
      const off = onFinanceSnapshot(s => setSnapshot(prev => ({ ...s, selectedScenarioId: prev?.selectedScenarioId || s.selectedScenarioId })) );
      return () => { off(); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtime]);

  const api: FinanceCoreApi = useMemo(() => ({
    snapshot,
    refresh,
    getShow: (id: string) => snapshot?.shows.find(s => s.id === id),
    getMonthSeries: (monthsBack = 11) => {
      const now = new Date();
      const res: Array<{ month: string; income: number; expenses: number; net: number }> = [];
      for(let i=monthsBack; i>=0; i--){
        const d = new Date(now); d.setMonth(d.getMonth()-i);
        const sum = summarizeMonth(demoShows, d.getMonth(), d.getFullYear());
        res.push({ month: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, income: sum.income, expenses: sum.expenses, net: sum.net });
      }
      return res;
    },
    setScenario: (id: string) => {
      setSelectedScenarioId(id);
      setSnapshot(s => s ? { ...s, selectedScenarioId: id } : s);
    },
    listScenarios: () => (snapshot?.forecasts || []).map(f => ({ id: f.id, label: f.label }))
  }), [snapshot]);

  return <FinanceCoreContext.Provider value={api}>{children}</FinanceCoreContext.Provider>;
};

export function useFinanceCore(): FinanceCoreApi {
  const ctx = useContext(FinanceCoreContext);
  if(!ctx) throw new Error('useFinanceCore must be used within FinanceCoreProvider');
  return ctx;
}

export function useFinanceChartSeries(){
  const { getMonthSeries, snapshot } = useFinanceCore();
  return { cashflowSeries: getMonthSeries(), kpis: snapshot?.kpis };
}

export default FinanceCoreProvider;
