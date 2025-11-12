# 📊 Auditoría de Rendimiento - Versión Beta

**Fecha**: 12 de noviembre de 2025  
**Objetivo**: Identificar cuellos de botella y optimizar para 10 usuarios beta  
**Estado**: 🔴 Requiere Optimizaciones Críticas

---

## 🎯 Resumen Ejecutivo

### ⚠️ Problemas Críticos Detectados

1. **Bundle Size Excesivo**
   - `heavy-BfAMCbjo.js`: **1,972.39 kB** (1.93 MB) ⚠️ CRÍTICO
   - `index-utZ6PApw.js`: **823.21 kB** (803 kB)
   - `firebase-BJFa6tZ1.js`: **372.90 kB**
   - `charts-DiN7wOA6.js`: **372.88 kB**
   - `vendor-B2E_nXQd.js`: **222.78 kB**
   - **Total inicial estimado**: ~3.7 MB sin compresión

2. **Importaciones Mezcladas**
   - `i18n.ts`: Importado estática Y dinámicamente por 86 componentes
   - `Login.tsx`: Importado estática Y dinámicamente
   - `hybridContactService.ts`: Importado estática Y dinámicamente
   - `hybridVenueService.ts`: Importado estática Y dinámicamente
   - **Impacto**: Código duplicado, chunks mal optimizados

3. **Lazy Loading Inefectivo**
   - Rutas críticas (Calendar, Shows, Finance) ya lazy
   - ❌ Pero código común se carga duplicado debido a imports mixtos

---

## 📦 Análisis de Bundle Size (Producción)

### Chunks Grandes (>50 kB)

| Archivo | Tamaño | Categoría | Prioridad |
|---------|--------|-----------|-----------|
| `heavy-BfAMCbjo.js` | 1,972.39 kB | ❌ CRÍTICO | P0 |
| `index-utZ6PApw.js` | 823.21 kB | ⚠️ Alto | P0 |
| `Calendar-DNtQ3pFG.js` | 183.57 kB | ⚠️ Alto | P1 |
| `ui-BCVgDBV0.js` | 158.54 kB | ⚠️ Medio | P1 |
| `Shows-0jPoZ4ad.js` | 67.41 kB | ✅ OK | P2 |
| `TravelWorkspacePage-C6UXtoKQ.js` | 67.24 kB | ✅ OK | P2 |
| `TravelV2-BNq7vjCx.js` | 56.99 kB | ✅ OK | P2 |
| `ProfileSettings-CfA3TFIC.js` | 56.41 kB | ✅ OK | P2 |
| `Contacts-DiSnIg_t.js` | 56.38 kB | ✅ OK | P2 |
| `FinanceV2-BiBEL-mn.js` | 54.80 kB | ✅ OK | P2 |
| `LandingPage-KkTJQzNt.js` | 50.04 kB | ✅ OK | P2 |

### Librerías Externas

| Librería | Tamaño | Optimización |
|----------|--------|--------------|
| `firebase-BJFa6tZ1.js` | 372.90 kB | ⚠️ Revisar tree-shaking |
| `charts-DiN7wOA6.js` | 372.88 kB | ⚠️ Considerar lazy load |
| `vendor-B2E_nXQd.js` | 222.78 kB | ✅ Aceptable |

---

## 🔍 Cuellos de Botella Identificados

### 1. Carga Inicial

#### Problema
- **Bundle inicial**: ~3.7 MB (sin gzip)
- **Estimado con gzip**: ~1.2 MB
- **Tiempo de carga en 3G**: ~15-20 segundos ❌
- **Tiempo de carga en 4G**: ~4-6 segundos ⚠️
- **Tiempo de carga en WiFi**: ~1-2 segundos ✅

#### Causa Raíz
1. **heavy.js masivo (1.97 MB)**:
   - Contiene MapLibre GL (map rendering)
   - Posiblemente Chart.js o Recharts completo
   - Excel export (xlsx library)
   - PDF generation (jspdf)
   - Otros componentes pesados sin lazy load

2. **i18n.ts duplicado**:
   - 86 archivos lo importan estáticamente
   - Login.tsx lo importa dinámicamente
   - Resultado: código duplicado en múltiples chunks

3. **Services duplicados**:
   - `hybridContactService.ts` y `hybridVenueService.ts` tienen el mismo problema
   - Importados por contextos (estático) y por componentes lazy (dinámico)

### 2. Interacciones Lentas (Hipótesis)

#### Filtros de Finance
- **Problema potencial**: Recalculaciones sin debounce
- **Componentes afectados**: TransactionsTab, BudgetsTab, ProjectionsTab
- **Verificar**: Si filtros causan re-renders masivos

#### Calendar
- **Problema potencial**: 183 kB es grande para un calendario
- **Causa probable**: Componentes de drag & drop, librería de eventos
- **Verificar**: Si cambios de vista causan lag

#### Travel Search
- **Problema potencial**: Búsqueda de vuelos sin debounce/throttle
- **Verificar**: API calls excesivos

