/**
 * ViewOnlyBadge Component
 * 
 * Displays a badge indicating view-only access for users without write permissions.
 * Shows module-specific access levels with color-coded badges.
 */

import React from 'react';
import { Eye, Lock, Edit3, Trash2 } from 'lucide-react';
import { useModuleAccess } from '../../hooks/usePermissions';
import { t } from '../../lib/i18n';

export interface ViewOnlyBadgeProps {
  /**
   * Module to check permissions for
   */
  module?: 'finance' | 'shows' | 'calendar' | 'members' | 'settings';
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Show detailed permission level instead of just "View Only"
   */
  detailed?: boolean;
  
  /**
   * Custom className
   */
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const ICON_SIZE = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

/**
 * ViewOnlyBadge
 * 
 * Shows a badge indicating limited access permissions.
 * 
 * @example
 * ```tsx
 * // Basic view-only badge
 * <ViewOnlyBadge />
 * 
 * // Module-specific badge
 * <ViewOnlyBadge module="finance" />
 * 
 * // Detailed permission level
 * <ViewOnlyBadge module="shows" detailed />
 * 
 * // Different sizes
 * <ViewOnlyBadge size="sm" />
 * <ViewOnlyBadge size="lg" />
 * ```
 */
export function ViewOnlyBadge({ 
  module, 
  size = 'md',
  detailed = false,
  className = '',
}: ViewOnlyBadgeProps) {
  const moduleAccess = useModuleAccess();
  
  // If no module specified, show generic view-only badge
  if (!module) {
    return (
      <span 
        className={`inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 text-blue-400 
                    font-medium border border-blue-500/20 ${SIZE_CLASSES[size]} ${className}`}
        title={t('permissions.viewOnly')}
      >
        <Eye className={ICON_SIZE[size]} />
        {t('permissions.viewOnly')}
      </span>
    );
  }
  
  // Get access level for module
  const accessLevel = moduleAccess[module];
  
  // If user has full/manage access, don't show badge
  if (accessLevel === 'full' || accessLevel === 'manage') {
    return null;
  }
  
  // Render badge based on access level
  switch (accessLevel) {
    case 'none':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 text-gray-400 
                      font-medium border border-gray-500/20 ${SIZE_CLASSES[size]} ${className}`}
          title={t('permissions.noAccess')}
        >
          <Lock className={ICON_SIZE[size]} />
          {detailed ? t('permissions.noAccess') : t('permissions.locked')}
        </span>
      );
      
    case 'read':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 text-blue-400 
                      font-medium border border-blue-500/20 ${SIZE_CLASSES[size]} ${className}`}
          title={t('permissions.readOnly')}
        >
          <Eye className={ICON_SIZE[size]} />
          {detailed ? t('permissions.readOnly') : t('permissions.viewOnly')}
        </span>
      );
      
    case 'write':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-400 
                      font-medium border border-amber-500/20 ${SIZE_CLASSES[size]} ${className}`}
          title={t('permissions.canEdit')}
        >
          <Edit3 className={ICON_SIZE[size]} />
          {detailed ? t('permissions.canEdit') : t('permissions.edit')}
        </span>
      );
      
    default:
      return null;
  }
}

/**
 * RoleBadge - Shows current user role
 */
export function RoleBadge({ 
  role, 
  size = 'md',
  className = '',
}: { 
  role: 'owner' | 'admin' | 'finance' | 'member' | 'viewer';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const roleConfig = {
    owner: { label: t('roles.owner'), color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    admin: { label: t('roles.admin'), color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
    finance: { label: t('roles.finance'), color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    member: { label: t('roles.member'), color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    viewer: { label: t('roles.viewer'), color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
  };
  
  const config = roleConfig[role];
  
  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border 
                  ${config.color} ${SIZE_CLASSES[size]} ${className}`}
      title={t('permissions.yourRole')}
    >
      {config.label}
    </span>
  );
}

/**
 * PermissionLevelIndicator - Visual indicator for permission level
 */
export function PermissionLevelIndicator({ 
  level, 
  showLabel = false 
}: { 
  level: 'none' | 'read' | 'write' | 'full';
  showLabel?: boolean;
}) {
  const config = {
    none: { color: 'bg-gray-500', label: t('permissions.none') },
    read: { color: 'bg-blue-500', label: t('permissions.read') },
    write: { color: 'bg-amber-500', label: t('permissions.write') },
    full: { color: 'bg-green-500', label: t('permissions.full') },
  };
  
  const { color, label } = config[level];
  
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      {showLabel && <span className="text-xs text-white/60">{label}</span>}
    </div>
  );
}
