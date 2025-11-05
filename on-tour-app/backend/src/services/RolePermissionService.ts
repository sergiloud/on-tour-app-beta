import { AppDataSource } from '../database/datasource.js';
import { Permission } from '../database/entities/Permission.js';
import { RolePermission } from '../database/entities/RolePermission.js';
import { logger } from '../utils/logger.js';
import { IsNull } from 'typeorm';

/**
 * RolePermissionService
 *
 * Manages role-to-permission mappings
 * Provides permission checking for users based on their roles
 *
 * RBAC Model:
 * - Superadmin: All permissions (special handling)
 * - Admin: Organization management + reporting
 * - User: Read-only + limited write access
 */
export class RolePermissionService {
  private permissionRepository = AppDataSource.getRepository(Permission);
  private rolePermissionRepository = AppDataSource.getRepository(RolePermission);

  /**
   * Default permissions by role
   * Created during system initialization
   */
  private defaultPermissions = {
    superadmin: [
      // Full access
      'admin:access',
      'orgs:create',
      'orgs:read',
      'orgs:update',
      'orgs:delete',
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'reports:create',
      'reports:read',
      'reports:update',
      'reports:delete',
      'settings:read',
      'settings:update',
    ],
    admin: [
      // Organization and user management
      'orgs:read',
      'orgs:update',
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'reports:create',
      'reports:read',
      'reports:update',
      'reports:delete',
      'settings:read',
      'settings:update',
    ],
    user: [
      // Read-only + limited write
      'orgs:read',
      'reports:read',
      'reports:create',
      'settings:read',
    ],
  };

  /**
   * Seed default permissions and role assignments
   * Call this during system initialization
   */
  async seedDefaultPermissions(): Promise<void> {
    try {
      // Check if permissions already exist
      const count = await this.permissionRepository.count();
      if (count > 0) {
        logger.info({}, 'Permissions already seeded, skipping');
        return;
      }

      // Flatten all unique permission codes
      const allCodes = new Set<string>();
      Object.values(this.defaultPermissions).forEach((perms) => {
        perms.forEach((code) => allCodes.add(code));
      });

      // Create Permission records
      const permissionsMap = new Map<string, Permission>();

      for (const code of allCodes) {
        const [resource, action] = code.split(':');
        const name = this.formatPermissionName(code);
        const category = resource;

        const permission = new Permission(code, name, `${name} for ${resource}s`, category);
        const saved = await this.permissionRepository.save(permission);
        permissionsMap.set(code, saved);
      }

      logger.info(
        { count: permissionsMap.size },
        'Permissions seeded successfully'
      );

      // Assign permissions to default roles
      for (const [role, permissionCodes] of Object.entries(this.defaultPermissions)) {
        for (const code of permissionCodes) {
          const permission = permissionsMap.get(code);
          if (permission) {
            const rolePermission = new RolePermission(role, permission.id);
            await this.rolePermissionRepository.save(rolePermission);
          }
        }
      }

      logger.info(
        { roles: Object.keys(this.defaultPermissions) },
        'Role permissions assigned'
      );
    } catch (error) {
      logger.error(error, 'Failed to seed default permissions');
      throw error;
    }
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(roleId: string, permissionCode: string): Promise<RolePermission> {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { code: permissionCode },
      });

      if (!permission) {
        throw new Error(`Permission not found: ${permissionCode}`);
      }

      const existing = await this.rolePermissionRepository.findOne({
        where: { roleId, permissionId: permission.id },
      });

      if (existing) {
        return existing;
      }

      const rolePermission = new RolePermission(roleId, permission.id);
      const saved = await this.rolePermissionRepository.save(rolePermission);

      logger.info(
        { roleId, permissionCode },
        'Permission assigned to role'
      );

