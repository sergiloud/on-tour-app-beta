# Timeline Maestro Mobile — Documento Técnico Completo
**Versión:** 1.0  
**Fecha:** 18 de noviembre de 2025  
**Owner:** Sergi Recio + AI (GitHub Copilot + Claude)

---

## 1. Rol Estratégico del Timeline
- **Single source of truth** de todo lo que ocurre durante la gira (shows, viajes, tareas, cobros, recordatorios).
- **Contexto inmediato:** De un vistazo, el artista/tour manager sabe qué toca hoy, mañana y el resto de la semana.
- **Diferenciador clave:** Ningún competidor mobile ofrece una vista timeline vertical, offline-first y con sincronización en tiempo real.
- **Punto de entrada** para acciones rápidas: marcar tareas completas, abrir mapas, contactar promotor, disparar workflows financieros.

KPIs que impacta directamente:
- Retención D7/D30 (usuarios vuelven para comprobar la agenda).
- Conversión Free → Paid (timeline + sync offline es feature premium).
- Crash-free & CSAT (experiencia liviana pero completa incluso sin conexión).

---

## 2. Alcance MVP (v1.0 — Junio 2026)
- **Vista vertical agrupada por día** (sticky headers por fecha).
- **Filtros rápidos:** rango de fechas, estados (confirmado, pendiente, cancelado), tipo (show, viaje, pago, tarea).
- **Items soportados:** shows, desplazamientos, milestones financieros, recordatorios administrativos.
- **Gestos soportados:** scroll natural, pull-to-refresh, swipe izquierda (archivar/cancelar), long-press (quick edit). Pinch/zoom queda fuera de v1.
- **Offline-first:** todos los elementos se almacenan en SQLite (`timeline_entries`) y se sincronizan vía replicator Firestore cuando vuelve la conexión.
- **Indicadores visuales:** badges por tipo de evento, iconos contextuales (🎵 show, ✈️ travel, 💸 pago, ✅ tarea), estado de sync (pending / synced).

> **Fuera de v1:** timeline horizontal con pinch-to-zoom (v2), grouping por semanas con zoom interactivo, animaciones avanzadas con Reanimated 3, widgets/Live Activities.

---

## 3. Data Model y Sync
```ts
// Tabla principal
CREATE TABLE timeline_entries (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  show_id TEXT NULL,
  type TEXT CHECK(type IN ('show','travel','finance','task')),
  title TEXT NOT NULL,
  subtitle TEXT,
  start_ts INTEGER NOT NULL,
  end_ts INTEGER,
  status TEXT CHECK(status IN ('confirmed','tentative','canceled','done')),
  location TEXT,
  metadata JSON,
  updated_at INTEGER NOT NULL,
  sync_state TEXT DEFAULT 'pending' -- pending | syncing | synced
);
```

### Estrategia de sincronización
1. **Optimistic UI:** al crear/editar una entrada, se escribe en SQLite y se marca `sync_state='pending'`.
2. **Queue diferenciada:** `sync_queue` guarda operaciones (create/update/delete) con timestamp.
3. **Replicator incremental:** cada 60 s en foreground / 15 min background se hace pull/push con Firestore:
   - `last_write_wins` usando `updated_at`.
   - Conflictos se resuelven sobrescribiendo la versión más reciente.
4. **Indicators UX:** badge «Offline» en toolbar + chip “Syncing…” cuando se detecta operación en curso.

---

## 4. Arquitectura Frontend
- **Hook principal:** `useTimeline()` expone `{ entries, filters, refresh, optimisticPatch }`.
- **Cache local:** React Query + SQLite adapter (persistQueryClient) para hidratar la lista sin tocar la red.
- **Virtualización:** `FlashList`/`RecyclerListView` (según benchmarks) para soportar 1.000+ entradas fluidas.
- **Secciones:** transformador `groupByDay(entries)` → `{ dateLabel, items[] }` que alimenta `SectionList`.
- **Theming:** respeta tokens Tailwind → `spacing`, `rounded`, `color.surface`/`color.card` conectados al `SettingsContext`.

```ts
const sections = groupByDay(entries, settings.timezone)
return (
  <SectionList
    sections={sections}
    stickySectionHeadersEnabled
    renderSectionHeader={DayHeader}
    renderItem={TimelineCard}
    onRefresh={refresh}
    refreshing={isSyncing}
  />
)
```

---

