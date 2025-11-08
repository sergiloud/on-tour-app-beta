# 🎯 How to Use Drag & Drop Event Creation

## Quick Start

### For Users

1. **See the Event Buttons**
   - Look at the calendar toolbar
   - You'll see buttons like "Show", "Travel", and any custom buttons you created

2. **Drag a Button**
   - Click and hold any event button
   - Drag it to any date on the calendar
   - The date cell will highlight with a glow effect

3. **Fill the Event Details**
   - A modal will appear with fields for:
     - **City** (required)
     - **Country** (select from grid)
   - Click "More Details" for optional fields:
     - **Category** (type of event)
     - **Notes** (any additional info)

4. **Create the Event**
   - Click "Create Event" button
   - The event will appear on your calendar
   - A success notification will appear at the bottom

### Tips & Tricks

- **Customize Buttons:** Click the "+" button to create your own event types
- **Remove Buttons:** Hover over any button and click the "×" badge to remove it
- **Quick Entry:** Just enter city + country and click Create (category/notes are optional)
- **Mobile:** Works on mobile - the modal is responsive
- **Keyboard:**
  - `Enter` to submit forms
  - `Escape` to cancel
  - `Tab` to navigate fields

## For Developers

### Integration Points

The drag & drop system is fully self-contained. Here's what's needed:

#### 1. **CalendarToolbar** (Already Done)

```tsx
<DraggableEventButtons
  buttons={eventButtons}
  onAddButton={handleAddButton}
  onRemoveButton={handleRemoveButton}
/>
```

#### 2. **MonthGrid** (Already Done)

- Handles `onDrop` for button detection
- Opens `QuickEventCreator` modal
- Shows `EventCreationSuccess` toast
- Calls `onQuickAddSave` callback

#### 3. **Required Props on Calendar Component**

```tsx
onQuickAddSave?: (dateStr: string, data: {
  city: string;
  country: string;
  fee?: number
}) => void;
```

### Adding to Other Views

To add drag & drop to **WeekGrid** or **DayGrid**:

1. Import the components:

```tsx
import QuickEventCreator from './QuickEventCreator';
import EventCreationSuccess from './EventCreationSuccess';
```

2. Add state:

```tsx
const [quickCreatorOpen, setQuickCreatorOpen] = useState(false);
const [quickCreatorButton, setQuickCreatorButton] = useState<EventButton>();
const [quickCreatorDate, setQuickCreatorDate] = useState<string>();
```

3. Add to drop zones:

```tsx
onDragOver={(e) => {
  e.preventDefault();
  // Handle dragOver
}}
onDrop={(e) => {
  const buttonData = e.dataTransfer.getData('application/json');
  if (buttonData) {
    const button = JSON.parse(buttonData);
    setQuickCreatorButton(button);
    setQuickCreatorDate(dateStr);
    setQuickCreatorOpen(true);
  }
}}
```

4. Add the modal to render:

```tsx
<QuickEventCreator
  open={quickCreatorOpen}
  button={quickCreatorButton}
  date={quickCreatorDate}
  onClose={() => {
    /* ... clear state ... */
  }}
  onSave={data => {
    onQuickAddSave?.(quickCreatorDate, {
      city: data.city,
      country: data.country,
    });
    // Clear state and show toast
  }}
/>
```

## Component Reference

### DraggableEventButtons

**Location:** `src/components/calendar/DraggableEventButtons.tsx`

Props:

- `buttons: EventButton[]` - Array of event buttons
- `onAddButton?: (btn: EventButton) => void` - Called when user adds button
- `onRemoveButton?: (id: string) => void` - Called when user removes button

Export:

- `EventButton` interface with: id, label, category, color, type

### QuickEventCreator

**Location:** `src/components/calendar/QuickEventCreator.tsx`

Props:

- `open: boolean` - Show/hide modal
- `button?: EventButton` - The button being used
- `date?: string` - The target date (YYYY-MM-DD)
- `onClose: () => void` - Called when modal closes
- `onSave: (data: QuickEventData) => void` - Called when event created

Returns in onSave:

```tsx
{
  label: string;           // From button
  city: string;            // User input (required)
  country: string;         // User selected
  category?: string;       // Optional detail
  notes?: string;          // Optional detail
  color: EventButton['color'];
  type: 'show' | 'travel';
}
```

### EventCreationSuccess

**Location:** `src/components/calendar/EventCreationSuccess.tsx`

Props:

- `show: boolean` - Display toast
- `button?: EventButton` - Event button data
- `city?: string` - Event city
- `country?: string` - Event country
- `onDismiss: () => void` - Called when toast closes

### DragHintTooltip

**Location:** `src/components/calendar/DragHintTooltip.tsx`

Props:

- `visible?: boolean` - Show hint tooltip

Features:

- Auto-dismisses after 4 seconds
- Stores dismissals in localStorage (max 2 times shown)

## Customization

### Colors

Edit `colorClasses` in respective components:

```tsx
emerald: { bg: 'bg-emerald-500/20', ... }
amber: { bg: 'bg-amber-500/20', ... }
// etc...
```

### Animations

Modify `transition` props in motion components:

```tsx
transition={{
  duration: 0.3,
  type: 'spring',
  stiffness: 300,
  damping: 30
}}
```

### Countries List

Edit `countryList` in `QuickEventCreator.tsx`:

```tsx
const countryList = [
  'US',
  'ES',
  'UK',
  'DE',
  'FR',
  'IT',
  'JP',
  'BR',
  'CA',
  'AU',
  'MX',
  'CN',
  'AR',
  'IN',
  'RU',
  'SG',
  'NZ',
  'SE',
  'NO',
  'NL',
  'BE',
  'AT',
  'CH',
  'PL',
];
```

### Storage

Events stored in localStorage:

- Key: `calendar:eventButtons`
- Format: JSON stringified array of EventButton

## Troubleshooting

### Modal doesn't appear when dragging

- Check browser console for errors
- Ensure `onQuickAddSave` prop is provided
- Verify drag data is properly formatted

### Styles not showing

- Import Tailwind CSS (already done in project)
- Check glass/backdrop-blur classes are available
- Verify color classes are applied

### Animations are slow

- Check browser performance (DevTools)
- Verify Framer Motion is properly installed
- Reduce stiffness/damping values for faster animations

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari 14+, Chrome Mobile)

Note: Requires Drag & Drop API support (IE 11+ with polyfill)
