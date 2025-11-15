/**
 * Audit Log Types
 * 
 * Defines types for audit logging system that tracks
 * critical actions in organizations for security and debugging.
 */

export type AuditAction =
  // Member management
  | 'member.invited'
  | 'member.joined'
  | 'member.removed'
  | 'member.role_changed'
  // Finance actions
  | 'finance.transaction_created'
  | 'finance.transaction_updated'
  | 'finance.transaction_deleted'
  | 'finance.snapshot_created'
  | 'finance.snapshot_deleted'
  | 'finance.exported'
  // Show management
  | 'show.created'
  | 'show.updated'
  | 'show.deleted'
  // Organization management
  | 'org.settings_changed'
  | 'org.deleted'
  // Calendar actions
  | 'calendar.event_created'
  | 'calendar.event_updated'
  | 'calendar.event_deleted'
  // Contact actions
  | 'contact.created'
  | 'contact.updated'
  | 'contact.deleted'
  // Travel actions
  | 'travel.itinerary_created'
  | 'travel.itinerary_updated'
  | 'travel.itinerary_deleted';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  action: AuditAction;
  severity: AuditSeverity;
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: Date;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilter {
  action?: AuditAction | AuditAction[];
  severity?: AuditSeverity | AuditSeverity[];
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

// Severity mapping for different actions
export const ACTION_SEVERITY: Record<AuditAction, AuditSeverity> = {
  // Critical actions
  'member.removed': 'critical',
  'member.role_changed': 'critical',
  'finance.transaction_deleted': 'critical',
  'finance.snapshot_deleted': 'critical',
  'show.deleted': 'critical',
  'org.deleted': 'critical',
  'org.settings_changed': 'critical',
  
  // Warning actions
  'finance.transaction_updated': 'warning',
  'finance.exported': 'warning',
  'show.updated': 'warning',
  'contact.deleted': 'warning',
  'calendar.event_deleted': 'warning',
  'travel.itinerary_deleted': 'warning',
  
  // Info actions
  'member.invited': 'info',
  'member.joined': 'info',
  'finance.transaction_created': 'info',
  'finance.snapshot_created': 'info',
  'show.created': 'info',
  'calendar.event_created': 'info',
  'calendar.event_updated': 'info',
  'contact.created': 'info',
  'contact.updated': 'info',
  'travel.itinerary_created': 'info',
  'travel.itinerary_updated': 'info',
};

// Human-readable action labels for UI
export const ACTION_LABELS: Record<AuditAction, string> = {
  'member.invited': 'Member invited',
  'member.joined': 'Member joined',
  'member.removed': 'Member removed',
  'member.role_changed': 'Member role changed',
  'finance.transaction_created': 'Transaction created',
  'finance.transaction_updated': 'Transaction updated',
  'finance.transaction_deleted': 'Transaction deleted',
  'finance.snapshot_created': 'Finance snapshot created',
  'finance.snapshot_deleted': 'Finance snapshot deleted',
  'finance.exported': 'Finance data exported',
  'show.created': 'Show created',
  'show.updated': 'Show updated',
  'show.deleted': 'Show deleted',
  'org.settings_changed': 'Organization settings changed',
  'org.deleted': 'Organization deleted',
  'calendar.event_created': 'Calendar event created',
  'calendar.event_updated': 'Calendar event updated',
  'calendar.event_deleted': 'Calendar event deleted',
  'contact.created': 'Contact created',
  'contact.updated': 'Contact updated',
  'contact.deleted': 'Contact deleted',
  'travel.itinerary_created': 'Itinerary created',
  'travel.itinerary_updated': 'Itinerary updated',
  'travel.itinerary_deleted': 'Itinerary deleted',
};
