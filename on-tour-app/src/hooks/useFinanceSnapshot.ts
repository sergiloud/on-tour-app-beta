import { useShowsQuery } from './useShowsQuery';
import { useFinance } from '../context/FinanceContext';
import { useSettings } from '../context/SettingsContext';

/**
 * Hook to get finance snapshot with all shows data
 * Combines React Query shows data with finance context
 * Provides unified access to finance data needed by finance components
 */
export function useFinanceSnapshot() {
  const { data: allShows = [] } = useShowsQuery();
  const { snapshot, targets, compareMonthlySeries, kpis, thisMonth, statusBreakdown, loading } = useFinance();
  const { fmtMoney, comparePrev, bookingAgencies, managementAgencies } = useSettings();

  return {
    // Raw data
    allShows,
    // Finance data
    snapshot,
    targets,
    compareMonthlySeries,
    kpis,
    thisMonth,
    statusBreakdown,
    // Settings
    fmtMoney,
    comparePrev,
    bookingAgencies,
    managementAgencies,
    // Status
    isLoading: loading,
  };
}
