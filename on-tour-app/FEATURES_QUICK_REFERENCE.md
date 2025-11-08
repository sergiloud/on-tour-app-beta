# 🚀 Quick Start: New Features Reference

## Multi-Selection (Ctrl/Cmd+Click)

### For Users

- **Click** event = Open event details
- **Ctrl/Cmd+Click** event = Toggle selection (adds selection ring)
- Selected events appear with cyan ring
- Use toolbar at bottom to move/delete selected events

### For Developers

```tsx
import { useEventSelection } from '@/hooks/useEventSelection';

const {
  selectedEventIds, // Set<string>
  toggleSelection, // (id, multiSelect) => void
  getSelectedCount, // () => number
  getSelectedIds, // () => string[]
  clearSelection, // () => void
} = useEventSelection();

// In EventChip
<EventChip
  isSelected={selectedEventIds.has(eventId)}
  onMultiSelect={isSelected => toggleSelection(eventId, true)}
/>;
```

---

## Event Linking (Dependency Management)

### For Users

- Right-click event → "Link Event" → Select dependency type
- Types: Before (with gap), After, Same Day
- See visual lines connecting linked events

### For Developers

```tsx
import { useEventLinks } from '@/hooks/useEventLinks';

const {
  links, // EventLink[]
  addLink, // (link) => void
  removeLink, // (fromId, toId) => void
  getLinkForEvent, // (eventId) => EventLink[]
  getConflicts, // (events) => Array<{link, issue}>
} = useEventLinks();

// Check for conflicts
const conflicts = getConflicts(allEvents);
conflicts.forEach(({ link, issue }) => {
  console.warn(`${link.fromId} → ${link.toId}: ${issue}`);
});
```

---

## Custom Fields Per Event Type

### For Users

- Calendar settings → "Custom Fields"
- Select event type (Flight, Hotel, etc.)
- Add/edit/delete fields with types: Text, Number, Date, Select, Checkbox

### For Developers

```tsx
import { useCustomFields } from '@/hooks/useCustomFields';

const {
  getConfiguration, // (typeId) => CustomEventTypeConfig | undefined
  validateEventData, // (typeId, data) => {valid, errors}
  saveConfiguration, // (config) => void
  getAllConfigurations, // () => CustomEventTypeConfig[]
} = useCustomFields();

// Define flight type with custom fields
const config = {
  typeId: 'flight',
  typeName: 'Flight',
  fields: [
    {
      id: 'field-1',
      name: 'Flight Number',
      type: 'text',
      required: true,
    },
    {
      id: 'field-2',
      name: 'Airline',
      type: 'select',
      options: ['United', 'Lufthansa', 'Iberia'],
      required: true,
    },
  ],
};

saveConfiguration(config);

// Validate event data
const { valid, errors } = validateEventData('flight', {
  'field-1': 'AA123',
  'field-2': 'United',
});
```

---

## Event Resizer Refinement

### Visual Feedback

- Resize handles appear on hover
- Turn cyan during drag
- Feedback toast shows target date + delta

### For Developers

```tsx
import EventResizeHandle from '@/components/calendar/EventResizeHandle';

<EventResizeHandle
  id={eventId}
  direction="start" // 'start' or 'end'
  onDragStart={e => {
    e.dataTransfer!.setData('text/plain', `resize:${eventId}:start`);
  }}
  isActive={isSelected}
  title="Drag to adjust start date"
  aria="Resize start date"
/>;
```

---

## Bulk Operations Toolbar

### Auto-Appears When

- 1 or more events selected
- Floating toolbar at bottom of screen

### Features

- **← Back** - Move 1 day backward
- **Forward →** - Move 1 day forward
- **🗑️ Delete** - Delete selected (confirmation required)
- **Clear selection** - Deselect all

### For Developers

```tsx
<BulkOperationsToolbar
  selectedCount={count}
  onBulkDelete={() => {
    /* delete selected */
  }}
  onBulkMove={(direction, days) => {
    /* move selected */
  }}
  onClearSelection={() => {
    /* clear */
  }}
/>
```

---

## Component Architecture

### New Components

