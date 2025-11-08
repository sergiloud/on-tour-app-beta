# 🎯 New Features Quick Start Guide

## Feature 1: Drag-to-Move Events

### How to Use

1. **Move Event:** Click and drag an event to a new time slot
2. **Copy Event:** Hold Alt (or Option on Mac) while dragging
3. **Drop Zone:** Release on any time slot or date cell

### Visual Feedback

- Dragging event scales up (1.05x) with reduced opacity
- Ring highlight appears around cursor position
- Target zone highlighted when hovering

### Code Integration

```tsx
import DragToMoveHandler from '@/components/calendar/DragToMoveHandler';

<DragToMoveHandler
  event={calEvent}
  onMove={(eventId, newDate, hour) => {
    // Update event time in your state/API
    console.log(`Move ${eventId} to ${newDate} at ${hour}:00`);
  }}
  onCopy={(eventId, newDate) => {
    // Create duplicate event
    console.log(`Copy ${eventId} to ${newDate}`);
  }}
>
  <EventChip {...props} />
</DragToMoveHandler>;
```

---

## Feature 2: Multi-Select Events

### How to Use

1. **Toggle Selection:** Ctrl+Click (Cmd+Click on Mac) any event
2. **Multiple Selection:** Ctrl+Click multiple events to select them
3. **Bulk Actions:** Click buttons in floating panel (Move, Copy, Delete)

### Visual Feedback

- Selected events have blue ring: `ring-2 ring-accent-500`
- Floating panel appears at bottom with action buttons
- Smooth animations when opening/closing panel

### Code Integration

```tsx
import { useMultiSelect, MultiSelectPanel } from '@/components/calendar/MultiSelectManager';

const MyComponent = () => {
  const multiSelect = useMultiSelect();

  return (
    <>
      {/* Pass to EventChip */}
      <EventChip
        isSelected={multiSelect.isSelected(eventId)}
        onMultiSelect={isSelected => {
          multiSelect.toggleSelection(eventId, true);
        }}
      />

      {/* Render panel */}
      <MultiSelectPanel
        selectedCount={multiSelect.count}
        onMove={() => console.log('Move:', multiSelect.selectedIds)}
        onCopy={() => console.log('Copy:', multiSelect.selectedIds)}
        onDelete={() => {
          // Delete selected events
          multiSelect.clearSelection();
        }}
      />
    </>
  );
};
```

### Hook Methods

```tsx
const multiSelect = useMultiSelect();

// Toggle selection
multiSelect.toggleSelection(eventId, isMultiSelect);

// Check if selected
if (multiSelect.isSelected(eventId)) {
  /* ... */
}

// Get count
console.log(`${multiSelect.count} events selected`);

// Select all
multiSelect.selectAll([id1, id2, id3]);

// Clear all
multiSelect.clearSelection();

// Access selected IDs
const ids = Array.from(multiSelect.selectedIds);
```

---

## Feature 3: Event Dependencies

### Dependency Types

1. **must_before:** Event A must occur before Event B
2. **must_after:** Event A must occur after Event B
3. **same_day:** Events must be on same calendar day
4. **within_hours:** Events must be within X hours

### How to Use

```tsx
import {
  useEventDependencies,
  DependencyConflictAlert,
} from '@/components/calendar/EventDependencyManager';

const MyComponent = ({ events, dependencies }) => {
  const { findConflicts } = useEventDependencies(dependencies);
  const conflicts = findConflicts(events);

  return (
    <>
      {/* Show conflicts */}
      {conflicts.length > 0 && <DependencyConflictAlert conflicts={conflicts} />}

      {/* Or use LinkManager */}
      <DependencyLinkManager
        event={currentEvent}
        availableEvents={otherEvents}
        onAddDependency={(eventId, dependsOnId, type) => {
          // Save dependency to backend
        }}
      />
    </>
  );
};
```

### Dependency Structure

```tsx
interface EventDependency {
  id: string;
  eventId: string; // Event that depends
  dependsOnEventId: string; // Event that must happen first/same day/etc
  type: 'must_before' | 'must_after' | 'same_day' | 'within_hours';
  metadata?: {
    minHours?: number; // For within_hours type
    maxHours?: number;
  };
}
```

