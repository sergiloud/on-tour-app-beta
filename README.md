# On Tour App 2.0 (alpha)

Two Vite + TypeScript apps developed in parallel:

- on-tour-app — React UI prototype with Tailwind. Focus: Shows, Calendar, Finance v2. LocalStorage for demo data.
- ota-internal — Internal app with finance analytics and PWA plumbing. Supabase planned; Dexie/IndexedDB for offline.

This is an early alpha intended for internal testing only. Expect rough edges and fast iteration.

## Monorepo structure

- on-tour-app/
  - src/features/* vertical slices (shows, calendar, finance)
  - src/lib/i18n.ts key-based en/es dictionary
  - src/shared/showStore.ts local shows store (LocalStorage)
  - styles/ Tailwind tokens and utilities
  - tests: Vitest + Testing Library under `src/__tests__`
- ota-internal/
  - src/ features and modules (finance, dashboard, travel)
  - public/sw.js + src/sw.ts for PWA
  - Supabase integration planned via env vars

## Local development

- on-tour-app
  - dev: npm run dev
  - build: npm run build
  - preview: npm run preview
  - test: npm test
- ota-internal
  - dev: npm run dev
  - build: npm run build
  - preview: npm run preview
  - type-check: npm run type-check
  - lint: npm run lint
  - test: npm run test

## Deploys (GitHub → Netlify)

We deploy one Netlify site per app:

- on-tour-app
  - Branch: main
  - Base directory: on-tour-app
  - Build command: npm run build
  - Publish directory: dist
  - SPA routing: public/_redirects contains `/* /index.html 200`
- ota-internal
  - Branch: main
  - Base directory: ota-internal
  - Build command: npm run build
  - Publish directory: dist
  - Env vars (Site settings → Environment): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

Repo → Primary: https://github.com/sergiloud/On-Tour-App-2.0

## Alpha notes

- Demo data is gated: from Dashboard, the “Load demo data” button prompts for password `dannyavila`. This only guards the UI; unit tests and SSR bypass it.
- Demo dataset assigns WHT by geography with precedence: city > state (CA) > country.
- Finance view is consolidated to v2 (exports in header, a11y enhancements).
- Calendar includes keyboard navigation and ICS importer.

## Testing

- on-tour-app: npm test (Vitest + jsdom). Demo data tests use the lib API and are unaffected by the UI password prompt.
- ota-internal: npm run type-check; npm run test.

## Known gotchas

- LocalStorage access is wrapped in try/catch; data is device-local.
- Keep Suspense boundaries around lazy routes.
- Always add new i18n keys to both en and es.

## Contributing (alpha)

- Create small PRs targeting `main`.
- Run tests locally before pushing.
- Coordinate deploy windows; Netlify builds from `main`.
