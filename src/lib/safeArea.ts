/**
 * iOS Safe Area Utilities
 * Handles notch, home indicator, and dynamic island
 */

/**
 * CSS custom properties for safe areas
 * Use in CSS: padding-top: var(--safe-area-top)
 */
export const safeAreaVars = {
  top: 'var(--safe-area-top, env(safe-area-inset-top, 44px))',
  right: 'var(--safe-area-right, env(safe-area-inset-right, 0px))',
  bottom: 'var(--safe-area-bottom, env(safe-area-inset-bottom, 34px))',
  left: 'var(--safe-area-left, env(safe-area-inset-left, 0px))',
} as const;

/**
 * Safe area inset values (CSS env variables)
 * For inline styles: paddingTop: safeAreaInsets.top
 */
export const safeAreaInsets = {
  top: 'env(safe-area-inset-top, 0px)',
  right: 'env(safe-area-inset-right, 0px)',
  bottom: 'env(safe-area-inset-bottom, 0px)',
  left: 'env(safe-area-inset-left, 0px)',
} as const;

/**
 * Device safe area presets
 */
export const deviceSafeAreas = {
  // iPhone X, XS, 11 Pro, 12 mini, 13 mini
  standard: {
    top: 44,
    bottom: 34,
    left: 0,
    right: 0,
  },
  
  // iPhone XS Max, XR, 11, 11 Pro Max, 12, 12 Pro, 13, 13 Pro, 14, 14 Pro
  max: {
    top: 47,
    bottom: 34,
    left: 0,
    right: 0,
  },
  
  // iPhone 14 Pro, 15 Pro (Dynamic Island)
  dynamicIsland: {
    top: 59,
    bottom: 34,
    left: 0,
    right: 0,
  },
  
  // Landscape
  landscape: {
    top: 0,
    bottom: 21,
    left: 44,
    right: 44,
  },
} as const;

/**
 * Tailwind utility classes for safe areas
 */
export const safeAreaClasses = {
  // Padding
  pt: 'pt-[env(safe-area-inset-top)]',
  pr: 'pr-[env(safe-area-inset-right)]',
  pb: 'pb-[env(safe-area-inset-bottom)]',
  pl: 'pl-[env(safe-area-inset-left)]',
  px: 'px-[env(safe-area-inset-left)] px-[env(safe-area-inset-right)]',
  py: 'py-[env(safe-area-inset-top)] py-[env(safe-area-inset-bottom)]',
  p: 'p-[env(safe-area-inset-top)] p-[env(safe-area-inset-right)] p-[env(safe-area-inset-bottom)] p-[env(safe-area-inset-left)]',
  
  // Margin
  mt: 'mt-[env(safe-area-inset-top)]',
  mr: 'mr-[env(safe-area-inset-right)]',
  mb: 'mb-[env(safe-area-inset-bottom)]',
  ml: 'ml-[env(safe-area-inset-left)]',
  mx: 'mx-[env(safe-area-inset-left)] mx-[env(safe-area-inset-right)]',
  my: 'my-[env(safe-area-inset-top)] my-[env(safe-area-inset-bottom)]',
  m: 'm-[env(safe-area-inset-top)] m-[env(safe-area-inset-right)] m-[env(safe-area-inset-bottom)] m-[env(safe-area-inset-left)]',
} as const;

/**
 * React hook to detect safe area support
 */
export const useSafeArea = () => {
  const [hasSafeArea, setHasSafeArea] = React.useState(false);

  React.useEffect(() => {
    // Check if CSS env() is supported
    const testElement = document.createElement('div');
    testElement.style.paddingTop = 'env(safe-area-inset-top, 0px)';
    document.body.appendChild(testElement);
    
    const computedPadding = window.getComputedStyle(testElement).paddingTop;
    setHasSafeArea(computedPadding !== '0px');
    
    document.body.removeChild(testElement);
  }, []);

  return {
    hasSafeArea,
    insets: safeAreaInsets,
  };
};

/**
 * Get safe area aware height for full screen content
 */
export const getFullScreenHeight = (): string => {
  return 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))';
};

/**
 * Get safe area aware top position for fixed headers
 */
export const getSafeTop = (): string => {
  return 'env(safe-area-inset-top, 0px)';
};

/**
 * Get safe area aware bottom position for tab bars
 */
export const getSafeBottom = (): string => {
  return 'env(safe-area-inset-bottom, 0px)';
};

// Re-export React for the hook
import React from 'react';
