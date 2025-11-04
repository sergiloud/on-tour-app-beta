# ON TOUR APP 2.0 - Áreas Críticas de Desarrollo

**Documento Estratégico | 3 de noviembre de 2025**

---

## 📌 Introducción

Este documento identifica y analiza las **3 áreas más complejas** del proyecto que requieren máxima atención durante el desarrollo. No son "problemas" sino **desafíos arquitectónicos** que determinarán el éxito o fracaso del proyecto.

---

## 🔄 ÁREA CRÍTICA #1: SINCRONIZACIÓN DE DATOS (60% de la dificultad)

### Problema Central

El proyecto tiene un flujo de datos **multi-capa y asincrónico**:

```
┌──────────────────────────────────────────────────┐
│  USUARIO INTERACTÚA (clicks, input, gestos)     │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  REACT STATE (useState, context)                 │
│  - Flujo: instant, optimistic updates            │
│  - Duración: sesión browser                      │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  REACT QUERY CACHE                               │
│  - Flujo: mutations + invalidations              │
│  - Duración: configurable (default 5 min)        │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  localStorage (showStore.ts)                     │
│  - Flujo: sync en cada setAll()                  │
│  - Duración: persistente (múltiples sesiones)    │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  Backend API (FUTURO)                            │
│  - Flujo: async mutations + server-side caching  │
│  - Duración: indefinida (source of truth)        │
└──────────────────────────────────────────────────┘
```

### Escenarios Problemáticos

#### Escenario 1: Usuario Offline → Online

```
Sesión 1 (Online):
├─ Usuario crea show X en Madrid
├─ showStore.setAll([...]) → localStorage
├─ React Query invalidate
└─ UI actualiza (optimistic)

Usuario va offline (pierde conexión)
└─ SW activa, caché local toma control

Sesión 2 (Offline):
├─ Usuario edita show X (fee 5000 → 6000)
├─ showStore.updateShow() → localStorage
├─ React Query: ❌ NO se invalida (sin conexión)
├─ UI actualiza
└─ Estado local: DIFERENTE al estado último online

Usuario va online (recupera conexión)
└─ ¿Qué ocurre?

POSIBLES ESTADOS:
A) Conflicto: Backend tiene versión original (5000), local tiene 6000
B) Last-write-wins: Se sobrescribe uno u otro
C) Merge automático: ¿Cuál cambio prevalece?
D) Sync fallido: Datos quedan inconsistentes
```

#### Escenario 2: Multi-tab/Multi-dispositivo

```
Tab A (Chrome):
├─ Abre Dashboard
├─ Carga shows: [show1, show2, show3]
└─ React Query key: "shows"

Tab B (Chrome):
├─ Carga página Shows
├─ Carga shows: [show1, show2, show3]
└─ Misma React Query key: "shows"

Usuario en Tab A:
├─ Crea show4
├─ showStore.setAll([...show1-4])
├─ localStorage actualiza
├─ React Query invalidate en Tab A
└─ Tab A actualiza ✅

Usuario mira Tab B:
├─ ❌ Tab B SIGUE MOSTRANDO [show1-3]
├─ React Query cache en Tab B: stale
├─ NO SE ENTEREÓ del nuevo show4 en otra tab
└─ INCONSISTENCIA VISUAL
```

#### Escenario 3: Web Worker + Race Condition

```
Main Thread (UI):
├─ Calcula financiera para 2000 shows
├─ Envía al Web Worker: "computeMargins(shows)"

Web Worker:
├─ Comienza cálculo (toma 500ms)
├─ Itera por todos los shows
└─ Calcula márgenes

Mientras tanto, Main Thread:
├─ Usuario edita 1 show
├─ showStore.updateShow(id, newData)
├─ Modifica array de shows
└─ ⚠️  El Web Worker SIGUE iterando el array viejo

Resultado:
├─ Web Worker termina con datos OBSOLETOS
├─ React Query recibe resultado "stale"
└─ UI muestra números incorrectos
```

---

### Problemas de Sincronización Identificados

| Problema                  | Impacto                          | Severidad | Probabilidad |
| ------------------------- | -------------------------------- | --------- | ------------ |
| Conflictos offline/online | Pérdida de datos o duplicados    | CRÍTICA   | ALTA         |
| Multi-tab desync          | Inconsistencia visual            | ALTA      | ALTA         |
| Race conditions (Worker)  | Cálculos incorrectos             | ALTA      | MEDIA        |
| React Query stale cache   | Datos desactualizados            | MEDIA     | ALTA         |
| localStorage corruption   | Pérdida total de datos           | CRÍTICA   | BAJA         |
| Transacciones abortadas   | Shows parcialmente sincronizados | MEDIA     | MEDIA        |

---

### Estrategia de Solución

#### 1. **Versioning y Timestamps**

