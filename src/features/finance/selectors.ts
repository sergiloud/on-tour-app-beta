import type { FinanceSnapshot } from './types';
import { convertToBase, type SupportedCurrency } from '../../lib/fx';

export type KpiNumbers = {
  yearNet: number;
  pending: number;
  netMonth: number;
  incomeMonth: number;
  costsMonth: number;
};

export function selectKpis(s: FinanceSnapshot): KpiNumbers {
  return {
    yearNet: s.year.net,
    pending: s.pending,
    // Derive from rounded income & expenses to avoid rounding drift
    netMonth: s.month.income - s.month.expenses,
    incomeMonth: s.month.income,
    costsMonth: s.month.expenses
  };
}

export type NetPoint = { month: string; net: number };

export function selectNetSeries(s: FinanceSnapshot): NetPoint[] {
  // Aggregate per month (YYYY-MM) over filtered snapshot period
  // FIXED: Convert all currencies to EUR before aggregating
  const map = new Map<string, { income: number; expenses: number }>();
  const baseCurrency: SupportedCurrency = 'EUR';

  for (const sh of s.shows) {
    const d = new Date(sh.date);
    if (sh.status === 'offer' || sh.status === 'canceled' || sh.status === 'archived') continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const cur = map.get(key) || { income: 0, expenses: 0 };

    // Convert fee to base currency
    const feeCurrency = (sh.feeCurrency || 'EUR') as SupportedCurrency;
    const converted = convertToBase(sh.fee, sh.date, feeCurrency, baseCurrency);
    cur.income += converted ? converted.value : sh.fee;

    // Align with snapshot: only explicit costs count; otherwise zero so net === fee
    // Assume costs are in same currency as fee for now
    const costValue = typeof (sh as any).cost === 'number' ? (sh as any).cost : 0;
    if (costValue > 0) {
      const convertedCost = convertToBase(costValue, sh.date, feeCurrency, baseCurrency);
      cur.expenses += convertedCost ? convertedCost.value : costValue;
    }

    map.set(key, cur);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ month: k, net: Math.round(v.income - v.expenses) }));
}

export type MonthlySeries = {
  months: string[]; // YYYY-MM sorted
  income: number[];
  costs: number[];
  net: number[];
};

export function selectMonthlySeries(s: FinanceSnapshot): MonthlySeries {
  // FIXED: Convert all currencies to EUR before aggregating
  const map = new Map<string, { income: number; expenses: number }>();
  const baseCurrency: SupportedCurrency = 'EUR';

  for (const sh of s.shows) {
    const d = new Date(sh.date);
    if (sh.status === 'offer' || sh.status === 'canceled' || sh.status === 'archived') continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const cur = map.get(key) || { income: 0, expenses: 0 };

    // Convert fee to base currency
    const feeCurrency = (sh.feeCurrency || 'EUR') as SupportedCurrency;
    const converted = convertToBase(sh.fee, sh.date, feeCurrency, baseCurrency);
    cur.income += converted ? converted.value : sh.fee;

    // Align with snapshot: use explicit cost if present; otherwise zero
    const costValue = typeof (sh as any).cost === 'number' ? (sh as any).cost : 0;
    if (costValue > 0) {
      const convertedCost = convertToBase(costValue, sh.date, feeCurrency, baseCurrency);
      cur.expenses += convertedCost ? convertedCost.value : costValue;
    }

    map.set(key, cur);
  }
  const entries = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  const months = entries.map(([k]) => k);
  const income = entries.map(([, v]) => Math.round(v.income));
  const costs = entries.map(([, v]) => Math.round(v.expenses));
  const net = entries.map(([, v]) => Math.round(v.income - v.expenses));
  return { months, income, costs, net };
}

export type ThisMonthAgg = {
  monthKey: string; // YYYY-MM
  income: number;
  expenses: number;
  net: number;
  prev?: { monthKey: string; income: number; expenses: number; net: number };
};

export function selectThisMonth(s: FinanceSnapshot): ThisMonthAgg {
  const ms = selectMonthlySeries(s);
  const curKey = `${new Date(s.asOf).getFullYear()}-${String(new Date(s.asOf).getMonth() + 1).padStart(2, '0')}`;
  const idx = ms.months.indexOf(curKey);
  const safeIdx = idx === -1 ? ms.months.length - 1 : idx;
  const income = ms.income[safeIdx] ?? s.month.income;
  const expenses = ms.costs[safeIdx] ?? s.month.expenses;
  const net = ms.net[safeIdx] ?? (income - expenses);
  const prevIdx = safeIdx - 1;
  const prev = prevIdx >= 0 ? {
    monthKey: ms.months[prevIdx] ?? '',
    income: ms.income[prevIdx] ?? 0,
    expenses: ms.costs[prevIdx] ?? 0,
    net: ms.net[prevIdx] ?? 0
  } : undefined;
  return { monthKey: ms.months[safeIdx] ?? curKey, income, expenses, net, prev };
}

export type StatusBreakdown = {
  confirmed: { count: number; total: number };
  pending: { count: number; total: number };
  offer: { count: number; total: number };
  canceled?: { count: number; total: number };
  archived?: { count: number; total: number };
};

export function selectStatusBreakdown(s: FinanceSnapshot): StatusBreakdown {
  const init = () => ({ count: 0, total: 0 });
  const res: StatusBreakdown = { confirmed: init(), pending: init(), offer: init(), canceled: init(), archived: init() };
  for (const sh of s.shows) {
    const k = sh.status as keyof StatusBreakdown;
    if (!res[k]) continue;
    res[k]!.count += 1;
    res[k]!.total += sh.fee;
  }
  return res;
}
