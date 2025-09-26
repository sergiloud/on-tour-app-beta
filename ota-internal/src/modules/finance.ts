// DEPRECATED: Legacy finance aggregation (to be removed after full migration)
// Use FinanceCore (src/finance/finance-core.tsx) + selectors instead. This file remains only for backward compatibility.
// Finance module (scaffold)
// Provides calculation helpers & placeholder renderers for KPIs
import type { Show } from '../data/demo';
import { euros } from '../data/demo';
import { loadShows } from '../features/shows';

export interface MonthFinanceSummary {
  month: number; // 0-11
  income: number;
  expenses: number;
  commissions: number;
  net: number;
  payable: number; // pending/unpaid
}

export function computeMonthSummary(d = new Date()): MonthFinanceSummary {
  const shows = loadShows();
  const m = d.getMonth();
  const y = d.getFullYear();
  let income = 0, expenses = 0, commissions = 0, payable = 0;
  shows.forEach(s => {
    const dt = new Date(s.date);
    if (dt.getMonth() !== m || dt.getFullYear() !== y) return;
    income += s.feeEUR || 0;
    // placeholder expense / commission heuristics (replace with real logic later)
    const comm = (s.feeEUR || 0) * 0.2;
    commissions += comm;
    const cost = (s.feeEUR || 0) * 0.1;
    expenses += cost + comm;
    // simple payable rule: treat shows with future dates as payable
    if (dt.getTime() > Date.now()) payable += s.feeEUR || 0;
  });
  const net = income - expenses;
  return { month: m, income, expenses, commissions, net, payable };
}

export function computePreviousMonthNet(ref = new Date()): number {
  const d = new Date(ref);
  d.setMonth(d.getMonth() - 1);
  const prev = computeMonthSummary(d);
  return prev.net;
}

export function computeYtdSummary(ref = new Date()){
  const year = ref.getFullYear();
  const shows = loadShows();
  let income = 0, expenses = 0, commissions = 0;
  shows.forEach(s => {
    const dt = new Date(s.date);
    if (dt.getFullYear() !== year) return;
    income += s.feeEUR || 0;
    const comm = (s.feeEUR || 0) * 0.2; commissions += comm;
    const cost = (s.feeEUR || 0) * 0.08; // slightly lower heuristic for yearly average cost
    expenses += cost + comm;
  });
  const net = income - expenses;
  return { income, expenses, commissions, net };
}

export function formatEuro(v: number) { return euros(v); }

// Placeholder DOM renderers (no-op if elements absent)
export function renderFinanceKpis(summary = computeMonthSummary()) {
  const set = (id: string, val: string) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('fin-kpi-income', formatEuro(summary.income));
  set('fin-kpi-expenses', formatEuro(summary.expenses));
  set('fin-kpi-net', formatEuro(summary.net));
  set('fin-kpi-payable', formatEuro(summary.payable));
}
