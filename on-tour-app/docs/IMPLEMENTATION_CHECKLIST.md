# ✅ IMPLEMENTATION CHECKLIST - ÁREAS CRÍTICAS

**Documento:** Checklist ejecutable para las 3 áreas críticas  
**Basado en:** CRITICAL_AREAS_DETAILED.md  
**Última Actualización:** 3 Noviembre 2025  
**Estado:** READY FOR EXECUTION

---

## 📌 INTRODUCCIÓN

Este documento proporciona un **checklist paso a paso** para implementar las soluciones a las 3 áreas críticas:

1. **Sincronización de Datos** (60% de dificultad)
2. **Complejidad de Cálculos Financieros** (25% de dificultad)
3. **Gestión del Alcance** (15% de dificultad)

Cada sección tiene tareas específicas, entregables esperados, y criterios de aceptación.

---

## 🔄 ÁREA 1: SINCRONIZACIÓN DE DATOS

### ✅ FASE 1 (Semana 1-2): Base

**Objetivo:** Agregar versionado y timestamps a Shows, configurar React Query invalidation.

#### 1.1 Actualizar Show Type

- [ ] Abrir `src/types/index.ts`
- [ ] Localizar tipo `type Show = { ... }`
- [ ] Agregar campos:
  ```typescript
  __version: number; // Incrementa en cada cambio
  __modifiedAt: number; // Timestamp del último cambio
  __modifiedBy: string; // ID del user/sesión
  ```
- [ ] Actualizar factory/mocks para incluir estos campos
- [ ] **Criterio de Aceptación:** TypeScript no tiene errores, tests pasan

#### 1.2 Configurar React Query Invalidation en showStore

- [ ] Abrir `src/lib/showStore.ts`
- [ ] Importar: `import { getQueryClient } from '@/hooks/useShowsQuery'`
- [ ] Encontrar método `private emit()`
- [ ] Agregar invalidation:
  ```typescript
  private emit() {
    // ... existing code

    // NUEVO: Invalidar React Query
    try {
      const queryClient = getQueryClient();
      queryClient.invalidateQueries({
        queryKey: ['shows'],
        refetchType: 'inactive'
      });
    } catch (e) {
      console.warn('React Query invalidation failed:', e);
    }
  }
  ```
- [ ] **Criterio de Aceptación:** ShowStore changes trigger React Query updates

#### 1.3 Crear Tests para Versionado

- [ ] Crear `src/__tests__/versioningShowStore.test.ts`
- [ ] Test 1: "Should increment version on updateShow()"
- [ ] Test 2: "Should set \_\_modifiedAt timestamp"
- [ ] Test 3: "Should track \_\_modifiedBy user"
- [ ] Test 4: "Should detect version conflicts (local vs remote)"
- [ ] Run: `npm run test:run` - todos pasan
- [ ] **Criterio de Aceptación:** 4+ tests passing

#### 1.4 Documentar Estrategia de Conflictos

- [ ] Crear `docs/CONFLICT_RESOLUTION_STRATEGY.md`
- [ ] Secciones:
  - What is a conflict (version mismatch)
  - Detection logic (compare \_\_version)
  - Resolution strategies (last-write-wins, merge, manual)
  - Scenarios (offline-to-online, multi-tab, etc)
- [ ] **Criterio de Aceptación:** Documento completo, 300+ líneas

---

### ✅ FASE 2 (Semana 3): Cross-Tab Sync

**Objetivo:** Implementar BroadcastChannel para sincronización entre tabs.

#### 2.1 Mejorar BroadcastChannel en showStore

- [ ] Abrir `src/lib/showStore.ts`
- [ ] Verificar que BroadcastChannel está implementado
- [ ] Agregar timestamp a mensajes:
  ```typescript
  broadcastChannel.postMessage({
    type: 'shows-updated',
    payload: this.shows,
    timestamp: Date.now(),
    version: this.shows.__version,
  });
  ```
- [ ] Manejar mensajes con timestamp para evitar procesamiento antiguo:
  ```typescript
  this.broadcastChannel.onmessage = event => {
    if (event.data.timestamp > this.lastSync) {
      this.shows = event.data.payload;
      this.lastSync = event.data.timestamp;
      this.emit();
    }
  };
  ```
- [ ] **Criterio de Aceptación:** Multi-tab sync funciona sin lag, sin duplicados

#### 2.2 Crear Tests de Multi-Tab Sync

