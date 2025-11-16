/**
 * Advanced Virtual Scrolling Optimizations
 * 
 * Enhanced virtualization hooks with dynamic sizing, horizontal virtualization,
 * infinite scroll, sticky headers, and performance monitoring for massive datasets.
 */

import { useVirtualizer, type VirtualizerOptions } from '@tanstack/react-virtual';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { logger } from './logger';

// ============================================================================
// ADVANCED VIRTUAL SCROLLING HOOKS
// ============================================================================

/**
 * Enhanced useVirtualizer with performance optimizations
 */
export function useAdvancedVirtualizer<T = unknown>(
  options: Partial<VirtualizerOptions<HTMLDivElement, Element>> & {
    count: number;
    getScrollElement: () => HTMLElement | null;
    estimateSize: (index: number) => number;
    items?: T[];
    enablePerformanceMonitoring?: boolean;
    enableSmartOverscan?: boolean;
    enableDynamicSizing?: boolean;
  }
) {
  const { 
    items = [], 
    enablePerformanceMonitoring = false,
    enableSmartOverscan = true,
    enableDynamicSizing = false,
    ...virtualizerOptions 
  } = options;

  // Smart overscan based on list size and scroll speed
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lastScrollTime = useRef(0);
  const lastScrollTop = useRef(0);

  // Dynamic overscan calculation
  const smartOverscan = useMemo(() => {
    if (!enableSmartOverscan) return virtualizerOptions.overscan || 5;
    
    const baseOverscan = 5;
    const velocityMultiplier = Math.min(Math.abs(scrollVelocity) / 1000, 3);
    const sizeMultiplier = Math.min(items.length / 1000, 2);
    
    return Math.round(baseOverscan + velocityMultiplier + sizeMultiplier);
  }, [scrollVelocity, items.length, enableSmartOverscan, virtualizerOptions.overscan]);

  // Create virtualizer with enhanced options
  const virtualizer = useVirtualizer({
    ...virtualizerOptions,
    overscan: smartOverscan,
    // Performance optimizations
    initialOffset: virtualizerOptions.initialOffset || 0,
  });

  // Track scroll velocity for smart overscan
  useEffect(() => {
    const scrollElement = virtualizer.scrollElement;
    if (!scrollElement || !enableSmartOverscan) return;

    const handleScroll = () => {
      const now = performance.now();
      const currentScrollTop = scrollElement.scrollTop;
      
      if (lastScrollTime.current > 0) {
        const timeDelta = now - lastScrollTime.current;
        const scrollDelta = Math.abs(currentScrollTop - lastScrollTop.current);
        const velocity = scrollDelta / (timeDelta || 1);
        setScrollVelocity(velocity);
      }
      
      lastScrollTime.current = now;
      lastScrollTop.current = currentScrollTop;
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [virtualizer.scrollElement, enableSmartOverscan]);

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    visibleItems: 0,
    fps: 60,
    memoryUsage: 0,
  });

  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measurePerformance = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        const visibleItems = virtualizer.getVirtualItems().length;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          fps,
          visibleItems,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        }));

        frameCount = 0;
        lastTime = now;
      }

      animationFrameId = requestAnimationFrame(measurePerformance);
    };

    animationFrameId = requestAnimationFrame(measurePerformance);
    return () => cancelAnimationFrame(animationFrameId);
  }, [virtualizer, enablePerformanceMonitoring]);

  return {
    virtualizer,
    performanceMetrics,
    scrollVelocity,
  };
}

/**
 * Horizontal + Vertical Grid Virtualization
 */
