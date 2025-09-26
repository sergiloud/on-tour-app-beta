## AI agent guide for this repo

Scope: single Vite + TypeScript app.
- on-tour-app/ — React UI prototype with Tailwind and extensive component tests

Architecture (big picture)
- Vertical feature slices under `src/features/*` (finance, dashboard, travel). Shared utils in `src/lib`, `src/shared`, `src/ui`.
- State: React Contexts for cross-cutting state (`src/context/*`) + local `showStore` (`src/shared/showStore.ts`). Finance = pure snapshot + memoized selectors.
- Routing: React Router (lazy + Suspense). Prefetch route chunks on hover/focus via `src/routes/prefetch.ts`; keep fallbacks short and accessible.
- i18n: key-based dictionary `src/lib/i18n.ts`. Always add keys to both `en` and `es`.
- Styling: TailwindCSS (`styles/index.css`, `styles/tokens.css`). Reuse tokens/utilities; avoid ad‑hoc CSS.

Developer workflows
- on-tour-app: install → `npm run dev` / `build` / `preview`; tests `npm test` (Vitest + jsdom, specs in `src/__tests__/*`).

Integration touchpoints
- Map previews with `maplibre-gl`; virtualization via `@tanstack/react-virtual`; prefetch pages via `src/routes/prefetch.ts`.

Project conventions
- Derive, don’t duplicate: compute KPIs from a single finance snapshot via selectors; avoid per‑component recomputation.
- Context‑first shared state: expose hooks from providers (e.g., `KPIDataProvider` + `useKpi()`); don’t add new global state libs.
- Currency/formatting: use `SettingsContext.fmtMoney` (backed by `SettingsContext.currency` + `Intl.NumberFormat`).
- Data: persists demo data to localStorage.
- Route prefetch: call `prefetch.*()` on intent (hover/focus) to warm lazy chunks; do not block UI on failures.
 - Calendar: use shared `components/calendar/types.ts` CalEvent across Month/Week/Day/Agenda. Bucket dates with tz-aware YYYY-MM-DD (avoid `toISOString().slice(0,10)` shifts). Keep dialogs a11y (aria-modal, focus trap). Fetch travel with AbortController; surface gentle errors.

Concrete examples
- i18n: `import { t } from 'src/lib/i18n'; <h2>{t('finance.quicklook')}</h2>`
- KPIs via context: `const { display, raw } = useKpi();` use `display.*` for animated values; `raw` for exact numbers.
- Shows store: `const unsub = showStore.subscribe(cb);` always call `unsub()` in `useEffect` cleanup.
- Prefetch routes: `import { prefetch } from 'src/routes/prefetch'; <Link to="/dashboard/calendar" onMouseEnter={prefetch.calendar}>Calendar</Link>`

Testing & quality
- Component tests in `src/__tests__` with Testing Library; prefer selector/snapshot unit tests for finance logic.

Gotchas
- Guard localStorage with try/catch (SSR/tests) — see `src/shared/showStore.ts`.
- Keep Suspense boundaries around lazy routes; short, accessible fallbacks.
- Always add new i18n keys to both languages to avoid leaking raw keys.
