/**
 * Enhanced VirtualizedTable Component v2
 * 
 * Advanced virtualization features:
 * - Horizontal + Vertical virtualization
 * - Dynamic item sizing with measurement
 * - Infinite scroll with predictive loading
 * - Performance monitoring dashboard
 * - Sticky grouped headers
 * - Smart overscan optimization
 * - Memory-aware rendering
 */

import React, { useMemo, useState } from 'react';
import { 
  useAdvancedVirtualizer, 
  useGridVirtualizer, 
  useInfiniteVirtualScroll,
  useStickyHeaderVirtualizer,
  useVirtualPerformanceMonitor 
} from '../../lib/advancedVirtualization';

// ============================================================================
// ENHANCED VIRTUALIZED LIST V2
// ============================================================================

interface EnhancedVirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number | ((index: number) => number);
  height?: number;
  width?: string;
  enablePerformanceMonitoring?: boolean;
  enableSmartOverscan?: boolean;
  enableDynamicSizing?: boolean;
  showPerformanceMetrics?: boolean;
  className?: string;
  emptyMessage?: string;
  onItemClick?: (item: T, index: number) => void;
}

export function EnhancedVirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 50,
  height = 600,
  width = '100%',
  enablePerformanceMonitoring = true,
  enableSmartOverscan = true,
  enableDynamicSizing = false,
  showPerformanceMetrics = false,
  className = '',
  emptyMessage = 'No items to display',
  onItemClick,
}: EnhancedVirtualizedListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const { virtualizer, performanceMetrics, scrollVelocity } = useAdvancedVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === 'function' ? itemHeight : () => itemHeight,
    items,
    enablePerformanceMonitoring,
    enableSmartOverscan,
    enableDynamicSizing,
  });

  // Performance monitoring for virtualizer
  const monitoringMetrics = useVirtualPerformanceMonitor(virtualizer);

  // Empty state
  if (items.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-gray-500 ${className}`}
        style={{ height: `${height}px`, width }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Performance Dashboard */}
      {showPerformanceMetrics && (
        <div className="absolute top-2 right-2 z-20 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div>FPS: {monitoringMetrics.fps}</div>
          <div>Visible: {monitoringMetrics.visibleItems}/{items.length}</div>
          <div>Velocity: {Math.round(scrollVelocity)}px/s</div>
          <div>Memory: {Math.round(monitoringMetrics.memoryUsage / 1024 / 1024)}MB</div>
          <div>Render: {Math.round(monitoringMetrics.renderTime)}ms</div>
        </div>
      )}

      {/* Virtualized Content */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: `${height}px`, width }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index];
            if (!item) return null;

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                className={onItemClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                onClick={() => onItemClick?.(item, virtualItem.index)}
              >
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCED VIRTUALIZED TABLE V2
// ============================================================================

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sticky?: boolean;
  render: (item: T, index: number) => React.ReactNode;
}

interface EnhancedVirtualizedTableProps<T> {
  items: T[];
  columns: Column<T>[];
  rowHeight?: number;
  height?: number;
  enablePerformanceMonitoring?: boolean;
  enableSmartOverscan?: boolean;
  showPerformanceMetrics?: boolean;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
}

export function EnhancedVirtualizedTable<T>({
  items,
  columns,
  rowHeight = 50,
  height = 600,
  enablePerformanceMonitoring = true,
  enableSmartOverscan = true,
  showPerformanceMetrics = false,
  className = '',
  emptyMessage = 'No data to display',
  onRowClick,
}: EnhancedVirtualizedTableProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const { virtualizer, performanceMetrics } = useAdvancedVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    items,
    enablePerformanceMonitoring,
    enableSmartOverscan,
  });

  const monitoringMetrics = useVirtualPerformanceMonitor(virtualizer);

  // Empty state
  if (items.length === 0) {
    return (
      <div className={`border rounded-lg ${className}`}>
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-b font-medium text-sm">
          {columns.map((col) => (
            <div 
              key={col.key} 
              style={{ width: col.width || 'flex-1' }}
              className={col.sticky ? 'sticky left-0 bg-gray-50 z-10' : ''}
            >
              {col.header}
            </div>
          ))}
        </div>

        {/* Empty message */}
        <div className="flex items-center justify-center p-8 text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg relative ${className}`}>
      {/* Performance Dashboard */}
      {showPerformanceMetrics && (
        <div className="absolute top-2 right-2 z-30 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div>FPS: {monitoringMetrics.fps}</div>
          <div>Rows: {monitoringMetrics.visibleItems}/{items.length}</div>
          <div>Scroll: {Math.round(monitoringMetrics.scrollProgress * 100)}%</div>
          <div>Memory: {Math.round(monitoringMetrics.memoryUsage / 1024 / 1024)}MB</div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-b font-medium text-sm sticky top-0 z-20">
        {columns.map((col) => (
          <div 
            key={col.key} 
            style={{ width: col.width || 'flex-1' }}
            className={col.sticky ? 'sticky left-0 bg-gray-50 z-21' : ''}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Virtualized Rows */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: `${height - 50}px` }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index];
            if (!item) return null;

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                className={`flex items-center gap-4 px-4 border-b hover:bg-gray-50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                onClick={() => onRowClick?.(item, virtualItem.index)}
              >
                {columns.map((col) => (
                  <div 
                    key={col.key} 
                    style={{ width: col.width || 'flex-1' }}
                    className={col.sticky ? 'sticky left-0 bg-white z-10' : ''}
                  >
                    {col.render(item, virtualItem.index)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INFINITE SCROLL VIRTUALIZED LIST
// ============================================================================

interface InfiniteVirtualListProps<T> {
  loadMore: (startIndex: number, stopIndex: number) => Promise<T[]>;
  hasMore: boolean;
  isLoading: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  height?: number;
  threshold?: number;
  initialItemCount?: number;
  loadingComponent?: React.ReactNode;
  className?: string;
}

export function InfiniteVirtualList<T>({
  loadMore,
  hasMore,
  isLoading,
  renderItem,
  itemHeight = 50,
  height = 600,
  threshold = 5,
  initialItemCount = 50,
  loadingComponent,
  className = '',
}: InfiniteVirtualListProps<T>) {
  const { parentRef, virtualizer, items, isLoadingMore } = useInfiniteVirtualScroll({
    loadMore,
    hasMore,
    isLoading,
    itemHeight,
    threshold,
    initialItemCount,
  });

  const monitoringMetrics = useVirtualPerformanceMonitor(virtualizer);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: `${height}px` }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index];
            
            // Loading indicator at the end
            if (!item && hasMore) {
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="flex items-center justify-center"
                >
                  {loadingComponent || (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Loading more...</span>
                    </div>
                  )}
                </div>
              );
            }

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
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GRID VIRTUALIZED TABLE (Horizontal + Vertical)
// ============================================================================

interface GridVirtualizedTableProps<T> {
  data: T[][];
  renderCell: (item: T, rowIndex: number, columnIndex: number) => React.ReactNode;
  rowHeight?: number;
  columnWidth?: number;
  width?: number;
  height?: number;
  headerRow?: string[];
  headerColumn?: string[];
  className?: string;
}

export function GridVirtualizedTable<T>({
  data,
  renderCell,
  rowHeight = 50,
  columnWidth = 150,
  width = 800,
  height = 600,
  headerRow,
  headerColumn,
  className = '',
}: GridVirtualizedTableProps<T>) {
  const { 
    parentRef, 
    rowVirtualizer, 
    columnVirtualizer, 
    visibleCells, 
    totalWidth, 
    totalHeight 
  } = useGridVirtualizer(data, {
    rowHeight,
    columnWidth,
    containerWidth: width,
    containerHeight: height,
  });

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Headers */}
      {headerRow && (
        <div 
          className="flex bg-gray-50 border-b sticky top-0 z-20"
          style={{ width: `${totalWidth}px` }}
        >
          {headerColumn && (
            <div 
              className="bg-gray-100 border-r flex items-center justify-center font-medium text-sm"
              style={{ width: columnWidth, height: 40 }}
            >
              #
            </div>
          )}
          {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
            const header = headerRow[virtualColumn.index];
            return (
              <div
                key={virtualColumn.key}
                className="border-r flex items-center justify-center font-medium text-sm bg-gray-50"
                style={{
                  width: virtualColumn.size,
                  height: 40,
                }}
              >
                {header}
              </div>
            );
          })}
        </div>
      )}

      {/* Virtualized Grid */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ 
          height: headerRow ? height - 40 : height,
          width: width,
        }}
      >
        <div
          style={{
            height: `${totalHeight}px`,
            width: `${totalWidth}px`,
            position: 'relative',
          }}
        >
          {/* Header Column (sticky left) */}
          {headerColumn && (
            <div className="sticky left-0 z-10">
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const header = headerColumn[virtualRow.index];
                return (
                  <div
                    key={`header-${virtualRow.key}`}
                    className="bg-gray-100 border-r border-b flex items-center justify-center font-medium text-sm"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: columnWidth,
                      height: virtualRow.size,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {header}
                  </div>
                );
              })}
            </div>
          )}

          {/* Data Cells */}
          {visibleCells.map((cell) => (
            <div
              key={cell.key}
              className="border-r border-b flex items-center justify-center text-sm"
              style={{
                position: 'absolute',
                left: headerColumn ? cell.x + columnWidth : cell.x,
                top: cell.y,
                width: cell.width,
                height: cell.height,
              }}
            >
              {renderCell(cell.item, cell.rowIndex, cell.columnIndex)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GROUPED VIRTUALIZED LIST (with sticky group headers)
// ============================================================================

interface GroupedVirtualListProps<T> {
  items: T[];
  getItemGroup: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderGroupHeader: (groupKey: string) => React.ReactNode;
  itemHeight?: number;
  headerHeight?: number;
  height?: number;
  className?: string;
}

export function GroupedVirtualList<T>({
  items,
  getItemGroup,
  renderItem,
  renderGroupHeader,
  itemHeight = 50,
  headerHeight = 40,
  height = 600,
  className = '',
}: GroupedVirtualListProps<T>) {
  const { parentRef, virtualizer, virtualItemsWithData } = useStickyHeaderVirtualizer(items, {
    itemHeight,
    headerHeight,
    getItemGroup,
  });

  return (
    <div className={className}>
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: `${height}px` }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItemsWithData.map((virtualItem) => {
            if (virtualItem.type === 'header') {
              return (
                <div
                  key={virtualItem.key}
                  className="sticky top-0 z-10 bg-gray-100 border-b font-medium"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {renderGroupHeader(virtualItem.data as string)}
                </div>
              );
            }

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.itemIndex}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {virtualItem.data && renderItem(virtualItem.data as T, virtualItem.itemIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}