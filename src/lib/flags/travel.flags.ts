// Simple feature flags for Travel area
// Persist to localStorage for ease of manual toggling in preview

type FlagKey = 'unifiedTabs' | 'compareV2' | 'resultsVirtualization';

const DEFAULTS: Record<FlagKey, boolean> = {
  unifiedTabs: false,
  compareV2: false,
  resultsVirtualization: true,
};

export function getFlag(key: FlagKey): boolean {
  try {
    const raw = localStorage.getItem(`flags.travel.${key}`);
    if (raw == null) return DEFAULTS[key];
    return raw === '1';
  } catch {
    return DEFAULTS[key];
  }
}

export function setFlag(key: FlagKey, value: boolean) {
  try { localStorage.setItem(`flags.travel.${key}`, value ? '1' : '0'); } catch {}
}

export const TravelFlags = {
  get unifiedTabs() { return getFlag('unifiedTabs'); },
  get compareV2() { return getFlag('compareV2'); },
  get resultsVirtualization() { return getFlag('resultsVirtualization'); },
  set(key: FlagKey, value: boolean) { setFlag(key, value); },
};
