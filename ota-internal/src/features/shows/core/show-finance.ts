// Show finance helpers: costs, commissions, net
import { euros } from '../../../data/demo';
import { getCommissionPct } from '../../../shared/settings';
import { computeAgencyCommissions } from '../../../shared/agencies';
import { loadShows } from './shows';

export interface ShowCost { id: string; showId: string; type: string; desc?: string; amount: number; }
const COST_KEY = 'ota:show-costs:v1';

interface CostState { costs: ShowCost[]; }

function loadState(): CostState {
  try { const raw = localStorage.getItem(COST_KEY); if (raw) return JSON.parse(raw); } catch {}
  return { costs: [] };
}
function saveState(s: CostState){ try { localStorage.setItem(COST_KEY, JSON.stringify(s)); } catch {} }

export function getCosts(showId: string): ShowCost[] { return loadState().costs.filter(c => c.showId === showId); }
export function addCost(showId: string, type: string, amount: number, desc?: string){
  const st = loadState();
  st.costs.push({ id: 'cost-' + Math.random().toString(36).slice(2,9), showId, type, amount, desc });
  saveState(st);
  try {
    const key = 'ota:recent-costs:v1';
    const raw = localStorage.getItem(key);
    let arr: any[] = raw ? JSON.parse(raw) : [];
    arr.unshift({ type, amount, ts: Date.now() });
    // dedupe by type+amount string
    const seen = new Set<string>();
    const filtered: any[] = [];
    for (const c of arr){
      const k = c.type+'|'+c.amount;
      if (seen.has(k)) continue;
      seen.add(k);
      filtered.push(c);
      if (filtered.length >= 10) break;
    }
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {}
}
export function deleteCost(id: string){ const st = loadState(); st.costs = st.costs.filter(c => c.id !== id); saveState(st); }
export function getCostById(id: string): ShowCost | undefined { return loadState().costs.find(c => c.id === id); }
export function restoreCost(cost: ShowCost){ const st = loadState(); if (!st.costs.some(c => c.id === cost.id)){ st.costs.push(cost); saveState(st);} }

export interface ShowFinanceSummary {
  income: number; commissions: number; costs: number; wht: number; net: number; payable: number;
  mgmtCommission?: number; bookingCommission?: number;
}

function getShowWhtPercent(showId: string): number {
  // WHT percent stored inside show override localStorage key 'show:{id}' similar pattern to show-editor
  try {
    const raw = localStorage.getItem('show:' + showId);
    if (raw){
      const obj = JSON.parse(raw);
      if (typeof obj.whtPct === 'number') return obj.whtPct;
    }
  } catch {}
  return 0;
}

function getShowAgencies(showId: string){
  try {
    const raw = localStorage.getItem('show:' + showId);
    if (raw){
      const obj = JSON.parse(raw);
      return { mgmtAgencyId: obj.mgmtAgencyId as string | undefined, bookingAgencyId: obj.bookingAgencyId as string | undefined };
    }
  } catch {}
  return { mgmtAgencyId: undefined, bookingAgencyId: undefined };
}

export function computeShowFinance(showId: string): ShowFinanceSummary {
  const show = loadShows().find(s => s.id === showId);
  if (!show) return { income:0, commissions:0, costs:0, wht:0, net:0, payable:0 };
  const costs = getCosts(showId).reduce((sum,c)=> sum + c.amount, 0);
  const income = show.feeEUR;
  const whtPct = getShowWhtPercent(showId)/100;
  const wht = income * whtPct; // WHT applied over gross fee
  const { mgmtAgencyId, bookingAgencyId } = getShowAgencies(showId);
  let mgmtCommission = 0, bookingCommission = 0, commissions = 0;
  if (mgmtAgencyId || bookingAgencyId){
    const applied = computeAgencyCommissions(income, costs, wht, mgmtAgencyId, bookingAgencyId);
    mgmtCommission = applied.mgmt; bookingCommission = applied.booking; commissions = applied.total;
  } else {
    // fallback single global percentage
    const commPct = getCommissionPct()/100;
    commissions = income * commPct; mgmtCommission = commissions; // treat as mgmt for breakdown
  }
  const net = income - wht - commissions - costs;
  const payable = show.status === 'overdue' ? income : 0;
  return { income, commissions, costs, wht, net, payable, mgmtCommission, bookingCommission };
}

export function renderFinanceModal(showId: string){
  const fin = computeShowFinance(showId);
  const set = (id: string, val: string) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('finDetIncome', euros(fin.income));
  set('finDetExpenses', euros(fin.commissions + fin.costs));
  set('finDetNet', euros(fin.net));
  set('finDetPayable', euros(fin.payable));
  const pr = document.getElementById('finTotPayableRow'); if (pr) pr.style.display = fin.payable ? '' : 'none';
  set('finTotFee', euros(fin.income));
  set('finTotComm', euros(fin.commissions));
  set('finTotCosts', euros(fin.costs));
  set('finTotWht', euros(fin.wht));
  set('finTotNet', euros(fin.net));
  set('finTotPayable', euros(fin.payable));
}
