/**
 * LinkInvitationsInbox Component
 * 
 * Displays pending agency-artist link invitations for the current user.
 * Artists can accept or reject invitations from agencies.
 * Shows in notifications dropdown with real-time updates via Firestore.
 */

import React, { useState, useEffect } from 'react';
import { Building2, Check, X, Clock, Mail, Shield } from 'lucide-react';
import { FirestoreLinkInvitationService, type LinkInvitation } from '../../services/firestoreLinkInvitationService';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { t } from '../../lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useSettings } from '../../context/SettingsContext';

export interface LinkInvitationsInboxProps {
  /**
   * Compact mode for dropdown display
   */
  compact?: boolean;
  
  /**
   * Maximum number of invitations to display
   */
  limit?: number;
  
  /**
   * Callback when invitation is accepted/rejected
   */
  onUpdate?: () => void;
}

/**
 * LinkInvitationsInbox
 * 
 * Real-time display of agency link invitations with accept/reject actions.
 * 
 * @example
 * ```tsx
 * // In notifications dropdown
 * <LinkInvitationsInbox compact limit={5} />
 * 
 * // Full page view
 * <LinkInvitationsInbox />
 * ```
 */
export function LinkInvitationsInbox({
  compact = false,
  limit,
  onUpdate,
}: LinkInvitationsInboxProps) {
  const { userId } = useAuth();
  const { lang } = useSettings();
  const [invitations, setInvitations] = useState<LinkInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  // Subscribe to invitations
  useEffect(() => {
    if (!userId || !auth?.currentUser) {
      setIsLoading(false);
      return;
    }
    
    const unsubscribe = FirestoreLinkInvitationService.subscribeToReceivedInvitations(
      userId,
      (invites) => {
        const pending = invites.filter(inv => inv.status === 'pending');
        const sorted = pending.sort((a, b) => {
          const aDate = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
          const bDate = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
          return bDate.getTime() - aDate.getTime();
        });
        
        setInvitations(limit ? sorted.slice(0, limit) : sorted);
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [userId, limit]);
  
  const formatTimestamp = (timestamp: Date | any) => {
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const locale = lang === 'es' ? es : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  };
  
  const handleAccept = async (invitation: LinkInvitation) => {
    if (!userId || !auth?.currentUser) return;
    
    setProcessingIds(prev => new Set(prev).add(invitation.id));
    
    try {
      await FirestoreLinkInvitationService.acceptInvitation(
        userId,
        invitation.id,
        invitation.agencyOrgId,
        invitation.agencyUserId
      );
      
      console.log(`✅ Accepted invitation from ${invitation.agencyOrgName}`);
      onUpdate?.();
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(invitation.id);
        return next;
      });
    }
  };
  
  const handleReject = async (invitation: LinkInvitation) => {
    if (!userId || !auth?.currentUser) return;
    
    setProcessingIds(prev => new Set(prev).add(invitation.id));
    
    try {
      await FirestoreLinkInvitationService.rejectInvitation(userId, invitation.id);
      
      console.log(`✅ Rejected invitation from ${invitation.agencyOrgName}`);
      onUpdate?.();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(invitation.id);
        return next;
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className={compact ? 'p-4' : 'glass-panel p-6'}>
        <div className="flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-purple-500" />
        </div>
      </div>
    );
  }
  
  if (invitations.length === 0) {
    if (compact) return null;
    
    return (
      <div className="glass-panel p-8 text-center">
        <Mail className="h-12 w-12 text-white/30 mx-auto mb-3" />
        <p className="text-white/50">{t('invitations.noInvitations')}</p>
      </div>
    );
  }
  
  return (
    <div className={compact ? 'divide-y divide-white/10' : 'glass-panel divide-y divide-white/10'}>
      {!compact && (
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('invitations.linkInvitations')}
          </h3>
          <p className="text-white/60 text-sm mt-1">
            {t('invitations.subtitle', { count: invitations.length })}
          </p>
        </div>
      )}
      
      {invitations.map((invitation) => {
        const isProcessing = processingIds.has(invitation.id);
        const isExpired = new Date() > (invitation.expiresAt instanceof Date ? invitation.expiresAt : invitation.expiresAt.toDate());
        
        return (
          <div 
            key={invitation.id} 
            className={`${compact ? 'p-3' : 'p-4'} hover:bg-white/5 transition-colors`}
          >
            <div className="flex gap-3">
              {/* Agency Icon */}
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      {invitation.agencyOrgName}
                    </h4>
                    <p className="text-white/60 text-xs">
                      {t('invitations.sentBy')} {invitation.agencyUserName}
                    </p>
                  </div>
                  
                  {isExpired && (
                    <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                      {t('common.expired')}
                    </span>
                  )}
                </div>
                
                {invitation.message && (
                  <p className="text-white/70 text-sm mb-2 line-clamp-2">
                    "{invitation.message}"
                  </p>
                )}
                
                {/* Scopes */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {invitation.proposedScopes.shows && (
                    <ScopeBadge 
                      scope="shows" 
                      level={invitation.proposedScopes.shows} 
                    />
                  )}
                  {invitation.proposedScopes.finance && (
                    <ScopeBadge 
                      scope="finance" 
                      level={invitation.proposedScopes.finance} 
                    />
                  )}
                  {invitation.proposedScopes.travel && (
                    <ScopeBadge 
                      scope="travel" 
                      level={invitation.proposedScopes.travel} 
                    />
                  )}
                </div>
                
                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-xs text-white/40 mb-3">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(invitation.createdAt)}
                </div>
                
                {/* Actions */}
                {!isExpired && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(invitation)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg 
                                bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-medium
                                border border-green-500/20 transition-colors disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {isProcessing ? t('common.processing') : t('common.accept')}
                    </button>
                    
                    <button
                      onClick={() => handleReject(invitation)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg 
                                bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium
                                border border-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      {isProcessing ? t('common.processing') : t('common.reject')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * ScopeBadge - Shows access level for a scope
 */
function ScopeBadge({ scope, level }: { scope: string; level: string }) {
  const colorMap: Record<string, string> = {
    read: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    write: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    book: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    full: 'bg-green-500/10 text-green-400 border-green-500/20',
  };
  
  const color = colorMap[level] || colorMap.read;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      <Shield className="h-3 w-3" />
      {scope}: {level}
    </span>
  );
}

/**
 * LinkInvitationBadge - Compact badge showing invitation count
 * Useful for notification bell indicators
 */
export function LinkInvitationBadge() {
  const { userId } = useAuth();
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!userId || !auth?.currentUser) {
      setCount(0);
      return;
    }
    
    const unsubscribe = FirestoreLinkInvitationService.subscribeToReceivedInvitations(
      userId,
      (invites) => {
        const pending = invites.filter(inv => inv.status === 'pending');
        setCount(pending.length);
      }
    );
    
    return () => unsubscribe();
  }, [userId]);
  
  if (count === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
}
