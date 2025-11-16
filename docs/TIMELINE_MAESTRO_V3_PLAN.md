# 🎯 Timeline Maestro v3.0 - Plan de Implementación

## 📋 Resumen Ejecutivo

El **Timeline Maestro v3.0** es una funcionalidad revolucionaria que transformará On Tour App de un gestor de tours a una **herramienta de estrategia y simulación financiera en tiempo real**. 

### 🎯 Objetivo Principal
Crear una vista de proyecto unificada que agregue todas las entidades (Shows, Viajes, Finanzas, Tareas, Lanzamientos) en un timeline tipo Gantt con capacidades de:
- Visualización de dependencias
- Simulación financiera en tiempo real (WASM)
- Gestión de proyectos avanzada
- Multi-tenancy con RBAC

---

## 🏗️ Arquitectura del Sistema

### 🔄 Diferenciación Clave
- **Calendar.tsx (Existente)**: Agenda → "¿Qué pasa tal día?"
- **Timeline Maestro (Nuevo)**: Proyecto → "¿Qué depende de qué?"

### 🎨 Stack Tecnológico
- **Frontend**: React + TypeScript + Tailwind
- **Estado**: Zustand + Context API
- **Simulación**: WASM Financial Engine + Web Workers
- **UI Timeline**: React Gantt Chart Library (react-gantt-timeline o similar)
- **Backend**: Express + TypeORM + Multi-tenant
- **PWA**: Service Worker con Background Sync

---

## 📅 Fases de Implementación

### 🔸 **FASE 1: Fundamentos Backend (Días 1-3)**

#### 1.1 Nuevo Endpoint Timeline
```typescript
// backend/src/routes/timeline.ts
GET /api/timeline
- Protegido por auth middleware
- Consciente de tenant/rol
- Acepta rango de fechas
- Filtra por organizationId
```

#### 1.2 Servicio Agregador de Entidades
```typescript
// backend/src/services/timelineAggregatorService.ts
- Consulta Shows, Calendario, Viajes, Finanzas
- Agrega Tareas y Lanzamientos (nuevos)
- Aplica RBAC multi-tenant
- Retorna TimelineItem[] unificado
```

#### 1.3 Nuevas Entidades de Datos
```typescript
// Tareas/Hitos
interface Task {
  id: string;
  title: string;
  type: 'technical' | 'promotional' | 'administrative';
  deadline: string;
  showId?: string; // Opcional, si está vinculada a un show
  status: 'pending' | 'completed' | 'overdue';
}

// Lanzamientos
interface Release {
  id: string;
  title: string;
  type: 'single' | 'album' | 'video' | 'merchandise';
  deadline: string;
  dependencies: string[]; // IDs de otras entidades
}
```

---

### 🔸 **FASE 2: Frontend Core (Días 4-6)**

#### 2.1 Nueva Feature Slice
```
src/features/timeline/
├── pages/
│   └── TimelinePage.tsx
├── components/
│   ├── MasterTimelineView.tsx
│   ├── TimelineItem.tsx
│   ├── TimelineFilters.tsx
│   ├── SimulationControls.tsx
│   └── DependencyConnector.tsx
├── hooks/
│   ├── useTimelineData.ts
│   ├── useSimulation.ts
│   └── useTimelineDragDrop.ts
├── types/
│   └── timeline.ts
└── utils/
    ├── dateCalculations.ts
    └── dependencyResolver.ts
```

#### 2.2 Store de Timeline (Zustand)
```typescript
// src/shared/timelineStore.ts
interface TimelineState {
  // Datos reales
  items: TimelineItem[];
  
  // Modo simulación
  simulationItems: TimelineItem[];
  isSimulationMode: boolean;
  simulationResults: FinancialMetrics;
  
  // UI State
  dateRange: DateRange;
  filters: TimelineFilters;
  selectedItem: string | null;
  
  // Actions
  fetchTimeline: (range: DateRange) => Promise<void>;
  enterSimulationMode: () => void;
  simulateMove: (itemId: string, newDate: string) => void;
  commitSimulation: () => Promise<void>;
  discardSimulation: () => void;
}
```

---

