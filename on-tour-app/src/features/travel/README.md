# Travel module

This feature slice provides travel planning primitives and UI in one place.

- Domain types and providers: `src/features/travel/providers/*`
  - `searchFlights(p)` orchestrates provider selection + caching.
  - `providers/util.ts` centralizes cabin mapping and deep-link building.
- UI: `src/features/travel/components/*`
  - `TravelHub` is the unified entry point (assistant + SmartFlightSearch + upcoming).
- NLP/search helpers: `src/features/travel/nlp/*`, `src/features/travel/hooks/*`.
- Shared utils: `src/lib/travel/*` (deeplink builders, cost conversion).

Conventions
- Prefer a single deep-link builder (`lib/travel/deeplink.ts`) wired via `providers/util.ts`.
- Do not duplicate currency conversion; use `toCurrency` from `lib/travel/cost.ts`.
- Keep planner/search state inside dedicated components (e.g., `TravelHub`).

Testing
- Component tests live under `src/__tests__/travel.*`.
