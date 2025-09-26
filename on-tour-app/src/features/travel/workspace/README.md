# Travel Workspace (MVP)

Purpose
- Unify search, suggestions, and planning into a single two-panel workspace.
- Act as the visual hub for travel planning before we add drag-and-drop and advanced intelligence.

Route
- Dashboard → Travel → Open Travel Workspace, or navigate directly to `/dashboard/travel/workspace`.

Current features
- Left Panel: SmartFlightSearch + Suggestions + Trips list, provider selector persisted.
- Right Panel: Two views
  - List: grouped-by-day list using existing FlightResults.
  - Week: 7-column grid (or fewer) based on search flex window (±N days).
- Pinned Drawer to compare options.
- QuickTripPicker shows a simple path badge for context.

Tech notes
- State persisted via `loadJSON/saveJSON` keys: `travel.provider`, `travel.pinned`, `travel.workspace.view`.
- Reuses existing components to avoid regressions.
- i18n keys added for EN/ES.

Next steps
- Add accessible drag-and-drop to Week view (dnd-kit) with virtualized lists.
- Flight Card 2.0: stops timeline with airport codes and waits.
- Intelligent Trip Builder: anchor shows, auto-calc legs, optimize sequence.