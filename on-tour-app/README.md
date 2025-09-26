# On Tour App

Prototype React UI (Vite + TypeScript + Tailwind) for tour / show management. This document currently focuses on the recently added Venue field in the Show Editor and its telemetry semantics.

## Show Editor – Venue Field

### Purpose
The `venue` field captures the performance location (club, festival stage, hall) for a show. It is optional, intentionally lightweight (single free‑text line), and designed for incremental enrichment without blocking rapid show entry.

### UX & Behavior
- Single text input in the Show Editor drawer (between core metadata fields – exact placement may evolve).
- Trims leading/trailing whitespace on blur.
- Empty or whitespace‐only input is treated as "no venue" (stored as `undefined`).
- Value is preserved within the current draft session; undoing a deletion of the show also restores the venue.
- i18n: Adds label & help/placeholder keys for both `en` and `es`. Always add both to avoid falling back to the raw key.

### Normalization Rules
| Input Raw | Stored Value | Event Triggered |
|-----------|--------------|-----------------|
| "  " | `undefined` | (Clear if previously had value) |
| "The Hall" | "The Hall" | Set / Changed depending on prior state |
| "The Hall  " | "The Hall" | (Same value post-trim → no change event) |
| "The  Hall" (double space) | Preserved (no aggressive collapsing) | Changed if previous normalized value differs |

Whitespace-only transitions count as a clear. Re‑entering the exact same normalized text does not fire another telemetry event.

### Telemetry Events
The editor emits three mutually exclusive venue lifecycle events during a single edit session (drawer open → close):

| Event | When It Fires | Notes |
|-------|---------------|-------|
| `SHOW_VENUE_SET` | First time a venue goes from empty → non-empty | Only if there was no prior venue this session |
| `SHOW_VENUE_CHANGED` | Venue changes from one non-empty normalized string to a different one | Debounced by state comparison; repeated identical input ignored |
| `SHOW_VENUE_CLEARED` | Venue transitions from non-empty → empty/whitespace | Treats trimmed empty as clear |

Guards ensure each qualifying state transition produces exactly one event; re-renders without state change do nothing.

### Analytics Guidance
- Adoption funnel: `SET` counts new field adoption. High set rate indicates utility / discoverability.
- Churn / instability: Elevated `CHANGED` immediately after `SET` may mean users are experimenting or unsure (consider inline examples or suggestions).
- Data hygiene: Frequent `CLEARED` events after `CHANGED` could suggest accidental entry or mismatched mental model (maybe the value belongs elsewhere—e.g., city vs venue confusion).
- Quality metric: (unique shows with venue) / (total shows edited) as a dashboard KPI if venue proves strategically valuable.

### Implementation Notes
- Event constants are registered in `src/lib/telemetryEvents.ts`.
- The Show Editor effect watches the normalized draft venue value and previous value reference to detect state transitions.
- Tests verifying the event sequence live in `src/__tests__/shows.venue.telemetry.test.tsx`.

### Adding Future Field Telemetry (Pattern Reuse)
1. Define constants in `src/lib/telemetryEvents.ts`.
2. Add localized label/help keys to both `en` and `es` in `src/lib/i18n.ts` (group fields logically; keep alphabetical inside section when practical).
3. Implement a `usePrevious` (or ref) comparison inside the editor component to guard transitions.
4. Emit events via the central `trackEvent` helper. Never inline string literals.
5. Add tests mirroring real interaction (set → change → clear) and assert ordered emission.

### Edge Cases Covered
- Re-typing identical value (after trimming) → no duplicate event.
- Clearing via select-all + delete → emits `SHOW_VENUE_CLEARED` once.
- Input with trailing spaces that resolves to same normalized value → no `CHANGED` event.
- Rapid sequential changes: each distinct normalized value produces at most one `CHANGED` per transition path.

### i18n Keys
(Ensure both languages are present; names illustrative if you search inside `i18n.ts`.)
```
show.venue.label
show.venue.help
```
Spanish equivalents mirror the same keys with translated values.

### Quality Checklist
- a11y: Input has accessible label (from i18n key) and optional description/help text.
- Telemetry: All three events asserted by test; no console warnings.
- Performance: Comparison is O(1); no additional renders introduced.
- Resilience: Safe if telemetry system is disabled (calls become no-ops).

### Potential Enhancements (Deferred)
- Autocomplete from previously used venue values (client-side LRU list).
- Structured venue object (link to canonical venue directory) with future disambiguation UI.
- Geo enrichment (resolving venue to city / coordinates for routing & travel prefill).
- Inline validation (flag extremely long entries or pure punctuation).

---

## Development (Quick Reference)
Install & run:
```
npm install
npm run dev
```
Run tests (includes venue telemetry tests):
```
npm test
```

---

If you expand this README beyond the venue field later, consider adding: architecture overview, routing & prefetch strategy, i18n workflow, and accessibility conventions.
