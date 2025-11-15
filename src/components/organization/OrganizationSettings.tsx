/**
 * Organization Settings Component
 * 
 * Provides organization-level settings for owners/admins:
 * - Edit organization name and type
 * - Update organization metadata
 * - Danger zone: Delete organization
 * 
 * Permission Requirements:
 * - View: settings.read
 * - Edit: settings.write (owner/admin only)
 * - Delete: owner only
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationContext } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { PermissionGuard } from '../permissions/PermissionGuard';
import { t } from '../../lib/i18n';
import { FirestoreOrgService } from '../../services/firestoreOrgService';
import type { OrganizationType } from '../../hooks/useOrganizations';

const OrganizationSettings: React.FC = () => {
  const { currentOrg, isOwner, hasPermission } = useOrganizationContext();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: currentOrg?.name || '',
    type: (currentOrg?.type || 'tour') as OrganizationType,
    description: currentOrg?.metadata?.description || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Update form when currentOrg changes
  React.useEffect(() => {
    if (currentOrg) {
      setForm({
        name: currentOrg.name,
        type: currentOrg.type || 'tour',
        description: currentOrg.metadata?.description || '',
      });
    }
  }, [currentOrg]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const errs: { name?: string } = {};
    if (!form.name.trim()) {
      errs.name = t('org.error.nameRequired') || 'Organization name is required';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!currentOrg || !userId) {
      console.error('No current organization or user');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      await FirestoreOrgService.updateOrganization(
        currentOrg.id,
        {
          name: form.name.trim(),
          type: form.type as any, // Type mismatch between service and hook definitions
          settings: {
            ...currentOrg.settings,
            description: form.description.trim(),
          } as any,
        },
        userId
      );

      setSaveMessage(t('org.settings.saved') || 'Settings saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update organization:', error);
      setSaveMessage(t('org.settings.saveError') || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentOrg || !userId) return;

    // Validate confirmation text
    if (deleteConfirmText !== currentOrg.name) {
      setErrors({ name: t('org.error.confirmNameMismatch') || 'Organization name does not match' });
      return;
    }

    setIsDeleting(true);

    try {
      await FirestoreOrgService.deleteOrganization(currentOrg.id, userId);

      console.log('✅ Organization deleted successfully');

      // Navigate to dashboard (will trigger org switch to another org or onboarding)
      navigate('/dashboard');
      
      // Reload to pick up fresh organization list
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Failed to delete organization:', error);
      setErrors({ name: t('org.settings.deleteError') || 'Failed to delete organization. Please try again.' });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  if (!currentOrg) {
    return (
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6">
        <p className="text-sm text-white/70">{t('org.noOrg') || 'No organization selected'}</p>
      </div>
    );
  }

  const canEdit = hasPermission('settings.write');

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <section className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
          <h2 className="text-lg font-semibold">{t('org.settings.basic') || 'Basic Settings'}</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organization Name */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium opacity-80">
                {t('org.name') || 'Organization Name'}
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={!canEdit}
                className="px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <span id="name-error" className="text-xs text-red-300" aria-live="polite">
                  {errors.name}
                </span>
              )}
            </label>

            {/* Organization Type */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium opacity-80">
                {t('org.type') || 'Organization Type'}
              </span>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as OrganizationType })}
                disabled={!canEdit}
                className="px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="tour">{t('org.types.tour') || 'Tour'}</option>
                <option value="band">{t('org.types.band') || 'Band'}</option>
                <option value="venue">{t('org.types.venue') || 'Venue'}</option>
                <option value="agency">{t('org.types.agency') || 'Agency'}</option>
              </select>
            </label>
          </div>

          {/* Organization Description */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium opacity-80">
              {t('org.description') || 'Description'}
            </span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={!canEdit}
              rows={3}
              className="px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              placeholder={t('org.descriptionPlaceholder') || 'Tell us about your organization...'}
            />
          </label>

          {/* Organization ID (read-only) */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium opacity-80">
              {t('org.id') || 'Organization ID'}
            </span>
            <div className="px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-mono opacity-70">
              {currentOrg.id}
            </div>
            <p className="text-xs opacity-70">
              {t('org.idHint') || 'Use this ID when contacting support or integrating with APIs'}
            </p>
          </div>

          {/* Save Button */}
          <PermissionGuard require="settings.write" mode="hide">
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2.5 rounded-lg bg-accent-500 text-black font-medium hover:brightness-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? t('common.saving') || 'Saving...' : t('common.save') || 'Save Changes'}
              </button>

              {saveMessage && (
                <span
                  className={`text-sm ${saveMessage.includes('success') || saveMessage.includes('Saved') ? 'text-green-300' : 'text-red-300'}`}
                  aria-live="polite"
                >
                  {saveMessage}
                </span>
              )}
            </div>
          </PermissionGuard>
        </form>
      </section>

      {/* Organization Stats */}
      <section className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
          <h2 className="text-lg font-semibold">{t('org.settings.stats') || 'Organization Statistics'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <span className="text-xs opacity-70">{t('org.type') || 'Type'}</span>
            <span className="text-sm font-medium capitalize">{currentOrg.type}</span>
          </div>

          <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <span className="text-xs opacity-70">{t('org.createdAt') || 'Created'}</span>
            <span className="text-sm font-medium">
              {currentOrg.createdAt 
                ? new Date(currentOrg.createdAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>
      </section>

      {/* Danger Zone (Owner Only) */}
      <PermissionGuard require="settings.write" mode="hide">
        {isOwner && (
          <section className="glass rounded-xl border border-red-500/30 p-6 bg-red-500/5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-red-500 to-orange-500" />
              <h2 className="text-lg font-semibold text-red-300">
                {t('org.settings.dangerZone') || 'Danger Zone'}
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-white/70">
                {t('org.settings.deleteWarning') ||
                  'Deleting this organization will permanently remove all data, members, and settings. This action cannot be undone.'}
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2.5 rounded-lg border border-red-400 text-red-300 hover:bg-red-500/10 active:scale-95 transition-all"
                >
                  {t('org.settings.deleteOrg') || 'Delete Organization'}
                </button>
              ) : (
                <div className="space-y-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm font-medium text-red-200">
                    {t('org.settings.deleteConfirm') ||
                      'Are you absolutely sure? This action is irreversible.'}
                  </p>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-white/70">
                      {t('org.settings.typeToConfirm', { name: currentOrg.name }) ||
                        `Type "${currentOrg.name}" to confirm deletion:`}
                    </span>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={currentOrg.name}
                      className="px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                      aria-describedby="delete-confirm-hint"
                    />
                    <span id="delete-confirm-hint" className="text-xs text-white/50">
                      {t('org.settings.confirmHint') || 'Type the organization name exactly as shown above'}
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting || deleteConfirmText !== currentOrg.name}
                      className="px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:brightness-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting
                        ? t('org.settings.deleting') || 'Deleting...'
                        : t('org.settings.confirmDelete') || 'Yes, Delete Forever'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                        setErrors({});
                      }}
                      disabled={isDeleting}
                      className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.cancel') || 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </PermissionGuard>

    </div>
  );
};

export default OrganizationSettings;
