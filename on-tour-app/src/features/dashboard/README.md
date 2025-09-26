# Dashboard view config

Contract lives in `viewConfig.ts`:
  - `Widget` types: `map`, `actionHub`, `financeQuicklook`, `tourOverview`, `missionHud`.
  - `ViewDefinition`: `{ main: Widget[], sidebar: Widget[], mainOrder?, sidebarOrder? }`.
  - `defaultViews`: built-in views (`default`, `finance`, `operations`, `promo`).
  
Custom views
  - Persist JSON to `localStorage` under `dash:savedViews` keyed by name.
  - Set `dashboardView` to `custom:<name>` to load.

Renderer
  - The Dashboard page imports `defaultViews` and `resolveView` and renders widgets declaratively.

This keeps dashboards declarative and avoids duplicating JSX.