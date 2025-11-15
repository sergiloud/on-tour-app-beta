/**
 * Permission Hooks for UI
 * 
 * Provides hooks and utilities to check user permissions
 * and conditionally render UI based on RBAC roles.
 */

import { useOrganizationContext } from '../context/OrganizationContext';
import { hasPermission, getModuleAccess, type Permission, type MemberRole } from './useOrganizations';

/**
 * Hook to check if current user has a specific permission
 */
export function usePermission(permission: Permission): boolean {
  const { currentRole } = useOrganizationContext();
  
  if (!currentRole) return false;
  
  return hasPermission(currentRole, permission);
}

/**
 * Hook to check multiple permissions (returns true if user has ALL permissions)
 */
export function usePermissions(permissions: Permission[]): boolean {
  const { currentRole } = useOrganizationContext();
  
  if (!currentRole) return false;
  
  return permissions.every(p => hasPermission(currentRole, p));
}

/**
 * Hook to check if user has ANY of the given permissions
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const { currentRole } = useOrganizationContext();
  
  if (!currentRole) return false;
  
  return permissions.some(p => hasPermission(currentRole, p));
}

/**
 * Hook to get module access levels for current user
 */
export function useModuleAccess() {
  const { currentRole } = useOrganizationContext();
  
  if (!currentRole) {
    return {
      finance: 'none' as const,
      shows: 'none' as const,
      calendar: 'none' as const,
      travel: 'none' as const,
      contacts: 'none' as const,
      members: 'none' as const,
      settings: 'none' as const,
    };
  }
  
  return getModuleAccess(currentRole);
}

/**
 * Hook for finance module permissions
 */
export function useFinancePermissions() {
  return {
    canRead: usePermission('finance.read'),
    canWrite: usePermission('finance.write'),
    canDelete: usePermission('finance.delete'),
    canExport: usePermission('finance.export'),
  };
}

/**
 * Hook for shows module permissions
 */
export function useShowsPermissions() {
  return {
    canRead: usePermission('shows.read'),
    canWrite: usePermission('shows.write'),
    canDelete: usePermission('shows.delete'),
  };
}

/**
 * Hook for calendar module permissions
 */
export function useCalendarPermissions() {
  return {
    canRead: usePermission('calendar.read'),
    canWrite: usePermission('calendar.write'),
    canDelete: usePermission('calendar.delete'),
  };
}

/**
 * Hook for travel module permissions
 */
export function useTravelPermissions() {
  return {
    canRead: usePermission('travel.read'),
    canWrite: usePermission('travel.write'),
    canDelete: usePermission('travel.delete'),
  };
}

/**
 * Hook for contacts module permissions
 */
export function useContactsPermissions() {
  return {
    canRead: usePermission('contacts.read'),
    canWrite: usePermission('contacts.write'),
    canDelete: usePermission('contacts.delete'),
  };
}

/**
 * Hook for member management permissions
 */
export function useMemberPermissions() {
  return {
    canRead: usePermission('members.read'),
    canInvite: usePermission('members.invite'),
    canRemove: usePermission('members.remove'),
    canManageRoles: usePermission('members.manage_roles'),
  };
}

/**
 * Hook for settings permissions
 */
export function useSettingsPermissions() {
  return {
    canRead: usePermission('settings.read'),
    canWrite: usePermission('settings.write'),
  };
}

/**
 * Check if user is owner
 */
export function useIsOwner(): boolean {
  const { currentRole } = useOrganizationContext();
  return currentRole === 'owner';
}

/**
 * Check if user is admin or owner
 */
export function useIsAdmin(): boolean {
  const { currentRole } = useOrganizationContext();
  return currentRole === 'owner' || currentRole === 'admin';
}

/**
 * Check if user is finance manager
 */
export function useIsFinanceManager(): boolean {
  const { currentRole } = useOrganizationContext();
  return currentRole === 'finance' || currentRole === 'owner' || currentRole === 'admin';
}
