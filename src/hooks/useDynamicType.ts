import { useState, useEffect } from 'react';

/**
 * iOS Dynamic Type size categories
 * Maps to iOS UIContentSizeCategory
 */
export type DynamicTypeSize =
  | 'xSmall'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'xLarge'
  | 'xxLarge'
  | 'xxxLarge'
  | 'accessibility1'
  | 'accessibility2'
  | 'accessibility3'
  | 'accessibility4'
  | 'accessibility5';

/**
 * Scale multipliers for each Dynamic Type size
 * Large (1.0) is the default iOS size
 */
const SCALE_FACTORS: Record<DynamicTypeSize, number> = {
  xSmall: 0.82,
  Small: 0.88,
  Medium: 0.94,
  Large: 1.0, // Default
  xLarge: 1.06,
  xxLarge: 1.12,
  xxxLarge: 1.18,
  accessibility1: 1.28,
  accessibility2: 1.38,
  accessibility3: 1.48,
  accessibility4: 1.64,
  accessibility5: 1.78,
};

/**
 * Detect Dynamic Type size from CSS custom property or media query
 */
const detectDynamicTypeSize = (): DynamicTypeSize => {
  // Check if iOS with CSS custom property support
  if (typeof window !== 'undefined' && window.CSS?.supports?.('font: -apple-system-body')) {
    const root = document.documentElement;
    const size = getComputedStyle(root).getPropertyValue('--ios-dynamic-type-size').trim();
    
    if (size && size in SCALE_FACTORS) {
      return size as DynamicTypeSize;
    }
  }

  // Fallback: detect from user preference (can be set in app settings)
  const stored = localStorage.getItem('preferredTextSize');
  if (stored && stored in SCALE_FACTORS) {
    return stored as DynamicTypeSize;
  }

  // Default to Large (iOS default)
  return 'Large';
};

/**
 * Hook to access iOS Dynamic Type scaling
 * 
 * @example
 * ```tsx
 * const { scale, scaledSize, currentSize, setSize } = useDynamicType();
 * 
 * // Use in inline styles
 * <h1 style={{ fontSize: scaledSize(34) }}>Title</h1>
 * 
 * // Use scale factor
 * <motion.div animate={{ scale: 1 * scale }}>
 * 
 * // Allow user to change size
 * <button onClick={() => setSize('xLarge')}>Increase</button>
 * ```
 */
export const useDynamicType = () => {
  const [currentSize, setCurrentSize] = useState<DynamicTypeSize>('Large');
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    // Initial detection
    const detectedSize = detectDynamicTypeSize();
    setCurrentSize(detectedSize);
    setScale(SCALE_FACTORS[detectedSize]);

    // Listen for changes (custom event from settings)
    const handleSizeChange = (e: CustomEvent<DynamicTypeSize>) => {
      const newSize = e.detail;
      setCurrentSize(newSize);
      setScale(SCALE_FACTORS[newSize]);
      localStorage.setItem('preferredTextSize', newSize);
    };

    window.addEventListener('dynamicTypeChange', handleSizeChange as EventListener);

    return () => {
      window.removeEventListener('dynamicTypeChange', handleSizeChange as EventListener);
    };
  }, []);

  /**
   * Scale a base size by the current Dynamic Type multiplier
   */
  const scaledSize = (baseSize: number): number => {
    return Math.round(baseSize * scale);
  };

  /**
   * Update the Dynamic Type size preference
   */
  const setSize = (newSize: DynamicTypeSize) => {
    setCurrentSize(newSize);
    setScale(SCALE_FACTORS[newSize]);
    localStorage.setItem('preferredTextSize', newSize);
    
    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent('dynamicTypeChange', { detail: newSize })
    );
  };

  /**
   * Get Tailwind class modifier based on size
   * @example 'text-lg' → 'text-xl' for xLarge
   */
  const getTextSizeClass = (baseClass: string): string => {
    // Map to relative class adjustments
    const adjustments: Record<DynamicTypeSize, number> = {
      xSmall: -2,
      Small: -1,
      Medium: 0,
      Large: 0,
      xLarge: 1,
      xxLarge: 2,
      xxxLarge: 3,
      accessibility1: 4,
      accessibility2: 5,
      accessibility3: 6,
      accessibility4: 7,
      accessibility5: 8,
    };

    const sizeMap = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'];
    const currentIndex = sizeMap.findIndex((s) => baseClass.includes(s));
    
    if (currentIndex === -1) return baseClass;

    const adjustment = adjustments[currentSize];
    const newIndex = Math.max(0, Math.min(sizeMap.length - 1, currentIndex + adjustment));
    const currentSize_str = sizeMap[currentIndex];
    const newSize_str = sizeMap[newIndex];
    
    if (!currentSize_str || !newSize_str) return baseClass;
    
    return baseClass.replace(currentSize_str, newSize_str);
  };

  return {
    /** Current Dynamic Type size category */
    currentSize,
    /** Scaling factor (0.82 - 1.78) */
    scale,
    /** Scale a numeric size by current multiplier */
    scaledSize,
    /** Update size preference */
    setSize,
    /** Get adjusted Tailwind class */
    getTextSizeClass,
    /** All available sizes */
    availableSizes: Object.keys(SCALE_FACTORS) as DynamicTypeSize[],
    /** Check if accessibility size is active */
    isAccessibilitySize: currentSize.startsWith('accessibility'),
  };
};
