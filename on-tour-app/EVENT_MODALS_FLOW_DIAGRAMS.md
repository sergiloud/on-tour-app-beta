# Event Modals Integration - Visual Flow Diagram 📊

## Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Calendar.tsx                          │
│          (Main component, orchestrator)                 │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    MonthGrid  WeekGrid   DayGrid
         │           │           │
         └───────────┼───────────┘
                     │
                     ▼ (click day)
         ┌─────────────────────────┐
         │ handleOpenDayDetails()  │
         └────────────┬────────────┘
                      │
        ┌─────────────▼─────────────┐
        │  DayDetailsModal.tsx      │
        │ (Display events + quick  │
        │  add buttons)            │
        └─────────────┬─────────────┘
                      │
      ┌───────────────┼───────────────┐
      │ Click event type button        │
      │ (Show/Travel/Meeting/...)      │
      │
      ▼
┌──────────────────────────┐
│ handleCreateEvent()      │
│ Sets eventType & opens   │
│ EventCreationModal       │
└────────────┬─────────────┘
             │
             ▼
      ┌─────────────────────────┐
      │ EventCreationModal.tsx  │
      │ (Multi-type form)       │
      └────────────┬────────────┘
                   │
         ┌─────────▼─────────┐
         │ Form Validation   │
         │ (Real-time)       │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │ User clicks Save  │
         └─────────┬─────────┘
                   │
                   ▼
      ┌────────────────────────────┐
      │ handleSaveEvent(data)      │
      │ - Switch on event.type     │
      │ - Create event object      │
      │ - Call add() hook          │
      │ - Track telemetry          │
      │ - Close modals             │
      └────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ Events persisted    │
         │ in useShows() hook  │
         └─────────────────────┘
```

---

## User Flow Diagram

```
START
  │
  ├─ User sees Calendar
  │   │
  │   ├─ Month View
  │   ├─ Week View
  │   ├─ Day View
  │   └─ Agenda View
  │
  ├─ User clicks on Day
  │   │
  │   ▼ DayDetailsModal Opens
  │   ├─ Shows: "Monday, November 18, 2024"
  │   ├─ Lists existing events (if any)
  │   └─ Shows 5 quick-add buttons
  │
  ├─ User clicks event type button
  │   │
  │   ├─ 🎵 Show
  │   ├─ ✈️ Travel
  │   ├─ 📅 Meeting
  │   ├─ 🎸 Rehearsal
  │   └─ 🏖️ Break
  │
  ├─ EventCreationModal Opens
  │   │
  │   ├─ Date field pre-filled
  │   ├─ Event-type specific fields shown
  │   └─ Form validation enabled
  │
  ├─ User fills in required fields
  │   │
  │   ├─ Real-time validation
  │   ├─ Red error messages if invalid
  │   └─ Green checkmarks if valid
  │
  ├─ User clicks "Save"
  │   │
  │   ├─ handleSaveEvent() called
  │   ├─ Event data processed
  │   ├─ Event saved to database
  │   ├─ Telemetry tracked
  │   └─ Modal closes
  │
  └─ END: Event appears in calendar
```

---

## Event Type Flow Diagram

```
EventCreationModal.tsx
│
├─ Event Type: "show"
│  ├─ Form Fields:
│  │  ├─ City (required)
│  │  ├─ Country (required)
│  │  ├─ Date (pre-filled)
│  │  ├─ Fee (optional)
│  │  └─ Status (pending/confirmed/cancelled)
│  │
│  └─ Saved as:
│     └─ Show { id, city, country, date, fee, status }
│
├─ Event Type: "travel"
│  ├─ Form Fields:
│  │  ├─ Origin (required)
│  │  ├─ Destination (required)
│  │  ├─ Start Date (required)
│  │  ├─ End Date (optional)
│  │  └─ Travel Mode (flight/train/car/bus)
│  │
│  └─ Saved as:
│     └─ CalEvent { type: 'travel', date, dateEnd, origin, destination }
│
├─ Event Type: "meeting"
│  ├─ Form Fields:
│  │  ├─ Title (required)
│  │  ├─ Location (required)
│  │  ├─ Date (pre-filled)
│  │  ├─ Start Time (optional)
│  │  ├─ End Time (optional)
│  │  ├─ Description (optional)
│  │  └─ Attendees (optional)
│  │
│  └─ Saved as:
│     └─ CalEvent { type: 'meeting', title, location, date, time, ... }
│
├─ Event Type: "rehearsal"
│  ├─ Form Fields:
│  │  ├─ Title (required)
│  │  ├─ Location (required)
│  │  ├─ Date (pre-filled)
│  │  ├─ Start Time (optional)
│  │  ├─ End Time (optional)
│  │  └─ Description (optional)
│  │
│  └─ Saved as:
│     └─ CalEvent { type: 'rehearsal', title, location, date, time, ... }
│
└─ Event Type: "break"
   ├─ Form Fields:
   │  ├─ Title (required)
   │  ├─ Location (required)
   │  ├─ Date (pre-filled)
   │  ├─ Duration (optional)
   │  └─ Description (optional)
   │
   └─ Saved as:
      └─ CalEvent { type: 'break', title, location, date, duration, ... }
