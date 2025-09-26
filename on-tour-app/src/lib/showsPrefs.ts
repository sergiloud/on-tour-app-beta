// Versioned localStorage for Shows page preferences

export const SHOWS_PREFS_KEY = 'shows:prefs:v2';

export type ShowsPrefs = {
  view?: 'list'|'board';
  totalsVisible?: boolean;
  totalsPinned?: boolean; // pin the floating totals bar (prevents auto-hide positioning changes)
  whtVisible?: boolean; // visibility of WHT % column
  dateRange?: { from: string; to: string };
  region?: 'all'|'AMER'|'EMEA'|'APAC';
  feeRange?: { min?: number; max?: number };
  statusOn?: Record<'confirmed'|'pending'|'offer'|'canceled'|'archived', boolean>;
  sort?: { key: 'date'|'fee'|'net'; dir: 'asc'|'desc' };
  tab?: 'details'|'finance'|'costs';
  exportCols?: Record<string, boolean>;
  __version?: 2;
};

function safeParse<T>(json: string | null): T | null {
  try { return json ? JSON.parse(json) as T : null; } catch { return null; }
}

export function loadShowsPrefs(): ShowsPrefs {
  // Try v2 consolidated
  const v2 = safeParse<ShowsPrefs>(localStorage.getItem(SHOWS_PREFS_KEY));
  if (v2 && typeof v2 === 'object') return v2;
  // Migrate from scattered keys
  const view = (localStorage.getItem('shows:view') as any) || undefined;
  const totalsVisible = (()=>{ const v = localStorage.getItem('shows:totals:visible'); return v ? v === '1' : undefined; })();
  const totalsPinned = (()=>{ const v = localStorage.getItem('shows:totals:pinned'); return v ? v === '1' : undefined; })();
  const dateRange = safeParse<{from:string;to:string}>(localStorage.getItem('shows:dateRange')) || undefined;
  const region = (localStorage.getItem('shows:region') as any) || undefined;
  const feeRange = safeParse<{min?:number;max?:number}>(localStorage.getItem('shows:feeRange')) || undefined;
  const statusOn = safeParse<Record<'confirmed'|'pending'|'offer'|'canceled'|'archived', boolean>>(localStorage.getItem('shows:status')) || undefined;
  const sort = safeParse<{ key:'date'|'fee'|'net'; dir:'asc'|'desc' }>(localStorage.getItem('shows:sort')) || undefined;
  const tab = (localStorage.getItem('shows:tab') as any) || undefined;
  const exportCols = safeParse<Record<string, boolean>>(localStorage.getItem('shows:exportCols')) || undefined;
  const whtVisible = (()=>{ const v = localStorage.getItem('shows:whtVisible'); return v ? v==='1' : undefined; })();
  const prefs: ShowsPrefs = { view, totalsVisible, totalsPinned, whtVisible, dateRange, region, feeRange, statusOn, sort, tab, exportCols, __version: 2 };
  return prefs;
}

export function saveShowsPrefs(next: ShowsPrefs) {
  try {
    const existing = loadShowsPrefs();
    const merged: ShowsPrefs = { ...existing, ...next, __version: 2 };
    localStorage.setItem(SHOWS_PREFS_KEY, JSON.stringify(merged));
  } catch {}
}