## 5. UX Detallada
### 5.1 Header
- Selector de rango (`Today`, `Week`, `Tour`).
- Filtros pill (All / Shows / Travel / Finance / Tasks).
- Botón "Add entry" → abre bottom sheet reutilizando el quick add show/expense.

### 5.2 Cards
- **Layout:** icono + título + hora + badges.
- **CTA contextual:**
  - Show → "Ver detalle" / "Abrir mapa".
  - Travel → "Abrir indicaciones".
  - Finance → "Abrir settlement".
- **Estados:**
  - Confirmado → borde verde.
  - Tentativo → borde amarillo + icono reloj.
  - Cancelado → texto tachado.
  - Done → check ✅.

### 5.3 Gestos
| Gesto | Acción | Nota |
|-------|--------|------|
| Swipe izquierda | Archivar/cancelar | Confirmación vía haptics |
| Long-press | Quick edit modal | Pre-puebla datos para edición rápida |
| Pull-to-refresh | Forzar sync | Muestra timestamp «Synced 2m ago» |
| Tap | Abre detalle contextual | Empuja a `ShowDetail`, `TravelDetail`, etc. |

---

## 6. Instrumentación
Eventos a registrar (Firebase Analytics / Mixpanel):
- `timeline_viewed` (props: `filter`, `range`, `offline_mode`).
- `timeline_entry_created` (props: `type`, `source` (manual/import)).
- `timeline_entry_updated` / `timeline_entry_deleted`.
- `timeline_sync_completed` (props: `duration_ms`, `items_pushed`, `items_pulled`).
- `timeline_offline_warning_shown`.
- `timeline_filter_changed`.

Objetivo: entender patrones de uso, detectar latencias en sync y priorizar features v2.

---

## 7. Roadmap Timeline
| Fase | Feature | Detalle |
|------|---------|---------|
| v1.0 | Lista vertical con filtros | Semana 6-7 del roadmap general. |
| v1.0 | Estados de sync & offline | Mismo sprint que SQLite. |
| v1.0 | CTAs contextuales | Quick links a mapa, finanzas, contactos. |
| v1.5 | Timeline + Finanzas integradas | What-if JS inline, badges de profit. |
| v1.5 | Feature flag WASM | Activar simulador financiero pesado en dispositivos potentes. |
| v2.0 | Timeline horizontal pinch/zoom | Reanimated 3 + gestos complejos. |
| v2.0 | Widgets / Live Activities | Mostrar "Show in progress" en lock screen. |

Dependencias críticas:
- `timeline_entries` sincronizado con `shows/expenses`.
- Reutilizar `showStore` para hidratar CTAs sin fetch adicional.
- Diseño consistente con Timeline Maestro web (naming, iconografía).

---

## 8. Testing
- **Unit:** `useTimeline` + transformadores `groupByDay` cubiertos con Vitest (reutilizar config compartido).
- **Component:** `TimelineScreen` usando Testing Library + mocks de React Query.
- **E2E:** Maestro script: crear show, añadir travel, verificar render offline, volver online y comprobar sync badge.
- **Perf:** Quick benchmark con 1.500 entries (JS profiler) → objetivo 60fps y < 16ms por frame.

---

## 9. Checklist de Implementación (Semana 6-7)
1. Definir schema SQLite + migraciones iniciales.
2. Implementar `timelineRepository` (CRUD + sync hooks).
3. Crear hook `useTimelineFilters` (estado local + persistencia en SecureStore).
4. Construir `TimelineScreen` con SectionList y skeleton states.
5. Añadir indicadores offline + fallback friendly copy.
6. Integrar analytics y pruebas.
7. QA manual con datos reales + export TestFlight build.

---

## 10. Riesgos & Mitigaciones
| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Listas largas (>2k items) | Jank/scroll lento | Virtualización + windowing agresivo + memoized cards |
| Conflictos de sync | Datos inconsistentes | Timestamps + última escritura gana + audit log local |
| Usuarios sin datos móviles | Experiencia truncada | Caches + modo offline claro + compresión en payloads |
| Futuras animaciones complejas | Refactor costoso | Mantener arquitectura modular (cards, headers, gestures) |

---

## 11. Resumen Ejecutivo
- Timeline es el **epic** que diferencia On Tour App en mobile.
- MVP se enfoca en una lista vertical impecable, rápida y 100% offline-first.
- La infraestructura (SQLite + Firestore replicator + hooks compartidos) deja listo el terreno para las mejoras v1.5/v2 sin reescribir nada.
- Con este documento puedes entregar la feature en 2 semanas (sprint 6-7) y tener claro qué queda para el futuro.
