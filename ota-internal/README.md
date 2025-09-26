# OTA Tour Management Platform

A modern tour management platform for artists, DJs, managers, and booking agents built with TypeScript, Vite, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier a### Recent Enhancements (### Roadmap Adjusted
+| Feature | Status | Notes |
+|---------|--------|-------|
+| Multi-scenario heuristic forecasts | ✅ | Baseline/Optimistic/Pessimistic generated from historical net |
+| Scenario selection API | ✅ | Added setScenario + listScenarios to FinanceCore |
+| Profitability timeline | ✅ | Margin% line chart added |
+| Skeleton states | ✅ | Shimmer placeholders unify loading UX |
+| Real-time diff sync | ✅ | Mock service with periodic snapshot diffs |
+| Feature-based architecture | ✅ | Finance and Dashboard migrated to features/ |
+| ML anomaly engine | ⏳ | Placeholder heuristic only |
+| Forecast confidence bands | ⚠️ | Basic ±12% band on cashflow trend; refine per scenario |
+| Scenario comparison overlays | ⏳ | Future side-by-side or spread visualization |
+| Shows feature migration | ✅ | Next: travel logistics to features/travel/ |
+| Travel feature migration | ✅ | Next: establish feature boundary rules |
+| Removal of deprecated finance modules | ⏳ | After feature parity & adoption metrics |Multi-scenario forecasting engine (`forecasting-engine.ts`) generating Baseline, Optimistic, Pessimistic paths (heuristic growth + deterministic variance).
+- Extended snapshot with `selectedScenarioId` and scenario metadata (confidence, assumptions).
+- New selectors: `selectActiveScenario`, `selectAnomalySummary`, `selectProfitabilityTimeline`.
+- Profitability Timeline chart (`ProfitabilityTimeline.tsx`) showing % margin progression.
+- Skeleton loading components (`Skeletons.tsx`) for charts, KPIs, and tables + shimmer tokens.
+- Expanded design tokens: forecast colors, severity badges, skeleton surfaces, info/warning semantic colors.
+- Test suite expanded to validate multi-scenario forecasts, anomaly summary, profitability timeline integrity.
+- **Dashboard Feature Migration**: Moved all dashboard-related files to `features/dashboard/` with proper vertical slicing (components, core, ui, styles, tests).
+- Feature-based architecture established with shared utilities in `shared/` directory.)

### Environment Setup

1. Copy environment variables:
```bash
cp .env.example .env.local
```

2. Create a Supabase project and add your credentials:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Run the database schema:
```sql
-- Copy and run the contents of database/schema.sql in your Supabase SQL editor
```

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: TypeScript + Vite + Web Components
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Offline**: IndexedDB (Dexie) + Service Worker
- **Deployment**: Vercel (Static + Serverless Functions)

### Key Features
- ✅ **Offline-First**: Works without internet connection
- ✅ **Multi-Tenant**: Organization-based data isolation
- ✅ **Real-time**: Live updates across devices
- ✅ **Mobile-First**: Optimized for backstage/venue use
- ✅ **PWA**: Installable, push notifications
- ✅ **Accessible**: ARIA compliant, keyboard navigation

### Core Entities
- **Organizations**: Artists, Agencies, Labels, Venues
- **Shows**: Gigs with financial, logistical, and technical details
- **Travel**: Flights, hotels, transfers linked to shows  
- **Expenses**: Tour costs categorized and trackable
- **Users**: Multi-role (artist/manager/crew/booking agent)

## 📱 Usage

### For Artists/DJs
- Overview of upcoming shows and finances
- Quick access to travel itineraries
- Expense tracking on the go

### For Tour Managers  
- Complete tour logistics management
- Crew coordination and scheduling
- Real-time updates to team

### For Booking Agents
- Show pipeline and negotiations
- Multi-artist client management
- Commission tracking

### For Management
- Financial oversight across artists
- Performance analytics
- Contract and split management

## 🔧 Development

