# Event Dependencies & Linking System - Implementation Guide

## Overview

A robust event dependency system that creates logical chains for tour events (Flight → Show → Travel) with visual indicators and automatic conflict detection.

## Architecture

### 1. **Core Types** (`src/components/calendar/types.ts`)

```typescript
type CalEvent = {
  // ... existing fields ...
  linkedTo?: string[]; // IDs of events this depends on
  linkedFrom?: string[]; // IDs of events that depend on this
  linkType?: 'prerequisite' | 'sequence' | 'conflict';
};
```

### 2. **EventLink Model** (`src/components/calendar/EventLinkingModal.tsx`)

```typescript
type EventLink = {
  fromId: string; // Source event
  toId: string; // Target event
  type: 'before' | 'after' | 'sameDay'; // Relationship type
  gap?: number; // Minimum days between (for 'before' type)
};
```

## Components

### EventLinkingModal (`src/components/calendar/EventLinkingModal.tsx`)

**Purpose**: User interface for creating/editing event dependencies

**Features**:

- Select source and target events
- Choose link type:
  - `before`: Source must happen before target (with optional gap)
  - `after`: Source must happen after target
  - `sameDay`: Events must be on same day
- Visual preview of the relationship
- Delete existing links

**Usage**:

```tsx
<EventLinkingModal
  open={isOpen}
  fromEvent={selectedEvent}
  toEvent={targetEvent}
  onLink={link => addLink(link)}
  onClose={() => setOpen(false)}
/>
```

### EventConnectionLines (`src/components/calendar/EventConnectionLines.tsx`)

**Purpose**: Render SVG lines connecting linked events in calendar

**Visual Features**:

- Curved bezier paths between events
- Color-coded by relationship type:
  - 🟢 Green (before): prerequisite
  - 🟠 Orange (after): reverse sequence
  - 🔵 Blue (sameDay): dashed lines
- Arrow markers showing direction
- Hover effects for clarity
- Glow/shadow effects for depth

**How it works**:

1. Queries calendar DOM for event elements
2. Calculates positions from element bounding rects
3. Renders SVG paths between positions
4. Updates on resize/scroll

### ConflictAlert (`src/components/calendar/ConflictAlert.tsx`)

**Purpose**: Display dependency violations and conflicts

**Alert Types**:

- 🔴 **Error**: Broken dependencies (critical)
  - Event moved after its dependent
  - Gap violation
  - Sequence broken
- 🟠 **Warning**: Soft conflicts
  - Same-day events on different days
  - Optional spacing violations

**Shows**:

- Conflict message
- Affected events
- Suggested fix

## Utilities

### ConflictDetector (`src/lib/conflictDetector.ts`)

**Purpose**: Validate events and links for conflicts

**Methods**:

#### `checkMoveConflict(eventId, newDate, events, links)`

Validates if moving an event breaks any dependencies

**Returns**: Array of `Conflict` objects

**Logic**:

1. Find all links involving the event
2. For each link:
   - **before**: newDate ≤ targetDate - gap
   - **after**: newDate ≥ targetDate
   - **sameDay**: newDate === targetDate
3. Return violations

#### `validateAll(events, links)`

Comprehensive validation of entire calendar

**Detects**:

- All move conflicts
- Circular dependencies (A→B→A)

#### `detectCircularDependencies(links, events)`

Finds circular dependency chains using DFS

## Hooks

### useEventLinks (`src/hooks/useEventLinks.ts`)

**Purpose**: Manage event links and conflicts

**State**:

- `links`: Array of EventLink
- `conflicts`: Array of Conflict

**Methods**:

- `addLink(link)`: Create new link
- `removeLink(fromId, toId)`: Delete link
- `updateLink(fromId, toId, updates)`: Modify existing link
- `getLinksForEvent(eventId)`: Get all links for event
- `getConflictsForEvent(eventId)`: Get conflicts for event
- `hasConflict(eventId)`: Boolean check

**Features**:

- Auto-saves to localStorage
- Auto-validates on changes
- Prevents circular dependencies
- Deduplicates links

## Usage Workflow

### 1. Creating a Link

```tsx
const { addLink } = useEventLinks();

const handleCreateLink = () => {
  const link: EventLink = {
    fromId: flightId,
    toId: showId,
    type: 'before',
    gap: 2, // At least 2 days before show
  };
  addLink(link);
};
```

### 2. Displaying Connections

```tsx
<EventConnectionLines links={links} eventElements={eventRefMap} containerRect={calendarRect} />
```

### 3. Handling Conflicts

```tsx
const { conflicts } = useEventLinks();

<ConflictAlert conflicts={conflicts} />;
```

### 4. Moving with Validation

```tsx
const { addLink } = useEventLinks();

const handleMoveEvent = (eventId, newDate) => {
  const moveConflicts = ConflictDetector.checkMoveConflict(eventId, newDate, events, links);

  if (moveConflicts.length > 0) {
    // Show conflicts
    showConflictAlert(moveConflicts);
    return false;
  }

  // Safe to move
  updateEventDate(eventId, newDate);
  return true;
};
```

## Data Flow

```
User creates link
    ↓
EventLinkingModal captures (fromId, toId, type, gap)
    ↓
useEventLinks.addLink()
    ↓
Link saved to localStorage
    ↓
useEventLinks validates all conflicts
    ↓
ConflictDetector.validateAll() runs
    ↓
Conflicts state updates
    ↓
ConflictAlert renders or clears
```

## Visual Examples

### Example 1: Tour Sequence

```
Flight to London (Nov 5)
    ↓ (1 day gap before)
Show in London (Nov 6)
    ↓ (same day as)
Travel to Manchester (Nov 6)
    ↓ (2 day gap before)
Show in Manchester (Nov 8)
```

### Example 2: Conflict Detection

- Trying to move Show to Nov 4 (before Flight)
- ConflictAlert shows: "Show must happen after Flight"
- Suggestion: "Move Show to Nov 5 or later"

## Storage

All links are persisted to localStorage with key `calendar:event-links`

```json
[
  {
    "fromId": "show:uuid-1",
    "toId": "show:uuid-2",
    "type": "before",
    "gap": 1
  }
]
```

## Future Enhancements

- [ ] Backend persistence (sync with server)
- [ ] Link templates (common sequences)
- [ ] Batch operations (move entire chain)
- [ ] Undo/redo for link changes
- [ ] Link descriptions/notes
- [ ] Conflict auto-resolution suggestions
- [ ] Analytics on tour flow patterns

## Testing Checklist

- [ ] Create single link
- [ ] Create chain (A→B→C)
- [ ] Delete link
- [ ] Update link gap
- [ ] Move event, see conflict alert
- [ ] Follow suggestion, resolve conflict
- [ ] Try circular dependency, prevented
- [ ] Page reload, links persist
- [ ] Mobile responsive connections
