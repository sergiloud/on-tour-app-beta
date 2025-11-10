export type CalEventKind = 'show' | 'travel' | 'meeting' | 'rehearsal' | 'break';

// Shared calendar event type across month/week/day/agenda
export type CalEvent = {
  id: string;
  date: string; // YYYY-MM-DD (tz-aware bucket)
  kind: CalEventKind;
  title: string;
  status?: string;
  meta?: string;
  city?: string; // Optional city for show events
  country?: string; // Optional country for show events
  // Optional timed fields used in Week/Day views
  start?: string; // ISO
  end?: string;   // ISO
  allDay?: boolean;
  // Advanced calendar metadata (optional)
  endDate?: string; // YYYY-MM-DD when event spans multiple days
  color?: 'accent' | 'green' | 'red' | 'blue' | 'yellow' | 'purple';
  pinned?: boolean;
  notes?: string;
  spanId?: string;
  spanLength?: number;
  spanIndex?: number;
  spanStart?: boolean;
  spanEnd?: boolean;
  // Dependency/linking system
  linkedTo?: string[]; // IDs of events this depends on (prerequisites)
  linkedFrom?: string[]; // IDs of events that depend on this
  linkType?: 'prerequisite' | 'sequence' | 'conflict'; // Type of relationship
};
