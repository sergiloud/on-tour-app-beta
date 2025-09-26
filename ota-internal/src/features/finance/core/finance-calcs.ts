import type { Show } from '../../../data/demo';
import { euros } from '../../../data/demo';

export interface ShowFinanceDetailItem { label: string; val: number; }
export interface ShowFinanceSummary {
  income: number;
  expenses: number;
  net: number;
  payable: number; // amount still to be paid (overdue/pending)
  items: ShowFinanceDetailItem[];
}

// Basic cost + override retrieval (replace with real persistence later)
export function getOv(id: string){ try { return JSON.parse(localStorage.getItem('show:'+id) || '{}'); } catch { return {}; } }
export function getCosts(id: string){ try { const v = JSON.parse(localStorage.getItem('costs:'+id) || '[]'); return Array.isArray(v)? v: []; } catch { return []; } }

export function computeShowFinance(id: string, show?: Show): ShowFinanceSummary {
  // Income is the show fee (after potential override)
  const ov = getOv(id);
  const fee = Math.round(Number(ov.feeEUR ?? show?.feeEUR ?? 0));
  const costs = getCosts(id) as any[];
  const expenses = Math.max(0, costs.reduce((s,c)=> s + (Number(c.amount)||0), 0));
  const net = Math.max(0, fee - expenses);
  // Payable placeholder: if status indicates overdue/pending, assume full fee outstanding
  const status = (ov.status || show?.status || '').toLowerCase();
  const payable = (status === 'overdue' || status === 'pending') ? fee : 0;
  const items: ShowFinanceDetailItem[] = [
    { label: 'Fee', val: fee },
    ...costs.map(c => ({ label: `${c.type}${c.desc? ' — '+c.desc:''}`, val: -Math.round(Number(c.amount)||0) }))
  ];
  return { income: fee, expenses, net, payable, items };
}

// Aggregate helpers (monthly/yearly) – simple placeholders; refine later.
export function summarizeMonth(shows: Show[], month: number, year: number){
  const inMonth = shows.filter(s => { const d = new Date(s.date); return d.getMonth()===month && d.getFullYear()===year; });
  let income=0, expenses=0, net=0;
  inMonth.forEach(s => { const f = computeShowFinance(s.id, s); income += f.income; expenses += f.expenses; net += f.net; });
  return { income, expenses, net };
}

export function eurosFmt(n: number){ return euros(n); }
