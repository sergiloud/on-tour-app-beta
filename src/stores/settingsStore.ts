/**
 * Zustand Store: Settings
 * 
 * Replaces SettingsContext with modern Zustand implementation
 * Handles app-wide settings: theme, language, currency, region, etc.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { secureStorage } from '../lib/secureStorage';

type Theme = 'light' | 'dark' | 'system';
type Lang = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';
type Currency = 'EUR' | 'USD' | 'GBP' | 'AUD';
type Region = 'all' | 'EMEA' | 'AMER' | 'APAC';
type DistanceUnit = 'km' | 'mi';

interface SettingsState {
  // Appearance
  theme: Theme;
  highContrast: boolean;
  presentationMode: boolean;
  
  // Localization
  lang: Lang;
  currency: Currency;
  distanceUnit: DistanceUnit;
  
  // Finance
  comparePrev: boolean;
  region: Region;
  
  // Actions
  setTheme: (theme: Theme) => void;
  setHighContrast: (enabled: boolean) => void;
  setPresentationMode: (enabled: boolean) => void;
  setLang: (lang: Lang) => void;
  setCurrency: (currency: Currency) => void;
  setDistanceUnit: (unit: DistanceUnit) => void;
  setComparePrev: (enabled: boolean) => void;
  setRegion: (region: Region) => void;
  
  // Helpers
  fmtMoney: (amount: number) => string;
  fmtDistance: (km: number) => string;
  getThemeClass: () => string;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        theme: 'system',
        highContrast: false,
        presentationMode: false,
        lang: 'en',
        currency: 'EUR',
        distanceUnit: 'km',
        comparePrev: false,
        region: 'all',

        // Actions
        setTheme: (theme) => {
          set({ theme });
          applyThemeToDOM(theme);
        },

        setHighContrast: (enabled) => {
          set({ highContrast: enabled });
          document.documentElement.classList.toggle('high-contrast', enabled);
        },

        setPresentationMode: (enabled) => {
          set({ presentationMode: enabled });
          document.documentElement.classList.toggle('presentation', enabled);
        },

        setLang: (lang) => {
          set({ lang });
          // Update HTML lang attribute
          document.documentElement.lang = lang;
        },

        setCurrency: (currency) => set({ currency }),
        setDistanceUnit: (unit) => set({ distanceUnit: unit }),
        setComparePrev: (enabled) => set({ comparePrev: enabled }),
        setRegion: (region) => set({ region }),

        // Helpers
        fmtMoney: (amount) => {
          const { currency, lang } = get();
          try {
            return new Intl.NumberFormat(lang, {
              style: 'currency',
              currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(amount);
          } catch {
            return `${currency} ${amount.toLocaleString()}`;
          }
        },

        fmtDistance: (km) => {
          const { distanceUnit } = get();
          if (distanceUnit === 'mi') {
            const miles = km * 0.621371;
            return `${miles.toFixed(1)} mi`;
          }
          return `${km.toFixed(1)} km`;
        },

        getThemeClass: () => {
          const { theme } = get();
          if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          return theme;
        },
      }),
      {
        name: 'settings-store-v1',
        version: 1,
        storage: {
          getItem: (name) => {
            const str = secureStorage.getItem<string>(name);
            return str ? JSON.parse(str) : null;
          },
          setItem: (name, value) => {
            secureStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            secureStorage.removeItem(name);
          },
        },
      }
    ),
    {
      name: 'SettingsStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Helper to apply theme to DOM
function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', isDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

// Initialize theme on module load
if (typeof window !== 'undefined') {
  const initialTheme = useSettingsStore.getState().theme;
  applyThemeToDOM(initialTheme);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const currentTheme = useSettingsStore.getState().theme;
    if (currentTheme === 'system') {
      applyThemeToDOM('system');
    }
  });
}

// Selectors for granular subscriptions
export const selectTheme = (state: SettingsState) => state.theme;
export const selectLang = (state: SettingsState) => state.lang;
export const selectCurrency = (state: SettingsState) => state.currency;
export const selectRegion = (state: SettingsState) => state.region;
export const selectPresentationMode = (state: SettingsState) => state.presentationMode;

// Convenience hooks
export const useTheme = () => useSettingsStore(selectTheme);
export const useLang = () => useSettingsStore(selectLang);
export const useCurrency = () => useSettingsStore(selectCurrency);
export const useRegion = () => useSettingsStore(selectRegion);

/**
 * Example usage:
 * 
 * // In a component
 * const theme = useSettingsStore(state => state.theme);
 * const setTheme = useSettingsStore(state => state.setTheme);
 * const fmtMoney = useSettingsStore(state => state.fmtMoney);
 * 
 * // Or use convenience hooks
 * const theme = useTheme();
 * 
 * // Actions
 * setTheme('dark');
 * const formatted = fmtMoney(5000); // "€5,000"
 */
