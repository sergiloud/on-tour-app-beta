# Timeline de la Organización - Implementation Guide

## Overview

The **Timeline de la Organización** is an intelligent activity center that consolidates all organization events into a unified, filterable, real-time feed. This is NOT a simple chronological list - it's a comprehensive activity intelligence system.

## Features

### ✅ Implemented (v1.0)

#### 1. Unified Event System
- **TimelineService** (`src/services/timelineService.ts`)
  - Consolidates events from: Shows, Finance, Contracts, Travel, Collaboration, Audit
  - Type-safe TypeScript interfaces for all event types
  - Real-time Firestore subscription with automatic updates
  - Demo data generator for development/testing

#### 2. Smart Event Grouping
Reduces timeline noise by intelligently combining similar consecutive events:
- Example: "3 expenses added" instead of 3 separate expense items
- Configurable grouping window (currently 1 hour)
- Groupable event types: `expense_added`, `transaction_added`, `comment_added`, `show_updated`
- Preserves individual event details in group metadata

#### 3. Advanced Filtering System
Multi-dimensional filtering for precise event discovery:
- **Module filter**: Shows, Finance, Contracts, Travel, Collaboration, Audit, All
- **Importance filter**: Critical, High, Medium, Low, All
- **Date range filter**: Last 7/30/90 days, All time
- **Search filter**: Real-time text search across titles, descriptions, user names
- **User filter**: Filter by specific user (prepared for future implementation)
- **Show context filter**: Filter events related to specific show (prepared for future)

#### 4. High-Performance UI
- **Virtualization** with `@tanstack/react-virtual`
  - Renders only visible items (50 items per page)
  - Smooth scrolling with 600px viewport height
  - Estimated row height: 120px with 5-item overscan
- **Professional design** following app design system
  - Color-coded module icons (Emerald, Green, Blue, Purple, Amber, Gray)
  - Importance badges with visual hierarchy
  - Clean Card-based layout with hover effects
  - NO EMOJIS (as per design requirements)

#### 5. Real-time Updates
- Firestore `onSnapshot` for live event streaming
- Automatic UI refresh when new events arrive
- Optimistic updates supported by service architecture
- Demo mode fallback when Firestore unavailable

#### 6. Internationalization
Complete translations in English and Spanish:
- `timeline.title`, `timeline.description`
- `timeline.filters.*` (module, importance, dateRange, search)
- `timeline.empty`, `timeline.items`
- `nav.timeline` (sidebar navigation)

#### 7. Navigation & Routing
- Lazy-loaded route: `/dashboard/timeline`
- Sidebar navigation entry (after Activity)
- Prefetch configuration for optimal loading
- Skeleton fallback during lazy load

## Architecture

### Component Structure

```
TimelinePage (src/pages/dashboard/TimelinePage.tsx)
├── Header (title + description)
├── Filters Card
│   ├── Module dropdown
│   ├── Importance dropdown
│   ├── Date range dropdown
│   └── Search input
└── Timeline Events Card
    └── Virtualized list
        └── TimelineEvent items
            ├── Module icon
            ├── Event details
            │   ├── Title (with group count if grouped)
            │   ├── Description
            │   └── Metadata (user, timestamp, module)
            └── Importance badge
```

### Data Flow

```
TimelineService
├── subscribeToTimeline()
│   ├── Firestore query with filters
│   ├── Real-time onSnapshot listener
│   ├── applySmartGrouping()
│   └── callback(grouped events)
└── generateDemoEvents() (dev mode)

TimelinePage
├── useEffect: subscribe to events
├── useMemo: apply search filter
├── useVirtualizer: virtualize rendering
└── render filtered events
```

### Event Type System

```typescript
type TimelineEventType =
  // Shows module
  | 'show_added' | 'show_updated' | 'show_confirmed' | 'show_cancelled' | 'show_deleted'
  // Finance module
  | 'transaction_added' | 'expense_added' | 'payment_received' | 'payment_sent' | 'finance_updated'
  // Contracts module
  | 'contract_signed' | 'contract_pending' | 'contract_expired' | 'contract_updated'
  // Travel module
  | 'travel_booked' | 'travel_updated' | 'travel_cancelled' | 'accommodation_booked'
  // Collaboration module
  | 'member_invited' | 'member_removed' | 'comment_added' | 'task_assigned' | 'task_completed'
  // Audit logs
  | 'settings_changed' | 'permission_updated' | 'alert_triggered';
```

