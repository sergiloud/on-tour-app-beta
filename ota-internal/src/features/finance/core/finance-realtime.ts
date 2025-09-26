// Finance realtime mock service
// Emits periodic snapshot diffs (added expense, updated show net) to simulate websocket layer.
import { buildSnapshot } from './snapshot-builder';
import type { FinanceSnapshot } from './finance-types';

type Listener = (snap: FinanceSnapshot) => void;
const listeners = new Set<Listener>();
let current: FinanceSnapshot | null = null;
let timer: any;

export function startFinanceRealtime(intervalMs = 15000){
  if(timer) return; // already running
  if(!current) current = buildSnapshot();
  timer = setInterval(() => {
    if(!current) return;
    // Apply a tiny synthetic diff: adjust net by random fluctuation within ±1%
    const deltaPct = (Math.random() - 0.5) * 0.02;
    const mutated: FinanceSnapshot = {
      ...current,
      kpis: { ...current.kpis, net: Math.round(current.kpis.net * (1 + deltaPct)) }
    };
    current = mutated;
    listeners.forEach(l => l(mutated));
  }, intervalMs);
}

export function stopFinanceRealtime(){ if(timer) { clearInterval(timer); timer = null; } }

export function onFinanceSnapshot(listener: Listener){ listeners.add(listener); return () => listeners.delete(listener); }

export function getCurrentFinanceSnapshot(){ if(!current) current = buildSnapshot(); return current; }