Agregar versiones a cada show:

```typescript
type Show = {
  id: string;
  // ... campos existentes
  __version: number; // Incrementa en cada cambio
  __modifiedAt: number; // Timestamp del último cambio
  __modifiedBy: string; // ID del user/sesión
};
```

**Beneficio:** Detectar conflictos y determinar qué cambio es más reciente.

#### 2. **Invalidación Selectiva en React Query**

```typescript
// showStore.ts
private emit() {
  // ... save to localStorage

  // NUEVO: Invalidar React Query
  const queryClient = getQueryClient();
  queryClient.invalidateQueries({
    queryKey: ['shows'],
    refetchType: 'inactive' // Solo refetch si actualmente se usa
  });
}
```

**Beneficio:** Cualquier cambio en showStore automáticamente actualiza React Query.

#### 3. **Listener Cross-Tab con BroadcastChannel**

```typescript
// showStore.ts
private broadcastChannel = new BroadcastChannel('shows-sync');

constructor() {
  // Cuando OTRA tab modifica shows, actualizar esta tab
  this.broadcastChannel.onmessage = (event) => {
    if (event.data.type === 'shows-updated') {
      this.shows = event.data.payload;
      this.emit(); // Notificar listeners locales
    }
  };
}

private emit() {
  // ... existing code

  // Broadcast a otras tabs
  this.broadcastChannel.postMessage({
    type: 'shows-updated',
    payload: this.shows,
    timestamp: Date.now()
  });
}
```

**Beneficio:** Multi-tab sincronización automática sin recargar página.

#### 4. **Web Worker Data Cloning**

```typescript
// Evitar race condition clonando datos
financeWorker.postMessage({
  type: 'compute-margins',
  shows: JSON.parse(JSON.stringify(shows)), // ← DEEP CLONE
  timestamp: Date.now(),
});
```

**Beneficio:** Worker usa copia independiente, no afectada por cambios en main thread.

#### 5. **Optimistic Updates + Rollback**

```typescript
// En useShowsQuery hook
const { mutate: updateShow } = useMutation({
  mutationFn: async patch => {
    return showsService.updateShow(showId, patch);
  },
  onMutate: async patch => {
    // Optimistic: actualizar UI inmediatamente
    await queryClient.cancelQueries({ queryKey: ['shows'] });
    const previous = queryClient.getQueryData(['shows']);

    queryClient.setQueryData(['shows'], old => {
      return old.map(s => (s.id === showId ? { ...s, ...patch, __version: s.__version + 1 } : s));
    });

    return { previous }; // Guardar para rollback
  },
  onError: (err, variables, context) => {
    // Si error, rollback
    if (context?.previous) {
      queryClient.setQueryData(['shows'], context.previous);
    }
    toast.error('Failed to update show');
  },
});
```

**Beneficio:** UI responde inmediatamente, pero se puede revertir si falla.

#### 6. **Conflict Resolution Strategy**

```typescript
// Detectar y resolver conflictos
type SyncConflict = {
  id: string;
  local: Show;
  remote: Show;
  resolution: 'local' | 'remote' | 'merge';
};

function detectConflict(local: Show, remote: Show): boolean {
  return local.__version !== remote.__version && local.__modifiedAt !== remote.__modifiedAt;
}

function resolveConflict(local: Show, remote: Show): Show {
  // Estrategia: más reciente gana (last-write-wins)
  if (local.__modifiedAt > remote.__modifiedAt) {
    return local;
  } else {
    return remote;
  }

  // Alternativa: merge específico por campo
  // if (local.fee !== remote.fee) {
  //   return Math.max(local.fee, remote.fee); // Usar máximo
  // }
}
```

**Beneficio:** Conflictos se resuelven automáticamente según lógica predefinida.

#### 7. **Audit Trail**

```typescript
// Grabar cada cambio para debugging
type AuditLog = {
  timestamp: number;
  action: 'create' | 'update' | 'delete';
  showId: string;
  changes: Record<string, [before: any, after: any]>;
  source: 'ui' | 'worker' | 'backend' | 'offline';
  userId: string;
};

// Guardar en localStorage (o indexedDB)
const AUDIT_KEY = 'shows:audit:log';

export function logAudit(entry: AuditLog) {
  const log = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
  log.push(entry);

  // Mantener solo últimos 1000 entries
  if (log.length > 1000) log.shift();

  localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
}
```

**Beneficio:** Rastrear qué cambió, cuándo y desde dónde para debugging.

---

### Roadmap de Implementación (Sincronización)

