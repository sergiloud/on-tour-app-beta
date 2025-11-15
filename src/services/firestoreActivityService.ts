/**
 * Firestore Activity Feed Service
 * 
 * Manages real-time activity logging and streaming for team collaboration.
 * Records user actions across Shows, Finance, Contracts, Travel, etc.
 * 
 * Features:
 * - Real-time activity stream via onSnapshot
 * - Automatic deduplication (prevent duplicate logs)
 * - Priority tagging (high/medium/low)
 * - Activity filtering by type, user, date range
 * - Auto-cleanup of old activities (>90 days)
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  doc,
  deleteDoc,
  getDocs,
  type DocumentData,
  type QueryConstraint
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type ActivityType =
  | 'show_added'
  | 'show_updated'
  | 'show_deleted'
  | 'finance_updated'
  | 'contract_signed'
  | 'travel_booked'
  | 'contact_added'
  | 'mission_completed'
  | 'alert_triggered'
  | 'member_invited'
  | 'settings_changed';

export type ActivityPriority = 'high' | 'medium' | 'low';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  userId: string; // User who performed the action
  userName: string; // Display name
  organizationId: string;
  priority?: ActivityPriority;
  metadata?: Record<string, any>; // Type-specific data
  relatedId?: string; // Related show/contract/contact ID
}

interface FirestoreActivity extends Omit<Activity, 'id' | 'timestamp'> {
  timestamp: Timestamp;
}

export class FirestoreActivityService {
  private static activitiesCollection = 'activities';
  private static deduplicationCache = new Map<string, number>();
  private static DEDUP_WINDOW_MS = 5000; // 5 seconds

  /**
   * Log a new activity to Firestore
   */
  static async logActivity(
    activity: Omit<Activity, 'id' | 'timestamp'>,
    userId: string,
    organizationId: string
  ): Promise<string> {
    if (!db) {
      console.warn('[ActivityService] Firestore not initialized');
      return '';
    }

    try {
      // Deduplication: prevent logging same action multiple times
      const dedupKey = `${activity.type}:${activity.relatedId}:${userId}`;
      const lastLogTime = this.deduplicationCache.get(dedupKey);
      const now = Date.now();

      if (lastLogTime && now - lastLogTime < this.DEDUP_WINDOW_MS) {
        console.log('[ActivityService] Duplicate activity prevented:', dedupKey);
        return ''; // Skip duplicate
      }

      this.deduplicationCache.set(dedupKey, now);

      const activityData: FirestoreActivity = {
        ...activity,
        userId,
        organizationId,
        timestamp: Timestamp.now()
      };

      const docRef = await addDoc(
        collection(db!, this.activitiesCollection),
        activityData
      );

      console.log('[ActivityService] Activity logged:', docRef.id, activity.type);
      return docRef.id;
    } catch (error) {
      console.error('[ActivityService] Failed to log activity:', error);
      return ''; // Fail silently
    }
  }

  /**
   * Subscribe to real-time activity feed
   */
  static subscribeToActivities(
    organizationId: string,
    callback: (activities: Activity[]) => void,
    options: {
      maxItems?: number;
      type?: ActivityType;
      userId?: string;
      sinceDate?: Date;
    } = {}
  ): () => void {
    try {
      const constraints: QueryConstraint[] = [
        where('organizationId', '==', organizationId),
        orderBy('timestamp', 'desc')
      ];

      if (options.type) {
        constraints.push(where('type', '==', options.type));
      }

      if (options.userId) {
        constraints.push(where('userId', '==', options.userId));
      }

      if (options.sinceDate) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(options.sinceDate)));
      }

      if (options.maxItems) {
        constraints.push(limit(options.maxItems));
      }

      const q = query(
        collection(db!, this.activitiesCollection),
        ...constraints
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const activities: Activity[] = snapshot.docs.map(doc => {
            const data = doc.data() as FirestoreActivity;
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp.toDate()
            };
          });

          callback(activities);
        },
        (error) => {
          console.error('[ActivityService] Subscription error:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('[ActivityService] Failed to subscribe:', error);
      return () => {};
    }
  }

  /**
   * Get activities (one-time fetch)
   */
  static async getActivities(
    organizationId: string,
    options: {
      maxItems?: number;
      type?: ActivityType;
      userId?: string;
    } = {}
  ): Promise<Activity[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('organizationId', '==', organizationId),
        orderBy('timestamp', 'desc')
      ];

      if (options.type) {
        constraints.push(where('type', '==', options.type));
      }

      if (options.userId) {
        constraints.push(where('userId', '==', options.userId));
      }

      if (options.maxItems) {
        constraints.push(limit(options.maxItems));
      }

      const q = query(
        collection(db!, this.activitiesCollection),
        ...constraints
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreActivity;
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate()
        };
      });
    } catch (error) {
      console.error('[ActivityService] Failed to fetch activities:', error);
      return [];
    }
  }

  /**
   * Delete old activities (cleanup task - run periodically)
   */
  static async cleanupOldActivities(
    organizationId: string,
    daysToKeep: number = 90
  ): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const q = query(
        collection(db!, this.activitiesCollection),
        where('organizationId', '==', organizationId),
        where('timestamp', '<', Timestamp.fromDate(cutoffDate))
      );

      const snapshot = await getDocs(q);
      let deleted = 0;

      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db!, this.activitiesCollection, docSnapshot.id));
        deleted++;
      }

      console.log(`[ActivityService] Cleaned up ${deleted} old activities`);
      return deleted;
    } catch (error) {
      console.error('[ActivityService] Cleanup failed:', error);
      return 0;
    }
  }

  /**
   * Helper: Log show-related activity
   */
  static async logShowActivity(
    action: 'added' | 'updated' | 'deleted',
    showId: string,
    showTitle: string,
    userId: string,
    userName: string,
    organizationId: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const typeMap = {
      added: 'show_added',
      updated: 'show_updated',
      deleted: 'show_deleted'
    } as const;

    return this.logActivity(
      {
        type: typeMap[action],
        title: `Show ${action}`,
        description: `${userName} ${action} show: ${showTitle}`,
        userId,
        userName,
        organizationId,
        priority: action === 'deleted' ? 'medium' : 'low',
        metadata,
        relatedId: showId
      },
      userId,
      organizationId
    );
  }

  /**
   * Helper: Log finance activity
   */
  static async logFinanceActivity(
    description: string,
    userId: string,
    userName: string,
    organizationId: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.logActivity(
      {
        type: 'finance_updated',
        title: 'Finance Updated',
        description: `${userName} ${description}`,
        userId,
        userName,
        organizationId,
        priority: 'medium',
        metadata
      },
      userId,
      organizationId
    );
  }

  /**
   * Helper: Log contract activity
   */
  static async logContractActivity(
    userId: string,
    organizationId: string,
    contractId: string,
    action: 'created' | 'updated' | 'signed' | 'deleted',
    metadata?: {
      contractTitle?: string;
      contractStatus?: string;
      showId?: string;
      userName?: string;
    }
  ): Promise<string> {
    const userName = metadata?.userName || 'User';
    const contractTitle = metadata?.contractTitle || 'Contract';
    
    const typeMap = {
      created: { type: 'contract_created', title: 'Contract Created', description: `${userName} created contract: ${contractTitle}` },
      updated: { type: 'contract_updated', title: 'Contract Updated', description: `${userName} updated contract: ${contractTitle}` },
      signed: { type: 'contract_signed', title: 'Contract Signed', description: `${userName} signed contract: ${contractTitle}` },
      deleted: { type: 'contract_deleted', title: 'Contract Deleted', description: `${userName} deleted contract: ${contractTitle}` },
    };
    
    const { type, title, description } = typeMap[action];
    
    return this.logActivity(
      {
        type: type as any,
        title,
        description,
        userId,
        userName,
        organizationId,
        priority: action === 'signed' ? 'high' : 'medium',
        relatedId: contractId,
        metadata: metadata || {}
      },
      userId,
      organizationId
    );
  }
}
