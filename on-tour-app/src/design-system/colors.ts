/**
 * Design System - Color Tokens
 *
 * Centralized color palette for On Tour App
 * Used by Tailwind CSS and component styling
 *
 * Structure:
 * - Semantic tokens (primary, success, danger, etc)
 * - Grayscale palette (50-950)
 * - Extended colors (blue, purple, amber, etc)
 * - State colors (hover, focus, active, disabled)
 *
 * Usage in components:
 * ```tsx
 * import { colors } from '@/design-system/colors';
 *
 * <button style={{ backgroundColor: colors.primary[500] }} />
 * ```
 *
 * Usage in Tailwind:
 * ```jsx
 * <button className="bg-primary-500 text-white hover:bg-primary-600" />
 * ```
 */

/**
 * Primary color palette
 * Used for main CTA, links, and brand identity
 */
export const primary = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9', // Primary brand color
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c3d66',
  950: '#051e3e',
} as const;

/**
 * Success color palette
 * Used for confirmations, completed states, positive messages
 */
export const success = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e', // Success base
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#145231',
  950: '#052e16',
} as const;

/**
 * Danger/Error color palette
 * Used for errors, destructive actions, warnings
 */
export const danger = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444', // Danger base
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
} as const;

/**
 * Warning color palette
 * Used for alerts, pending states, caution messages
 */
export const warning = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b', // Warning base
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03',
} as const;

/**
 * Info color palette
 * Used for informational messages, tooltips
 */
export const info = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#06b6d4', // Info base
  600: '#0891b2',
  700: '#0e7490',
  800: '#155e75',
  900: '#164e63',
  950: '#0f3444',
} as const;

/**
 * Grayscale palette
 * Used for text, borders, backgrounds
 */
export const gray = {
  0: '#ffffff',
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280', // Neutral text
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#030712',
} as const;

/**
 * Brand accent colors
 */
export const accent = {
  purple: '#a855f7',
  amber: '#f59e0b',
  emerald: '#10b981',
  rose: '#f43f5e',
  indigo: '#6366f1',
} as const;

/**
 * State colors
 */
export const states = {
  hover: 'rgba(0, 0, 0, 0.05)',
  focus: 'rgba(0, 0, 0, 0.1)',
  active: 'rgba(0, 0, 0, 0.15)',
  disabled: 'rgba(0, 0, 0, 0.05)',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

/**
 * All colors object for easy reference
 */
export const colors = {
  primary,
  success,
  danger,
  warning,
  info,
  gray,
  accent,
  states,
} as const;

/**
 * TypeScript type for color palette
 */
export type ColorToken = keyof typeof colors;
export type ColorShade = keyof typeof primary;
export type ColorValue = string;

/**
 * Helper function to get a color value
 * @param token - Color token name (e.g., 'primary')
 * @param shade - Shade level (50, 100, 200, ..., 950)
 */
export function getColor(token: ColorToken, shade: ColorShade): ColorValue {
  const colorPalette = colors[token];
  if (typeof colorPalette === 'object' && shade in colorPalette) {
    return (colorPalette as any)[shade];
  }
  return '#000000'; // Fallback
}

export default colors;