```
FASE 1 (Semana 1-2): Base
├─ Agregar __version y __modifiedAt a Show
├─ Configurar React Query invalidation en showStore
└─ Crear tests para versioning

FASE 2 (Semana 3): Cross-Tab
├─ Implementar BroadcastChannel
├─ Sync automático entre tabs
└─ Manejar conflictos básicos (last-write-wins)

FASE 3 (Semana 4): Workers
├─ Asegurar deep clone en Web Workers
├─ Tests para race conditions
└─ Medir performance antes/después

FASE 4 (Semana 5-6): Offline
├─ Implementar optimistic updates
├─ Rollback en error
├─ Merge conflict resolution

FASE 5 (Semana 7): Observabilidad
├─ Audit trail
├─ Logging de sync events
└─ Dashboard de sincronización
```

---

## 💰 ÁREA CRÍTICA #2: COMPLEJIDAD DE CÁLCULOS FINANCIEROS (25% de la dificultad)

### Problema Central

El módulo financiero (features/finance/) gestiona lógica de negocio **muy intrincada**:

```
ENTRADA: 2000 shows con datos variables
    ├─ Monedas diferentes (EUR, USD, GBP, AUD)
    ├─ Comisiones distintas (mgmt%, booking%)
    ├─ Retenciones por país (WHT%)
    ├─ Costos asociados (sound, light, etc)
    └─ Períodos mixtos (mes, trimestre, año)

         ▼

CÁLCULOS:
    ├─ Conversión multi-moneda (con tasas real-time)
    ├─ Deducción de comisiones y retenciones
    ├─ Desglose por ruta (route), venue, promoter
    ├─ Proyecciones (forecast vs. actual)
    ├─ KPIs: run rate, margin, breakeven
    └─ Settlement distribution (artist%, mgmt%, booking%)

         ▼

SALIDA: Reportes financieros coherentes y auditables
```

### Ejemplos de Complejidad Real

#### Ejemplo 1: Cálculo de Net Income

```typescript
// INPUT: Un show confirmado
{
  id: "show-123",
  city: "Madrid",
  country: "ES",
  date: "2025-12-10",
  fee: 10000,
  feeCurrency: "EUR",
  fxRateToBase: 1.0,        // EUR en este caso
  whtPct: 15,               // WHT Spain: 15%
  mgmtAgency: "Management Inc",
  mgmtAgencyPct: 10,        // Management comisión: 10%
  bookingAgency: "Booking Agency",
  bookingAgencyPct: 8,      // Booking comisión: 8%
  costs: [
    { type: "Sound", amount: 500 },
    { type: "Light", amount: 300 },
    { type: "Transport", amount: 200 }
  ]
}

// CÁLCULOS NECESARIOS:

1. Comisiones totales:
   commissions = fee * (mgmtAgencyPct + bookingAgencyPct) / 100
               = 10000 * (10 + 8) / 100
               = 1800

2. Retención de impuestos (aplicada ANTES de comisiones o DESPUÉS?):
   // Opción A: WHT sobre bruto (normal)
   wht = fee * (whtPct / 100) = 10000 * 0.15 = 1500

   // Opción B: WHT sobre neto (después comisiones)
   net_before_wht = fee - commissions = 8200
   wht = net_before_wht * 0.15 = 1230

   // ⚠️  AMBAS OPCIONES SON VÁLIDAS SEGÚN PAÍS

3. Costos totales:
   total_costs = 500 + 300 + 200 = 1000

4. Net final:
   // Variante 1 (WHT sobre bruto):
   net = fee - commissions - wht - total_costs
       = 10000 - 1800 - 1500 - 1000
       = 5700 EUR

   // Variante 2 (WHT sobre neto):
   net = (fee - commissions) - wht - total_costs
       = 8200 - 1230 - 1000
       = 5970 EUR

// OUTPUT: ¿Cuál es correcto? DEPENDE DEL CONTRATO Y PAÍS
```

#### Ejemplo 2: Multi-Moneda

```typescript
// INPUT: 3 shows en diferentes monedas
const shows = [
  { fee: 10000, feeCurrency: 'EUR', fxRateToBase: 1.0 },
  { fee: 12000, feeCurrency: 'USD', fxRateToBase: 0.92 }, // 1 USD = 0.92 EUR
  { fee: 8500, feeCurrency: 'GBP', fxRateToBase: 1.15 }, // 1 GBP = 1.15 EUR
];

// PROBLEMA 1: ¿Qué es la tasa de cambio correcta?
// - Tasa histórica (día del contrato)
// - Tasa actual (día de pago)
// - Promedio del mes

// PROBLEMA 2: ¿Cuándo se convierte?
// A) Al confirmar el show (store fxRateToBase)
// B) Al generar reporte (look up actual rate)
// C) En ambos momentos (comparar diferencia)

// PROBLEMA 3: Errores de redondeo
// EUR total = 10000*1.0 + 12000*0.92 + 8500*1.15
//           = 10000 + 11040 + 9775
//           = 30815 EUR

// Pero si sumas componentes antes:
// 10000 + 11040 + 9775 = 30815 ✅
//
// ¿Qué pasa con 100 shows? ¿Rounding errors se acumulan?
// ⚠️  SÍ, especialmente con tasas como 0.919, 1.0847, etc.
```

