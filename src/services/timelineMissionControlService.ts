/**
 * Timeline Mission Control - Data Services
 * 
 * Handles timeline events, dependencies, scenarios, and conflict detection.
 * Fetches real data from Firestore/localStorage via hybrid services.
 */

import { showStore } from '../shared/showStore';
import type { Show } from '../lib/shows';

// ============================================================================
// TYPES
// ============================================================================

export type EventType = 'show' | 'travel' | 'finance' | 'task' | 'contract';
export type EventStatus = 'confirmed' | 'tentative' | 'canceled' | 'done' | 'offer';
export type EventModule = 'shows' | 'finance' | 'contracts' | 'travel' | 'collaboration';
export type EventImportance = 'critical' | 'high' | 'medium' | 'low';
export type ConflictLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TimelineEvent {
  id: string;
  orgId: string;
  type: EventType;
  title: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  status: EventStatus;
  module: EventModule;
  importance: EventImportance;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TimelineDependency {
  id: string;
  orgId: string;
  fromEventId: string;
  toEventId: string;
  type: 'before' | 'after' | 'blocks' | 'enabledBy';
  minGapMinutes?: number; // Minimum time gap required
  createdAt: Date;
}

export interface TimelineConflict {
  id: string;
  level: ConflictLevel;
  message: string;
  detail: string;
  eventIds: string[];
  type: 'timing' | 'resource' | 'financial' | 'logistics';
  autoDetected: boolean;
  resolvedAt?: Date;
}

export interface TimelineScenario {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  baseVersion?: string; // ID of the version it was forked from
  events: TimelineEvent[];
  dependencies: TimelineDependency[];
  projectedMetrics?: {
    revenue: number;
    expenses: number;
    margin: number;
    showCount: number;
  };
  createdAt: Date;
  createdBy: string;
  isActive: boolean; // Whether this is the live timeline
}

export interface CriticalPathNode {
  event: TimelineEvent;
  earliestStart: Date;
  latestStart: Date;
  slack: number; // Minutes of slack time
  isOnCriticalPath: boolean;
}

// ============================================================================
// TIMELINE SERVICE
// ============================================================================

export class TimelineMissionControlService {
  
  /**
   * Get timeline events from real user data (shows, contracts, activities, etc.)
   * @param orgId Organization ID to filter by
   * @param userId User ID to filter by
   * @param year Optional year to filter (null = all years)
   */
  static getEvents(orgId: string, userId: string, year?: number | null): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    
    // Get shows from showStore (already synced from Firebase)
    const shows = showStore.getAll();
    
    console.log(`[Timeline] Loading events for org: ${orgId}, user: ${userId}, year: ${year || 'all'}`);
    console.log(`[Timeline] Total shows in store: ${shows.length}`);
    
    for (const show of shows) {
      // Filter by orgId (tenantId) - CRITICAL for multi-tenant
      if (show.tenantId !== orgId) continue;
      
      // Optionally filter by userId (for personal timelines)
      // Note: Some shows might not have userId, so we allow those through
      if (userId && show.userId && show.userId !== userId) continue;
      
      const startDate = new Date(show.date);
      
      // Filter by year if specified
      if (year !== null && year !== undefined) {
        const showYear = startDate.getFullYear();
        if (showYear !== year) continue;
      }
      
      // Skip invalid dates
      if (isNaN(startDate.getTime())) {
        console.warn(`[Timeline] Invalid date for show ${show.id}: ${show.date}`);
        continue;
      }
      
      const endDate = show.endDate ? new Date(show.endDate) : new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // Default 4h duration
      
      events.push({
        id: `show-${show.id}`,
        orgId,
        type: 'show',
        title: show.name || `${show.city}, ${show.country}`,
        startTime: startDate,
        endTime: endDate,
        location: `${show.city}, ${show.country}`,
        status: this.mapShowStatus(show.status),
        module: 'shows',
        importance: this.calculateShowImportance(show),
        metadata: {
          venue: show.venue,
          fee: show.fee,
          currency: show.feeCurrency || 'EUR',
          paid: show.paid,
          promoter: show.promoter,
          originalShowId: show.id,
          showStatus: show.status,
        },
        createdAt: new Date(show.__modifiedAt || Date.now()),
        updatedAt: new Date(show.__modifiedAt || Date.now()),
        createdBy: show.userId || userId,
      });
    }
    
    console.log(`[Timeline] Loaded ${events.length} events after filtering`);
    
    // TODO: Add contracts, activities, travel when available
    // For now, just return shows
    
    // Sort by date (earliest first) - includes PAST and FUTURE events
    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  /**
   * Get available years from all events (for year filter)
   */
  static getAvailableYears(orgId: string, userId: string): number[] {
    const shows = showStore.getAll();
    const years = new Set<number>();
    
    for (const show of shows) {
      if (show.tenantId !== orgId) continue;
      if (userId && show.userId && show.userId !== userId) continue;
      
      const date = new Date(show.date);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear());
      }
    }
    
    return Array.from(years).sort((a, b) => b - a); // Newest first
  }
  
  /**
   * Map show status to timeline event status
   */
  private static mapShowStatus(status: Show['status']): EventStatus {
    switch (status) {
      case 'confirmed':
        return 'confirmed';
      case 'offer':
        return 'offer';
      case 'pending':
        return 'tentative';
      case 'canceled':
      case 'archived':
      case 'postponed':
        return 'canceled';
      default:
        return 'tentative';
    }
  }
  
  /**
   * Calculate show importance based on fee, status, etc.
   */
  private static calculateShowImportance(show: Show): EventImportance {
    if (show.fee > 10000) return 'critical';
    if (show.fee > 5000) return 'high';
    if (show.fee > 2000) return 'medium';
    return 'low';
  }
  
  /**
   * Get timeline dependencies (auto-generated from event sequences)
   * TODO: Implement dependency detection logic based on event proximity and logic
   */
  static getDependencies(orgId: string): TimelineDependency[] {
    // For now, return empty array
    // In future: auto-detect dependencies like:
    // - Shows on same tour → sequence dependencies
    // - Travel before/after shows → timing dependencies
    // - Contracts blocking shows → enabledBy dependencies
    return [];
  }
  
  /**
   * Detect conflicts in the timeline
   */
  static detectConflicts(
    events: TimelineEvent[],
    dependencies: TimelineDependency[]
  ): TimelineConflict[] {
    const conflicts: TimelineConflict[] = [];
    
    // Sort events by start time for sequential checks
    const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    // 1. Check for timing conflicts (events too close together)
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const current = sortedEvents[i];
      const next = sortedEvents[i + 1];
      
      if (!current || !next || !current.endTime) continue;
      
      const gapMinutes = (next.startTime.getTime() - current.endTime.getTime()) / (1000 * 60);
      
      // Critical: Less than 20 minutes between events
      if (gapMinutes < 20) {
        conflicts.push({
          id: `conflict-timing-${current.id}-${next.id}`,
          level: 'CRITICAL',
          message: 'Events too close together',
          detail: `Only ${Math.round(gapMinutes)} minutes between ${current.title} and ${next.title}`,
          eventIds: [current.id, next.id],
          type: 'timing',
          autoDetected: true,
        });
      }
      
      // High: Travel arrival close to load-in/soundcheck
      if (current.type === 'travel' && next.type === 'task' && gapMinutes < 60) {
        conflicts.push({
          id: `conflict-travel-${current.id}-${next.id}`,
          level: 'HIGH',
          message: 'Tight schedule after travel',
          detail: `Flight/travel arrives ${Math.round(gapMinutes)} min before ${next.title}`,
          eventIds: [current.id, next.id],
          type: 'logistics',
          autoDetected: true,
        });
      }
    }
    
    // 2. Check dependency violations
    dependencies.forEach(dep => {
      const fromEvent = events.find(e => e.id === dep.fromEventId);
      const toEvent = events.find(e => e.id === dep.toEventId);
      
      if (!fromEvent || !toEvent) return;
      
      const fromEnd = fromEvent.endTime || fromEvent.startTime;
      const gapMinutes = (toEvent.startTime.getTime() - fromEnd.getTime()) / (1000 * 60);
      
      if (dep.minGapMinutes && gapMinutes < dep.minGapMinutes) {
        conflicts.push({
          id: `conflict-dep-${dep.id}`,
          level: 'CRITICAL',
          message: 'Dependency constraint violated',
          detail: `${fromEvent.title} → ${toEvent.title} requires ${dep.minGapMinutes} min gap, got ${Math.round(gapMinutes)}`,
          eventIds: [dep.fromEventId, dep.toEventId],
          type: 'timing',
          autoDetected: true,
        });
      }
    });
    
    // 3. Check for same-day double bookings (different locations)
    const eventsByDay = new Map<string, TimelineEvent[]>();
    events.forEach(event => {
      if (event.type !== 'show') return;
      const isoDate = event.startTime.toISOString();
      const dayKey = isoDate.substring(0, 10); // YYYY-MM-DD
      
      if (!eventsByDay.has(dayKey)) {
        eventsByDay.set(dayKey, []);
      }
      const dayArray = eventsByDay.get(dayKey);
      if (dayArray) {
        dayArray.push(event);
      }
    });
    
    eventsByDay.forEach((dayEvents, day) => {
      if (dayEvents.length > 1) {
        const locations = new Set(dayEvents.map(e => e.location).filter(Boolean));
        if (locations.size > 1) {
          conflicts.push({
            id: `conflict-double-${day}`,
            level: 'HIGH',
            message: `${dayEvents.length} shows scheduled same day`,
            detail: `Different locations: ${Array.from(locations).join(', ')}`,
            eventIds: dayEvents.map(e => e.id),
            type: 'logistics',
            autoDetected: true,
          });
        }
      }
    });
    
    return conflicts;
  }
  
  /**
   * Compute critical path using CPM (Critical Path Method)
   */
  static computeCriticalPath(
    events: TimelineEvent[],
    dependencies: TimelineDependency[]
  ): CriticalPathNode[] {
    // Build dependency graph
    const graph = new Map<string, Set<string>>();
    const reverseGraph = new Map<string, Set<string>>();
    
    events.forEach(event => {
      graph.set(event.id, new Set());
      reverseGraph.set(event.id, new Set());
    });
    
    dependencies.forEach(dep => {
      graph.get(dep.fromEventId)?.add(dep.toEventId);
      reverseGraph.get(dep.toEventId)?.add(dep.fromEventId);
    });
    
    // Forward pass: compute earliest start times
    const earliestStart = new Map<string, Date>();
    const visited = new Set<string>();
    
    const forwardPass = (eventId: string): Date => {
      if (earliestStart.has(eventId)) {
        return earliestStart.get(eventId)!;
      }
      
      const event = events.find(e => e.id === eventId);
      if (!event) return new Date(0);
      
      const predecessors = Array.from(reverseGraph.get(eventId) || []);
      
      if (predecessors.length === 0) {
        earliestStart.set(eventId, event.startTime);
        return event.startTime;
      }
      
      let maxEnd = new Date(0);
      predecessors.forEach(predId => {
        const predEvent = events.find(e => e.id === predId);
        if (!predEvent) return;
        
        const predEarliest = forwardPass(predId);
        const predEnd = predEvent.endTime || predEvent.startTime;
        
        if (predEnd > maxEnd) {
          maxEnd = predEnd;
        }
      });
      
      const computedStart = new Date(Math.max(maxEnd.getTime(), event.startTime.getTime()));
      earliestStart.set(eventId, computedStart);
      return computedStart;
    };
    
    events.forEach(event => forwardPass(event.id));
    
    // Backward pass: compute latest start times
    const latestStart = new Map<string, Date>();
    
    // Find end events (no successors)
    const endEvents = events.filter(e => {
      const successors = graph.get(e.id);
      return !successors || successors.size === 0;
    });
    
    // Set latest start for end events = earliest start
    endEvents.forEach(event => {
      latestStart.set(event.id, earliestStart.get(event.id) || event.startTime);
    });
    
    const backwardPass = (eventId: string): Date => {
      if (latestStart.has(eventId)) {
        return latestStart.get(eventId)!;
      }
      
      const event = events.find(e => e.id === eventId);
      if (!event) return new Date();
      
      const successors = Array.from(graph.get(eventId) || []);
      
      if (successors.length === 0) {
        const latest = earliestStart.get(eventId) || event.startTime;
        latestStart.set(eventId, latest);
        return latest;
      }
      
      let minSuccessorLatest = new Date(8640000000000000); // Max date
      
      successors.forEach(succId => {
        const succLatest = backwardPass(succId);
        const dep = dependencies.find(d => d.fromEventId === eventId && d.toEventId === succId);
        const requiredGap = (dep?.minGapMinutes || 0) * 60 * 1000;
        
        const computedLatest = new Date(succLatest.getTime() - requiredGap);
        
        if (computedLatest < minSuccessorLatest) {
          minSuccessorLatest = computedLatest;
        }
      });
      
      latestStart.set(eventId, minSuccessorLatest);
      return minSuccessorLatest;
    };
    
    events.forEach(event => backwardPass(event.id));
    
    // Compute slack and determine critical path
    const nodes: CriticalPathNode[] = events.map(event => {
      const earliest = earliestStart.get(event.id) || event.startTime;
      const latest = latestStart.get(event.id) || event.startTime;
      const slackMs = latest.getTime() - earliest.getTime();
      const slackMinutes = slackMs / (1000 * 60);
      
      return {
        event,
        earliestStart: earliest,
        latestStart: latest,
        slack: slackMinutes,
        isOnCriticalPath: slackMinutes < 1, // Less than 1 minute slack = critical
      };
    });
    
    return nodes.sort((a, b) => a.event.startTime.getTime() - b.event.startTime.getTime());
  }
}

export default TimelineMissionControlService;