### 🔸 **FASE 3: Componentes Timeline (Días 7-9)**

#### 3.1 MasterTimelineView.tsx
```typescript
// Componente principal con:
- Librería Gantt (react-gantt-timeline)
- Drag & Drop (react-dnd)
- Zoom temporal (días/semanas/meses)
- Swimlanes por tipo de entidad
- Líneas de dependencias
- Modo simulación visual
```

#### 3.2 TimelineItem.tsx - Polimórfico
```typescript
interface TimelineItemProps {
  item: TimelineItem;
  type: 'show' | 'travel' | 'finance' | 'task' | 'release';
  onEdit: () => void;
  onDelete: () => void;
  simulation?: boolean;
}

// Renderiza diferente según type:
// - Show: Color accent, icono micrófono
// - Travel: Color azul, icono avión  
// - Finance: Color verde/rojo, icono dinero
// - Task: Color amarillo, icono check
// - Release: Color púrpura, icono estrella
```

#### 3.3 Reutilización de Modales
```typescript
// Al hacer clic en items:
- Show → ShowEventModal existente
- Travel → AddFlightModal existente  
- Finance → ExpenseTracker existente
- Task → Nuevo TaskModal
- Release → Nuevo ReleaseModal
```

---

### 🔸 **FASE 4: Motor WASM de Simulación (Días 10-12)**

#### 4.1 Extensión del WASM Engine
```rust
// wasm-financial-engine/src/lib.rs
impl FinancialEngine {
    // Nuevo método para simulaciones
    pub fn simulate_timeline_change(
        &mut self,
        timeline_items: &str, // JSON de TimelineItem[]
        change_type: &str,    // "move_show", "add_expense", etc.
        change_data: &str     // Datos específicos del cambio
    ) -> String {
        // Recalcula KPIs basado en cambios
        // Retorna métricas simuladas
    }
}
```

#### 4.2 Web Worker para Simulación
```typescript
// src/workers/timelineSimulationWorker.ts
self.onmessage = async (event) => {
  const { timelineItems, change } = event.data;
  
  // Carga WASM engine
  const engine = await initWasm();
  
  // Ejecuta simulación
  const results = engine.simulate_timeline_change(
    JSON.stringify(timelineItems),
    change.type,
    JSON.stringify(change.data)
  );
  
  // Retorna resultados
  self.postMessage({ success: true, results });
};
```

#### 4.3 Hook de Simulación
```typescript
// src/features/timeline/hooks/useSimulation.ts
export function useSimulation() {
  const simulateChange = useCallback(async (change: TimelineChange) => {
    // Ejecuta en Web Worker
    const results = await simulationWorker.simulate(change);
    
    // Actualiza KPIDataProvider con datos simulados
    updateKPIProvider(results);
    
    return results;
  }, []);

  return { simulateChange, isSimulating };
}
```

---

### 🔸 **FASE 5: UI/UX Avanzado (Días 13-15)**

#### 5.1 Controles de Simulación
```typescript
// components/SimulationControls.tsx
- Botón "Modo Simulador" (toggle)
- Indicador visual de cambios
- Métricas en tiempo real
- Botones "Guardar" / "Descartar"
- Historial de cambios (undo/redo)
```

#### 5.2 Filtros Avanzados
```typescript
// components/TimelineFilters.tsx
- Capas por tipo (Shows, Viajes, Finanzas, etc.)
- Filtros por estado (confirmed, pending, etc.)
- Rango de fechas interactivo
- Filtros por RBAC (según rol del usuario)
- Búsqueda de texto
```

#### 5.3 Visualización de Dependencias
```typescript
// components/DependencyConnector.tsx
- Líneas conectoras entre items relacionados
- Indicadores de conflictos (overlap de fechas)
- Warnings de dependencias rotas
- Path crítico resaltado
```

---

### 🔸 **FASE 6: Multi-Tenancy & RBAC (Días 16-17)**

#### 6.1 Filtros por Rol
```typescript
// Artista: Ve sus shows, viajes, lanzamientos
// Manager: Ve todo + puede simular
// Venue: Ve solo shows asignados + tareas técnicas
// Agency: Ve múltiples artistas en swimlanes
```