#### Ejemplo 3: Settlement Distribution

```typescript
// INPUT: Show con net = 5700 EUR
// Distribuir entre: Artist, Management, Booking

// CONTRATO:
// - Artist: 70% de neto
// - Management: 15% de bruto (fee)
// - Booking: 10% de bruto (fee)
// - Admin fee: 5% de bruto (plataforma)

// CÁLCULOS:
const fee = 10000;
const net = 5700;

const mgmt_share = fee * 0.15 = 1500;
const booking_share = fee * 0.10 = 1000;
const admin_share = fee * 0.05 = 500;
const artist_share = net * 0.70 = 3990;

// VALIDACIÓN: ¿Todo suma?
const total = 1500 + 1000 + 500 + 3990 = 6990
// ❌ PERO: 1500 + 1000 + 500 = 3000 (ya deducido de fee)
//         y artist_share = 3990 (del neto)
//         3000 + 3990 = 6990 > fee (10000) = ❌ INCONSISTENCIA

// CORRECCIÓN: Aclarar dónde se toman comisiones
// Opción A: Comisiones EN ADICIÓN al artist share
// Opción B: Comisiones PARTE DEL settlement (artist recibe menos)
```

#### Ejemplo 4: Agregación y Reportes

```typescript
// INPUT: 500 shows en Q4 2025
// REPORTE SOLICITADO: "Ingresos netos por país"

// LÓGICA:
const breakdown: Record<string, number> = {};

for (const show of shows) {
  const net = calculateNet(show);
  const country = show.country;

  if (!breakdown[country]) {
    breakdown[country] = 0;
  }
  breakdown[country] += net;
}

// PROBLEMA 1: ¿Qué estados incluir?
// - Solo "confirmed"?
// - "confirmed" + "pending"?
// - TODO menos "canceled"?

// PROBLEMA 2: ¿Qué período?
// - Q4 = Oct, Nov, Dec?
// - Q4 = Sep, Oct, Nov?
// - UTC o local timezone del show?

// PROBLEMA 3: Cambios retrospectivos
// Si editas un show del mes anterior:
// - ¿Recalcula reportes previos?
// - ¿Guarda "versiones" de reportes?
```

---

### Riesgos Identificados

| Riesgo                          | Causa                          | Impacto                   | Cómo Detectar          |
| ------------------------------- | ------------------------------ | ------------------------- | ---------------------- |
| Cálculos incorrectos            | Lógica mal implementada        | Pérdida de confianza      | Unit tests exhaustivos |
| Inconsistencias multi-moneda    | Redondeos acumulados           | Errores en reportes       | Auditoria de cifras    |
| Performance con 1000+ shows     | O(n²) algorithms               | UI congelada 5+ segundos  | Profiling con DevTools |
| Conflictos en settlement        | Reglas ambiguas                | Disputas, devoluciones    | Documentación clara    |
| Cambios de tasa FX retroactivos | Backend actualiza tasas viejas | Números cambian sin razón | Audit log de cambios   |

---

### Estrategia de Solución

#### 1. **Separación Clara de Responsabilidades**

```typescript
// features/finance/calculations.ts
export namespace FinanceCalc {
  // Cada función tiene UN solo propósito

  export function calculateGrossIncome(fee: number, currency: string, fxRate: number): number {
    return fee * fxRate; // Convertir a base currency
  }

  export function calculateCommissions(
    fee: number,
    mgmtPct: number,
    bookingPct: number
  ): { management: number; booking: number } {
    return {
      management: fee * (mgmtPct / 100),
      booking: fee * (bookingPct / 100),
    };
  }

  export function calculateWHT(
    amount: number,
    whtPct: number,
    applicationPoint: 'gross' | 'net'
  ): number {
    // applicationPoint: clarifica si WHT se aplica sobre bruto o neto
    return amount * (whtPct / 100);
  }

  export function calculateCosts(costs: Cost[]): number {
    return costs.reduce((sum, c) => sum + c.amount, 0);
  }

  export function calculateNet(params: {
    fee: number;
    fxRate: number;
    commissions: { management: number; booking: number };
    wht: number;
    costs: number;
  }): number {
    return (
      params.fee * params.fxRate -
      params.commissions.management -
      params.commissions.booking -
      params.wht -
      params.costs
    );
  }
}
```

**Beneficio:** Cada función es testeable, documentada y fácil de auditar.

#### 2. **Test Suite Exhaustivo**

