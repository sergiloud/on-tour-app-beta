import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Optimized table skeleton with CSS animations
 * Uses skeleton-shimmer from animations.css
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 10,
  columns = 5,
  className = ''
}) => {
  return (
    <div className={`w-full overflow-hidden rounded-lg border border-slate-200 dark:border-white/10 ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`header-${i}`} className="h-4 skeleton-shimmer rounded" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-200 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            className="p-4 animate-fade-in"
            style={{ animationDelay: `${rowIdx * 30}ms` }}
          >
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <div
                  key={`cell-${rowIdx}-${colIdx}`}
                  className="h-4 skeleton-shimmer rounded"
                  style={{
                    width: colIdx === 0 ? '80%' : colIdx === columns - 1 ? '60%' : '100%'
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
