/**
 * Permission Guards Usage Examples
 * 
 * This file demonstrates how to use PermissionGuard and ViewOnlyBadge
 * components for role-based access control in the UI.
 */

import React from 'react';
import { 
  PermissionGuard, 
  AdminOnly, 
  OwnerOnly,
  FinanceWriteGuard,
  ShowsWriteGuard,
  MembersManageGuard 
} from '../components/permissions/PermissionGuard';
import { 
  ViewOnlyBadge, 
  RoleBadge, 
  PermissionLevelIndicator 
} from '../components/permissions/ViewOnlyBadge';
import { usePermission, useModuleAccess } from '../hooks/usePermissions';

/**
 * Example 1: Hide button for users without delete permission
 */
export function Example1_HideButton() {
  return (
    <PermissionGuard require="finance.delete">
      <button className="btn-danger">
        Delete Transaction
      </button>
    </PermissionGuard>
  );
}

/**
 * Example 2: Disable button but show it (grayed out)
 */
export function Example2_DisableButton() {
  return (
    <PermissionGuard require="shows.write" mode="disable">
      <button className="btn-primary">
        Edit Show
      </button>
    </PermissionGuard>
  );
}

/**
 * Example 3: Show fallback message instead of content
 */
export function Example3_FallbackMessage() {
  return (
    <PermissionGuard 
      require="members.manage_roles" 
      mode="fallback"
      fallback={
        <div className="glass-panel p-4 text-center">
          <p className="text-white/60">
            You need admin access to manage member roles
          </p>
        </div>
      }
    >
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Role Editor</h3>
        {/* Role editing UI */}
      </div>
    </PermissionGuard>
  );
}

/**
 * Example 4: Multiple permissions (ALL required)
 */
export function Example4_MultiplePermissionsAll() {
  return (
    <PermissionGuard require={['finance.write', 'finance.delete']}>
      <button className="btn-danger">
        Delete and Refund Transaction
      </button>
    </PermissionGuard>
  );
}

/**
 * Example 5: Multiple permissions (ANY required)
 */
export function Example5_MultiplePermissionsAny() {
  return (
    <PermissionGuard 
      require={['members.invite', 'members.manage_roles']} 
      match="any"
    >
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Member Management</h3>
        {/* Member management UI */}
      </div>
    </PermissionGuard>
  );
}

/**
 * Example 6: Using shorthand guards
 */
export function Example6_ShorthandGuards() {
  return (
    <div className="space-y-4">
      {/* Admin-only section */}
      <AdminOnly>
        <div className="glass-panel p-4 border border-pink-500/20">
          <h4 className="text-white font-semibold">Admin Panel</h4>
          <p className="text-white/60 text-sm">Only admins and owners can see this</p>
        </div>
      </AdminOnly>
      
      {/* Owner-only section */}
      <OwnerOnly>
        <div className="glass-panel p-4 border border-purple-500/20">
          <h4 className="text-white font-semibold">Owner Settings</h4>
          <p className="text-white/60 text-sm">Only the owner can see this</p>
        </div>
      </OwnerOnly>
      
      {/* Finance write guard */}
      <FinanceWriteGuard>
        <button className="btn-primary">Create Transaction</button>
      </FinanceWriteGuard>
      
      {/* Shows write guard */}
      <ShowsWriteGuard mode="disable">
        <button className="btn-primary">Edit Show Details</button>
      </ShowsWriteGuard>
      
      {/* Members manage guard */}
      <MembersManageGuard>
        <button className="btn-primary">Invite Member</button>
      </MembersManageGuard>
    </div>
  );
}

/**
 * Example 7: ViewOnlyBadge - Basic usage
 */
export function Example7_ViewOnlyBadge() {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Finance Dashboard</h3>
        <ViewOnlyBadge />
      </div>
      <p className="text-white/60">You have read-only access to financial data</p>
    </div>
  );
}

/**
 * Example 8: ViewOnlyBadge - Module-specific
 */
