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
    // Use legacy MembersPanel with localStorage-based tenants.ts system
    return (
      <MembersPanel
        organizationId={org.id}
        organizationName={org.name}
        currentUserRole={'owner'} // Legacy mode assumes owner role
        canManageMembers={true} // Legacy mode has full permissions
      />
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
