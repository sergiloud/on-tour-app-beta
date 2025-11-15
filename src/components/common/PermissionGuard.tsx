/**
 * Permission Guard Components
 * 
 * Components that conditionally render children based on user permissions.
 * Use these to hide/show UI elements based on RBAC roles.
 */

import React from 'react';
import { usePermission, usePermissions, useAnyPermission, useIsOwner, useIsAdmin } from '../../hooks/usePermissions';
import type { Permission } from '../../hooks/useOrganizations';

interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// ========================================
// Single Permission Guard
// ========================================

interface RequirePermissionProps extends PermissionGuardProps {
  permission: Permission;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const hasAccess = usePermission(permission);
  return <>{hasAccess ? children : fallback}</>;
};

// ========================================
// Multiple Permissions Guard (ALL required)
// ========================================

interface RequireAllPermissionsProps extends PermissionGuardProps {
  permissions: Permission[];
}

export const RequireAllPermissions: React.FC<RequireAllPermissionsProps> = ({
  permissions,
  children,
  fallback = null
}) => {
  const hasAccess = usePermissions(permissions);
  return <>{hasAccess ? children : fallback}</>;
};

// ========================================
// Any Permission Guard (ANY required)
// ========================================

interface RequireAnyPermissionProps extends PermissionGuardProps {
  permissions: Permission[];
}

export const RequireAnyPermission: React.FC<RequireAnyPermissionProps> = ({
  permissions,
  children,
  fallback = null
}) => {
  const hasAccess = useAnyPermission(permissions);
  return <>{hasAccess ? children : fallback}</>;
};

// ========================================
// Role-based Guards
// ========================================

export const RequireOwner: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null
}) => {
  const isOwner = useIsOwner();
  return <>{isOwner ? children : fallback}</>;
};

export const RequireAdmin: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null
}) => {
  const isAdmin = useIsAdmin();
  return <>{isAdmin ? children : fallback}</>;
};

// ========================================
// Module-specific Guards
// ========================================

export const CanEditFinance: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null
}) => {
  return (
    <RequirePermission permission="finance.write" fallback={fallback}>
      {children}
    </RequirePermission>
  );
};

export const CanDeleteFinance: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null
}) => {
  return (
    <RequirePermission permission="finance.delete" fallback={fallback}>
      {children}
    </RequirePermission>
  );
};

export const CanEditShows: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null
}) => {
  return (
    <RequirePermission permission="shows.write" fallback={fallback}>
      {children}
    </RequirePermission>
  );
};

export const CanManageMembers: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null
}) => {
  return (
    <RequirePermission permission="members.manage_roles" fallback={fallback}>
      {children}
    </RequirePermission>
  );
};

export const CanInviteMembers: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null
}) => {
  return (
    <RequirePermission permission="members.invite" fallback={fallback}>
      {children}
    </RequirePermission>
  );
};

// ========================================
// Disabled State Wrapper
// ========================================

interface DisabledIfProps {
  condition: boolean;
  children: React.ReactNode;
  tooltip?: string;
}

export const DisabledIf: React.FC<DisabledIfProps> = ({
  condition,
  children,
  tooltip
}) => {
  if (!condition) {
    return <>{children}</>;
  }

  return (
    <div
      className="opacity-50 cursor-not-allowed"
      title={tooltip || 'You don\'t have permission to perform this action'}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

interface DisabledWithoutPermissionProps {
  permission: Permission;
  children: React.ReactNode;
  tooltip?: string;
}

export const DisabledWithoutPermission: React.FC<DisabledWithoutPermissionProps> = ({
  permission,
  children,
  tooltip
}) => {
  const hasAccess = usePermission(permission);
  
  return (
    <DisabledIf
      condition={!hasAccess}
      tooltip={tooltip || `Requires ${permission} permission`}
    >
      {children}
    </DisabledIf>
  );
};
