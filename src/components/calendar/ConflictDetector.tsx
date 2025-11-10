import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export type CalendarEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  type: 'show' | 'travel' | 'rest' | 'other';
  location?: string;
  notes?: string;
};

type Props = {
  events: CalendarEvent[];
  onResolveConflict?: (eventId1: string, eventId2: string, action: 'move' | 'split' | 'merge' | 'ignore') => void;
};

type Conflict = {
  event1: CalendarEvent;
  event2: CalendarEvent;
  conflictType: 'overlap' | 'back-to-back' | 'insufficient-travel-time' | 'overbooked';
  severity: 'warning' | 'critical';
  suggestion: string;
};

/**
 * Smart Conflict Detection & Resolution
 * Identifies scheduling conflicts and suggests solutions
 */
const ConflictDetector: React.FC<Props> = ({ events, onResolveConflict }) => {
  const conflicts = useMemo(() => {
    const detected: Conflict[] = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const e1 = events[i];
        const e2 = events[j];
        if (!e1 || !e2) continue;

        const start1 = new Date(e1.startDate).getTime();
        const end1 = new Date(e1.endDate || e1.startDate).getTime();
        const start2 = new Date(e2.startDate).getTime();
        const end2 = new Date(e2.endDate || e2.startDate).getTime();

        // Check for overlap
        if (start1 < end2 && end1 > start2) {
          detected.push({
            event1: e1,
            event2: e2,
            conflictType: 'overlap',
            severity: 'critical',
            suggestion: `Events overlap. Consider moving ${e2.title} to different dates.`,
          });
        }

        // Check for back-to-back conflicts
        const dayAfterE1 = new Date(end1);
        dayAfterE1.setDate(dayAfterE1.getDate() + 1);

        if (
          e1.type === 'show' &&
          e2.type === 'show' &&
          Math.abs(dayAfterE1.getTime() - start2) < 24 * 60 * 60 * 1000
        ) {
          detected.push({
            event1: e1,
            event2: e2,
            conflictType: 'back-to-back',
            severity: 'warning',
            suggestion: `Back-to-back shows. Consider travel days between ${e1.title} and ${e2.title}.`,
          });
        }

        // Check for insufficient travel time (if show + travel)
        if (
          (e1.type === 'show' && e2.type === 'travel') ||
          (e1.type === 'travel' && e2.type === 'show')
        ) {
          const timeBetween = Math.abs(Math.min(end1, end2) - Math.max(start1, start2)) / (1000 * 60 * 60 * 24);
          if (timeBetween < 3 && timeBetween > 0) {
            detected.push({
              event1: e1,
              event2: e2,
              conflictType: 'insufficient-travel-time',
              severity: 'warning',
              suggestion: `Only ${Math.round(timeBetween)} days between events. Might not be enough travel time.`,
            });
          }
        }
      }
    }

    return detected;
  }, [events]);

  const stats = useMemo(
    () => ({
      total: conflicts.length,
      critical: conflicts.filter((c) => c.severity === 'critical').length,
      warnings: conflicts.filter((c) => c.severity === 'warning').length,
    }),
    [conflicts]
  );

  if (conflicts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg bg-green-500/10 border border-green-500/30"
      >
        <div className="flex items-center gap-2">
          <div className="text-xl">✓</div>
          <div>
            <p className="text-sm font-semibold text-green-300">No Conflicts</p>
            <p className="text-xs text-slate-400 dark:text-white/60">Your calendar looks good. No scheduling issues detected.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-white/10">
          <p className="text-xs text-slate-400 dark:text-white/60 mb-1">Total Issues</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-xs text-slate-400 dark:text-white/60 mb-1">Critical</p>
          <p className="text-lg font-bold text-red-400">{stats.critical}</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-xs text-slate-400 dark:text-white/60 mb-1">Warnings</p>
          <p className="text-lg font-bold text-yellow-400">{stats.warnings}</p>
        </div>
      </motion.div>

      {/* Conflicts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {conflicts.map((conflict, idx) => (
          <motion.div
            key={`${conflict.event1.id}-${conflict.event2.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-4 rounded-lg border ${
              conflict.severity === 'critical'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}
          >
            <div className="space-y-2">
              {/* Conflict Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{conflict.suggestion}</p>
                  <div className="flex gap-2 mt-1 text-xs text-slate-400 dark:text-white/60">
                    <span>
                      {conflict.event1.title} ({new Date(conflict.event1.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })})
                    </span>
                    <span className="font-bold">↔</span>
                    <span>
                      {conflict.event2.title} ({new Date(conflict.event2.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })})
                    </span>
                  </div>
                </div>
                <div
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    conflict.severity === 'critical'
                      ? 'bg-red-500/30 text-red-300'
                      : 'bg-yellow-500/30 text-yellow-300'
                  }`}
                >
                  {conflict.severity === 'critical' ? 'CRITICAL' : 'WARNING'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {conflict.severity === 'critical' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        onResolveConflict?.(
                          conflict.event1.id,
                          conflict.event2.id,
                          'move'
                        )
                      }
                      className="flex-1 text-xs px-2 py-1 rounded bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 font-medium transition-colors"
                    >
                      Move Event
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        onResolveConflict?.(
                          conflict.event1.id,
                          conflict.event2.id,
                          'split'
                        )
                      }
                      className="flex-1 text-xs px-2 py-1 rounded bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 font-medium transition-colors"
                    >
                      Split Events
                    </motion.button>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    onResolveConflict?.(
                      conflict.event1.id,
                      conflict.event2.id,
                      'ignore'
                    )
                  }
                  className="flex-1 text-xs px-2 py-1 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 text-white font-medium transition-colors"
                >
                  Dismiss
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ConflictDetector;