export function useGridVirtualizer<T = unknown>(
  items: T[][],
  options: {
    rowHeight: number;
    columnWidth: number;
    containerWidth: number;
    containerHeight: number;
    overscan?: number;
    enableStickyHeaders?: boolean;
  }
) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => options.rowHeight,
    overscan: options.overscan || 5,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: items[0]?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => options.columnWidth,
    overscan: options.overscan || 5,
  });

  const visibleCells = useMemo(() => {
    const cells: Array<{
      key: string;
      rowIndex: number;
      columnIndex: number;
      x: number;
      y: number;
      width: number;
      height: number;
      item: T;
    }> = [];

    rowVirtualizer.getVirtualItems().forEach((virtualRow) => {
      columnVirtualizer.getVirtualItems().forEach((virtualColumn) => {
        const item = items[virtualRow.index]?.[virtualColumn.index];
        if (item) {
          cells.push({
            key: `${virtualRow.index}-${virtualColumn.index}`,
            rowIndex: virtualRow.index,
            columnIndex: virtualColumn.index,
            x: virtualColumn.start,
            y: virtualRow.start,
            width: virtualColumn.size,
            height: virtualRow.size,
            item,
          });
        }
      });
    });

    return cells;
  }, [rowVirtualizer, columnVirtualizer, items]);

  return {
    parentRef,
    rowVirtualizer,
    columnVirtualizer,
    visibleCells,
    totalWidth: columnVirtualizer.getTotalSize(),
    totalHeight: rowVirtualizer.getTotalSize(),
  };
}

/**
 * Infinite Virtual Scrolling with Dynamic Loading
 */
export function useInfiniteVirtualScroll<T = unknown>(
  options: {
    loadMore: (startIndex: number, stopIndex: number) => Promise<T[]>;
    hasMore: boolean;
    isLoading: boolean;
    itemHeight: number;
    threshold?: number;
    initialItemCount?: number;
  }
) {
  const [items, setItems] = useState<T[]>([]);
  const [loadingStates, setLoadingStates] = useState(new Set<number>());
  const parentRef = useRef<HTMLDivElement>(null);

  const { 
    loadMore, 
    hasMore, 
    isLoading, 
    itemHeight, 
    threshold = 5,
    initialItemCount = 50 
  } = options;

  // Virtual scrolling setup
  const virtualizer = useVirtualizer({
    count: hasMore ? items.length + 1 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  // Load more items when approaching the end
  const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
    if (isLoading || loadingStates.has(startIndex)) return;

    setLoadingStates(prev => new Set([...prev, startIndex]));

    try {
      const newItems = await loadMore(startIndex, stopIndex);
      setItems(prev => {
        const updated = [...prev];
        newItems.forEach((item, index) => {
          updated[startIndex + index] = item;
        });
        return updated;
      });
    } catch (error) {
      logger.error('Failed to load more items', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoadingStates(prev => {
        const updated = new Set(prev);
        updated.delete(startIndex);
        return updated;
      });
    }
  }, [loadMore, isLoading, loadingStates]);

  // Check if we need to load more items
  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    const lastItem = virtualItems[virtualItems.length - 1];

    if (
      lastItem &&
      lastItem.index >= items.length - threshold &&
      hasMore &&
      !isLoading
    ) {
      const startIndex = items.length;
      const stopIndex = startIndex + initialItemCount - 1;
      loadMoreItems(startIndex, stopIndex);
    }
  }, [virtualizer, items.length, hasMore, isLoading, threshold, initialItemCount, loadMoreItems]);

  return {
    parentRef,
    virtualizer,
    items,
    isLoadingMore: loadingStates.size > 0,
  };
}

/**
 * Dynamic Item Height Calculation
 */
export function useDynamicVirtualizer<T = unknown>(
  items: T[],
  options: {
    estimateSize: (index: number) => number;
    measureElement?: (element: Element | null) => void;
    containerHeight: number;
    overscan?: number;
  }
) {
  const parentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<Map<number, number>>(new Map());

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: options.estimateSize,
    overscan: options.overscan || 5,
    measureElement: (element) => {
      if (!element) return 0;
      
      const index = parseInt(element.getAttribute('data-index') || '0', 10);
      const height = element.getBoundingClientRect().height;
      
      if (measureRef.current.get(index) !== height) {
        measureRef.current.set(index, height);
        options.measureElement?.(element);
      }
      
      return height;
    },
  });

  return {
    parentRef,
    virtualizer,
    measureRef: measureRef.current,
  };
}

/**
 * Sticky Header Virtual Scrolling
 */