### Project Structure (Feature-Based)
```
src/
├── features/           # Feature-specific code (vertical slices)
│   ├── finance/        # Finance module (unified)
│   │   ├── components/ # UI components (charts, tables)
│   │   ├── core/       # Business logic (providers, selectors, forecasting)
│   │   ├── ui/         # Feature-specific UI logic
│   │   ├── styles/     # Feature styles
│   │   ├── tests/      # Feature tests
│   │   └── index.ts    # Barrel export
│   ├── dashboard/      # Dashboard feature (migrated ✅)
│   │   ├── components/ # Dashboard components (action-center, month-shows, etc.)
│   │   ├── core/       # Core logic (dashboard, events, metrics, registry)
│   │   └── index.ts    # Barrel export
│   ├── shows/          # Shows management (migrated ✅)
│   │   ├── core/       # Core logic (shows, show-finance)
│   │   ├── components/ # Show components (show-editor)
│   │   └── index.ts    # Barrel export
│   ├── travel/         # Travel logistics (migrated ✅)
│   └── ...
├── shared/             # Cross-cutting concerns
│   ├── ui/             # Shared UI components (buttons, layout)
│   ├── lib/            # Shared services (currency, supabase, offline)
│   ├── styles/         # Global styles (tokens, reset)
│   └── utils/          # Shared utilities
├── app/                # App shell, routing, layout
├── data/               # Demo data, types
├── assets/             # Static assets
└── components/         # Legacy components (migrate to features)
```
```
src/
├── features/           # Feature-specific code (vertical slices)
│   ├── finance/        # Finance module (unified)
│   │   ├── components/ # UI components (charts, tables)
│   │   ├── core/       # Business logic (providers, selectors, forecasting)
│   │   ├── ui/         # Feature-specific UI logic
│   │   ├── styles/     # Feature styles
│   │   ├── tests/      # Feature tests
│   │   └── index.ts    # Barrel export
│   ├── dashboard/      # Dashboard feature (migrated ✅)
│   │   ├── components/ # Dashboard components (action-center, month-shows, etc.)
│   │   ├── core/       # Core logic (dashboard, events, metrics, registry)
│   │   └── index.ts    # Barrel export
│   ├── shows/          # Shows management (pending migration)
│   └── travel/         # Travel logistics (pending migration)
├── shared/             # Cross-cutting concerns
│   ├── ui/             # Shared UI components (buttons, layout)
│   ├── lib/            # Shared services (currency, supabase, offline)
│   ├── styles/         # Global styles (tokens, reset)
│   └── utils/          # Shared utilities
├── app/                # App shell, routing, layout
├── data/               # Demo data, types
├── assets/             # Static assets
└── components/         # Legacy components (migrate to features)
```

### Database Schema
Multi-tenant PostgreSQL with Row Level Security:
- Organizations (artists, agencies, venues)
- Shows with financials and logistics
- Travel segments and expenses
- User profiles with role-based permissions

### Offline Strategy
1. **Write-first**: All changes saved locally first
2. **Background sync**: Automatic sync when online
3. **Conflict resolution**: Server-wins with user notification
4. **Queue management**: Failed operations retried with exponential backoff

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables
```env
# Supabase
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Analytics & Monitoring  
VITE_MIXPANEL_TOKEN=your-token
VITE_SENTRY_DSN=your-dsn
```

### Manual Deployment
```bash
npm run build
npm run deploy  # Uses Vercel CLI
```

## 🔐 Security

- **Authentication**: Supabase Auth with magic links + OAuth
- **Authorization**: Row Level Security policies
- **Data Isolation**: Organization-scoped access
- **API Security**: JWT validation on all endpoints

## 📊 Performance

- **Bundle Size**: < 500KB initial load
- **First Paint**: < 2s on 3G
- **Offline**: Full functionality without network
- **Mobile**: Optimized for iOS Safari and Chrome

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

Private - All rights reserved

## Design & UI Guide
See `UI-GUIDE.md` for tokens, components, accessibility, and view patterns.

---

Built with ❤️ for the music industry

## 💰 Finance Module (Unified Architecture)

### Summary
The finance subsystem has been unified under a single source of truth: `FinanceCore`.
Legacy imperative modules (`modules/finance.ts`, `finance/finance-ui.ts`, `components/finance-charts.ts`) are deprecated and retained only for backward compatibility during migration.

### Core Files
- `src/finance/finance-core.tsx` – React context provider exposing a `FinanceSnapshot` (KPIs, shows, expenses, forecasts, anomalies).
- `src/finance/snapshot-builder.ts` – Pure snapshot construction logic (testable, no React).
- `src/finance/finance-selectors.ts` – Memoized pure selectors (category totals, monthly series, KPI trend, invariants).
- `src/finance/ExecutiveSummary.tsx` – Executive KPI card with sparkline + delta + status.
- `src/finance/TransactionsTable.tsx` – Virtualized transaction list (windowed rendering).
- `src/components/finance-charts-professional.js` – Recharts-based visualizations (lazy-loaded).

### Data Shape (FinanceSnapshot)
```
{
	kpis: { income, expenses, net, payable, marginPct, previousNet },
	shows: [{ id, date, income, expenses, net, marginPct, ... }],
	expenses: [{ id, type: 'income'|'expense', category, amount, date }],
	forecasts: [{ id, label, series: [{ month, value }] }],
	anomalies: [{ id, type, amount, date, note }]
}
```

