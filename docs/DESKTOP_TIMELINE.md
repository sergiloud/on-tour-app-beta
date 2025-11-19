# Timeline Maestro Web — Estado Actual Completo
**Versión:** 1.0  
**Fecha:** 18 de noviembre de 2025  
**Ambiente:** App web/desktop (`/dashboard/timeline`)  
**Owner:** Sergi Recio + AI (GitHub Copilot + Claude)

---

## 1. Propósito Estratégico
- Actúa como **centro de inteligencia** de toda la organización: shows, finanzas, contratos, viajes, colaboración y auditoría.
- Sustituye y amplía al antiguo *Activity Feed* con filtros avanzados, agrupación inteligente y streaming en tiempo real.
- Incrementa la **confianza operativa** (todo en un solo feed), reduce soporte y mejora adopción de módulos premium (Finance, Contracts, Travel).

KPIs impactados:
- Tiempo medio para detectar incidentes ↓
- Retención de usuarios avanzados ↑ (managers, finanzas, promotores)
- Conversión Free → Indie/Pro ↑ gracias a insight compartido

---

## 2. Estado Actual (v1.0 — Producción)
| Capability | Descripción |
|------------|-------------|
| **Servicio central** | `TimelineService` (TypeScript) agrega eventos de Shows, Finance, Contracts, Travel, Collaboration, Audit. Escucha en tiempo real con Firestore `onSnapshot`. |
| **Tipado fuerte** | Interfaces por tipo de evento y discriminated unions para `TimelineEvent`. |
| **Agrupación inteligente** | Combina eventos repetidos (p.ej. "3 expenses added") con ventana de 1h y mismo autor. Preserva detalle en metadata. |
| **Filtros avanzados** | Módulo (Shows/Finance/…), Importancia (Critical→Low), Rango temporal (7/30/90/all), Search instantáneo, filtros preparados para usuario y show específico. |
| **UI virtualizada** | `@tanstack/react-virtual`, 600px viewport, overscan 5 items. Diseño profesional sin emojis, usando tokens (Emerald/Green/Blue/Purple/Amber/Gray). |
| **Internacionalización** | EN/ES: `timeline.*`, `nav.timeline`, tooltips y vacíos localizados. |
| **Routing** | Ruta lazy `/dashboard/timeline`, enlace en sidebar después de Activity, prefetch configurado, fallback skeleton accesible. |
| **Demo mode** | Generador de datos para entornos sin Firestore (dev/tests). |

---

## 3. Arquitectura y Flujo de Datos
```
TimelinePage (React)
├── Header (title + description)
├── FiltersCard (module, importance, date range, search)
└── TimelineCard (virtualized list)
    └── TimelineEventRow (icono módulo + detalles + badge importancia)
```

**Data flow**:
1. `TimelineService.subscribeToTimeline(orgId, filters)` crea query Firestore + listener.
2. Respuesta pasa por `applySmartGrouping()` → reduce ruido.
3. `TimelinePage` guarda eventos en estado y aplica búsqueda local (`useMemo`).
4. `useVirtualizer` pinta solo los elementos visibles.

---

## 4. Experiencia de Usuario
- **Acceso:** Sidebar → "Timeline" (prefetch en hover) o URL directa `/dashboard/timeline`.
- **Filtros persistentes:** Se mantienen durante la sesión; preparados para persistir en localStorage (pendiente).
- **Cards:**
  - Icono coloreado según módulo.
  - Título + descripción + metadata (usuario, hora, módulo).
  - Badge de importancia (Critical/High/Medium/Low).
- **Grouping:** Muestra contador y descripción agregada ("3 expense_added by Demo User").
- **Empty state:** Mensaje localizado + CTA para navegar a módulos relevantes.

---

## 5. Stack & Diseño
- **Lado servidor:** Firestore real-time (en espera de endpoint Node/Postgres para consolidación futura).
- **Lado cliente:** React 18 + React Router + React Query (prefetch) + `@tanstack/react-virtual`.
- **Tokens:**
  - Módulos: `text-emerald-400` (Shows), `text-green-400` (Finance), `text-blue-400` (Contracts), `text-purple-400` (Travel), `text-amber-400` (Collab), `text-gray-400` (Audit).
  - Importancia: `text-red-400` (Critical), `text-amber-400` (High), `text-blue-400` (Medium), `text-green-400` (Low).
  - Tipografía: Page title `text-3xl font-bold text-white`; contenido acorde guía design system (sin emojis, solo iconografía Lucide).

---

## 6. Instrumentación y Métricas
Eventos enviados a Firebase Analytics / Mixpanel:
- `timeline_viewed` (props: moduleFilter, importanceFilter, dateRange, locale).
- `timeline_filter_changed`.
- `timeline_event_grouped` (conteo para tunear heurística).
- `timeline_event_clicked` con `module`, `entityId` (preparado para deep links).
- `timeline_error` (Firestore falló, fallback a demo data).

Panel interno compara tiempo medio de respuesta vs. Activity Feed legacy.

---

## 7. Roadmap Web
| Fase | Estado | Detalle |
|------|--------|---------|
| Backend REST (`/api/timeline`) | 🔴 No iniciado | Endpoint Node/Postgres que agregue eventos multitabla + paginación cursor. |
| Socket.io realtime | 🔴 No iniciado | Emisión `timeline:${orgId}` para reemplazar `onSnapshot` y soportar futuro multi-backend. |
| Interactive actions | 🟡 Preparado | Metadata ya incluye rutas destino; falta UI de click/quick actions. |
| Saved views / presets | ⚪ Idea | Guardar filtros favoritos por usuario. |
| Email digests | ⚪ Idea | Resumen diario/semanal de eventos críticos. |
| Export CSV/PDF | ⚪ Idea | Compartir timeline filtrado con stakeholders externos. |
| Notifications web push | ⚪ Idea | Alertas inmediatas para eventos críticos. |

---

## 8. Testing & QA
- **Unit:** TimelineService (agrupación, mapping de Firestore → UI), utilidades de filtros.
- **Component:** `TimelinePage` con Testing Library + mocking de `useVirtualizer`.
- **E2E:** Playwright / Vitest+jsdom verifican carga, filtros y agrupación.
- **Perf:** Perfilado con 1.000 eventos (scroll continuo) → objetivo <16ms/frame y ~15 nodos simultáneos.

---

## 9. Riesgos & Mitigaciones
| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Dependencia Firestore directa | Medio | Backend propio + caching en 2026. |
| Agrupación oculta eventos críticos | Bajo | Excepcionar tipos `critical` del grouping + badge "group". |
| Virtualizer rompe SEO | Bajo | Página es auth-only; no index. |
| Falta deep link | Medio | Implementar `onClick → navigate(entityRoute)` en roadmap interactivo. |

---

## 10. Checklist de Mantenimiento
1. Revisar traducciones `timeline.*` tras cada nueva clave.
2. Mantener lista de tipos en `TimelineEventType` sincronizada con módulos nuevos.
3. Validar Firestore reglas para colección `timelineEvents` (lectura limitada por org).
4. Ejecutar suite de tests de filtros antes de releases trimestrales.
5. Monitorizar en Sentry los errores `timeline_error`.

---

## 11. Resumen Ejecutivo
Timeline Maestro Web ya entrega una experiencia completa para escritorio: feed unificado, filtros avanzados, UI virtualizada y localización bilingüe. El siguiente salto es desacoplarse de Firestore con un endpoint backend + Socket.io para mantener consistencia entre mobile/desktop y habilitar acciones contextuales ricas. Este documento sirve como referencia única del estado actual y guía de evolución para el equipo de escritorio.
