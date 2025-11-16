/**
 * Audit Log Types
 * 
 * Comprehensive audit logging for security and compliance
 * Tracks all critical operations across the platform
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Audit event categories
 */
export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  ORGANIZATION = 'organization',
  MEMBER = 'member',
  SHOW = 'show',
  FINANCE = 'finance',
  CONTACT = 'contact',
  VENUE = 'venue',
  INVITATION = 'invitation',
  SETTINGS = 'settings',
  SECURITY = 'security',
  DATA = 'data',
}

/**
 * Audit action types
 */
export enum AuditAction {
  // Auth actions
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET = 'password_reset',
  
  // Authorization actions
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',
  ACCESS_DENIED = 'access_denied',
  
  // Organization actions
  ORG_CREATED = 'org_created',
  ORG_UPDATED = 'org_updated',
  ORG_DELETED = 'org_deleted',
  ORG_SETTINGS_CHANGED = 'org_settings_changed',
  
  // Member actions
  MEMBER_INVITED = 'member_invited',
  MEMBER_JOINED = 'member_joined',
  MEMBER_REMOVED = 'member_removed',
  MEMBER_ROLE_CHANGED = 'member_role_changed',
  MEMBER_UPDATED = 'member_updated',
  
  // Show actions
  SHOW_CREATED = 'show_created',
  SHOW_UPDATED = 'show_updated',
  SHOW_DELETED = 'show_deleted',
  SHOW_STATUS_CHANGED = 'show_status_changed',
  
  // Finance actions
  FINANCE_CREATED = 'finance_created',
  FINANCE_UPDATED = 'finance_updated',
  FINANCE_DELETED = 'finance_deleted',
  FINANCE_EXPORTED = 'finance_exported',
  
  // Contact actions
  CONTACT_CREATED = 'contact_created',
  CONTACT_UPDATED = 'contact_updated',
  CONTACT_DELETED = 'contact_deleted',
  CONTACT_IMPORTED = 'contact_imported',
  
  // Venue actions
  VENUE_CREATED = 'venue_created',
  VENUE_UPDATED = 'venue_updated',
  VENUE_DELETED = 'venue_deleted',
  
  // Invitation actions
  INVITE_SENT = 'invite_sent',
  INVITE_ACCEPTED = 'invite_accepted',
  INVITE_REJECTED = 'invite_rejected',
  INVITE_CANCELLED = 'invite_cancelled',
  LINK_INVITE_CREATED = 'link_invite_created',
  LINK_INVITE_USED = 'link_invite_used',
  LINK_INVITE_REVOKED = 'link_invite_revoked',
  
  // Settings actions
  SETTINGS_UPDATED = 'settings_updated',
  CURRENCY_CHANGED = 'currency_changed',
  LANGUAGE_CHANGED = 'language_changed',
  
  // Security actions
  SECURITY_RULE_UPDATED = 'security_rule_updated',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  
  // Data actions
  DATA_EXPORTED = 'data_exported',
  DATA_IMPORTED = 'data_imported',
  BULK_DELETE = 'bulk_delete',
  BULK_UPDATE = 'bulk_update',
}

/**
 * Severity levels for audit events
 */
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Entity reference in audit log
 */
export interface AuditEntityRef {
  /** Entity type (e.g., 'show', 'member', 'organization') */
  type: string;
  /** Entity ID */
  id: string;
  /** Entity name or title for display */
  name?: string;
}

/**
 * Metadata for audit events
 */
export interface AuditMetadata {
  /** IP address of the user */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Request ID for correlation */
  requestId?: string;
  /** Previous value (for updates) */
  previousValue?: any;
  /** New value (for updates) */
  newValue?: any;
  /** Changed fields (for updates) */
  changedFields?: string[];
  /** Additional context-specific data */
  [key: string]: any;
}

/**
 * Complete audit log event
 */
export interface AuditEvent {
  /** Unique event ID */
  id: string;
  
  /** Organization ID */
  organizationId: string;
  
  /** Event category */
  category: AuditCategory;
  
  /** Action performed */
  action: AuditAction;
  
  /** Severity level */
  severity: AuditSeverity;
  
  /** User who performed the action */
  userId: string;
  
  /** User email */
  userEmail: string;
  
  /** User display name */
  userName?: string;
  
  /** Entity affected by the action */
  entity?: AuditEntityRef;
  
  /** Related entities (e.g., organization, team) */
  relatedEntities?: AuditEntityRef[];
  
  /** Human-readable description */
  description: string;
  
  /** Event metadata */
  metadata?: AuditMetadata;
  
  /** Timestamp when event occurred */
  timestamp: Timestamp | Date;
  
  /** Success status */
  success: boolean;
  
  /** Error message (if failed) */
  errorMessage?: string;
  
  /** Tags for filtering */
  tags?: string[];
}

/**
 * Audit log query filters
 */
export interface AuditLogFilters {
  /** Filter by organization ID */
  organizationId?: string;
  
  /** Filter by user ID */
  userId?: string;
  
  /** Filter by category */
  category?: AuditCategory | AuditCategory[];
  
  /** Filter by action */
  action?: AuditAction | AuditAction[];
  
  /** Filter by severity */
  severity?: AuditSeverity | AuditSeverity[];
  
  /** Filter by entity type */
  entityType?: string;
  
  /** Filter by entity ID */
  entityId?: string;
  
  /** Filter by date range (start) */
  startDate?: Date;
  
  /** Filter by date range (end) */
  endDate?: Date;
  
  /** Filter by success status */
  success?: boolean;
  
  /** Search query for description */
  searchQuery?: string;
  
  /** Tags to filter by */
  tags?: string[];
  
  /** Limit results */
  limit?: number;
  
  /** Offset for pagination */
  offset?: number;
}

/**
 * Audit log creation payload (without auto-generated fields)
 */
export type CreateAuditEventPayload = Omit<AuditEvent, 'id' | 'timestamp'> & {
  timestamp?: Date;
};

/**
 * Audit log retention policy
 */
export interface AuditRetentionPolicy {
  /** Days to retain audit logs (default: 365) */
  retentionDays: number;
  
  /** Whether to archive before deletion */
  archiveBeforeDelete: boolean;
  
  /** Archive storage location */
  archiveLocation?: string;
}