### Invariants & Tests
- Invariant script: `npm run finance:check` (validates net consistency & category totals).
- Tests: `vitest` (`finance-core.test.ts`) verify snapshot integrity and selector ordering.

### Migration Status
| Area | Status |
|------|--------|
| Single data source | ✅ FinanceCore snapshot |
| Unified charts | ✅ Recharts professional set (lazy) |
| KPIs + executive summary | ✅ Implemented |
| Virtualized transactions | ✅ Implemented (basic) |
| Anomalies | ✅ Basic spike rule (placeholder) |
| Forecasting | ✅ Baseline stub |
| Legacy DOM finance UI | ⚠️ Deprecated (remove later) |
| Advanced ML & forecasting engine | ⏳ Pending integration |
| PDF reports & mobile dashboard hooks | ⏳ Legacy orchestrator only |
| WebSocket realtime sync | ⏳ Not started |
| Performance (memo selectors, code-split charts) | ✅ Initial phase |
| Full test coverage | ⏳ Expand beyond core snapshot |

### Next Steps
1. Replace anomaly placeholder with ML-driven detection (`advanced-ml-engine`).
2. Integrate interactive forecasting scenarios.
3. Remove deprecated modules after UI parity confirmed.
4. Add more unit tests (anomalies, forecast transformations, currency conversions).
5. Introduce persisted cache + background refresh inside FinanceCore.

### Recent Enhancements (Phase 2)
- Multi-scenario forecasting engine (`forecasting-engine.ts`) generating Baseline, Optimistic, Pessimistic paths (heuristic growth + deterministic variance).
- Extended snapshot with `selectedScenarioId` and scenario metadata (confidence, assumptions).
- New selectors: `selectActiveScenario`, `selectAnomalySummary`, `selectProfitabilityTimeline`.
- Profitability Timeline chart (`ProfitabilityTimeline.tsx`) showing % margin progression.
- Skeleton loading components (`Skeletons.tsx`) for charts, KPIs, and tables + shimmer tokens.
- Expanded design tokens: forecast colors, severity badges, skeleton surfaces, info/warning semantic colors.
- Test suite expanded to validate multi-scenario forecasts, anomaly summary, profitability timeline integrity.

### Scenario Usage
```tsx
const { snapshot } = useFinanceCore();
// Active scenario id on snapshot.selectedScenarioId
// Change (future): FinanceCore API will expose setScenario(id)
```

### Roadmap Adjusted
| Feature | Status | Notes |
|---------|--------|-------|
| Multi-scenario heuristic forecasts | ✅ | Baseline/Optimistic/Pessimistic generated from historical net |
| Scenario selection API | ⏳ | Add setter + persistence next phase |
| Profitability timeline | ✅ | Margin% line chart added |
| Skeleton states | ✅ | Shimmer placeholders unify loading UX |
| Real-time diff sync | ⏳ | Planned websocket mock service |
| ML anomaly engine | ⏳ | Placeholder heuristic only |
| Forecast confidence bands | ⚠️ | Basic ±12% band on cashflow trend; refine per scenario |
| Scenario comparison overlays | ⏳ | Future side-by-side or spread visualization |
| Removal of deprecated finance modules | ⏳ | After feature parity & adoption metrics |

### Planned (Upcoming Sprint)
1. Add `setScenario(id)` within FinanceCore with persisted preference.
2. Introduce websocket mock (`finance-realtime.ts`) to emit snapshot diffs.
3. Integrate anomaly service stub from `advanced-ml-engine` returning scored items.
4. Scenario comparison view (overlay net lines + delta table).
5. Expand tests: currency conversion accuracy, scenario selection, websocket diff application.

### Scenario Selection & Realtime (Implemented)
`FinanceCoreProvider` now accepts `realtime` prop (boolean). When enabled, it subscribes to a mock realtime service that emits small snapshot diffs (simulated net fluctuations). The API now exposes:

```ts
interface FinanceCoreApi {
	setScenario?(id: string): void; // Switch active forecast scenario
	listScenarios?(): { id: string; label: string }[]; // Enumerate scenarios
}
```

Usage:
```tsx
<FinanceCoreProvider realtime>
	<FinanceDashboard />
</FinanceCoreProvider>

function ScenarioSwitcher(){
	const { listScenarios, setScenario, snapshot } = useFinanceCore();
	return (
		<select value={snapshot?.selectedScenarioId} onChange={e=> setScenario?.(e.target.value)}>
			{listScenarios?.().map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
		</select>
	);
}
```

Realtime mock lives in `src/finance/finance-realtime.ts` and can be replaced later with a true WebSocket implementation broadcasting partial diffs.
