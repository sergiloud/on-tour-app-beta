import { useState, useEffect } from 'react';

export type ListDensity = 'compact' | 'normal' | 'detailed';

interface ListDensityConfig {
  /** Card/item height in pixels */
  height: number;
  /** Padding size */
  padding: 'sm' | 'md' | 'lg';
  /** Show avatars/images */
  showImages: boolean;
  /** Show secondary text */
  showSecondary: boolean;
  /** Show metadata (date, time, status) */
  showMetadata: boolean;
  /** Font size class */
  fontSize: string;
}

const DENSITY_CONFIGS: Record<ListDensity, ListDensityConfig> = {
  compact: {
    height: 56,
    padding: 'sm',
    showImages: false,
    showSecondary: false,
    showMetadata: false,
    fontSize: 'text-sm',
  },
  normal: {
    height: 80,
    padding: 'md',
    showImages: true,
    showSecondary: true,
    showMetadata: false,
    fontSize: 'text-base',
  },
  detailed: {
    height: 120,
    padding: 'lg',
    showImages: true,
    showSecondary: true,
    showMetadata: true,
    fontSize: 'text-base',
  },
};

/**
 * Hook to manage list density preferences
 * Allows users to control information density per view
 * 
 * @example
 * ```tsx
 * const { density, setDensity, config } = useListDensity('shows');
 * 
 * <select value={density} onChange={e => setDensity(e.target.value)}>
 *   <option value="compact">Compact</option>
 *   <option value="normal">Normal</option>
 *   <option value="detailed">Detailed</option>
 * </select>
 * 
 * <div style={{ height: config.height }}>
 *   {config.showImages && <Avatar />}
 *   <h3 className={config.fontSize}>{show.name}</h3>
 *   {config.showSecondary && <p>{show.venue}</p>}
 *   {config.showMetadata && <span>{show.date}</span>}
 * </div>
 * ```
 */
export const useListDensity = (viewId: string, defaultDensity: ListDensity = 'normal') => {
  const storageKey = `listDensity_${viewId}`;
  
  const [density, setDensityState] = useState<ListDensity>(() => {
    const stored = localStorage.getItem(storageKey);
    return (stored as ListDensity) || defaultDensity;
  });

  const setDensity = (newDensity: ListDensity) => {
    setDensityState(newDensity);
    localStorage.setItem(storageKey, newDensity);
  };

  const config = DENSITY_CONFIGS[density];

  // Get Tailwind padding class
  const getPaddingClass = () => {
    switch (config.padding) {
      case 'sm': return 'p-2';
      case 'md': return 'p-4';
      case 'lg': return 'p-6';
    }
  };

  // Get gap class for spacing
  const getGapClass = () => {
    switch (config.padding) {
      case 'sm': return 'gap-1';
      case 'md': return 'gap-2';
      case 'lg': return 'gap-3';
    }
  };

  return {
    density,
    setDensity,
    config,
    paddingClass: getPaddingClass(),
    gapClass: getGapClass(),
    /** All available density options */
    options: ['compact', 'normal', 'detailed'] as ListDensity[],
  };
};

/**
 * Get items per page based on density and viewport height
 */
export const useItemsPerPage = (density: ListDensity, viewportHeight: number = window.innerHeight) => {
  const config = DENSITY_CONFIGS[density];
  const headerHeight = 120; // Approximate header + padding
  const availableHeight = viewportHeight - headerHeight;
  const itemsPerPage = Math.floor(availableHeight / config.height);
  
  return Math.max(5, itemsPerPage); // Minimum 5 items
};

/**
 * Calculate optimal density based on item count and viewport
 * Automatically suggests best density for user's screen
 */
export const suggestDensity = (
  itemCount: number,
  viewportHeight: number = window.innerHeight
): ListDensity => {
  // For very long lists, suggest compact
  if (itemCount > 100) return 'compact';
  
  // For medium lists on small screens, suggest normal
  if (viewportHeight < 700 && itemCount > 20) return 'normal';
  
  // For short lists or large screens, detailed is fine
  if (itemCount < 20 || viewportHeight > 900) return 'detailed';
  
  // Default to normal
  return 'normal';
};
