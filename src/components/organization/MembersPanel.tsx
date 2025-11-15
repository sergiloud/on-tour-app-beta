/**
 * Members Management Panel
 * 
 * Redesigned to match the app's design system:
 * - OrgModernCards components (OrgListItem, OrgSectionHeader, etc.)
 * - PageHeader for breadcrumbs and title
 * - Glass morphism with proper gradients
 * - No emojis, icon-based UI
 * - Consistent spacing and transitions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Mail, Crown, Shield, User as UserIcon, Eye, X, Check, AlertCircle, ChevronDown, Wallet, Users, Plus, Link2, Building2, Send } from 'lucide-react';
import { useOrganizationMembers, useInvitations, type MemberRole, ROLE_DESCRIPTIONS, getModuleAccess } from '../../hooks/useOrganizations';
import { useOrg } from '../../context/OrgContext';
import { addTeam, listTeams, assignMemberToTeam, removeMemberFromTeam, type Team, type Link as AgencyArtistLink, getOrgs, listMembers as listLocalMembers } from '../../lib/tenants';
import { FirestoreLinkService } from '../../services/firestoreLinkService';
import { FirestoreLinkInvitationService, type LinkInvitation } from '../../services/firestoreLinkInvitationService';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../lib/i18n';
import PageHeader from '../common/PageHeader';
import { OrgListItem, OrgSectionHeader, OrgEmptyState } from '../org/OrgModernCards';
import { useToast } from '../../context/ToastContext';
import { logger } from '../../lib/logger';

interface MembersPanelProps {
  organizationId: string;
  organizationName: string;
  currentUserRole: MemberRole;
  canManageMembers: boolean;
}

export const MembersPanel: React.FC<MembersPanelProps> = ({
  organizationId,
  organizationName,
  currentUserRole,
  canManageMembers,
}) => {
  const { members: firebaseMembers, isLoading: isLoadingFirebase, updateMemberRole, removeMember } = useOrganizationMembers(organizationId);
  const { invitations, inviteMember, cancelInvitation } = useInvitations(organizationId);
  const { org } = useOrg();
  const { userId } = useAuth();
  const toast = useToast();
  
  // Use localStorage members if Firebase members are empty (legacy mode)
  const localMembers = React.useMemo(() => {
    if (!organizationId) return [];
    const localMembersList = listLocalMembers(organizationId);
    return localMembersList.map(m => ({
      id: m.user.id,
      email: m.user.name + '@demo.com', // Mock email for demo
      displayName: m.user.name,
      role: m.role as MemberRole,
      permissions: [],
      joinedAt: new Date(),
      invitedBy: 'system',
    }));
  }, [organizationId]);
  
  const members = firebaseMembers.length > 0 ? firebaseMembers : localMembers;
  const isLoading = isLoadingFirebase && members.length === 0;
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamForAssignment, setSelectedTeamForAssignment] = useState<string | null>(null);
  
  // Links state (Agency-Artist)
  const [showCreateLinkDialog, setShowCreateLinkDialog] = useState(false);
  const [links, setLinks] = useState<AgencyArtistLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  
  // Link invitations state
  const [sentInvitations, setSentInvitations] = useState<LinkInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<LinkInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  // Load teams on mount and when org changes
  React.useEffect(() => {
    if (org?.id) {
      const orgTeams = listTeams(org.id);
      setTeams(orgTeams);
    }
  }, [org?.id]);

  // Load links from Firestore (only for agency type orgs)
  React.useEffect(() => {
    if (!org?.id || org.type !== 'agency' || !auth) return;
    
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoadingLinks(true);
    
    // Subscribe to links in real-time
    const unsubscribe = FirestoreLinkService.subscribeToAgencyLinks(
      userId,
      org.id,
      (agencyLinks) => {
        setLinks(agencyLinks);
        setLoadingLinks(false);
        logger.info('[MembersPanel] Links loaded', { count: agencyLinks.length });
      }
    );

    return () => unsubscribe();
  }, [org?.id, org?.type]);

  // Load sent invitations (for agencies)
  React.useEffect(() => {
    if (!org?.id || org.type !== 'agency' || !userId) return;

    setLoadingInvitations(true);
    
    const unsubscribe = FirestoreLinkInvitationService.subscribeToSentInvitations(
      userId,
      (invitations) => {
        setSentInvitations(invitations);
        setLoadingInvitations(false);
        logger.info('[MembersPanel] Sent invitations loaded', { count: invitations.length });
      }
    );

    return () => unsubscribe();
  }, [org?.id, org?.type, userId]);

  // Load received invitations (for artists)
  React.useEffect(() => {
    if (!org?.id || org.type !== 'artist' || !userId) return;

    setLoadingInvitations(true);
    
    const unsubscribe = FirestoreLinkInvitationService.subscribeToReceivedInvitations(
      userId,
      (invitations) => {
        setReceivedInvitations(invitations);
        setLoadingInvitations(false);
        logger.info('[MembersPanel] Received invitations loaded', { count: invitations.length });
      }
    );

    return () => unsubscribe();
  }, [org?.id, org?.type, userId]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-6 pb-8">
      {/* Header */}
      <PageHeader
        title={t('members.title') || 'Team Members'}
        subtitle={`${organizationName} • ${members.length} ${members.length === 1 ? 'member' : 'members'}`}
        actions={
          canManageMembers ? (
            <button
              onClick={() => setShowInviteDialog(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 border border-accent-500/30 hover:border-accent-500/50 hover:from-accent-500/35 hover:via-accent-500/25 hover:to-accent-600/20 text-accent-200 font-semibold text-xs transition-all duration-300 shadow-lg shadow-accent-500/10"
            >
              <UserPlus className="w-4 h-4" />
              {t('members.invite') || 'Invite Member'}
            </button>
          ) : undefined
        }
      />

      {/* Members Grid */}
      <div className="grid grid-cols-1 gap-4 lg:gap-5">
        {/* Active Members */}
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
          <OrgSectionHeader
            title={t('members.active') || 'Active Members'}
            subtitle={`${members.length} ${members.length === 1 ? 'member' : 'members'} in your organization`}
          />
          
          {members.length === 0 ? (
            <div className="mt-4">
              <OrgEmptyState
                icon={<UserIcon className="w-5 h-5" />}
                title={t('empty.noMembers') || 'No team members yet'}
                description={t('empty.inviteHint') || 'Invite someone to get started'}
                action={canManageMembers ? {
                  label: t('members.invite') || 'Invite Member',
                  onClick: () => setShowInviteDialog(true)
                } : undefined}
              />
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {members.map((member, idx) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  index={idx}
                  currentUserRole={currentUserRole}
                  canManageMembers={canManageMembers}
                  onUpdateRole={(role) => updateMemberRole(member.id, role)}
                  onRemove={() => setMemberToRemove(member.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Teams Section */}
        {canManageMembers && (
          <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
            <OrgSectionHeader
              title={t('teams.title') || 'Teams'}
              subtitle={`${teams.length} ${teams.length === 1 ? 'team' : 'teams'} • Organize members into groups`}
              icon={<Users className="w-4 h-4 text-blue-400" />}
              action={
                <button
                  onClick={() => setShowCreateTeamDialog(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-300 font-semibold text-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('teams.create') || 'New Team'}
                </button>
              }
            />
            
            {teams.length === 0 ? (
              <div className="mt-4">
                <OrgEmptyState
                  icon={<Users className="w-5 h-5" />}
                  title={t('empty.noTeams') || 'No teams yet'}
                  description={t('empty.createTeamHint') || 'Create teams to organize your members'}
                  action={{
                    label: t('teams.create') || 'Create Team',
                    onClick: () => setShowCreateTeamDialog(true)
                  }}
                />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    members={members}
                    canManage={canManageMembers}
                    onAssignMember={(memberId) => {
                      if (assignMemberToTeam(team.id, memberId)) {
                        setTeams(listTeams(org?.id || ''));
                        toast.success('Member assigned to team');
                        logger.info('Member assigned to team', { teamId: team.id, memberId });
                      } else {
                        toast.error('Failed to assign member');
                      }
                    }}
                    onRemoveMember={(memberId) => {
                      if (removeMemberFromTeam(team.id, memberId)) {
                        setTeams(listTeams(org?.id || ''));
                        toast.success('Member removed from team');
                        logger.info('Member removed from team', { teamId: team.id, memberId });
                      } else {
                        toast.error('Failed to remove member');
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Agency-Artist Links (Only for agency orgs) */}
        {canManageMembers && org?.type === 'agency' && (
          <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
            <OrgSectionHeader
              title="Artist Connections"
              subtitle={`${links.length} artist${links.length === 1 ? '' : 's'} linked • Assign managers to oversee each artist`}
              icon={<Link2 className="w-4 h-4 text-purple-400" />}
              action={
                <button
                  onClick={() => setShowCreateLinkDialog(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-300 font-semibold text-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Link Artist
                </button>
              }
            />
            
            {loadingLinks ? (
              <div className="mt-4 text-center text-sm text-slate-400">Loading links...</div>
            ) : links.length === 0 ? (
              <div className="mt-4">
                <OrgEmptyState
                  icon={<Link2 className="w-5 h-5" />}
                  title="No artist connections yet"
                  description="Link with artist organizations to manage their tours"
                  action={{
                    label: 'Link Artist',
                    onClick: () => setShowCreateLinkDialog(true)
                  }}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {links.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    members={members}
                    canManage={canManageMembers}
                    onAssignManager={async (managerId: string) => {
                      const manager = members.find(m => m.id === managerId);
                      if (!manager || !auth?.currentUser) return;
                      
                      try {
                        await FirestoreLinkService.assignManager(
                          auth.currentUser.uid,
                          link.id,
                          manager.id,
                          manager.email,
                          manager.displayName
                        );
                        toast.success('Manager assigned to artist');
                        logger.info('Manager assigned to link', { linkId: link.id, managerId });
                      } catch (error) {
                        toast.error('Failed to assign manager');
                        logger.error('Failed to assign manager', error as Error);
                      }
                    }}
                    onUnassignManager={async () => {
                      if (!auth?.currentUser) return;
                      
                      try {
                        await FirestoreLinkService.unassignManager(auth.currentUser.uid, link.id);
                        toast.success('Manager unassigned');
                        logger.info('Manager unassigned from link', { linkId: link.id });
                      } catch (error) {
                        toast.error('Failed to unassign manager');
                        logger.error('Failed to unassign manager', error as Error);
                      }
                    }}
                    onDelete={async () => {
                      if (!auth?.currentUser || !confirm(`Remove link with ${link.artistOrgName}?`)) return;
                      
                      try {
                        await FirestoreLinkService.deleteLink(auth.currentUser.uid, link.id);
                        toast.success('Artist link removed');
                        logger.info('Link deleted', { linkId: link.id });
                      } catch (error) {
                        toast.error('Failed to remove link');
                        logger.error('Failed to delete link', error as Error);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Sent Invitations (Agency View) */}
        {org?.type === 'agency' && canManageMembers && sentInvitations.length > 0 && (
          <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-orange-50 dark:from-orange-900/10 to-white/3 hover:border-orange-300 dark:hover:border-orange-500/20 transition-all duration-300">
            <OrgSectionHeader
              title="Pending Invitations"
              subtitle={`${sentInvitations.filter(i => i.status === 'pending').length} awaiting artist response`}
              icon={<Mail className="w-4 h-4 text-orange-400" />}
            />
            <div className="mt-4 space-y-3">
              {sentInvitations
                .filter(i => i.status === 'pending')
                .map((invitation) => (
                  <div
                    key={invitation.id}
                    className="glass rounded-lg border border-slate-200 dark:border-white/10 p-3 bg-white/50 dark:bg-white/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            Artist User ID: {invitation.artistUserId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Sent {invitation.createdAt instanceof Date ? invitation.createdAt.toLocaleDateString() : invitation.createdAt.toDate().toLocaleDateString()} • 
                          Expires {invitation.expiresAt instanceof Date ? invitation.expiresAt.toLocaleDateString() : invitation.expiresAt.toDate().toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          if (!userId || !confirm('Cancel this invitation?')) return;
                          try {
                            await FirestoreLinkInvitationService.cancelInvitation(userId, invitation.id);
                            toast.success('Invitation cancelled');
                          } catch (error) {
                            toast.error('Failed to cancel invitation');
                            logger.error('Failed to cancel invitation', error as Error);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Received Invitations (Artist View) */}
        {org?.type === 'artist' && receivedInvitations.length > 0 && (
          <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-blue-50 dark:from-blue-900/10 to-white/3 hover:border-blue-300 dark:hover:border-blue-500/20 transition-all duration-300">
            <OrgSectionHeader
              title="Agency Invitations"
              subtitle={`${receivedInvitations.filter(i => i.status === 'pending').length} pending invitation${receivedInvitations.filter(i => i.status === 'pending').length === 1 ? '' : 's'}`}
              icon={<Mail className="w-4 h-4 text-blue-400" />}
            />
            <div className="mt-4 space-y-3">
              {receivedInvitations
                .filter(i => i.status === 'pending')
                .map((invitation) => (
                  <div
                    key={invitation.id}
                    className="glass rounded-lg border border-slate-200 dark:border-white/10 p-4 bg-white/50 dark:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-5 h-5 text-blue-400" />
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {invitation.agencyOrgName}
                          </h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                          wants to manage your organization
                        </p>
                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                          <p>From: {invitation.agencyUserEmail || invitation.agencyUserName}</p>
                          <p>Sent: {invitation.createdAt instanceof Date ? invitation.createdAt.toLocaleDateString() : invitation.createdAt.toDate().toLocaleDateString()}</p>
                          <p>Expires: {invitation.expiresAt instanceof Date ? invitation.expiresAt.toLocaleDateString() : invitation.expiresAt.toDate().toLocaleDateString()}</p>
                        </div>
                        <div className="mt-2 text-xs">
                          <p className="text-slate-500 dark:text-slate-400 mb-1">Proposed access:</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(invitation.proposedScopes).map(([key, value]) => (
                              <span
                                key={key}
                                className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={async () => {
                            if (!userId || !org?.id || !org?.name) return;
                            try {
                              await FirestoreLinkInvitationService.acceptInvitation(
                                userId,
                                invitation.id,
                                org.id,
                                org.name
                              );
                              toast.success('Invitation accepted! Agency can now manage your organization.');
                            } catch (error) {
                              toast.error('Failed to accept invitation');
                              logger.error('Failed to accept invitation', error as Error);
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-green-500/80 border border-green-500/40 text-white text-sm font-semibold hover:bg-green-500 transition-colors shadow-lg shadow-green-500/20"
                        >
                          Accept
                        </button>
                        <button
                          onClick={async () => {
                            if (!userId || !confirm('Reject this invitation?')) return;
                            try {
                              await FirestoreLinkInvitationService.rejectInvitation(userId, invitation.id);
                              toast.success('Invitation rejected');
                            } catch (error) {
                              toast.error('Failed to reject invitation');
                              logger.error('Failed to reject invitation', error as Error);
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Pending Invitations */}
        {canManageMembers && invitations.length > 0 && (
          <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
            <OrgSectionHeader
              title={t('members.pending') || 'Pending Invitations'}
              subtitle={`${invitations.length} invitation${invitations.length === 1 ? '' : 's'} awaiting response`}
              icon={<Mail className="w-4 h-4 text-accent-400" />}
            />
            <div className="mt-4 space-y-2">
              {invitations.map((invitation, idx) => (
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
                  index={idx}
                  onCancel={() => cancelInvitation(invitation.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Role Legend */}
        <RoleLegend />
      </div>

      {/* Invite Dialog */}
      <AnimatePresence>
        {showInviteDialog && (
          <InviteMemberDialog
            organizationId={organizationId}
            organizationName={organizationName}
            onClose={() => setShowInviteDialog(false)}
            onInvite={inviteMember}
          />
        )}
      </AnimatePresence>

      {/* Remove Confirmation */}
      <AnimatePresence>
        {memberToRemove && (
          <RemoveConfirmationDialog
            memberName={members.find(m => m.id === memberToRemove)?.displayName || ''}
            onConfirm={() => {
              removeMember(memberToRemove);
              setMemberToRemove(null);
            }}
            onCancel={() => setMemberToRemove(null)}
          />
        )}
      </AnimatePresence>

      {/* Create Team Dialog */}
      <AnimatePresence>
        {showCreateTeamDialog && org && (
          <CreateTeamDialog
            orgId={org.id}
            onClose={() => setShowCreateTeamDialog(false)}
            onCreate={(teamName) => {
              const result = addTeam(org.id, teamName);
              if (result) {
                setTeams(listTeams(org.id));
                toast.success(`Team "${teamName}" created`);
                logger.info('Team created', { teamId: result.teamId, teamName, orgId: org.id });
                setShowCreateTeamDialog(false);
              } else {
                toast.error('Failed to create team');
              }
            }}
          />
        )}
        
        {/* Create Link Dialog */}
        {showCreateLinkDialog && org && (
          <CreateLinkDialog
            open={showCreateLinkDialog}
            agencyOrgId={org.id}
            agencyOrgName={org.name}
            onClose={() => setShowCreateLinkDialog(false)}
            onCreate={async (artistUserId: string) => {
              const userId = auth?.currentUser?.uid;
              const userName = auth?.currentUser?.displayName || 'Unknown';
              const userEmail = auth?.currentUser?.email || '';
              
              if (!userId) {
                toast.error('User not authenticated');
                return;
              }

              try {
                await FirestoreLinkInvitationService.sendInvitation(
                  userId,
                  org.id,
                  org.name,
                  userName,
                  userEmail,
                  artistUserId
                );
                
                toast.success('Invitation sent to artist');
                logger.info('Invitation sent', { agencyUserId: userId, artistUserId });
                setShowCreateLinkDialog(false);
              } catch (error) {
                toast.error('Failed to send invitation');
                logger.error('Failed to send invitation', error as Error);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ========================================
// Member Row Component
// ========================================

interface MemberRowProps {
  member: any;
  index: number;
  currentUserRole: MemberRole;
  canManageMembers: boolean;
  onUpdateRole: (role: MemberRole) => void;
  onRemove: () => void;
}

const MemberRow: React.FC<MemberRowProps> = ({
  member,
  index,
  currentUserRole,
  canManageMembers,
  onUpdateRole,
  onRemove
}) => {
  const isOwner = member.role === 'owner';
  const canEdit = canManageMembers && !isOwner && currentUserRole !== 'member';

  const roleConfig = {
    owner: { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/20' },
    admin: { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20' },
    finance: { icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20' },
    member: { icon: UserIcon, color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/20' },
    viewer: { icon: Eye, color: 'text-gray-400', bg: 'bg-gray-500/15', border: 'border-gray-500/20' }
  };

  const config = roleConfig[member.role as MemberRole] || roleConfig.member;
  const RoleIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <OrgListItem
        title={member.displayName}
        subtitle={member.email}
        icon={
          member.photoURL ? (
            <img
              src={member.photoURL}
              alt={member.displayName}
              className="w-8 h-8 rounded-full ring-2 ring-slate-200 dark:ring-white/10"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500/30 to-accent-600/20 flex items-center justify-center text-xs font-semibold text-accent-200 border border-accent-500/20">
              {member.displayName[0].toUpperCase()}
            </div>
          )
        }
        value={
          <div className="flex items-center gap-2">
            {canEdit ? (
              <RoleSelector
                currentRole={member.role}
                onChange={onUpdateRole}
              />
            ) : (
              <span className={`px-2.5 py-1 rounded-lg ${config.bg} border ${config.border} text-xs font-semibold ${config.color} flex items-center gap-1.5`}>
                <RoleIcon className="w-3.5 h-3.5" />
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
            )}
            {canEdit && (
              <button
                onClick={onRemove}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title={t('members.remove') || 'Remove member'}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        }
        interactive
      />
    </motion.div>
  );
};

// ========================================
// Role Selector
// ========================================

const RoleSelector: React.FC<{ currentRole: MemberRole; onChange: (role: MemberRole) => void }> = ({
  currentRole,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const roles: Array<'admin' | 'finance' | 'member' | 'viewer'> = ['admin', 'finance', 'member', 'viewer'];

  const roleConfig: Record<'admin' | 'finance' | 'member' | 'viewer', { icon: any; label: string; desc: string }> = {
    admin: { 
      icon: Shield, 
      label: 'Admin',
      desc: 'Full access except org deletion'
    },
    finance: {
      icon: Wallet,
      label: 'Finance Manager',
      desc: 'Full finance, read-only other modules'
    },
    member: { 
      icon: UserIcon, 
      label: 'Member',
      desc: 'Can edit shows, calendar, travel'
    },
    viewer: { 
      icon: Eye, 
      label: 'Viewer',
      desc: 'Read-only access to all data'
    }
  };

  const CurrentIcon = (currentRole !== 'owner' && roleConfig[currentRole as 'admin' | 'finance' | 'member' | 'viewer']?.icon) || UserIcon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center gap-2"
      >
        <CurrentIcon className="w-3.5 h-3.5" />
        {currentRole === 'finance' ? 'Finance' : currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-72 glass rounded-lg border border-slate-200 dark:border-white/10 shadow-xl z-50 overflow-hidden">
            {roles.map((role) => {
              const { icon: Icon, label, desc } = roleConfig[role];
              return (
                <button
                  key={role}
                  onClick={() => {
                    onChange(role as MemberRole);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        {label}
                        {currentRole === role && <Check className="h-3.5 w-3.5 text-accent-500 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {desc}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ========================================
// Invitation Row
// ========================================

interface InvitationRowProps {
  invitation: any;
  index: number;
  onCancel: () => void;
}

const InvitationRow: React.FC<InvitationRowProps> = ({ invitation, index, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <OrgListItem
        title={invitation.email}
        subtitle={`Invited ${formatRelativeTime(invitation.createdAt)} by ${invitation.invitedByName || 'Admin'}`}
        icon={
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
            <Mail className="h-4 w-4 text-slate-400" />
          </div>
        }
        value={
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/20 text-xs font-semibold text-blue-400">
              {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
            </span>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-all"
            >
              {t('members.cancel') || 'Cancel'}
            </button>
          </div>
        }
        interactive
      />
    </motion.div>
  );
};

// ========================================
// Invite Dialog
// ========================================

interface InviteMemberDialogProps {
  organizationId: string;
  organizationName: string;
  onClose: () => void;
  onInvite: (email: string, role: MemberRole, orgName: string) => Promise<void>;
}

const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  organizationId,
  organizationName,
  onClose,
  onInvite
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await onInvite(email, role, organizationName);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative rounded-xl w-full max-w-md glass border border-slate-200 dark:border-white/10 shadow-2xl"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('members.inviteTitle') || 'Invite Team Member'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t('members.email') || 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500 dark:focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t('members.role') || 'Role'}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as MemberRole)}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500 dark:focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20 text-slate-900 dark:text-white transition-all"
              >
                <option value="admin">Admin - Full access except org deletion</option>
                <option value="finance">Finance Manager - Full finance, read-only other modules</option>
                <option value="member">Member - Can edit shows, calendar, travel</option>
                <option value="viewer">Viewer - Read-only access</option>
              </select>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('members.inviteHint') || 'An invitation email will be sent to this address.'}
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold transition-all"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-500/90 to-accent-600/90 hover:from-accent-500 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-accent-500/30 transition-all"
              >
                {isSubmitting ? (t('common.sending') || 'Sending...') : (t('members.sendInvite') || 'Send Invitation')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ========================================
// Remove Confirmation Dialog
// ========================================

interface RemoveConfirmationDialogProps {
  memberName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const RemoveConfirmationDialog: React.FC<RemoveConfirmationDialogProps> = ({
  memberName,
  onConfirm,
  onCancel
}) => {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onCancel}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative rounded-xl w-full max-w-sm glass border border-slate-200 dark:border-white/10 shadow-2xl"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t('members.removeTitle') || 'Remove Member'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t('members.removeConfirm') || 'Are you sure you want to remove'} <strong>{memberName}</strong>?
                  {' '}{t('members.removeWarning') || 'They will lose access immediately.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold transition-all"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg shadow-red-500/30 transition-all"
              >
                {t('members.removeButton') || 'Remove Member'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ========================================
// Role Legend
// ========================================

const RoleLegend: React.FC = () => {
  const roles = [
    {
      role: 'owner' as MemberRole,
      icon: Crown,
      color: 'text-yellow-400',
      description: 'Full control, cannot be removed. Can delete organization.'
    },
    {
      role: 'admin' as MemberRole,
      icon: Shield,
      color: 'text-blue-400',
      description: 'Manage members, all data access. Cannot delete organization.'
    },
    {
      role: 'finance' as MemberRole,
      icon: Wallet,
      color: 'text-emerald-400',
      description: 'Full finance access (create, edit, delete, export). Read-only for other modules.'
    },
    {
      role: 'member' as MemberRole,
      icon: UserIcon,
      color: 'text-green-400',
      description: 'Edit shows, calendar, travel. Read-only finance.'
    },
    {
      role: 'viewer' as MemberRole,
      icon: Eye,
      color: 'text-gray-400',
      description: 'Read-only access to all data.'
    }
  ];

  return (
    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
      <div className="text-xs font-semibold text-slate-500 dark:text-white/70 mb-4 uppercase tracking-wider">
        {t('members.rolesInfo') || 'Role Permissions'}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map(({ role, icon: Icon, color, description }) => (
          <div key={role} className="flex items-start gap-3 p-3 rounded-lg bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/8 transition-colors">
            <Icon className={`h-5 w-5 ${color} flex-shrink-0 mt-0.5`} />
            <div>
              <div className="font-semibold text-sm text-slate-900 dark:text-white capitalize">
                {role}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========================================
// Link Card Component (Agency-Artist)
// ========================================

interface LinkCardProps {
  link: AgencyArtistLink;
  members: any[];
  canManage: boolean;
  onAssignManager: (managerId: string) => Promise<void>;
  onUnassignManager: () => Promise<void>;
  onDelete: () => Promise<void>;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, members, canManage, onAssignManager, onUnassignManager, onDelete }) => {
  const [showManagerMenu, setShowManagerMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const assignedManager = members.find(m => m.id === link.assignedManagerId);
  const availableManagers = members.filter(m => m.role === 'admin' || m.role === 'member');

  const handleAssignManager = async (managerId: string) => {
    setIsUpdating(true);
    try {
      await onAssignManager(managerId);
      setShowManagerMenu(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Artist Icon */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-purple-600/20 flex items-center justify-center border border-purple-500/20 flex-shrink-0">
            <Building2 className="w-5 h-5 text-purple-300" />
          </div>
          
          {/* Artist Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {link.artistOrgName || link.artistOrgId}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                link.status === 'active' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
              }`}>
                {link.status}
              </span>
              
              {/* Assigned Manager Badge */}
              {assignedManager ? (
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Managed by <strong>{assignedManager.displayName}</strong>
                </span>
              ) : (
                <span className="text-xs text-orange-500 dark:text-orange-400">
                  No manager assigned
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex items-center gap-2 ml-3">
            {/* Assign/Change Manager */}
            <div className="relative">
              <button
                onClick={() => setShowManagerMenu(!showManagerMenu)}
                disabled={isUpdating}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold transition-all disabled:opacity-50"
              >
                {assignedManager ? 'Change' : 'Assign'} Manager
              </button>
              
              {showManagerMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowManagerMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-xl z-20 max-h-60 overflow-y-auto">
                    {assignedManager && (
                      <>
                        <button
                          onClick={async () => {
                            setIsUpdating(true);
                            try {
                              await onUnassignManager();
                              setShowManagerMenu(false);
                            } finally {
                              setIsUpdating(false);
                            }
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-b border-slate-200 dark:border-white/10"
                        >
                          Unassign {assignedManager.displayName}
                        </button>
                      </>
                    )}
                    
                    {availableManagers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        No managers available
                      </div>
                    ) : (
                      availableManagers.map(manager => (
                        <button
                          key={manager.id}
                          onClick={() => handleAssignManager(manager.id)}
                          disabled={isUpdating}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                          {manager.displayName}
                          <span className="ml-auto text-xs text-slate-400">{manager.role}</span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Delete Link */}
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
              title="Remove link"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Permissions/Scopes Summary */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
        <div className="flex flex-wrap gap-1.5">
          {link.scopes.shows !== 'read' && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
              Shows: {link.scopes.shows}
            </span>
          )}
          {link.scopes.finance !== 'none' && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs border border-green-500/30">
              Finance: {link.scopes.finance}
            </span>
          )}
          {link.scopes.travel !== 'read' && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">
              Travel: {link.scopes.travel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ========================================
// Team Card Component
// ========================================

interface TeamCardProps {
  team: Team;
  members: any[];
  canManage: boolean;
  onAssignMember: (memberId: string) => void;
  onRemoveMember: (memberId: string) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, members, canManage, onAssignMember, onRemoveMember }) => {
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  
  const teamMembers = members.filter(m => team.members.includes(m.id));
  const availableMembers = members.filter(m => !team.members.includes(m.id));

  return (
    <div className="p-4 rounded-lg bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex items-center justify-center border border-blue-500/20">
            <Users className="w-4 h-4 text-blue-300" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{team.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{team.members.length} members</p>
          </div>
        </div>
      </div>

      {teamMembers.length > 0 ? (
        <div className="space-y-1.5 mb-3">
          {teamMembers.slice(0, 3).map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-6 h-6 rounded-full bg-accent-500/20 border border-accent-500/40 text-accent-100 text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                  {member.displayName?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="text-xs text-slate-700 dark:text-white/80 truncate">{member.displayName}</span>
              </div>
              {canManage && (
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                  title="Remove from team"
                >
                  <X className="w-3 h-3 text-red-400" />
                </button>
              )}
            </div>
          ))}
          {teamMembers.length > 3 && (
            <p className="text-xs text-slate-400 dark:text-white/50 pl-2 pt-1">+{teamMembers.length - 3} more</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-white/50 italic mb-3">No members assigned yet</p>
      )}

      {canManage && availableMembers.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowAssignMenu(!showAssignMenu)}
            className="w-full px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-300 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Assign Member
          </button>
          
          {showAssignMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAssignMenu(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 shadow-xl z-20 max-h-48 overflow-y-auto">
                {availableMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      onAssignMember(member.id);
                      setShowAssignMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent-500/20 border border-accent-500/40 text-accent-100 text-[10px] font-semibold flex items-center justify-center">
                      {member.displayName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-white">{member.displayName}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ========================================
// Create Team Dialog Component
// ========================================

interface CreateTeamDialogProps {
  orgId: string;
  onClose: () => void;
  onCreate: (teamName: string) => void;
}

const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({ orgId, onClose, onCreate }) => {
  const [teamName, setTeamName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      onCreate(teamName.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-xl border border-slate-200 dark:border-white/10 w-full max-w-md shadow-2xl p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              {t('teams.createTitle') || 'Create New Team'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('teams.createSubtitle') || 'Organize members into teams for better collaboration'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
              Team Name *
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-fast"
              placeholder="e.g., Tour Managers, Production Crew"
              maxLength={50}
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-slate-300 dark:hover:border-white/20 font-semibold transition-fast"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!teamName.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/80 to-blue-600/60 border border-blue-500/40 text-white font-semibold hover:from-blue-500 hover:to-blue-600 transition-fast disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================
// Create Link Dialog Component (Agency-Artist)
// ========================================

interface CreateLinkDialogProps {
  open: boolean;
  agencyOrgId: string;
  agencyOrgName: string;
  onClose: () => void;
  onCreate: (artistUserId: string) => Promise<void>;
}

const CreateLinkDialog: React.FC<CreateLinkDialogProps> = ({ open, agencyOrgId, agencyOrgName, onClose, onCreate }) => {
  const [artistUserId, setArtistUserId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistUserId.trim()) return;

    setIsCreating(true);
    try {
      await onCreate(artistUserId.trim());
      setArtistUserId('');
    } finally {
      setIsCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-xl border border-slate-200 dark:border-white/10 w-full max-w-md shadow-2xl p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" />
              Send Invitation to Artist
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter the artist's User ID from their Account Information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
              Artist User ID *
            </label>
            <input
              type="text"
              value={artistUserId}
              onChange={(e) => setArtistUserId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-purple-500/50 focus:outline-none transition-fast"
              placeholder="e.g., ooaTPnc4KvSzsW0xxfqn0dLvKU92"
              required
              autoFocus
            />
            <p className="text-xs text-slate-400 dark:text-white/40 mt-1.5">
              The artist can find their User ID in Account → Account Information
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-slate-300 dark:hover:border-white/20 font-semibold transition-fast disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!artistUserId.trim() || isCreating}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/80 to-purple-600/60 border border-purple-500/40 text-white font-semibold hover:from-purple-500 hover:to-purple-600 transition-fast disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
            >
              {isCreating ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================
// Loading Skeleton
// ========================================

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-6 pb-8">
      <div className="h-20 bg-white/50 dark:bg-white/5 rounded-xl animate-pulse" />
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================
// Utilities
// ========================================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
