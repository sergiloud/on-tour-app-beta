/**
 * Quick Actions Popover
 * 
 * Context menu for quick event actions.
 * Right-click or hover actions for events.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit2, Trash2, Copy, Link2, Calendar, Clock,
  ArrowRight, ArrowLeft, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import type { TimelineEvent } from '../../services/timelineMissionControlService';

interface QuickActionsPopoverProps {
  event: TimelineEvent | null;
  position: { x: number; y: number } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: TimelineEvent) => void;
  onDelete?: (eventId: string) => void;
  onDuplicate?: (event: TimelineEvent) => void;
  onCopyLink?: (eventId: string) => void;
  onReschedule?: (eventId: string) => void;
  onChangeStatus?: (eventId: string, status: string) => void;
}

export default function QuickActionsPopover({
  event,
  position,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onCopyLink,
  onReschedule,
  onChangeStatus,
}: QuickActionsPopoverProps) {
  
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  
  // Adjust position to keep popover on screen
  React.useEffect(() => {
    if (!position || !popoverRef.current) return;
    
    const popover = popoverRef.current;
    const rect = popover.getBoundingClientRect();
    const padding = 8;
    
    let { x, y } = position;
    
    // Adjust horizontal position
    if (x + rect.width > window.innerWidth - padding) {
      x = window.innerWidth - rect.width - padding;
    }
    if (x < padding) {
      x = padding;
    }
    
    // Adjust vertical position
    if (y + rect.height > window.innerHeight - padding) {
      y = window.innerHeight - rect.height - padding;
    }
    if (y < padding) {
      y = padding;
    }
    
    setAdjustedPosition({ x, y });
  }, [position, isOpen]);
  
  if (!event || !position) return null;
  
  const actions = [
    {
      icon: Edit2,
      label: 'Edit Event',
      shortcut: '⏎',
      onClick: () => {
        onEdit?.(event);
        onClose();
      },
      className: 'hover:bg-accent-500/10',
    },
    {
      icon: Copy,
      label: 'Duplicate',
      shortcut: '⌘D',
      onClick: () => {
        onDuplicate?.(event);
        onClose();
      },
      className: 'hover:bg-blue-500/10',
    },
    {
      icon: Link2,
      label: 'Copy Link',
      shortcut: '⌘C',
      onClick: () => {
        onCopyLink?.(event.id);
        onClose();
      },
      className: 'hover:bg-purple-500/10',
    },
    {
      icon: Calendar,
      label: 'Reschedule',
      shortcut: '⌘R',
      onClick: () => {
        onReschedule?.(event.id);
        onClose();
      },
      className: 'hover:bg-amber-500/10',
    },
    'divider',
    {
      icon: CheckCircle,
      label: 'Mark Confirmed',
      onClick: () => {
        onChangeStatus?.(event.id, 'confirmed');
        onClose();
      },
      className: 'hover:bg-green-500/10',
      disabled: event.status === 'confirmed',
    },
    {
      icon: XCircle,
      label: 'Cancel Event',
      onClick: () => {
        onChangeStatus?.(event.id, 'canceled');
        onClose();
      },
      className: 'hover:bg-red-500/10',
    },
    'divider',
    {
      icon: Trash2,
      label: 'Delete',
      shortcut: '⌫',
      onClick: () => {
        setShowDeleteConfirm(true);
      },
      className: 'hover:bg-red-500/10 text-red-400',
      dangerous: true,
    },
  ];
  
  const handleConfirmDelete = () => {
    onDelete?.(event.id);
    setShowDeleteConfirm(false);
    onClose();
  };
  
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative glass rounded-2xl border border-white/20 shadow-2xl max-w-md w-full p-6"
            >
              {/* Warning Icon */}
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Delete Event
              </h3>
              
              {/* Description */}
              <p className="text-white/60 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold text-white">"{event.title}"</span>? 
                This action cannot be undone.
              </p>
              
              {/* Event Info */}
              <div className="glass rounded-lg border border-white/10 p-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${event.type === 'show' ? 'bg-purple-400' :
                      event.type === 'travel' ? 'bg-blue-400' :
                      event.type === 'finance' ? 'bg-green-400' :
                      event.type === 'task' ? 'bg-amber-400' :
                      'bg-slate-400'}
                  `} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {event.title}
                    </div>
                    <div className="text-xs text-white/40">
                      {event.startTime.toLocaleDateString()} • {event.type}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg glass border border-white/10 text-white font-medium hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 glass rounded-xl border border-white/20 shadow-2xl min-w-[220px] overflow-hidden"
            style={{
              left: adjustedPosition?.x ?? position.x,
              top: adjustedPosition?.y ?? position.y,
            }}
          >
            <div className="p-1.5">
              {actions.map((action, index) => {
                if (action === 'divider') {
                  return (
                    <div
                      key={`divider-${index}`}
                      className="h-px bg-white/10 my-1.5"
                    />
                  );
                }
                
                if (typeof action === 'string') return null;
                
                const Icon = action.icon;
                const isDisabled = action.disabled || false;
                
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={isDisabled}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg
                      text-sm transition-all
                      ${isDisabled 
                        ? 'opacity-40 cursor-not-allowed' 
                        : `${action.className} cursor-pointer`
                      }
                      ${action.dangerous ? 'text-red-400' : 'text-white'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{action.label}</span>
                    </div>
                    {action.shortcut && (
                      <kbd className="text-[10px] text-white/40 font-mono">
                        {action.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
