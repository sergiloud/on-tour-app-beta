import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * AuditLog Entity
 *
 * Comprehensive audit trail for all system operations.
 * Tracks who did what, when, and what changed.
 *
 * Used for:
 * - Compliance auditing
 * - Debug and troubleshooting
 * - Performance analysis
 * - Security investigation
 */
@Entity('audit_logs')
@Index(['userId'])
@Index(['organizationId'])
@Index(['resourceType', 'resourceId'])
@Index(['action'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  organizationId!: string;

  @Column()
  action!: string; // e.g., "create", "update", "delete", "login", "permission_change"

  @Column()
  resourceType!: string; // e.g., "organization", "user", "permission", "report"

  @Column({ nullable: true })
  resourceId?: string; // ID of the resource being operated on

  @Column({ type: 'jsonb', nullable: true })
  changes?: Record<string, any>; // What was changed: { field: { old: value, new: value } }

  @Column({ nullable: true })
  ipAddress?: string; // IP address of the request

  @Column({ nullable: true })
  userAgent?: string; // User agent string

  @Column({ nullable: true })
  status?: string; // "success", "error", "partial"

  @Column({ nullable: true })
  errorMessage?: string; // If status is "error"

  @Column({ type: 'integer', nullable: true })
  duration?: number; // Request duration in milliseconds

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Additional context

  @Column({ nullable: true })
  description?: string; // Human-readable description

  @Column({ nullable: true })
  severity?: string; // "info", "warning", "critical"

  @Column({ default: false })
  isSystemOperation!: boolean; // True if initiated by system (not user)

  @CreateDateColumn()
  createdAt!: Date;

  constructor(partial?: Partial<AuditLog>) {
    Object.assign(this, partial);
  }
}
