import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rectangle';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
  animated?: boolean;
}

/**
 * Skeleton Component - Loading placeholder with shimmer effect
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" count={3} />
 * <Skeleton variant="circle" width={40} height={40} />
 * <Skeleton variant="rectangle" width="100%" height={200} />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height = variant === 'text' ? 16 : 40,
  count = 1,
  className,
  animated = true,
}) => {
  const baseClass = `
    bg-gradient-to-r from-slate-200 to-slate-300
    dark:from-slate-700 dark:to-slate-600
    rounded-lg
  `;

  const variantClass = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
  }[variant];

  const sizeStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const shimmerVariants = {
    initial: { backgroundPosition: '0% center' },
    animate: {
      backgroundPosition: '200% center',
      transition: {
        duration: 1.5,
        repeat: Infinity,
      } as any,
    },
  };

  const skeletons = Array.from({ length: count }).map((_, idx) => (
    <motion.div
      key={idx}
      variants={animated ? shimmerVariants : {}}
      initial={animated ? 'initial' : false}
      animate={animated ? 'animate' : false}
      className={`
        ${baseClass}
        ${variantClass}
        ${className}
      `}
      style={sizeStyle}
    />
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-3">{skeletons}</div>;
};

Skeleton.displayName = 'Skeleton';

/**
 * SkeletonCard Component - Complete card loading state
 */
export const SkeletonCard: React.FC<{ count?: number; animated?: boolean }> = ({
  count = 1,
  animated = true,
}) => {
  const cards = Array.from({ length: count }).map((_, idx) => (
    <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-4 space-y-4">
      <Skeleton variant="rectangle" height={200} animated={animated} />
      <div className="space-y-2">
        <Skeleton variant="text" animated={animated} />
        <Skeleton variant="text" width="80%" animated={animated} />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangle" width={80} height={32} animated={animated} />
        <Skeleton variant="rectangle" width={80} height={32} animated={animated} />
      </div>
    </div>
  ));

  return count === 1 ? cards[0] : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{cards}</div>;
};

SkeletonCard.displayName = 'SkeletonCard';

/**
 * SkeletonList Component - List loading state
 */
export const SkeletonList: React.FC<{ count?: number; animated?: boolean }> = ({
  count = 5,
  animated = true,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex gap-4 items-start">
          <Skeleton variant="circle" width={40} height={40} animated={animated} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" animated={animated} />
            <Skeleton variant="text" width="90%" animated={animated} />
          </div>
        </div>
      ))}
    </div>
  );
};

SkeletonList.displayName = 'SkeletonList';

/**
 * SkeletonTable Component - Table loading state
 */
export const SkeletonTable: React.FC<{
  rows?: number;
  cols?: number;
  animated?: boolean;
}> = ({ rows = 5, cols = 4, animated = true }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-3">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="flex-1">
              <Skeleton animated={animated} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

SkeletonTable.displayName = 'SkeletonTable';