```typescript
// src/__tests__/finance.calculations.test.ts

describe('Finance Calculations', () => {
  describe('Net Income Calculation', () => {
    it('should calculate net with WHT on gross', () => {
      const result = FinanceCalc.calculateNet({
        fee: 10000,
        fxRate: 1.0,
        commissions: { management: 1000, booking: 800 },
        wht: 1500, // 15% on 10000
        costs: 1000,
      });

      // 10000 - 1000 - 800 - 1500 - 1000 = 5700
      expect(result).toBe(5700);
    });

    it('should handle multi-currency conversion', () => {
      // 12000 USD con tasa 0.92
      const usdInEur = 12000 * 0.92;
      expect(usdInEur).toBe(11040);
    });

    it('should not have rounding errors with 100 shows', () => {
      const shows = generateTestShows(100);
      const total = shows.reduce((sum, s) => sum + FinanceCalc.calculateNet(s), 0);

      // Verificar que total es número válido (sin Infinity, NaN)
      expect(Number.isFinite(total)).toBe(true);
      expect(total).toBeGreaterThan(0);
    });

    it('should throw error on invalid inputs', () => {
      expect(() => FinanceCalc.calculateWHT(-1000, 15, 'gross')).toThrow();
      expect(() => FinanceCalc.calculateWHT(1000, 150, 'gross')).toThrow(); // > 100%
    });
  });

  describe('Settlement Distribution', () => {
    it('should distribute settlement correctly', () => {
      const settlement = FinanceCalc.settleShow({
        net: 5700,
        fee: 10000,
        artistShare: 0.7, // 70% of net
        mgmtShareOfFee: 0.15, // 15% of fee
        bookingShareOfFee: 0.1,
      });

      // Verificar que suma es correcta
      const total = settlement.artist + settlement.management + settlement.booking;
      expect(total).toBeLessThanOrEqual(10000); // No puede exceder fee
    });
  });

  describe('Multi-currency Aggregation', () => {
    it('should aggregate shows in different currencies', () => {
      const shows = [
        { fee: 10000, feeCurrency: 'EUR', fxRate: 1.0 },
        { fee: 12000, feeCurrency: 'USD', fxRate: 0.92 },
        { fee: 8500, feeCurrency: 'GBP', fxRate: 1.15 },
      ];

      const totalInEur = shows.reduce((sum, s) => sum + s.fee * s.fxRate, 0);

      expect(totalInEur).toBeCloseTo(30815, 0); // Permitir rounding
    });
  });
});
```

**Beneficio:** Casos edge cubiertos, regressions detectados rápidamente.

#### 3. **Configuration-Driven Calculation Rules**

```typescript
// lib/financeConfig.ts
export type FinanceRules = {
  whtApplicationPoint: 'gross' | 'net';
  commissionBasis: 'fee' | 'net';
  roundingStrategy: 'half-up' | 'half-down' | 'banker';
  conversionMethod: 'spot' | 'historical' | 'monthly-avg';
  defaultCurrency: 'EUR' | 'USD' | 'GBP' | 'AUD';
};

export const DEFAULT_RULES: FinanceRules = {
  whtApplicationPoint: 'gross',
  commissionBasis: 'fee',
  roundingStrategy: 'half-up',
  conversionMethod: 'spot',
  defaultCurrency: 'EUR',
};

// Usar en cálculos:
export function calculateNet(show: Show, rules: FinanceRules = DEFAULT_RULES): number {
  // Toda lógica respeta rules
  // Si se cambia regla, recalcula automáticamente
}
```

**Beneficio:** Cambiar reglas de negocio es cuestión de config, no código.

#### 4. **Caching + Versioning de Resultados**

```typescript
// Cache los resultados de cálculos complejos
type CachedFinanceSnapshot = {
  timestamp: number;
  showsVersion: number; // Se invalida si shows cambian
  snapshot: FinanceSnapshot;
  rules: FinanceRules;
};

const cache = new Map<string, CachedFinanceSnapshot>();

export function getFinanceSnapshot(
  shows: Show[],
  rules: FinanceRules = DEFAULT_RULES
): FinanceSnapshot {
  const key = `snapshot-${hashRules(rules)}`;
  const cached = cache.get(key);

  // Invalidar si shows versión cambió
  if (cached && cached.showsVersion === shows.__version) {
    return cached.snapshot;
  }

  // Recalcular
  const snapshot = computeFinanceSnapshot(shows, rules);
  cache.set(key, {
    timestamp: Date.now(),
    showsVersion: shows.__version,
    snapshot,
    rules,
  });

  return snapshot;
}
```

**Beneficio:** No recalcular si datos no cambiaron (performance).

#### 5. **Web Worker para Cálculos Pesados**

