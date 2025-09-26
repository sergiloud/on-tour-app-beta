// DEPRECATED: Imperative DOM finance UI. Migrate features into React FinanceDashboard & FinanceCore.
// Kept temporarily for legacy pages not yet migrated.
import { demoShows, euros } from '../../../data/demo';
import type { Show } from '../../../data/demo';
import { computeShowFinance, summarizeMonth } from '../core/finance-calcs';
import { showToast } from '../../../ui/toast';

// Shared state (imported in app.ts as singleton usage)
export const financeState = { selectedMonth: -1 };

// Basic commission split placeholder using mgmtCommission from settings stored elsewhere.
function loadSettings(){ try { return JSON.parse(localStorage.getItem('ota:settings:v1')||'{}'); } catch { return {}; } }
function getMgmtPct(){ const s = loadSettings(); return Math.min(100, Math.max(0, Number(s.mgmtCommission||20))) / 100; }

export function renderCommissionSplit(current = new Date(), animate=false){
  const wrap = document.getElementById('fin-split');
  if (!wrap) return;
  const shows = demoShows.filter(s => { const d = new Date(s.date); return d.getFullYear()===current.getFullYear() && d.getMonth()===current.getMonth(); });
  const monthIncome = shows.reduce((sum,s)=> sum + (computeShowFinance(s.id, s).income), 0);
  const mgmt = Math.round(monthIncome * getMgmtPct());
  const artist = monthIncome - mgmt;
  wrap.innerHTML = `<div class="split-row"><span>Artist</span><strong>${euros(artist)}</strong></div><div class="split-row"><span>Mgmt</span><strong>${euros(mgmt)}</strong></div>`;
}

export function renderFinanceFeed(){
  const el = document.getElementById('finance-feed');
  if (!el) return;
  const shows = demoShows.slice().sort((a,b)=> +new Date(b.date) - +new Date(a.date)).slice(0,10);
  el.innerHTML = shows.map(s => {
    const f = computeShowFinance(s.id, s);
    return `<li class="feed-item"><span class="fi-title">${s.city} — ${s.venue}</span><span class="fi-val">${euros(f.net)}</span></li>`;
  }).join('');
}

export function updateFinanceView(){
  const header = document.getElementById('fin-period-label');
  const now = new Date();
  const year = now.getFullYear();
  if (financeState.selectedMonth < 0){
    if (header) header.textContent = String(year);
    // Annual summary
    let income=0, expenses=0, net=0;
    for (let m=0;m<12;m++){ const s = summarizeMonth(demoShows, m, year); income+=s.income; expenses+=s.expenses; net+=s.net; }
    const elNet = document.getElementById('finSummaryNet'); if (elNet) elNet.textContent = euros(net);
  } else {
    const m = financeState.selectedMonth;
    const label = new Intl.DateTimeFormat(undefined,{ month:'long', year:'numeric'}).format(new Date(year,m,1));
    if (header) header.textContent = label;
    const sum = summarizeMonth(demoShows, m, year);
    const elNet = document.getElementById('finSummaryNet'); if (elNet) elNet.textContent = euros(sum.net);
  }
  renderCommissionSplit(now,false);
  renderFinanceFeed();
}

export function bindFinanceHub(){
  // Hook any hub-specific buttons if needed
  const btn = document.getElementById('finRefresh');
  btn?.addEventListener('click', ()=> { updateFinanceView(); showToast('Finance refreshed'); });
}

// Simple simulator: store multipliers; integrate by adjusting displayed net (not persisted deeply yet)
const SIM_KEY = 'finance:sim:v2';
interface SimState { travelMul: number; merchMul: number; enabled: boolean }
function loadSim(): SimState { try { return JSON.parse(localStorage.getItem(SIM_KEY)||'') || { travelMul:1, merchMul:1, enabled:false }; } catch { return { travelMul:1, merchMul:1, enabled:false }; } }
function saveSim(s: SimState){ try { localStorage.setItem(SIM_KEY, JSON.stringify(s)); } catch {} }
let sim = loadSim();

export function bindSimulator(){
  const travel = document.getElementById('simTravel') as HTMLInputElement | null;
  const merch = document.getElementById('simMerch') as HTMLInputElement | null;
  const toggle = document.getElementById('simEnable') as HTMLInputElement | null;
  const reflect = () => {
    if (travel) travel.value = String(sim.travelMul);
    if (merch) merch.value = String(sim.merchMul);
    if (toggle) toggle.checked = sim.enabled;
  };
  reflect();
  travel?.addEventListener('input', () => { sim.travelMul = Math.max(0.5, Math.min(2, Number(travel.value)||1)); saveSim(sim); updateFinanceView(); });
  merch?.addEventListener('input', () => { sim.merchMul = Math.max(0.5, Math.min(2, Number(merch.value)||1)); saveSim(sim); updateFinanceView(); });
  toggle?.addEventListener('change', () => { sim.enabled = !!toggle.checked; saveSim(sim); updateFinanceView(); });
}
