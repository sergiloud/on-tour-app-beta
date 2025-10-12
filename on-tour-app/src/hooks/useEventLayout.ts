import { useMemo } from 'react';

export type TimedEvent = { id: string; start: Date; end: Date; allDay?: boolean };

// Interval partitioning: assign columns so overlapping events do not collide.
// Returns an array of { id, column, columns } where columns is the total columns in that overlap group.
export function computeEventLayout(events: TimedEvent[]) {
  if (!events || events.length === 0) return [] as { id: string; column: number; columns: number }[];
  // Normalize and sort by start then end
  const evs = events
    .filter((e) => e && e.start && e.end && e.end > e.start)
    .slice()
    .sort((a, b) => (a.start.getTime() - b.start.getTime()) || (a.end.getTime() - b.end.getTime()));

  type Layout = { id: string; column: number };
  const results: { id: string; column: number; columns: number }[] = [];

  let groupStartIdx = 0;
  const firstEvent = evs[0];
  let groupMaxEnd = firstEvent ? firstEvent.end.getTime() : 0;

  const flushGroup = (startIdx: number, endIdx: number) => {
    if (endIdx <= startIdx) return;
    const group = evs.slice(startIdx, endIdx);
    // Greedy column assignment using end times per column
    const colEndTimes: number[] = []; // end time of last event in each column
    const assigned: Layout[] = [];
    for (const e of group) {
      // Find first column that is free (end <= start)
      let col = colEndTimes.findIndex((end) => end <= e.start.getTime());
      if (col === -1) { col = colEndTimes.length; colEndTimes.push(e.end.getTime()); }
      else { colEndTimes[col] = e.end.getTime(); }
      assigned.push({ id: e.id, column: col });
    }
    const totalCols = colEndTimes.length || 1;
    for (const a of assigned) {
      results.push({ id: a.id, column: a.column, columns: totalCols });
    }
  };

  for (let i = 1; i < evs.length; i++) {
    const currentEvent = evs[i];
    if (!currentEvent) continue;
    const s = currentEvent.start.getTime();
    if (s < groupMaxEnd) {
      // still overlapping group
      groupMaxEnd = Math.max(groupMaxEnd, currentEvent.end.getTime());
    } else {
      // flush previous group
      flushGroup(groupStartIdx, i);
      groupStartIdx = i;
      groupMaxEnd = currentEvent.end.getTime();
    }
  }
  // flush last group
  flushGroup(groupStartIdx, evs.length);

  // Preserve input order mapping
  const byId = new Map(results.map((r) => [r.id, r] as const));
  return events.map((e) => byId.get(e.id) || { id: e.id, column: 0, columns: 1 });
}

// Hook wrapper with memoization for convenience when called at top level
export function useEventLayout(events: TimedEvent[]) {
  return useMemo(() => computeEventLayout(events), [events]);
}
