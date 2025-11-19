/**
 * Timeline Mission Control - Data Services
 * 
 * Handles timeline events, dependencies, scenarios, and conflict detection.
 * Currently uses demo data - Firestore integration planned for v2.1
 */

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
   * Get timeline events (demo data for MVP)
   */
  static getEvents(orgId: string, userId: string): TimelineEvent[] {
    return this.generateDemoEvents(orgId, userId);
  }
  
  /**
   * Get timeline dependencies (demo data for MVP)
   */
  static getDependencies(orgId: string): TimelineDependency[] {
    return this.generateDemoDependencies(orgId);
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
  
  /**
   * Generate demo timeline events for testing (includes historical events)
   */
  static generateDemoEvents(orgId: string, userId: string): TimelineEvent[] {
    const now = new Date();
    const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 60 * 60 * 1000);
    
    return [
      // HISTORICAL EVENTS (past 30 days)
      {
        id: 'event-hist-1',
        orgId,
        type: 'show',
        title: 'Sevilla - Teatro Central',
        startTime: addDays(-25),
        endTime: addHours(addDays(-25), 3),
        location: 'Sevilla',
        status: 'done',
        module: 'shows',
        importance: 'high',
        metadata: { fee: 1800, attendance: 450 },
        createdAt: addDays(-30),
        updatedAt: addDays(-25),
        createdBy: userId,
      },
      {
        id: 'event-hist-2',
        orgId,
        type: 'travel',
        title: 'Drive Sevilla → Granada',
        startTime: addDays(-24),
        endTime: addHours(addDays(-24), 3),
        location: 'A-92',
        status: 'done',
        module: 'travel',
        importance: 'medium',
        metadata: { distance: 250, mode: 'van' },
        createdAt: addDays(-30),
        updatedAt: addDays(-24),
        createdBy: userId,
      },
      {
        id: 'event-hist-3',
        orgId,
        type: 'show',
        title: 'Granada - Sala Planta Baja',
        startTime: addDays(-23),
        endTime: addHours(addDays(-23), 2.5),
        location: 'Granada',
        status: 'done',
        module: 'shows',
        importance: 'medium',
        metadata: { fee: 1500, attendance: 320 },
        createdAt: addDays(-30),
        updatedAt: addDays(-23),
        createdBy: userId,
      },
      {
        id: 'event-hist-4',
        orgId,
        type: 'finance',
        title: 'Settlement - Tour Week 1',
        startTime: addDays(-20),
        endTime: addHours(addDays(-20), 1),
        status: 'done',
        module: 'finance',
        importance: 'high',
        metadata: { amount: 3300, type: 'revenue' },
        createdAt: addDays(-21),
        updatedAt: addDays(-20),
        createdBy: userId,
      },
      {
        id: 'event-hist-5',
        orgId,
        type: 'show',
        title: 'Málaga - Sala Trinchera',
        startTime: addDays(-18),
        endTime: addHours(addDays(-18), 3),
        location: 'Málaga',
        status: 'done',
        module: 'shows',
        importance: 'high',
        metadata: { fee: 2200, attendance: 550 },
        createdAt: addDays(-25),
        updatedAt: addDays(-18),
        createdBy: userId,
      },
      {
        id: 'event-hist-6',
        orgId,
        type: 'task',
        title: 'Gear Maintenance',
        startTime: addDays(-10),
        endTime: addHours(addDays(-10), 4),
        status: 'done',
        module: 'collaboration',
        importance: 'medium',
        metadata: { cost: 350 },
        createdAt: addDays(-15),
        updatedAt: addDays(-10),
        createdBy: userId,
      },
      
      // UPCOMING EVENTS (future)
      // Day 1: Madrid
      {
        id: 'event-1',
        orgId,
        type: 'travel',
        title: 'Flight BCN → MAD',
        startTime: addHours(addDays(1), 17),
        endTime: addHours(addDays(1), 18.67), // 18:40
        status: 'confirmed',
        module: 'travel',
        importance: 'critical',
        location: 'Madrid, ES',
        metadata: { cost: 120, carrier: 'Vueling' },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      {
        id: 'event-2',
        orgId,
        type: 'task',
        title: 'Load-in & Soundcheck',
        startTime: addHours(addDays(1), 19),
        endTime: addHours(addDays(1), 20),
        status: 'confirmed',
        module: 'shows',
        importance: 'high',
        location: 'Sala Caracol, Madrid',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      {
        id: 'event-3',
        orgId,
        type: 'show',
        title: 'Madrid - Sala Caracol',
        startTime: addHours(addDays(1), 21),
        endTime: addHours(addDays(1), 23),
        status: 'confirmed',
        module: 'shows',
        importance: 'critical',
        location: 'Madrid, ES',
        metadata: { fee: 2500, door: 70, capacity: 400 },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      {
        id: 'event-4',
        orgId,
        type: 'finance',
        title: 'Settlement - Madrid',
        startTime: addHours(addDays(1), 23.5),
        status: 'tentative',
        module: 'finance',
        importance: 'medium',
        metadata: { amount: 2500, settled: false },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      
      // Day 2: Travel to Valencia
      {
        id: 'event-5',
        orgId,
        type: 'travel',
        title: 'Drive MAD → VLC',
        startTime: addHours(addDays(2), 10),
        endTime: addHours(addDays(2), 14),
        status: 'confirmed',
        module: 'travel',
        importance: 'medium',
        location: 'Valencia, ES',
        metadata: { cost: 80, type: 'van', distance: 360 },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      {
        id: 'event-6',
        orgId,
        type: 'task',
        title: 'Soundcheck - Black Note',
        startTime: addHours(addDays(2), 19.5),
        endTime: addHours(addDays(2), 20.5),
        status: 'confirmed',
        module: 'shows',
        importance: 'high',
        location: 'Black Note Club, Valencia',
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      {
        id: 'event-7',
        orgId,
        type: 'show',
        title: 'Valencia - Black Note Club',
        startTime: addHours(addDays(2), 21),
        endTime: addHours(addDays(2), 23),
        status: 'confirmed',
        module: 'shows',
        importance: 'high',
        location: 'Valencia, ES',
        metadata: { fee: 1800, door: 60, capacity: 300 },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      
      // Day 4: Barcelona
      {
        id: 'event-8',
        orgId,
        type: 'travel',
        title: 'Drive VLC → BCN',
        startTime: addHours(addDays(4), 11),
        endTime: addHours(addDays(4), 14.5),
        status: 'confirmed',
        module: 'travel',
        importance: 'medium',
        location: 'Barcelona, ES',
        metadata: { cost: 90, type: 'van', distance: 350 },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      {
        id: 'event-9',
        orgId,
        type: 'contract',
        title: 'Contract Review - Razzmatazz',
        startTime: addHours(addDays(4), 16),
        endTime: addHours(addDays(4), 17),
        status: 'tentative',
        module: 'contracts',
        importance: 'high',
        metadata: { venue: 'Razzmatazz', fee: 4500 },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      {
        id: 'event-10',
        orgId,
        type: 'show',
        title: 'Barcelona - Razzmatazz',
        startTime: addHours(addDays(4), 22),
        endTime: addHours(addDays(5), 0.5), // Next day 00:30
        status: 'confirmed',
        module: 'shows',
        importance: 'critical',
        location: 'Barcelona, ES',
        metadata: { fee: 4500, door: 80, capacity: 800 },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      
      // Day 6: Bilbao
      {
        id: 'event-11',
        orgId,
        type: 'travel',
        title: 'Flight BCN → BIO',
        startTime: addHours(addDays(6), 9),
        endTime: addHours(addDays(6), 10.25),
        status: 'confirmed',
        module: 'travel',
        importance: 'medium',
        location: 'Bilbao, ES',
        metadata: { cost: 150, carrier: 'Iberia' },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      {
        id: 'event-12',
        orgId,
        type: 'show',
        title: 'Bilbao - Kafe Antzokia',
        startTime: addHours(addDays(6), 21.5),
        endTime: addHours(addDays(6), 23.5),
        status: 'offer',
        module: 'shows',
        importance: 'medium',
        location: 'Bilbao, ES',
        metadata: { fee: 2200, door: 65, capacity: 500 },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      
      // Day 8: Paris
      {
        id: 'event-13',
        orgId,
        type: 'travel',
        title: 'Flight BIO → CDG',
        startTime: addHours(addDays(8), 14),
        endTime: addHours(addDays(8), 15.75),
        status: 'tentative',
        module: 'travel',
        importance: 'high',
        location: 'Paris, FR',
        metadata: { cost: 180, carrier: 'Air France' },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      {
        id: 'event-14',
        orgId,
        type: 'show',
        title: 'Paris - La Maroquinerie',
        startTime: addHours(addDays(8), 20.5),
        endTime: addHours(addDays(8), 22.5),
        status: 'tentative',
        module: 'shows',
        importance: 'high',
        location: 'Paris, FR',
        metadata: { fee: 3200, door: 70, capacity: 600 },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
      
      // Financial milestone
      {
        id: 'event-15',
        orgId,
        type: 'finance',
        title: 'Tour Settlement Review',
        startTime: addHours(addDays(10), 10),
        status: 'tentative',
        module: 'finance',
        importance: 'medium',
        metadata: { totalExpected: 14200, totalReceived: 8500 },
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      },
    ];
  }
  
  /**
   * Generate demo dependencies
   */
  static generateDemoDependencies(orgId: string): TimelineDependency[] {
    return [
      // Madrid show dependencies
      {
        id: 'dep-1',
        orgId,
        fromEventId: 'event-1', // Flight BCN → MAD
        toEventId: 'event-2',    // Load-in & Soundcheck
        type: 'before',
        minGapMinutes: 20,
        createdAt: new Date(),
      },
      {
        id: 'dep-2',
        orgId,
        fromEventId: 'event-2', // Load-in & Soundcheck
        toEventId: 'event-3',    // Show Madrid
        type: 'before',
        minGapMinutes: 60,
        createdAt: new Date(),
      },
      {
        id: 'dep-3',
        orgId,
        fromEventId: 'event-3', // Show Madrid
        toEventId: 'event-4',    // Settlement
        type: 'enabledBy',
        minGapMinutes: 0,
        createdAt: new Date(),
      },
      
      // Valencia show dependencies
      {
        id: 'dep-4',
        orgId,
        fromEventId: 'event-3', // Show Madrid (previous day)
        toEventId: 'event-5',    // Drive to Valencia
        type: 'before',
        minGapMinutes: 600, // 10 hours rest
        createdAt: new Date(),
      },
      {
        id: 'dep-5',
        orgId,
        fromEventId: 'event-5', // Drive to Valencia
        toEventId: 'event-6',    // Soundcheck Valencia
        type: 'before',
        minGapMinutes: 300, // 5 hours to rest/settle
        createdAt: new Date(),
      },
      {
        id: 'dep-6',
        orgId,
        fromEventId: 'event-6', // Soundcheck Valencia
        toEventId: 'event-7',    // Show Valencia
        type: 'before',
        minGapMinutes: 30,
        createdAt: new Date(),
      },
      
      // Barcelona show dependencies
      {
        id: 'dep-7',
        orgId,
        fromEventId: 'event-7', // Show Valencia
        toEventId: 'event-8',    // Drive to Barcelona
        type: 'before',
        minGapMinutes: 600, // 10 hours rest
        createdAt: new Date(),
      },
      {
        id: 'dep-8',
        orgId,
        fromEventId: 'event-8', // Drive to Barcelona
        toEventId: 'event-9',    // Contract Review
        type: 'before',
        minGapMinutes: 90,
        createdAt: new Date(),
      },
      {
        id: 'dep-9',
        orgId,
        fromEventId: 'event-9', // Contract Review
        toEventId: 'event-10',   // Show Barcelona
        type: 'before',
        minGapMinutes: 300,
        createdAt: new Date(),
      },
      
      // Bilbao dependencies
      {
        id: 'dep-10',
        orgId,
        fromEventId: 'event-10', // Show Barcelona
        toEventId: 'event-11',    // Flight to Bilbao
        type: 'before',
        minGapMinutes: 480, // 8 hours rest
        createdAt: new Date(),
      },
      {
        id: 'dep-11',
        orgId,
        fromEventId: 'event-11', // Flight to Bilbao
        toEventId: 'event-12',    // Show Bilbao
        type: 'before',
        minGapMinutes: 600, // 10 hours
        createdAt: new Date(),
      },
      
      // Paris dependencies
      {
        id: 'dep-12',
        orgId,
        fromEventId: 'event-12', // Show Bilbao
        toEventId: 'event-13',    // Flight to Paris
        type: 'before',
        minGapMinutes: 720, // 12 hours rest
        createdAt: new Date(),
      },
      {
        id: 'dep-13',
        orgId,
        fromEventId: 'event-13', // Flight to Paris
        toEventId: 'event-14',    // Show Paris
        type: 'before',
        minGapMinutes: 240, // 4 hours
        createdAt: new Date(),
      },
      
      // Financial milestone
      {
        id: 'dep-14',
        orgId,
        fromEventId: 'event-14', // Show Paris (last show)
        toEventId: 'event-15',    // Tour Settlement Review
        type: 'enabledBy',
        minGapMinutes: 0,
        createdAt: new Date(),
      },
    ];
  }
}

export default TimelineMissionControlService;
