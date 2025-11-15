/**
 * Organization Link Invitations Page
 * 
 * Full-featured page for managing agency-artist link invitations.
 * 
 * Features:
 * - Received invitations (for artists)
 * - Sent invitations (for agencies)
 * - Filter by status (pending, accepted, rejected, expired)
 * - Search by organization name
 * - Pagination support
 * - Accept/Reject/Cancel actions
 * - Real-time updates via Firestore
 * 
 * Use Cases:
 * - Artists review and respond to agency collaboration requests
 * - Agencies track sent invitations and their status
 * - Both parties see invitation history
 */

import React, { useState, useEffect } from 'react';
import { Building2, Send, Inbox, Check, X, Clock, Search, Filter, ChevronDown } from 'lucide-react';
import { FirestoreLinkInvitationService, type LinkInvitation } from '../../services/firestoreLinkInvitationService';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationContext } from '../../context/OrganizationContext';
import { t } from '../../lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useSettings } from '../../context/SettingsContext';

type InvitationStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'expired';
type TabType = 'received' | 'sent';

const OrgLinkInvitations: React.FC = () => {
  const { userId } = useAuth();
  const { currentOrg } = useOrganizationContext();
  const { lang } = useSettings();
  
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [receivedInvitations, setReceivedInvitations] = useState<LinkInvitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<LinkInvitation[]>([]);
  const [statusFilter, setStatusFilter] = useState<InvitationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Subscribe to received invitations
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = FirestoreLinkInvitationService.subscribeToReceivedInvitations(
      userId,
      (invites) => {
        setReceivedInvitations(invites);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Subscribe to sent invitations
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = FirestoreLinkInvitationService.subscribeToSentInvitations(
      userId,
      (invites) => {
        setSentInvitations(invites);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const formatTimestamp = (timestamp: Date | any) => {
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const locale = lang === 'es' ? es : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  };

  const isExpired = (invitation: LinkInvitation) => {
    const expiresAt = invitation.expiresAt instanceof Date 
      ? invitation.expiresAt 
      : invitation.expiresAt.toDate();
    return expiresAt < new Date() && invitation.status === 'pending';
  };

  const getEffectiveStatus = (invitation: LinkInvitation): InvitationStatus => {
    if (isExpired(invitation)) return 'expired';
    return invitation.status as InvitationStatus;
  };

  const handleAccept = async (invitation: LinkInvitation) => {
    if (!userId) return;
    
    setProcessingIds(prev => new Set(prev).add(invitation.id));
    
    try {
      await FirestoreLinkInvitationService.acceptInvitation(
        userId,
        invitation.id,
        invitation.agencyOrgId,
        invitation.artistOrgId
      );
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(invitation.id);
        return next;
      });
    }
  };

  const handleReject = async (invitation: LinkInvitation) => {
    if (!userId) return;
    
    setProcessingIds(prev => new Set(prev).add(invitation.id));
    
    try {
      await FirestoreLinkInvitationService.rejectInvitation(userId, invitation.id);
    } catch (error) {
      console.error('Failed to reject invitation:', error);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(invitation.id);
        return next;
      });
    }
  };

  const handleCancel = async (invitation: LinkInvitation) => {
    if (!userId) return;
    
    setProcessingIds(prev => new Set(prev).add(invitation.id));
    
    try {
      await FirestoreLinkInvitationService.cancelInvitation(userId, invitation.id);
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(invitation.id);
        return next;
      });
    }
  };

  const filterInvitations = (invitations: LinkInvitation[]) => {
    return invitations.filter(inv => {
      // Status filter
      if (statusFilter !== 'all') {
        const effectiveStatus = getEffectiveStatus(inv);
        if (effectiveStatus !== statusFilter) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const agencyName = inv.agencyName?.toLowerCase() || '';
        const artistName = inv.artistName?.toLowerCase() || '';
        const message = inv.message?.toLowerCase() || '';
        
        if (!agencyName.includes(query) && 
            !artistName.includes(query) && 
            !message.includes(query)) {
          return false;
        }
      }

      return true;
    });
  };

  const getStatusBadge = (invitation: LinkInvitation) => {
    const status = getEffectiveStatus(invitation);
    
    const styles = {
      pending: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      accepted: 'bg-green-500/20 text-green-300 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
      expired: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      all: ''
    };

    const labels = {
      pending: t('invitations.pending') || 'Pending',
      accepted: t('invitations.accepted') || 'Accepted',
      rejected: t('invitations.rejected') || 'Rejected',
      expired: t('common.expired') || 'Expired',
      all: ''
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const currentInvitations = activeTab === 'received' ? receivedInvitations : sentInvitations;
  const filteredInvitations = filterInvitations(currentInvitations);

  const statusCounts = {
    all: currentInvitations.length,
    pending: currentInvitations.filter(inv => getEffectiveStatus(inv) === 'pending').length,
    accepted: currentInvitations.filter(inv => inv.status === 'accepted').length,
    rejected: currentInvitations.filter(inv => inv.status === 'rejected').length,
    expired: currentInvitations.filter(inv => isExpired(inv)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('invitations.linkInvitations') || 'Link Invitations'}</h1>
          <p className="text-sm text-white/70 mt-1">
            {activeTab === 'received'
              ? t('invitations.receivedSubtitle') || 'Manage invitations from agencies'
              : t('invitations.sentSubtitle') || 'Track invitations you\'ve sent'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search') || 'Search...'}
              className="pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all w-64"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">
                {statusFilter === 'all' ? t('common.all') || 'All' : statusCounts[statusFilter]}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border border-white/10 shadow-2xl overflow-hidden z-10">
                {(['all', 'pending', 'accepted', 'rejected', 'expired'] as InvitationStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${
                      statusFilter === status ? 'bg-white/10' : ''
                    }`}
                  >
                    <span className="capitalize">
                      {status === 'all' ? t('common.all') || 'All' : status}
                    </span>
                    <span className="text-white/50 text-xs">{statusCounts[status]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'received'
              ? 'bg-accent-500 text-black font-medium'
              : 'hover:bg-white/5'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>{t('invitations.received') || 'Received'}</span>
          {receivedInvitations.filter(inv => inv.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {receivedInvitations.filter(inv => inv.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'sent'
              ? 'bg-accent-500 text-black font-medium'
              : 'hover:bg-white/5'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{t('invitations.sent') || 'Sent'}</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="glass rounded-xl border border-white/10 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/70">{t('common.loading') || 'Loading...'}</p>
        </div>
      ) : filteredInvitations.length === 0 ? (
        <div className="glass rounded-xl border border-white/10 p-12 text-center">
          <Building2 className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery || statusFilter !== 'all'
              ? t('common.noResults') || 'No results found'
              : activeTab === 'received'
                ? t('invitations.noInvitations') || 'No invitations yet'
                : t('invitations.noSentInvitations') || 'No sent invitations'}
          </h3>
          <p className="text-sm text-white/50">
            {searchQuery || statusFilter !== 'all'
              ? t('common.tryDifferentFilter') || 'Try adjusting your filters'
              : activeTab === 'received'
                ? t('invitations.noInvitationsHint') || 'You\'ll see invitations from agencies here'
                : t('invitations.noSentInvitationsHint') || 'Send invitations from the Members page'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvitations.map(invitation => {
            const isProcessing = processingIds.has(invitation.id);
            const status = getEffectiveStatus(invitation);
            const isPending = status === 'pending';
            const isReceived = activeTab === 'received';

            return (
              <div
                key={invitation.id}
                className="glass rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-accent-500" />
                      <h3 className="font-semibold">
                        {isReceived ? invitation.agencyName : invitation.artistName}
                      </h3>
                      {getStatusBadge(invitation)}
                    </div>

                    {invitation.message && (
                      <p className="text-sm text-white/70 mb-3">{invitation.message}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(invitation.createdAt)}</span>
                      </div>
                      {invitation.expiresAt && (
                        <div className="flex items-center gap-1">
                          <span>
                            {isExpired(invitation)
                              ? t('common.expired') || 'Expired'
                              : `${t('common.expires') || 'Expires'} ${formatTimestamp(invitation.expiresAt)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {isPending && (
                    <div className="flex items-center gap-2">
                      {isReceived ? (
                        <>
                          <button
                            onClick={() => handleAccept(invitation)}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:brightness-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check className="w-4 h-4" />
                            <span>{t('common.accept') || 'Accept'}</span>
                          </button>
                          <button
                            onClick={() => handleReject(invitation)}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-300 hover:bg-red-500/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                            <span>{t('common.reject') || 'Reject'}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleCancel(invitation)}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4" />
                          <span>{t('common.cancel') || 'Cancel'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      {filteredInvitations.length > 0 && (
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>
              {t('common.showing') || 'Showing'} {filteredInvitations.length} {t('common.of') || 'of'} {statusCounts.all}
            </span>
            <div className="flex items-center gap-6">
              <span>{statusCounts.pending} {t('invitations.pending') || 'pending'}</span>
              <span>{statusCounts.accepted} {t('invitations.accepted') || 'accepted'}</span>
              <span>{statusCounts.rejected} {t('invitations.rejected') || 'rejected'}</span>
              {statusCounts.expired > 0 && (
                <span>{statusCounts.expired} {t('common.expired') || 'expired'}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgLinkInvitations;
