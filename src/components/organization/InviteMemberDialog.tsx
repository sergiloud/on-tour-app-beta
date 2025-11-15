/**
 * Invite Member Dialog
 * 
 * Modal for inviting new members to an organization:
 * - Email input with validation
 * - Role selection dropdown
 * - Permissions preview (shows what the role can do)
 * - Toast notifications for success/error
 * - Integrates with useInvitations hook
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, UserPlus, Shield, Eye, Crown, Wallet, AlertCircle, Check } from 'lucide-react';
import { type MemberRole, ROLE_DESCRIPTIONS, getModuleAccess } from '../../hooks/useOrganizations';
import { useToast } from '../../context/ToastContext';
import { t } from '../../lib/i18n';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: MemberRole) => Promise<void>;
  organizationName: string;
}

const ROLE_ICONS: Record<MemberRole, React.ReactNode> = {
  owner: <Crown className="w-4 h-4" />,
  admin: <Shield className="w-4 h-4" />,
  finance: <Wallet className="w-4 h-4" />,
  member: <UserPlus className="w-4 h-4" />,
  viewer: <Eye className="w-4 h-4" />,
};

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  isOpen,
  onClose,
  onInvite,
  organizationName,
}) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const toast = useToast();

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) return;

    setIsSubmitting(true);
    try {
      await onInvite(email.trim().toLowerCase(), selectedRole);
      
      toast.success(`Invitation sent to ${email}`, {
        description: `They will receive an email to join ${organizationName}`,
      });

      // Reset form
      setEmail('');
      setSelectedRole('member');
      onClose();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast.error('Failed to send invitation', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setEmail('');
    setSelectedRole('member');
    setEmailError('');
    onClose();
  };

  const moduleAccess = getModuleAccess(selectedRole);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{t('members.invite') || 'Invite Member'}</h2>
                    <p className="text-xs text-slate-500 dark:text-white/50">
                      {organizationName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    <Mail className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) validateEmail(e.target.value);
                    }}
                    onBlur={() => validateEmail(email)}
                    placeholder="colleague@example.com"
                    className={`w-full px-4 py-2.5 rounded-lg glass border ${
                      emailError
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-slate-200 dark:border-white/10 focus:border-accent-500'
                    } focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all`}
                    disabled={isSubmitting}
                    required
                  />
                  {emailError && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    <Shield className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />
                    Role
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(ROLE_DESCRIPTIONS) as MemberRole[]).map((role) => {
                      if (role === 'owner') return null; // Can't invite as owner
                      
                      const roleInfo = ROLE_DESCRIPTIONS[role];
                      const isSelected = selectedRole === role;

                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          disabled={isSubmitting}
                          className={`text-left p-3 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-accent-500 bg-accent-500/10'
                              : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 ${isSelected ? 'text-accent-400' : 'opacity-60'}`}>
                              {ROLE_ICONS[role]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium capitalize">{roleInfo.label}</span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-accent-500" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                                {roleInfo.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="p-4 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="text-xs font-semibold text-slate-600 dark:text-white/60 mb-2 uppercase tracking-wide">
                    Permissions Preview
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <PermissionItem label="Finance" level={moduleAccess.finance} />
                    <PermissionItem label="Shows" level={moduleAccess.shows} />
                    <PermissionItem label="Calendar" level={moduleAccess.calendar} />
                    <PermissionItem label="Travel" level={moduleAccess.travel} />
                    <PermissionItem label="Contacts" level={moduleAccess.contacts} />
                    <PermissionItem label="Contracts" level={moduleAccess.contracts} />
                    <PermissionItem label="Members" level={moduleAccess.members} />
                    <PermissionItem label="Settings" level={moduleAccess.settings} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !email || !!emailError}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper component for permission display
const PermissionItem: React.FC<{ label: string; level: string }> = ({ label, level }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'full':
      case 'manage':
        return 'text-green-500';
      case 'write':
        return 'text-blue-500';
      case 'read':
        return 'text-amber-500';
      default:
        return 'text-slate-400';
    }
  };

  const getLevelLabel = (level: string) => {
    if (level === 'none') return '—';
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600 dark:text-white/60">{label}</span>
      <span className={`font-medium ${getLevelColor(level)}`}>
        {getLevelLabel(level)}
      </span>
    </div>
  );
};
