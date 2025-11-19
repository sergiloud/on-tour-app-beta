# Timeline Maestro v2 "Mission Control" — Upgrade Plan
**Fecha:** 18 de noviembre de 2025  
**Owner:** Sergi Recio + AI (Copilot + Claude)  
**Scope:** Web/desktop v2 (mobile follow-up)  
**Objetivo:** Transformar Timeline Maestro de feed pasivo a cerebro operativo en tiempo real para tours/agencias.

---

## 1. Meta estratégica
- **Diferenciación absoluta:** primera herramienta que combina vista Gantt interactiva, simulaciones financieras y alertas inteligentes en la misma pantalla.
- **Decisiones en segundos:** tour managers visualizan dependencias críticas, prueban escenarios y ejecutan acciones sin salir del timeline.
- **Integración total:** conecta shows, travel, finanzas, contratos, tareas y mobile para lograr continuidad operativa.

KPIs esperados (post-lanzamiento):
- +35% tiempo promedio en Timeline (engagement)
- +20% upgrades Free → Indie/Pro (feature flag Mission Control)
- -50% incidencias por conflictos de agenda (alertas críticas)
- +25% settlements cerrados en tiempo (quick actions)

---

## 2. Alcance prioritario (versión "brutal" 4-6 semanas)
| Feature | Descripción | Impacto comercial | Estimado (tú + AI) | Prioridad |
|---------|-------------|-------------------|---------------------|-----------|
| **F1 Timeline horizontal (Gantt) + drag & drop** | Vista panorámica de tours con bandas por show/travel. Drag para mover eventos y recalcular dependencias. | "Wow" inmediato; demo seller. | 3-4 semanas | ★★★★★ |
| **F2 Critical Path** | Detección automática de cadena crítica y resaltado en rojo + alerts cuando se rompe. | Seguridad operativa → retiene agencias grandes. | 1-2 semanas (en paralelo) | ★★★★★ |
| **F3 What-if mode** | Botón "Simular" duplica timeline en sandbox, habilita cambios y muestra P&L proyectado con motor WASM/JS. | Conversión directa a planes pagados. | 2-3 semanas | ★★★★★ |
| **F4 Quick actions / deep links** | Hover/click abre card con 3-5 acciones contextuales (liquidar, enviar rider, marcar pago, abrir contrato). | Reduce clicks y muestra integración profunda. | 1 semana | ★★★★☆ |

Total: 4-6 semanas calendar (con trabajo en paralelo y reutilizando código compartido). Resto de features (F5-F8) quedan planificados en backlog v2.1+.

---

## 3. Arquitectura general
1. **Nueva capa de timeline data**
   - Extender `TimelineService` para exponer `timelineGraph` (nodos = eventos, edges = dependencias).
   - Nueva colección `timelineScenarios` (para what-if) con delta respecto a datos reales.
2. **Motor de layout horizontal (LayerCake/uPlot)**
  - **Decisión 2026:** construir directamente sobre stack moderno (LayerCake + uPlot + canvas/HDR). Razones: 60fps con 5.000 eventos, zoom infinito, peso <80 KB gz, estilo glassmorphism tailwind-ready.
  - Arquitectura: `TimelineHorizontalCanvas` monta un canvas uPlot; dnd-kit gestiona drag; LayerCake aporta escalas/zoom sincronizado. vis-timeline queda descartado.
3. **Estado compartido**
   - `timelineStore` (Zustand o Context + Reducer) para sincronizar vista vertical actual y la nueva horizontal.
   - Escenarios/Simulaciones guardados localmente (`whatIfDraft`) y en Firestore (para colaborar) fase posterior.
4. **Motor financiero**
   - Reutilizar WASM actual (JS fallback). Se monta en worker para cálculos rápidos cuando se activa What-if.
5. **Alertas / Critical Path**
   - Grafo dirigido acíclico (DAG) generado de `shows`, `travel`, `tasks`. Algoritmo CPM (Critical Path Method) + heurísticas para slack buffers. Alertas push + UI banner.

