# 🔴 TypeScript Strict Mode - Action Plan

**Fecha:** 12 de noviembre de 2025  
**Total de Errores:** ~80 errores detectados  
**Estrategia:** Corrección incremental por prioridad

---

## 📊 ANÁLISIS DE ERRORES

### Categorización por Tipo

**1. `any` Implícito (TS7006)** - 🔴 Alta Prioridad
- `src/lib/multiTabSync.ts(91,29)`: Parameter 'error' implicitly has an 'any' type
- `src/__tests__/dashboard/ItineraryWidget.tsx(86,24)`: Parameter 'event' implicitly has an 'any' type
- `src/sw-advanced.ts`: Multiple event handlers sin tipos

**2. Possibly `undefined` (TS2532, TS18048)** - 🟡 Media Prioridad
- `src/__tests__/advancedSync.test.ts`: Multiple "Object is possibly 'undefined'"
- `src/lib/financeHelpers.ts(76,7)`: Object is possibly 'undefined'
- `src/lib/testDates.ts(39,22)`: 'dateOnly' is possibly 'undefined'

**3. Type Mismatch (TS2345, TS2322)** - 🟡 Media Prioridad
- `src/components/dashboard/TourOverviewPro.tsx(191,57)`: string | undefined → string
- `src/components/finance/FinancialDistributionChart.tsx`: Multiple undefined issues
- `src/features/shows/editor/ShowEditorDrawer.tsx(390,41)`: string | undefined → string

**4. Missing Properties (TS2739, Show type)** - 🟢 Baja Prioridad (Tests)
- Multiple tests missing `__version`, `__modifiedAt`, `__modifiedBy`

**5. Module Not Found (TS2307)** - 🔴 Alta Prioridad
- `src/components/dashboard/FinanceQuicklookEnhanced.tsx`: Cannot find module './ThisMonth'
- `src/hooks/useOfflineMutation.ts`: Cannot find module '@/lib/offlineManager'

**6. Service Worker Types (TS2339)** - 🟡 Media Prioridad
- `src/sw-advanced.ts`: addEventListener, skipWaiting no existen en type

---

## 🎯 PLAN DE CORRECCIÓN

### Fase 1: Módulos Faltantes (Crítico - 1 hora)

**1. FinanceQuicklookEnhanced.tsx**
```typescript
// ❌ ANTES
import ThisMonth from './ThisMonth';
import StatusBreakdown from './StatusBreakdown';
import NetTimeline from './NetTimeline';
import Pipeline from './Pipeline';

// ✅ DESPUÉS
// Opción A: Crear los módulos faltantes
// Opción B: Comentar temporalmente
// Opción C: Usar imports condicionales
```

**2. useOfflineMutation.ts**
```typescript
// ❌ ANTES
import { offlineManager } from '@/lib/offlineManager';

// ✅ DESPUÉS
// Crear src/lib/offlineManager.ts o eliminar feature incompleta
```

### Fase 2: Parámetros `any` Implícito (Crítico - 2 horas)

**multiTabSync.ts**
```typescript
// ❌ ANTES
channel.onerror = (error) => {
  console.error('[MultiTabSync] Channel error', error);
};

// ✅ DESPUÉS
channel.onerror = (error: ErrorEvent) => {
  console.error('[MultiTabSync] Channel error', error);
};
```

**sw-advanced.ts**
```typescript
// ❌ ANTES
self.addEventListener('install', (event) => {
  // ...
});

// ✅ DESPUÉS
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event: ExtendableEvent) => {
  // ...
});
```

**ItineraryWidget.tsx**
```typescript
// ❌ ANTES
onClick={(event) => { /* ... */ }}

// ✅ DESPUÉS
onClick={(event: React.MouseEvent<HTMLButtonElement>) => { /* ... */ }}
```

### Fase 3: Possibly `undefined` (Media - 3 horas)

