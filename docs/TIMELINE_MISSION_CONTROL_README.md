# Timeline Mission Control v2.0

## Overview

Timeline Mission Control is the operational brain for tour management in On Tour App. It provides a comprehensive Gantt-style horizontal timeline with advanced features for conflict detection, critical path analysis, what-if simulations, and AI-powered insights.

## Features Implemented

### ✅ Phase 1: Foundation & Visual Timeline (Completed)

#### 1. Timeline Canvas (Horizontal Gantt View)
- **Visual event blocks** with color-coded types:
  - 🟣 Shows (Purple/Pink gradient)
  - 🔵 Travel (Blue/Cyan gradient)
  - 🟢 Finance (Green/Emerald gradient)
  - 🟠 Tasks (Amber/Orange gradient)
  - ⚪ Contracts (Slate/Gray gradient)
- **Smart time scale** with automatic date markers
- **Interactive hover tooltips** showing:
  - Event details
  - Time ranges
  - Location
  - Financial metadata (fees, costs)
- **Event status indicators**:
  - Solid border: Confirmed events
  - Dashed border: Tentative/Offer events
  - Faded opacity: Canceled events
  - Pulsing dot: Critical importance
- **Zoom controls** (0.5x to 3x)
- **Responsive grid background**

#### 2. Conflict Radar Sidebar
- **Auto-detection** of timeline conflicts:
  - ⚠️ **CRITICAL**: Events <20 minutes apart
  - ⚠️ **HIGH**: Travel arrival too close to load-in
  - ⚠️ **MEDIUM**: Same-day shows in different locations
- **Color-coded severity** (red/amber/yellow/blue)
- **Collapsible sidebar** with smooth animations
- **Quick navigation** to conflicting events
- **Real-time conflict count**

#### 3. Timeline Statistics Dashboard
- **Event metrics**:
  - Total events count
  - Confirmation rate percentage
  - Pending events count
- **Financial overview**:
  - Projected revenue from shows
  - Travel expenses tracking
  - Net margin calculation
  - Margin percentage
- **Conflict summary**
- **Animated stat cards** with staggered entrance

#### 4. Demo Data System
- **15 realistic demo events** spanning 10 days:
  - Madrid → Valencia → Barcelona → Bilbao → Paris tour
  - Mix of shows, travel, soundchecks, contracts, finance
  - Realistic timing and dependencies
- **14 dependency relationships** creating a complex timeline
- **Multiple conflict scenarios** for testing

#### 5. View Modes
- **Horizontal Gantt**: Primary timeline view with time axis
- **Vertical List**: Compact card-based view
- **Smooth transitions** between modes

#### 6. Simulation Mode
- **Toggle live/simulation** modes
- **Amber warning banner** when active
- **P&L projection bar** with metrics:
  - Projected revenue
  - Projected expenses
  - Net margin with percentage
- **Save as version** (stub for v2.1)
- **Apply changes** (stub for v2.1)

### 🚧 Phase 2: Intelligence & Interactions (In Progress)

#### 7. Dependency Visualization
- **SVG dependency lines** component created
- **Curved paths** between connected events
- **Arrow markers** for relationship types:
  - Solid arrows: Normal dependencies
  - Dashed lines: EnabledBy relationships
  - Red arrows: Critical path (when enabled)
- **Smooth animations** on line rendering

#### 8. Version Control System
- **Version selector** in sidebar
- **Version cards** with metadata:
  - Version name
  - Creation date
  - Description
- **Active version** highlighting
- **Diff visualization** (planned for v2.1)

### 📋 Phase 3: Advanced Features (Planned)

#### 9. Critical Path Detection
- **CPM algorithm** implemented in service:
  - Forward pass for earliest start times
  - Backward pass for latest start times
  - Slack calculation for each event
  - Critical path identification (<1 min slack)
- **Visual highlighting** (integration pending)
- **Critical events** prioritization

#### 10. What-if Simulations
- **Scenario cloning** (planned)
- **Drag & drop** event rescheduling (planned)
- **Real-time conflict updates** (planned)
- **P&L recalculation** on changes (planned)

#### 11. Quick Actions System
- **Keyboard shortcuts** (planned)
- **Context menus** on events (planned)
- **Bulk operations** (planned)
- **Deep linking** to events (planned)

#### 12. AI Copilot Integration
- **Floating AI button** (placeholder)
- **Smart suggestions** (future LLM integration)
- **Conflict resolution** recommendations (planned)
- **Optimization** proposals (planned)

## Technical Architecture

### Components

```
src/
├── pages/dashboard/
│   └── TimelineMissionControl.tsx      # Main page controller
├── components/timeline/
│   ├── TimelineCanvas.tsx               # Visual timeline renderer
│   ├── TimelineStats.tsx                # Statistics dashboard
│   └── DependencyLines.tsx              # SVG dependency visualization
└── services/
    └── timelineMissionControlService.ts # Data layer & algorithms
```