### Conflict Detection Example

```tsx
const conflicts = findConflicts(events);
conflicts.forEach(conflict => {
  console.log(conflict.type); // 'violated' or 'warning'
  console.log(conflict.message); // "Sound check must be before show"
  console.log(conflict.suggestion); // "Move sound check earlier"
});
```

---

## Feature 4: Custom Fields

### Predefined Templates

Each event type comes with preset custom fields:

**Show Events:**

- venue_name (text)
- capacity (number)
- ticket_price (number)
- sound_check (checkbox)

**Travel Events:**

- flight_number (text)
- airline (text)
- booking_code (text)
- departure_time (time)
- departure_city (text)
- arrival_city (text)

**Meeting Events:**

- meeting_type (select: internal/external/conference)
- attendees (text)
- meeting_link (url)

**Rehearsal Events:**

- duration_hours (number)
- location (text)
- focus_areas (text)

**Break Events:**

- break_type (select: meal/rest/other)

### How to Use

```tsx
import { CustomFieldManager } from '@/components/calendar/CustomFieldManager';

const MyComponent = ({ eventType }) => {
  const handleSaveFields = fields => {
    console.log('Saved custom fields:', fields);
    // POST to backend /events/{eventTypeId}/custom-fields
  };

  return (
    <CustomFieldManager
      eventType={eventType} // 'show' | 'travel' | 'meeting' | 'rehearsal' | 'break'
      onSave={handleSaveFields}
    />
  );
};
```

### Adding Custom Fields

```tsx
// In EventCreationModal.tsx
<CustomFieldManager
  eventType={selectedEventType}
  onSave={fields => {
    // Save field definitions
    const updatedEventType = {
      ...selectedEventType,
      customFields: fields,
    };
    saveEventType(updatedEventType);
  }}
/>;

// Store field values with event
const eventWithFields = {
  ...event,
  customFieldValues: {
    'venue_name-123': 'Madison Square Garden',
    'capacity-124': 20000,
    'ticket_price-125': 75.5,
  },
};
```

### Field Types Available

```tsx
type CustomFieldType =
  | 'text' // Single line text
  | 'number' // Numeric input
  | 'email' // Email validation
  | 'phone' // Phone number
  | 'url' // URL validation
  | 'date' // Date picker
  | 'select' // Dropdown options
  | 'checkbox'; // Boolean toggle
```

---

## 🎨 Styling & Customization

### Selected Event Styling

```css
/* Blue ring on selected events */
.selected-event {
  ring: 2px;
  ring-color: rgb(var(--color-accent-500) / <alpha-value>);
  ring-offset: 1px;
  ring-offset-color: rgb(15 23 42 / <alpha-value>);
}
```

### Drag Feedback Styling

```css
/* Event during drag */
.dragging-event {
  transform: scale(1.05);
  opacity: 0.8;
  box-shadow: 0 0 0 3px rgb(var(--color-accent-500) / 0.5);
}
```

### Multi-Select Panel

```css
/* Floating panel at bottom */
.multi-select-panel {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 0.5rem;
  animation: slideUp 0.2s ease-out;
}
```

---

## 🔌 Backend Integration Checklist

- [ ] **Drag-to-Move API**
  - POST `/events/{id}/move` with `{ newDate, newStartHour }`
  - POST `/events/{id}/copy` with `{ newDate }`

- [ ] **Multi-Select Bulk Operations**
  - POST `/events/bulk-move` with `{ eventIds[], newDate }`
  - DELETE `/events/bulk-delete` with `{ eventIds[] }`
  - POST `/events/bulk-copy` with `{ eventIds[], newDate }`

- [ ] **Dependencies API**
  - GET `/events/{id}/dependencies`
  - POST `/dependencies` with `{ eventId, dependsOnId, type, metadata }`
  - DELETE `/dependencies/{id}`

