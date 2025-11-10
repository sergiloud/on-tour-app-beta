// Period utilities: month keys, closed-state persistence, and helpers
import type { DateRange } from '../../context/SettingsContext';

export function monthKeyFromDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthKeyFromRange(range: DateRange): string {
  try {
    const end = new Date(range.to);
    return monthKeyFromDate(end);
  } catch {
    return monthKeyFromDate(new Date());
  }
}

const CLOSED_KEY_PREFIX = 'finance:closed:';

export function isMonthClosed(key: string): boolean {
  try { return localStorage.getItem(CLOSED_KEY_PREFIX + key) === '1'; } catch { return false; }
}

export function setMonthClosed(key: string, closed: boolean) {
  try {
    if (closed) localStorage.setItem(CLOSED_KEY_PREFIX + key, '1');
    else localStorage.removeItem(CLOSED_KEY_PREFIX + key);
  } catch {}
}

export type PeriodPreset = 'MTD'|'LAST_MONTH'|'YTD'|'CUSTOM';

export function rangeForPreset(preset: PeriodPreset, now = new Date()): DateRange {
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, '0');
  if (preset === 'MTD') {
    const from = new Date(y, m, 1);
    const to = new Date(y, m, now.getDate());
    return { from: `${from.getFullYear()}-${pad(from.getMonth()+1)}-${pad(from.getDate())}`, to: `${to.getFullYear()}-${pad(to.getMonth()+1)}-${pad(to.getDate())}` };
  }
  if (preset === 'LAST_MONTH') {
    const from = new Date(y, m-1, 1);
    const to = new Date(y, m, 0);
    return { from: `${from.getFullYear()}-${pad(from.getMonth()+1)}-${pad(from.getDate())}`, to: `${to.getFullYear()}-${pad(to.getMonth()+1)}-${pad(to.getDate())}` };
  }
  if (preset === 'YTD') {
    const from = new Date(y, 0, 1);
    const to = now;
    return { from: `${from.getFullYear()}-${pad(from.getMonth()+1)}-${pad(from.getDate())}`, to: `${to.getFullYear()}-${pad(to.getMonth()+1)}-${pad(to.getDate())}` };
  }
  // CUSTOM: return current range by default; caller should override
  return { from: `${y}-${pad(m+1)}-01`, to: `${y}-${pad(m+1)}-${pad(new Date(y,m+1,0).getDate())}` };
}