**Patrón de corrección:**
```typescript
// ❌ ANTES
function doSomething(value: string | undefined) {
  return value.toUpperCase(); // Error: possibly undefined
}

// ✅ DESPUÉS - Opción 1: Non-null assertion (usar con cuidado)
function doSomething(value: string | undefined) {
  return value!.toUpperCase();
}

// ✅ DESPUÉS - Opción 2: Nullish coalescing (preferido)
function doSomething(value: string | undefined) {
  return (value ?? '').toUpperCase();
}

// ✅ DESPUÉS - Opción 3: Early return
function doSomething(value: string | undefined) {
  if (!value) return '';
  return value.toUpperCase();
}

// ✅ DESPUÉS - Opción 4: Optional chaining
function doSomething(value: string | undefined) {
  return value?.toUpperCase() ?? '';
}
```

**Archivos prioritarios:**
1. `src/lib/financeHelpers.ts` (2 errores)
2. `src/lib/testDates.ts` (2 errores)
3. `src/components/finance/FinancialDistributionChart.tsx` (2 errores)
4. `src/features/shows/editor/ShowEditorDrawer.tsx` (1 error crítico)

### Fase 4: Test Fixes (Baja - 2 horas)

**Show type helpers:**
```typescript
// src/__tests__/helpers/mockShow.ts
export const createMockShow = (partial: Partial<Show> = {}): Show => ({
  id: 'test-id',
  city: 'Test City',
  country: 'ES',
  lat: 40.4168,
  lng: -3.7038,
  date: '2025-12-01',
  fee: 1000,
  status: 'confirmed',
  __version: 1,
  __modifiedAt: Date.now(),
  __modifiedBy: 'test-user',
  ...partial,
});

// Usar en tests:
const mockShow = createMockShow({ city: 'Madrid' });
```

---

## 🚀 IMPLEMENTACIÓN

### Prioridad 1: Módulos Faltantes (HOY)

**Archivos a revisar:**
- [ ] `src/components/dashboard/FinanceQuicklookEnhanced.tsx`
- [ ] `src/hooks/useOfflineMutation.ts`
- [ ] `src/lib/designSystem/hooks.ts`
- [ ] `src/components/dashboard/index.ts`

**Acciones:**
1. Verificar si los módulos existen con nombres diferentes
2. Crear stubs si son features incompletas
3. Comentar imports si son features deprecadas

### Prioridad 2: Service Worker Types (HOY)

**Archivo:** `src/sw-advanced.ts`

```typescript
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

interface SyncEvent extends ExtendableEvent {
  tag: string;
}

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    // ...
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    // ...
  );
});

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

### Prioridad 3: Parámetros `any` (MAÑANA)

**Archivos:**
- [ ] `src/lib/multiTabSync.ts`
- [ ] `src/components/dashboard/ItineraryWidget.tsx`

### Prioridad 4: Possibly `undefined` (ESTA SEMANA)

**Estrategia:** 10 errores por día

**Día 1:**
- [ ] `src/lib/financeHelpers.ts`
- [ ] `src/lib/testDates.ts`
- [ ] `src/components/finance/FinancialDistributionChart.tsx`

**Día 2:**
- [ ] `src/features/shows/editor/ShowEditorDrawer.tsx`
- [ ] `src/components/dashboard/TourOverviewPro.tsx`
- [ ] `src/lib/eventSpanCalculator.ts`

**Día 3:**
- [ ] `src/hooks/useCalendarEvents.ts`
- [ ] Tests en `src/__tests__/advancedSync.test.ts`

---

## 📋 CHECKLIST DE PROGRESO

### ✅ Completado
- [x] Análisis inicial de errores
- [x] Categorización por tipo y prioridad
- [x] Plan de acción documentado

### 🔄 En Progreso
- [ ] Fase 1: Módulos faltantes (0/4)
- [ ] Fase 2: Parámetros `any` (0/3)
- [ ] Fase 3: Possibly `undefined` (0/20)
- [ ] Fase 4: Test fixes (0/10)

### 🎯 Objetivo Final
**Meta:** 0 errores en modo strict  
**Timeline:** 1 semana  
**Estado actual:** ~80 errores  
**Progreso:** 0%

---

## 🔗 Referencias

- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Service Worker Types](https://github.com/Microsoft/TypeScript/blob/main/src/lib/webworker.generated.d.ts)

---

## 📝 Log de Cambios

**12 Nov 2025**
- ✅ Análisis inicial completado
- ⏳ Iniciando Fase 1: Módulos faltantes