## Usage

### Accessing the Timeline

1. **Sidebar Navigation**: Click "Timeline" / "Línea de Tiempo" in the dashboard sidebar
2. **Direct URL**: Navigate to `/dashboard/timeline`
3. **Prefetch**: Hover over Timeline link to warm the route chunk

### Filtering Events

**Module Filter**:
- Select specific module (Shows, Finance, etc.) or "All modules"
- Updates Firestore query for server-side filtering

**Importance Filter**:
- Filter by priority: Critical, High, Medium, Low, or All
- Useful for focusing on high-priority events

**Date Range Filter**:
- Last 7 days: Recent activity
- Last 30 days: Current month context
- Last 90 days: Quarterly overview
- All time: Complete history

**Search**:
- Real-time text filter across event titles, descriptions, usernames
- Client-side filtering (applied after Firestore query)

### Smart Grouping

The Timeline automatically groups similar consecutive events to reduce noise:

**Example**:
```
❌ Without grouping:
  - "Expense added - Hotel accommodation - €450"
  - "Expense added - Flight tickets - €320"
  - "Expense added - Ground transportation - €85"

✅ With grouping:
  - "3 expenses added (3 items)"
    Description: "3 expense_added by Demo User"
```

**Grouping Rules**:
- Events must be same type (e.g., all `expense_added`)
- Events must be from same user
- Events must be within same hour window
- Group key: `${type}:${userId}:${YYYY-MM-DDTHH}`

## Future Enhancements

### 🔄 Pending for Production

#### 1. Backend Timeline Endpoint
**Status**: Not started (using Firestore directly)

**Requirements**:
- Node.js/PostgreSQL unified events query
- Consolidate data from multiple DB tables
- Support pagination (offset/limit or cursor-based)
- Apply server-side filters before returning
- Return format: `{ events: TimelineEvent[], nextCursor: string }`

**Suggested Implementation**:
```typescript
// backend/src/routes/timeline.ts
router.get('/api/timeline', async (req, res) => {
  const { orgId, module, importance, dateRange, cursor } = req.query;
  
  // Query shows, finance, contracts, travel, etc.
  const showEvents = await db.query(/* shows events */);
  const financeEvents = await db.query(/* finance events */);
  // ... merge and sort by timestamp
  
  res.json({ events: mergedEvents, nextCursor });
});
```

#### 2. Socket.io Real-time Updates
**Status**: Not started (using Firestore onSnapshot)

**Requirements**:
- Emit new timeline events via Socket.io
- Client subscribes to `timeline:${orgId}` room
- Optimistic UI updates before server confirmation
- Handle reconnection logic gracefully

**Suggested Implementation**:
```typescript
// Client-side
socket.on(`timeline:${orgId}`, (newEvent: TimelineEvent) => {
  setEvents(prev => [newEvent, ...prev]);
});

// Server-side
io.to(`timeline:${orgId}`).emit('timeline:new', newEvent);
```

#### 3. Interactive Actions
**Status**: Prepared in event metadata, not implemented in UI

**Requirements**:
- Click timeline event to navigate to related entity
  - Show event → `/dashboard/shows/:id`
  - Finance event → `/dashboard/finance` with filter
  - Contract event → `/dashboard/contracts/:id`
- Context menu with quick actions:
  - "View details"
  - "Edit"
  - "Delete" (if permitted)
- Keyboard navigation (arrow keys, Enter)

#### 4. Advanced Features
- **Export timeline**: PDF/CSV export with filters applied
- **Email digests**: Daily/weekly timeline summaries
- **Notifications**: Browser notifications for critical events
- **Custom views**: Save filter presets (e.g., "My Finance Events")
- **Event details modal**: Expanded view with full metadata
- **Batch operations**: Mark multiple events as read/archived

## Development

