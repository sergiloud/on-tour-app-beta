/**
 * Audit Log Hook
 * 
 * Provides functions to create and query audit logs.
 * Audit logs track critical actions for security and debugging.
 */

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type {
  AuditAction,
  AuditLogEntry,
  AuditLogFilter,
  AuditSeverity,
} from '../types/audit';
import { ACTION_SEVERITY } from '../types/audit';

/**
 * Create an audit log entry
 * 
 * @param organizationId - Organization ID
 * @param action - Action type
 * @param metadata - Additional metadata about the action
 * @returns Promise that resolves when log is created
 */
export async function createAuditLog(
  organizationId: string,
  action: AuditAction,
  metadata: Record<string, any> = {}
): Promise<void> {
  if (!db || !auth?.currentUser) {
    console.warn('Cannot create audit log: Firebase not initialized');
    return;
  }

  try {
    const auditLogsRef = collection(db, `organizations/${organizationId}/audit_logs`);
    
    const logEntry = {
      organizationId,
      action,
      severity: ACTION_SEVERITY[action],
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email || '',
      userName: auth.currentUser.displayName || auth.currentUser.email || 'Unknown',
      timestamp: Timestamp.now(),
      metadata,
      // Optional: Add IP address and user agent if available
      // ipAddress: request.ip, // Would need backend
      // userAgent: navigator.userAgent,
    };

    await addDoc(auditLogsRef, logEntry);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break main functionality
  }
}

/**
 * Hook to fetch audit logs with filtering
 */
export function useAuditLogs(organizationId: string, filter?: AuditLogFilter) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !organizationId) {
      setIsLoading(false);
      return;
    }

    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const auditLogsRef = collection(db, `organizations/${organizationId}/audit_logs`);
        
        // Build query with filters
        let q = query(auditLogsRef, orderBy('timestamp', 'desc'));
        
        if (filter?.action) {
          const actions = Array.isArray(filter.action) ? filter.action : [filter.action];
          q = query(q, where('action', 'in', actions));
        }
        
        if (filter?.severity) {
          const severities = Array.isArray(filter.severity) ? filter.severity : [filter.severity];
          q = query(q, where('severity', 'in', severities));
        }
        
        if (filter?.userId) {
          q = query(q, where('userId', '==', filter.userId));
        }
        
        if (filter?.startDate) {
          q = query(q, where('timestamp', '>=', Timestamp.fromDate(filter.startDate)));
        }
        
        if (filter?.endDate) {
          q = query(q, where('timestamp', '<=', Timestamp.fromDate(filter.endDate)));
        }
        
        if (filter?.limit) {
          q = query(q, firestoreLimit(filter.limit));
        } else {
          q = query(q, firestoreLimit(100)); // Default limit
        }

        const snapshot = await getDocs(q);
        
        const fetchedLogs: AuditLogEntry[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            organizationId: data.organizationId,
            action: data.action,
            severity: data.severity,
            userId: data.userId,
            userEmail: data.userEmail,
            userName: data.userName,
            timestamp: data.timestamp?.toDate() || new Date(),
            metadata: data.metadata || {},
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
          };
        });

        setLogs(fetchedLogs);
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch audit logs'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [organizationId, filter?.action, filter?.severity, filter?.userId, filter?.startDate, filter?.endDate, filter?.limit]);

  return { logs, isLoading, error };
}

/**
 * Hook to fetch recent critical audit logs
 */
export function useCriticalAuditLogs(organizationId: string, limit = 20) {
  return useAuditLogs(organizationId, {
    severity: 'critical',
    limit,
  });
}

/**
 * Helper function to format audit log for display
 */
export function formatAuditLog(log: AuditLogEntry): string {
  const action = log.action.replace(/\./g, ' ').replace(/_/g, ' ');
  const metadata = Object.entries(log.metadata)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  
  return `${log.userName} ${action}${metadata ? ` (${metadata})` : ''}`;
}