```typescript
// workers/financeWorker.ts
self.onmessage = event => {
  const { shows, rules } = event.data;

  // Cálculo pesado en paralelo (no bloquea UI)
  const result = computeFinanceSnapshot(shows, rules);

  self.postMessage({
    type: 'finance-computed',
    payload: result,
    timestamp: Date.now(),
  });
};

// main thread (useFinanceKpis.ts)
const [snapshot, setSnapshot] = useState(null);

useEffect(() => {
  const worker = new Worker('./workers/financeWorker.ts');

  worker.postMessage({
    shows: shows,
    rules: DEFAULT_RULES,
  });

  worker.onmessage = event => {
    setSnapshot(event.data.payload);
  };

  return () => worker.terminate();
}, [shows]);
```

**Beneficio:** UI permanece responsiva incluso con 2000 shows.

#### 6. **Audit Trail de Cambios**

```typescript
// Registrar CADA cambio de cálculo
type FinanceAuditEntry = {
  timestamp: number;
  action: 'calculate' | 'adjust' | 'reverse';
  showId: string;
  before: {
    fee: number;
    net: number;
    commissions: Record<string, number>;
  };
  after: {
    fee: number;
    net: number;
    commissions: Record<string, number>;
  };
  reason?: string; // "user edited fee", "fx rate updated", etc
};

const auditLog: FinanceAuditEntry[] = [];

export function logFinanceChange(entry: FinanceAuditEntry) {
  auditLog.push(entry);
  // Opcionalmente: persistir a localStorage/backend
  localStorage.setItem(
    'finance:audit',
    JSON.stringify(auditLog.slice(-1000)) // Keep last 1000
  );
}
```

**Beneficio:** Debugging y auditoría. Saber exactamente qué cambió y por qué.

---

### Roadmap de Implementación (Finanzas)

```
FASE 1 (Semana 1): Fundamentos
├─ Documentar reglas financieras (WHT, comisiones, etc)
├─ Crear FinanceCalc namespace con funciones puras
└─ Test suite inicial (20+ tests)

FASE 2 (Semana 2): Configuración
├─ FinanceRules configuration
├─ Soportar múltiples "profiles" (artist, agency, etc)
└─ Tests de cambio de configuración

FASE 3 (Semana 3): Performance
├─ Web Worker para cálculos pesados
├─ Caching con invalidación automática
└─ Benchmarks: medir tiempo con 100, 500, 2000 shows

FASE 4 (Semana 4): Observabilidad
├─ Audit trail de cambios
├─ Dashboard de debug (mostrar cálculos paso a paso)
└─ Exportar audit para contabilidad

FASE 5 (Semana 5-6): Integración
├─ Conectar FinanceCalc a UI (Finance.tsx)
├─ React Query queries para snapshots
└─ E2E tests de flujos completos
```

---

## 📊 ÁREA CRÍTICA #3: GESTIÓN DEL ALCANCE (15% de la dificultad)

### Problema Central

El proyecto es **ENORME**. La lista de features es larga:

```
CORE:
├─ Shows (CRUD, tabla, board)        → 2 semanas
├─ Finance (dashboard, KPIs)         → 3 semanas
├─ Travel (vuelos, itinerarios)      → 2 semanas
├─ Calendar (eventos, gestos)        → 1.5 semanas
├─ Auth (login, permisos)            → 1 semana

ADVANCED:
├─ ActionHub (IA, priorización)      → 3 semanas
├─ Maps (visualización geográfica)   → 2 semanas
├─ E-signatures (integración legal)  → 2 semanas
├─ Offline sync                      → 2 semanas
├─ PWA (instalable, push)            → 1 semana

BACKEND (futuro):
├─ API REST                          → 4 semanas
├─ Multi-user collab                 → 2 semanas
├─ Real-time sync (WebSockets)       → 2 semanas
└─ OAuth2 / SSO                      → 1 semana

TOTAL ESTIMADO: 30-35 semanas (~7-8 meses)
```

### Riesgo: Scope Creep

```
Semana 1-2:
User: "¿Podemos añadir este feature?"
Dev: "Claro, es fácil"
Scope: Shows + Finance

Semana 3-4:
Product: "Los usuarios quieren ActionHub"
Dev: "OK, voy a implementar IA"
Scope: Shows + Finance + ActionHub

Semana 5-6:
CEO: "¿Qué tal E-signatures?"
Marketing: "¿Mobile app?"
Investor: "¿Multi-user?"
Dev: 😩 "Estoy quemado"
Scope: TODOOOOO

Resultado:
├─ Features a mitad de camino
├─ Tests incompletos
├─ Deuda técnica acumulada
└─ Burnout del equipo
```

---

### Sub-Área Crítica: ActionHub (Mini-Proyecto)

ActionHub es especialmente peligroso porque parece "simple" pero es **un mini-proyecto de IA por sí solo**:

