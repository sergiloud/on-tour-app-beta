/**
 * Design System - Spacing Tokens
 *
 * Centralized spacing scale for On Tour App
 * Based on 4px unit system (consistent with Tailwind)
 *
 * Structure:
 * - Sizes: 0-64 (4px increments)
 * - Spacing shortcuts: xs, sm, md, lg, xl, 2xl
 * - Gaps: for flexbox/grid
 * - Paddings: for components
 * - Margins: for layout
 *
 * Usage in components:
 * ```tsx
 * import { spacing } from '@/design-system/spacing';
 *
 * <div style={{ padding: spacing.md, margin: spacing.lg }} />
 * ```
 *
 * Usage in Tailwind:
 * ```jsx
 * <div className="p-4 m-6" />
 * ```
 */

/**
 * Spacing scale (4px base unit)
 * 0 = 0px, 1 = 4px, 2 = 8px, etc
 */
export const space = {
  0: '0px',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
} as const;

/**
 * Semantic spacing sizes
 */
export const sizes = {
  xs: space[2], // 8px - extra small spacing
  sm: space[3], // 12px - small spacing
  md: space[4], // 16px - medium spacing (default)
  lg: space[6], // 24px - large spacing
  xl: space[8], // 32px - extra large spacing
  '2xl': space[12], // 48px - 2x large spacing
} as const;

/**
 * Gaps for flexbox and grid layouts
 */
export const gaps = {
  xs: space[2], // 8px
  sm: space[3], // 12px
  md: space[4], // 16px
  lg: space[6], // 24px
  xl: space[8], // 32px
  '2xl': space[12], // 48px
} as const;

/**
 * Padding utilities
 */
export const padding = {
  // Uniform padding
  xs: space[2], // 8px
  sm: space[3], // 12px
  md: space[4], // 16px
  lg: space[6], // 24px
  xl: space[8], // 32px
  '2xl': space[12], // 48px

  // Specific sides
  x: {
    xs: space[2], // 8px horizontal
    sm: space[3], // 12px
    md: space[4], // 16px
    lg: space[6], // 24px
    xl: space[8], // 32px
  },
  y: {
    xs: space[2], // 8px vertical
    sm: space[3], // 12px
    md: space[4], // 16px
    lg: space[6], // 24px
    xl: space[8], // 32px
  },
  top: {
    xs: space[2],
    sm: space[3],
    md: space[4],
    lg: space[6],
    xl: space[8],
  },
  bottom: {
    xs: space[2],
    sm: space[3],
    md: space[4],
    lg: space[6],
    xl: space[8],
  },
  left: {
    xs: space[2],
    sm: space[3],
    md: space[4],
    lg: space[6],
    xl: space[8],
  },
  right: {
    xs: space[2],
    sm: space[3],
    md: space[4],
    lg: space[6],
    xl: space[8],
  },
} as const;

/**
 * Margin utilities
 */
export const margin = {
  // Uniform margin
  xs: space[2], // 8px
  sm: space[3], // 12px
  md: space[4], // 16px
  lg: space[6], // 24px
  xl: space[8], // 32px
  '2xl': space[12], // 48px
  auto: 'auto',

  // Specific sides
  x: {
    xs: space[2], // 8px horizontal
    sm: space[3], // 12px
    md: space[4], // 16px
    lg: space[6], // 24px
    xl: space[8], // 32px
    auto: 'auto',
  },
  y: {
    xs: space[2], // 8px vertical
    sm: space[3], // 12px
    md: space[4], // 16px
    lg: space[6], // 24px
    xl: space[8], // 32px
    auto: 'auto',
  },
} as const;

/**
 * Border radius tokens
 */
export const radius = {
  none: '0px',
  xs: '0.25rem', // 2px
  sm: '0.375rem', // 3px
  md: '0.5rem', // 4px (default)
  lg: '0.75rem', // 6px
  xl: '1rem', // 8px
  '2xl': '1.5rem', // 12px
  '3xl': '2rem', // 16px
  full: '9999px', // Pill-shaped
} as const;

/**
 * Shadow tokens (depth indicators)
 */
export const shadow = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const;

/**
 * Z-index stack
 * Prevents z-index wars
 */
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal_backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const;

/**
 * Transition/Animation timing
 */
export const timing = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

/**
 * Transition easing functions
 */
export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/**
 * All spacing tokens
 */
export const spacing = {
  space,
  sizes,
  gaps,
  padding,
  margin,
  radius,
  shadow,
  zIndex,
  timing,
  easing,
} as const;

/**
 * TypeScript types
 */
export type SpaceSize = keyof typeof space;
export type Size = keyof typeof sizes;
export type RadiusSize = keyof typeof radius;
export type ShadowSize = keyof typeof shadow;
export type ZIndex = keyof typeof zIndex;
export type Timing = keyof typeof timing;
export type Easing = keyof typeof easing;

export default spacing;
