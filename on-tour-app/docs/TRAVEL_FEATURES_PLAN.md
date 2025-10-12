# Plan Completo de Funcionalidades de Travel

## 📋 Resumen Ejecutivo

Este documento describe la arquitectura completa del sistema de gestión de viajes para On Tour App, diseñado para músicos y artistas en gira.

---

## 🎯 Separación de Funcionalidades

### 1. **Add Flight** (Ya implementado - Simplificado)
**Propósito:** Añadir vuelos YA COMPRADOS a la agenda personal

**Características:**
- ✅ Input simple: Localizador (ABC123) o Número de Vuelo (KL1662)
- ✅ Fecha opcional para desambiguar
- ✅ Búsqueda inteligente (auto-detecta tipo)
- ✅ Selección rápida si hay múltiples resultados
- ✅ Confirmación con detalles completos
- ✅ Integración automática con calendario

**Flujo:**
1. Usuario introduce localizador/número
2. Sistema busca vuelo
3. Usuario confirma y añade a su trip
4. Vuelo aparece en calendario y timeline

---

### 2. **Search Flights** (Por implementar)
**Propósito:** BUSCAR y COMPARAR vuelos para decidir qué comprar

**Características principales:**

#### 🔍 Búsqueda Avanzada
- **Origen/Destino:** Selectores con autocomplete de aeropuertos
- **Fechas:** 
  - Solo ida
  - Ida y vuelta
  - Multi-ciudad (hasta 5 tramos)
  - Fechas flexibles (±3 días)
- **Pasajeros:**
  - Adultos (12+ años)
  - Niños (2-11 años)
  - Bebés (0-2 años)
- **Clase:**
  - Económica
  - Premium Economy
  - Business
  - Primera Clase
- **Filtros:**
  - Solo vuelos directos
  - Aerolíneas específicas
  - Horarios preferidos
  - Duración máxima
  - Número de escalas

#### 📊 Resultados y Comparación
- **Lista de resultados:**
  - Ordenar por: Precio, Duración, Horario
  - Filtrar por: Aerolínea, Escalas, Precio máximo
  - Vista de tarjetas con información clave
- **Comparación:**
  - Seleccionar hasta 3 vuelos
  - Vista lado a lado
  - Destacar diferencias
- **Detalles completos:**
  - Itinerario completo
  - Equipaje incluido
  - Políticas de cambio
  - Servicios a bordo

#### 🔗 Reserva Directa
- **Links a aerolíneas:**
  - Botón "Reservar en [Aerolínea]"
  - Abre página de la aerolínea en nueva pestaña
  - Pre-rellena información del vuelo
- **Tracking:**
  - Guardar búsquedas
  - Alertas de cambio de precio
  - Gráfico histórico de precios

---

### 3. **Smart Suggestions** (Por implementar)
**Propósito:** Sugerencias inteligentes basadas en los shows programados

**Características:**

#### 🎵 Análisis de Shows
- Detecta shows próximos sin vuelos asignados
- Calcula rutas óptimas entre ciudades
- Identifica gaps en el calendario
- Sugiere tiempos de llegada óptimos

#### 💡 Sugerencias
```
┌─────────────────────────────────────┐
│ 🎤 Show en Barcelona → Madrid       │
│ Fecha: 15 Oct → 18 Oct              │
│                                     │
│ ✈️ Vuelo Sugerido:                  │
│ BCN → MAD                           │
│ 15 Oct, 18:00 - 19:15              │
│ Desde 59€ · Vueling                │
│                                     │
│ [Buscar Vuelos] [Añadir Manualmente]│
└─────────────────────────────────────┘
```

#### 🗺️ Vista Inteligente
- Mapa con shows y vuelos
- Timeline visual
- Alertas de conflictos
- Optimización de rutas

---

## 🏗️ Arquitectura Técnica

### Componentes Nuevos

#### 1. `FlightSearchModal.tsx`
```typescript
interface FlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearch?: {
    origin?: string;
    destination?: string;
    date?: string;
  };
}

type SearchType = 'one-way' | 'round-trip' | 'multi-city';
type CabinClass = 'economy' | 'premium' | 'business' | 'first';

interface SearchParams {
  type: SearchType;
  segments: FlightSegment[];
  passengers: PassengerCount;
  cabinClass: CabinClass;
  directOnly: boolean;
  airlines?: string[];
  maxStops?: number;
  flexibleDates?: boolean;
}

interface FlightSegment {
  origin: string;
  destination: string;
  date: string;
}

interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}
```