### Data Models

#### TimelineEvent
```typescript
{
  id: string;
  orgId: string;
  type: 'show' | 'travel' | 'finance' | 'task' | 'contract';
  title: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  status: 'confirmed' | 'tentative' | 'canceled' | 'done' | 'offer';
  module: 'shows' | 'finance' | 'contracts' | 'travel' | 'collaboration';
  importance: 'critical' | 'high' | 'medium' | 'low';
  metadata?: Record<string, any>;
}
```

#### TimelineDependency
```typescript
{
  id: string;
  fromEventId: string;
  toEventId: string;
  type: 'before' | 'after' | 'blocks' | 'enabledBy';
  minGapMinutes?: number;
}
```

#### TimelineConflict
```typescript
{
  id: string;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  detail: string;
  eventIds: string[];
  type: 'timing' | 'resource' | 'financial' | 'logistics';
  autoDetected: boolean;
}
```

### Algorithms

#### Conflict Detection
1. **Timing conflicts**: Events with <20 min gap → CRITICAL
2. **Travel logistics**: Arrival <60 min before load-in → HIGH
3. **Dependency violations**: Gap < required minimum → CRITICAL
4. **Double bookings**: Multiple shows same day, different cities → HIGH

#### Critical Path (CPM)
1. **Forward pass**: Calculate earliest start for each event
2. **Backward pass**: Calculate latest start from end events
3. **Slack calculation**: `latest - earliest` in minutes
4. **Critical path**: Events with <1 minute slack

## Design System Integration

### Colors
- **Glass morphism**: `glass` utility class with backdrop blur
- **Borders**: `border-white/10` for subtle separation
- **Gradients**: Event type-specific color schemes
- **Accent**: `accent-500` for interactive elements

### Typography
- **Headers**: `text-3xl font-bold text-white`
- **Body**: `text-white/60` for secondary text
- **Labels**: `text-[10px] uppercase tracking-wider text-white/40`

### Animations
- **Framer Motion** for smooth transitions
- **Staggered entrances** for lists (0.05s delay)
- **Hover effects**: `scale(1.02)` and `y: -2`
- **AnimatePresence** for mount/unmount transitions

## Usage

### Navigation
Access via sidebar: `Dashboard > Mission Control`

### View Controls
- **Horizontal/Vertical**: Toggle view mode
- **Zoom In/Out**: Adjust timeline scale (0.5x - 3x)
- **Show/Hide Radar**: Toggle conflict sidebar
- **Start Simulation**: Enter what-if mode

### Interactions
- **Hover events**: See detailed tooltips
- **Click events**: Open event details (logged to console)
- **Click conflicts**: Navigate to problematic events
- **Select version**: Switch between timeline versions

## Future Enhancements

### v2.1 (Q1 2026)
- [ ] Firestore integration for real event data
- [ ] Drag & drop event rescheduling
- [ ] Version diff visualization
- [ ] Quick actions popover
- [ ] Keyboard shortcuts (`cmd+k` for search)
- [ ] Event detail modal
- [ ] Bulk event operations

### v2.2 (Q2 2026)
- [ ] AI Copilot LLM integration
- [ ] Smart conflict resolution
- [ ] Resource allocation tracking
- [ ] Weather integration for travel
- [ ] Budget constraints checking
- [ ] Multi-artist timelines

### v3.0 (Q3 2026)
- [ ] Real-time collaboration
- [ ] Timeline templates
- [ ] Export to various formats (PDF, iCal, Roadie app)
- [ ] Mobile-optimized timeline view
- [ ] Advanced analytics dashboard

## Performance

- **Lazy loading**: Route code-split with React.lazy
- **Memoization**: useMemo for expensive calculations
- **Virtual scrolling**: Planned for 100+ events
- **Optimistic updates**: Immediate UI feedback

## Accessibility

- **Keyboard navigation**: Full keyboard support planned
- **ARIA labels**: Semantic HTML with proper roles
- **Color contrast**: WCAG AA compliant
- **Screen reader**: Descriptive labels for all interactive elements

## Testing Strategy

### Unit Tests (Planned)
- Conflict detection logic
- Critical path algorithm
- Date calculations
- Event filtering

### Integration Tests (Planned)
- Timeline rendering with various datasets
- Conflict radar updates
- Version switching
- Simulation mode

### E2E Tests (Planned)
- Complete user workflows
- Multi-event operations
- Error handling

## Documentation

- **User Guide**: See `docs/USER_GUIDE.md`
- **API Reference**: See `docs/API_REFERENCE.md`
- **Architecture**: See `docs/TIMELINE_MAESTRO_V3_PLAN.md`

---

**Status**: 🚧 Active Development  
**Version**: 2.0.0-beta  
**Last Updated**: November 18, 2025  
**Maintainer**: On Tour App Team