---

## 4. Diseño funcional por feature
### F1. Timeline horizontal (Gantt) + drag
- **Vista**: filas por entidad (shows, travel, tasks), eje X = tiempo continuo.
- **Interacciones**: drag para mover start/end; resize handles; zoom scroll (1 día, 1 semana, 1 mes).
- **Sync**: movimientos generan `timelineAdjustments` (optimistic) y disparan modales de confirmación.
- **Componentes**:
  - `TimelineMissionControlPage`
  - `TimelineHorizontalCanvas` (encapsula vis-timeline/dnd-kit)
  - `TimelineMiniMap` (overview / quick navigation)
- **Datos**: necesita `start_ts`, `end_ts`, `duration`, `constraints` (no mover antes de load-in, etc.).

### F2. Critical Path
- **Pipeline**: `computeCriticalPath(events, dependencies)` produce array ordenado.
- **UI**:
  - Resaltado rojo en timeline horizontal.
  - Panel lateral con pasos + buffers.
  - Alertas instantáneas al mover eventos que rompen la cadena.
- **Reglas**: dependencias automáticas (travel → load-in → soundcheck → doors → show → travel siguiente). Configurable por plantilla de tour.

### F3. What-if mode
- **Flujo**:
  1. Botón "Simular" clona estado actual a `scenarioDraft`.
  2. Usuario modifica timeline (drag, duplicar shows, añadir gastos).
  3. Barra inferior muestra P&L proyectado (ingresos esperados, gastos, margen) usando motor WASM.
  4. CTA "Aplicar cambios" → genera diff destacado (shows movidos, fees cambiados) antes de confirmar.
- **Seguridad**: no afecta datos reales hasta confirmar. Option de guardar escenario como "Plan B".

### F4. Conflict Radar (nuevo)
- Panel lateral o barra superior con tabla de conflictos activos.
- Niveles: Critical (rojo), High (ámbar), Medium (amarillo), Low (azul). Ejemplos:
  - Vuelo BCN→MAD llega 18:40 vs load-in 19:00 → CRITICAL.
  - Dos shows el mismo día con 600 km → HIGH.
  - Settlement sin liquidar >30 días → MEDIUM.
  - Hotel no confirmado → LOW.
- Backend: reglas + heurísticas CPM; preparado para ML ligero (v2.2).
- Acciones: pulsar conflicto abre quick action relevante (rebook flight, liquidar show, confirmar hotel).

### F5. Quick actions / deep links
- **UI**: hover/click abre card flotante (Lucide icons, sin emojis) con acciones contextuales:
  - Show: "Ver detalle", "Liquidar", "Enviar rider", "Marcar pago recibido", "Añadir nota".
  - Travel: "Abrir e-ticket", "Compartir itinerario".
- **Infra**: usar metadata ya presente. Integrarse con routers (`navigate('/dashboard/shows/:id')`).
- **Accesibilidad**: keyboard-friendly (Enter abre popover, ←/→ recorre eventos).

### F6. AI Copilot Button (preparado v2.3)
- Botón flotante "Ask AI" dentro de Mission Control.
- Prompt ejemplo: "¿Qué pasa si añado show París 12 mayo fee 15k€?".
- Pipeline: LLM (Claude/Gemini local) consume snapshot timeline + motor WASM para devolver impacto P&L + conflictos.
- Inicialmente mock/respuesta template; habilitar integración real cuando endpoints seguros estén listos.

### F7. Timeline Versions (histórico + diff)
- Cada What-if aplicado guarda versión nombrada ("Plan original", "Festivales verano 26").
- Botón "Compare" muestra diff visual (eventos movidos, fees cambiados, conflictos resueltos).
- Permite revertir/undo global y compartir versiones con agencias.