### Running in Dev Mode

The Timeline uses demo data in development when Firestore is unavailable:

```typescript
if (import.meta.env.DEV) {
  const demoEvents = TimelineService.generateDemoEvents(orgId, userId, shows);
  setEvents(demoEvents);
  return () => {};
}
```

Demo data includes:
- Show events (added, confirmed, cancelled)
- Finance events (expenses, payments)
- Contract events (signed, pending)
- Travel events (booked, updated)
- Collaboration events (member invited, comments)
- Audit events (settings changed)

### Testing

**Filter Testing**:
1. Select different modules → verify events filtered correctly
2. Change importance → verify critical/high/medium/low filtering
3. Adjust date range → verify only events within range shown
4. Type in search → verify real-time filtering

**Virtualization Testing**:
1. Generate large dataset (100+ events)
2. Scroll rapidly → verify smooth rendering
3. Check DevTools → verify only ~10-15 DOM nodes rendered
4. Monitor performance → no lag with 1000+ events

**Grouping Testing**:
1. Create 3+ events of same type within 1 hour
2. Verify they appear as single grouped event
3. Check group count displays correctly
4. Verify individual events preserved in metadata

## File Structure

```
src/
├── services/
│   └── timelineService.ts          # Timeline data service
├── pages/
│   └── dashboard/
│       └── TimelinePage.tsx         # Main Timeline UI component
├── routes/
│   ├── AppRouter.tsx                # Timeline route registration
│   └── prefetch.ts                  # Timeline prefetch config
├── layouts/
│   └── DashboardLayout.tsx          # Sidebar navigation link
└── lib/
    └── i18n.ts                      # Timeline translations (EN/ES)
```

## Design Tokens

### Module Colors
- **Shows**: `text-emerald-400` (Accent)
- **Finance**: `text-green-400` (Success)
- **Contracts**: `text-blue-400` (Info)
- **Travel**: `text-purple-400` (Metrics)
- **Collaboration**: `text-amber-400` (Warning)
- **Audit**: `text-gray-400` (Neutral)

### Importance Colors
- **Critical**: `text-red-400` (Danger)
- **High**: `text-amber-400` (Warning)
- **Medium**: `text-blue-400` (Info)
- **Low**: `text-green-400` (Success)

### Typography
- **Page title**: `text-3xl font-bold text-white`
- **Event title**: `text-white font-medium`
- **Event description**: `text-sm text-gray-400`
- **Metadata**: `text-xs text-gray-500`

## Best Practices

1. **NO EMOJIS**: Follow app design system - use Lucide icons only
2. **Type Safety**: Always use TypeScript interfaces for events
3. **Performance**: Virtualize lists with 50+ items
4. **Accessibility**: Include ARIA labels for screen readers
5. **Error Handling**: Gracefully handle Firestore failures with demo data
6. **Consistent Naming**: Follow existing patterns (e.g., `TimelineService` not `Timeline`)
7. **Code Organization**: Keep service logic separate from UI components
8. **Testing**: Test all filter combinations before deployment

## Migration Notes

### From ActivityFeed to Timeline

The Timeline is a **superset** of ActivityFeed capabilities:

| Feature | ActivityFeed | Timeline |
|---------|--------------|----------|
| Event sources | Single (activities) | Multiple (shows, finance, etc.) |
| Filtering | Type only | Module, importance, date, search |
| Grouping | None | Smart grouping by similarity |
| Virtualization | No | Yes (@tanstack/react-virtual) |
| Real-time | Firestore | Firestore (+ Socket.io ready) |

**Migration Path**:
1. Keep ActivityFeed for backward compatibility
2. Use Timeline for new comprehensive views
3. Consider deprecating ActivityFeed in future release

## Summary

The Timeline de la Organización provides a powerful, intelligent view into all organization activity. With smart grouping, advanced filtering, real-time updates, and high-performance virtualization, it's the central hub for understanding what's happening across shows, finance, contracts, travel, and team collaboration.

**Current Status**: ✅ Frontend complete, ready for backend integration
**Next Steps**: Backend endpoint + Socket.io real-time + Interactive actions
