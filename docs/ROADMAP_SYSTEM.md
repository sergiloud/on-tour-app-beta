# 🗺️ Sistema de Roadmap Inteligente - Resumen Completo

## 📋 ¿Qué es el Roadmap?

El **Roadmap** es una vista de planificación temporal tipo **Gantt/Timeline** (estilo Notion) que muestra **todos los eventos del tour** (shows, viajes, contratos, finanzas) en una línea de tiempo horizontal interactiva.

---

## 🎯 Características Principales

### ✅ **Vista Gantt Timeline Profesional**
- **Diseño Notion-style**: Tabla de 2 columnas (Evento | Timeline)
- **Barras horizontales** que se extienden según la duración del evento
- **Grid semanal/mensual** con líneas verticales para orientación
- **Color-coded por status**:
  - 🟢 **Verde (Emerald)**: Confirmados
  - 🔵 **Azul**: Pendientes
  - 🔴 **Rojo**: Cancelados
  - 🟣 **Púrpura**: Completados
  - ⚫ **Gris**: Borradores

### 🔍 **Zoom Inteligente (3 niveles)**
```
📅 DÍA    → 20px/día  → Vista detallada con días individuales
📆 SEMANA → 8px/día   → Vista balanceada (por defecto)
📊 MES    → 3px/día   → Vista panorámica para largos períodos
```

### 📂 **Agrupación Flexible**
- **Sin agrupar**: Lista plana de todos los eventos
- **Por mes**: Agrupa eventos por mes de inicio
- **Por estado**: Agrupa por confirmed/pending/cancelled/etc
- **Por tipo**: Agrupa por show/travel/finance/task/milestone

### 🎨 **Iconos por Tipo de Evento**
```
🎵 Show      → Conciertos/presentaciones
✈️ Travel    → Vuelos/transporte
💰 Finance   → Transacciones/pagos
📋 Task      → Tareas/to-dos
🎯 Milestone → Hitos importantes
🚀 Release   → Lanzamientos
```

### 🧠 **Rango de Fechas Inteligente**
El sistema es **inteligente** y calcula automáticamente:
- ✅ **Encuentra el evento más antiguo** de todos tus shows
- ✅ **Encuentra el evento más futuro**
- ✅ **Agrega padding**: 1 mes antes y 1 mes después
- ✅ **Muestra TODOS los eventos**: pasados, presentes y futuros

**Ejemplo**: Si tienes shows desde enero 2024 hasta diciembre 2025, el timeline mostrará **diciembre 2023 → enero 2026**.

### 🎬 **Animaciones Suaves**
- **Animación progresiva**: Las barras aparecen de izquierda a derecha con delay escalonado
- **Hover effects**: Las barras crecen y se elevan al pasar el mouse
- **Transiciones fluidas**: Easing suave tipo Notion (`[0.16, 1, 0.3, 1]`)

### 📍 **Indicador "HOY"**
- Línea roja vertical que marca el día actual
- Auto-scroll al día de hoy al cargar la página
- Dot rojo en la parte superior + badge "HOY"

### 💡 **Tooltips Ricos**
Al hacer hover sobre una barra, muestra:
```
Nombre del evento
Fecha inicio → Fecha fin
X días de duración
Estado: confirmed/pending/etc
```

### 📊 **Información Adaptativa**
Las barras muestran más o menos información según su ancho:
- **< 80px**: Solo color
- **80-120px**: Nombre del evento
- **120-160px**: Nombre + duración en días
- **> 160px**: Nombre + duración + fee (si aplica)

---

## 🏗️ Arquitectura del Sistema

### **1. Servicios de Datos** (`RoadmapDataService.ts`)

#### Función: `showsToRoadmapNodes(shows: Show[])`
Convierte shows del usuario en nodos de roadmap:

```typescript
{
  id: "show-123",
  type: "show",  // ✅ SIEMPRE "show", nunca "milestone"
  title: "Concierto Barcelona",
  description: "Barcelona, España @ Razzmatazz",
  status: "confirmed",
  priority: "high", // basado en fee
  startDate: "2025-12-20T00:00:00Z",
  endDate: "2025-12-21T00:00:00Z",
  location: {
    city: "Barcelona",
    venue: "Razzmatazz",
    coordinates: [41.3851, 2.1734]
  },
  metadata: {
    showId: "show-123",
    fee: 5000,
    cost: 1200,
    progress: 100  // confirmado = 100%
  }
}
```

