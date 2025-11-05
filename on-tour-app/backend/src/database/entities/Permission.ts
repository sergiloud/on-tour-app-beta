import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Permission Entity
 *
 * Represents a fine-grained permission in the system
 * Permissions are assigned to roles, which are assigned to users
 *
 * Example codes:
 * - "orgs:read" - Read organizations
 * - "users:write" - Create/update users
 * - "reports:delete" - Delete reports
 * - "admin:access" - Superadmin access
 */
@Entity('permissions')
@Index('idx_permission_code')
export class Permission {
  @PrimaryColumn('uuid')
  id!: string;

  /**
   * Permission code (e.g., "orgs:read", "users:write")
   * Format: resource:action
   * Unique across system
   */
  @Column('varchar', { length: 255, unique: true })
  code!: string;

  /**
   * Human-readable name (e.g., "Read Organizations")
   */
  @Column('varchar', { length: 255 })
  name!: string;

  /**
   * Detailed description of what this permission allows
   */
  @Column('text', { nullable: true })
  description?: string;

  /**
   * Optional category (e.g., "organizations", "users", "admin")
   * Useful for grouping in UI
   */
  @Column('varchar', { length: 100, nullable: true })
  category?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(code?: string, name?: string, description?: string, category?: string) {
    if (code && name) {
      this.id = uuidv4();
      this.code = code;
      this.name = name;
      this.description = description;
      this.category = category;
    }
  }
}
