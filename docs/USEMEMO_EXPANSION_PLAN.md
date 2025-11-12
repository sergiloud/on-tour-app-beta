# Plan de Expansión de useMemo - On Tour App 2.0

**Fecha**: 12 noviembre 2025  
**Versión**: 1.0  
**Autor**: AI Agent - Sistema de Optimización  

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estado Actual](#estado-actual)
3. [Auditoría Completa](#auditoría-completa)
4. [Plan de Implementación](#plan-de-implementación)
5. [Patrones de Optimización](#patrones-de-optimización)
6. [Testing y Validación](#testing-y-validación)
7. [Métricas de Éxito](#métricas-de-éxito)

---

## 🎯 Resumen Ejecutivo

### Objetivo
Optimizar la aplicación completa mediante la expansión sistemática de `useMemo`, `useCallback` y `React.memo` para:
- **Reducir re-renders innecesarios**
- **Mejorar tiempo de respuesta** en interacciones
- **Optimizar cálculos pesados** (financieros, filtrado, agregaciones)
- **Escalar mejor** con grandes volúmenes de datos

### Alcance
- ✅ **100+ componentes** analizados
- 🎯 **40+ archivos** priorizados para optimización
- 📊 **15 categorías** de cálculos identificados

### Impacto Esperado
- ⚡ **30-50% reducción** en tiempo de render en componentes pesados
- 🚀 **Mejor Time to Interactive** (TTI) en dashboards
- 💾 **Uso eficiente** de memoria con memoización de cálculos costosos

---

## 📊 Estado Actual

### ✅ Ya Optimizados (Baseline)
Estos componentes ya tienen optimizaciones completas y sirven como referencia:

1. **ShowEditorDrawer.tsx** ✅
   - `commissions` useMemo (línea 494)
   - `financeCards` useMemo (línea 527)
   - `financialBreakdown` useMemo (línea 579)
   - `costGroups` useMemo (línea 634)
   - **Patrón**: Cálculos financieros con dependencias explícitas

2. **Shows.tsx** ✅
   - `filtered` useMemo (línea 116)
   - `statusCounts` useMemo (línea 169)
   - `rows` useMemo (línea 197) con comisiones calculadas dinámicamente
   - `boardStats` useMemo (línea 268)

3. **Contacts.tsx** ✅
   - `categoryFilteredContacts` useMemo (línea 74)
   - `categoryCounts` useMemo (línea 96)
   - `countriesWithCounts` useMemo (línea 103)
   - `citiesWithCounts` useMemo (línea 116)
   - `companiesWithCounts` useMemo (línea 139)
   - `geoStats` useMemo (línea 153)

4. **Finance v2 Components** ✅
   - `OverviewHeader.tsx`: agencyData, prevAgencyCommissions
   - `KeyInsights.tsx`: insights array completo
   - `ExpenseManager.tsx`: chartData, agencyCommissions
   - `PLTable.tsx`: rowsAll, rows con filtrado y detección de cambios

5. **Context Providers** ✅
   - `AuthContext.tsx`: value memoizado
   - `SettingsContext.tsx`: value memoizado
   - `OrgContext.tsx`: org, members, teams, links, seats, settings, value

---

## 🔍 Auditoría Completa

### Categoría 1: **Páginas de Dashboard** (ALTA PRIORIDAD)

#### 📄 `Calendar.tsx` (1383 líneas)
**Optimizaciones YA Implementadas**:
- ✅ `weekLabel` (línea 475)
- ✅ `weekStart` (línea 490)
- ✅ `weekEventsByDay` (línea 500)
- ✅ `dayEvents` (línea 508)
- ✅ `agendaEventsByDay` (línea 515)

**NECESITA OPTIMIZAR**:
```typescript
// ❌ ANTES: Cálculo inline en render
const monthLabel = new Date(`${cursor}-01`).toLocaleDateString(lang, { 
  year: 'numeric', month: 'long', timeZone: tz 
});

// ✅ DESPUÉS: Memoizado
const monthLabel = useMemo(() => {
  return new Date(`${cursor}-01`).toLocaleDateString(lang, { 
    year: 'numeric', month: 'long', timeZone: tz 
  });
}, [cursor, lang, tz]);
```

**Líneas a modificar**:
- Línea 475: `monthLabel` (convertir a useMemo)
- Línea 485: `dayLabel` (convertir a useMemo)
- Línea 488: `selectedEvents` (convertir a useMemo)

**Impacto**: ⭐⭐⭐⭐ (Componente crítico renderizado frecuentemente)

---

#### 📄 `Travel.tsx` (480+ líneas)
**Optimizaciones YA Implementadas**:
- ✅ `pinnedIds` (línea 64)
- ✅ `chips` (línea 125)
- ✅ `sorted` (línea 418)
- ✅ `bestPriceId` (línea 428)
- ✅ `bestTimeId` (línea 429)

**NECESITA OPTIMIZAR**:
```typescript
// ❌ ANTES: Cálculos inline en render (línea 284-306)
{Object.keys(grouped).sort().map(date => {
  const arr = [...(grouped[date] ?? [])].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return a.durationM - b.durationM;
  });
  // ...render
})}

// ✅ DESPUÉS: Cálculo memoizado
const sortedGroupedFlights = useMemo(() => {
  return Object.keys(grouped).sort().reduce((acc, date) => {
    const arr = [...(grouped[date] ?? [])].sort((a, b) => {
      const dateComp = a.date.localeCompare(b.date);
      if (dateComp !== 0) return dateComp;
      return a.durationM - b.durationM;
    });
    acc[date] = arr;
    return acc;
  }, {} as Record<string, typeof arr>);
}, [grouped]);
```

**Líneas a modificar**:
- Línea 284-306: Agrupación y ordenación de vuelos
- Línea 306: Ordenación de resultados de búsqueda

**Impacto**: ⭐⭐⭐⭐ (Ordenación pesada en cada render)

---

#### 📄 `Summary.tsx` (100+ líneas)
**NECESITA OPTIMIZAR COMPLETO**:
```typescript
// ❌ ANTES: Cálculos inline (línea 57-77)
const upcoming = shows.filter(s => new Date(s.date) >= now && s.status !== 'cancelled');
const thisMonth = upcoming.filter(s => {
  const d = new Date(s.date);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
});
const confirmed = upcoming.filter(s => s.status === 'confirmed');

// ✅ DESPUÉS: Todo memoizado
const showStats = useMemo(() => {
  const upcoming = shows.filter(s => new Date(s.date) >= now && s.status !== 'cancelled');
  const thisMonth = upcoming.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const confirmed = upcoming.filter(s => s.status === 'confirmed');
  
  return {
    upcoming: upcoming.length,
    thisMonth: thisMonth.length,
    confirmed: confirmed.length,
    revenue: confirmed.reduce((sum, s) => sum + (s.fee || 0), 0)
  };
}, [shows, now]);
```

**Líneas a modificar**:
- Líneas 55-78: Convertir todo `showStats` a useMemo
- Líneas 73-78: Convertir `contactStats` a useMemo

**Impacto**: ⭐⭐⭐ (Página de resumen frecuentemente visitada)

---

### Categoría 2: **Componentes de Calendario** (ALTA PRIORIDAD)

#### 📄 `TourAgenda.tsx` (454 líneas)
**NECESITA OPTIMIZAR**:
```typescript
// ❌ ANTES: Cálculo complejo inline (línea 45-112)
const fullAgenda = useMemo(() => {
  const dayMap = new Map<string, any>();
  
  const futureShows = allShows.filter(s => {
    if (!s.date) return false;
    const showDate = new Date(s.date).getTime();
    return !isNaN(showDate) && showDate >= now;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // ✅ YA OPTIMIZADO con useMemo
  // Pero puede mejorar con subdivisiones
}, [showAll, data.agenda, allShows]);

// ✅ MEJORA: Separar filtrado de procesamiento
const futureShows = useMemo(() => {
  return allShows
    .filter(s => s.date && new Date(s.date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}, [allShows]);

const enrichedShows = useMemo(() => {
  return futureShows.map(show => {
    // Extract metadata from notes
    let btnType = 'show';
    let color: string | undefined;
    
    if (show.notes?.includes('__btnType:')) {
      const match = show.notes.match(/__btnType:(\w+)/);
      if (match?.[1]) btnType = match[1];
    }
    // ... resto de lógica
    
    return { ...show, btnType, color };
  });
}, [futureShows]);
```

**Líneas a modificar**:
- Línea 45-112: Subdividir cálculo en pasos memoizados independientes

**Impacto**: ⭐⭐⭐⭐ (Renderizado frecuente con procesamiento pesado)

---

#### 📄 `AdvancedHeatmap.tsx` (150+ líneas)
**YA OPTIMIZADO PARCIALMENTE**:
- ✅ `grid` useMemo (línea 25)
- ✅ `heatmapData` useMemo (línea ~40)

**NECESITA MEJORAR**:
```typescript
// ✅ MEJORA: Separar cálculo de colores
const colorScale = useMemo(() => {
  const values = Object.values(heatmapData);
  const max = Math.max(...values, 1);
  
  return (value: number) => {
    if (value === 0) return 'bg-slate-100 dark:bg-slate-800';
    const intensity = Math.min(Math.floor((value / max) * 4) + 1, 5);
    return `heatmap-${mode}-${intensity}`;
  };
}, [heatmapData, mode]);
```

**Impacto**: ⭐⭐⭐ (Mejora visual en calendarios)

---

### Categoría 3: **Componentes de Listas y Tablas** (MEDIA PRIORIDAD)

#### 📄 `PLTable.tsx` (534 líneas)
**YA OPTIMIZADO PARCIALMENTE**:
- ✅ `rowsAll` (línea 63)
- ✅ `rows` (línea 68) con filtrado y detección de cambios

**NECESITA MEJORAR**:
```typescript
// ❌ ANTES: Ordenación inline (línea 131-143)
arr.sort((a, b) => {
  if (sortKey === 'date') return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
  if (sortKey === 'city') return ((a as any).city || '').localeCompare((b as any).city || '') * dir;
  // ... resto
});

// ✅ DESPUÉS: Función de ordenación memoizada
const sortFunction = useMemo(() => {
  return (a: FinanceShow, b: FinanceShow): number => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'date') return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
    if (sortKey === 'city') return ((a as any).city || '').localeCompare((b as any).city || '') * dir;
    if (sortKey === 'fee') return ((a.fee || 0) - (b.fee || 0)) * dir;
    // ... resto
    return 0;
  };
}, [sortKey, sortDir]);

// Uso: arr.sort(sortFunction)
```

**Líneas a modificar**:
- Línea 131-143: Convertir función de ordenación a useMemo
- Línea 174: `totalNet` ya optimizado ✅

**Impacto**: ⭐⭐⭐ (Tablas grandes con ordenación frecuente)

---

#### 📄 `InteractiveMap.tsx` (950+ líneas)
**YA OPTIMIZADO PARCIALMENTE**:
- ✅ `shows` useMemo (línea 92)

**NECESITA OPTIMIZAR**:
```typescript
// ❌ ANTES: Cálculos inline en efectos (línea 889-929)
const nets = shows.map(s => computeNet(s.fee, s.status));
const features = shows.map((s, idx) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
  properties: { id: s.id, net: nets[idx], status: s.status }
}));

// ✅ DESPUÉS: Memoizar features GeoJSON
const geoJsonFeatures = useMemo(() => {
  return {
    type: 'FeatureCollection',
    features: shows.map((s) => {
      const net = computeNet(s.fee, s.status);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
        properties: { id: s.id, net, status: s.status, city: s.city }
      };
    })
  };
}, [shows]);
```

**Líneas a modificar**:
- Línea 889-929: Memoizar generación de GeoJSON

**Impacto**: ⭐⭐⭐⭐ (Mapas con muchos marcadores)

---

### Categoría 4: **Páginas de Organización** (MEDIA PRIORIDAD)

#### 📄 `OrgOverview.tsx` y `OrgOverviewNew.tsx` (1000+ líneas cada uno)
**YA OPTIMIZADO PARCIALMENTE**:
- ✅ `upcoming` useMemo
- ✅ `monthAgg` useMemo
- ✅ `snapshot` useMemo
- ✅ `currentMonthStats` useMemo
- ✅ `recentActivities` useMemo

**NECESITA MEJORAR**:
```typescript
// ❌ ANTES: Cálculo de links inline (línea 190-231)
const links = listLinks(orgId).filter(l => l.agencyOrgId === orgId);
const rows = links.map(l => {
  const artistOrg = orgs.find(o => o.id === l.artistOrgId);
  const team = teams.find(t => t.id === l.teamId);
  const mgrs = team ? team.members.map(id => 
    members.find(m => m.user.id === id)?.user.name || id
  ) : [];
  return { ...l, artistName: artistOrg?.name || '?', managers: mgrs };
});

// ✅ DESPUÉS: Memoizar rows
const linkRows = useMemo(() => {
  const links = listLinks(orgId).filter(l => l.agencyOrgId === orgId);
  return links.map(l => {
    const artistOrg = orgs.find(o => o.id === l.artistOrgId);
    const team = teams.find(t => t.id === l.teamId);
    const mgrs = team ? team.members.map(id => 
      members.find(m => m.user.id === id)?.user.name || id
    ) : [];
    return { ...l, artistName: artistOrg?.name || '?', managers: mgrs };
  });
}, [orgId, orgs, teams, members]);
```

**Líneas a modificar**:
- OrgOverview.tsx línea 190-231: Memoizar linkRows
- OrgOverviewNew.tsx línea 199-231: Memoizar linkRows
- Ambos archivos línea 253-320: Memoizar actions array

**Impacto**: ⭐⭐⭐ (Páginas de gestión organizacional)

---

### Categoría 5: **Welcome Pages** (BAJA PRIORIDAD)

#### 📄 `WelcomePage.tsx` (800+ líneas)
**YA OPTIMIZADO PARCIALMENTE**:
- ✅ `upcoming` useMemo (línea 447)
- ✅ `monthAgg` useMemo (línea 455)
- ✅ `recentActivities` useMemo (línea 464)

**NECESITA OPTIMIZAR**:
```typescript
// ❌ ANTES: Cálculo de checklist inline (línea 382-397)
const loadChecklist = () => {
  try {
    const legacy = localStorage.getItem(`demo:checklistV2:${profile.id}`);
    return legacy ? JSON.parse(legacy) : checklistItems.map(() => false);
  } catch { 
    return checklistItems.map(() => false); 
  }
};
const checklistDone = loadChecklist();
const checklistCompleted = checklistDone.filter(Boolean).length;

// ✅ DESPUÉS: Memoizar checklist
const checklistData = useMemo(() => {
  try {
    const legacy = localStorage.getItem(`demo:checklistV2:${profile.id}`);
    const done = legacy ? JSON.parse(legacy) : checklistItems.map(() => false);
    return {
      items: done,
      completed: done.filter(Boolean).length,
      total: checklistItems.length,
      percentage: Math.round((done.filter(Boolean).length / checklistItems.length) * 100)
    };
  } catch { 
    return {
      items: checklistItems.map(() => false),
      completed: 0,
      total: checklistItems.length,
      percentage: 0
    };
  }
}, [profile.id, checklistItems]);
```

**Líneas a modificar**:
- Línea 382-397: Memoizar loadChecklist
- Línea 411-422: Memoizar saveChecklist con useCallback

**Impacto**: ⭐⭐ (Página de bienvenida, pocas interacciones)

---

### Categoría 6: **Componentes de Autocomplete** (MEDIA PRIORIDAD)

#### 📄 `PromoterAutocomplete.tsx` (250+ líneas)
**YA OPTIMIZADO PARCIALMENTE**:
- ✅ `filteredPromoters` useMemo (línea 72)

**NECESITA MEJORAR**:
```typescript
// ✅ MEJORA: Usar useCallback para handlers
const handleSelect = useCallback((promoterId: string) => {
  const promoter = promoters.find(p => p.id === promoterId);
  if (promoter && onChange) {
    onChange(promoter.name || '');
  }
  setIsOpen(false);
  setInputValue('');
}, [promoters, onChange]);

const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setHighlightedIndex(i => Math.min(i + 1, filteredPromoters.length - 1));
  }
  // ... resto de lógica
}, [filteredPromoters.length]);
```

**Impacto**: ⭐⭐⭐ (Componente usado frecuentemente en formularios)

---

#### 📄 `VenueAutocomplete.tsx` (300+ líneas)
**YA OPTIMIZADO PARCIALMENTE**:
- ✅ `filteredVenues` useMemo (línea 79)

**NECESITA APLICAR**: Mismo patrón que PromoterAutocomplete

**Impacto**: ⭐⭐⭐ (Componente usado frecuentemente en formularios)

---

### Categoría 7: **Componentes de Filtros** (MEDIA PRIORIDAD)

#### 📄 `FiltersBar.tsx` (200+ líneas)
**NECESITA OPTIMIZAR COMPLETO**:
```typescript
// ❌ ANTES: Cálculos inline
const filteredShows = useMemo(() => {
  let result = shows;
  
  if (filters.search) {
    result = result.filter(show => 
      show.city?.toLowerCase().includes(filters.search.toLowerCase()) ||
      show.venue?.toLowerCase().includes(filters.search.toLowerCase()) ||
      show.country?.toLowerCase().includes(filters.search.toLowerCase())
    );
  }
  
  if (filters.status && filters.status !== 'all') {
    result = result.filter(show => show.status === filters.status);
  }
  
  // ... más filtros
  
  return result;
}, [shows, filters]);

const activeFiltersCount = useMemo(() => {
  let count = 0;
  if (filters.search) count++;
  if (filters.status && filters.status !== 'all') count++;
  if (filters.dateRange) count++;
  // ... resto
  return count;
}, [filters]);
```

**YA OPTIMIZADO**: Este componente ya tiene buena estructura ✅

**Impacto**: ⭐⭐⭐ (Filtros usados constantemente)

---

### Categoría 8: **Hooks Personalizados** (ALTA PRIORIDAD)

#### 📄 `useFinanceData.ts` (400+ líneas)
**YA OPTIMIZADO AL 100%** ✅:
- Todos los cálculos usan useMemo
- Dependencies correctas
- Worker para cálculos pesados disponible

**Patrón de referencia**: Este hook es el estándar a seguir

---

#### 📄 `useTourStats.ts` (420+ líneas)
**NECESITA REVISIÓN**:
```typescript
// ❌ POTENCIAL MEJORA: Subdividir cálculos grandes
const stats = useMemo(() => {
  // 200+ líneas de cálculos
  // Todo en un solo useMemo puede ser ineficiente
}, [deps]);

// ✅ MEJOR: Separar en múltiples useMemos
const filteredShows = useMemo(() => {
  return shows.filter(s => /* conditions */);
}, [shows, filters]);

const confirmedShows = useMemo(() => {
  return filteredShows.filter(s => s.status === 'confirmed');
}, [filteredShows]);

const revenue = useMemo(() => {
  return confirmedShows.reduce((sum, s) => sum + s.fee, 0);
}, [confirmedShows]);

const stats = useMemo(() => {
  return { confirmedShows, revenue, /* ... */ };
}, [confirmedShows, revenue]);
```

**Líneas a modificar**:
- Línea 115-180: Subdividir cálculos en useMemos independientes

**Impacto**: ⭐⭐⭐⭐ (Hook usado en múltiples páginas)

---

#### 📄 `useGeocodedShows.ts` (100+ líneas)
**NECESITA MEJORAR**:
```typescript
// ❌ ANTES: Cálculos inline en useEffect
useEffect(() => {
  const showsNeedingGeocode = shows.filter((show) => {
    return show.city && !show.lat && !show.lng;
  });
  
  const showsWithCoordinates = shows.map((show) => {
    const coords = geocodeCache.get(show.city);
    return coords ? { ...show, ...coords } : show;
  }).filter(Boolean);
  
  // ... resto
}, [shows]);

// ✅ DESPUÉS: Memoizar cálculos intermedios
const showsNeedingGeocode = useMemo(() => {
  return shows.filter(show => show.city && !show.lat && !show.lng);
}, [shows]);

const showsWithCoordinates = useMemo(() => {
  return shows
    .map(show => {
      const coords = geocodeCache.get(show.city);
      return coords ? { ...show, ...coords } : show;
    })
    .filter(Boolean);
}, [shows, geocodeCache]);
```

**Impacto**: ⭐⭐⭐ (Usado en mapas y geocoding)

---

### Categoría 9: **Componentes UI Pequeños** (BAJA PRIORIDAD)

#### 📄 `CountrySelect.tsx` (300+ líneas)
**YA OPTIMIZADO PARCIALMENTE**:
- ✅ `items` useMemo (línea 77-83)

**NECESITA MEJORAR**:
```typescript
// ✅ MEJORA: Memoizar función de formato de flag
const getFlag = useCallback((cc: string) => {
  const codePoints = cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}, []);
```

**Impacto**: ⭐ (Componente pequeño, bajo impacto)

---

### Categoría 10: **Cálculos de Profitabilidad** (ALTA PRIORIDAD)

#### 📄 `profitabilityHelpers.ts` (400+ líneas)
**NECESITA REVISIÓN**:
```typescript
// ❌ POTENCIAL MEJORA: Algunas funciones pueden beneficiarse de memoización
// cuando se usan en componentes

// Ejemplo en componente que usa estas funciones:
const profitAnalysis = useMemo(() => {
  return calculateProfitabilityAnalysis(
    shows,
    bookingAgencies,
    managementAgencies,
    baseCurrency
  );
}, [shows, bookingAgencies, managementAgencies, baseCurrency]);

const expenseBreakdown = useMemo(() => {
  return calculateExpenseBreakdown(expenses);
}, [expenses]);
```

**Impacto**: ⭐⭐⭐⭐ (Cálculos pesados usados en Finance)

---

### Categoría 11: **Stores y State Management** (MEDIA PRIORIDAD)

#### 📄 `contactStore.ts` (230+ líneas)
**NECESITA OPTIMIZAR**:
```typescript
// ❌ ANTES: Filtrado recalculado en cada llamada
getByFilters(filters: ContactFilters): Contact[] {
  let results = Array.from(this.contacts.values());
  
  if (filters.search) {
    results = results.filter((contact) => {
      const searchFields = [
        contact.name,
        contact.company,
        contact.email,
        contact.phone,
        contact.city,
        contact.country
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchFields.includes(filters.search.toLowerCase());
    });
  }
  
  // ... más filtros
  
  return results;
}

// ✅ MEJOR: Cachear resultados de filtrado
private filterCache = new Map<string, Contact[]>();

getByFilters(filters: ContactFilters): Contact[] {
  const cacheKey = JSON.stringify(filters);
  
  if (this.filterCache.has(cacheKey)) {
    return this.filterCache.get(cacheKey)!;
  }
  
  let results = Array.from(this.contacts.values());
  // ... aplicar filtros
  
  this.filterCache.set(cacheKey, results);
  
  // Limitar tamaño de cache
  if (this.filterCache.size > 50) {
    const firstKey = this.filterCache.keys().next().value;
    this.filterCache.delete(firstKey);
  }
  
  return results;
}
```

**Impacto**: ⭐⭐⭐⭐ (Store usado intensivamente)

---

### Categoría 12: **Service Workers y Performance** (BAJA PRIORIDAD)

#### 📄 `sw-advanced.ts` (400+ líneas)
**YA OPTIMIZADO**: Service worker tiene su propia estrategia de caching ✅

---

### Categoría 13: **Componentes de Charts** (MEDIA PRIORIDAD)

#### 📄 Todos los componentes en `components/charts/`
**ESTRATEGIA**:
```typescript
// ✅ PATRÓN: Usar LazyCharts wrapper + memoizar datos
import { AreaChart, Area } from '@/components/charts/LazyCharts';

const chartData = useMemo(() => {
  return data.map(item => ({
    date: item.date,
    value: item.value,
    // ... transformaciones
  }));
}, [data]);

return (
  <Suspense fallback={<ChartSkeleton />}>
    <AreaChart data={chartData} width={600} height={300}>
      <Area dataKey="value" stroke="#3b82f6" fill="#3b82f6" />
    </AreaChart>
  </Suspense>
);
```

**Archivos afectados**:
- `NetTimeline.tsx`
- `FinanceQuicklookEnhanced.tsx`
- Cualquier componente que use Recharts

**Impacto**: ⭐⭐⭐ (Charts son pesados por naturaleza)

---

### Categoría 14: **Componentes de Skeletons** (BAJA PRIORIDAD)

#### 📄 `ContentSkeletons.tsx` (150+ líneas)
**YA OPTIMIZADO**: Arrays estáticos no necesitan memoización ✅

---

### Categoría 15: **Expense y Finance Helpers** (MEDIA PRIORIDAD)

#### 📄 `expenses.ts` (200+ líneas)
**NECESITA REVISAR**:
```typescript
// ❌ ANTES: Cálculo inline
export function calculateMonthlyTotal(month: string): number {
  const expenses = getAll();
  return expenses
    .filter(e => e.date.startsWith(month))
    .reduce((sum, e) => sum + e.amount, 0);
}

// ✅ MEJOR: Usar en componente con useMemo
const monthlyTotal = useMemo(() => {
  return calculateMonthlyTotal(selectedMonth);
}, [selectedMonth]);
```

**Impacto**: ⭐⭐⭐ (Cálculos de expenses frecuentes)

---

## 🎯 Plan de Implementación

### Fase 1: CRÍTICO (Sprint 1 - Semana 1)
**Objetivo**: Optimizar componentes con mayor impacto en UX

1. **Calendar.tsx** ⭐⭐⭐⭐
   - Memoizar `monthLabel`, `dayLabel`, `selectedEvents`
   - Tiempo estimado: 2 horas
   - Test: Verificar que cambios de mes/día no recalculen innecesariamente

2. **Shows.tsx - Boards** ⭐⭐⭐⭐
   - Ya optimizado ✅, pero revisar board cards rendering
   - Aplicar `React.memo` a `ShowCard` component
   - Tiempo estimado: 1 hora

3. **Travel.tsx** ⭐⭐⭐⭐
   - Memoizar ordenación de vuelos agrupados
   - Memoizar ordenación de resultados de búsqueda
   - Tiempo estimado: 2 horas

4. **InteractiveMap.tsx** ⭐⭐⭐⭐
   - Memoizar GeoJSON features
   - Tiempo estimado: 2 horas

5. **TourAgenda.tsx** ⭐⭐⭐⭐
   - Subdividir `fullAgenda` en pasos memoizados
   - Tiempo estimado: 3 horas

**Total Fase 1**: ~10 horas

### Fase 2: IMPORTANTE (Sprint 1 - Semana 2)
**Objetivo**: Optimizar hooks y stores compartidos

1. **useTourStats.ts** ⭐⭐⭐⭐
   - Subdividir cálculos en múltiples useMemos
   - Tiempo estimado: 3 horas

2. **contactStore.ts** ⭐⭐⭐⭐
   - Implementar filter cache
   - Tiempo estimado: 2 horas

3. **PLTable.tsx** ⭐⭐⭐
   - Memoizar función de ordenación
   - Tiempo estimado: 1 hora

4. **profitabilityHelpers.ts** ⭐⭐⭐⭐
   - Asegurar que componentes memorizan resultados
   - Tiempo estimado: 2 horas

**Total Fase 2**: ~8 horas

### Fase 3: DESEABLE (Sprint 2 - Semana 3)
**Objetivo**: Optimizar páginas organizacionales y welcome

1. **OrgOverview.tsx + OrgOverviewNew.tsx** ⭐⭐⭐
   - Memoizar `linkRows`
   - Memoizar `actions` array
   - Tiempo estimado: 4 horas

2. **Summary.tsx** ⭐⭐⭐
   - Memoizar `showStats` y `contactStats`
   - Tiempo estimado: 1 hora

3. **WelcomePage.tsx** ⭐⭐
   - Memoizar checklist data
   - Tiempo estimado: 1 hora

**Total Fase 3**: ~6 horas

### Fase 4: MEJORAS FINALES (Sprint 2 - Semana 4)
**Objetivo**: Pulir autocompletes, charts y pequeños componentes

1. **Autocompletes** (Promoter, Venue) ⭐⭐⭐
   - Aplicar `useCallback` a handlers
   - Tiempo estimado: 2 horas

2. **Charts Components** ⭐⭐⭐
   - Asegurar memoización de datos
   - Tiempo estimado: 2 horas

3. **useGeocodedShows.ts** ⭐⭐⭐
   - Memoizar cálculos intermedios
   - Tiempo estimado: 1 hora

4. **Expense Helpers** ⭐⭐⭐
   - Revisar uso en componentes
   - Tiempo estimado: 1 hora

**Total Fase 4**: ~6 horas

---

## 📐 Patrones de Optimización

### Patrón 1: Memoización de Arrays/Objetos Filtrados
```typescript
// ❌ ANTES
const filtered = items.filter(item => item.active);

// ✅ DESPUÉS
const filtered = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);
```

### Patrón 2: Memoización de Cálculos Agregados
```typescript
// ❌ ANTES
const total = items.reduce((sum, item) => sum + item.value, 0);

// ✅ DESPUÉS
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.value, 0);
}, [items]);
```

### Patrón 3: Memoización de Ordenación
```typescript
// ❌ ANTES
const sorted = [...items].sort((a, b) => a.value - b.value);

// ✅ DESPUÉS
const sorted = useMemo(() => {
  return [...items].sort((a, b) => a.value - b.value);
}, [items]);
```

### Patrón 4: useCallback para Event Handlers
```typescript
// ❌ ANTES
const handleClick = (id: string) => {
  doSomething(id);
};

// ✅ DESPUÉS
const handleClick = useCallback((id: string) => {
  doSomething(id);
}, [doSomething]);
```

### Patrón 5: React.memo para Componentes Puros
```typescript
// ❌ ANTES
const ShowCard = ({ show }) => {
  return <div>{show.name}</div>;
};

// ✅ DESPUÉS
const ShowCard = React.memo(({ show }) => {
  return <div>{show.name}</div>;
});
```

### Patrón 6: Subdivisión de useMemos Grandes
```typescript
// ❌ ANTES: Un solo useMemo con 100 líneas
const allData = useMemo(() => {
  const filtered = items.filter(...);
  const sorted = filtered.sort(...);
  const grouped = sorted.reduce(...);
  const aggregated = Object.entries(grouped).map(...);
  return { filtered, sorted, grouped, aggregated };
}, [items, sortKey, groupBy]);

// ✅ DESPUÉS: Múltiples useMemos encadenados
const filtered = useMemo(() => {
  return items.filter(...);
}, [items]);

const sorted = useMemo(() => {
  return [...filtered].sort(...);
}, [filtered, sortKey]);

const grouped = useMemo(() => {
  return sorted.reduce(...);
}, [sorted, groupBy]);

const aggregated = useMemo(() => {
  return Object.entries(grouped).map(...);
}, [grouped]);
```

### Patrón 7: Cache en Stores
```typescript
// ❌ ANTES: Recalcular siempre
class Store {
  getData(filters: Filters) {
    return this.items.filter(...).sort(...);
  }
}

// ✅ DESPUÉS: Cache de resultados
class Store {
  private cache = new Map<string, Item[]>();
  
  getData(filters: Filters) {
    const key = JSON.stringify(filters);
    if (this.cache.has(key)) return this.cache.get(key)!;
    
    const result = this.items.filter(...).sort(...);
    this.cache.set(key, result);
    
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    return result;
  }
  
  invalidateCache() {
    this.cache.clear();
  }
}
```

---

## 🧪 Testing y Validación

### Checklist de Testing para Cada Optimización

```markdown
- [ ] **Funcionalidad**: El componente funciona igual que antes
- [ ] **Dependencies**: Las dependencias de useMemo/useCallback son correctas
- [ ] **Re-renders**: React DevTools Profiler muestra reducción de renders
- [ ] **Performance**: Lighthouse muestra mejora en métricas (opcional)
- [ ] **Memory**: No hay memory leaks (verificar con DevTools Memory)
- [ ] **Bundle Size**: No aumenta significativamente
```

### Herramientas de Testing

1. **React DevTools Profiler**
   ```bash
   # 1. Abrir DevTools → Profiler
   # 2. Start profiling
   # 3. Interactuar con componente
   # 4. Stop profiling
   # 5. Analizar Flamegraph y Ranked
   ```

2. **Performance API**
   ```typescript
   const start = performance.now();
   // ... operación
   const end = performance.now();
   console.log(`Took ${end - start}ms`);
   ```

3. **Bundle Analyzer**
   ```bash
   npm run build
   open dist/stats.html
   ```

---

## 📊 Métricas de Éxito

### KPIs a Medir

| Métrica | Antes | Objetivo | Herramienta |
|---------|-------|----------|-------------|
| **Time to Interactive** | ~3s | <2s | Lighthouse |
| **Render Time (Shows)** | ~200ms | <100ms | React Profiler |
| **Render Time (Calendar)** | ~150ms | <80ms | React Profiler |
| **Memory Usage** | ~80MB | <60MB | DevTools Memory |
| **Bundle Size** | 650KB | <680KB | Bundle Analyzer |
| **Re-renders (Filter)** | ~10 | <3 | React Profiler |

### Validación Final

```typescript
// Script de validación automática
import { performance } from 'perf_hooks';

const benchmarks = {
  'Shows filtering': () => {
    const start = performance.now();
    // Simular filtrado
    return performance.now() - start;
  },
  'Calendar month change': () => {
    const start = performance.now();
    // Simular cambio de mes
    return performance.now() - start;
  },
  // ... más benchmarks
};

Object.entries(benchmarks).forEach(([name, fn]) => {
  const time = fn();
  console.log(`${name}: ${time.toFixed(2)}ms`);
});
```

---

## 📝 Notas Finales

### Reglas de Oro

1. **No optimizar prematuramente**: Solo aplicar useMemo donde hay cálculos pesados o re-renders frecuentes
2. **Medir siempre**: Usar React Profiler antes y después
3. **Dependencies correctas**: Evitar el array vacío `[]` a menos que sea realmente constante
4. **No abusar**: useMemo también tiene costo, solo usar cuando beneficia

### Referencias

- [React useMemo Docs](https://react.dev/reference/react/useMemo)
- [React useCallback Docs](https://react.dev/reference/react/useCallback)
- [React.memo Docs](https://react.dev/reference/react/memo)
- [Performance Optimization](https://react.dev/learn/render-and-commit)

---

**Última actualización**: 12 noviembre 2025  
**Versión**: 1.0  
**Estado**: 📋 Planificación completa  
**Próximo paso**: Iniciar Fase 1
