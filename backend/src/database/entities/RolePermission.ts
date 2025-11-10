import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Permission } from './Permission.js';

/**
 * RolePermission Entity (Join Table)
 *
 * Maps roles to permissions in a many-to-many relationship
 *
 * Example:
 * - Role "admin" has permission "orgs:read", "orgs:write", "users:read", etc.
 * - Role "user" has permission "orgs:read", "reports:read", etc.
 * - Role "superadmin" has permission "*" (all)
 */
@Entity('role_permissions')
@Unique('idx_role_permission_composite', ['roleId', 'permissionId'])
export class RolePermission {
  @PrimaryColumn('uuid')
  id!: string;

  /**
   * Role ID - References auth system roles
   * Hardcoded roles: "superadmin", "admin", "user"
   */
  @Column('varchar', { length: 100 })
  roleId!: string;

  /**
   * Permission ID
   */
  @Column('uuid')
  permissionId!: string;

  @ManyToOne(() => Permission, { eager: true })
  @JoinColumn({ name: 'permissionId' })
  permission?: Permission;

  @CreateDateColumn()
  createdAt!: Date;

  constructor(roleId?: string, permissionId?: string) {
    if (roleId && permissionId) {
      this.id = uuidv4();
      this.roleId = roleId;
      this.permissionId = permissionId;
    }
  }
}
