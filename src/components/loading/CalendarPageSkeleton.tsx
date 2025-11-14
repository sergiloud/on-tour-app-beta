/**
 * Calendar Page Loading Skeleton
 * Optimized skeleton for Calendar page with month grid layout
 */

import React from 'react';
import { Skeleton } from '../../ui/Skeleton';

export const CalendarPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-4 py-4">
      {/* Toolbar */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton width="120px" height="2rem" variant="rectangular" />
            <Skeleton width="200px" height="1.5rem" />
          </div>
          <div className="flex gap-2">
            <Skeleton width="80px" height="2rem" variant="rectangular" />
            <Skeleton width="80px" height="2rem" variant="rectangular" />
            <Skeleton width="80px" height="2rem" variant="rectangular" />
            <Skeleton width="80px" height="2rem" variant="rectangular" />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton width="60%" height="1rem" className="mx-auto" />
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div 
              key={i} 
              className="aspect-square bg-white/[0.02] rounded-lg border border-white/5 p-2"
            >
              <Skeleton width="24px" height="1rem" className="mb-2" />
              {/* Event indicators */}
              {i % 3 === 0 && (
                <div className="space-y-1">
                  <Skeleton width="90%" height="1rem" variant="rectangular" />
                  {i % 5 === 0 && <Skeleton width="85%" height="1rem" variant="rectangular" />}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Event buttons sidebar skeleton */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton width="120px" height="1rem" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width="100px" height="2rem" variant="rectangular" />
          ))}
        </div>
      </div>
    </div>
  );
};
