# Finance Integration Layer

This document explains the new professional finance analytics integration added to the OTA internal app.

## Overview
The finance domain is now powered by a unified orchestrator (`src/services/finance-integrations.js`) that coordinates:
- Real data aggregation (FX, shows, goals, settings, expenses)
- Machine learning (classification + anomaly detection + forecasting base data)
- Interactive forecasting scenario generation
- PDF reporting (multi-template)
- Mobile / PWA hooks

React-based professional charts consume this orchestrator via a context provider that supplies snapshots, forecasts and anomalies.

## Key Files
- `src/services/finance-integrations.js`: Orchestrator facade (snapshot, forecast, classify, anomalies, report, rates subscription)
- `src/components/finance-charts-professional.js`: Recharts components + `FinanceDataProvider` + hooks
- `src/components/FinanceToolbar.jsx`: Unified toolbar controlling live mode, scenarios, ML actions, density, PDF export
- `src/modules/finance-dashboard-professional.js`: Mounts provider + toolbar + chart panels into `#professional-finance-charts` inside `app.html`
- `src/styles/unified-styles.css`: Extended with `.finance-toolbar`, `.scenario-badge`, `.anomaly-pill` styling

## Orchestrator API
```
initFinancePlatform(options?) -> state
loadLiveFinanceSnapshot(params?) -> { expenses, goals, shows, settings, rates, ts }
getForecastScenarios(params?) -> [ { id, label, series: [ { month|label, value } ] } ]
classifyExpenses(expenses[]) -> classification results
detectAnomalies(expenses[]) -> anomaly array
generateFinanceReport(type, options) -> jsPDF instance
subscribeToRates(cb, { intervalMs }) -> unsubscribe fn
refreshAll(params?) -> { snap, forecasts, anomalies }
useFinanceState() -> shallow copy of orchestrator state (for non-React usage)
on(event, cb) / off(event, cb)
```
Events emitted: `ready`, `snapshot`, `forecast`, `anomalies`, `report`, `rates`, `teardown`.

## React Integration
Wrap any finance chart area with:
```jsx
<FinanceDataProvider autoRefresh={true} refreshIntervalMs={120000}>
  <FinanceToolbar />
  {/* charts */}
</FinanceDataProvider>
```
Use `useFinanceData({ live:true })` inside components to access `{ snapshot, forecasts, anomalies }`.

## Live Data Fallback Logic
Each chart accepts either explicit `data` prop or derives structured data from the latest snapshot:
- Waterfall: Derived from income vs grouped expenses
- Category donut: Expense grouping by category
- Cash Flow Trend: Monthly aggregation + optional forecast overlay
- Revenue Breakdown: Income categories gross + computed net (placeholder margin)
- Heatmap: Show profitability by tour & country (derived from shows if present)

## Anomaly Highlighting
`WaterfallChart` will highlight bars whose label matches an anomaly category (basic first pass—future improvement: map by transaction id or date bucket). The toolbar Detect action triggers anomaly detection.

## Forecast Overlay
`CashFlowTrendChart` merges forecast series (first scenario) as a dashed info line when `showForecast` prop is true. Scenarios are loaded automatically after the initial snapshot.

## Toolbar Controls
- Live toggle: Enables/disables live context consumption (charts fallback to static props when off)
- Refresh: Full refresh (snapshot -> forecast -> anomalies)
- Scenario select: Switch scenario (baseline vs others – future: drive conditional styling)
- Density switch: Emits selection so parent can toggle density class (e.g. add `.density-compact` on container)
- ML Classify / Detect: Triggers classification & anomaly detection on current snapshot expenses
- PDF Report: Generates and auto-saves financial report

## Styling Notes
New classes extend design system tokens; responsive adjustments for narrow screens. Add `.density-compact` to a wrapper to reduce spacing.

## Progressive Migration
Legacy canvas/Chart.js blocks in `app.html` are hidden (`hidden` attribute) but retained temporarily. Once validated, remove those legacy containers and associated scripts.

## Future Enhancements (Suggested)
1. Scenario-specific color theming & multi-line forecast comparison
2. Anomaly severity scale with tooltips & inline markers on charts
3. Drill-down modals (click any bar/slice to open itemized list)
4. Offline caching of last snapshot & forecast in IndexedDB
5. Configurable auto-refresh cadence per user setting

## Added (Iteration 2)
- Integrated Analysis View controller (`finance-analysis-integrated.js`) powering feed filtering, totals, exchange rates via orchestrator.
- Exchange rates now refresh every 60s using `subscribeToRates`.
- Forecast line color reflects baseline vs alt scenario.
- Toolbar exposes refresh interval selector (1m–10m) wired to provider.
- Optional Node-safe guards for ML / PDF / Forecast modules (degrade gracefully when deps or DOM absent).

## Quick Dev Test
From a React capable environment in the app (already mounted by dashboard module):
```
window.enhancedFinanceDashboardV2.chartsManager // should exist
```
Or manual orchestrator smoke:
```
import * as F from './services/finance-integrations.js';
await F.initFinancePlatform();
await F.loadLiveFinanceSnapshot();
await F.getForecastScenarios();
```

## Removal Plan (Legacy)
After full validation remove:
- Hidden legacy chart sections in finance hub
- Any unused Chart.js finance scripts
- Redundant currency panels replaced by live provider-driven components (if migrated)

---
Maintainer: Finance Integration Pass 1 (2025-09)