### Backlog inmediato (v2.1+)
- F8 Alertas predictivas avanzadas (ML).
- F9 Team Pulse sidebar.
- F10 Export PDF Tour Book 1-click.
- F11 Integración mobile.

---

## 5. Plan de entregas (6 semanas)
| Semana | Entregable | Notas |
|--------|------------|-------|
| 1 | Setup Mission Control page + data graph layer + elección LayerCake/uPlot | Encapsular service, preparar dependencias, POC canvas custom. |
| 2 | Timeline horizontal MVP + drag | Canvas 60fps, drag optimista sin persistir. |
| 3 | Persistencia drag + Conflict Radar + Quick actions beta | Radar lateral, acciones contextuales, telemetría. |
| 4 | Critical Path + alertas visuales + tests | Algoritmo CPM + UI rojo + alert manager. |
| 5 | What-if mode + Timeline Versions + barra P&L (JS fallback) | Escenarios locales + versiónado + diff básico. |
| 6 | AI Copilot button (stub), feature flag rollout, video demo + GTM | Preparar prompt pipeline + plan pricing. |

*Paralelo:* Diseño quick actions + copy marketing (semana 1-2), QA continuo con dataset real (200+ eventos).

---

## 6. Dependencias & riesgos
| Riesgo | Mitigación |
|--------|------------|
| Complejidad LayerCake/uPlot | Spike inicial + soporte de claude/copilot, fallback micro-librerías propias si surge bloqueo. |
| CPM requiere datos travel exactos | Forzar plantilla de dependencias por show; permitir overrides manuales. |
| Motor WASM en navegador lento | Usar worker + JS fallback + throttle UI updates. |
| Usuarios confunden modo real vs. simulado | Banner persistente + color distinto + confirm dialog antes de aplicar. |
| Accesibilidad drag | Añadir controls keyboard (botones +/− 15 min, fields en popover). |

---

## 7. Instrumentación y QA
- Nuevos eventos:
  - `timeline_horizontal_opened`, `timeline_drag_completed`, `timeline_critical_alert`, `timeline_simulation_started/completed`, `timeline_quick_action_triggered`.
- Métricas: % usuarios que usan Mission Control, número de simulaciones guardadas, alertas críticas resueltas.
- QA: suite Playwright para drag/critical path, unit tests para `computeCriticalPath`, `scenarioDiff`. Perf test con 2.000 eventos.

---

## 8. Go-to-market
- **Beta diciembre 2025**: agencias friendly (10 cuentas) con feature flag `missionControl`. Retro semanal.
- **Launch enero 2026**: campaña "El timeline más avanzado del mundo" + vídeo demo (drag + what-if + alerts).
- **Pricing / Rollout**:
  - Grupo beta actual: acceso completo gratis 3 meses.
  - Nuevos Indie: vista vertical + Critical Path básico, upsell Mission Control completo.
  - Nuevos Pro/Agency: Mission Control completo con +20 €/mes temporal (descuento fundadores) hasta incluirlo en plan.

---

## 9. Mobile follow-up
- Una vez RN app esté lista (junio 2026), sincronizar subset:
  - Vista vertical con iconos critical path.
  - Swipe para confirmar alertas.
  - Notificaciones push si se rompe cadena crítica.

---

## 10. Próximos pasos inmediatos
1. Crear feature flag `missionControl` + ruta `/dashboard/timeline/mission-control` (sem 0).
2. Spike LayerCake + uPlot + dnd-kit para confirmar elección (<2 días).
3. Definir modelo `timelineDependency` y `timelineScenario` en Firestore/Postgres.
4. Bloquear tiempo en agenda diciembre-enero para foco (sin features externos).
5. Preparar guion/video demo 45s (semana 6) comparando Master Tour vs Mission Control.

Con este plan ejecutas las cuatro mejoras clave en ~6 semanas y conviertes Timeline Maestro en tu arma definitiva frente a Master Tour/Tempo. Luego F5-F8 te dan gasolina para 2026.
