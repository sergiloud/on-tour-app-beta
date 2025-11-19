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
  ArrowRight, ArrowLeft, CheckCircle, XCircle
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
        if (confirm('Are you sure you want to delete this event?')) {
          onDelete?.(event.id);
          onClose();
        }
      },
      className: 'hover:bg-red-500/10 text-red-400',
      dangerous: true,
    },
  ];
  
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
      
      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 glass rounded-xl border border-white/20 shadow-2xl min-w-[220px] overflow-hidden"
            style={{
              left: position.x,
              top: position.y,
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
