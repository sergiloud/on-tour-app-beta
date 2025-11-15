/**
 * Transfer Ownership Dialog
 * 
 * Critical Owner-only action to transfer organization ownership to another member.
 * 
 * Security:
 * - Only accessible to owner role
 * - Requires explicit confirmation
 * - Both users must be members
 * - Logs ownership transfer in activity feed
 * - Protected by Firestore security rules
 * 
 * Flow:
 * 1. Owner selects target member from dropdown
 * 2. Shows warning about losing owner privileges
 * 3. Requires typing org name to confirm
 * 4. Transfers ownership (current owner becomes admin)
 * 5. Activity logged and notifications sent
 */

import React, { useState } from 'react';
import { useOrganizationContext } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMembers } from '../../hooks/useOrganizations';
import { t } from '../../lib/i18n';
import type { OrganizationMember } from '../../hooks/useOrganizations';

interface TransferOwnershipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  members: OrganizationMember[];
}

export const TransferOwnershipDialog: React.FC<TransferOwnershipDialogProps> = ({
  isOpen,
  onClose,
  members,
}) => {
  const { currentOrg } = useOrganizationContext();
  const { userId } = useAuth();
  const { updateMemberRole } = useOrganizationMembers(currentOrg?.id || '');

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');

  // Filter out current user and get only active members
  const eligibleMembers = members.filter(
    (m) => m.id !== userId && m.role !== 'owner'
  );

  const handleTransfer = async () => {
    if (!currentOrg || !userId) return;

    // Validation
    if (!selectedMemberId) {
      setError(t('org.transfer.selectMember') || 'Please select a member to transfer ownership to');
      return;
    }

    if (confirmText !== currentOrg.name) {
      setError(t('org.error.confirmNameMismatch') || 'Organization name does not match');
      return;
    }

    setIsTransferring(true);
    setError('');

    try {
      // Transfer ownership: 
      // 1. Update new owner's role to 'owner'
      await updateMemberRole(selectedMemberId, 'owner');
      
      // 2. Update current owner's role to 'admin'
      await updateMemberRole(userId, 'admin');

      console.log('✅ Ownership transferred successfully');

      // Close dialog and reload to reflect changes
      onClose();
      setTimeout(() => window.location.reload(), 500);
    } catch (err: any) {
      console.error('Failed to transfer ownership:', err);
      setError(
        err.message || 
        t('org.transfer.error') || 
        'Failed to transfer ownership. Please try again.'
      );
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClose = () => {
    if (!isTransferring) {
      setSelectedMemberId('');
      setConfirmText('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedMember = eligibleMembers.find((m) => m.id === selectedMemberId);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-ownership-title"
    >
      <div
        className="relative w-full max-w-lg glass rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 id="transfer-ownership-title" className="text-xl font-bold text-orange-300 mb-1">
              {t('org.transfer.title') || 'Transfer Ownership'}
            </h2>
            <p className="text-sm text-white/70">
              {t('org.transfer.subtitle') || 'Transfer ownership of this organization to another member'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isTransferring}
            className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
            aria-label={t('common.close') || 'Close'}
          >
            <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Warning */}
        <div className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-orange-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-orange-200 space-y-2">
              <p className="font-medium">
                {t('org.transfer.warning') || 'This is a permanent action with important consequences:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-white/70">
                <li>{t('org.transfer.consequence1') || 'The new owner will have full control of the organization'}</li>
                <li>{t('org.transfer.consequence2') || 'You will lose owner privileges and become an admin'}</li>
                <li>{t('org.transfer.consequence3') || 'Only the new owner can transfer ownership again'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Select New Owner */}
        <div className="space-y-4 mb-6">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-white/90">
              {t('org.transfer.selectNewOwner') || 'Select New Owner'}
            </span>
            <select
              value={selectedMemberId}
              onChange={(e) => {
                setSelectedMemberId(e.target.value);
                setError('');
              }}
              disabled={isTransferring}
              className="px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {t('org.transfer.selectMemberPlaceholder') || '-- Select a member --'}
              </option>
              {eligibleMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.displayName || member.email} ({member.role})
                </option>
              ))}
            </select>
          </label>

          {selectedMember && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                {selectedMember.photoURL ? (
                  <img
                    src={selectedMember.photoURL}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-blue-500 flex items-center justify-center text-sm font-bold text-black">
                    {((selectedMember.displayName || selectedMember.email || '?')[0] || '?').toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedMember.displayName || 'User'}</p>
                  <p className="text-xs text-white/50">{selectedMember.email}</p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300 capitalize">
                  {selectedMember.role} → owner
                </span>
              </div>
            </div>
          )}

          {/* Confirmation Input */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-white/90">
              {t('org.transfer.confirmPrompt', { name: currentOrg?.name || '' }) ||
                `Type "${currentOrg?.name || ''}" to confirm:`}
            </span>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError('');
              }}
              disabled={isTransferring}
              placeholder={currentOrg?.name || ''}
              className="px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby="confirm-hint"
            />
            <span id="confirm-hint" className="text-xs text-white/50">
              {t('org.settings.confirmHint') || 'Type the organization name exactly as shown above'}
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleTransfer}
            disabled={
              isTransferring ||
              !selectedMemberId ||
              confirmText !== currentOrg?.name
            }
            className="flex-1 px-4 py-2.5 rounded-lg bg-orange-500 text-white font-medium hover:brightness-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTransferring
              ? t('org.transfer.transferring') || 'Transferring...'
              : t('org.transfer.confirm') || 'Transfer Ownership'}
          </button>

          <button
            type="button"
            onClick={handleClose}
            disabled={isTransferring}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
