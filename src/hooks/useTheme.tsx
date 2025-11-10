import React, { createContext, useContext, useEffect, useState } from 'react';
import { secureStorage } from '../lib/secureStorage';

type Theme = 'dark' | 'light';
type ThemeMode = 'auto' | 'dark' | 'light';

interface ThemeCtx {
  theme: Theme;
  mode: ThemeMode;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = 'ota.theme';
const MODE_KEY = 'ota.theme.mode';

/**
 * Get system theme preference
 */
const getSystemTheme = (): Theme => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mode, setModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    // Load mode preference (auto, dark, light)
    const storedMode = secureStorage.getItem<ThemeMode>(MODE_KEY);
    const initialMode: ThemeMode = storedMode || 'auto';
    setModeState(initialMode);

    // Determine initial theme
    let initialTheme: Theme;
    if (initialMode === 'auto') {
      initialTheme = getSystemTheme();
    } else {
      initialTheme = initialMode;
    }

    setThemeState(initialTheme);
    document.documentElement.dataset.theme = initialTheme;

    // Listen for system theme changes (only if in auto mode)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const currentMode = secureStorage.getItem<ThemeMode>(MODE_KEY);
      if (currentMode === 'auto' || !currentMode) {
        const newTheme = e.matches ? 'dark' : 'light';
        setThemeState(newTheme);
        document.documentElement.dataset.theme = newTheme;
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    // When manually setting theme, switch to manual mode
    setModeState(t);
    secureStorage.setItem(STORAGE_KEY, t);
    secureStorage.setItem(MODE_KEY, t);
  };

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    secureStorage.setItem(MODE_KEY, m);

    if (m === 'auto') {
      // Switch to system preference
      const systemTheme = getSystemTheme();
      setThemeState(systemTheme);
      document.documentElement.dataset.theme = systemTheme;
    } else {
      // Use explicit theme
      setThemeState(m);
      document.documentElement.dataset.theme = m;
      secureStorage.setItem(STORAGE_KEY, m);
    }
  };

  const toggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggle, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
