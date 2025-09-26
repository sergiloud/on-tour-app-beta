# Dashboard Component Extraction

Phase 2 introduces a minimal component contract to incrementally migrate monolithic dashboard rendering into isolated modules.

## Contract
```
interface DashComponentCtx { now: Date; }
interface DashComponent {
  id: string;                    // matches DOM panel/section id
  mount(el: HTMLElement): void;  // one-time setup (listeners)
  update(ctx: DashComponentCtx): void; // (re)render DOM
  unmount?(): void;              // optional future cleanup
}
```
Register inside module via `registerComponent(component)`; side-effect import from `dashboard.ts` ensures inclusion.

## Migration Pattern
1. Copy existing render* function body into new component's `update`.
2. Move event listener binding into `mount` (guard with `if ((el as any)._bound) return`).
3. Replace direct calls in `renderDashboard()` with:
```
mountComponent('panel-id', { now });
updateComponent('panel-id', { now });
```
4. Replace previous event triggers (`renderX()`) with `updateComponent('panel-id', { now: new Date() })`.
5. Remove old function + helpers once migrated.

## Extraction Status
Extracted:
- `pending-actions` (pending panel) — `pending.ts`
- `month-shows` (current month shows) — `month-shows.ts`
- `month-travel` (travel list) — `travel.ts`
- `upcoming-feed` (combined upcoming list) — `upcoming.ts`
- `action-center` (prioritized actions) — `action-center.ts`

Planned next:
- (none — all primary dashboard panels extracted)

Each component lives in its own file inside this folder.

## Shared Utilities
`dom-utils.ts` provides `patchList` (now used by multiple components). Add more helpers here only after a second usage appears (YAGNI guard).

## Action Providers
`action-center.ts` exports `registerActionProvider(p)` to allow future modular providers. External modules can import and register additional providers before the dashboard mounts.

## Performance Tagging
Wrap heavy updates with `perf('dash:componentName', () => { ... })` just like original functions.

## i18n
Continue using `t`, `ti`, `tp` helpers directly; attributes added in static HTML will still be hydrated by `applyTranslations`.

## Accessibility (Live Announcements)
`announcer.ts` provides a centralized `announce(text, { assertive? })` helper with polite + assertive aria-live regions and built‑in de‑duplication. Components should:
- Announce only meaningful state changes (counts, newly introduced risks) — avoid spamming every trivial re-render.
- Use assertive sparingly (e.g. first appearance of an overdue invoice risk) to prevent interrupt fatigue.
- Prefer concise, self‑contained phrases (no need to prefix with the panel name if context already implicit).
Pending + Action Center integrate this pattern as reference examples.

---
This README is intentionally concise so future extractions remain consistent. Commit updates here if contract evolves (e.g., adding `dispose`, `suspend`, virtualization hooks).
