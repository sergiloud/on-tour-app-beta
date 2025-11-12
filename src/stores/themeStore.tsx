import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColor = 'accent' | 'blue' | 'purple' | 'pink' | 'orange' | 'green';

export interface Theme {
  color: ThemeColor;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  setThemeColor: (color: ThemeColor) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'mobile-theme';

const colorVariants: Record<ThemeColor, { primary: string; secondary: string; glow: string }> = {
  accent: {
    primary: 'rgb(191, 255, 0)',
    secondary: 'rgba(191, 255, 0, 0.2)',
    glow: '0 0 20px rgba(191, 255, 0, 0.3)',
  },
  blue: {
    primary: 'rgb(59, 130, 246)',
    secondary: 'rgba(59, 130, 246, 0.2)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)',
  },
  purple: {
    primary: 'rgb(168, 85, 247)',
    secondary: 'rgba(168, 85, 247, 0.2)',
    glow: '0 0 20px rgba(168, 85, 247, 0.3)',
  },
  pink: {
    primary: 'rgb(236, 72, 153)',
    secondary: 'rgba(236, 72, 153, 0.2)',
    glow: '0 0 20px rgba(236, 72, 153, 0.3)',
  },
  orange: {
    primary: 'rgb(249, 115, 22)',
    secondary: 'rgba(249, 115, 22, 0.2)',
    glow: '0 0 20px rgba(249, 115, 22, 0.3)',
  },
  green: {
    primary: 'rgb(34, 197, 94)',
    secondary: 'rgba(34, 197, 94, 0.2)',
    glow: '0 0 20px rgba(34, 197, 94, 0.3)',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { color: 'accent', isDark: true };
    } catch {
      return { color: 'accent', isDark: true };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    
    // Apply CSS variables
    const root = document.documentElement;
    const colors = colorVariants[theme.color];
    
    root.style.setProperty('--mobile-primary', colors.primary);
    root.style.setProperty('--mobile-secondary', colors.secondary);
    root.style.setProperty('--mobile-glow', colors.glow);
  }, [theme]);

  const setThemeColor = (color: ThemeColor) => {
    setTheme(prev => ({ ...prev, color }));
  };

  const toggleDarkMode = () => {
    setTheme(prev => ({ ...prev, isDark: !prev.isDark }));
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeColor, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
