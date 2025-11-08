# 🎯 CALENDAR UI AUDIT & ENHANCEMENT PLAN

## 📊 CURRENT STATE ANALYSIS

### **Issues Identified**

#### 1. **Day Details Panel (Static)**

- **Current**: Simple glass div at bottom when day selected
- **Problem**: Not functional, not interactive, takes up space
- **Solution**: Replace with modal dialog

#### 2. **Event Creation/Management**

- **Current**: QuickAdd only supports Shows
- **Problem**: Cannot add other event types (Travel, Meeting, Notes, etc)
- **Solution**: Create comprehensive multi-event modal

#### 3. **Visual Inconsistency**

- **Current**: Calendar uses generic styles
- **Problem**: Doesn't match ShowEditor or Dashboard design patterns
- **Solution**: Apply consistent design system

#### 4. **Button & Control Layout**

- **Current**: Scattered, inconsistent sizing and spacing
- **Problem**: Looks unpolished compared to rest of app
- **Solution**: Standardize button groups, use glass styling consistently

#### 5. **Toolbar Functionality**

- **Current**: Basic month navigation and view switching
- **Problem**: Limited filtering and search capabilities
- **Solution**: Enhanced with context-aware features

---

## 🎨 DESIGN SYSTEM TO APPLY

From Dashboard & ShowEditor:

- **Glass Effect**: `glass rounded-2xl border border-white/20 shadow-xl backdrop-blur-md`
- **Buttons**: `px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-all`
- **Accent Color**: Gradient from accent-500 to accent-600
- **Input**: `bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent-500`
- **Spacing**: Responsive with `md:` breakpoints
- **Animations**: Framer Motion with scale/opacity/y

---

## 🔧 COMPONENTS TO CREATE/UPDATE

### 1. **EventCreationModal** (NEW)

**Purpose**: Multi-type event creation with full validation

**Types Supported**:

- Show (existing functionality)
- Travel (itinerary)
- Meeting (internal notes)
- Rehearsal (prep event)
- Break (time off)

**Features**:

- Toggle between event types
- Type-specific fields
- Real-time validation
- Schedule conflict detection
- Quick add vs detailed form

**File**: `src/components/calendar/EventCreationModal.tsx`

### 2. **DayDetailsModal** (NEW)

**Purpose**: Show day overview and quick actions

**Content**:

- Day name and date
- All events for that day
- Quick add buttons for each type
- Summary stats (shows count, travel, etc)
- Action buttons (edit, delete, export)

**File**: `src/components/calendar/DayDetailsModal.tsx`

### 3. **CalendarToolbar** (ENHANCE)

**Current**: Basic controls
**Improvements**:

- Better button grouping with visual hierarchy
- Enhanced filter UI
- Search integration
- Export/Import more prominent

### 4. **EventChip** (ENHANCE)

**Current**: Generic styling
**Improvements**:

- Type-specific colors and icons
- Better context menu
- Inline quick actions

### 5. **MonthGrid** (ENHANCE)

**Current**: Functional but basic
**Improvements**:

- Remove old day details panel
- Add click handler that opens DayDetailsModal
- Better visual feedback for selected day

---

## 📋 EVENT TYPES & PROPERTIES

### **Show**

```typescript
{
  id: string;
  type: 'show';
  date: string; // ISO date
  city: string;
  country: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  fee?: number;
  notes?: string;
}
```

### **Travel**

```typescript
{
  id: string;
  type: 'travel';
  dateFrom: string;
  dateTo: string;
  origin: string;
  destination: string;
  mode: 'flight' | 'train' | 'car' | 'bus';
  notes?: string;
}
```

### **Meeting**

```typescript
{
  id: string;
  type: 'meeting';
  date: string;
  time?: string;
  title: string;
  attendees?: string[];
  notes?: string;
}
```

### **Rehearsal**

```typescript
{
  id: string;
  type: 'rehearsal';
  date: string;
  time?: string;
  location?: string;
  duration?: number; // minutes
  notes?: string;
}
```

---

## 🎯 IMPLEMENTATION ROADMAP

### **Phase 1: Core Modal Structure**

1. Create EventCreationModal component
2. Create DayDetailsModal component
3. Update MonthGrid to use modals
4. Wire up event listeners

### **Phase 2: Styling & UX**

1. Apply design system to all components
2. Add animations and transitions
3. Responsive design for mobile
4. Accessibility enhancements

### **Phase 3: Enhanced Features**

1. Conflict detection
2. Search integration
3. Advanced filtering
4. Export functionality

---

## ✅ SUCCESS CRITERIA

- [ ] Clicking a day opens functional modal
- [ ] Can create multiple event types
- [ ] Modal follows design system
- [ ] Validation prevents invalid entries
- [ ] All existing shows functionality preserved
- [ ] Mobile responsive
- [ ] Accessibility passes checks
- [ ] 0 build errors
- [ ] Performance: smooth animations 60fps