---

## 🎯 Plan de Optimización (Priorizado)

### 🔴 P0: Crítico (Implementar ANTES de Beta)

#### 1. Dividir `heavy.js` (1.97 MB → <500 kB)

**Acción**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar MapLibre (solo para Travel/Mission Control)
          'maplibre': ['maplibre-gl'],
          
          // Separar charts (solo para Finance)
          'charts': ['recharts', 'chart.js'],
          
          // Separar Excel/PDF export (solo al exportar)
          'export-libs': ['xlsx', 'jspdf', 'jspdf-autotable'],
          
          // Core de Firebase
          'firebase-core': ['firebase/app', 'firebase/auth'],
          
          // Firestore separado
          'firebase-firestore': ['firebase/firestore'],
          
          // UI components grandes
          'ui-heavy': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs'
          ]
        }
      }
    }
  }
});
```

**Impacto esperado**: Reducir bundle inicial de 3.7 MB a ~800 kB

#### 2. Corregir Importaciones Mixtas de `i18n.ts`

**Problema actual**:
```typescript
// ❌ 86 archivos hacen esto:
import { t } from 'src/lib/i18n';

// ❌ Login.tsx hace esto:
const i18n = await import('src/lib/i18n');
```

**Solución**:
```typescript
// src/lib/i18n.ts - Mantener export estático
export { t, setLanguage, getLanguage, languages };

// Eliminar dynamic imports de Login.tsx
// Si se necesita lazy load, crear un wrapper específico
```

**Impacto esperado**: Eliminar duplicación de código, reducir ~50 kB

#### 3. Lazy Load de MapLibre

**Acción**:
```typescript
// src/components/mission/InteractiveMap.tsx
import { lazy, Suspense } from 'react';

const MapLibreMap = lazy(() => import('./MapLibreMap'));

export const InteractiveMap = () => (
  <Suspense fallback={<MapSkeleton />}>
    <MapLibreMap />
  </Suspense>
);
```

**Impacto esperado**: Reducir bundle inicial ~150 kB

#### 4. Lazy Load de Charts

**Acción**:
```typescript
// src/components/finance/NetTimeline.tsx
import { lazy, Suspense } from 'react';

const RechartsTimeline = lazy(() => import('./RechartsTimeline'));

export const NetTimeline = () => (
  <Suspense fallback={<ChartSkeleton />}>
    <RechartsTimeline />
  </Suspense>
);
```

**Impacto esperado**: Reducir bundle inicial ~200 kB

### ⚠️ P1: Alto (Implementar DURANTE Beta)

#### 5. Comprimir Calendar.tsx (183 kB)

**Análisis**:
```bash
# Verificar qué está inflando Calendar
npm run build -- --mode=analyze
```

**Posibles optimizaciones**:
- Lazy load de `CalendarToolbar`, `EventChip`, `DraggableEventButtons`
- Separar drag & drop en chunk aparte
- Usar `React.memo()` en componentes hijos

#### 6. Implementar Code Splitting para UI Components

**Acción**:
```typescript
// src/lib/codeSplitting.tsx
export const LazyDialog = lazyLoad(() => import('@radix-ui/react-dialog'));
export const LazySelect = lazyLoad(() => import('@radix-ui/react-select'));
export const LazyTabs = lazyLoad(() => import('@radix-ui/react-tabs'));
```

#### 7. Tree Shaking de Firebase

**Acción**:
```typescript
// Verificar imports, usar solo lo necesario
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc } from 'firebase/firestore';
// ❌ NO: import * as firebase from 'firebase';
```

### ✅ P2: Medio (Post-Beta)

#### 8. Prefetch Inteligente
- Ya implementado en `src/routes/prefetch.ts`
- ✅ Verificar que funciona correctamente

#### 9. Service Worker para Cache
- Implementar PWA caching strategy
- Cache de assets estáticos
- Cache de API responses

#### 10. Image Optimization
- Lazy load de imágenes
- WebP format
- Responsive images

---

## ⚡ Métricas de Rendimiento Objetivo

### Carga Inicial (First Contentful Paint)

| Red | Actual | Objetivo | Status |
|-----|--------|----------|--------|
| WiFi | ~1-2s | <1s | ⚠️ Mejorar |
| 4G | ~4-6s | <2s | ❌ Optimizar |
| 3G | ~15-20s | <5s | ❌ Crítico |

### Interacciones (Time to Interactive)

| Acción | Objetivo | Verificación |
|--------|----------|--------------|
| Click en botón | <50ms | ⏳ Pendiente |
| Filtro de Finance | <100ms | ⏳ Pendiente |
| Cambio de vista en Calendar | <150ms | ⏳ Pendiente |
| Búsqueda de vuelos | <200ms | ⏳ Pendiente |
| Abrir modal | <100ms | ⏳ Pendiente |

### Bundle Size

| Métrica | Actual | Objetivo | Status |
|---------|--------|----------|--------|
| Initial JS | ~3.7 MB | <1 MB | ❌ |
| Initial CSS | 343 kB | <200 kB | ⚠️ |
| Chunk promedio | ~30 kB | <50 kB | ✅ |
| Largest chunk | 1,972 kB | <500 kB | ❌ |

---

## 🛠️ Herramientas de Medición

### 1. Lighthouse (Chrome DevTools)
```bash
# Performance, Accessibility, Best Practices, SEO
npm run build
npm run preview
# Abrir Chrome DevTools > Lighthouse > Analyze
```

### 2. Bundle Analyzer
```bash
npm run analyze-bundle
# Genera visualización de chunks
```

### 3. React DevTools Profiler
```typescript
// Wrap componentes sospechosos
import { Profiler } from 'react';

