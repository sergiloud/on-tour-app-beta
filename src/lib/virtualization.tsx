/**
 * Advanced Virtualization System
 * 
 * Professional implementation using @tanstack/react-virtual for optimal
 * performance with large datasets. Includes smart preloading, dynamic sizing,
 * and memory-efficient rendering.
 */

import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { useVirtualizer, defaultRangeExtractor, Range } from '@tanstack/react-virtual';
import { useMemoryManagement } from './memoryManagement';
import { logger } from './logger';

// ============================================================================
// VIRTUALIZATION CONFIGURATION
// ============================================================================

export interface VirtualizationConfig {
  // Core settings
  itemCount: number;
  estimateSize: (index: number) => number;
  overscan?: number; // Items to render outside visible area
  
  // Performance settings
  enableSmoothScrolling?: boolean;
  scrollMargin?: number;
  paddingStart?: number;
  paddingEnd?: number;
  
  // Memory optimization
  maxItemsInMemory?: number;
  preloadBuffer?: number;
  
  // Dynamic sizing
  enableDynamicSizing?: boolean;
  measureElement?: (element: Element, index: number) => void;
  
  // Scroll behavior
  scrollBehavior?: 'auto' | 'smooth';
  scrollToAlignment?: 'start' | 'center' | 'end' | 'auto';
  
  // Debug mode
  debug?: boolean;
}

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
  key: string;
}

// ============================================================================
// ADVANCED VIRTUAL LIST HOOK
// ============================================================================

