// Settings module (scaffold)
export interface AppSettings {
  version: number;
  mgmtCommission: number;
  defaultCurrency: 'EUR'|'USD'|'GBP';
  theme?: 'system'|'dark'|'light';
  density?: 'compact'|'comfortable';
  dashboardKpis?: 'all'|'minimal'|'hidden';
}

const KEY = 'ota:settings:v1';

export function defaultSettings(): AppSettings {
  return { version: 1, mgmtCommission: 20, defaultCurrency: 'EUR', theme: 'system', density: 'compact', dashboardKpis: 'all' };
}

export function loadSettings(): AppSettings {
  try { const raw = localStorage.getItem(KEY); if (raw) { const parsed = JSON.parse(raw); return { ...defaultSettings(), ...parsed }; } } catch {}
  return defaultSettings();
}

export function saveSettings(s: AppSettings) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }

export function applyThemeDensity(){
  const s = loadSettings();
  document.body.dataset.theme = s.theme || 'system';
  document.body.dataset.density = s.density || 'compact';
  document.body.classList.toggle('density-compact', (s.density||'compact') === 'compact');
}

export function getCommissionPct(): number {
  return loadSettings().mgmtCommission || 0;
}
