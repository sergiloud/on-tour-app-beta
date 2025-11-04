# MVP Enterprise Roadmap (4 semanas)

Estado: actualizado 2025-11-01

## Resumen Final — Estado Actual

| Aspecto                | Estado | Comentario breve                                      |
| ---------------------- | ------ | ----------------------------------------------------- |
| Core Features          | 95%    | Listo: calendario, shows, finanzas, travel, dashboard |
| UX / Perfil            | 85%    | 7 tabs, falta persistencia y pruebas de uso real      |
| Performance            | 100%   | Workers, PWA, web-vitals integrados                   |
| i18n                   | 80%    | Sistema propio bueno, migración recomendada           |
| Seguridad              | 75%    | Sanitización, storage; falta 2FA y gestión granular   |
| Mobile UX              | 60%    | Falta gestos, optimización targets, QA en Android/iOS |
| Integraciones Externas | 40%    | Amadeus parcial, sin clave real ni fallback robusto   |
| Importadores           | ELIM.  | Eliminados, menos bugs/QA y mayor foco en core        |

> Prioridad máxima: Pulir, asegurar y lanzar MVP Enterprise, sin importar importadores y con énfasis en seguridad, mobile y settings persistentes.

---

## Objetivo del ciclo (4 semanas)

Versión 2.0 estable, segura, con UX móvil competitiva y settings persistentes.
Sin importadores. Seguridad nivel enterprise (2FA, sesiones activas). Listo para demo y beta.

---

## Semana 1 — Settings + i18n (Fundamento Personalizable)

- Persistencia de settings: local + backend
  - Hook `useSettingsSync` (multi-tab sync, debounce, versionado)
  - API (stub) `services/settings.ts` para persistir usuario/tenant (mock/demo)
  - QA: stress (multi-tab), reload, eventos `prefs:updated`
- Migración i18n: i18next + namespaces + lazy loading
  - Paquetes: `i18next`, `react-i18next`, `i18next-browser-languagedetector`
  - Soporte plurales, interpolación, RTL
  - Estrategia de migración progresiva (wrapper compatible)
- Global Theme sync + toggle animado (ya hay ThemeProvider; revisar integración con Settings)
- Testing/QA:
  - Tests de settings (persistencia/cambios) y cambio de idioma

Riesgos y mitigación:

- Integración backend: empezar con stub local, interfaz estable -> swap backend después
- Edge cases multi-tab: events + storage + backoff; pruebas manuales y automáticas

Entregables:

- `src/hooks/useSettingsSync.ts` + wiring en `SettingsContext`
- `src/lib/i18n/i18next.ts` + `I18nextProvider` en `main.tsx`
- 2-3 componentes migrados como ejemplo (UserMenu, Profile)
- Suites de prueba (settings + i18n)

---

## Semana 2 — Seguridad (2FA + Sesiones)

- 2FA (TOTP o Email OTP demo)
- Gestión de sesiones activas (tabla, revoke)
- Señalización de seguridad en UI (Security tab)
- Hardening CSP, headers (Netlify/Workers)

Riesgos: experiencia de demo sin backend real → implementar flujo demo con secureStorage y mocks.

---

## Semana 3 — Mobile UX

- Gestos básicos en calendario/listas (swipe, pull-to-refresh en PWA)
- Tamaños táctiles, focus states, performance en devices medios
- QA en iOS/Android (Safari/Chrome)

---

## Semana 4 — Integraciones y Beta Readiness

- Amadeus: fallback robusto + clave configurable (.env)
- Reports/Export (sin importadores)
- Checklist de Beta (docs, guías, troubleshooting)

---

## Métricas de éxito

- TTI < 2s en dispositivos medios (Home/Dashboard)
- Cambios de settings sincronizados en < 200ms entre tabs
- i18n con 2+ namespaces y carga diferida sin flashes
- Security tab funcional (2FA demo + sesiones)
- PWA usable offline para vistas clave

---

## Notas

- Los importadores quedan fuera del MVP. Mantener placeholder visual en Perfil.
- Documentar decisiones y riesgos por semana (CHANGELOG + docs/).