export function useStickyHeaderVirtualizer<T = unknown>(
  items: T[],
  options: {
    itemHeight: number;
    headerHeight: number;
    getItemGroup?: (item: T, index: number) => string;
    overscan?: number;
  }
) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { itemHeight, headerHeight, getItemGroup, overscan = 5 } = options;

  // Group items by their group key
  const groupedItems = useMemo(() => {
    if (!getItemGroup) return [{ key: 'default', items, startIndex: 0 }];

    const groups: Array<{ key: string; items: T[]; startIndex: number }> = [];
    let currentGroup: string | null = null;
    let currentItems: T[] = [];
    let startIndex = 0;

    items.forEach((item, index) => {
      const group = getItemGroup(item, index);
      
      if (group !== currentGroup) {
        if (currentItems.length > 0) {
          groups.push({ key: currentGroup!, items: [...currentItems], startIndex });
        }
        currentGroup = group;
        currentItems = [item];
        startIndex = index;
      } else {
        currentItems.push(item);
      }
    });

    if (currentItems.length > 0) {
      groups.push({ key: currentGroup!, items: currentItems, startIndex });
    }

    return groups;
  }, [items, getItemGroup]);

  // Calculate total count including headers
  const totalCount = groupedItems.reduce((acc, group) => acc + group.items.length + 1, 0);

  const virtualizer = useVirtualizer({
    count: totalCount,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      // Determine if this index is a header or item
      let currentIndex = 0;
      for (const group of groupedItems) {
        if (index === currentIndex) return headerHeight; // Header
        currentIndex++;
        if (index < currentIndex + group.items.length) return itemHeight; // Item
        currentIndex += group.items.length;
      }
      return itemHeight;
    },
    overscan,
  });

  // Map virtual items to their actual data
  const virtualItemsWithData = useMemo(() => {
    return virtualizer.getVirtualItems().map(virtualItem => {
      let currentIndex = 0;
      
      for (const group of groupedItems) {
        if (virtualItem.index === currentIndex) {
          return {
            ...virtualItem,
            type: 'header' as const,
            data: group.key,
          };
        }
        currentIndex++;
        
        if (virtualItem.index < currentIndex + group.items.length) {
          const itemIndex = virtualItem.index - currentIndex;
          return {
            ...virtualItem,
            type: 'item' as const,
            data: group.items[itemIndex],
            itemIndex: group.startIndex + itemIndex,
          };
        }
        currentIndex += group.items.length;
      }

      return {
        ...virtualItem,
        type: 'item' as const,
        data: null,
        itemIndex: -1,
      };
    });
  }, [virtualizer, groupedItems]);

  return {
    parentRef,
    virtualizer,
    virtualItemsWithData,
    groupedItems,
  };
}

/**
 * Performance Monitoring Hook for Virtual Lists
 */
export function useVirtualPerformanceMonitor(virtualizer: any) {
  const [metrics, setMetrics] = useState({
    fps: 60,
    renderTime: 0,
    memoryUsage: 0,
    visibleItems: 0,
    scrollProgress: 0,
    isScrolling: false,
  });

  const frameTimeRef = useRef<number[]>([]);
  const lastScrollTimeRef = useRef(0);
  const renderStartTimeRef = useRef(0);

  useEffect(() => {
    let animationFrameId: number;
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      const now = performance.now();
      frameCount++;

      // Track frame times for render time calculation
      if (frameTimeRef.current.length > 0) {
        const lastFrameTime = frameTimeRef.current[frameTimeRef.current.length - 1];
        if (lastFrameTime !== undefined) {
          const frameDuration = now - lastFrameTime;
        }
        frameTimeRef.current.push(now);
        
        // Keep only last 10 frames
        if (frameTimeRef.current.length > 10) {
          frameTimeRef.current.shift();
        }
      } else {
        frameTimeRef.current.push(now);
      }

      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        const frames = frameTimeRef.current;
        const avgFrameTime = frames.length > 1 
          ? ((frames[frames.length - 1] ?? 0) - (frames[0] ?? 0)) / (frames.length - 1)
          : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          renderTime: avgFrameTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          visibleItems: virtualizer?.getVirtualItems().length || 0,
          scrollProgress: virtualizer ? virtualizer.scrollOffset / virtualizer.getTotalSize() : 0,
          isScrolling: now - lastScrollTimeRef.current < 150,
        }));

        frameCount = 0;
        lastTime = now;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    // Track scroll events
    const scrollElement = virtualizer?.scrollElement;
    if (scrollElement) {
      const handleScroll = () => {
        lastScrollTimeRef.current = performance.now();
      };

      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        cancelAnimationFrame(animationFrameId);
        scrollElement.removeEventListener('scroll', handleScroll);
      };
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [virtualizer]);

  return metrics;
}