- [ ] Crear `src/__tests__/multiTabSync.integration.test.ts`
- [ ] Test 1: "Should sync updates across tabs"
- [ ] Test 2: "Should not process stale updates"
- [ ] Test 3: "Should handle rapid successive updates"
- [ ] Test 4: "Should handle tab becoming active/inactive"
- [ ] Test 5: "Should resolve conflicts (newer version wins)"
- [ ] Run: `npm run test:run` - todos pasan
- [ ] **Criterio de Aceptación:** 5+ integration tests passing

#### 2.3 Crear Documento de Multi-Tab Sync

- [ ] Crear `docs/MULTITAB_SYNC_GUIDE.md`
- [ ] Secciones:
  - How it works (BroadcastChannel explanation)
  - Event flow diagram
  - Example scenarios (Tab A updates → Tab B sees update)
  - Limitations (same domain only, not WebWorker accessible)
  - Testing (how to test in browser)
- [ ] **Criterio de Aceptación:** Guía completa, 200+ líneas

---

### ✅ FASE 3 (Semana 4): Web Workers

**Objetivo:** Asegurar que Web Workers usan deep clones para evitar race conditions.

#### 3.1 Auditar Web Worker Integration

- [ ] Buscar: `grep -r "postMessage" src/ --include="*.ts*"`
- [ ] Para cada Web Worker usage:
  - [ ] Verificar que datos enviados están clonados
  - [ ] Convertir a: `JSON.parse(JSON.stringify(data))` si es necesario
- [ ] Documentar lista de Workers y sus payloads
- [ ] **Criterio de Aceptación:** Todos los Workers usan deep clone

#### 3.2 Crear Tests de Race Conditions

- [ ] Crear `src/__tests__/webWorkerRaceCondition.test.ts`
- [ ] Test 1: "Should not have stale data when main thread modifies array"
- [ ] Test 2: "Should compute correct results even with concurrent updates"
- [ ] Test 3: "Should handle Worker crash gracefully"
- [ ] Run: `npm run test:run` - todos pasan
- [ ] **Criterio de Aceptación:** 3+ race condition tests passing

#### 3.3 Performance Baseline

- [ ] Ejecutar: `npm run build`
- [ ] Medir tiempo de operación financiera con 100, 500, 1000, 2000 shows
- [ ] Documento: `docs/PERFORMANCE_BASELINE.md`

  ```markdown
  # Performance Baseline (Date: Nov 3, 2025)

  | Shows Count | Calculation Time | Memory Used | FPS (UI Thread) |
  | ----------- | ---------------- | ----------- | --------------- |
  | 100         | 45ms             | 2MB         | 58 fps          |
  | 500         | 120ms            | 8MB         | 50 fps          |
  | 1000        | 220ms            | 15MB        | 45 fps          |
  | 2000        | 410ms            | 25MB        | 35 fps          |
  ```

- [ ] **Criterio de Aceptación:** Baseline documentado

---

### ✅ FASE 4 (Semana 5-6): Offline Support

**Objetivo:** Implementar optimistic updates y rollback en caso de error.

#### 4.1 Mejorar useShowsMutations con Optimistic Updates

- [ ] Abrir `src/hooks/useShowsMutations.ts`
- [ ] Para mutation updateShow:
  ```typescript
  onMutate: async (patch) => {
    // Cancelar queries pendientes
    await queryClient.cancelQueries({ queryKey: ['shows'] });

    // Guardar estado previo
    const previous = queryClient.getQueryData(['shows']);

    // Optimistic update
    queryClient.setQueryData(['shows'], (old) => {
      return old.map(s =>
        s.id === showId
          ? { ...s, ...patch, __version: s.__version + 1 }
          : s
      );
    });

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback en error
    if (context?.previous) {
      queryClient.setQueryData(['shows'], context.previous);
    }
    toast.error('Failed to update show');
  }
  ```
- [ ] **Criterio de Aceptación:** Optimistic updates funcionan, rollback en error

#### 4.2 Crear Tests de Optimistic Updates

- [ ] Crear `src/__tests__/optimisticUpdates.test.ts`
- [ ] Test 1: "Should update UI immediately"
- [ ] Test 2: "Should rollback on error"
- [ ] Test 3: "Should not double-update on success"
- [ ] Test 4: "Should handle offline scenario"
- [ ] Run: `npm run test:run` - todos pasan
- [ ] **Criterio de Aceptación:** 4+ tests passing

