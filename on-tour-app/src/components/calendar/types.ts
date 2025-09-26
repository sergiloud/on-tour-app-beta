export type CalEventKind = 'show' | 'travel';

// Shared calendar event type across month/week/day/agenda
export type CalEvent = {
  id: string;
  date: string; // YYYY-MM-DD (tz-aware bucket)
  kind: CalEventKind;
  title: string;
  status?: string;
  meta?: string;
  // Optional timed fields used in Week/Day views
  start?: string; // ISO
  end?: string;   // ISO
  allDay?: boolean;
};
