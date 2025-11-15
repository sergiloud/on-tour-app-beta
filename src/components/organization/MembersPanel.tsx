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
import { UserPlus, Trash2, Mail, Crown, Shield, User as UserIcon, Eye, X, Check, AlertCircle, ChevronDown, Wallet } from 'lucide-react';
import { useOrganizationMembers, useInvitations, type MemberRole, ROLE_DESCRIPTIONS, getModuleAccess } from '../../hooks/useOrganizations';
import { t } from '../../lib/i18n';
import PageHeader from '../common/PageHeader';
import { OrgListItem, OrgSectionHeader, OrgEmptyState } from '../org/OrgModernCards';

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
  const { members, isLoading, updateMemberRole, removeMember } = useOrganizationMembers(organizationId);
  const { invitations, inviteMember, cancelInvitation } = useInvitations(organizationId);
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

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
