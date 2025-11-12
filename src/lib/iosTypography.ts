/**
 * iOS Typography System
 * Based on Apple's Human Interface Guidelines
 * SF Pro Display (headlines) + SF Pro Text (body)
 */

/**
 * iOS Dynamic Type Styles
 * Responsive typography matching iOS system fonts
 */
export const iosTypography = {
  // Large Titles (34pt regular)
  largeTitle: {
    fontSize: '34px',
    lineHeight: '41px',
    fontWeight: '400',
    letterSpacing: '0.011em',
  },
  
  // Title 1 (28pt regular)
  title1: {
    fontSize: '28px',
    lineHeight: '34px',
    fontWeight: '400',
    letterSpacing: '0.013em',
  },
  
  // Title 2 (22pt regular)
  title2: {
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: '400',
    letterSpacing: '0.016em',
  },
  
  // Title 3 (20pt regular)
  title3: {
    fontSize: '20px',
    lineHeight: '25px',
    fontWeight: '400',
    letterSpacing: '0.019em',
  },
  
  // Headline (17pt semibold)
  headline: {
    fontSize: '17px',
    lineHeight: '22px',
    fontWeight: '600',
    letterSpacing: '-0.022em',
  },
  
  // Body (17pt regular)
  body: {
    fontSize: '17px',
    lineHeight: '22px',
    fontWeight: '400',
    letterSpacing: '-0.022em',
  },
  
  // Callout (16pt regular)
  callout: {
    fontSize: '16px',
    lineHeight: '21px',
    fontWeight: '400',
    letterSpacing: '-0.020em',
  },
  
  // Subheadline (15pt regular)
  subheadline: {
    fontSize: '15px',
    lineHeight: '20px',
    fontWeight: '400',
    letterSpacing: '-0.016em',
  },
  
  // Footnote (13pt regular)
  footnote: {
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: '400',
    letterSpacing: '-0.006em',
  },
  
  // Caption 1 (12pt regular)
  caption1: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: '400',
    letterSpacing: '0em',
  },
  
  // Caption 2 (11pt regular)
  caption2: {
    fontSize: '11px',
    lineHeight: '13px',
    fontWeight: '400',
    letterSpacing: '0.006em',
  },
} as const;

/**
 * iOS Font Weights
 * Matches SF Pro font weight scale
 */
export const iosFontWeights = {
  ultralight: '100',
  thin: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
  black: '900',
} as const;

/**
 * iOS Spacing System
 * Based on 8pt grid with iOS-specific adjustments
 */
export const iosSpacing = {
  // Micro spacing
  xs: '4px',   // 0.5 unit
  sm: '8px',   // 1 unit
  md: '12px',  // 1.5 units
  
  // Standard spacing
  base: '16px', // 2 units
  lg: '20px',   // 2.5 units
  xl: '24px',   // 3 units
  
  // Section spacing
  '2xl': '32px', // 4 units
  '3xl': '40px', // 5 units
  '4xl': '48px', // 6 units
  
  // Screen margins
  screenMargin: '20px',  // iOS standard screen margin
  safeArea: '44px',      // Safe area inset (status bar)
  tabBar: '83px',        // Tab bar height with safe area
} as const;

/**
 * Generate iOS typography classes for Tailwind
 */
export const getIosTypographyClass = (style: keyof typeof iosTypography): string => {
  const typography = iosTypography[style];
  return `text-[${typography.fontSize}] leading-[${typography.lineHeight}] font-[${typography.fontWeight}] tracking-[${typography.letterSpacing}]`;
};
