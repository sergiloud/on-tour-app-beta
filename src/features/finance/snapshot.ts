import { showStore } from '../../shared/showStore';
import { getCurrentOrgId } from '../../lib/tenants';
import type { FinanceSnapshot, FinanceShow, BreakdownEntry, MarginBreakdown, ForecastPoint } from './types';
import { agenciesForShow, computeCommission } from '../../lib/agencies';
import { loadSettings } from '../../lib/persist';
import type { Show } from '../../lib/shows';
import { convertToBase, sumFees, type SupportedCurrency } from '../../lib/fx';

// Previously applied a 45% heuristic cost. For the curated dataset we want net === fee unless explicit costs are provided.
const EXPENSE_RATE = 0; // effectively disabled heuristic

function monthRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function buildFinanceSnapshotFromShows(shows: FinanceShow[], now = new Date()): FinanceSnapshot {
  const asOf = now.toISOString();
  const { start, end } = monthRange(now);
  const inMonth = shows.filter(s => {
    const t = new Date(s.date).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
  const inYear = shows.filter(s => new Date(s.date).getFullYear() === now.getFullYear());

  // Load agencies from settings
  const settings = loadSettings() as any;
  const bookingAgencies = settings.bookingAgencies || [];
  const managementAgencies = settings.managementAgencies || [];
  const baseCurrency = (settings.currency || 'EUR') as SupportedCurrency;

  // FIXED: Currency mixing - using centralized sumFees function
  const sumIncome = (list: FinanceShow[]) => sumFees(list, baseCurrency);

  // Calculate show cost including explicit costs AND agency commissions
  const showCost = (s: FinanceShow) => {
    if (s.status === 'offer') return 0;

    let totalCost = 0;

    // Add explicit cost if provided
    if (typeof s.cost === 'number') {
      totalCost += s.cost;
    }

    // Add agency commissions
    try {
      // Convert FinanceShow to DemoShow format for agency calculations
      const demoShow: Show = {
        id: s.id,
        name: s.name || '',
        city: s.city,
        country: s.country,
        lat: s.lat,
        lng: s.lng,
        date: s.date,
        fee: s.fee,
        status: s.status,
        mgmtAgency: (s as any).mgmtAgency,       // Include selected agencies
        bookingAgency: (s as any).bookingAgency  // for commission calculation
      };

      // Get applicable agencies for this show
      const applicable = agenciesForShow(demoShow, bookingAgencies, managementAgencies);
      const allAgencies = [...applicable.booking, ...applicable.management];

      // Calculate total agency commissions
      if (allAgencies.length > 0) {
        const agencyCommission = computeCommission(demoShow, allAgencies);
        totalCost += agencyCommission;
      }
    } catch (e) {
      console.error('[snapshot] Error calculating agency commission:', e);
    }

    return totalCost;
  };

  const sumExpenses = (list: FinanceShow[]) => list.reduce((acc, s) => acc + showCost(s), 0);

  const monthIncome = sumIncome(inMonth);
  const monthExpenses = sumExpenses(inMonth);
  const yearIncome = sumIncome(inYear);
  const yearExpenses = sumExpenses(inYear);

  const pending = sumFees(shows.filter(s => s.status === 'pending'), baseCurrency);

  // Margin breakdown utilities
  const groupBy = <K extends keyof FinanceShow>(key: K, list: FinanceShow[]): BreakdownEntry[] => {
    const map = new Map<string, BreakdownEntry>();
    for (const s of list) {
      const k = (s[key] as unknown as string) || '—';

      // FIXED: Convert fee to base currency before adding to breakdown
      let income = 0;
      if (s.status !== 'offer') {
        const feeCurrency = (s.feeCurrency || 'EUR') as SupportedCurrency;
        if (feeCurrency === baseCurrency) {
          income = s.fee;
        } else {
          const converted = convertToBase(s.fee, s.date, feeCurrency, baseCurrency);
          income = converted?.value || s.fee;
        }
      }

      const expenses = showCost(s);
      const entry = map.get(k) || { key: k, income: 0, expenses: 0, net: 0, count: 0 };
      entry.income += income;
      entry.expenses += expenses;
      entry.net = entry.income - entry.expenses;
      entry.count += 1;
      map.set(k, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.net - a.net);
  };

  const breakdown: MarginBreakdown = {
    byRoute: groupBy('route', inYear),
    byVenue: groupBy('venue', inYear),
    byPromoter: groupBy('promoter', inYear)
  };

  // ⚠️ FORECAST PLACEHOLDER: Simple projection replicating current month
  // WARNING: This is NOT a real forecast model - for demo/visualization only
  // DO NOT use for business decisions - implement proper forecasting before production
  const next: ForecastPoint[] = Array.from({ length: 6 }, (_, i) => {
    const d2 = new Date(now);
    d2.setMonth(d2.getMonth() + i + 1);
    const monthKey = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}`;
    const baseline = monthIncome - monthExpenses;
    return { month: monthKey, net: Math.round(baseline), p50: Math.round(baseline), p90: Math.round(baseline * 1.15) };
  });

  const inflows = monthIncome;
  const outflows = monthExpenses;

  return {
    asOf,
    shows,
    month: {
      start: start.toISOString(),
      end: end.toISOString(),
      income: Math.round(monthIncome),
      expenses: Math.round(monthExpenses),
      net: Math.round(monthIncome - monthExpenses)
    },
    year: {
      income: Math.round(yearIncome),
      expenses: Math.round(yearExpenses),
      net: Math.round(yearIncome - yearExpenses)
    },
    pending: Math.round(pending),
    breakdown,
    forecast: { next },
    cashflow: { month: { inflows: Math.round(inflows), outflows: Math.round(outflows), net: Math.round(inflows - outflows) }, pending: Math.round(pending) }
  };
}

export function buildFinanceSnapshot(now = new Date()): FinanceSnapshot {
  const org = getCurrentOrgId();
  const allShows = showStore.getAll() as unknown as FinanceShow[];
  console.log('[buildFinanceSnapshot] Total shows from showStore:', allShows.length);
  
  // Also check localStorage directly
  try {
    const lsShows = JSON.parse(localStorage.getItem('shows-store-v3') || '[]');
    console.log('[buildFinanceSnapshot] Total shows in localStorage:', lsShows.length);
  } catch (e) {
    console.warn('[buildFinanceSnapshot] Failed to read from localStorage', e);
  }
  
  // Include shows with no tenantId OR matching current org
  const shows = allShows.filter((s: any) => !s.tenantId || s.tenantId === org);
  console.log('[buildFinanceSnapshot] Shows after org filter:', shows.length, 'org:', org);
  
  // Debug: log tenantIds distribution
  const tenantCounts = allShows.reduce((acc: any, s: any) => {
    const tid = s.tenantId || 'null';
    acc[tid] = (acc[tid] || 0) + 1;
    return acc;
  }, {});
  console.log('[buildFinanceSnapshot] TenantId distribution:', tenantCounts);
  
  return buildFinanceSnapshotFromShows(shows, now);
}
