# 🗓️ Advanced Calendar Features - Complete Documentation

**On Tour App 2.0** - Revolutionary Calendar System with Multi-Day Events, Smart Filters, Timeline View & More

---

## 📋 Table of Contents

1. [New Features Overview](#new-features-overview)
2. [Multi-Day Events](#multi-day-events)
3. [Advanced Search & Filters](#advanced-search--filters)
4. [Timeline View](#timeline-view)
5. [Export & Import](#export--import)
6. [Component Architecture](#component-architecture)
7. [Usage Examples](#usage-examples)
8. [Implementation Guide](#implementation-guide)

---

## 🎯 New Features Overview

### ✨ Core Innovations

| Feature                    | Description                                                | Use Case                                           |
| -------------------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| **Multi-Day Events**       | Drag events across calendar to span multiple days          | Tours, festivals, residencies spanning days        |
| **Smart Search**           | Search by title, city, country, notes - case insensitive   | Quick event discovery without scrolling            |
| **Advanced Filters**       | Type, status, pinned events, custom date ranges            | Organize chaos into focused views                  |
| **Timeline View**          | Chronological event display with visual hierarchy          | Planning tours sequentially                        |
| **Drag-Drop**              | Move events to different dates, duplicate easily           | Reschedule quickly                                 |
| **Color Coding**           | 6 color variants per event type (accent, green, red, etc.) | Visual organization                                |
| **Pinning**                | Mark important events for quick access                     | Prioritize critical shows/travel                   |
| **Export to ICS**          | Calendar-compatible format for external apps               | Sync with Google Calendar, Outlook, Apple Calendar |
| **Export to CSV**          | Spreadsheet format                                         | Import to Excel, Google Sheets for analysis        |
| **Export to JSON**         | Raw data backup                                            | Data portability, integrations                     |
| **Event Density Heat Map** | Visual indicator of busy days                              | See workload at a glance                           |

---

## 🎪 Multi-Day Events

### What Are Multi-Day Events?

Events that span multiple consecutive days. Perfect for:

- **Tours** spanning multiple cities
- **Festivals** with multiple show dates
- **Travel periods** between cities
- **Residencies** lasting weeks

### How to Create Multi-Day Events

```typescript
const event: CalendarEvent = {
  id: 'show-001',
  title: 'European Tour 2025',
  kind: 'show',
  date: '2025-06-01', // Start date
  endDate: '2025-06-15', // End date (optional)
  status: 'confirmed',
  color: 'accent',
};
```

### How to Edit Multi-Day Events

1. **Click on the event** in calendar
2. **Expand the multi-day editor** dialog
3. **Adjust start/end dates** using the arrow buttons:
   - ← **Shrink** duration
   - → **Extend** duration
4. **Save changes** to persist

### MultiDayEventEditor Component

```tsx
import { MultiDayEventEditor } from './calendar/MultiDayEventEditor';

<MultiDayEventEditor
  event={selectedEvent}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
  onClose={handleClose}
/>;
```

### Features

- **Visual feedback**: Shows current duration and changes
- **Drag arrows**: Extend or shrink start/end dates
- **Delete option**: Remove events quickly
- **Duplicate**: Create copies spanning different periods
- **Pin events**: Mark as important for quick access

### Visual Representation

Multi-day events are displayed as:

- **Continuous bars** spanning grid columns
- **"Multi" badge** indicating multi-day span
- **Color-coded** by event type
- **Drag-enabled** for quick rescheduling

---

## 🔍 Advanced Search & Filters

### Search Capabilities

#### Text Search

- **Case-insensitive** matching
- Searches across:
  - Event title
  - City name
  - Country code
  - Event notes

**Example**: Type "Madrid" to find all shows/travel in Madrid

#### Type Filters

- **🎤 Shows**: Performance/tour events
- **✈️ Travel**: Travel/logistics events

#### Status Filters

- **⏳ Pending**: Not yet confirmed
- **✓ Confirmed**: Locked in
- **✗ Cancelled**: Cancelled events

#### Other Filters

- **📌 Pinned Only**: Show only pinned events
- **Color-based**: Filter by event color
- **Date Range**: Custom from/to dates

### Smart Filter UI

```tsx
import { AdvancedCalendarSearch } from './calendar/AdvancedCalendarSearch';

<AdvancedCalendarSearch
  filters={currentFilters}
  onFiltersChange={handleFilterChange}
  onClear={handleClearFilters}
/>;
```

### Filter Application

```typescript
// Apply multiple filters at once
const filtered = filterEvents(events, {
  search: 'Madrid',
  kinds: ['show'],
  status: ['confirmed'],
  pinned: true,
  dateRange: { from: '2025-06-01', to: '2025-08-31' },
});
```

### Active Filters Display

- Shows all active filters as removable chips
- Each chip shows icon and label
- Click ✕ to remove individual filters
- "Clear All" button to reset all

---

## 📊 Timeline View

### What is Timeline View?

Chronological event display with:

- **Vertical timeline** with date milestones
- **Event cards** grouped by date
- **Visual hierarchy**: Today highlighted with accent color
- **Multi-day indicators**: Shows when events start/continue/end
- **Density settings**: Compact, normal, or spacious

### Timeline Use Cases

Perfect for:

- **Tour planning**: See sequential shows/travel
- **Itinerary review**: Clear start-to-finish view
- **Bottleneck identification**: See busiest periods
- **Route planning**: Understand travel between shows

### Timeline Component

```tsx
import { TimelineView } from './calendar/TimelineView';

<TimelineView
  events={calendarEvents}
  from="2025-06-01"
  to="2025-08-31"
  onEventClick={handleEventClick}
  density="normal" // 'compact' | 'normal' | 'spacious'
/>;
```

### Visual Features

- **Vertical line**: Connects events chronologically
- **Date dots**:
  - 🟡 Regular day
  - 🔴 Today (with accent ring)
- **Event cards**:
  - Title, type (🎤/✈️), city
  - Status badge (green/yellow/red)
  - Multi-day indicator
  - Notes preview (truncated)
- **Hover effects**: Scale up, show arrow indicator

### Timeline Density

| Density      | Use Case                          |
| ------------ | --------------------------------- |
| **Compact**  | Overview of large date ranges     |
| **Normal**   | Detailed view with breathing room |
| **Spacious** | Detailed work session, editing    |

---

## 📥 Export & Import

### Export Formats

#### 📅 ICS (iCalendar)

- **Standard**: RFC 5545 compliant
- **Compatible with**:
  - Google Calendar
  - Apple Calendar
  - Outlook
  - Any calendar app
- **Use case**: Share with team, sync with personal calendar
- **File**: `calendar-export-YYYY-MM-DD.ics`

#### 📊 CSV (Comma-Separated Values)

- **Format**: Spreadsheet-compatible
- **Compatible with**:
  - Microsoft Excel
  - Google Sheets
  - LibreOffice Calc
- **Use case**: Data analysis, reporting, manipulation
- **Columns**: ID, Title, Type, Start Date, End Date, City, Country, Status, Notes
- **File**: `calendar-export-YYYY-MM-DD.csv`

#### 💾 JSON (JavaScript Object Notation)

- **Format**: Raw data structure
- **Use case**: Backup, integrations, API usage
- **Preserves**: All event properties including colors, reminders, attachments
- **File**: `calendar-export-YYYY-MM-DD.json`

### Export Methods

#### Method 1: Download File

```typescript
// Click "Download" button for each format
// File automatically saves to Downloads folder
```

#### Method 2: Copy to Clipboard

```typescript
// Click "Copy" button
// Paste directly into email, documents, etc.
```

### Import Formats

Supports same formats as export:

- **.ics files**: Calendar exports from other apps
- **.csv files**: Spreadsheet data
- **.json files**: Data backups or API responses

### Import Steps

1. **Click "Import Events"** section
2. **Drag & drop** or **click to select file**
3. **Supported formats**: .ics, .csv, .json
4. **Events merge** with existing calendar
5. **Duplicates handled** by ID matching

### Export/Import Component

```tsx
import { ExportImportPanel } from './calendar/ExportImportPanel';

<ExportImportPanel events={calendarEvents} onImport={handleImportEvents} />;
```

---

## 🏗️ Component Architecture

### New Components

#### 1. AdvancedCalendarTypes.ts

**Utilities and type definitions**

- `CalendarEvent` interface with multi-day support
- `CalendarFilter` interface for search/filter
- `DragEvent` interface for drag-drop operations
- Helper functions:
  - `getEventDateRange()` - Get all dates spanned by event
  - `isMultiDayEvent()` - Check if event spans days
  - `getEventSpan()` - Calculate grid positioning
  - `searchEvents()` - Smart event search
  - `filterEvents()` - Apply multiple filters
  - `exportToICS()` - Export as calendar format
  - `exportToCSV()` - Export as spreadsheet
  - `sortEvents()` - Sort by date/type

#### 2. MultiDayEventEditor.tsx

**Multi-day event editing UI**

- `MultiDayEventEditor` - Modal dialog for editing
- `MultiDayEventBar` - Visual grid representation
- Features:
  - Extend/shrink duration
  - Change start/end dates
  - Delete events
  - Duplicate events
  - Pin events

#### 3. AdvancedCalendarSearch.tsx

**Search and filtering UI**

- `AdvancedCalendarSearch` - Comprehensive search interface
- Features:
  - Text search across multiple fields
  - Type filters (show/travel)
  - Status filters (pending/confirmed/cancelled)
  - Pinned events filter
  - Active filter chips with removal
  - Clear all button

#### 4. TimelineView.tsx

**Chronological event visualization**

- `TimelineView` - Timeline component
- Features:
  - Vertical timeline with date milestones
  - Today highlight
  - Multi-day event indicators
  - Density settings (compact/normal/spacious)
  - Event click handlers

#### 5. ExportImportPanel.tsx

**Export and import functionality**

- `ExportImportPanel` - Export/import UI
- Features:
  - Export to ICS, CSV, JSON
  - Download or copy to clipboard
  - File import (drag-drop or click)
  - Format support info

---

## 💻 Usage Examples

### Example 1: Create Multi-Day Event

```typescript
const createTour = async () => {
  const tour: CalendarEvent = {
    id: crypto.randomUUID(),
    title: 'Summer European Tour',
    kind: 'show',
    date: '2025-06-15',
    endDate: '2025-08-30', // 2+ month tour
    status: 'confirmed',
    color: 'accent',
    city: 'Multiple Cities',
    notes: 'Major summer festival season',
  };

  await addEvent(tour);
};
```

### Example 2: Filter Events

```typescript
const findConfirmedShowsInSpain = () => {
  return filterEvents(allEvents, {
    kinds: ['show'],
    status: ['confirmed'],
    search: 'Madrid', // or any Spanish city
  });
};
```

### Example 3: Export and Email

```typescript
const shareWithTeam = () => {
  // Export to ICS
  const icsContent = exportToICS(calendarEvents);

  // Create mailto link
  const subject = 'Tour Calendar - Spring 2025';
  const body = encodeURIComponent(`Our tour calendar:\n\n${icsContent}`);
  window.open(`mailto:team@example.com?subject=${subject}&body=${body}`);
};
```

### Example 4: Timeline Planning

```typescript
const planSummerTour = async () => {
  const events = await getEventsForDateRange('2025-06-01', '2025-08-31');

  return (
    <TimelineView
      events={events}
      from="2025-06-01"
      to="2025-08-31"
      onEventClick={editEvent}
      density="normal"
    />
  );
};
```

---

## 🛠️ Implementation Guide

### Step 1: Import New Components

```typescript
import { MultiDayEventEditor } from '@/components/calendar/MultiDayEventEditor';
import { AdvancedCalendarSearch } from '@/components/calendar/AdvancedCalendarSearch';
import { TimelineView } from '@/components/calendar/TimelineView';
import { ExportImportPanel } from '@/components/calendar/ExportImportPanel';
import type { CalendarEvent, CalendarFilter } from '@/components/calendar/AdvancedCalendarTypes';
import {
  filterEvents,
  getEventDateRange,
  isMultiDayEvent,
  searchEvents,
  sortEvents,
} from '@/components/calendar/AdvancedCalendarTypes';
```

### Step 2: Setup State Management

```typescript
const [events, setEvents] = useState<CalendarEvent[]>([]);
const [filters, setFilters] = useState<CalendarFilter>({});
const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
const [view, setView] = useState<'month' | 'week' | 'day' | 'timeline'>('month');
```

### Step 3: Add Event Handlers

```typescript
const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
  setEvents(events.map(e => (e.id === updatedEvent.id ? updatedEvent : e)));
};

const handleDeleteEvent = (eventId: string) => {
  setEvents(events.filter(e => e.id !== eventId));
};

const handleImportEvents = (importedEvents: CalendarEvent[]) => {
  setEvents([...events, ...importedEvents]);
};

const handleFilterChange = (newFilters: CalendarFilter) => {
  setFilters(newFilters);
};
```

### Step 4: Render Components

```tsx
return (
  <div className="px-4 sm:px-6 flex flex-col gap-4 lg:gap-5 pb-8">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-semibold">Calendar</h1>
      <button onClick={() => setView(v => (v === 'month' ? 'timeline' : 'month'))}>
        {view === 'month' ? 'Timeline' : 'Month'}
      </button>
    </div>

    {/* Search & Filters */}
    <AdvancedCalendarSearch
      filters={filters}
      onFiltersChange={handleFilterChange}
      onClear={() => setFilters({})}
    />

    {/* Export & Import */}
    <ExportImportPanel events={filterEvents(events, filters)} onImport={handleImportEvents} />

    {/* Calendar View */}
    {view === 'month' && (
      <MonthGrid
        events={filterEvents(events, filters)}
        onEventClick={setSelectedEvent}
        onEventUpdate={handleUpdateEvent}
      />
    )}

    {view === 'timeline' && (
      <TimelineView
        events={filterEvents(events, filters)}
        from="2025-01-01"
        to="2025-12-31"
        onEventClick={setSelectedEvent}
        density="normal"
      />
    )}

    {/* Event Editor */}
    {selectedEvent && (
      <MultiDayEventEditor
        event={selectedEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        onClose={() => setSelectedEvent(null)}
      />
    )}
  </div>
);
```

---

## 🎨 Design System Integration

All components follow the established design system:

- **Glassmorphism**: `bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm`
- **Responsive spacing**: `px-4 sm:px-6 gap-4 lg:gap-5`
- **Colors**: Semantic (accent, green, red, blue, yellow, purple)
- **Animations**: Framer Motion with staggered entrance
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

---

## 📊 Data Model

```typescript
interface CalendarEvent {
  id: string;
  title: string;
  kind: 'show' | 'travel';
  date: string; // YYYY-MM-DD (start date)
  endDate?: string; // YYYY-MM-DD (optional, for multi-day)
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  status?: 'pending' | 'confirmed' | 'cancelled';
  meta?: string; // Additional info
  city?: string;
  country?: string;
  color?: 'accent' | 'green' | 'red' | 'blue' | 'yellow' | 'purple';
  pinned?: boolean;
  reminder?: 'none' | '15min' | '1hour' | '1day';
  notes?: string;
  attachments?: string[];
}
```

---

## 🚀 Performance Optimization

- **Memoization**: Events sorted/filtered only when dependencies change
- **Lazy rendering**: Timeline events render on-scroll
- **Debounced search**: Search input debounced to reduce re-renders
- **Virtualization**: Large calendars use windowing for DOM efficiency

---

## 🔐 Data Safety

- **Local validation**: All dates validated before save
- **Timezone-aware**: Handles DST and timezone conversions
- **Backup-friendly**: Export regularly for data protection
- **Undo-ready**: Each update can be tracked for undo/redo

---

**Last Updated**: November 5, 2025  
**Version**: 1.0.0 - Advanced Features Release

For questions, refer to Design System Reference or existing calendar components.