```

---

## State Management Diagram

```
Calendar.tsx State
│
├─ Modal States
│  │
│  ├─ eventCreationOpen: boolean
│  │  └─ Controls EventCreationModal visibility
│  │
│  ├─ eventCreationDate: string | undefined
│  │  └─ Pre-fills date field in form
│  │
│  ├─ eventCreationType: EventType | null
│  │  └─ Determines form fields shown
│  │
│  ├─ dayDetailsOpen: boolean
│  │  └─ Controls DayDetailsModal visibility
│  │
│  └─ dayDetailsDate: string | undefined
│     └─ Determines which day's events to show
│
├─ Event Sources
│  │
│  ├─ shows: Show[] (from useShows hook)
│  │  └─ Array of show events
│  │
│  ├─ travel: Itinerary[] (from fetchItinerariesGentle)
│  │  └─ Array of travel events
│  │
│  └─ eventsByDay: Map<string, CalEvent[]> (from useCalendarEvents)
│     └─ Events grouped by date for quick lookup
│
└─ UI States
   │
   ├─ selectedDay: string
   │  └─ Currently selected day for detail view
   │
   ├─ view: 'month' | 'week' | 'day' | 'agenda'
   │  └─ Current calendar view
   │
   └─ filters: FilterState
      └─ Event type filters
```

---

## Data Flow Diagram

```
User Input (Click Day)
        │
        ▼
┌──────────────────────────┐
│ handleOpenDayDetails()   │
├──────────────────────────┤
│ • Set dayDetailsDate     │
│ • Set dayDetailsOpen     │
│ • Look up events in map  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ DayDetailsModal          │
├──────────────────────────┤
│ • Display date           │
│ • Show event list        │
│ • Render quick buttons   │
└──────────┬───────────────┘
           │
User clicks event type button
           │
           ▼
┌──────────────────────────┐
│ handleCreateEvent()      │
├──────────────────────────┤
│ • Set eventCreationType  │
│ • Set eventCreationDate  │
│ • Set eventCreationOpen  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ EventCreationModal       │
├──────────────────────────┤
│ • Show event form        │
│ • Initialize fields      │
│ • Enable validation      │
└──────────┬───────────────┘
           │
User fills form & clicks Save
           │
           ▼
┌──────────────────────────┐
│ handleSaveEvent()        │
├──────────────────────────┤
│ • Process event data     │
│ • Create Show object     │
│ • Call add() hook        │
│ • Track telemetry        │
│ • Reset modal states     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Event Persisted          │
├──────────────────────────┤
│ • Stored in useShows()   │
│ • eventsByDay updated    │
│ • Calendar re-renders    │
└──────────────────────────┘
```

---

## Component Dependency Graph

```
Calendar.tsx
    ├─ Imports:
    │  ├─ EventCreationModal from components/calendar/EventCreationModal
    │  ├─ DayDetailsModal from components/calendar/DayDetailsModal
    │  ├─ EventType from components/calendar/EventCreationModal
    │  ├─ EventData from components/calendar/EventCreationModal
    │  └─ Show from lib/shows
    │
    └─ Provides Props To:
       ├─ MonthGrid
       │  └─ Uses: onOpenDay callback
       │
       ├─ WeekGrid
       │  └─ Uses: eventsByDay data
       │
       ├─ DayGrid
       │  └─ Uses: dayEvents data
       │
       ├─ EventCreationModal
       │  └─ Props: open, initialDate, initialType, onClose, onSave
       │
       └─ DayDetailsModal
          └─ Props: open, day, events, onClose, onCreateEvent
```

---

## Type Flow Diagram

```
EventType (enum-like)
    │
    ├─ Exported from: EventCreationModal.tsx
    ├─ Type: 'show' | 'travel' | 'meeting' | 'rehearsal' | 'break'
    │
    └─ Used in:
       ├─ EventCreationModal props: initialType?: EventType
       ├─ handleCreateEvent: (eventType: EventType) => void
       ├─ DayDetailsModal.onCreateEvent: (type: EventType) => void
       └─ Calendar state: eventCreationType: EventType | null

