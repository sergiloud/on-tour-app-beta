# On Tour App 2.0 (alpha)

[![Netlify Status](https://api.netlify.com/api/v1/badges/a76ad973-a09f-4124-b400-d28eb6150ee3/deploy-status?branch=main)](https://app.netlify.com/sites/ontourapp/deploys)

Single app (on-tour-app) built with Vite + React + TypeScript + Tailwind.

This is an early alpha intended for internal testing only. Expect rough edges and fast iteration.

## Project structure

- on-tour-app/
  - src/features/* vertical slices (shows, calendar, finance)
  - src/lib/i18n.ts key-based en/es dictionary
  - src/shared/showStore.ts local shows store (LocalStorage)
  - styles/ Tailwind tokens and utilities
  - tests: Vitest + Testing Library under `src/__tests__`

## Local development

- dev: npm run dev
- build: npm run build
- preview: npm run preview
- test: npm test

Run those scripts from the `on-tour-app` folder or with `npm --prefix on-tour-app run <script>` from repo root.

## Deploy (GitHub → Netlify)

Netlify site configuration:

- Branch: main
- Base directory: on-tour-app
- Build command: npm run build
- Publish directory: dist
- SPA routing: `public/_redirects` contains `/* /index.html 200`

Repo: https://github.com/sergiloud/On-Tour-App-2.0

Production: https://ontourapp.netlify.app/

### Orden operativa: “deploy en github”

Cuando indiques “deploy en github”, ejecutaré automáticamente lo siguiente:

1) Preparación del repo
  - Verificar que `main` está actualizado.
  - Ejecutar build local rápido para asegurar que compila.
  - Confirmar que no existen workflows de GitHub Pages activos (el deploy lo hace Netlify).

2) Push y trigger de Netlify
  - Subir a `main` cualquier cambio pendiente relacionado con el lanzamiento (si los hubiera).
  - Netlify detecta el push a `main` y lanza el build con la configuración de `netlify.toml` (`base=on-tour-app`, `publish=dist`).

3) Verificación
  - Comprobar el estado del deploy en el panel de Netlify del sitio `ontourapp`.
  - Validar que las rutas de SPA funcionan (Home, /dashboard, rutas profundas) gracias a `public/_redirects`.

Resultado esperado: el sitio queda publicado en `https://ontourapp.netlify.app/` con la última versión de `main`.

## Alpha notes

- Demo data is gated: from Dashboard, the “Load demo data” button prompts for password `dannyavila`. This only guards the UI; unit tests and SSR bypass it.
- Demo dataset assigns WHT by geography with precedence: city > state (CA) > country.
- Finance view is consolidated to v2 (exports in header, a11y enhancements).
- Calendar includes keyboard navigation and ICS importer.

## Testing

- `npm test` (Vitest + jsdom). Demo data tests use the lib API and are unaffected by the UI password prompt.

## Known gotchas

- LocalStorage access is wrapped in try/catch; data is device-local.
- Keep Suspense boundaries around lazy routes.
- Always add new i18n keys to both en and es.

## Contributing (alpha)

- Create small PRs targeting `main`.
- Run tests locally before pushing.
- Coordinate deploy windows; Netlify builds from `main`.
