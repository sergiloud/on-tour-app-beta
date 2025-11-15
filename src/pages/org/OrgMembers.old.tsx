import React from 'react';
import { useOrg } from '../../context/OrgContext';
import { useOrganizationContext } from '../../context/OrganizationContext';
import { MembersPanel } from '../../components/organization/MembersPanel';

/**
 * Organization Members Management Page
 * 
 * Integrates the MembersPanel component with the organization context.
 * Falls back to legacy OrgContext if OrganizationContext is not yet initialized.
 */
const OrgMembers: React.FC = () => {
  const { org } = useOrg();
  const orgContext = useOrganizationContext();

  // If new multi-tenancy context is available, use it
  if (orgContext?.currentOrg) {
    return (
      <MembersPanel
        organizationId={orgContext.currentOrg.id}
        organizationName={orgContext.currentOrg.name}
        currentUserRole={orgContext.currentRole || 'viewer'}
        canManageMembers={orgContext.canManageMembers}
      />
    );
  }

  // Fallback to legacy org context (for backward compatibility during migration)
  if (org) {
    // For demo/legacy mode, show a placeholder that encourages migration
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Multi-Tenancy Active
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Member management is now powered by the new organization system.
            Please ensure OrganizationContext is properly initialized.
          </p>
          <div className="text-sm text-slate-500 dark:text-slate-500">
            Legacy org: {org.name} ({org.type})
          </div>
        </div>
      </div>
    );
  }

  // No organization context at all
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🏢</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          No Organization Selected
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Please select or create an organization to manage members.
        </p>
      </div>
    </div>
  );
};

export default OrgMembers;

  useEffect(() => {
    try {
      trackEvent('org.section.view', { section: 'members' });
    } catch {}
  }, []);

  const handleInvite = () => {
    try {
      navigator.clipboard.writeText(window.location.origin + '/invite/demo');
    } catch {}
  };

  return (
    <motion.div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-6 pb-8" layoutId="org-members">
      {/* Header */}
      <PageHeader
        title={t('org.members.title') || 'Team Members'}
        subtitle={isAgency ? (t('members.seats.subtitle') || 'Manage your team and collaborate on tour operations') : (t('members.artist.subtitle') || 'Your team members and collaborators')}
        actions={
          <motion.button
            onClick={handleInvite}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 border border-accent-500/30 hover:border-accent-500/50 hover:from-accent-500/35 hover:via-accent-500/25 hover:to-accent-600/20 text-accent-200 font-semibold text-xs transition-all duration-300 shadow-lg shadow-accent-500/10"
          >
            <Plus className="w-4 h-4" />
            {t('members.invite') || 'Invite Member'}
          </motion.button>
        }
      />

      {/* Members Grid */}
      <motion.div
        className="grid grid-cols-1 gap-4 lg:gap-5"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
        initial="hidden"
        animate="visible"
      >
        {members.length === 0 ? (
          <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-8 md:p-12 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3">
            <OrgEmptyState
              icon="👥"
              title={t('empty.noMembers') || 'No team members yet'}
              description={isAgency ? t('empty.noMembers.agency') || 'Invite managers to collaborate on artist management' : t('empty.noMembers.artist') || 'Invite team members to get started'}
              action={{
                label: t('members.invite') || 'Invite Member',
                onClick: handleInvite
              }}
            />
          </div>
        ) : (
          <>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
            >
              <OrgSectionHeader
                title={`${t('org.members.title') || 'Members'} (${members.length})`}
                subtitle={`${members.length} ${members.length === 1 ? 'member' : 'members'} in your organization`}
              />
              <div className="mt-4 space-y-2">
                {members.map((member, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <OrgListItem
                      title={member.user.name}
                      icon={
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500/30 to-accent-600/20 flex items-center justify-center text-xs font-semibold text-accent-200 border border-accent-500/20">
                          {(member.user.name || ' ').charAt(0).toUpperCase()}
                        </div>
                      }
                      value={
                        <span className="px-2.5 py-1 rounded-lg bg-accent-500/15 border border-accent-500/20 text-xs font-semibold text-accent-200">
                          {member.role}
                        </span>
                      }
                      interactive
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Invite Link Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
            >
              <OrgSectionHeader
                title="Invite Link"
                subtitle="Share this link to invite new members"
                icon={<Mail className="w-4 h-4 text-accent-400" />}
              />
              <div className="mt-4">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="glass rounded-lg border border-slate-200 dark:border-white/10 p-4 bg-slate-100 dark:bg-white/5 hover:bg-white/8 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-xs md:text-sm font-mono text-slate-400 dark:text-white/60 group-hover:text-slate-700 dark:text-slate-700 dark:text-white/90 transition-colors truncate">
                      {window.location.origin}/invite/demo
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleInvite}
                      className="px-3 py-1.5 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-200 text-xs font-semibold border border-accent-500/30 hover:border-accent-500/50 transition-all whitespace-nowrap"
                    >
                      Copy
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default OrgMembers;
