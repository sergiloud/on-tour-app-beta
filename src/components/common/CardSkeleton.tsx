import React from 'react';

interface CardSkeletonProps {
  className?: string;
  withImage?: boolean;
  withActions?: boolean;
}

/**
 * Reusable card skeleton component with CSS animations
 * Optimized for performance using GPU-accelerated animations
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className = '',
  withImage = false,
  withActions = false
}) => {
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden animate-fade-in ${className}`}>
      {withImage && (
        <div className="w-full h-48 skeleton-shimmer" />
      )}

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg skeleton-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 skeleton-shimmer rounded" />
            <div className="h-3 w-1/2 skeleton-shimmer rounded" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="h-4 w-full skeleton-shimmer rounded" />
          <div className="h-4 w-5/6 skeleton-shimmer rounded" />
          <div className="h-4 w-2/3 skeleton-shimmer rounded" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <div className="h-3 w-16 skeleton-shimmer rounded" />
            <div className="h-6 w-20 skeleton-shimmer rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 skeleton-shimmer rounded" />
            <div className="h-6 w-20 skeleton-shimmer rounded" />
          </div>
        </div>

        {/* Actions */}
        {withActions && (
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <div className="h-10 flex-1 skeleton-shimmer rounded-lg" />
            <div className="h-10 w-24 skeleton-shimmer rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSkeleton;