#### 4.3 Crear Merge Conflict Resolution

- [ ] Crear función: `src/lib/conflictResolution.ts`
  ```typescript
  export function resolveConflict(local: Show, remote: Show): Show {
    // Last-write-wins strategy
    if (local.__modifiedAt > remote.__modifiedAt) {
      return local;
    } else {
      return remote;
    }
  }
  ```
- [ ] Crear tests: `src/__tests__/conflictResolution.test.ts`
  - Test 1: "Should prefer newer version"
  - Test 2: "Should handle same timestamp (stable)"
  - Test 3: "Should log conflict for audit trail"
- [ ] **Criterio de Aceptación:** Function + 3 tests

#### 4.4 Documentar Offline Flow

- [ ] Crear `docs/OFFLINE_FLOW_GUIDE.md`
- [ ] Incluir:
  - User goes offline diagram
  - Operation queued diagram
  - User goes online → sync diagram
  - Conflict resolution diagram
- [ ] **Criterio de Aceptación:** Documento con diagramas

---

### ✅ FASE 5 (Semana 7): Observabilidad

**Objetivo:** Crear audit trail y logging de sync events.

#### 5.1 Implementar Audit Trail

- [ ] Crear `src/lib/auditLog.ts`

  ```typescript
  type AuditEntry = {
    timestamp: number;
    action: 'create' | 'update' | 'delete';
    showId: string;
    changes: Record<string, [before: any, after: any]>;
    source: 'ui' | 'worker' | 'backend' | 'offline';
    userId: string;
  };

  export function logAudit(entry: AuditEntry) {
    const log = JSON.parse(localStorage.getItem('audit:log') || '[]');
    log.push(entry);
    if (log.length > 1000) log.shift();
    localStorage.setItem('audit:log', JSON.stringify(log));
  }
  ```

- [ ] Integrar en showStore (llamar logAudit en cada cambio)
- [ ] **Criterio de Aceptación:** Cambios de shows quedan registrados

#### 5.2 Crear Dashboard de Sync (Optional Bonus)

- [ ] Crear `src/components/debug/SyncDebugPanel.tsx`
- [ ] Mostrar:
  - Current sync status
  - Events in queue
  - Last sync timestamp
  - Conflicts detected
- [ ] Agregar a DevTools (hidden behind flag)
- [ ] **Criterio de Aceptación:** Debug panel funciona, visible con feature flag

#### 5.3 Crear Tests de Audit Trail

- [ ] Crear `src/__tests__/auditLog.test.ts`
- [ ] Test 1: "Should log create action"
- [ ] Test 2: "Should log update with changes"
- [ ] Test 3: "Should maintain max 1000 entries"
- [ ] Run: `npm run test:run` - todos pasan
- [ ] **Criterio de Aceptación:** 3+ audit log tests passing

#### 5.4 Finalizar Documentación

- [ ] Actualizar `MASTER_INDEX.md` con nuevos docs de sincronización
- [ ] Crear `docs/SYNC_IMPLEMENTATION_SUMMARY.md` (resumen)
- [ ] Link desde `README.md`
- [ ] **Criterio de Aceptación:** Documentación accesible

---

## 💰 ÁREA 2: COMPLEJIDAD DE CÁLCULOS FINANCIEROS

### ✅ FASE 1 (Semana 1): Fundamentos

**Objetivo:** Documentar reglas financieras y crear FinanceCalc namespace puro.

#### 2.1 Documentar Reglas Financieras

- [ ] Crear `docs/FINANCE_RULES_SPECIFICATION.md`
- [ ] Secciones:
  - Comisiones (Management %, Booking %)
  - Retenciones (WHT % por país)
  - Costos asociados (Sound, Light, Transport)
  - Multi-moneda (EUR, USD, GBP, AUD)
  - Settlement distribution (Artist, Management, Booking)
- [ ] Incluir ejemplos reales
- [ ] **Criterio de Aceptación:** Documento 400+ líneas

#### 2.2 Crear FinanceCalc Namespace Puro

