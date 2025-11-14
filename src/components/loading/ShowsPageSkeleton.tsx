/**
 * Shows Page Loading Skeleton
 * Optimized skeleton for Shows page with table layout
 */

import React from 'react';
import { Skeleton } from '../../ui/Skeleton';

export const ShowsPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen p-4 md:p-6 ml-2 md:ml-3">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="180px" height="2rem" />
          <div className="flex gap-2">
            <Skeleton width="120px" height="2.5rem" variant="rectangular" />
            <Skeleton width="120px" height="2.5rem" variant="rectangular" />
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="flex gap-3">
          <Skeleton width="300px" height="2.5rem" variant="rectangular" />
          <Skeleton width="150px" height="2.5rem" variant="rectangular" />
          <Skeleton width="150px" height="2.5rem" variant="rectangular" />
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-white/5 rounded-t-lg border border-white/10 p-3">
        <div className="grid grid-cols-12 gap-4">
          <Skeleton width="80%" height="1rem" className="col-span-2" />
          <Skeleton width="60%" height="1rem" className="col-span-2" />
          <Skeleton width="70%" height="1rem" className="col-span-2" />
          <Skeleton width="50%" height="1rem" className="col-span-1" />
          <Skeleton width="60%" height="1rem" className="col-span-2" />
          <Skeleton width="70%" height="1rem" className="col-span-2" />
          <Skeleton width="40%" height="1rem" className="col-span-1" />
        </div>
      </div>

      {/* Table Rows */}
      <div className="border-x border-b border-white/10 rounded-b-lg overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className="border-b border-white/5 p-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              <Skeleton width="90%" height="1rem" className="col-span-2" />
              <Skeleton width="75%" height="1rem" className="col-span-2" />
              <Skeleton width="85%" height="0.875rem" className="col-span-2" />
              <Skeleton width="60px" height="1.5rem" variant="rectangular" className="col-span-1" />
              <Skeleton width="80%" height="0.875rem" className="col-span-2" />
              <Skeleton width="70%" height="1.25rem" className="col-span-2" />
              <Skeleton width="32px" height="32px" variant="circular" className="col-span-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer pagination skeleton */}
      <div className="mt-4 flex justify-between items-center">
        <Skeleton width="150px" height="1rem" />
        <div className="flex gap-2">
          <Skeleton width="32px" height="32px" variant="rectangular" />
          <Skeleton width="32px" height="32px" variant="rectangular" />
          <Skeleton width="32px" height="32px" variant="rectangular" />
        </div>
      </div>
    </div>
  );
};