```
ActionHub Requisitos:
├─ Computar acciones automáticamente
│  ├─ Viaje pronto: "Planning trip for Madrid 2025-12-10?"
│  ├─ Dinero: "5 shows sin pagar este mes"
│  ├─ Contratos: "3 documentos sin firmar"
│  └─ Riesgos: "Weather alert, venue closed"
│
├─ Priorización inteligente
│  ├─ Urgencia (horas/días hasta evento)
│  ├─ Impacto (financiero, reputacional)
│  ├─ Probabilidad (likely to happen)
│  └─ Score combinado
│
├─ Notifications
│  ├─ In-app toast
│  ├─ Browser push
│  ├─ Email (futuro)
│  └─ SMS (futuro)
│
├─ User Preferences
│  ├─ Qué acciones mostrar
│  ├─ Frecuencia de notificaciones
│  ├─ Horario de quieto
│  └─ Canales preferidos
│
├─ Performance
│  ├─ Computar en < 100ms
│  ├─ Soportar 1000+ shows
│  └─ Actualizar en tiempo real
│
└─ Testing
   ├─ 100+ scenarios de prueba
   ├─ Threshold testing (¿cuándo activa alerta?)
   └─ Regression (new features no rompen viejo)
```

**REALIDAD:** ActionHub solo podría ser 2-3 semanas de trabajo.

---

### Estrategia de Solución

#### 1. **MVP (Minimum Viable Product) Definido**

```
FASE 1 (MVP - Semanas 1-4):
├─ Shows: CRUD básico (list view)
├─ Finance: Overview + tabla simple
├─ Auth: Demo (localStorage)
├─ PWA: Service Worker offline básico
└─ NO: ActionHub, E-signatures, Mapas

FASE 2 (Semanas 5-8):
├─ Shows: Board view, drag-drop
├─ Finance: Dashboard completo, Settlement
├─ Travel: Búsqueda de vuelos (Amadeus)
├─ Calendar: Vista mensual
└─ NO: ActionHub aún, E-signatures, Multi-user

FASE 3 (Semanas 9-12):
├─ ActionHub (versión 1, simple)
├─ Maps: Visualización básica
├─ Auth: Roles (admin/manager/viewer)
└─ NO: E-signatures, Real-time collab

FASE 4+ (Backend + Advanced):
├─ E-signatures (HelloSign)
├─ Real-time sync (WebSockets)
├─ Multi-user collaboration
└─ Mobile app
```

**Beneficio:** Ship something working rápido, no todo perfecto.

#### 2. **Feature Flags**

```typescript
// lib/featureFlags.ts
export const FEATURE_FLAGS = {
  SHOWS_LIST: true,
  SHOWS_BOARD: import.meta.env.VITE_STAGE === 'staging',
  FINANCE_DASHBOARD: true,
  FINANCE_SETTLEMENT: import.meta.env.VITE_STAGE === 'staging',
  ACTION_HUB: false,  // ← Disabled until ready
  MAPS: false,
  ESINATURES: false,
  REAL_TIME_SYNC: false
};

// Uso en componentes:
{FEATURE_FLAGS.ACTION_HUB && <ActionHub />}
{FEATURE_FLAGS.MAPS && <MapView />}
```

**Beneficio:** Deploy sin feature, activa cuando esté listo.

#### 3. **Priorización: MoSCoW Framework**

```
MUST (Semanas 1-6):
├─ Shows CRUD
├─ Finance basic overview
├─ Auth login
└─ Offline support

SHOULD (Semanas 7-12):
├─ Shows board view
├─ Finance settlement
├─ Calendar
├─ Travel search
└─ Roles/permissions

COULD (Semanas 13-18):
├─ ActionHub
├─ Maps
├─ Advance analytics
└─ Email integrations

WON'T (Phase 2+):
├─ E-signatures
├─ Multi-org
├─ Mobile apps
├─ AI chatbot
└─ Video conferencing
```

**Beneficio:** Claridad sobre qué hace en cada fase.

#### 4. **Tracking: Burndown Chart**

```
Week 1-2 (Sprint 1):
├─ Shows: 80% complete ✅
├─ Finance: 30% complete ⚠️
├─ Auth: 100% complete ✅
└─ PWA: 60% complete ⚠️

Week 3-4 (Sprint 2):
├─ Shows: 100% complete ✅
├─ Finance: 70% complete ⚠️
├─ Travel search: 30% complete ⚠️
└─ Rethink: Algunas features tomaron más

Heurística:
├─ Si un feature está < 30% a mitad de sprint
│  └─ Revisar si requisitos son más complejos
├─ Si completado > 90% a mitad de sprint
│  └─ Añadir stretch goals o refactor técnico
└─ Si consistently se overrun sprints
   └─ Mejorar estimation (planning poker)
```

**Beneficio:** Ver si estás on track vs. derailing.