EventData (interface)
    │
    ├─ Exported from: EventCreationModal.tsx
    ├─ Fields:
    │  ├─ type: EventType
    │  ├─ date: string (YYYY-MM-DD)
    │  ├─ dateEnd?: string
    │  ├─ city?: string
    │  ├─ country?: string
    │  ├─ title?: string
    │  ├─ location?: string
    │  ├─ time?: string
    │  ├─ fee?: number
    │  ├─ status?: 'pending' | 'confirmed' | 'cancelled'
    │  └─ ... (other type-specific fields)
    │
    └─ Used in:
       └─ handleSaveEvent: (data: EventData) => void

CalEventKind (type in types.ts)
    │
    ├─ Original: 'show' | 'travel'
    ├─ Extended: 'show' | 'travel' | 'meeting' | 'rehearsal' | 'break'
    │
    └─ Used in:
       ├─ CalEvent kind field
       └─ Filter configurations
```

---

## Error Handling Flow

```
User fills form
       │
       ▼
┌──────────────────────────┐
│ Real-time Validation    │
├──────────────────────────┤
│ If invalid:             │
│  • Show error message   │
│  • Disable Save button  │
│  • Highlight field      │
└──────────────────────────┘
       │
       ├─ Valid ──────┐
       │              │
       │              ▼
       │        User clicks Save
       │              │
       ▼              ▼
    Invalid      Valid
       │           │
       ▼           ▼
    Stop      Try Save
       │           │
       │           ▼
       │      ┌──────────────┐
       │      │ Try/Catch    │
       │      ├──────────────┤
       │      │ On Error:    │
       │      │ • Log error  │
       │      │ • Show user  │
       │      │ • Keep modal │
       │      └──────────────┘
       │
       └─────────►Done
```

---

## Animation Flow Diagram

```
EventCreationModal Opening:
    Initial State ──► AnimatePresence ──► Framer Motion
         │                    │                  │
         └─ opacity: 0        └─ Detect          └─ opacity: 1
         └─ scale: 0.95           open            scale: 1
                                   │              duration: 0.2s
                                   ▼
                              Initial ──► Animate ──► Exit
                                         ease: "easeOut"

DayDetailsModal Animations:
    Modal: slide-up from bottom
    Event List: staggered fade-in
    Each Event: staggered animation

EventCreationModal Field Animations:
    Form appears with smooth transitions
    Error messages slide-in
    Success feedback animates out
```

---

## Integration Timeline

```
Phase 1: Component Creation
    └─ EventCreationModal.tsx (350 lines) ✅
    └─ DayDetailsModal.tsx (300 lines) ✅

Phase 2: Type System
    └─ Extend CalEventKind (types.ts) ✅

Phase 3: State Management
    └─ Add modal states (Calendar.tsx) ✅

Phase 4: Handlers
    └─ handleCreateEvent() ✅
    └─ handleSaveEvent() ✅
    └─ handleOpenDayDetails() ✅

Phase 5: Integration
    └─ Connect MonthGrid onOpenDay ✅
    └─ Render modals in JSX ✅

Phase 6: Validation
    └─ Fix type errors ✅
    └─ Build success ✅
    └─ Verify integration ✅

Phase 7: Documentation
    └─ Quick start guide ✅
    └─ Integration report ✅
    └─ Visual diagrams ✅

RESULT: ✅ COMPLETE & PRODUCTION READY
```

---

## Key Integration Points

### 1. Modal Opening Sequence

```
User clicks day
    ↓
MonthGrid.onOpenDay(date)
    ↓
handleOpenDayDetails(date)
    ↓
setDayDetailsDate(date)
setDayDetailsOpen(true)
    ↓
DayDetailsModal renders
```

### 2. Event Creation Sequence

```
User clicks event type button
    ↓
handleCreateEvent(eventType)
    ↓
setEventCreationType(eventType)
setEventCreationDate(date)
setEventCreationOpen(true)
    ↓
EventCreationModal renders with type
```

### 3. Event Saving Sequence

```
User clicks Save in form
    ↓
handleSaveEvent(eventData)
    ↓
Switch on eventData.type
    ↓
Create Show/Event object
    ↓
Call add() hook
    ↓
Track telemetry
    ↓
Reset modal states
    ↓
Modals close, calendar updates
```

---

**Status**: ✅ Complete
**Build**: ✅ Passing
**Integration**: ✅ Successful
**Ready for Testing**: ✅ YES
