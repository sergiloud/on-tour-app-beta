/**
 * Skeleton Loading Components
 * Provides placeholder UI during data loading
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base Skeleton component
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  variant = 'text',
  animation = 'pulse'
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const baseClasses = `bg-slate-200 dark:bg-white/10 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`;

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div
      className={baseClasses}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
};

/**
 * Skeleton Card - simulates Card component loading state
 */
export const SkeletonCard: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`glass rounded-lg p-4 space-y-3 ${className}`}>
      {/* Title */}
      <Skeleton width="60%" height="1.5rem" />
      
      {/* Content lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === lines - 1 ? '80%' : '100%'} 
          height="1rem"
        />
      ))}
    </div>
  );
};

/**
 * Skeleton List - simulates list loading state
 */
export const SkeletonList: React.FC<{ 
  items?: number; 
  withAvatar?: boolean;
  className?: string;
}> = ({
  items = 5,
  withAvatar = false,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {withAvatar && (
            <Skeleton variant="circular" width={40} height={40} />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height="1rem" />
            <Skeleton width="50%" height="0.875rem" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton Table - simulates table loading state
 */
export const SkeletonTable: React.FC<{ 
  rows?: number;
  columns?: number;
  className?: string;
}> = ({
  rows = 5,
  columns = 4,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4 pb-2 border-b border-slate-200 dark:border-white/10">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1">
            <Skeleton width="80%" height="1rem" />
          </div>
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={colIdx} className="flex-1">
              <Skeleton 
                width={colIdx === 0 ? '90%' : '70%'} 
                height="0.875rem" 
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
