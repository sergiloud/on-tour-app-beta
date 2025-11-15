/**
 * PermissionGuard Component
 * 
 * Conditionally renders children based on user permissions.
 * Supports multiple modes: hide, disable, show fallback.
 */

import React, { ReactNode } from 'react';
import { usePermission } from '../../hooks/usePermissions';
import type { Permission } from '../../hooks/useOrganizations';
import { LockKeyhole } from 'lucide-react';
import { t } from '../../lib/i18n';

export interface PermissionGuardProps {
  /**
   * Required permission(s) to view content
   */
  require: Permission | Permission[];
  
  /**
   * Children to render if permission is granted
   */
  children: ReactNode;
  
  /**
   * Mode of restriction
   * - 'hide': Hide children completely (default)
   * - 'disable': Show children but disable interactions
   * - 'fallback': Show fallback UI instead
   */
  mode?: 'hide' | 'disable' | 'fallback';
  
  /**
   * Custom fallback content when mode='fallback'
   */
  fallback?: ReactNode;
  
  /**
   * Match mode for multiple permissions
   * - 'all': User must have ALL permissions (default)
   * - 'any': User must have ANY permission
   */
  match?: 'all' | 'any';
}

/**
 * PermissionGuard
 * 
 * Wraps components with permission-based rendering.
 * 
 * @example
 * ```tsx
 * // Hide button if user can't delete
 * <PermissionGuard require="finance.delete">
 *   <button>Delete Transaction</button>
 * </PermissionGuard>
 * 
 * // Disable button but show it
 * <PermissionGuard require="shows.write" mode="disable">
 *   <button>Edit Show</button>
 * </PermissionGuard>
 * 
 * // Show fallback message
 * <PermissionGuard 
 *   require="members.manage_roles" 
 *   mode="fallback"
 *   fallback={<p>You need admin access to manage roles</p>}
 * >
 *   <RoleEditor />
 * </PermissionGuard>
 * 
 * // Multiple permissions (all required)
 * <PermissionGuard require={['finance.write', 'finance.delete']}>
 *   <DeleteTransactionButton />
 * </PermissionGuard>
 * 
 * // Multiple permissions (any required)
 * <PermissionGuard 
 *   require={['members.invite', 'members.manage_roles']} 
 *   match="any"
 * >
 *   <MemberManagementPanel />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  require,
  children,
  mode = 'hide',
  fallback,
  match = 'all',
}: PermissionGuardProps) {
  // Convert single permission to array
  const permissions = Array.isArray(require) ? require : [require];
  
  // Check permissions
  const hasPermissions = permissions.map(p => usePermission(p));
  const hasAccess = match === 'all' 
    ? hasPermissions.every(Boolean)
    : hasPermissions.some(Boolean);
  
  // If user has access, render children normally
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // No access - handle based on mode
  switch (mode) {
    case 'hide':
      return null;
      
    case 'disable':
      // Wrap children in disabled div
      return (
        <div 
          className="pointer-events-none opacity-50 cursor-not-allowed"
          title={t('permissions.restricted')}
        >
          {children}
        </div>
      );
      
    case 'fallback':
      return (
        <>
          {fallback || (
            <div className="glass-panel p-4 text-center">
              <LockKeyhole className="h-8 w-8 text-white/30 mx-auto mb-2" />
              <p className="text-white/50 text-sm">
                {t('permissions.insufficientAccess')}
              </p>
            </div>
          )}
        </>
      );
      
    default:
      return null;
  }
}

/**
 * ShorthandGuards - Convenience wrappers for common permission checks
 */

export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard 
      require={['members.manage_roles', 'settings.write']} 
      match="any"
      mode={fallback ? 'fallback' : 'hide'}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function OwnerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard 
      require="settings.write" 
      mode={fallback ? 'fallback' : 'hide'}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function FinanceWriteGuard({ children, mode = 'hide' }: { children: ReactNode; mode?: 'hide' | 'disable' }) {
  return (
    <PermissionGuard require="finance.write" mode={mode}>
      {children}
    </PermissionGuard>
  );
}

export function ShowsWriteGuard({ children, mode = 'hide' }: { children: ReactNode; mode?: 'hide' | 'disable' }) {
  return (
    <PermissionGuard require="shows.write" mode={mode}>
      {children}
    </PermissionGuard>
  );
}

export function MembersManageGuard({ children, mode = 'hide' }: { children: ReactNode; mode?: 'hide' | 'disable' }) {
  return (
    <PermissionGuard require="members.invite" mode={mode}>
      {children}
    </PermissionGuard>
  );
}