**Lógica de Conversión**:
- ✅ **Tipo**: Todos los shows son tipo `"show"` (nunca milestone)
- ✅ **Status mapping**:
  - `confirmed` → `confirmed`
  - `pending` → `pending`
  - `canceled` → `cancelled`
  - `offer/archived/postponed` → `draft`
- ✅ **Priority basado en fee**:
  - `fee > €5000` → `high`
  - `fee > €2000` → `medium`
  - `fee <= €2000` → `low`
- ✅ **Progress**:
  - `confirmed` → 100%
  - `pending` → 50%
  - `offer` → 25%
  - `otros` → 10%

#### Función: `contractsToRoadmapNodes(contracts: Contract[])`
Convierte contratos en nodos de roadmap (tipo `finance`).

#### Función: `generateRoadmapData(options)`
**Función principal** que orquesta todo:
1. ✅ Carga shows reales del usuario (Firestore/LocalStorage)
2. ✅ Carga contratos del usuario
3. ✅ Convierte a formato RoadmapNode
4. ✅ Genera dependencias inteligentes entre eventos
5. ✅ Retorna `{ nodes, dependencies, metadata }`

### **2. Store de Estado** (`roadmapStoreV2.ts`)

Zustand store con immer para estado inmutable:

```typescript
{
  nodes: RoadmapNode[],           // Todos los nodos
  filteredNodes: RoadmapNode[],   // Nodos filtrados
  dependencies: Dependency[],     // Relaciones entre nodos
  isLoading: boolean,
  error: string | null,
  activeFilters: {
    status: string[],
    type: string[],
    priority: string[]
  }
}
```

**Acciones principales**:
- `fetchRoadmap()`: Carga datos reales del usuario
- `applyFilters()`: Filtra nodos según criterios
- `startSimulation()`: Inicia modo simulación
- `confirmSimulation()`: Guarda cambios simulados

**⚠️ Bug crítico CORREGIDO**:
```typescript
// ❌ ANTES (no funcionaba):
set(state => {
  state.activeFilters.status = [];
  state.applyFilters(); // ❌ No se ejecuta en draft
});

// ✅ AHORA (correcto):
set(state => {
  state.activeFilters.status = [];
});
get().applyFilters(); // ✅ Se ejecuta después del set
```

### **3. Componente Gantt Timeline** (`GanttTimeline.tsx`)

**Props**:
```typescript
{
  nodes: RoadmapNode[],
  startDate: Date,  // Calculado inteligentemente
  endDate: Date     // Calculado inteligentemente
}
```

**Estado interno**:
```typescript
const [zoomLevel, setZoomLevel] = useState<'day' | 'week' | 'month'>('week');
const [groupBy, setGroupBy] = useState<'none' | 'month' | 'status' | 'type'>('month');
const [hoveredNode, setHoveredNode] = useState<string | null>(null);
```

**Cálculos clave**:
```typescript
// Configuración dinámica según zoom
const config = {
  day:   { dayWidth: 20, showWeeks: true },
  week:  { dayWidth: 8,  showWeeks: true },
  month: { dayWidth: 3,  showWeeks: false }
};

// Posición de cada barra
const getBarPosition = (node) => {
  const daysFromStart = differenceInDays(nodeStart, timelineStart);
  const duration = differenceInDays(nodeEnd, nodeStart) + 1;
  return {
    left: daysFromStart * config.dayWidth,
    width: duration * config.dayWidth,
    duration
  };
};
```

**Estructura HTML**:
```
┌─────────────────────────────────────────────┐
│ TOOLBAR: [Día|Semana|Mes] [Agrupar: v]     │
├──────────────┬──────────────────────────────┤
│ HEADER       │ MESES                        │
│ "Evento"     │ Nov 2025 | Dic 2025 | ...   │
├──────────────┼──────────────────────────────┤
│              │ S47 S48 S49 ... (semanas)    │
├──────────────┼──────────────────────────────┤
│ 🎵 Show 1    │ ████████ (barra horizontal)  │
│ 🎵 Show 2    │     ███████████              │
│ ✈️ Travel    │ ██                           │
│ ...          │ ...                          │
└──────────────┴──────────────────────────────┘
              │ (línea roja "HOY")
```

