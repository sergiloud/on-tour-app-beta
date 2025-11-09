import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

// Base skeleton with GPU-accelerated CSS animation
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`skeleton-shimmer bg-slate-200 dark:bg-white/10 rounded will-animate ${className}`} />
);

// GPU-optimized fade-in for skeletons
const skeletonVariant = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export const KPISkeleton: React.FC = () => (
  <motion.div
    variants={skeletonVariant}
    initial="initial"
    animate="animate"
    className="min-h-[160px] p-6 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 backdrop-blur-sm will-animate"
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
    variants={skeletonVariant}
    initial="initial"
    animate="animate"
    className="min-h-[220px] p-6 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 backdrop-blur-sm will-animate"
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
    {/* KPI Row - min-height to prevent layout shift */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KPISkeleton />
      <KPISkeleton />
      <KPISkeleton />
    </div>

    {/* Summary Cards Row - min-height to prevent layout shift */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCardSkeleton />
      <SummaryCardSkeleton />
      <SummaryCardSkeleton />
    </div>

    {/* Activity Feed Skeleton */}
    <motion.div
      variants={skeletonVariant}
      initial="initial"
      animate="animate"
      className="min-h-[200px] p-6 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 backdrop-blur-sm will-animate"
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
