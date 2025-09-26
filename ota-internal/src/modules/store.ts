// Centralized lightweight state store (Phase 1 refactor)
// Provides: single load of shows data, reactive subscriptions, memoized selectors.
import type { Show } from '../data/demo';
import { loadShows } from '../features/shows';
import { events } from '../features/dashboard/core/events';

interface AppState {
  shows: Show[];
  // future: travel, users, settings, etc.
  _version: number; // bump to invalidate memoization
}

let state: AppState = {
  shows: [],
  _version: 0
};

// Basic subscription mechanism
const listeners = new Set<() => void>();

export function getState(): Readonly<AppState> { return state; }
export function subscribe(fn: () => void): () => void { listeners.add(fn); return () => listeners.delete(fn); }
function notify(){
  listeners.forEach(l => { try { l(); } catch(err){ console.error('[store] listener error', err); } });
}

// --- Initialization & cache ---
let _booted = false;
export function ensureStoreBoot(){
  if (_booted) return; _booted = true;
  // single load
  state = { ...state, shows: loadShows(), _version: state._version + 1 };
  notify();
}

// --- Mutations ---
export function updateShow(id: string, patch: Partial<Show>){
  let changed = false;
  state.shows = state.shows.map(s => {
    if (s.id === id){ changed = true; return { ...s, ...patch }; }
    return s;
  });
  if (changed){
    state._version++;
    try { const raw = localStorage.getItem('show:'+id); const merged = state.shows.find(s => s.id === id); if (merged) localStorage.setItem('show:'+id, JSON.stringify(merged)); } catch {}
    notify();
    events.emit('shows:updated', { id });
  }
}

// --- Simple memoization helper (args serialized) ---
type AnyFn = (...args: any[]) => any;
function memo<T extends AnyFn>(fn: T): T {
  let lastArgs: string | null = null;
  let lastVersion = -1;
  let lastResult: any;
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (lastVersion === state._version && key === lastArgs){ return lastResult; }
    lastArgs = key; lastVersion = state._version; lastResult = fn(...args); return lastResult;
  }) as T;
}

// --- Selectors ---
export const selectors = {
  allShows: () => state.shows,
  pendingShows: memo(() => state.shows.filter(s => ['pending','tentative','Tentative','offer','Offer','overdue'].includes(String(s.status).toLowerCase()))),
  currentMonthShows: memo((now: Date) => state.shows.filter(s => {
    const d = new Date(s.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  })),
  upcomingMonthShows: memo((now: Date) => state.shows.filter(s => new Date(s.date) >= now)),
  overdueInvoices: memo((now: Date) => state.shows.filter(s => String(s.status).toLowerCase() === 'overdue' && new Date(s.date) < now)),
};

// Convenience one-off accessor for legacy code migrations
export function getShowsCached(): Show[] { ensureStoreBoot(); return selectors.allShows(); }

// Dev helper
(window as any).__store = { getState, selectors };