export function Example8_ModuleSpecificBadge() {
  return (
    <div className="space-y-4">
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold">Finance</h4>
          <ViewOnlyBadge module="finance" />
        </div>
      </div>
      
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold">Shows</h4>
          <ViewOnlyBadge module="shows" detailed />
        </div>
      </div>
      
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold">Members</h4>
          <ViewOnlyBadge module="members" size="lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 9: RoleBadge
 */
export function Example9_RoleBadge() {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-3 mb-4">
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" 
          alt="User" 
          className="h-12 w-12 rounded-full"
        />
        <div>
          <h4 className="text-white font-semibold">John Doe</h4>
          <div className="flex items-center gap-2 mt-1">
            <RoleBadge role="admin" />
            <ViewOnlyBadge module="finance" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 10: PermissionLevelIndicator
 */
export function Example10_PermissionIndicators() {
  const moduleAccess = useModuleAccess();
  
  return (
    <div className="glass-panel p-6">
      <h4 className="text-white font-semibold mb-4">Your Access Levels</h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/70">Finance</span>
          <PermissionLevelIndicator level={moduleAccess.finance} showLabel />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/70">Shows</span>
          <PermissionLevelIndicator level={moduleAccess.shows} showLabel />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/70">Calendar</span>
          <PermissionLevelIndicator level={moduleAccess.calendar} showLabel />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/70">Members</span>
          <PermissionLevelIndicator 
            level={moduleAccess.members === 'manage' ? 'full' : moduleAccess.members} 
            showLabel 
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 11: Conditional rendering with usePermission hook
 */
export function Example11_ConditionalWithHook() {
  const canEditFinance = usePermission('finance.write');
  const canDeleteFinance = usePermission('finance.delete');
  
  return (
    <div className="glass-panel p-6">
      <h4 className="text-white font-semibold mb-4">Transaction Actions</h4>
      <div className="flex gap-2">
        <button className="btn-secondary">View Details</button>
        
        {canEditFinance && (
          <button className="btn-primary">Edit</button>
        )}
        
        {canDeleteFinance && (
          <button className="btn-danger">Delete</button>
        )}
      </div>
    </div>
  );
}

/**
 * Example 12: Combined usage in a real component
 */
export function Example12_RealWorldUsage() {
  const moduleAccess = useModuleAccess();
  const canInvite = usePermission('members.invite');
  const canManageRoles = usePermission('members.manage_roles');
  
  return (
    <div className="space-y-4">
      {/* Header with role badge */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Team Members</h2>
          <div className="flex items-center gap-2">
            <ViewOnlyBadge module="members" />
            <RoleBadge role="admin" size="sm" />
          </div>
        </div>
        
        {/* Actions - only show if user has permissions */}
        <div className="flex gap-2">
          <MembersManageGuard>
            <button className="btn-primary">Invite Member</button>
          </MembersManageGuard>
          
          <AdminOnly>
            <button className="btn-secondary">Manage Teams</button>
          </AdminOnly>
        </div>
      </div>
      
      {/* Member list */}
      <div className="glass-panel p-6">
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                  alt="Member" 
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <h5 className="text-white font-medium">Member {i}</h5>
                  <p className="text-white/50 text-sm">member{i}@example.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <RoleBadge role={i === 1 ? 'owner' : i === 2 ? 'admin' : 'member'} size="sm" />
                
                {/* Edit role button - only for users who can manage roles */}
                <PermissionGuard require="members.manage_roles" mode="disable">
                  <button className="btn-ghost btn-sm">Edit Role</button>
                </PermissionGuard>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Permission levels overview */}
      <div className="glass-panel p-6">
        <h4 className="text-white font-semibold mb-4">Your Module Access</h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(moduleAccess).map(([module, level]) => (
            <div key={module} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-white/70 capitalize">{module}</span>
              <PermissionLevelIndicator 
                level={level === 'manage' ? 'full' : level} 
                showLabel 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