export function useAdvancedVirtualizer<T = unknown>({
  itemCount,
  estimateSize,
  overscan = 5,
  enableSmoothScrolling = true,
  scrollMargin = 0,
  paddingStart = 0,
  paddingEnd = 0,
  maxItemsInMemory = 1000,
  preloadBuffer = 10,
  enableDynamicSizing = true,
  debug = false,
}: VirtualizationConfig) {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const { isMounted } = useMemoryManagement('AdvancedVirtualizer');
  
  // Performance metrics
  const [renderMetrics, setRenderMetrics] = useState({
    visibleItems: 0,
    totalSize: 0,
    renderTime: 0,
    scrollTop: 0,
  });
  
  // Custom range extractor with preloading
  const customRangeExtractor = useCallback((range: Range) => {
    const defaultRange = defaultRangeExtractor(range);
    
    // Add preload buffer
    const startIndex = Math.max(0, range.startIndex - preloadBuffer);
    const endIndex = Math.min(itemCount - 1, range.endIndex + preloadBuffer);
    
    // Create extended range with preloading
    const extendedRange = [];
    for (let i = startIndex; i <= endIndex; i++) {
      extendedRange.push(i);
    }
    
    // Limit to memory constraints
    if (extendedRange.length > maxItemsInMemory) {
      const visibleStart = range.startIndex;
      const visibleEnd = range.endIndex;
      const visibleCount = visibleEnd - visibleStart + 1;
      
      // Prioritize visible items + reasonable buffer
      const bufferSize = Math.min(preloadBuffer, (maxItemsInMemory - visibleCount) / 2);
      const limitedStart = Math.max(0, visibleStart - bufferSize);
      const limitedEnd = Math.min(itemCount - 1, visibleEnd + bufferSize);
      
      const limitedRange = [];
      for (let i = limitedStart; i <= limitedEnd; i++) {
        limitedRange.push(i);
      }
      
      if (debug) {
        logger.info('Virtualization range limited for memory', {
          original: extendedRange.length,
          limited: limitedRange.length,
          visible: visibleCount,
        });
      }
      
      return limitedRange;
    }
    
    return extendedRange;
  }, [itemCount, preloadBuffer, maxItemsInMemory, debug]);
  
  // Dynamic size estimation with caching
  const memoizedEstimateSize = useCallback((index: number) => {
    try {
      return estimateSize(index);
    } catch (error) {
      logger.error('Error estimating item size', error as Error, { index });
      return 50; // Fallback size
    }
  }, [estimateSize]);
  
  // Initialize virtualizer
  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: memoizedEstimateSize,
    overscan,
    scrollMargin,
    paddingStart,
    paddingEnd,
    rangeExtractor: customRangeExtractor,
    observeElementRect: enableDynamicSizing ? 
      (instance, cb) => {
        const element = scrollElementRef.current;
        if (!element) return;
        
        const resizeObserver = new ResizeObserver(() => {
          cb({ width: element.clientWidth, height: element.clientHeight });
        });
        
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
      } : undefined,
    observeElementOffset: enableDynamicSizing ?
      (instance, cb) => {
        const element = scrollElementRef.current;
        if (!element) return;
        
        const handleScroll = () => cb(element.scrollTop);
        element.addEventListener('scroll', handleScroll);
        return () => element.removeEventListener('scroll', handleScroll);
      } : undefined,
    initialRect: { width: 0, height: 0 },
    scrollToFn: enableSmoothScrolling
      ? (offset) => {
          scrollElementRef.current?.scrollTo({
            top: offset,
            behavior: 'smooth',
          });
        }
      : undefined,
  });
  
  // Update metrics when virtualization changes
  useEffect(() => {
    if (!isMounted()) return;
    
    const startTime = performance.now();
    
    const visibleItems = virtualizer.getVirtualItems();
    const totalSize = virtualizer.getTotalSize();
    const scrollTop = virtualizer.scrollOffset || 0;
    
    const renderTime = performance.now() - startTime;
    
    setRenderMetrics({
      visibleItems: visibleItems.length,
      totalSize,
      renderTime,
      scrollTop,
    });
    
    if (debug) {
      logger.info('Virtualization metrics updated', {
        visibleItems: visibleItems.length,
        totalSize,
        renderTime: `${renderTime.toFixed(2)}ms`,
        scrollTop,
      });
    }
  }, [virtualizer, isMounted, debug]);
  
  // Scroll to item with options
  const scrollToItem = useCallback((
    index: number, 
    options: { 
      align?: 'start' | 'center' | 'end' | 'auto';
      behavior?: 'auto' | 'smooth';
    } = {}
  ) => {
    const { align = 'auto', behavior = 'smooth' } = options;
    
    virtualizer.scrollToIndex(index, {
      align,
      behavior: enableSmoothScrolling ? behavior : 'auto',
    });
  }, [virtualizer, enableSmoothScrolling]);
  
  // Get item at scroll position
  const getItemAt = useCallback((scrollTop: number) => {
    return virtualizer.getVirtualItems().find(item => 
      scrollTop >= item.start && scrollTop <= item.end
    );
  }, [virtualizer]);
  
  // Force re-measure specific item
  const measureItem = useCallback((index: number) => {
    virtualizer.measureElement(
      scrollElementRef.current?.querySelector(`[data-index="${index}"]`)
    );
  }, [virtualizer]);
  
  // Batch measure multiple items
  const measureItems = useCallback((indices: number[]) => {
    indices.forEach(index => {
      const element = scrollElementRef.current?.querySelector(`[data-index="${index}"]`);
      if (element) {
        virtualizer.measureElement(element);
      }
    });
  }, [virtualizer]);
  
  return {
    // Core virtualizer
    virtualizer,
    scrollElementRef,
    
    // Utility methods
    scrollToItem,
    getItemAt,
    measureItem,
    measureItems,
    
    // Metrics and debugging
    renderMetrics,
    
    // Computed values
    visibleItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    isScrolling: virtualizer.isScrolling,
  };
}

// ============================================================================
// VIRTUAL LIST COMPONENT
// ============================================================================

export interface VirtualListProps<T> extends VirtualizationConfig {
  data: T[];
  renderItem: (item: T, index: number, virtualItem: VirtualItem) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onScroll?: (scrollTop: number) => void;
  onItemsChanged?: (visibleItems: VirtualItem[]) => void;
  
  // Loading states
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  
  // Accessibility
  role?: string;
  ariaLabel?: string;
}

