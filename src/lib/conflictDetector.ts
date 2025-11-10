import type { CalEvent } from '../components/calendar/types';
import type { EventLink } from '../components/calendar/EventLinkingModal';

export type ConflictType = 'broken_dependency' | 'gap_violation' | 'same_day_violation' | 'circular';

export type Conflict = {
  id: string;
  type: ConflictType;
  severity: 'warning' | 'error';
  eventId: string;
  linkedEventId?: string;
  message: string;
  suggestion?: string;
};

/**
 * Detect conflicts and dependency violations in events
 */
export class ConflictDetector {
  /**
   * Check if moving an event creates any dependency conflicts
   */
  static checkMoveConflict(
    eventId: string,
    newDate: string,
    events: CalEvent[],
    links: EventLink[]
  ): Conflict[] {
    const conflicts: Conflict[] = [];
    const event = events.find((e) => e.id === eventId);

    if (!event) return conflicts;

    // Find all links involving this event
    const relevantLinks = links.filter(
      (link) => link.fromId === eventId || link.toId === eventId
    );

    for (const link of relevantLinks) {
      // If this event is the "from" (prerequisite)
      if (link.fromId === eventId) {
        const toEvent = events.find((e) => e.id === link.toId);
        if (!toEvent) continue;

        if (link.type === 'before') {
          // This event should be BEFORE toEvent
          // newDate should be <= toEvent.date - gap
          const toDate = new Date(toEvent.date);
          const moveDate = new Date(newDate);
          const requiredGap = link.gap || 0;

          if (moveDate > new Date(toDate.getTime() - requiredGap * 24 * 60 * 60 * 1000)) {
            conflicts.push({
              id: `conflict_${eventId}_${link.toId}`,
              type: 'broken_dependency',
              severity: 'error',
              eventId,
              linkedEventId: link.toId,
              message: `"${event.title}" must happen before "${toEvent.title}"${requiredGap ? ` (with ${requiredGap} day gap)` : ''}`,
              suggestion: `Move "${event.title}" to ${new Date(toDate.getTime() - (requiredGap + 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)} or earlier`,
            });
          }
        } else if (link.type === 'after') {
          // This event should be AFTER toEvent
          const toDate = new Date(toEvent.date);
          const moveDate = new Date(newDate);

          if (moveDate < toDate) {
            conflicts.push({
              id: `conflict_${eventId}_${link.toId}`,
              type: 'broken_dependency',
              severity: 'error',
              eventId,
              linkedEventId: link.toId,
              message: `"${event.title}" must happen after "${toEvent.title}"`,
              suggestion: `Move "${event.title}" to ${new Date(toDate.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)} or later`,
            });
          }
        } else if (link.type === 'sameDay') {
          // This event should be same day as toEvent
          if (newDate !== toEvent.date) {
            conflicts.push({
              id: `conflict_${eventId}_${link.toId}`,
              type: 'same_day_violation',
              severity: 'warning',
              eventId,
              linkedEventId: link.toId,
              message: `"${event.title}" and "${toEvent.title}" should be on the same day`,
              suggestion: `Move "${event.title}" to ${toEvent.date}`,
            });
          }
        }
      }

      // If this event is the "to" (dependent)
      if (link.toId === eventId) {
        const fromEvent = events.find((e) => e.id === link.fromId);
        if (!fromEvent) continue;

        if (link.type === 'before') {
          // fromEvent should be BEFORE this event
          const fromDate = new Date(fromEvent.date);
          const moveDate = new Date(newDate);
          const requiredGap = link.gap || 0;

          if (fromDate > new Date(moveDate.getTime() - requiredGap * 24 * 60 * 60 * 1000)) {
            conflicts.push({
              id: `conflict_${link.fromId}_${eventId}`,
              type: 'broken_dependency',
              severity: 'error',
              eventId,
              linkedEventId: link.fromId,
              message: `"${fromEvent.title}" must happen before "${event.title}"${requiredGap ? ` (with ${requiredGap} day gap)` : ''}`,
              suggestion: `Move "${event.title}" to ${new Date(fromDate.getTime() + (requiredGap + 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)} or later`,
            });
          }
        } else if (link.type === 'after') {
          // fromEvent should be AFTER this event
          const fromDate = new Date(fromEvent.date);
          const moveDate = new Date(newDate);

          if (fromDate < moveDate) {
            conflicts.push({
              id: `conflict_${link.fromId}_${eventId}`,
              type: 'broken_dependency',
              severity: 'error',
              eventId,
              linkedEventId: link.fromId,
              message: `"${fromEvent.title}" must happen after "${event.title}"`,
              suggestion: `Move "${event.title}" to ${new Date(fromDate.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)} or earlier`,
            });
          }
        } else if (link.type === 'sameDay') {
          // fromEvent should be same day as this event
          if (fromEvent.date !== newDate) {
            conflicts.push({
              id: `conflict_${link.fromId}_${eventId}`,
              type: 'same_day_violation',
              severity: 'warning',
              eventId,
              linkedEventId: link.fromId,
              message: `"${fromEvent.title}" and "${event.title}" should be on the same day`,
              suggestion: `Move "${event.title}" to ${fromEvent.date}`,
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Validate all events for conflicts
   */
  static validateAll(events: CalEvent[], links: EventLink[]): Conflict[] {
    const conflicts: Conflict[] = [];

    for (const event of events) {
      const eventConflicts = this.checkMoveConflict(event.id, event.date, events, links);
      conflicts.push(...eventConflicts);
    }

    // Check for circular dependencies
    const circularConflicts = this.detectCircularDependencies(links, events);
    conflicts.push(...circularConflicts);

    return conflicts;
  }

  /**
   * Detect circular dependencies (A -> B -> A)
   */
  private static detectCircularDependencies(links: EventLink[], events: CalEvent[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (linkId: string, path: EventLink[]): boolean => {
      if (recursionStack.has(linkId)) {
        // Found a cycle
        const event = events.find((e) => e.id === linkId);
        conflicts.push({
          id: `circular_${linkId}`,
          type: 'circular',
          severity: 'error',
          eventId: linkId,
          message: `Circular dependency detected: ${path.map((l) => events.find((e) => e.id === l.fromId)?.title).join(' → ')} → ${event?.title}`,
          suggestion: 'Remove one of the links to break the cycle',
        });
        return true;
      }

      if (visited.has(linkId)) {
        return false;
      }

      visited.add(linkId);
      recursionStack.add(linkId);

      const outgoing = links.filter((l) => l.fromId === linkId);
      for (const link of outgoing) {
        if (dfs(link.toId, [...path, link])) {
          return true;
        }
      }

      recursionStack.delete(linkId);
      return false;
    };

    for (const event of events) {
      if (!visited.has(event.id)) {
        dfs(event.id, []);
      }
    }

    return conflicts;
  }
}
