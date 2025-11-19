/**
 * Event Detail Modal
 * 
 * Comprehensive modal for viewing and editing event details.
 * Notion-style clean interface with inline editing.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Clock, Calendar, DollarSign, Users, FileText,
  Edit2, Trash2, Copy, ExternalLink, AlertCircle
} from 'lucide-react';
import type { TimelineEvent } from '../../services/timelineMissionControlService';

interface EventDetailModalProps {
  event: TimelineEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (event: TimelineEvent) => void;
  onDelete?: (eventId: string) => void;
  onDuplicate?: (event: TimelineEvent) => void;
}

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
}: EventDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  if (!event) return null;
  
  const getEventColor = (type: string) => {
    const colors = {
      show: 'bg-purple-500',
      travel: 'bg-blue-500',
      finance: 'bg-green-500',
      task: 'bg-amber-500',
      contract: 'bg-slate-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };
  
  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'text-green-400 bg-green-500/10 border-green-500/30',
      tentative: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      offer: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      canceled: 'text-red-400 bg-red-500/10 border-red-500/30',
      done: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    };
    return colors[status as keyof typeof colors] || 'text-gray-400 bg-gray-500/10';
  };
  
  const duration = event.endTime 
    ? Math.round((event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60 * 24 * 10)) / 10
    : 0;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass rounded-2xl border border-white/20 w-full max-w-2xl max-h-[85vh] overflow-hidden pointer-events-auto shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${getEventColor(event.type)} flex items-center justify-center`}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {event.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs uppercase tracking-wider text-white/40">
                          {event.type}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg glass border border-white/10 hover:border-white/30 transition-all"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg glass border border-white/10 hover:border-accent-500/30 text-sm text-white/70 hover:text-white transition-all flex items-center gap-2">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button 
                    onClick={() => onDuplicate?.(event)}
                    className="px-3 py-1.5 rounded-lg glass border border-white/10 hover:border-accent-500/30 text-sm text-white/70 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  <button 
                    onClick={() => onDelete?.(event.id)}
                    className="px-3 py-1.5 rounded-lg glass border border-red-500/20 hover:border-red-500/50 text-sm text-red-400/70 hover:text-red-400 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)] space-y-6">
                {/* Time & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/40 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Start Time
                    </label>
                    <div className="text-white font-medium">
                      {event.startTime.toLocaleString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  
                  {event.endTime && (
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-white/40 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Duration
                      </label>
                      <div className="text-white font-medium">
                        {event.endTime.toLocaleString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        <span className="text-white/50 ml-2">({duration}h)</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {event.location && (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/40 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      Location
                    </label>
                    <div className="text-white font-medium flex items-center gap-2">
                      {event.location}
                      <button className="text-accent-400 hover:text-accent-300">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Financial Info */}
                {event.metadata && (event.metadata.fee || event.metadata.cost) && (
                  <div className="glass rounded-xl border border-white/10 p-4 space-y-3">
                    <div className="text-xs uppercase tracking-wider text-white/40 flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5" />
                      Financial
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {event.metadata.fee && (
                        <div>
                          <div className="text-xs text-white/50 mb-1">Fee</div>
                          <div className="text-lg font-bold text-green-400">
                            {event.metadata.fee.toLocaleString()} €
                          </div>
                        </div>
                      )}
                      {event.metadata.cost && (
                        <div>
                          <div className="text-xs text-white/50 mb-1">Cost</div>
                          <div className="text-lg font-bold text-amber-400">
                            {event.metadata.cost.toLocaleString()} €
                          </div>
                        </div>
                      )}
                    </div>
                    {event.metadata.fee && event.metadata.cost && (
                      <div className="pt-3 border-t border-white/10">
                        <div className="text-xs text-white/50 mb-1">Net</div>
                        <div className="text-lg font-bold text-accent-400">
                          {(event.metadata.fee - event.metadata.cost).toLocaleString()} €
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Additional Metadata */}
                {event.metadata && (event.metadata.capacity || event.metadata.door) && (
                  <div className="glass rounded-xl border border-white/10 p-4 space-y-3">
                    <div className="text-xs uppercase tracking-wider text-white/40 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      Venue Details
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {event.metadata.capacity && (
                        <div>
                          <div className="text-xs text-white/50 mb-1">Capacity</div>
                          <div className="text-white font-medium">
                            {event.metadata.capacity} people
                          </div>
                        </div>
                      )}
                      {event.metadata.door && (
                        <div>
                          <div className="text-xs text-white/50 mb-1">Door %</div>
                          <div className="text-white font-medium">
                            {event.metadata.door}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Importance Warning */}
                {event.importance === 'critical' && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-400 mb-1">Critical Event</div>
                      <div className="text-sm text-red-400/70">
                        This event is marked as critical and requires special attention.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
