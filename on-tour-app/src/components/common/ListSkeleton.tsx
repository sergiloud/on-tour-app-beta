import React from 'react';

interface ListSkeletonProps {
  items?: number;
  className?: string;
  itemHeight?: 'sm' | 'md' | 'lg';
}

const heightMap = {
  sm: 'h-16',
  md: 'h-20',
  lg: 'h-24'
};

/**
 * Optimized list skeleton with staggered animations
 * Uses GPU-accelerated CSS animations for smooth loading states
 */
export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 8,
  className = '',
  itemHeight = 'md'
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, idx) => (
        <div
          key={`list-item-${idx}`}
          className={`${heightMap[itemHeight]} rounded-lg border border-slate-200 dark:border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center gap-4 animate-fade-in`}
          style={{ animationDelay: `${idx * 40}ms` }}
        >
          {/* Icon/Avatar */}
          <div className="w-12 h-12 rounded-lg skeleton-shimmer flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="h-4 skeleton-shimmer rounded" style={{ width: `${60 + (idx % 3) * 10}%` }} />
            <div className="h-3 skeleton-shimmer rounded" style={{ width: `${40 + (idx % 4) * 8}%` }} />
          </div>

          {/* Action/Status */}
          <div className="space-y-2 text-right">
            <div className="h-4 w-16 skeleton-shimmer rounded ml-auto" />
            <div className="h-3 w-12 skeleton-shimmer rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;