### **4. Página Principal** (`RoadmapPageV2.tsx`)

**Responsabilidades**:
- ✅ Carga datos al montar: `fetchRoadmap()`
- ✅ Calcula rango inteligente de fechas
- ✅ Gestiona filtros locales (búsqueda + tipo)
- ✅ Toggle entre vista Gantt y Lista
- ✅ Muestra estadísticas (total, confirmados, pending, upcoming)
- ✅ Modo simulación (preview cambios antes de guardar)

**Filtrado local** (no interfiere con el store):
```typescript
const displayNodes = useMemo(() => {
  let filtered = filteredNodes;
  
  // Búsqueda por texto
  if (searchQuery) {
    filtered = filtered.filter(node =>
      node.title.includes(searchQuery) ||
      node.description?.includes(searchQuery)
    );
  }
  
  // Filtro por tipo
  if (selectedFilter !== 'all') {
    filtered = filtered.filter(node => node.type === selectedFilter);
  }
  
  return filtered;
}, [filteredNodes, searchQuery, selectedFilter]);
```

**Rango inteligente**:
```typescript
const { timelineStart, timelineEnd } = useMemo(() => {
  if (filteredNodes.length === 0) {
    // Sin eventos: 1 mes atrás, 6 meses adelante
    return {
      timelineStart: startOfMonth(addMonths(new Date(), -1)),
      timelineEnd: endOfMonth(addMonths(new Date(), 6))
    };
  }

  // Encontrar min/max de todos los eventos
  const allDates = filteredNodes.flatMap(node => [
    new Date(node.startDate),
    node.endDate ? new Date(node.endDate) : new Date(node.startDate)
  ]);

  const earliest = new Date(Math.min(...allDates));
  const latest = new Date(Math.max(...allDates));

  // Agregar padding de 1 mes a cada lado
  return {
    timelineStart: startOfMonth(addMonths(earliest, -1)),
    timelineEnd: endOfMonth(addMonths(latest, 1))
  };
}, [filteredNodes]);
```

---

## 🎨 Sistema de Diseño

### **Colores (Dashboard-consistent)**
```css
bg-slate-950         /* Fondo principal */
bg-slate-900         /* Headers, toolbars */
bg-slate-800         /* Botones, inputs */
border-white/10      /* Bordes principales */
border-white/5       /* Bordes sutiles */
text-white/90        /* Texto principal */
text-white/60        /* Texto secundario */
text-white/40        /* Texto terciario */
```

### **Barras de Timeline**
```typescript
confirmed:  bg-emerald-600 border-emerald-500
pending:    bg-blue-600 border-blue-500
cancelled:  bg-red-600/70 border-red-500
completed:  bg-purple-600 border-purple-500
draft:      bg-slate-600 border-slate-500
```

### **Dimensiones**
```
TASK_NAME_WIDTH = 320px   (columna fija de nombres)
ROW_HEIGHT = 48px         (altura de cada fila)
DAY_WIDTH = 8px (week)    (escala por defecto)
```

---

## 🔧 Flujo de Datos

```
1. Usuario abre /dashboard/roadmap
   ↓
2. RoadmapPageV2 se monta
   ↓
3. useEffect ejecuta fetchRoadmap()
   ↓
4. roadmapStoreV2 llama a RoadmapDataService.generateRoadmapData()
   ↓
5. RoadmapDataService:
   - Carga shows de Firestore/LocalStorage
   - Carga contratos
   - Convierte a RoadmapNode[]
   - Genera dependencias
   ↓
6. Store actualiza: nodes, filteredNodes, dependencies
   ↓
7. RoadmapPageV2 calcula:
   - timelineStart/End (inteligente)
   - displayNodes (filtrado local)
   ↓
8. GanttTimeline renderiza:
   - Header con meses
   - Sub-header con semanas
   - Rows con barras horizontales
   - Línea "HOY"
   ↓
9. Usuario interactúa:
   - Zoom (día/semana/mes)
   - Agrupar (mes/status/tipo)
   - Hover (tooltips)
   - Scroll horizontal
```

