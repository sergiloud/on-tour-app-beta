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
