/**
 * Timeline Mission Control - Validation & Business Rules
 * 
 * Intelligent validations for drag & drop operations:
 * - Prevent impossible schedules
 * - Detect conflicts
 * - Calculate time buffers
 * - Enforce dependencies
 */

import type { TimelineEvent } from '../types/timeline';

export interface ValidationResult {
  valid: boolean;
  warnings: ValidationWarning[];
  errors: ValidationError[];
  suggestions?: string[];
}

export interface ValidationWarning {
  type: 'time_buffer' | 'travel_tight' | 'venue_overlap' | 'financial_impact';
  message: string;
  severity: 'low' | 'medium' | 'high';
  affectedEventIds?: string[];
}

export interface ValidationError {
  type: 'impossible_travel' | 'double_booking' | 'dependency_violation' | 'missing_data';
  message: string;
  blockingEventIds?: string[];
}

/**
 * Validate if a show can be moved to a new time
 */
export function validateShowMove(
  event: TimelineEvent,
  newStartTime: Date,
  allEvents: TimelineEvent[]
): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];
  
  if (event.type !== 'show') {
    return { valid: true, warnings, errors };
  }
  
  // Find preceding travel
  const precedingTravel = findPrecedingTravel(event, allEvents);
  if (precedingTravel) {
    const travelEndTime = precedingTravel.endTime || precedingTravel.startTime;
    const timeSinceArrival = (newStartTime.getTime() - travelEndTime.getTime()) / (1000 * 60 * 60); // hours
    
    // Check minimum load-in time (typically 4 hours)
    const minLoadInHours = 4;
    if (timeSinceArrival < minLoadInHours) {
      errors.push({
        type: 'dependency_violation',
        message: `Show moved too close to arrival. Need minimum ${minLoadInHours}h for load-in (currently ${timeSinceArrival.toFixed(1)}h)`,
        blockingEventIds: [precedingTravel.id]
      });
    } else if (timeSinceArrival < 6) {
      warnings.push({
        type: 'time_buffer',
        message: `Tight schedule: only ${timeSinceArrival.toFixed(1)}h between arrival and show`,
        severity: 'high',
        affectedEventIds: [precedingTravel.id]
      });
    }
  }
  
  // Check for venue conflicts (same venue, overlapping time)
  if (event.location) {
    const venueConflicts = allEvents.filter(e => 
      e.id !== event.id &&
      e.type === 'show' &&
      e.location === event.location &&
      e.startTime &&
      isTimeOverlap(e.startTime, e.endTime || e.startTime, newStartTime, event.endTime || newStartTime)
    );
    
    if (venueConflicts.length > 0) {
      errors.push({
        type: 'double_booking',
        message: `Venue "${event.location}" already booked for this time slot`,
        blockingEventIds: venueConflicts.map(e => e.id)
      });
    }
  }
  
  // Check following travel feasibility
  const followingTravel = findFollowingTravel(event, allEvents);
  if (followingTravel) {
    const showEndTime = event.endTime || new Date(newStartTime.getTime() + 3 * 60 * 60 * 1000); // assume 3h show
    const timeUntilDeparture = (followingTravel.startTime.getTime() - showEndTime.getTime()) / (1000 * 60 * 60);
    
    const minPackOutHours = 2;
    if (timeUntilDeparture < minPackOutHours) {
      errors.push({
        type: 'dependency_violation',
        message: `Not enough time for pack-out before departure (need ${minPackOutHours}h, have ${timeUntilDeparture.toFixed(1)}h)`,
        blockingEventIds: [followingTravel.id]
      });
    } else if (timeUntilDeparture < 3) {
      warnings.push({
        type: 'time_buffer',
        message: `Tight pack-out schedule: only ${timeUntilDeparture.toFixed(1)}h before departure`,
        severity: 'medium',
        affectedEventIds: [followingTravel.id]
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Validate travel movement
 */
export function validateTravelMove(
  event: TimelineEvent,
  newStartTime: Date,
  allEvents: TimelineEvent[]
): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];
  
  if (event.type !== 'travel') {
    return { valid: true, warnings, errors };
  }
  
  // Check if travel departs after previous show ends
  const previousShow = findPreviousShow(event, allEvents);
  if (previousShow) {
    const showEndTime = previousShow.endTime || new Date(previousShow.startTime.getTime() + 3 * 60 * 60 * 1000);
    const packOutTime = 2; // hours
    const earliestDeparture = new Date(showEndTime.getTime() + packOutTime * 60 * 60 * 1000);
    
    if (newStartTime < earliestDeparture) {
      errors.push({
        type: 'dependency_violation',
        message: `Travel departs before show pack-out is possible (need ${packOutTime}h after show)`,
        blockingEventIds: [previousShow.id]
      });
    }
  }
  
  // Check if travel arrives before next show
  const nextShow = findNextShow(event, allEvents);
  if (nextShow) {
    const travelDuration = event.endTime ? 
      (event.endTime.getTime() - newStartTime.getTime()) / (1000 * 60 * 60) : 
      4; // assume 4h if no end time
    const arrivalTime = new Date(newStartTime.getTime() + travelDuration * 60 * 60 * 1000);
    const minLoadInTime = 4; // hours
    const latestArrival = new Date(nextShow.startTime.getTime() - minLoadInTime * 60 * 60 * 1000);
    
    if (arrivalTime > latestArrival) {
      errors.push({
        type: 'impossible_travel',
        message: `Travel arrives too late for next show load-in (need to arrive ${minLoadInTime}h before show)`,
        blockingEventIds: [nextShow.id]
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Calculate if two time ranges overlap
 */
function isTimeOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Find the travel event that arrives before this show
 */
function findPrecedingTravel(
  show: TimelineEvent,
  allEvents: TimelineEvent[]
): TimelineEvent | null {
  const travelEvents = allEvents
    .filter(e => e.type === 'travel' && e.endTime && e.endTime < show.startTime)
    .sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0));
  
  return travelEvents[0] || null;
}

/**
 * Find the travel event that departs after this show
 */
function findFollowingTravel(
  show: TimelineEvent,
  allEvents: TimelineEvent[]
): TimelineEvent | null {
  const showEndTime = show.endTime || new Date(show.startTime.getTime() + 3 * 60 * 60 * 1000);
  const travelEvents = allEvents
    .filter(e => e.type === 'travel' && e.startTime > showEndTime)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  return travelEvents[0] || null;
}

/**
 * Find the show before this travel
 */
function findPreviousShow(
  travel: TimelineEvent,
  allEvents: TimelineEvent[]
): TimelineEvent | null {
  const shows = allEvents
    .filter(e => e.type === 'show' && e.startTime < travel.startTime)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  
  return shows[0] || null;
}

/**
 * Find the show after this travel
 */
function findNextShow(
  travel: TimelineEvent,
  allEvents: TimelineEvent[]
): TimelineEvent | null {
  const travelEnd = travel.endTime || new Date(travel.startTime.getTime() + 4 * 60 * 60 * 1000);
  const shows = allEvents
    .filter(e => e.type === 'show' && e.startTime > travelEnd)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  return shows[0] || null;
}

/**
 * Auto-detect all dependencies between events
 */
export interface EventDependency {
  id: string;
  fromEventId: string;
  toEventId: string;
  type: 'before' | 'after' | 'blocks' | 'enabledBy';
  minGapMinutes?: number;
  isCritical: boolean;
}

export function detectDependencies(events: TimelineEvent[]): EventDependency[] {
  const dependencies: EventDependency[] = [];
  
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  // Detect travel → show dependencies
  sortedEvents.forEach((event, index) => {
    if (event.type === 'show') {
      // Find preceding travel
      const precedingTravel = findPrecedingTravel(event, sortedEvents);
      if (precedingTravel) {
        dependencies.push({
          id: `${precedingTravel.id}->${event.id}`,
          fromEventId: precedingTravel.id,
          toEventId: event.id,
          type: 'enabledBy',
          minGapMinutes: 240, // 4h minimum load-in
          isCritical: true
        });
      }
      
      // Find following travel
      const followingTravel = findFollowingTravel(event, sortedEvents);
      if (followingTravel) {
        dependencies.push({
          id: `${event.id}->${followingTravel.id}`,
          fromEventId: event.id,
          toEventId: followingTravel.id,
          type: 'before',
          minGapMinutes: 120, // 2h minimum pack-out
          isCritical: true
        });
      }
    }
  });
  
  // Detect sequential shows (show → show with no travel between)
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const next = sortedEvents[i + 1];
    
    if (current.type === 'show' && next.type === 'show') {
      // Check if there's no travel between them
      const travelBetween = sortedEvents.some(e => 
        e.type === 'travel' &&
        e.startTime > (current.endTime || current.startTime) &&
        e.startTime < next.startTime
      );
      
      if (!travelBetween) {
        dependencies.push({
          id: `${current.id}->${next.id}`,
          fromEventId: current.id,
          toEventId: next.id,
          type: 'before',
          minGapMinutes: 60, // 1h minimum between shows
          isCritical: false
        });
      }
    }
  }
  
  return dependencies;
}

/**
 * Calculate critical path through events
 */
export function calculateCriticalPath(
  events: TimelineEvent[],
  dependencies: EventDependency[]
): string[] {
  // Simple implementation: events on the longest chain of critical dependencies
  const criticalDeps = dependencies.filter(d => d.isCritical);
  
  if (criticalDeps.length === 0) return [];
  
  // Build adjacency list
  const graph = new Map<string, string[]>();
  criticalDeps.forEach(dep => {
    if (!graph.has(dep.fromEventId)) {
      graph.set(dep.fromEventId, []);
    }
    graph.get(dep.fromEventId)!.push(dep.toEventId);
  });
  
  // Find longest path (simplified DFS)
  let longestPath: string[] = [];
  const visited = new Set<string>();
  
  function dfs(nodeId: string, path: string[]) {
    if (path.length > longestPath.length) {
      longestPath = [...path];
    }
    
    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        dfs(neighbor, [...path, neighbor]);
        visited.delete(neighbor);
      }
    }
  }
  
  // Start DFS from each root node
  const allNodes = new Set([...criticalDeps.map(d => d.fromEventId), ...criticalDeps.map(d => d.toEventId)]);
  const rootNodes = Array.from(allNodes).filter(node => 
    !criticalDeps.some(d => d.toEventId === node)
  );
  
  rootNodes.forEach(root => {
    visited.clear();
    visited.add(root);
    dfs(root, [root]);
  });
  
  return longestPath;
}