---

## 📊 Estadísticas Calculadas

```typescript
stats = {
  totalNodes: 37,        // Total de eventos
  confirmed: 25,         // Shows confirmados
  pending: 8,            // Shows pendientes
  upcoming: 30           // Eventos futuros
}
```

---

## 🚀 Mejoras Implementadas

### ✅ **Bug Fix: Shows confirmados NO son milestones**
**Antes**: `type: show.status === 'confirmed' ? 'milestone' : 'show'`  
**Ahora**: `type: 'show'` (siempre)

### ✅ **Bug Fix: applyFilters en immer draft**
**Antes**: `state.applyFilters()` dentro de `set()` (no funciona)  
**Ahora**: `get().applyFilters()` después de `set()` (funciona)

### ✅ **Rango inteligente de fechas**
**Antes**: Fijo 6 meses hacia adelante  
**Ahora**: Dinámico desde primer evento hasta último + padding

### ✅ **Títulos limpios**
**Antes**: `"Show - Venue"` o `"Show - City"`  
**Ahora**: `"Nombre del show"` + `"City, Country @ Venue"` en descripción

### ✅ **Coordenadas opcionales**
**Antes**: `[lat, lng]` siempre (podía ser `[undefined, undefined]`)  
**Ahora**: `coordinates: lat && lng ? [lat, lng] : undefined`

### ✅ **Venue en location**
**Antes**: Solo city en description  
**Ahora**: `location.venue` separado + en description

---

## 🎯 Estado Actual del Roadmap

### ✅ **V3 - Interactive Command Center**
- [x] ✅ **SCROLL ARREGLADO** - Container único con overflow-auto
- [x] ✅ **DRAG & DROP** - Framer Motion drag en barras (activable)
- [x] Carga datos reales del usuario (37 shows)
- [x] Vista Gantt/Timeline estilo Notion
- [x] Zoom 3 niveles (día/semana/mes)
- [x] Agrupación flexible (mes/status/tipo)
- [x] Color-coded por status
- [x] Iconos por tipo de evento
- [x] Tooltips informativos
- [x] Línea "HOY" con auto-scroll
- [x] Animaciones suaves
- [x] Grid semanal/mensual
- [x] Rango inteligente (todos los eventos)
- [x] Diseño dashboard-consistent
- [x] Responsive text overflow
- [x] Hover effects

### � **V3 Features - En Progreso**
- [x] Drag & Drop básico implementado
- [ ] Modo Simulación con WASM
- [ ] Dependencias visuales (líneas de conexión)
- [ ] Creación in-line de eventos
- [ ] Edición in-line
- [ ] Multi-tenant (avatars, RBAC)
- [ ] Mini-map para navegación
- [ ] Exportar a PDF/PNG

---

## 📝 Ejemplo de Uso

```typescript
// En el browser: http://localhost:3001/dashboard/roadmap

// Verás:
// 1. Toolbar con zoom y agrupación
// 2. Timeline horizontal con meses
// 3. Tus 37 shows como barras de colores
// 4. Línea roja en "HOY"
// 5. Hover para detalles
// 6. Scroll horizontal para navegar

// Interacciones:
// - Click "Día/Semana/Mes" → Cambia zoom
// - Select "Agrupar" → Agrupa eventos
// - Hover barra → Ver detalles
// - Scroll → Navegar en el tiempo
```

---

## 🏁 Conclusión

El **Roadmap V2** es un sistema completo de planificación temporal que:
- ✅ **Carga datos reales** de Firestore/LocalStorage
- ✅ **Muestra TODOS los eventos** (pasados, presentes, futuros)
- ✅ **Es inteligente** (calcula rangos, agrupa, filtra)
- ✅ **Es visual** (colores, iconos, animaciones)
- ✅ **Es interactivo** (zoom, hover, scroll)
- ✅ **Es robusto** (error handling, loading states, TypeScript)
- ✅ **Es consistente** (diseño dashboard, dark theme)

**Listo para producción** 🚀