```
src/components/calendar/
├── EventResizeHandle.tsx        # Refined drag handles
├── ResizeFeedback.tsx           # Drag feedback toast
├── BulkOperationsToolbar.tsx    # Multi-select actions
├── EventLinkingModal.tsx        # Link definition UI
├── EventConnectionLines.tsx     # Link visualization
└── CustomFieldsModal.tsx        # Field configuration

src/hooks/
├── useEventSelection.ts         # Multi-select logic
├── useEventLinks.ts             # Link management
└── useCustomFields.ts           # Field management
```

### Integration Points

```
Calendar.tsx
├── useEventSelection()
├── useEventLinks()
├── useCustomFields()
├── BulkOperationsToolbar
└── MonthGrid
    ├── selectedEventIds prop
    ├── onMultiSelectEvent callback
    └── EventChip
        ├── isSelected prop
        └── onMultiSelect callback
```

---

## Storage (localStorage)

### Keys Used

```
calendar:event-links         # Event dependency links
calendar:custom-fields       # Custom field configurations
calendar:event-selections    # (Session-only, not persisted)
```

### Format

```json
// calendar:event-links
[
  {
    "fromId": "event-1",
    "toId": "event-2",
    "type": "before",
    "gap": 1
  }
]

// calendar:custom-fields
[
  {
    "typeId": "flight",
    "typeName": "Flight",
    "fields": [
      {
        "id": "field-1",
        "name": "Flight Number",
        "type": "text",
        "required": true
      }
    ]
  }
]
```

---

## Telemetry Events

### Tracked Events

```
calendar.bulk.delete           // {count}
calendar.bulk.move             // {count, direction, days}
calendar.link.add              // {from, to, type}
calendar.link.remove           // {from, to}
calendar.custom-fields.save    // {typeId, fieldCount}
calendar.custom-fields.delete  // {typeId}
```

---

## Common Tasks

### Enable Selection for Custom Event Type

```tsx
// In EventChip render
<EventChip
  isSelected={selectedEventIds.has(ev.id)}
  onMultiSelect={selected => toggleSelection(ev.id, true)}
/>
```

### Add Link Validation to Event Creation

```tsx
const { getConflicts } = useEventLinks();

const conflicts = getConflicts([newEvent, ...existingEvents]);
if (conflicts.length > 0) {
  showWarning(`Link conflicts detected`);
}
```

### Display Custom Fields in Event Modal

```tsx
const { getConfiguration } = useCustomFields();
const config = getConfiguration(event.typeId);

{
  config?.fields.map(field => (
    <input key={field.id} placeholder={field.placeholder} required={field.required} />
  ));
}
```

---

## Debugging Tips

### Check Multi-Selection State

```tsx
console.log('Selected:', selectedEventIds);
console.log('Count:', getSelectedCount());
```

### Verify Event Links

```tsx
const links = useEventLinks();
console.log('All links:', links.links);
console.log('Conflicts:', links.getConflicts(allEvents));
```

### Validate Custom Field Config

```tsx
const { getConfiguration, validateEventData } = useCustomFields();
const config = getConfiguration('flight');
console.log('Config:', config);
const validation = validateEventData('flight', data);
console.log('Valid:', validation.valid, 'Errors:', validation.errors);
```

---

## Quick Reference: All New Hooks

```typescript
// Multi-selection
useEventSelection(): {
  selectedEventIds: Set<string>
  toggleSelection(id, multiSelect): void
  getSelectedCount(): number
  getSelectedIds(): string[]
  clearSelection(): void
}

// Event linking
useEventLinks(): {
  links: EventLink[]
  addLink(link): void
  removeLink(fromId, toId): void
  getLinkForEvent(eventId): EventLink[]
  getConflicts(events): Array<{link, issue}>
}

// Custom fields
useCustomFields(): {
  configurations: Map<string, CustomEventTypeConfig>
  saveConfiguration(config): void
  getConfiguration(typeId): CustomEventTypeConfig | undefined
  validateEventData(typeId, data): {valid, errors}
  getAllConfigurations(): CustomEventTypeConfig[]
}
```

---

## Need Help?

See full documentation:

- `SESSION_COMPLETE_ALL_FEATURES.md` - Complete session summary
- Component files for detailed JSDoc comments
- Hook files for implementation details
