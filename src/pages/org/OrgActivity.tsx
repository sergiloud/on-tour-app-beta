import React from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { useOrganizationContext } from '../../context/OrganizationContext';
import { ActivityFeed } from '../../components/organization/ActivityFeed';
import { OrgEmptyState } from '../../components/org/OrgModernCards';

/**
 * Organization Activity Feed Page
 * 
 * Displays real-time activity logs and audit trail for the organization.
 * Shows "who did what, when" for team collaboration visibility.
 */
const OrgActivity: React.FC = () => {
  const { org } = useOrg();
  const orgContext = useOrganizationContext();

  // If new multi-tenancy context is available, use it
  if (orgContext?.currentOrg) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Activity Feed
          </h1>
          <p className="text-white/60">
            Track all changes and actions in <strong>{orgContext.currentOrg.name}</strong>
          </p>
        </div>
        
        <ActivityFeed limit={100} showFilters={true} />
      </div>
    );
  }

  // Fallback to legacy org context (for backward compatibility)
  if (org) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Activity Feed
          </h1>
          <p className="text-white/60">
            Track all changes and actions in <strong>{org.name}</strong>
          </p>
        </div>
        
        <ActivityFeed limit={100} showFilters={true} />
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
          description="Please select or create an organization to view activity feed."
        />
      </div>
    </div>
  );
};

export default OrgActivity;
