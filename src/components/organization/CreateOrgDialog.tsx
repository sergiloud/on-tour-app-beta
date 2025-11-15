/**
 * Create Organization Dialog
 * 
 * Modal dialog for creating a new organization.
 * Allows users to set name, type, and initial settings.
 */

import React, { useState } from 'react';
import { X, Building2, Users, Music, MapPin, Briefcase, AlertCircle } from 'lucide-react';
import { createOrganization, type OrganizationType } from '../../hooks/useOrganizations';
import { t } from '../../lib/i18n';

interface CreateOrgDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (orgId: string) => void;
}

const ORG_TYPES: Array<{ value: OrganizationType; label: string; icon: any; description: string }> = [
  {
    value: 'tour',
    label: 'Tour',
    icon: Music,
    description: 'Manage a music tour with shows, venues, and finances'
  },
  {
    value: 'band',
    label: 'Band',
    icon: Users,
    description: 'Organize a band with members and events'
  },
  {
    value: 'venue',
    label: 'Venue',
    icon: MapPin,
    description: 'Manage a venue with bookings and events'
  },
  {
    value: 'agency',
    label: 'Agency',
    icon: Briefcase,
    description: 'Agency managing multiple artists and tours'
  },
];

export const CreateOrgDialog: React.FC<CreateOrgDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<OrganizationType>('tour');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const orgId = await createOrganization(
        name.trim(),
        type,
        {
          currency: 'EUR',
          timezone: 'Europe/Madrid',
          defaultRole: 'member',
          locale: 'en',
          features: {
            finance: true,
            calendar: true,
            travel: true,
            crm: true,
          },
        }
      );

      // Success!
      if (onSuccess) {
        onSuccess(orgId);
      }
      
      // Reset and close
      setName('');
      setType('tour');
      onClose();
    } catch (err) {
      console.error('Failed to create organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setType('tour');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative rounded-xl w-full max-w-lg glass border border-slate-200 dark:border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/10 border border-accent-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t('org.createTitle') || 'Create Organization'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('org.createSubtitle') || 'Set up your tour, band, or venue'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Organization Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t('org.name') || 'Organization Name'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Tour 2025"
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-accent-500 dark:focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                required
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {/* Organization Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                {t('org.type') || 'Organization Type'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ORG_TYPES.map((orgType) => {
                  const Icon = orgType.icon;
                  const isSelected = type === orgType.value;
                  
                  return (
                    <button
                      key={orgType.value}
                      type="button"
                      onClick={() => setType(orgType.value)}
                      disabled={isSubmitting}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-accent-500 bg-accent-500/10 dark:bg-accent-500/5'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/30 dark:bg-white/5'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${
                        isSelected ? 'text-accent-500' : 'text-slate-400 dark:text-slate-500'
                      }`} />
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {orgType.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {orgType.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info */}
            <div className="px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> You will be the owner of this organization and can invite team members later.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold transition-all disabled:opacity-50"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-500/90 to-accent-600/90 hover:from-accent-500 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-accent-500/30 transition-all"
              >
                {isSubmitting ? (t('common.creating') || 'Creating...') : (t('org.create') || 'Create Organization')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
