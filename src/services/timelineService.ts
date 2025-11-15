/**
 * Timeline Service
 * 
 * Unified activity timeline consolidating all organization events:
 * - Shows (added, updated, confirmed, cancelled)
 * - Finance (transactions, expenses, payments)
 * - Contracts (signed, pending, expired)
 * - Travel (booked, updated, cancelled)
 * - Collaboration (member actions, comments, assignments)
 * - Audit logs (settings changes, permissions)
 * 
 * Features:
 * - Smart grouping (e.g., "3 expenses added" instead of 3 separate items)
 * - Advanced filtering (by module, user, show, importance)
 * - Real-time updates via Socket.io
 * - Virtualization support with pagination
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  type QueryConstraint,
  getDocs,
  startAfter,
  type DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Show } from '../lib/shows';

// Timeline event types categorized by module
export type TimelineEventType =
  // Shows module
  | 'show_added'
  | 'show_updated'
  | 'show_confirmed'
  | 'show_cancelled'
  | 'show_deleted'
  // Finance module
  | 'transaction_added'
  | 'expense_added'
  | 'payment_received'
  | 'payment_sent'
  | 'finance_updated'
  // Contracts module
  | 'contract_signed'
  | 'contract_pending'
  | 'contract_expired'
  | 'contract_updated'
  // Travel module
  | 'travel_booked'
  | 'travel_updated'
  | 'travel_cancelled'
  | 'accommodation_booked'
  // Collaboration module
  | 'member_invited'
  | 'member_removed'
  | 'comment_added'
  | 'task_assigned'
  | 'task_completed'
  // Audit logs
  | 'settings_changed'
  | 'permission_updated'
  | 'alert_triggered';

export type TimelineModule = 'shows' | 'finance' | 'contracts' | 'travel' | 'collaboration' | 'audit' | 'all';
export type TimelineImportance = 'critical' | 'high' | 'medium' | 'low' | 'all';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  module: Exclude<TimelineModule, 'all'>; // Cannot be 'all'
  importance: Exclude<TimelineImportance, 'all'>; // Cannot be 'all'
  title: string;
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
  organizationId: string;
  
  // Optional contextual data
  relatedId?: string; // Show ID, transaction ID, contract ID, etc.
  relatedName?: string; // Show city, contract title, etc.
  amount?: number; // For financial events
  metadata?: Record<string, any>;
  
  // Smart grouping support
  groupKey?: string; // Key to group similar events
  groupCount?: number; // Number of events in group
  isGrouped?: boolean; // Whether this is a grouped event
}

export interface TimelineFilters {
  module?: TimelineModule;
  importance?: TimelineImportance;
  userId?: string; // Filter by specific user
  showId?: string; // Filter by show context
  searchQuery?: string;
  dateRange?: '7' | '30' | '90' | 'all'; // Days to look back
}

interface FirestoreTimelineEvent extends Omit<TimelineEvent, 'id' | 'timestamp'> {
  timestamp: Timestamp;
}

export class TimelineService {
  private static eventsCollection = 'activities'; // Use same collection as ActivityService
  private static PAGE_SIZE = 50;

  /**
   * Subscribe to real-time timeline events
   */
  static subscribeToTimeline(
    organizationId: string,
    callback: (events: TimelineEvent[]) => void,
    filters: TimelineFilters = {}
  ): () => void {
    if (!db) {
      console.warn('[TimelineService] Firestore not initialized');
      return () => {};
    }

    try {
      const constraints: QueryConstraint[] = [
        where('organizationId', '==', organizationId),
        orderBy('timestamp', 'desc'),
        limit(this.PAGE_SIZE)
      ];

      // Apply module filter
      if (filters.module && filters.module !== 'all') {
        constraints.push(where('module', '==', filters.module));
      }

      // Apply importance filter
      if (filters.importance && filters.importance !== 'all') {
        constraints.push(where('importance', '==', filters.importance));
      }

      // Apply user filter
      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }

      // Apply show context filter
      if (filters.showId) {
        constraints.push(where('relatedId', '==', filters.showId));
      }

      // Apply date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const daysAgo = parseInt(filters.dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(cutoffDate)));
      }

      const q = query(
        collection(db!, this.eventsCollection),
        ...constraints
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const events: TimelineEvent[] = snapshot.docs.map(doc => {
            const data = doc.data() as FirestoreTimelineEvent;
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp.toDate()
            };
          });

          // Apply smart grouping
          const groupedEvents = this.applySmartGrouping(events);

          // Apply search filter (client-side)
          const filteredEvents = filters.searchQuery
            ? groupedEvents.filter(event => 
                event.title.toLowerCase().includes(filters.searchQuery!.toLowerCase()) ||
                event.description.toLowerCase().includes(filters.searchQuery!.toLowerCase())
              )
            : groupedEvents;

          callback(filteredEvents);
        },
        (error) => {
          console.error('[TimelineService] Subscription error:', error);
          // Call callback with empty array so UI can exit loading state
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('[TimelineService] Failed to subscribe:', error);
      // Call callback with empty array so UI can exit loading state
      callback([]);
      return () => {};
    }
  }

  /**
   * Load more timeline events (pagination)
   */
  static async loadMoreEvents(
    organizationId: string,
    lastDoc: DocumentSnapshot,
    filters: TimelineFilters = {}
  ): Promise<TimelineEvent[]> {
    if (!db) return [];

    try {
      const constraints: QueryConstraint[] = [
        where('organizationId', '==', organizationId),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(this.PAGE_SIZE)
      ];

      // Apply same filters as subscription
      if (filters.module && filters.module !== 'all') {
        constraints.push(where('module', '==', filters.module));
      }

      if (filters.importance && filters.importance !== 'all') {
        constraints.push(where('importance', '==', filters.importance));
      }

      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }

      if (filters.showId) {
        constraints.push(where('relatedId', '==', filters.showId));
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const daysAgo = parseInt(filters.dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(cutoffDate)));
      }

      const q = query(
        collection(db!, this.eventsCollection),
        ...constraints
      );

      const snapshot = await getDocs(q);
      const events: TimelineEvent[] = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreTimelineEvent;
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate()
        };
      });

      return this.applySmartGrouping(events);
    } catch (error) {
      console.error('[TimelineService] Failed to load more events:', error);
      return [];
    }
  }

  /**
   * Smart grouping: combine similar consecutive events
   * Example: "3 expenses added" instead of 3 separate expense items
   */
  private static applySmartGrouping(events: TimelineEvent[]): TimelineEvent[] {
    if (events.length === 0) return [];

    const grouped: TimelineEvent[] = [];
    let currentGroup: TimelineEvent[] = [];
    let currentGroupKey: string | null = null;

    for (const event of events) {
      // Define group key based on event type and context
      const groupKey = this.getGroupKey(event);

      // Check if event can be grouped with current group
      if (groupKey && groupKey === currentGroupKey) {
        currentGroup.push(event);
      } else {
        // Finalize current group
        if (currentGroup.length > 0) {
          grouped.push(this.createGroupedEvent(currentGroup));
        }

        // Start new group
        currentGroup = [event];
        currentGroupKey = groupKey;
      }
    }

    // Finalize last group
    if (currentGroup.length > 0) {
      grouped.push(this.createGroupedEvent(currentGroup));
    }

    return grouped;
  }

  /**
   * Get grouping key for an event
   * Returns null if event should not be grouped
   */
  private static getGroupKey(event: TimelineEvent): string | null {
    // Define which event types can be grouped
    const groupableTypes: TimelineEventType[] = [
      'expense_added',
      'transaction_added',
      'comment_added',
      'show_updated'
    ];

    if (!groupableTypes.includes(event.type)) {
      return null; // Don't group this type
    }

    // Group by type + same hour
    const hourKey = new Date(event.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH
    return `${event.type}:${event.userId}:${hourKey}`;
  }

  /**
   * Create a grouped event from multiple similar events
   */
  private static createGroupedEvent(events: TimelineEvent[]): TimelineEvent {
    const first = events[0];
    
    if (!first) {
      throw new Error('Cannot create grouped event from empty array');
    }

    if (events.length === 1) {
      return first;
    }

    const count = events.length;

    // Create grouped title based on event type
    const groupedTitle = this.getGroupedTitle(first.type, count);

    return {
      ...first,
      title: groupedTitle,
      description: `${count} ${first.type.replace('_', ' ')} by ${first.userName}`,
      groupCount: count,
      isGrouped: true,
      groupKey: this.getGroupKey(first)!
    };
  }

  /**
   * Get grouped title for event type
   */
  private static getGroupedTitle(type: TimelineEventType, count: number): string {
    const titleMap: Partial<Record<TimelineEventType, string>> = {
      'expense_added': `${count} expenses added`,
      'transaction_added': `${count} transactions added`,
      'comment_added': `${count} comments added`,
      'show_updated': `${count} shows updated`
    };

    return titleMap[type] || `${count} ${type.replace('_', ' ')}`;
  }

  /**
   * Generate demo timeline events for development
   */
  static generateDemoEvents(organizationId: string, userId: string, shows: Show[]): TimelineEvent[] {
    const now = Date.now();
    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;

    const demoEvents: TimelineEvent[] = [
      // Recent show added
      {
        id: '1',
        type: 'show_added',
        module: 'shows',
        importance: 'high',
        title: 'New show added',
        description: 'Barcelona, Spain - Festival Primavera Sound',
        timestamp: new Date(now - 2 * HOUR),
        userId,
        userName: 'Demo User',
        organizationId,
        relatedId: shows[0]?.id,
        relatedName: shows[0]?.city
      },
      // Contract signed
      {
        id: '2',
        type: 'contract_signed',
        module: 'contracts',
        importance: 'critical',
        title: 'Contract signed',
        description: 'Madrid Arena 2025 contract finalized',
        timestamp: new Date(now - 5 * HOUR),
        userId,
        userName: 'Tour Manager',
        organizationId
      },
      // Multiple expenses (will be grouped)
      {
        id: '3',
        type: 'expense_added',
        module: 'finance',
        importance: 'low',
        title: 'Expense added',
        description: 'Hotel accommodation - €450',
        timestamp: new Date(now - 1 * DAY - 1 * HOUR),
        userId,
        userName: 'Demo User',
        organizationId,
        amount: 450
      },
      {
        id: '4',
        type: 'expense_added',
        module: 'finance',
        importance: 'low',
        title: 'Expense added',
        description: 'Flight tickets - €320',
        timestamp: new Date(now - 1 * DAY - 1 * HOUR - 10 * 60 * 1000),
        userId,
        userName: 'Demo User',
        organizationId,
        amount: 320
      },
      {
        id: '5',
        type: 'expense_added',
        module: 'finance',
        importance: 'low',
        title: 'Expense added',
        description: 'Ground transportation - €85',
        timestamp: new Date(now - 1 * DAY - 1 * HOUR - 15 * 60 * 1000),
        userId,
        userName: 'Demo User',
        organizationId,
        amount: 85
      },
      // Travel booked
      {
        id: '6',
        type: 'travel_booked',
        module: 'travel',
        importance: 'medium',
        title: 'Travel booked',
        description: 'Barcelona → Madrid via AVE',
        timestamp: new Date(now - 2 * DAY),
        userId,
        userName: 'Logistics Coordinator',
        organizationId
      },
      // Payment received
      {
        id: '7',
        type: 'payment_received',
        module: 'finance',
        importance: 'high',
        title: 'Payment received',
        description: 'Deposit for Lisbon show - €7,500',
        timestamp: new Date(now - 3 * DAY),
        userId,
        userName: 'Finance Manager',
        organizationId,
        amount: 7500
      },
      // Member invited
      {
        id: '8',
        type: 'member_invited',
        module: 'collaboration',
        importance: 'medium',
        title: 'Team member invited',
        description: 'Sound Engineer added to touring team',
        timestamp: new Date(now - 5 * DAY),
        userId,
        userName: 'Tour Manager',
        organizationId
      },
      // Show confirmed
      {
        id: '9',
        type: 'show_confirmed',
        module: 'shows',
        importance: 'high',
        title: 'Show confirmed',
        description: 'Porto Festival confirmed - €18,000',
        timestamp: new Date(now - 7 * DAY),
        userId,
        userName: 'Booking Agent',
        organizationId,
        amount: 18000
      },
      // Settings changed
      {
        id: '10',
        type: 'settings_changed',
        module: 'audit',
        importance: 'low',
        title: 'Settings updated',
        description: 'Currency changed to EUR',
        timestamp: new Date(now - 10 * DAY),
        userId,
        userName: 'Admin',
        organizationId
      }
    ];

    return this.applySmartGrouping(demoEvents);
  }
}