export function VirtualList<T>({
  data,
  renderItem,
  className = '',
  style = {},
  onScroll,
  onItemsChanged,
  loadingComponent,
  emptyComponent,
  errorComponent,
  role = 'list',
  ariaLabel,
  ...virtualizationConfig
}: VirtualListProps<T>) {
  const { isMounted } = useMemoryManagement('VirtualList');
  
  const {
    virtualizer,
    scrollElementRef,
    visibleItems,
    totalSize,
    renderMetrics,
    scrollToItem,
  } = useAdvancedVirtualizer({
    ...virtualizationConfig,
    itemCount: data.length,
  });
  
  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (!isMounted()) return;
    
    const scrollTop = event.currentTarget.scrollTop;
    onScroll?.(scrollTop);
  }, [isMounted, onScroll]);
  
  // Notify when visible items change
  useEffect(() => {
    if (!isMounted()) return;
    onItemsChanged?.(visibleItems as VirtualItem[]);
  }, [visibleItems, onItemsChanged, isMounted]);
  
  // Handle empty state
  if (data.length === 0) {
    return (
      <div className={`virtual-list-empty ${className}`} style={style}>
        {emptyComponent || <div>No items to display</div>}
      </div>
    );
  }
  
  return (
    <div
      ref={scrollElementRef}
      className={`virtual-list-container ${className}`}
      style={{
        height: '400px', // Default height
        overflow: 'auto',
        contain: 'strict', // Performance optimization
        ...style,
      }}
      onScroll={handleScroll}
      role={role}
      aria-label={ariaLabel}
      data-testid="virtual-list"
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {visibleItems.map((virtualItem) => {
          const item = data[virtualItem.index];
          if (!item) return null;
          
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index, virtualItem as VirtualItem)}
            </div>
          );
        })}
      </div>
      
      {/* Debug overlay */}
      {virtualizationConfig.debug && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999,
          }}
        >
          <div>Visible: {renderMetrics.visibleItems}</div>
          <div>Total: {data.length}</div>
          <div>Render: {renderMetrics.renderTime.toFixed(1)}ms</div>
          <div>Scroll: {Math.round(renderMetrics.scrollTop)}px</div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VIRTUAL GRID COMPONENT (FOR CALENDAR/CARDS)
// ============================================================================

export interface VirtualGridProps<T> {
  data: T[];
  columns: number;
  rowHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function VirtualGrid<T>({
  data,
  columns,
  rowHeight,
  renderItem,
  gap = 8,
  className = '',
  style = {},
}: VirtualGridProps<T>) {
  const rowCount = Math.ceil(data.length / columns);
  
  const {
    virtualizer,
    scrollElementRef,
    visibleItems,
    totalSize,
  } = useAdvancedVirtualizer({
    itemCount: rowCount,
    estimateSize: () => rowHeight + gap,
    overscan: 2,
  });
  
  return (
    <div
      ref={scrollElementRef}
      className={`virtual-grid-container ${className}`}
      style={{
        height: '400px',
        overflow: 'auto',
        ...style,
      }}
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {visibleItems.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const endIndex = Math.min(startIndex + columns, data.length);
          
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
                padding: `0 ${gap}px`,
              }}
            >
              {Array.from({ length: endIndex - startIndex }, (_, i) => {
                const itemIndex = startIndex + i;
                const item = data[itemIndex];
                return item ? renderItem(item, itemIndex) : null;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// PERFORMANCE MONITORING HOOK
// ============================================================================

export function useVirtualizationPerformance() {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    maxRenderTime: 0,
    memoryUsage: 0,
  });
  
  const recordRender = useCallback((renderTime: number) => {
    setMetrics(prev => {
      const newRenderCount = prev.renderCount + 1;
      const newAverageRenderTime = 
        (prev.averageRenderTime * prev.renderCount + renderTime) / newRenderCount;
      
      return {
        renderCount: newRenderCount,
        averageRenderTime: newAverageRenderTime,
        maxRenderTime: Math.max(prev.maxRenderTime, renderTime),
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      };
    });
  }, []);
  
  return {
    metrics,
    recordRender,
  };
}

logger.info('Advanced Virtualization System initialized');