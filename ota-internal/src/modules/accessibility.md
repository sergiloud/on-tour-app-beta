# Accessibility Overview

This document summarizes current accessibility (a11y) affordances and patterns within the internal dashboard.

## Live Announcements (aria-live)
Implemented via `announcer.ts` with two regions:
- polite: default queue
- assertive: urgent (used sparingly for new risk events)

Features:
- Queue + requestAnimationFrame batching
- De‑duplication window (default 4s) to avoid repeating identical messages
- Dev exposure: `window.announce('Message')`

Guidelines:
1. Announce meaningful state changes (count deltas, new risks, cleared states).
2. Avoid narrating purely visual reflows or unchanged counts.
3. Use assertive only for high-impact changes (e.g., first appearance of overdue invoice risk).
4. Keep phrases concise and self-contained.

## Panel Ordering & Reordering
Panels are keyboard focusable and draggable (
`draggable-panel` class) with:
- `role="group"` and `aria-roledescription="dashboard panel"`
- `aria-label` drawn from i18n or panel title

Keyboard interactions:
- Arrow Up/Down: move within column
- Arrow Left/Right: move between columns
- Space: toggle grabbed state (visual affordance)

Announcements: Reordering updates a polite live region summarizing the new order.

## i18n & Dynamic Content
`applyTranslations` hydrates elements with `data-i18n`. Dynamic components inject already-localized strings using `t/ti/tp`. Fallback: English.

## Future Enhancements (Proposed)
- Mute toggle for live announcements per user preference
- Focus ring visibility improvements under high contrast
- Reduced motion respect (skip certain entry animations)
- Virtualized long lists with maintainable accessibility semantics

## Testing Checklist
- Navigate panels with keyboard only
- Reorder panels and confirm live order announcement
- Trigger pending/action center updates and verify concise announcements
- Switch locale and ensure newly rendered dynamic content updates

---
Keep this doc updated as new a11y features land.
