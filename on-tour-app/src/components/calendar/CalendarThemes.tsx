import React from 'react';
import { motion } from 'framer-motion';

/**
 * CalendarThemes - Professional color schemes and visual themes
 *
 * Múltiples temas visuales para diferentes estilos y preferencias
 */

export type CalendarThemeName = 'professional' | 'vibrant' | 'minimal' | 'dark' | 'nature' | 'ocean';

export interface CalendarThemeConfig {
  name: CalendarThemeName;
  colors: {
    // Primary colors
    primary: string;
    secondary: string;
    accent: string;

    // Status colors
    confirmed: string;
    pending: string;
    cancelled: string;

    // UI colors
    background: string;
    surface: string;
    border: string;

    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
    hover: string;
    focus: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// ============================================================================
// PROFESSIONAL THEME (Default)
// ============================================================================

export const professionalTheme: CalendarThemeConfig = {
  name: 'professional',
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#06B6D4',

    confirmed: '#10B981',
    pending: '#F59E0B',
    cancelled: '#EF4444',

    background: 'rgb(15, 23, 42)',
    surface: 'rgba(30, 41, 59, 0.8)',
    border: 'rgba(148, 163, 184, 0.2)',

    textPrimary: '#ffffff',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
  },
  gradients: {
    primary: 'from-blue-500/40 via-blue-400/20 to-cyan-500/10',
    secondary: 'from-purple-500/40 via-purple-400/20 to-pink-500/10',
    accent: 'from-cyan-500/40 via-blue-400/20 to-purple-500/10',
    hover: 'from-blue-500/50 to-purple-500/50',
    focus: 'from-blue-400 to-cyan-400',
  },
  shadows: {
    sm: 'shadow-sm shadow-blue-500/10',
    md: 'shadow-md shadow-blue-500/20',
    lg: 'shadow-lg shadow-blue-500/30',
    xl: 'shadow-2xl shadow-blue-500/40',
  },
};

// ============================================================================
// VIBRANT THEME
// ============================================================================

export const vibrantTheme: CalendarThemeConfig = {
  name: 'vibrant',
  colors: {
    primary: '#FF006E',
    secondary: '#FB5607',
    accent: '#FFBE0B',

    confirmed: '#8338EC',
    pending: '#3A86FF',
    cancelled: '#FF006E',

    background: 'rgb(10, 10, 20)',
    surface: 'rgba(20, 20, 40, 0.9)',
    border: 'rgba(255, 0, 110, 0.2)',

    textPrimary: '#ffffff',
    textSecondary: '#e0aaff',
    textMuted: '#c77dff',
  },
  gradients: {
    primary: 'from-pink-500/50 via-rose-400/20 to-orange-500/10',
    secondary: 'from-orange-500/50 via-yellow-400/20 to-pink-500/10',
    accent: 'from-yellow-400/50 via-orange-500/20 to-pink-500/10',
    hover: 'from-pink-500/60 to-orange-500/60',
    focus: 'from-pink-400 to-orange-400',
  },
  shadows: {
    sm: 'shadow-sm shadow-pink-500/20',
    md: 'shadow-md shadow-pink-500/30',
    lg: 'shadow-lg shadow-pink-500/40',
    xl: 'shadow-2xl shadow-pink-500/50',
  },
};

// ============================================================================
// MINIMAL THEME
// ============================================================================

export const minimalTheme: CalendarThemeConfig = {
  name: 'minimal',
  colors: {
    primary: '#6B7280',
    secondary: '#9CA3AF',
    accent: '#D1D5DB',

    confirmed: '#374151',
    pending: '#9CA3AF',
    cancelled: '#6B7280',

    background: 'rgb(20, 20, 20)',
    surface: 'rgba(40, 40, 40, 0.8)',
    border: 'rgba(120, 120, 120, 0.2)',

    textPrimary: '#f3f4f6',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',
  },
  gradients: {
    primary: 'from-gray-600/40 via-gray-500/20 to-gray-400/10',
    secondary: 'from-gray-500/40 via-gray-400/20 to-gray-300/10',
    accent: 'from-gray-400/40 via-gray-300/20 to-gray-200/10',
    hover: 'from-gray-500/50 to-gray-400/50',
    focus: 'from-gray-300 to-gray-200',
  },
  shadows: {
    sm: 'shadow-sm shadow-gray-900/30',
    md: 'shadow-md shadow-gray-900/40',
    lg: 'shadow-lg shadow-gray-900/50',
    xl: 'shadow-2xl shadow-gray-900/60',
  },
};

// ============================================================================
// DARK THEME
// ============================================================================

export const darkTheme: CalendarThemeConfig = {
  name: 'dark',
  colors: {
    primary: '#1E40AF',
    secondary: '#7C3AED',
    accent: '#0891B2',

    confirmed: '#047857',
    pending: '#B45309',
    cancelled: '#991B1B',

    background: 'rgb(5, 5, 10)',
    surface: 'rgba(10, 15, 30, 0.95)',
    border: 'rgba(100, 116, 139, 0.1)',

    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
  },
  gradients: {
    primary: 'from-blue-900/40 via-blue-800/20 to-blue-700/10',
    secondary: 'from-purple-900/40 via-purple-800/20 to-purple-700/10',
    accent: 'from-cyan-900/40 via-cyan-800/20 to-cyan-700/10',
    hover: 'from-blue-900/50 to-purple-900/50',
    focus: 'from-blue-700 to-cyan-700',
  },
  shadows: {
    sm: 'shadow-sm shadow-black/40',
    md: 'shadow-md shadow-black/50',
    lg: 'shadow-lg shadow-black/60',
    xl: 'shadow-2xl shadow-black/70',
  },
};

// ============================================================================
// NATURE THEME
// ============================================================================

export const natureTheme: CalendarThemeConfig = {
  name: 'nature',
  colors: {
    primary: '#059669',
    secondary: '#7C2D12',
    accent: '#CA8A04',

    confirmed: '#10B981',
    pending: '#D97706',
    cancelled: '#DC2626',

    background: 'rgb(15, 23, 20)',
    surface: 'rgba(30, 40, 35, 0.85)',
    border: 'rgba(5, 150, 105, 0.2)',

    textPrimary: '#f0fdf4',
    textSecondary: '#dbeafe',
    textMuted: '#86efac',
  },
  gradients: {
    primary: 'from-emerald-500/40 via-green-400/20 to-lime-500/10',
    secondary: 'from-amber-600/40 via-yellow-500/20 to-orange-500/10',
    accent: 'from-amber-500/40 via-yellow-400/20 to-lime-500/10',
    hover: 'from-emerald-500/50 to-amber-500/50',
    focus: 'from-emerald-400 to-lime-400',
  },
  shadows: {
    sm: 'shadow-sm shadow-green-900/20',
    md: 'shadow-md shadow-green-900/30',
    lg: 'shadow-lg shadow-green-900/40',
    xl: 'shadow-2xl shadow-green-900/50',
  },
};

// ============================================================================
// OCEAN THEME
// ============================================================================

export const oceanTheme: CalendarThemeConfig = {
  name: 'ocean',
  colors: {
    primary: '#0369A1',
    secondary: '#0EA5E9',
    accent: '#06B6D4',

    confirmed: '#0891B2',
    pending: '#7DD3FC',
    cancelled: '#E0F2FE',

    background: 'rgb(8, 20, 30)',
    surface: 'rgba(15, 30, 45, 0.9)',
    border: 'rgba(6, 182, 212, 0.2)',

    textPrimary: '#f0f9ff',
    textSecondary: '#cffafe',
    textMuted: '#7dd3fc',
  },
  gradients: {
    primary: 'from-sky-500/40 via-blue-400/20 to-cyan-500/10',
    secondary: 'from-cyan-500/40 via-sky-400/20 to-blue-500/10',
    accent: 'from-blue-500/40 via-cyan-400/20 to-sky-500/10',
    hover: 'from-sky-500/50 to-cyan-500/50',
    focus: 'from-sky-400 to-cyan-400',
  },
  shadows: {
    sm: 'shadow-sm shadow-blue-900/20',
    md: 'shadow-md shadow-blue-900/30',
    lg: 'shadow-lg shadow-blue-900/40',
    xl: 'shadow-2xl shadow-blue-900/50',
  },
};

// ============================================================================
// THEME SELECTOR
// ============================================================================

export const themes: Record<CalendarThemeName, CalendarThemeConfig> = {
  professional: professionalTheme,
  vibrant: vibrantTheme,
  minimal: minimalTheme,
  dark: darkTheme,
  nature: natureTheme,
  ocean: oceanTheme,
};

export function getTheme(name: CalendarThemeName): CalendarThemeConfig {
  return themes[name] || professionalTheme;
}

// ============================================================================
// THEME PROVIDER COMPONENT
// ============================================================================

interface ThemeProviderProps {
  theme: CalendarThemeName;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  const themeConfig = getTheme(theme);

