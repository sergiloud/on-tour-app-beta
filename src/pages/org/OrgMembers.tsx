import React from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { useOrganizationContext } from '../../context/OrganizationContext';
import { MembersPanel } from '../../components/organization/MembersPanel';
import { OrgEmptyState } from '../../components/org/OrgModernCards';

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
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-8 max-w-md">
          <OrgEmptyState
            icon={<Building2 className="w-6 h-6" />}
            title="Multi-Tenancy Active"
            description="Member management is now powered by the new organization system. Please ensure OrganizationContext is properly initialized."
          />
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
            Legacy org: {org.name} ({org.type})
          </div>
        </div>
      </div>
    );
  }

  // No organization context at all
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-8 max-w-md">
        <OrgEmptyState
          icon={<AlertCircle className="w-6 h-6" />}
          title="No Organization Selected"
          description="Please select or create an organization to manage members."
        />
      </div>
    </div>
  );
};

export default OrgMembers;
