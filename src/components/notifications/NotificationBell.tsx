/**
 * Notification Bell - Real-time notifications dropdown
 * Shows recent activity feed items and marks them as read
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Clock, User, FileText, Calendar, DollarSign, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentOrgId } from '../../lib/tenants';
import { FirestoreActivityService, type Activity } from '../../services/firestoreActivityService';
import { t } from '../../lib/i18n';
import { LinkInvitationsInbox, LinkInvitationBadge } from '../organization/LinkInvitationsInbox';

const ACTIVITY_ICONS: Record<string, React.ComponentType<any>> = {
  show_created: Calendar,
  show_updated: Calendar,
  show_confirmed: Check,
  contract_created: FileText,
  contract_updated: FileText,
  contract_signed: Check,
  finance_updated: DollarSign,
  member_invited: Users,
  member_joined: User,
};

export const NotificationBell: React.FC = () => {
  const { userId } = useAuth();
  const orgId = getCurrentOrgId();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time activity feed
  useEffect(() => {
    if (!userId || !orgId) return;

    const unsubscribe = FirestoreActivityService.subscribeToActivities(
      orgId,
      (newActivities: Activity[]) => {
        setActivities(newActivities.slice(0, 10)); // Last 10 activities
        // Count unread (activities from last 24h that user hasn't seen)
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const unread = newActivities.filter((a: Activity) => {
          const activityTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
          return activityTime > oneDayAgo && a.userId !== userId;
        }).length;
        setUnreadCount(Math.min(unread, 99)); // Cap at 99
      },
      { maxItems: 20 }
    );

    return () => unsubscribe();
  }, [userId, orgId]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatTimestamp = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 border-red-500/30';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/30';
      default: return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
        
        {/* Badge for activity + link invitations */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-accent-500 text-white text-[10px] font-bold rounded-full"
          >
            {unreadCount}
          </motion.span>
        )}
        
        {/* Additional badge for link invitations */}
        <LinkInvitationBadge />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 max-h-[500px] glass rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                {t('notifications.title') || 'Notificaciones'}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => setUnreadCount(0)}
                  className="text-xs text-accent-400 hover:text-accent-300 transition-colors"
                >
                  {t('notifications.markAllRead') || 'Marcar como leídas'}
                </button>
              )}
            </div>

            {/* Link Invitations Section */}
            <LinkInvitationsInbox compact limit={3} onUpdate={() => setIsOpen(false)} />

            {/* Activities List */}
            <div className="max-h-[400px] overflow-y-auto">
              {activities.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/50">
                    {t('notifications.empty') || 'Sin notificaciones'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {activities.map((activity) => {
                    const Icon = ACTIVITY_ICONS[activity.type] || Bell;
                    const isFromCurrentUser = activity.userId === userId;

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer ${
                          activity.priority === 'high' ? 'bg-red-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-lg ${getPriorityColor(activity.priority)} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4 text-white/70" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                              {activity.title}
                            </p>
                            <p className="text-xs text-white/60 mt-0.5">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-white/40" />
                              <span className="text-xs text-white/40">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                              {isFromCurrentUser && (
                                <span className="text-xs text-accent-400">
                                  (Tú)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Priority badge */}
                          {activity.priority === 'high' && (
                            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {activities.length > 0 && (
              <div className="px-4 py-3 border-t border-white/10">
                <button className="w-full text-center text-xs text-accent-400 hover:text-accent-300 transition-colors font-medium">
                  {t('notifications.viewAll') || 'Ver todas las notificaciones'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
