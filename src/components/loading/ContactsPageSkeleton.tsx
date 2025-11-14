/**
 * Contacts Page Loading Skeleton
 * Optimized skeleton for Contacts CRM page with grid layout
 */

import React from 'react';
import { Skeleton } from '../../ui/Skeleton';

export const ContactsPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen p-4 md:p-6 ml-2 md:ml-3">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="160px" height="2rem" />
          <div className="flex gap-2">
            <Skeleton width="100px" height="2.5rem" variant="rectangular" />
            <Skeleton width="100px" height="2.5rem" variant="rectangular" />
            <Skeleton width="100px" height="2.5rem" variant="rectangular" />
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-2">
              <Skeleton width="80px" height="0.875rem" />
              <Skeleton width="60px" height="2rem" />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width="100px" height="2rem" variant="rectangular" />
          ))}
        </div>

        {/* Search and filters */}
        <div className="flex gap-3">
          <Skeleton width="350px" height="2.5rem" variant="rectangular" />
          <Skeleton width="120px" height="2.5rem" variant="rectangular" />
          <Skeleton width="120px" height="2.5rem" variant="rectangular" />
        </div>
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-white/[0.02] hover:bg-white/[0.04] rounded-lg border border-white/5 p-4 transition-colors"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3 flex items-center gap-3">
                <Skeleton width="40px" height="40px" variant="circular" />
                <div className="space-y-2 flex-1">
                  <Skeleton width="90%" height="1rem" />
                  <Skeleton width="70%" height="0.875rem" />
                </div>
              </div>
              <Skeleton width="85%" height="0.875rem" className="col-span-2" />
              <Skeleton width="80%" height="0.875rem" className="col-span-2" />
              <Skeleton width="75%" height="0.875rem" className="col-span-2" />
              <Skeleton width="60px" height="1.5rem" variant="rectangular" className="col-span-2" />
              <div className="col-span-1 flex gap-2 justify-end">
                <Skeleton width="32px" height="32px" variant="circular" />
                <Skeleton width="32px" height="32px" variant="circular" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