#### 5. **Definition of Done (DoD)**

```
Un feature es "DONE" si:
├─ ✅ Código escrito y revisado
├─ ✅ Tests: unit + integration (80%+ coverage)
├─ ✅ E2E tests para flujo principal
├─ ✅ Documentación actualizada
├─ ✅ Performance verificado (< 100ms latency)
├─ ✅ Accesibilidad auditada (WCAG 2.1 AA)
├─ ✅ Internacionalización (en + es)
├─ ✅ Mergeado a main
├─ ✅ Deployado a staging
└─ ✅ QA aprobado

Si falta alguno ➜ NO CUENTA COMO DONE
```

**Beneficio:** No acumular deuda, mantener calidad.

#### 6. **Risk Register**

```
Risk: "ActionHub toma más de 3 semanas"
├─ Probability: MEDIUM
├─ Impact: HIGH (bloquea release)
├─ Mitigation:
│  ├─ Prototipo en semana 1
│  ├─ Comienza mientras Finance avanza
│  └─ Versión simplificada si es necesario

Risk: "API backend no disponible en tiempo"
├─ Probability: MEDIUM
├─ Impact: CRITICAL
├─ Mitigation:
│  ├─ Mockear API desde día 1
│  ├─ No acoplamiento fuerte a backend
│  └─ Plan B: localStorage indefinido

Risk: "Performance degrada con 1000+ shows"
├─ Probability: HIGH
├─ Impact: MEDIUM
├─ Mitigation:
│  ├─ Benchmarking desde inicio
│  ├─ Web Workers para cálculos
│  └─ Virtual scrolling en listas

Risk: "Scope creep + features adicionales"
├─ Probability: VERY HIGH
├─ Impact: HIGH
├─ Mitigation:
│  ├─ Comunicar roadmap claro
│  ├─ No cambios mid-sprint
│  ├─ Usar feature flags
│  └─ Documentar "WON'T" en cada fase
```

**Beneficio:** Anticipar problemas, no improvisación.

---

### Roadmap Macro (Nivel Alto)

```
QUARTER 1 (Weeks 1-12):
├─ MVP: Shows + Finance + Auth
├─ Setup: CI/CD, testing, perf monitoring
├─ Release: Beta a testers internos
└─ Goal: Producto funcional, no pulido

QUARTER 2 (Weeks 13-26):
├─ Advanced features: Travel, Calendar, Maps
├─ Backend API: Setup inicial
├─ Collab: Multi-user basics
└─ Goal: Feature-complete, performance tuned

QUARTER 3 (Weeks 27-40):
├─ Polish: UI/UX refinement
├─ Integrations: Amadeus, HelloSign (betas)
├─ Scaling: Prepara para 100+ users
└─ Goal: Production-ready

QUARTER 4 (Weeks 41-52):
├─ Launch: Release público
├─ Marketing: Campañas, testimonios
├─ Support: Onboarding, docs, training
└─ Goal: Usuarios reales, feedback collection
```

---

## 📋 Resumen de Acciones Inmediatas

### Semana 1: Planificación Ejecutiva

- [ ] Sesión "Scope Alignment": Definir MVP, MUST/SHOULD/COULD
- [ ] Crear riskRegister.json con 20+ riesgos identificados
- [ ] Establecer Definition of Done para equipo
- [ ] Configurar burndown tracking (Jira/Linear/Notion)

### Semana 2-3: Implementación de Sincronización

- [ ] Agregar `__version` y `__modifiedAt` a Show type
- [ ] Integrar BroadcastChannel en showStore
- [ ] Tests para multi-tab sync
- [ ] Documentar estrategia de conflictos

### Semana 4-5: Foundation de Finanzas

- [ ] Documentar reglas financieras (WHT, comisiones, etc)
- [ ] Crear FinanceCalc namespace puro
- [ ] 30+ unit tests para cálculos
- [ ] Web Worker setup para computos pesados

### Semana 6+: Ejecución Disciplinada

- [ ] Sprint 1-4: MVP según roadmap
- [ ] Revisión quincenal de scope vs. plan
- [ ] Comunicación clara: qué está en Q1 vs. Q2+
- [ ] Medir y optimizar: perf, tests, deuda técnica

---

## 📚 Documentación Referencias

**Para profundizar en cada área:**

1. **Sincronización:** Leer `SHOWSTORE_REACT_QUERY_MIGRATION.md`
2. **Finanzas:** Crear `FINANCE_CALCULATION_GUIDE.md`
3. **Scope:** Mantener `ROADMAP.md` actualizado semanalmente

---

**Fin del Documento de Áreas Críticas**

Estos son los **3 pilares** en los que el éxito del proyecto reposa. Atender bien a cada uno = proyecto exitoso. Descuidar uno = caos garantizado.