#### 2. `FlightComparison.tsx`
- Componente para comparar hasta 3 vuelos lado a lado
- Highlight de diferencias
- Quick actions: Select, Save, Share

#### 3. `SmartSuggestions.tsx`
- Cards de sugerencias basadas en shows
- Integración con calendario
- One-click search pre-fill

#### 4. `PriceTracker.tsx`
- Guardar búsquedas
- Gráficos de precio histórico
- Sistema de alertas

### Servicios

#### `flightSearch.ts`
```typescript
export interface FlightSearchResult {
  id: string;
  segments: FlightSegment[];
  price: PriceInfo;
  duration: string;
  carrier: CarrierInfo;
  bookingUrl: string;
  policies: FlightPolicies;
}

export async function searchFlights(params: SearchParams): Promise<FlightSearchResult[]>
export async function getFlightDetails(flightId: string): Promise<FlightDetails>
export async function trackPrice(searchId: string): Promise<PriceTracking>
```

#### `smartSuggestions.ts`
```typescript
export interface FlightSuggestion {
  id: string;
  show: DemoShow;
  route: Route;
  suggestedFlights: FlightSearchResult[];
  urgency: 'high' | 'medium' | 'low';
  reason: string;
}

export function analyzeShowsForFlights(shows: DemoShow[]): FlightSuggestion[]
export function findOptimalRoutes(shows: DemoShow[]): Route[]
```

---

## 🎨 Diseño y UX

### Principios de Diseño
1. **Claridad:** Diferenciación clara entre "Add" y "Search"
2. **Velocidad:** Acciones comunes en máximo 2 clicks
3. **Inteligencia:** Sugerencias proactivas basadas en contexto
4. **Transparencia:** Precios y políticas siempre visibles
5. **Integración:** Flujo natural con calendario y shows

### Paleta de Colores
- **Add Flight:** Accent-500 (Verde) - "Ya lo tengo"
- **Search Flights:** Blue-500 - "Quiero buscar"
- **Suggestions:** Purple-500 - "Recomendado"

### Iconografía
- ✈️ Vuelos
- 🔍 Búsqueda
- 💡 Sugerencias
- 📊 Comparación
- 🔔 Alertas
- 🗺️ Mapa/Rutas

---

## 📱 Interfaz de Usuario

### TravelV2 Page - Header Actions
```
┌────────────────────────────────────────────┐
│ Travel                                      │
│                                             │
│ [🔍 Buscar Vuelos] [✈️ Añadir Vuelo]        │
│                                             │
│ 💡 Sugerencias Inteligentes                 │
│ ┌─────────────────┐ ┌─────────────────┐   │
│ │ BCN → MAD       │ │ MAD → LIS       │   │
│ │ 15 Oct          │ │ 18 Oct          │   │
│ │ Desde 59€       │ │ Desde 89€       │   │
│ └─────────────────┘ └─────────────────┘   │
│                                             │
│ 📅 Tus Vuelos                               │
│ [Filters: All | Upcoming | Past]            │
│ [Sort: Date | Price | Duration]             │
└────────────────────────────────────────────┘
```

### Search Modal - Estructura
```
┌──────────────────────────────────┐
│ 🔍 Buscar Vuelos                 │
├──────────────────────────────────┤
│                                  │
│ [Ida] [Ida y vuelta] [Multi]    │
│                                  │
│ Origen: [BCN Barcelona ▼]       │
│ Destino: [MAD Madrid ▼]         │
│                                  │
│ Salida: [15 Oct 2025]           │
│ Regreso: [22 Oct 2025]          │
│                                  │
│ ┌─ Opciones Avanzadas ────────┐ │
│ │ Pasajeros: 2 adultos        │ │
│ │ Clase: Económica            │ │
│ │ □ Solo directos             │ │
│ │ □ Fechas flexibles ±3 días  │ │
│ └─────────────────────────────┘ │
│                                  │
│ [Buscar Vuelos] 🔍              │
└──────────────────────────────────┘
```

### Results View
```
┌────────────────────────────────────────┐
│ 127 vuelos encontrados                  │
│                                         │
│ Filtrar: [Precio] [Escalas] [Hora]     │
│ Ordenar: [Precio ▼] [Duración] [Hora]  │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ Vueling VY2105                  │    │
│ │ 09:00 BCN ──2h15m──> 10:15 MAD │    │
│ │ Directo · Económica             │    │
│ │ 59€                              │    │
│ │ [Ver Detalles] [Reservar] [⊕]   │    │
│ └─────────────────────────────────┘    │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ Iberia IB3201                   │    │
│ │ 14:30 BCN ──1h45m──> 16:15 MAD │    │
│ │ Directo · Económica             │    │
│ │ 79€                              │    │
│ │ [Ver Detalles] [Reservar] [⊕]   │    │
│ └─────────────────────────────────┘    │
└────────────────────────────────────────┘
```

