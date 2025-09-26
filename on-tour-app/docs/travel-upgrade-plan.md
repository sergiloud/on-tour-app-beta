# Travel upgrade: telemetry, i18n, testing, performance, a11y, rollout

This doc summarizes the acceptance and implementation notes for the Travel module improvements.

## Telemetry
- Events: travel.search.started, travel.search.completed, travel.search.error, travel.result.pinned, travel.result.unpinned, travel.compare.view, travel.deeplink.open, travel.timeline.move, travel.quickTripPicker.open, travel.trip.add, travel.provider.change
- Types and helpers: `src/lib/telemetry/travel.ts`
- Flush policy: use global `trackEvent` batching (visibilitychange + idle). No network calls here.

## i18n
- Keys added for summary chips, compare badges, CO2, sticky bar, and tooltips.
- EN/ES updated in `src/lib/i18n.ts`. Keep future keys under travel.* namespace.

## Testing (Vitest + Testing Library)
- Add tests:
  - travel.search.stepper: navigation, summary chips reflect state, Enter triggers search.
  - travel.compare.metrics: price/hour correctness, badges (best price/time/balance), bottom-sheet layout on small width.
  - travel.timeline.summary: per-day aggregation and badges (red-eye, tz delta, conflict with show).
  - travel.a11y.modals: QuickTripPicker focus trap + focus return.
  - travel.results.virtualization: smooth rendering >300 items.
  - travel.nlp.ranges: Spanish ranges ("entre 12 y 18 Oct"), round-trip in a single phrase.

## Performance
- Virtualize `FlightResults` over 30 items via @tanstack/react-virtual.
- `AirportAutocomplete`: LRU (100) + prefetch after first keypress.
- If flex-days expands, move to a Web Worker (`src/workers/travelFlexWorker.ts`).
- Memo hotspots: grouped results, pinned set, KPI computations.

## Accessibility
- Focus-trap QuickTripPicker; return focus to invoker; aria-labelledby/aria-describedby.
- Keyboard alternatives to timeline DnD (move ±1 day); describe drop targets via aria-describedby.
- Live regions: results count and tab changes.
- Touch targets ≥44px; ensure visible focus rings with AA contrast.

## Rollout and flags
- Flags in `src/lib/flags/travel.flags.ts`: unifiedTabs, compareV2, resultsVirtualization
- Start compareV2 behind flag; enable per-user via localStorage.

## Metrics goals
- Add-to-trip conversion > 25% of sessions with results.
- Compare usage > 35% of sessions with ≥3 results.
- TTFResult < 400ms mock / < 1.5s provider.
- 100% rest conflicts highlighted in timeline.
- Internal usability NPS: +60.