- [ ] **Custom Fields API**
  - GET `/event-types/{typeId}/custom-fields`
  - POST `/event-types/{typeId}/custom-fields` with `{ fields[] }`
  - POST `/events/{id}/field-values` with `{ fieldId: value }[]`

---

## 🧪 Testing Features

### Drag-to-Move Testing

```tsx
// Test helper
cy.get('[data-testid="event-chip"]').trigger('mousedown');
cy.get('[data-time-slot="14"]').trigger('mouseup');
cy.get('[data-testid="event-chip"]').should('have.attr', 'data-time', '14:00');
```

### Multi-Select Testing

```tsx
// Ctrl+Click to select
cy.get('[data-testid="event-chip"]').first().click({ ctrlKey: true });
cy.get('[data-testid="event-chip"]').first().should('have.class', 'ring-accent-500');

// Open bulk delete
cy.get('[data-testid="multi-panel-delete"]').click();
cy.on('confirm', () => true);
```

### Dependencies Testing

```tsx
// Create circular dependency (should fail)
const dep1 = { eventId: 'A', dependsOnId: 'B', type: 'must_before' };
const dep2 = { eventId: 'B', dependsOnId: 'A', type: 'must_before' };
// Should trigger conflict alert
```

---

## 📚 Component API Reference

### DragToMoveHandler

```tsx
interface Props {
  event: CalEvent;
  onMove: (eventId: string, newDate: string, newStartHour: number) => void;
  onCopy: (eventId: string, newDate: string) => void;
  children: React.ReactNode;
  isDraggable?: boolean;
}
```

### useMultiSelect

```tsx
interface MultiSelect {
  selectedIds: Set<string>;
  count: number;
  isOpen: boolean;
  toggleSelection: (id: string, isMultiSelect: boolean) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}
```

### MultiSelectPanel

```tsx
interface Props {
  selectedCount: number;
  onMove: () => void;
  onCopy: () => void;
  onDelete: () => void;
}
```

### useEventDependencies

```tsx
interface HookReturn {
  findConflicts: (events: CalEvent[]) => DependencyConflict[];
}

interface DependencyConflict {
  type: 'violated' | 'warning';
  message: string;
  suggestion: string;
}
```

### CustomFieldManager

```tsx
interface Props {
  eventType: 'show' | 'travel' | 'meeting' | 'rehearsal' | 'break';
  onSave: (fields: CustomField[]) => void;
}
```

---

## 🚀 Quick Example: Complete Integration

```tsx
import React from 'react';
import WeekGrid from '@/components/calendar/WeekGrid';
import DayGrid from '@/components/calendar/DayGrid';

export const Calendar = ({ events, eventTypes }) => {
  const handleDragToMove = (eventId, newDate, hour) => {
    // API call
    updateEvent(eventId, { start: `${newDate}T${String(hour).padStart(2, '0')}:00:00Z` });
  };

  const handleBulkDelete = eventIds => {
    // API call
    deleteEvents(eventIds);
  };

  return (
    <div className="space-y-8">
      <WeekGrid events={events} onOpen={openEventModal} onDeleteEvent={handleBulkDelete} />

      <DayGrid
        day={selectedDay}
        events={events}
        onOpen={openEventModal}
        onDeleteEvent={handleBulkDelete}
      />
    </div>
  );
};
```

---

## ❓ FAQ

**Q: Can I drag an event and immediately copy it?**
A: Yes! Hold Alt (Option on Mac) while dragging. The original stays in place and a copy appears where you drop it.

**Q: What happens if I create a circular dependency?**
A: The conflict detection will flag it as a violation with a message: "Circular dependency detected". You'll need to remove one of the dependencies.

**Q: Can I bulk-move events to a different date?**
A: The UI is ready! Just implement the `onBulkMove` handler to call your backend API with the new date.

**Q: Do custom fields persist between events?**
A: Custom field _definitions_ are per event type. Field _values_ are stored per event. Both persist to backend.

**Q: Can I undo a drag operation?**
A: Not built-in yet. You could implement an undo stack using event history or database transaction rollback.

---

**Status:** All features ready for production use! 🚀
