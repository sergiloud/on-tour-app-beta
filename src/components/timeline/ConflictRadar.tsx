/**
 * Conflict Radar Sidebar
 * Real-time conflict detection and resolution panel
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, Clock, MapPin, Plane, X } from 'lucide-react';
import type { TimelineConflict } from '../../services/timelineMissionControlService';

interface ConflictRadarProps {
  conflicts: TimelineConflict[];
  onConflictClick?: (conflict: TimelineConflict) => void;
  onDismiss?: (conflictId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConflictRadar({ 
  conflicts, 
  onConflictClick, 
  onDismiss,
  isOpen,
  onClose 
}: ConflictRadarProps) {
  // Group conflicts by severity
  const critical = conflicts.filter(c => c.level === 'CRITICAL');
  const high = conflicts.filter(c => c.level === 'HIGH');
  const medium = conflicts.filter(c => c.level === 'MEDIUM');
  const low = conflicts.filter(c => c.level === 'LOW');
  
  const totalConflicts = conflicts.length;
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 bottom-0 w-96 z-40 flex flex-col bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              Conflict Radar
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
          
          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{critical.length}</div>
              <div className="text-[10px] text-red-300/70 uppercase font-semibold">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{high.length}</div>
              <div className="text-[10px] text-amber-300/70 uppercase font-semibold">High</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{medium.length}</div>
              <div className="text-[10px] text-yellow-300/70 uppercase font-semibold">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{low.length}</div>
              <div className="text-[10px] text-blue-300/70 uppercase font-semibold">Low</div>
            </div>
          </div>
        </div>
        
        {/* Conflicts list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {totalConflicts === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                All Clear!
              </h3>
              <p className="text-sm text-white/60">
                No conflicts detected in your timeline.
              </p>
            </div>
          ) : (
            <>
              {/* Critical conflicts */}
              {critical.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-red-300 uppercase tracking-wide flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Critical Issues
                  </h3>
                  {critical.map(conflict => (
                    <ConflictCard
                      key={conflict.id}
                      conflict={conflict}
                      onClick={() => onConflictClick?.(conflict)}
                      onDismiss={() => onDismiss?.(conflict.id)}
                    />
                  ))}
                </div>
              )}
              
              {/* High severity */}
              {high.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    High Priority
                  </h3>
                  {high.map(conflict => (
                    <ConflictCard
                      key={conflict.id}
                      conflict={conflict}
                      onClick={() => onConflictClick?.(conflict)}
                      onDismiss={() => onDismiss?.(conflict.id)}
                    />
                  ))}
                </div>
              )}
              
              {/* Medium severity */}
              {medium.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-yellow-300 uppercase tracking-wide flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Medium Priority
                  </h3>
                  {medium.map(conflict => (
                    <ConflictCard
                      key={conflict.id}
                      conflict={conflict}
                      onClick={() => onConflictClick?.(conflict)}
                      onDismiss={() => onDismiss?.(conflict.id)}
                    />
                  ))}
                </div>
              )}
              
              {/* Low severity */}
              {low.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wide flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Low Priority
                  </h3>
                  {low.map(conflict => (
                    <ConflictCard
                      key={conflict.id}
                      conflict={conflict}
                      onClick={() => onConflictClick?.(conflict)}
                      onDismiss={() => onDismiss?.(conflict.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Individual conflict card
 */
interface ConflictCardProps {
  conflict: TimelineConflict;
  onClick: () => void;
  onDismiss: () => void;
}

function ConflictCard({ conflict, onClick, onDismiss }: ConflictCardProps) {
  const colors = {
    CRITICAL: {
      bg: 'bg-red-950/50 border-red-500/50',
      icon: 'text-red-400',
      text: 'text-red-100'
    },
    HIGH: {
      bg: 'bg-amber-950/50 border-amber-500/50',
      icon: 'text-amber-400',
      text: 'text-amber-100'
    },
    MEDIUM: {
      bg: 'bg-yellow-950/50 border-yellow-500/50',
      icon: 'text-yellow-400',
      text: 'text-yellow-100'
    },
    LOW: {
      bg: 'bg-blue-950/50 border-blue-500/50',
      icon: 'text-blue-400',
      text: 'text-blue-100'
    }
  };
  
  const style = colors[conflict.level];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 rounded-lg border ${style.bg} cursor-pointer hover:bg-opacity-70 transition-all group`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${style.text} mb-1`}>
            {conflict.message}
          </p>
          <p className="text-xs text-white/50">
            {conflict.detail}
          </p>
          {conflict.eventIds && conflict.eventIds.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {conflict.eventIds.slice(0, 3).map(id => (
                <span 
                  key={id}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70"
                >
                  {id.slice(0, 8)}
                </span>
              ))}
              {conflict.eventIds.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  +{conflict.eventIds.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
