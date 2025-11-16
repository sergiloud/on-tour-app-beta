/**
 * Audit Log Service
 * 
 * Comprehensive audit logging for security and compliance
 * 
 * Features:
 * - Log all critical operations
 * - Real-time audit trail
 * - Advanced filtering and search
 * - Automatic retention management
 * - Export capabilities
 * 
 * @example
 * // Log a critical operation
 * await auditLogService.log({
 *   organizationId: 'org123',
 *   category: AuditCategory.MEMBER,
 *   action: AuditAction.MEMBER_ROLE_CHANGED,
 *   severity: AuditSeverity.WARNING,
 *   userId: currentUser.uid,
 *   userEmail: currentUser.email,
 *   userName: currentUser.displayName,
 *   entity: { type: 'member', id: 'member123', name: 'John Doe' },
 *   description: 'Changed member role from Viewer to Admin',
 *   metadata: {
 *     previousValue: 'viewer',
 *     newValue: 'admin',
 *     changedFields: ['role'],
 *   },
 *   success: true,
 * });
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  Timestamp,
  Query,
  DocumentData,
  QueryConstraint,
  deleteDoc,
  doc,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  AuditEvent,
  CreateAuditEventPayload,
  AuditLogFilters,
  AuditCategory,
  AuditAction,
  AuditSeverity,
  AuditRetentionPolicy,
} from '../types/auditLog';

class AuditLogService {
  private readonly COLLECTION = 'auditLogs';
  private readonly DEFAULT_LIMIT = 50;
  private readonly MAX_LIMIT = 500;

  /**
   * Log an audit event
   */
  async log(payload: CreateAuditEventPayload): Promise<string> {
    if (!db) {
      console.warn('[AuditLog] Firebase not initialized');
      return '';
    }

    try {
      const event: Omit<AuditEvent, 'id'> = {
        ...payload,
        timestamp: payload.timestamp
          ? Timestamp.fromDate(payload.timestamp)
          : Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), event);
      
      console.log(`[AuditLog] ${payload.action} by ${payload.userEmail}`, {
        eventId: docRef.id,
        category: payload.category,
        success: payload.success,
      });

      return docRef.id;
    } catch (error) {
      console.error('[AuditLog] Failed to log event:', error);
      // Don't throw - audit logging should never break the main operation
      return '';
    }
  }

  /**
   * Log authentication event
   */
  async logAuth(
    action: AuditAction.LOGIN | AuditAction.LOGOUT | AuditAction.LOGIN_FAILED,
    userId: string,
    userEmail: string,
    userName: string | undefined,
    organizationId: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.log({
      organizationId,
      category: AuditCategory.AUTHENTICATION,
      action,
      severity: action === AuditAction.LOGIN_FAILED ? AuditSeverity.WARNING : AuditSeverity.INFO,
      userId,
      userEmail,
      userName,
      description: this.getActionDescription(action, { userEmail }),
      metadata,
      success: action !== AuditAction.LOGIN_FAILED,
    });
  }

  /**
   * Log organization event
   */
  async logOrganization(
    action: AuditAction,
    userId: string,
    userEmail: string,
    userName: string | undefined,
    organizationId: string,
    orgName: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.log({
      organizationId,
      category: AuditCategory.ORGANIZATION,
      action,
      severity: action === AuditAction.ORG_DELETED ? AuditSeverity.CRITICAL : AuditSeverity.INFO,
      userId,
      userEmail,
      userName,
      entity: { type: 'organization', id: organizationId, name: orgName },
      description: this.getActionDescription(action, { orgName }),
      metadata,
      success: true,
    });
  }

  /**
   * Log member management event
   */
  async logMember(
    action: AuditAction,
    userId: string,
    userEmail: string,
    userName: string | undefined,
    organizationId: string,
    memberId: string,
    memberName: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const severity =
      action === AuditAction.MEMBER_REMOVED
        ? AuditSeverity.WARNING
        : action === AuditAction.MEMBER_ROLE_CHANGED
        ? AuditSeverity.WARNING
        : AuditSeverity.INFO;

    return this.log({
      organizationId,
      category: AuditCategory.MEMBER,
      action,
      severity,
      userId,
      userEmail,
      userName,
      entity: { type: 'member', id: memberId, name: memberName },
      description: this.getActionDescription(action, { memberName, ...metadata }),
      metadata,
      success: true,
    });
  }

  /**
   * Log show event
   */
  async logShow(
    action: AuditAction,
    userId: string,
    userEmail: string,
    userName: string | undefined,
    organizationId: string,
    showId: string,
    showName: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.log({
      organizationId,
      category: AuditCategory.SHOW,
      action,
      severity: action === AuditAction.SHOW_DELETED ? AuditSeverity.WARNING : AuditSeverity.INFO,
      userId,
      userEmail,
      userName,
      entity: { type: 'show', id: showId, name: showName },
      description: this.getActionDescription(action, { showName }),
      metadata,
      success: true,
    });
  }

  /**
   * Log finance event
   */
  async logFinance(
    action: AuditAction,
    userId: string,
    userEmail: string,
    userName: string | undefined,
    organizationId: string,
    entityId: string,
    entityName: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.log({
      organizationId,
      category: AuditCategory.FINANCE,
      action,
      severity: action === AuditAction.FINANCE_DELETED ? AuditSeverity.WARNING : AuditSeverity.INFO,
      userId,
      userEmail,
      userName,
      entity: { type: 'finance', id: entityId, name: entityName },
      description: this.getActionDescription(action, { entityName }),
      metadata,
      success: true,
    });
  }

  /**
   * Query audit logs with filters
   */
  async query(filters: AuditLogFilters = {}): Promise<AuditEvent[]> {
    if (!db) {
      console.warn('[AuditLog] Firebase not initialized');
      return [];
    }

    try {
      const constraints: QueryConstraint[] = [];

      // Organization filter (required for multi-tenancy)
      if (filters.organizationId) {
        constraints.push(where('organizationId', '==', filters.organizationId));
      }

      // User filter
      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }

      // Category filter
      if (filters.category) {
        const categories = Array.isArray(filters.category)
          ? filters.category
          : [filters.category];
        constraints.push(where('category', 'in', categories));
      }

      // Action filter
      if (filters.action) {
        const actions = Array.isArray(filters.action) ? filters.action : [filters.action];
        constraints.push(where('action', 'in', actions));
      }

      // Severity filter
      if (filters.severity) {
        const severities = Array.isArray(filters.severity)
          ? filters.severity
          : [filters.severity];
        constraints.push(where('severity', 'in', severities));
      }

      // Entity type filter
      if (filters.entityType) {
        constraints.push(where('entity.type', '==', filters.entityType));
      }

      // Entity ID filter
      if (filters.entityId) {
        constraints.push(where('entity.id', '==', filters.entityId));
      }

      // Success filter
      if (filters.success !== undefined) {
        constraints.push(where('success', '==', filters.success));
      }

      // Date range filters
      if (filters.startDate) {
        constraints.push(
          where('timestamp', '>=', Timestamp.fromDate(filters.startDate))
        );
      }
      if (filters.endDate) {
        constraints.push(
          where('timestamp', '<=', Timestamp.fromDate(filters.endDate))
        );
      }

      // Order by timestamp (most recent first)
      constraints.push(orderBy('timestamp', 'desc'));

      // Limit
      const queryLimit = Math.min(
        filters.limit || this.DEFAULT_LIMIT,
        this.MAX_LIMIT
      );
      constraints.push(limit(queryLimit));

      const q = query(collection(db, this.COLLECTION), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuditEvent[];
    } catch (error) {
      console.error('[AuditLog] Query failed:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time audit log updates
   */
  subscribe(
    filters: AuditLogFilters,
    callback: (events: AuditEvent[]) => void
  ): Unsubscribe {
    if (!db) {
      console.warn('[AuditLog] Firebase not initialized');
      return () => {};
    }

    try {
      const constraints: QueryConstraint[] = [];

      // Organization filter (required)
      if (filters.organizationId) {
        constraints.push(where('organizationId', '==', filters.organizationId));
      }

      // Apply other filters similar to query()
      if (filters.category) {
        const categories = Array.isArray(filters.category)
          ? filters.category
          : [filters.category];
        constraints.push(where('category', 'in', categories));
      }

      // Order and limit
      constraints.push(orderBy('timestamp', 'desc'));
      constraints.push(limit(filters.limit || this.DEFAULT_LIMIT));

      const q = query(collection(db, this.COLLECTION), ...constraints);

      return onSnapshot(
        q,
        (snapshot) => {
          const events = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as AuditEvent[];
          callback(events);
        },
        (error) => {
          console.error('[AuditLog] Subscription error:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('[AuditLog] Subscribe failed:', error);
      return () => {}; // Return no-op unsubscribe
    }
  }

  /**
   * Clean up old audit logs based on retention policy
   */
  async cleanup(policy: AuditRetentionPolicy): Promise<number> {
    if (!db) {
      console.warn('[AuditLog] Firebase not initialized');
      return 0;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

      const q = query(
        collection(db, this.COLLECTION),
        where('timestamp', '<', Timestamp.fromDate(cutoffDate)),
        limit(500) // Process in batches
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return 0;
      }

      // Batch delete
      const batch = writeBatch(db);
      snapshot.docs.forEach((document) => {
        batch.delete(document.ref);
      });

      await batch.commit();

      console.log(`[AuditLog] Deleted ${snapshot.size} old audit logs`);
      return snapshot.size;
    } catch (error) {
      console.error('[AuditLog] Cleanup failed:', error);
      return 0;
    }
  }

  /**
   * Get action description for display
   */
  private getActionDescription(
    action: AuditAction,
    context: Record<string, any> = {}
  ): string {
    const descriptions: Record<string, string> = {
      // Auth
      [AuditAction.LOGIN]: `User ${context.userEmail} logged in`,
      [AuditAction.LOGOUT]: `User ${context.userEmail} logged out`,
      [AuditAction.LOGIN_FAILED]: `Failed login attempt for ${context.userEmail}`,
      [AuditAction.MFA_ENABLED]: 'Multi-factor authentication enabled',
      [AuditAction.MFA_DISABLED]: 'Multi-factor authentication disabled',
      [AuditAction.PASSWORD_CHANGED]: 'Password changed',
      
      // Organization
      [AuditAction.ORG_CREATED]: `Organization "${context.orgName}" created`,
      [AuditAction.ORG_UPDATED]: `Organization "${context.orgName}" updated`,
      [AuditAction.ORG_DELETED]: `Organization "${context.orgName}" deleted`,
      [AuditAction.ORG_SETTINGS_CHANGED]: 'Organization settings changed',
      
      // Member
      [AuditAction.MEMBER_INVITED]: `Invited ${context.memberName} to organization`,
      [AuditAction.MEMBER_JOINED]: `${context.memberName} joined organization`,
      [AuditAction.MEMBER_REMOVED]: `Removed ${context.memberName} from organization`,
      [AuditAction.MEMBER_ROLE_CHANGED]: `Changed ${context.memberName}'s role from ${context.previousValue} to ${context.newValue}`,
      
      // Show
      [AuditAction.SHOW_CREATED]: `Created show "${context.showName}"`,
      [AuditAction.SHOW_UPDATED]: `Updated show "${context.showName}"`,
      [AuditAction.SHOW_DELETED]: `Deleted show "${context.showName}"`,
      
      // Finance
      [AuditAction.FINANCE_CREATED]: `Created finance record "${context.entityName}"`,
      [AuditAction.FINANCE_UPDATED]: `Updated finance record "${context.entityName}"`,
      [AuditAction.FINANCE_DELETED]: `Deleted finance record "${context.entityName}"`,
      [AuditAction.FINANCE_EXPORTED]: 'Exported finance data',
      
      // Invitations
      [AuditAction.LINK_INVITE_CREATED]: `Created link invitation for ${context.role} role`,
      [AuditAction.LINK_INVITE_USED]: `Used link invitation`,
      [AuditAction.LINK_INVITE_REVOKED]: `Revoked link invitation`,
    };

    return descriptions[action] || `Performed ${action}`;
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService();
export default auditLogService;
