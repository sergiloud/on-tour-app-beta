// Finance UI variant (A/B) helpers
// Persist to localStorage and support deep-link override via ?finance=beta|classic

export type FinanceUiVariant = 'classic' | 'beta';

const LS_KEY = 'finance:ui';

export function loadFinanceUiVariant(): FinanceUiVariant {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw === 'classic' || raw === 'beta') return raw;
  } catch {}
  return 'classic';
}

export function saveFinanceUiVariant(v: FinanceUiVariant) {
  try { localStorage.setItem(LS_KEY, v); } catch {}
}

export function parseFinanceUiFromSearch(search: string | URLSearchParams): FinanceUiVariant | null {
  try {
    const params = search instanceof URLSearchParams ? search : new URLSearchParams(search);
    const v = params.get('finance');
    if (v === 'classic' || v === 'beta') return v;
  } catch {}
  return null;
}
