import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import type { Show } from '../../../lib/shows';

interface VirtualizedShowListProps {
  shows: Show[];
  onShowClick: (show: Show) => void;
  renderShow: (show: Show, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
}

/**
 * Virtualized list for shows
 * Maintains 60fps scroll with 1000+ items
 * Only renders visible items + overscan
 */
export const VirtualizedShowList: React.FC<VirtualizedShowListProps> = ({
  shows,
  onShowClick,
  renderShow,
  estimateSize = 80,
  overscan = 5,
  className = '',
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: shows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: overscan,
    // Enable smooth scrolling
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={`overflow-y-auto ${className}`}
      style={{
        contain: 'strict',
        height: '100%',
        overflowAnchor: 'none',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const show = shows[virtualItem.index];
          if (!show) return null;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderShow(show, virtualItem.index)}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {shows.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-white/50 font-sf-text text-ios-body">No shows found</p>
          </div>
        </div>
      )}
    </div>
  );
};