#### 6.2 Permisos de Acciones
```typescript
interface TimelinePermissions {
  canEdit: boolean;
  canSimulate: boolean;
  canViewFinances: boolean;
  canCreateTasks: boolean;
  visibleEntities: EntityType[];
}
```

---

### 🔸 **FASE 7: PWA & Offline (Días 18-19)**

#### 7.1 Service Worker Caché
```typescript
// public/sw-v3.js extensión
- Cache timeline data
- Cache simulation results
- Offline timeline view
```

#### 7.2 Background Sync
```typescript
// Sincronización de cambios offline
- Queue timeline mutations
- Sync cuando hay conexión
- Conflict resolution
```

---

### 🔸 **FASE 8: Testing & Integración (Días 20-22)**

#### 8.1 Tests Unitarios
- Timeline store (Zustand)
- WASM engine simulation methods
- Timeline components
- Dependency resolver logic

#### 8.2 Tests E2E
- Timeline navigation
- Drag & drop simulation
- Modal integrations
- Multi-user scenarios

#### 8.3 Performance Testing
- Large datasets (100+ timeline items)
- WASM simulation performance
- Memory usage optimization

---

## 🎨 Especificaciones de Diseño

### 🎯 Wireframe Principal
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Timeline Maestro v3.0            [🔄 Modo Simulador] │
├─────────────────────────────────────────────────────────┤
│ [Filtros] [Zoom: Semana▼] [Hoy] [◀ Oct 2024 ▶]        │
├─────────────────────────────────────────────────────────┤
│ Shows    │████████████████████████████████████████████│
│ Viajes   │    ✈️──────────✈️                          │
│ Finanzas │        💰         💰                        │
│ Tareas   │  📋    📋           📋                      │
│ Release  │                        🎵                   │
└─────────────────────────────────────────────────────────┘
```

### 🎨 Tokens de Color
```scss
// Timeline item types
--color-show: var(--accent-500);      // Shows: Verde accent
--color-travel: var(--sky-500);       // Viajes: Azul cielo
--color-finance: var(--emerald-500);  // Finanzas: Verde
--color-task: var(--amber-500);       // Tareas: Amarillo
--color-release: var(--purple-500);   // Lanzamientos: Púrpura

// Simulation mode
--color-simulation: var(--orange-500); // Cambios simulados
--color-conflict: var(--red-500);      // Conflictos
```

---

## 📊 Métricas de Éxito

### 🎯 KPIs Técnicos
- **Performance**: Simulación < 200ms
- **Escalabilidad**: 500+ items sin lag
- **Offline**: 100% funcional sin conexión
- **Accessibility**: AA compliance

### 📈 KPIs de Negocio  
- **Adopción**: 80% de managers usan simulación
- **Eficiencia**: 30% reducción en tiempo de planning
- **ROI**: 25% mejora en decisiones financieras
- **Satisfacción**: NPS > 50

---

## 🚀 Roadmap Post-Launch

### 🔮 Timeline Maestro v3.1
- **AI Predictions**: ML para sugerir fechas óptimas
- **Template System**: Plantillas de tours
- **Advanced Analytics**: Reportes de eficiencia
- **API Integrations**: Ticketing, streaming, etc.

### 🌟 Timeline Maestro v3.2
- **Collaboration**: Comentarios y aprobaciones
- **Version Control**: Historial de cambios
- **Advanced Simulation**: Monte Carlo analysis
- **Mobile Optimization**: App nativa

---

## 🎯 Conclusión

El Timeline Maestro v3.0 representará un salto evolutivo para On Tour App, transformándola de una herramienta de gestión a una **plataforma de estrategia musical inteligente**.

**Impacto Esperado:**
- Decisiones informadas por simulación en tiempo real
- Visibilidad completa del ecosistema de un tour
- Reducción drástica del riesgo financiero
- Experiencia de usuario premium diferenciadora

Esta implementación posicionará a On Tour App como la herramienta líder en gestión estratégica de tours musicales a nivel global.

---

*Plan creado: 16 de noviembre de 2025*
*Estimación total: 22 días de desarrollo*
*Desarrollador principal: AI Assistant con supervisión humana*