- [ ] Abrir `src/lib/financeCalculations.ts`
- [ ] Crear namespace con funciones puras:
  ```typescript
  export namespace FinanceCalc {
    export function calculateGrossIncome(fee: number, fxRate: number): number;
    export function calculateCommissions(fee: number, mgmtPct: number, bookingPct: number);
    export function calculateWHT(amount: number, whtPct: number, applicationPoint: 'gross' | 'net');
    export function calculateCosts(costs: Cost[]): number;
    export function calculateNet(params: { fee; fxRate; commissions; wht; costs }): number;
  }
  ```
- [ ] Cada función debe tener:
  - [ ] JSDoc comment explicativo
  - [ ] Input validation (throw si inválido)
  - [ ] Manejo de edge cases (0, negative, very large)
- [ ] **Criterio de Aceptación:** Todas las funciones puras, sin side effects

#### 2.3 Crear Test Suite (30+ tests)

- [ ] Crear `src/__tests__/financeCalculations.test.ts`
- [ ] Test por cada función principal (5-10 tests cada una)
- [ ] Test de multi-moneda
- [ ] Test de rounding errors
- [ ] Test de edge cases (0, negatives, huge numbers)
- [ ] Run: `npm run test:run` - todos pasan
- [ ] **Criterio de Aceptación:** 30+ tests passing, >80% coverage

---

### ✅ FASE 2 (Semana 2): Configuración

**Objetivo:** Crear FinanceRules configuration para soportar diferentes profiles.

#### 2.1 Crear FinanceRules Configuration

- [ ] Crear `src/lib/financeConfig.ts`

  ```typescript
  export type FinanceRules = {
    whtApplicationPoint: 'gross' | 'net';
    commissionBasis: 'fee' | 'net';
    roundingStrategy: 'half-up' | 'half-down' | 'banker';
    conversionMethod: 'spot' | 'historical' | 'monthly-avg';
    defaultCurrency: 'EUR' | 'USD' | 'GBP' | 'AUD';
  };

  export const DEFAULT_RULES: FinanceRules = { ... };
  ```

- [ ] Crear profiles (artist, agency, mgmt)
- [ ] **Criterio de Aceptación:** Configuration system funciona

#### 2.2 Adaptar FinanceCalc a usar FinanceRules

- [ ] Modificar cada función en FinanceCalc para aceptar `rules` parámetro
- [ ] Implementar lógica condicional basada en rules
- [ ] Mantener backward compatibility (default rules si no especificado)
- [ ] **Criterio de Aceptación:** FinanceCalc respeta configuration

#### 2.3 Crear Tests de Configuración

- [ ] Crear `src/__tests__/financeConfig.test.ts`
- [ ] Test 1: "Should use different rounding strategies"
- [ ] Test 2: "Should apply WHT at correct point"
- [ ] Test 3: "Should support multiple profiles"
- [ ] Run: `npm run test:run` - todos pasan
- [ ] **Criterio de Aceptación:** 3+ configuration tests

---

### ✅ FASE 3 (Semana 3): Performance

**Objetivo:** Implementar caching y Web Worker para cálculos pesados.

#### 3.1 Implementar Caching

- [ ] Crear `src/lib/financeCache.ts`

  ```typescript
  type CachedSnapshot = {
    timestamp: number;
    showsVersion: number;
    snapshot: FinanceSnapshot;
    rules: FinanceRules;
  };

  const cache = new Map<string, CachedSnapshot>();

  export function getFinanceSnapshot(
    shows: Show[],
    rules: FinanceRules = DEFAULT_RULES
  ): FinanceSnapshot {
    const key = `snapshot-${hashRules(rules)}`;
    const cached = cache.get(key);

    if (cached && cached.showsVersion === shows.__version) {
      return cached.snapshot;
    }

    const snapshot = computeFinanceSnapshot(shows, rules);
    cache.set(key, { timestamp: Date.now(), showsVersion: shows.__version, snapshot, rules });
    return snapshot;
  }
  ```

- [ ] **Criterio de Aceptación:** Cache funciona, invalidación automática

#### 3.2 Crear Web Worker para Finanzas

- [ ] Crear `src/workers/financeWorker.ts`
- [ ] Implementar: receive shows → compute → send result
- [ ] **Criterio de Aceptación:** Worker funciona sin bloquear UI

#### 3.3 Medir Performance

- [ ] Crear benchmark: 100, 500, 1000, 2000 shows
- [ ] Comparar: sin cache vs con cache
- [ ] Comparar: main thread vs Web Worker
- [ ] Documento: `docs/FINANCE_PERFORMANCE_REPORT.md`
- [ ] **Criterio de Aceptación:** 50%+ mejora con caching + worker

