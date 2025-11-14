/**
 * Organization Context Provider
 * 
 * Provides organization state and operations throughout the app:
 * - Current organization
 * - Organization switching
 * - Member role and permissions
 * - Organization list
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useOrganizations } from '../hooks/useOrganizations';
import type { Organization, MemberRole, Permission } from '../hooks/useOrganizations';

interface OrganizationContextValue {
  // Current organization
  currentOrg: Organization | null;
  currentOrgId: string | null;
  currentRole: MemberRole | null;
  
  // Organization list
  organizations: Organization[];
  isLoading: boolean;
  error: Error | null;
  
  // Operations
  switchOrganization: (orgId: string) => void;
  
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  canWrite: boolean;
  canManageMembers: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

const CURRENT_ORG_KEY = 'currentOrganizationId';

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { organizations, isLoading, error } = useOrganizations();
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(() => {
    // Restore from localStorage
    return localStorage.getItem(CURRENT_ORG_KEY);
  });
  
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currentRole, setCurrentRole] = useState<MemberRole | null>(null);

  // Update current organization when organizations load or currentOrgId changes
  useEffect(() => {
    if (organizations.length === 0) {
      setCurrentOrg(null);
      setCurrentRole(null);
      return;
    }

    // Find current organization
    let org = organizations.find((o) => o.id === currentOrgId);

    // If not found, use first organization
    if (!org) {
      org = organizations[0];
      if (org) {
        setCurrentOrgId(org.id);
        localStorage.setItem(CURRENT_ORG_KEY, org.id);
      }
    }

    setCurrentOrg(org || null);

    // TODO: Fetch user's role in this organization
    // For now, assume owner (will be fixed when we have membership data)
    setCurrentRole('owner');
  }, [organizations, currentOrgId]);

  const switchOrganization = (orgId: string) => {
    setCurrentOrgId(orgId);
    localStorage.setItem(CURRENT_ORG_KEY, orgId);
    
    // TODO: Update last accessed timestamp
    // updateDoc(doc(db, `users/${userId}/organization_memberships/${orgId}`), {
    //   lastAccessed: serverTimestamp()
    // });
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentRole) return false;
    
    // TODO: Get from actual member document
    // For now, use role-based permissions
    const rolePermissions: Record<MemberRole, Permission[]> = {
      owner: [
        'finance.read', 'finance.write', 'finance.delete',
        'shows.read', 'shows.write', 'shows.delete',
        'calendar.read', 'calendar.write', 'calendar.delete',
        'members.read', 'members.invite', 'members.remove', 'members.manage_roles',
        'settings.read', 'settings.write',
      ],
      admin: [
        'finance.read', 'finance.write', 'finance.delete',
        'shows.read', 'shows.write', 'shows.delete',
        'calendar.read', 'calendar.write', 'calendar.delete',
        'members.read', 'members.invite', 'members.remove', 'members.manage_roles',
        'settings.read',
      ],
      member: [
        'finance.read', 'finance.write',
        'shows.read', 'shows.write', 'shows.delete',
        'calendar.read', 'calendar.write', 'calendar.delete',
        'members.read',
      ],
      viewer: [
        'finance.read',
        'shows.read',
        'calendar.read',
        'members.read',
      ],
    };
    
    return rolePermissions[currentRole].includes(permission);
  };

  const value: OrganizationContextValue = {
    currentOrg,
    currentOrgId,
    currentRole,
    organizations,
    isLoading,
    error,
    switchOrganization,
    hasPermission,
    canWrite: hasPermission('shows.write'),
    canManageMembers: hasPermission('members.invite'),
    isOwner: currentRole === 'owner',
    isAdmin: currentRole === 'owner' || currentRole === 'admin',
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
}
