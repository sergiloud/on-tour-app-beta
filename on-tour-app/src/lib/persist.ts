export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function pushRecent<T extends Record<string, unknown>>(
  key: string,
  item: T,
  opts?: { max?: number; dedupeBy?: (x: T) => string }
): T[] {
  const max = opts?.max ?? 3;
  const getKey = opts?.dedupeBy ?? ((x: T) => JSON.stringify(x));
  const list = loadJSON<T[]>(key, []);
  const map = new Map<string, T>();
  map.set(getKey(item), item);
  for (const it of list) {
    const k = getKey(it);
    if (!map.has(k)) map.set(k, it);
    if (map.size >= max) break;
  }
  const out = Array.from(map.values()).slice(0, max);
  saveJSON(key, out);
  return out;
}
// Simple versioned localStorage helpers for app settings

export const SETTINGS_KEY = 'settings-v1';

export type StoredSettings = Partial<{
  currency: 'EUR'|'USD'|'GBP';
  unit: 'km'|'mi';
  lang: 'en'|'es';
  maskAmounts: boolean; // deprecated; kept for backward-compat in localStorage
  presentationMode: boolean;
  dashboardView: string;
  region: 'all'|'AMER'|'EMEA'|'APAC';
  dateRange: { from: string; to: string };
}>;

function safeParse(json: string | null): any {
  try { return json ? JSON.parse(json) : null; } catch { return null; }
}

export function loadSettings(): StoredSettings {
  // Prefer current key
  const v1 = safeParse(localStorage.getItem(SETTINGS_KEY));
  if (v1 && typeof v1 === 'object') return v1;
  // Migrate from unversioned keys if present
  const legacy = safeParse(localStorage.getItem('settings')) || safeParse(localStorage.getItem('settings-v0'));
  if (legacy && typeof legacy === 'object') return legacy as StoredSettings;
  return {};
}

export function saveSettings(s: StoredSettings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}