---

### ✅ FASE 4 (Semana 4): Observabilidad

**Objetivo:** Crear audit trail y logging de cambios financieros.

#### 4.1 Implementar Finance Audit Trail

- [ ] Crear `src/lib/financeAuditLog.ts`
- [ ] Log cada cálculo: fee → net transformation
- [ ] Incluir: timestamp, show, before/after, reason
- [ ] Mantener últimos 1000 cambios
- [ ] **Criterio de Aceptación:** Cambios registrados

#### 4.2 Crear Tests

- [ ] Crear `src/__tests__/financeAuditLog.test.ts`
- [ ] Test 1: "Should log calculation changes"
- [ ] Test 2: "Should maintain max entries"
- [ ] Run: `npm run test:run` - todos pasan
- [ ] **Criterio de Aceptación:** 2+ tests passing

#### 4.3 Crear Debug Dashboard (Optional)

- [ ] Crear `src/components/debug/FinanceDebugPanel.tsx`
- [ ] Mostrar: último cálculo paso a paso
- [ ] Mostrar: configuración activa
- [ ] Mostrar: audit trail reciente
- [ ] **Criterio de Aceptación:** Debug info disponible

---

### ✅ FASE 5 (Semana 5-6): Integración

**Objetivo:** Conectar FinanceCalc a UI y crear E2E tests.

#### 5.1 Integración en Finance Dashboard

- [ ] Abrir `src/components/finance/FinanceDashboard.tsx`
- [ ] Usar `getFinanceSnapshot(shows, rules)` en lugar de cálculos inline
- [ ] Verificar que dashboard refresca cuando shows cambian
- [ ] **Criterio de Aceptación:** Dashboard funciona con nuevo system

#### 5.2 Crear E2E Tests

- [ ] Crear `e2e/finance/calculations.spec.ts`
- [ ] Test 1: "Should calculate net income correctly"
- [ ] Test 2: "Should handle multi-currency"
- [ ] Test 3: "Should generate settlement correctly"
- [ ] Run: `npm run e2e` - todos pasan
- [ ] **Criterio de Aceptación:** 3+ E2E tests passing

#### 5.3 Documentación Final

- [ ] Crear `docs/FINANCE_IMPLEMENTATION_COMPLETE.md`
- [ ] Actualizar `MASTER_INDEX.md`
- [ ] Link desde `README.md`
- [ ] **Criterio de Aceptación:** Documentación accesible

---

## 📊 ÁREA 3: GESTIÓN DEL ALCANCE

### ✅ FASE 1: MVP Definition

#### 3.1 Definir MVP Claro

