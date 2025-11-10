import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildFinanceSnapshotFromShows } from '../features/finance/snapshot';
import type { FinanceSnapshot, FinanceShow } from '../features/finance/types';
import { selectKpis, selectNetSeries, selectStatusBreakdown, selectMonthlySeries, selectThisMonth, type KpiNumbers, type NetPoint, type StatusBreakdown, type MonthlySeries, type ThisMonthAgg } from '../features/finance/selectors';
import { selectBreakdownsV2, selectExpectedPipelineV2, selectARAgingV2 } from '../features/finance/selectors.v2';
import { fetchFinanceSnapshot, fetchTargets as fetchTargetsApi, updateTargetsApi, subscribeSnapshot } from '../services/financeApi';
import { useSettings } from './SettingsContext';
import { isInRegion } from '../lib/geo';
import { trackEvent } from '../lib/telemetry';
import { secureStorage } from '../lib/secureStorage';

type FinanceContextValue = {
  snapshot: FinanceSnapshot;
  kpis: KpiNumbers;
  netSeries: NetPoint[];
  monthlySeries: MonthlySeries;
  compareSnapshot: FinanceSnapshot | null;
  compareMonthlySeries: MonthlySeries | null;
  thisMonth: ThisMonthAgg;
  statusBreakdown: StatusBreakdown;
  // v2 derived data for Beta view consumers
  v2?: {
    breakdowns: ReturnType<typeof selectBreakdownsV2>;
    expected: ReturnType<typeof selectExpectedPipelineV2>;
    aging: ReturnType<typeof selectARAgingV2>;
  };
  refresh: () => void;
  loading: boolean;
  targets: FinanceTargets;
  updateTargets: (patch: Partial<FinanceTargets>) => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

const emptySnapshot: FinanceSnapshot = {
  asOf: new Date(0).toISOString(),
  shows: [],
  month: { start: '', end: '', income: 0, expenses: 0, net: 0 },
  year: { income: 0, expenses: 0, net: 0 },
  pending: 0,
};

// Finance KPI targets (placeholder persisted locally; can be moved to backend)
export type FinanceTargets = {
  yearNet: number;
  pending: number;
  expensesMonth: number;
  netMonth: number;
  incomeMonth: number;
  costsMonth: number;
};
const TARGETS_LS_KEY = 'finance-targets-v1';
const DEFAULT_TARGETS: FinanceTargets = {
  yearNet: 250_000,
  pending: 50_000,
  expensesMonth: 42_000,
  netMonth: 60_000,
  incomeMonth: 120_000,
  costsMonth: 60_000,
};

function loadTargets(): FinanceTargets {
  try {
    const stored = secureStorage.getItem<FinanceTargets>(TARGETS_LS_KEY);
    if (stored) return { ...DEFAULT_TARGETS, ...stored };
  } catch { }
  return DEFAULT_TARGETS;
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseSnapshot, setBaseSnapshot] = useState<FinanceSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(false);
  const [targets, setTargets] = useState<FinanceTargets>(() => loadTargets());
  const nowRef = useRef<Date>(new Date());
  const { region, dateRange, selectedStatuses } = useSettings();
  const isTest = typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test';

  const compute = (shows: FinanceShow[], now = new Date()) => buildFinanceSnapshotFromShows(shows, now);

  useEffect(() => {
    let mounted = true;
    // In tests, avoid async fetch/subscription noise; seed from local store once.
    if (isTest) {
      // Keep tests lightweight: provide an empty snapshot; finance-specific tests can override via context if needed
      setBaseSnapshot(buildFinanceSnapshotFromShows([], new Date()));
      return () => { mounted = false; };
    }
    (async () => {
      setLoading(true);
      try {
        const s = await fetchFinanceSnapshot(new Date());
        if (mounted) setBaseSnapshot(s);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    const unsub = subscribeSnapshot((evt) => {
      if (evt.type === 'snapshot.updated') {
        nowRef.current = new Date();
        setBaseSnapshot(evt.payload);
      }
    });
    return () => { mounted = false; unsub(); };
  }, []);

  // Derive filtered snapshot from base snapshot and global filters
  const snapshot: FinanceSnapshot = useMemo(() => {
    const fromTs = dateRange?.from ? new Date(dateRange.from + 'T00:00:00').getTime() : -Infinity;
    // Build local end-of-day to avoid UTC shift
    const toTs = dateRange?.to ? new Date(dateRange.to + 'T23:59:59.999').getTime() : Infinity;
    const filteredShows = (baseSnapshot.shows as FinanceShow[]).filter(s => {
      const t = new Date(s.date).getTime();
      if (t < fromTs || t > toTs) return false;
      if (!isInRegion((s as any).country, region as any)) return false;
      if (!selectedStatuses.includes(s.status)) return false;
      return true;
    });
    // Recompute filtered snapshot and align asOf to end of selected range for period-aware selectors
    const d = isFinite(toTs) ? new Date(toTs) : new Date(baseSnapshot.asOf || Date.now());
    return buildFinanceSnapshotFromShows(filteredShows, d);
  }, [baseSnapshot, region, dateRange.from, dateRange.to, selectedStatuses]);

  // Build compare snapshot using previous period of same length
  const compareSnapshot: FinanceSnapshot | null = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return null;
    try {
      const from = new Date(dateRange.from + 'T00:00:00');
      const to = new Date(dateRange.to + 'T23:59:59.999');
      const lenMs = Math.max(0, to.getTime() - from.getTime());
      const prevFrom = new Date(from.getTime() - (lenMs + 24 * 60 * 60 * 1000)); // shift back inclusive by 1 day
      const prevTo = new Date(to.getTime() - (lenMs + 24 * 60 * 60 * 1000));
      const pf = prevFrom.getTime();
      const pt = prevTo.getTime();
      const shows = (baseSnapshot.shows as FinanceShow[]).filter(s => {
        const t = new Date(s.date).getTime();
        if (t < pf || t > pt) return false;
        if (!isInRegion((s as any).country, region as any)) return false;
        if (!selectedStatuses.includes(s.status)) return false;
        return true;
      });
      return buildFinanceSnapshotFromShows(shows, prevTo);
    } catch { return null; }
  }, [baseSnapshot, region, dateRange.from, dateRange.to, selectedStatuses]);

  const kpis = useMemo(() => selectKpis(snapshot), [snapshot]);
  const netSeries = useMemo(() => selectNetSeries(snapshot), [snapshot]);
  const monthlySeries = useMemo(() => selectMonthlySeries(snapshot), [snapshot]);
  const compareMonthlySeries = useMemo(() => compareSnapshot ? selectMonthlySeries(compareSnapshot) : null, [compareSnapshot]);
  const thisMonth = useMemo(() => selectThisMonth(snapshot), [snapshot]);
  const statusBreakdown = useMemo(() => selectStatusBreakdown(snapshot), [snapshot]);
  const v2 = useMemo(() => ({
    breakdowns: selectBreakdownsV2(snapshot),
    expected: selectExpectedPipelineV2(snapshot),
    aging: selectARAgingV2(snapshot)
  }), [snapshot]);

  // Memoize updateTargets and refresh to maintain stable references
  const updateTargetsMemo = React.useCallback((patch: Partial<FinanceTargets>) => {
    setTargets(prev => {
      const next = { ...prev, ...patch };
      try { secureStorage.setItem(TARGETS_LS_KEY, next); } catch { }
      try { trackEvent('finance.targets.update', patch as any); } catch { }
      return next;
    });
    updateTargetsApi(patch).catch(() => { });
  }, []);

  const refreshMemo = React.useCallback(() => {
    setLoading(true);
    fetchFinanceSnapshot(new Date()).then(s => setBaseSnapshot(s)).finally(() => setLoading(false));
  }, []);

  // Memoize entire context value to prevent cascading re-renders
  const value: FinanceContextValue = useMemo(() => ({
    snapshot,
    kpis,
    netSeries,
    monthlySeries,
    compareSnapshot,
    compareMonthlySeries,
    thisMonth,
    statusBreakdown,
    loading,
    targets,
    updateTargets: updateTargetsMemo,
    v2,
    refresh: refreshMemo,
  }), [
    snapshot,
    kpis,
    netSeries,
    monthlySeries,
    compareSnapshot,
    compareMonthlySeries,
    thisMonth,
    statusBreakdown,
    loading,
    targets,
    updateTargetsMemo,
    v2,
    refreshMemo
  ]);

  // Hydrate targets from API on mount (backed by localStorage in dev)
  useEffect(() => {
    if (isTest) return; // skip targets fetch noise in tests
    let mounted = true;
    fetchTargetsApi().then(dto => {
      if (!mounted) return;
      setTargets({
        yearNet: dto.yearNet,
        pending: dto.pending,
        expensesMonth: dto.expensesMonth,
        netMonth: dto.netMonth,
        incomeMonth: dto.incomeMonth,
        costsMonth: dto.costsMonth,
      });
    }).catch(() => { });
    return () => { mounted = false; };
  }, []);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
