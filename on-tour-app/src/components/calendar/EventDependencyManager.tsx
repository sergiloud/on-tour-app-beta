import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalEvent } from './types';
import { t } from '../../lib/i18n';
import { AlertCircle, Link as LinkIcon, Check } from 'lucide-react';

/**
 * Event Dependency Types
 */
export type DependencyType = 'must_before' | 'must_after' | 'same_day' | 'within_hours';

export interface EventDependency {
  id: string;
  eventId: string; // The event that has the dependency
  dependsOnEventId: string; // The event it depends on
  type: DependencyType;
  metadata?: {
    minHours?: number; // Minimum hours between events
    maxHours?: number; // Maximum hours between events
  };
}

export interface DependencyConflict {
  type: 'violated' | 'warning';
  dependencyId: string;
  eventId: string;
  dependsOnEventId: string;
  message: string;
  suggestion: string;
}

/**
 * Event Dependency Manager Hook
 * Manages event dependencies and conflict detection
 */
export const useEventDependencies = (dependencies: EventDependency[] = []) => {
  const findConflicts = useCallback(
    (events: CalEvent[]): DependencyConflict[] => {
      const conflicts: DependencyConflict[] = [];
      const eventMap = new Map(events.map((e) => [e.id, e]));

      for (const dep of dependencies) {
        const event = eventMap.get(dep.eventId);
        const dependsOn = eventMap.get(dep.dependsOnEventId);

        if (!event || !dependsOn) continue;

        const eventDate = new Date(event.date);
        const dependsOnDate = new Date(dependsOn.date || dependsOn.date);

        switch (dep.type) {
          case 'must_before':
            // dependsOn must be before event
            if (dependsOnDate >= eventDate) {
              conflicts.push({
                type: 'violated',
                dependencyId: dep.id,
                eventId: dep.eventId,
                dependsOnEventId: dep.dependsOnEventId,
                message: `"${event.title}" must come after "${dependsOn.title}"`,
                suggestion: `Move "${event.title}" to after "${dependsOn.title}" or reschedule "${dependsOn.title}" earlier`,
              });
            }
            break;

          case 'must_after':
            // dependsOn must be after event
            if (dependsOnDate <= eventDate) {
              conflicts.push({
                type: 'violated',
                dependencyId: dep.id,
                eventId: dep.eventId,
                dependsOnEventId: dep.dependsOnEventId,
                message: `"${event.title}" must come before "${dependsOn.title}"`,
                suggestion: `Move "${event.title}" to before "${dependsOn.title}" or reschedule "${dependsOn.title}" later`,
              });
            }
            break;

          case 'same_day':
            // Must be on the same day
            if (eventDate.toDateString() !== dependsOnDate.toDateString()) {
              conflicts.push({
                type: 'violated',
                dependencyId: dep.id,
                eventId: dep.eventId,
                dependsOnEventId: dep.dependsOnEventId,
                message: `"${event.title}" and "${dependsOn.title}" must be on the same day`,
                suggestion: `Reschedule one or both events to the same day`,
              });
            }
            break;

          case 'within_hours':
            // Must be within specified hours
            const minHours = dep.metadata?.minHours || 0;
            const maxHours = dep.metadata?.maxHours || 24;
            const hoursDiff = Math.abs((dependsOnDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60));

            if (hoursDiff < minHours || hoursDiff > maxHours) {
              conflicts.push({
                type: 'warning',
                dependencyId: dep.id,
                eventId: dep.eventId,
                dependsOnEventId: dep.dependsOnEventId,
                message: `"${event.title}" and "${dependsOn.title}" must be within ${maxHours} hours of each other`,
                suggestion: `Reschedule to be closer together (currently ${Math.round(hoursDiff)} hours apart)`,
              });
            }
            break;
        }
      }

      return conflicts;
    },
    [dependencies]
  );

  return { findConflicts, dependencies };
};

/**
 * Dependency Conflict Alert Component
 */
export const DependencyConflictAlert: React.FC<{
  conflicts: DependencyConflict[];
  onResolve?: (conflict: DependencyConflict) => void;
}> = ({ conflicts, onResolve }) => {
  return (
    <AnimatePresence>
      {conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white mb-2">
                {t('calendar.dependencies.conflicts') || 'Event Dependency Conflicts'}
              </h3>
              <div className="space-y-2">
                {conflicts.map((conflict, idx) => (
                  <motion.div
                    key={`${conflict.dependencyId}-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg text-sm ${
                      conflict.type === 'violated'
                        ? 'bg-red-500/10 border border-red-500/20'
                        : 'bg-yellow-500/10 border border-yellow-500/20'
                    }`}
                  >
                    <p className="font-medium text-white mb-1">{conflict.message}</p>
                    <p className={`text-xs ${conflict.type === 'violated' ? 'text-red-300' : 'text-yellow-300'}`}>
                      💡 {conflict.suggestion}
                    </p>
                    {onResolve && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onResolve(conflict)}
                        className="mt-2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-all"
                      >
                        {t('calendar.dependencies.resolve') || 'Resolve'}
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Dependency Link Manager Component
 */
export const DependencyLinkManager: React.FC<{
  events: CalEvent[];
  dependencies: EventDependency[];
  onAddDependency?: (dep: EventDependency) => void;
  onRemoveDependency?: (depId: string) => void;
}> = ({ events, dependencies, onAddDependency, onRemoveDependency }) => {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <LinkIcon className="w-4 h-4 text-accent-400" />
        <h3 className="text-sm font-semibold text-white">
          {t('calendar.dependencies.linkEvents') || 'Link Events'}
        </h3>
      </div>

      {dependencies.length === 0 ? (
        <p className="text-xs text-white/50">{t('calendar.dependencies.none') || 'No event links yet'}</p>
      ) : (
        <div className="space-y-2">
          {dependencies.map((dep) => {
            const event = events.find((e) => e.id === dep.eventId);
            const dependsOn = events.find((e) => e.id === dep.dependsOnEventId);

            return (
              <motion.div
                key={dep.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="text-xs text-white/70 flex-1 min-w-0">
                  <span className="font-medium text-white truncate">{event?.title}</span>
                  <span className="mx-1">→</span>
                  <span className="font-medium text-white truncate">{dependsOn?.title}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemoveDependency?.(dep.id)}
                  className="text-xs px-2 py-1 rounded-lg text-red-300 hover:bg-red-500/20 transition-all"
                >
                  ✕
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default useEventDependencies;