<Profiler id="Calendar" onRender={logRender}>
  <Calendar />
</Profiler>
```

### 4. Performance API
```typescript
// src/lib/performance.ts
export function measureInteraction(name: string, fn: () => void) {
  performance.mark(`${name}-start`);
  fn();
  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);
  
  const measure = performance.getEntriesByName(name)[0];
  console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
}
```

---

## 📋 Checklist de Implementación

### Antes del Beta Release

- [ ] **P0.1**: Implementar `manualChunks` en Vite config
- [ ] **P0.2**: Corregir importaciones mixtas de `i18n.ts`
- [ ] **P0.3**: Lazy load de MapLibre
- [ ] **P0.4**: Lazy load de Charts (Recharts)
- [ ] **P0.5**: Verificar tree-shaking de Firebase
- [ ] **P0.6**: Build y verificar que `heavy.js` < 500 kB
- [ ] **P0.7**: Test de carga en red lenta (3G throttling)

### Durante Beta (Monitoreo)

- [ ] **P1.1**: Instrumentar con Performance API
- [ ] **P1.2**: Lighthouse audit de cada página crítica
- [ ] **P1.3**: React Profiler en Calendar, Finance, Shows
- [ ] **P1.4**: Identificar componentes con >50ms render time
- [ ] **P1.5**: Implementar debounce en filtros de Finance
- [ ] **P1.6**: Implementar throttle en búsqueda de Travel

### Post-Beta (Mejoras Continuas)

- [ ] **P2.1**: Service Worker para cache
- [ ] **P2.2**: Image optimization (WebP)
- [ ] **P2.3**: Code splitting de UI components
- [ ] **P2.4**: Prefetch de rutas en idle time
- [ ] **P2.5**: Lazy load de componentes grandes (>20 kB)

---

## 📊 Feedback Visual: Estado Actual

### ✅ Loading States Existentes
- `RouteLoading` en transiciones de página
- `DashboardSkeleton`, `FinanceSkeleton`, `ShowsSkeleton`, etc.
- Spinners en modales y formularios

### ⚠️ Loading States a Revisar
- [ ] TransactionsTab al aplicar filtros
- [ ] BudgetsTab al cambiar período
- [ ] Calendar al cambiar vista (Month/Week/Day)
- [ ] Travel al buscar vuelos
- [ ] Shows al cargar lista grande

### ❌ Loading States Faltantes
- [ ] Export a Excel (puede tardar 2-3s con muchos datos)
- [ ] Export a PDF
- [ ] Batch operations (marcar múltiples shows)
- [ ] Sync con Firestore (si hay lag de red)

---

## 🎯 Próximos Pasos Inmediatos

1. **Ahora**: Implementar manual chunks en Vite config (15 min)
2. **Hoy**: Corregir importaciones mixtas de i18n.ts (30 min)
3. **Hoy**: Lazy load de MapLibre y Charts (1 hora)
4. **Mañana**: Build, test, y verificar mejoras (2 horas)
5. **Mañana**: Instrumentar Performance API (1 hora)
6. **Esta semana**: Lighthouse audits y optimizaciones P1 (4 horas)

---

## 📝 Notas Adicionales

### Consideraciones de UX
- **Feedback inmediato**: Cualquier acción debe tener respuesta visual <50ms
- **Skeletons**: Preferir skeletons a spinners (menos "jarring")
- **Optimistic UI**: Actualizar UI antes de que server responda
- **Error boundaries**: Manejar fallos de chunks lazy sin romper la app

### Trade-offs
- **Bundle size vs. Latency**: Aceptable tener chunks pequeños aunque haya más requests
- **Lazy load vs. UX**: No lazy load en rutas críticas (Dashboard, Finance)
- **Prefetch vs. Bandwidth**: Solo prefetch en WiFi, no en 3G/4G (usar Network Information API)

### Riesgos
- **Manual chunks** puede romper hot reload en dev → verificar
- **Lazy load excesivo** puede causar "waterfall" de requests → limitar a componentes >50 kB
- **Tree shaking** mal configurado puede aumentar bundle → revisar imports

---

**Última actualización**: 12 de noviembre de 2025  
**Responsable**: GitHub Copilot + Sergi Recio  
**Estado**: 🔴 Requiere Acción Inmediata