---

## 🚀 Fases de Implementación

### Fase 1: Core Search (NEXT)
- [ ] FlightSearchModal component
- [ ] Search form con todas las opciones
- [ ] Airport autocomplete
- [ ] Multi-city support
- [ ] Basic results display

### Fase 2: Results & Comparison
- [ ] Results filtering y sorting
- [ ] Flight details modal
- [ ] Comparison view (up to 3)
- [ ] Booking links a aerolíneas

### Fase 3: Smart Features
- [ ] Show analysis
- [ ] Smart suggestions
- [ ] Timeline integration
- [ ] Conflict detection

### Fase 4: Advanced Features
- [ ] Price tracking
- [ ] Price history charts
- [ ] Email alerts
- [ ] Saved searches

### Fase 5: Polish & Optimization
- [ ] Performance optimization
- [ ] Mobile responsive
- [ ] Accessibility (WCAG 2.1)
- [ ] Loading states
- [ ] Error handling
- [ ] Analytics

---

## 🔌 Integraciones Futuras

### APIs de Vuelos Reales
1. **Amadeus Flight API**
   - Búsqueda en tiempo real
   - 500 llamadas/mes gratis
   
2. **Skyscanner API**
   - Comparación de precios
   - Redirects a partners

3. **Kiwi.com Tequila API**
   - Multi-ciudad avanzado
   - Stopover optimization

### Aerolíneas Principales
- KLM, Lufthansa, Iberia, British Airways
- Vueling, Ryanair, EasyJet
- American, Delta, United
- Air France, Emirates

---

## 📊 Métricas de Éxito

### KPIs
- **Adopción:** % usuarios que buscan vuelos
- **Conversión:** Clicks en "Reservar"
- **Smart Suggestions:** % de sugerencias aceptadas
- **Time to Book:** Tiempo de búsqueda a reserva
- **Satisfaction:** NPS de la funcionalidad

### Analytics Events
```typescript
// Search
Events.flightSearchStarted({ origin, destination, dates })
Events.flightSearchCompleted({ resultsCount, duration })

// Booking
Events.flightBookingLinkClicked({ flight, airline })
Events.flightAdded({ flight, source: 'manual' | 'search' | 'suggestion' })

// Suggestions
Events.suggestionViewed({ suggestionId })
Events.suggestionAccepted({ suggestionId })
Events.suggestionDismissed({ suggestionId, reason })
```

---

## 🎯 Objetivos de Negocio

1. **Reducir fricción:** De 15+ campos a 2 para vuelos comprados
2. **Aumentar engagement:** Sugerencias proactivas basadas en shows
3. **Monetización futura:** Comisiones de afiliados de aerolíneas
4. **Diferenciación:** Primera app de tours con flight intelligence
5. **Retención:** Gestión completa de viajes en una app

---

## 📝 Notas Técnicas

### Performance
- Lazy load FlightSearchModal
- Debounce airport search (300ms)
- Virtual scroll para >100 resultados
- Cache de búsquedas recientes

### Accesibilidad
- Keyboard navigation completa
- ARIA labels
- Screen reader support
- High contrast mode

### Mobile
- Touch-optimized controls
- Swipe gestures
- Native date pickers
- Responsive breakpoints

---

## 🔄 Próximos Pasos Inmediatos

1. ✅ **Simplificar AddFlightModal** - COMPLETADO
2. 🚧 **Crear FlightSearchModal** - EN PROGRESO
3. ⏳ **Añadir botón Search Flights en TravelV2**
4. ⏳ **Implementar lógica de smart suggestions**
5. ⏳ **Integración con calendario**

---

## 📚 Referencias

- [Flighty App](https://flighty.app) - Inspiración de UX
- [Google Flights](https://flights.google.com) - Search patterns
- [Amadeus API Docs](https://developers.amadeus.com)
- [IATA Airport Codes](https://www.iata.org/en/publications/directories/code-search/)

---

**Última actualización:** 9 Octubre 2025  
**Estado:** Fase 1 en progreso  
**Próxima revisión:** Después de completar FlightSearchModal