- [ ] Documento: `docs/MVP_DEFINITION.md`
- [ ] Secciones:
  - What is included (MUST haves)
  - What is NOT included (WON'T for FASE 1)
  - Timeline estimate
  - Success metrics
- [ ] **Criterio de Aceptación:** MVP claramente definido

#### 3.2 Crear MoSCoW Breakdown

- [ ] Documento: `docs/MOSCOW_BREAKDOWN.md`
- [ ] **MUST** (Semanas 1-6): Features críticas
- [ ] **SHOULD** (Semanas 7-12): Features importantes
- [ ] **COULD** (Semanas 13-18): Features nice-to-have
- [ ] **WON'T** (Phase 2+): Features futuros
- [ ] **Criterio de Aceptación:** Priorización clara

---

### ✅ FASE 2: Feature Flags

#### 3.3 Implementar Feature Flags

- [ ] Crear `src/lib/featureFlags.ts`
  ```typescript
  export const FEATURE_FLAGS = {
    SHOWS_LIST: true,
    SHOWS_BOARD: import.meta.env.VITE_STAGE === 'staging',
    FINANCE_DASHBOARD: true,
    ACTION_HUB: false,
    MAPS: false,
    ESIGNATURES: false,
  };
  ```
- [ ] Usar en componentes: `{FEATURE_FLAGS.ACTION_HUB && <ActionHub />}`
- [ ] **Criterio de Aceptación:** Features pueden activarse/desactivarse

---

### ✅ FASE 3: Tracking & Monitoring

#### 3.4 Crear Burndown Tracking

- [ ] Documento: `docs/BURNDOWN_TRACKING.md`
- [ ] Semana 1-2: Progress snapshot
- [ ] Semana 3-4: Progress snapshot
- [ ] Identifica trends (on track vs. derailing)
- [ ] **Criterio de Aceptación:** Tracking setup completo

#### 3.5 Definir Definition of Done

- [ ] Documento: `docs/DEFINITION_OF_DONE.md`
- [ ] Checklist completo
- [ ] Debe incluir: code, tests, docs, perf, a11y, i18n, QA
- [ ] **Criterio de Aceptación:** DoD clara, 15+ items

---

### ✅ FASE 4: Risk Management

#### 3.6 Crear Risk Register

- [ ] Documento: `docs/RISK_REGISTER.md`
- [ ] 20+ riesgos identificados
- [ ] Para cada riesgo: probability, impact, mitigation
- [ ] **Criterio de Aceptación:** Registro completo

#### 3.7 Planificar Mitigaciones

- [ ] Para cada riesgo de alta probabilidad:
  - [ ] Escribir plan de mitigación específico
  - [ ] Asignar owner
  - [ ] Establecer triggers para activar mitigation
- [ ] **Criterio de Aceptación:** Planes listos para ejecutar

---

## 📋 RESUMEN DE ENTREGABLES

### Documentos a Crear

- [ ] `CONFLICT_RESOLUTION_STRATEGY.md`
- [ ] `MULTITAB_SYNC_GUIDE.md`
- [ ] `PERFORMANCE_BASELINE.md`
- [ ] `OFFLINE_FLOW_GUIDE.md`
- [ ] `SYNC_IMPLEMENTATION_SUMMARY.md`
- [ ] `FINANCE_RULES_SPECIFICATION.md`
- [ ] `FINANCE_PERFORMANCE_REPORT.md`
- [ ] `FINANCE_IMPLEMENTATION_COMPLETE.md`
- [ ] `MVP_DEFINITION.md`
- [ ] `MOSCOW_BREAKDOWN.md`
- [ ] `BURNDOWN_TRACKING.md`
- [ ] `DEFINITION_OF_DONE.md`
- [ ] `RISK_REGISTER.md`

### Código a Crear/Modificar

- [ ] Actualizar Show type con versionado
- [ ] Mejorar React Query invalidation
- [ ] Mejorar BroadcastChannel sync
- [ ] Crear tests de sincronización (20+ tests)
- [ ] Crear FinanceCalc namespace (30+ tests)
- [ ] Implementar caching y Web Worker
- [ ] Crear audit logs
- [ ] Implementar feature flags

### Tests a Pasar

- [ ] Sincronización: 20+ tests
- [ ] Finanzas: 30+ tests
- [ ] Total nuevo: 50+ tests (llevaría total a 450+)

---

## 🎯 TIMELINE ESTIMADO

| Fase | Área                    | Duración  | Tareas |
| ---- | ----------------------- | --------- | ------ |
| 1    | Sincronización: Base    | 2 semanas | 4      |
| 2    | Sincronización: Sync    | 1 semana  | 2      |
| 3    | Sincronización: Workers | 1 semana  | 2      |
| 4    | Sincronización: Offline | 2 semanas | 2      |
| 5    | Sincronización: Observe | 1 semana  | 4      |
| 1    | Finanzas: Base          | 1 semana  | 3      |
| 2    | Finanzas: Config        | 1 semana  | 3      |
| 3    | Finanzas: Perf          | 1 semana  | 3      |
| 4    | Finanzas: Observe       | 1 semana  | 3      |
| 5    | Finanzas: Integrate     | 2 semanas | 3      |
| 1    | Scope: MVP              | 1 semana  | 2      |
| 2    | Scope: Flags            | 1 semana  | 1      |
| 3    | Scope: Tracking         | 1 semana  | 2      |
| 4    | Scope: Risk             | 1 semana  | 2      |

**TOTAL: 21 SEMANAS (~5 meses)**

---

## ✅ CÓMO USAR ESTE DOCUMENTO

1. **Seleccionar Área:** Enfocarse en una área a la vez
2. **Seguir Fases:** Completar cada fase antes de pasar a la siguiente
3. **Checkear Items:** Marcar [ ] a medida que completas
4. **Validar Criterios:** Asegurar que criterio de aceptación se cumple
5. **Crear Tests:** Tests deben pasar antes de marcar completo
6. **Documentar:** Cada fase debe tener documentación asociada

---

**Documento creado:** 3 Noviembre 2025  
**Status:** READY FOR EXECUTION
