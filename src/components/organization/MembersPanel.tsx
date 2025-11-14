/**
 * Members Management Panel
 * 
 * Comprehensive member management UI for organizations:
 * - List all members with roles and avatars
 * - Invite new members
 * - Change member roles
 * - Remove members
 * - Pending invitations list
 * 
 * Follows the exact design system of the app:
 * - Glass morphism effects
 * - Tailwind CSS
 * - Motion animations
 * - Consistent spacing and borders
 */

import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserPlus, Trash2, Mail, Crown, Shield, User as UserIcon, Eye, X, Check, AlertCircle } from 'lucide-react';
import { useOrganizationMembers, useInvitations, type MemberRole } from '../../hooks/useOrganizations';
import { t } from '../../lib/i18n';

interface MembersPanelProps {
  organizationId: string;
  organizationName: string;
  currentUserRole: MemberRole;
  canManageMembers: boolean;
  onClose?: () => void;
}

export const MembersPanel: React.FC<MembersPanelProps> = ({
  organizationId,
  organizationName,
  currentUserRole,
  canManageMembers,
  onClose
}) => {
  const { members, isLoading, updateMemberRole, removeMember } = useOrganizationMembers(organizationId);
  const { invitations, inviteMember, cancelInvitation } = useInvitations(organizationId);
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-slate-200 dark:border-white/10 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('members.title') || 'Team Members'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {organizationName} • {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {canManageMembers && (
                <button
                  onClick={() => setShowInviteDialog(true)}
                  className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  {t('members.invite') || 'Invite Member'}
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-lg bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Members List */}
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 bg-white/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('members.active') || 'Active Members'}
            </h2>
          </div>
          
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                currentUserRole={currentUserRole}
                canManageMembers={canManageMembers}
                onUpdateRole={(role) => updateMemberRole(member.id, role)}
                onRemove={() => setMemberToRemove(member.id)}
              />
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        {canManageMembers && invitations.length > 0 && (
          <div className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 bg-white/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('members.pending') || 'Pending Invitations'} ({invitations.length})
              </h2>
            </div>
            
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {invitations.map((invitation) => (
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
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
  currentUserRole: MemberRole;
  canManageMembers: boolean;
  onUpdateRole: (role: MemberRole) => void;
  onRemove: () => void;
}

const MemberRow: React.FC<MemberRowProps> = ({
  member,
  currentUserRole,
  canManageMembers,
  onUpdateRole,
  onRemove
}) => {
  const [isEditingRole, setIsEditingRole] = useState(false);
  const isOwner = member.role === 'owner';
  const canEdit = canManageMembers && !isOwner && currentUserRole !== 'member';

  return (
    <div className="px-6 py-4 hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between">
        {/* Member Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {member.photoURL ? (
              <img
                src={member.photoURL}
                alt={member.displayName}
                className="h-12 w-12 rounded-full ring-2 ring-slate-200 dark:ring-white/10"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-slate-200 dark:ring-white/10">
                {member.displayName[0].toUpperCase()}
              </div>
            )}
            {isOwner && (
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                <Crown className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          {/* Name & Email */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {member.displayName}
              </h3>
              {isOwner && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold">
                  Owner
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {member.email}
            </p>
          </div>
        </div>

        {/* Role & Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Role Selector/Badge */}
          {canEdit ? (
            <RoleSelector
              currentRole={member.role}
              onChange={(role) => {
                onUpdateRole(role);
                setIsEditingRole(false);
              }}
            />
          ) : (
            <RoleBadge role={member.role} />
          )}

          {/* Remove Button */}
          {canEdit && (
            <button
              onClick={onRemove}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title={t('members.remove') || 'Remove member'}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Joined Date */}
      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
        <span>
          {t('members.joined') || 'Joined'}{' '}
          {new Date(member.joinedAt).toLocaleDateString()}
        </span>
        {member.lastActive && (
          <span>
            {t('members.lastActive') || 'Last active'}{' '}
            {formatRelativeTime(member.lastActive)}
          </span>
        )}
      </div>
    </div>
  );
};

// ========================================
// Role Components
// ========================================

const RoleBadge: React.FC<{ role: MemberRole }> = ({ role }) => {
  const config = {
    owner: { icon: Crown, color: 'yellow', label: 'Owner' },
    admin: { icon: Shield, color: 'blue', label: 'Admin' },
    member: { icon: UserIcon, color: 'green', label: 'Member' },
    viewer: { icon: Eye, color: 'gray', label: 'Viewer' }
  };

  const { icon: Icon, color, label } = config[role];

  return (
    <div className={`px-3 py-1.5 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-400 text-sm font-medium flex items-center gap-2`}>
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
};

const RoleSelector: React.FC<{ currentRole: MemberRole; onChange: (role: MemberRole) => void }> = ({
  currentRole,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const roles: MemberRole[] = ['admin', 'member', 'viewer'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all"
      >
        {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-48 rounded-lg border border-slate-200 dark:border-white/10 shadow-xl z-50 overflow-hidden glass">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onChange(role);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-white/50 dark:hover:bg-white/5 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between"
                >
                  <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  {currentRole === role && <Check className="h-4 w-4 text-blue-500" />}
                </button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ========================================
// Invitation Row
// ========================================

interface InvitationRowProps {
  invitation: any;
  onCancel: () => void;
}

const InvitationRow: React.FC<InvitationRowProps> = ({ invitation, onCancel }) => {
  return (
    <div className="px-6 py-4 hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-slate-400" />
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {invitation.email}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Invited {formatRelativeTime(invitation.createdAt)} by {invitation.invitedByName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RoleBadge role={invitation.role} />
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-all"
          >
            {t('members.cancel') || 'Cancel'}
          </button>
        </div>
      </div>
    </div>
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
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
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
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
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all"
              >
                <option value="admin">Admin - Full access except org deletion</option>
                <option value="member">Member - Can edit shows and finance</option>
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
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-blue-500/30 transition-all"
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
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
      description: 'Full control, cannot be removed. Can delete organization.'
    },
    {
      role: 'admin' as MemberRole,
      icon: Shield,
      description: 'Manage members, all data access. Cannot delete organization.'
    },
    {
      role: 'member' as MemberRole,
      icon: UserIcon,
      description: 'Edit shows and finance. Cannot manage members.'
    },
    {
      role: 'viewer' as MemberRole,
      icon: Eye,
      description: 'Read-only access to all data.'
    }
  ];

  return (
    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
        {t('members.rolesInfo') || 'Role Permissions'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map(({ role, icon: Icon, description }) => (
          <div key={role} className="flex items-start gap-3 p-3 rounded-lg bg-white/30 dark:bg-white/5">
            <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
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
