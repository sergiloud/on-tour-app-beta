import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`} />
);

export const KPISkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div>
          <Skeleton className="w-24 h-4 mb-1" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="w-12 h-6 mb-1" />
        <Skeleton className="w-8 h-3" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton className="w-full h-8 rounded-lg" />
      <Skeleton className="w-3/4 h-6 rounded-lg" />
      <Skeleton className="w-1/2 h-6 rounded-lg" />
    </div>
  </motion.div>
);

export const SummaryCardSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div>
          <Skeleton className="w-32 h-4 mb-1" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="w-16 h-6 mb-1" />
        <Skeleton className="w-12 h-3" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton className="w-full h-20 rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="w-full h-12 rounded-lg" />
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>
    </div>
  </motion.div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* KPI Row */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KPISkeleton />
      <KPISkeleton />
      <KPISkeleton />
    </div>

    {/* Summary Cards Row */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCardSkeleton />
      <SummaryCardSkeleton />
      <SummaryCardSkeleton />
    </div>

    {/* Activity Feed Skeleton */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div>
          <Skeleton className="w-24 h-4 mb-1" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12 rounded-lg" />
        ))}
      </div>
    </motion.div>
  </div>
);