  return (
    <div
      style={{
        '--theme-primary': themeConfig.colors.primary,
        '--theme-secondary': themeConfig.colors.secondary,
        '--theme-accent': themeConfig.colors.accent,
        '--theme-background': themeConfig.colors.background,
        '--theme-surface': themeConfig.colors.surface,
        '--theme-border': themeConfig.colors.border,
        '--theme-text-primary': themeConfig.colors.textPrimary,
        '--theme-text-secondary': themeConfig.colors.textSecondary,
        '--theme-text-muted': themeConfig.colors.textMuted,
      } as React.CSSProperties}
      className="w-full h-full"
    >
      {children}
    </div>
  );
};

// ============================================================================
// THEME SWITCHER COMPONENT
// ============================================================================

interface ThemeSwitcherProps {
  currentTheme: CalendarThemeName;
  onThemeChange: (theme: CalendarThemeName) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  const themeNames: CalendarThemeName[] = ['professional', 'vibrant', 'minimal', 'dark', 'nature', 'ocean'];
  const themeEmojis: Record<CalendarThemeName, string> = {
    professional: '💼',
    vibrant: '🎨',
    minimal: '⚪',
    dark: '🌙',
    nature: '🌿',
    ocean: '🌊',
  };

  return (
    <motion.div className="flex gap-2 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-lg">
      {themeNames.map((theme) => (
        <motion.button
          key={theme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onThemeChange(theme)}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-semibold
            transition-all duration-300
            ${
              currentTheme === theme
                ? 'bg-gradient-to-r from-blue-500/40 to-purple-500/40 border border-blue-400/50 text-white'
                : 'text-gray-300 hover:text-white'
            }
          `}
          title={theme}
        >
          {themeEmojis[theme]}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default {
  themes,
  getTheme,
  ThemeProvider,
  ThemeSwitcher,
  professionalTheme,
  vibrantTheme,
  minimalTheme,
  darkTheme,
  natureTheme,
  oceanTheme,
};
