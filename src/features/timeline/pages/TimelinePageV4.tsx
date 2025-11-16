/**
 * Timeline Page v4.0 - Professional Universal Timeline
 * 
 * Completely redesigned timeline following the app's design system.
 * Shows all events from the application in a clean, modular interface.
 * No emojis, professional styling, Notion-style experience.
 */

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { t } from '../../../lib/i18n';

// Lazy load the timeline component
const UniversalTimeline = React.lazy(() => import('../components/UniversalTimeline'));

/**
 * Timeline Stats Component - Overview metrics
 */
const TimelineStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        className="glass rounded-xl p-5 border border-white/10 hover:border-accent-500/30 transition-all group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center border border-white/5">
            <Calendar className="w-5 h-5 text-accent-400" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
            Total Events
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">24</div>
          <div className="text-xs text-white/30">Across all modules</div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        className="glass rounded-xl p-5 border border-white/10 hover:border-blue-500/30 transition-all group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-white/5">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
            This Week
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">8</div>
          <div className="text-xs text-white/30">Upcoming events</div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        className="glass rounded-xl p-5 border border-white/10 hover:border-amber-500/30 transition-all group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-white/5">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
            Priority Events
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">3</div>
          <div className="text-xs text-white/30">Require attention</div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Loading Skeleton for Timeline
 */
const TimelineLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Filter skeleton */}
      <div className="glass rounded-xl border border-white/10 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-10 bg-white/5 rounded-lg"></div>
            <div className="h-10 bg-white/5 rounded-lg"></div>
            <div className="h-10 bg-white/5 rounded-lg"></div>
            <div className="h-10 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </div>
      
      {/* Event skeletons */}
      <div className="space-y-8">
        {[1, 2, 3].map((day) => (
          <div key={day}>
            <div className="glass rounded-xl border border-white/10 p-3 inline-block mb-4">
              <div className="animate-pulse">
                <div className="h-4 bg-white/10 rounded w-40 mb-1"></div>
                <div className="h-3 bg-white/5 rounded w-20"></div>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((event) => (
                <div key={event} className="glass rounded-xl border border-white/10 p-6">
                  <div className="animate-pulse">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-white/5 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-white/5 rounded w-20"></div>
                      <div className="h-3 bg-white/5 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main Timeline Page Component
 */
const TimelinePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Universal Timeline
              </h1>
              <p className="text-white/60">
                All your events, shows, travel, and tasks in one place
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="glass border border-white/10 hover:border-accent-500/30 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all">
                Export Timeline
              </button>
              <button className="bg-accent-500 hover:bg-accent-600 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors">
                Add Event
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <TimelineStats />

        {/* Timeline Content */}
        <Suspense fallback={<TimelineLoadingSkeleton />}>
          <UniversalTimeline />
        </Suspense>
      </div>
    </div>
  );
};

export default TimelinePage;