      return saved;
    } catch (error) {
      logger.error(error, 'Failed to assign permission to role');
      throw error;
    }
  }

  /**
   * Assign multiple permissions to role
   */
  async assignPermissionsToRole(
    roleId: string,
    permissionCodes: string[]
  ): Promise<RolePermission[]> {
    const results: RolePermission[] = [];

    for (const code of permissionCodes) {
      try {
        const rolePermission = await this.assignPermissionToRole(roleId, code);
        results.push(rolePermission);
      } catch (error) {
        logger.warn(error, `Failed to assign permission ${code} to role ${roleId}`);
      }
    }

    return results;
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(roleId: string, permissionCode: string): Promise<void> {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { code: permissionCode },
      });

      if (!permission) {
        throw new Error(`Permission not found: ${permissionCode}`);
      }

      await this.rolePermissionRepository.delete({
        roleId,
        permissionId: permission.id,
      });

      logger.info(
        { roleId, permissionCode },
        'Permission removed from role'
      );
    } catch (error) {
      logger.error(error, 'Failed to remove permission from role');
      throw error;
    }
  }

  /**
   * Get all permissions for a role
   * Returns array of permission codes
   */
  async getPermissionsForRole(roleId: string): Promise<string[]> {
    try {
      const rolePermissions = await this.rolePermissionRepository.find({
        where: { roleId },
        relations: ['permission'],
      });

      return rolePermissions.map((rp) => rp.permission?.code || '').filter(Boolean);
    } catch (error) {
      logger.error(error, 'Failed to get permissions for role');
      return [];
    }
  }

  /**
   * Check if role has specific permission
   */
  async roleHasPermission(roleId: string, permissionCode: string): Promise<boolean> {
    try {
      // Superadmin always has all permissions
      if (roleId === 'superadmin') {
        return true;
      }

      const permission = await this.permissionRepository.findOne({
        where: { code: permissionCode },
      });

      if (!permission) {
        return false;
      }

      const rolePermission = await this.rolePermissionRepository.findOne({
        where: { roleId, permissionId: permission.id },
      });

      return !!rolePermission;
    } catch (error) {
      logger.error(error, 'Failed to check role permission');
      return false;
    }
  }

  /**
   * Check if role has ANY of the given permissions
   */
  async roleHasAnyPermission(
    roleId: string,
    permissionCodes: string[]
  ): Promise<boolean> {
    // Superadmin always has permissions
    if (roleId === 'superadmin') {
      return true;
    }

    for (const code of permissionCodes) {
      if (await this.roleHasPermission(roleId, code)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if role has ALL of the given permissions
   */
  async roleHasAllPermissions(
    roleId: string,
    permissionCodes: string[]
  ): Promise<boolean> {
    // Superadmin always has all permissions
    if (roleId === 'superadmin') {
      return true;
    }

    for (const code of permissionCodes) {
      if (!(await this.roleHasPermission(roleId, code))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    try {
      return await this.permissionRepository.find({
        order: { category: 'ASC', code: 'ASC' },
      });
    } catch (error) {
      logger.error(error, 'Failed to get all permissions');
      return [];
    }
  }

  /**
   * Format permission code to human-readable name
   * Example: "orgs:read" → "Read Organizations"
   */
  private formatPermissionName(code: string): string {
    const [resource, action] = code.split(':');

    const actionMap: Record<string, string> = {
      create: 'Create',
      read: 'Read',
      update: 'Update',
      delete: 'Delete',
      access: 'Access',
    };

    const resourceMap: Record<string, string> = {
      orgs: 'Organizations',
      users: 'Users',
      reports: 'Reports',
      settings: 'Settings',
      admin: 'Admin',
    };

    const actionName = actionMap[action] || action;
    const resourceName = resourceMap[resource] || resource;

    return `${actionName} ${resourceName}`;
  }

  /**
   * Count total permissions
   */
  async count(): Promise<number> {
    return await this.permissionRepository.count();
  }

  /**
   * Clear all role permissions for testing
   */
  async clearRolePermissions(roleId: string): Promise<void> {
    try {
      await this.rolePermissionRepository.delete({ roleId });
      logger.info({ roleId }, 'Role permissions cleared');
    } catch (error) {
      logger.error(error, 'Failed to clear role permissions');
      throw error;
    }
  }
}

/**
 * Singleton instance
 */
export const rolePermissionService = new RolePermissionService();
