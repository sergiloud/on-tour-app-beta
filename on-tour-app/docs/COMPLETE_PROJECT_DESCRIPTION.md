# ON TOUR APP 2.0 - Descripción Completa del Proyecto

**Última actualización:** 3 de noviembre de 2025

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Propuesta de Valor](#propuesta-de-valor)
3. [Usuarios Objetivo](#usuarios-objetivo)
4. [Arquitectura Técnica](#arquitectura-técnica)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Tipos de Datos Principales](#tipos-de-datos-principales)
7. [Flujo de Usuario](#flujo-de-usuario)
8. [Módulos y Funcionalidades](#módulos-y-funcionalidades)
9. [Hooks y Estado](#hooks-y-estado)
10. [Servicios y APIs](#servicios-y-apis)
11. [Seguridad](#seguridad)
12. [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
13. [Testing](#testing)

---

## 🎯 Visión General

**On Tour App** es una aplicación web progresiva (PWA) profesional para la gestión integral de giras musicales. Transforma la experiencia de tour managers e independientes, reemplazando flujos manuales y desorganizados con una plataforma unificada, inteligente y prediactiva.

### Lema

> "De caos a control. De datos a decisiones."

### Concepto Clave

On Tour App actúa como **copiloto inteligente** para artistas y managers, proporcionando:

- Gestión centralizada de shows, finanzas, viajes y contratos
- Análisis predictivo de problemas logísticos y financieros
- Experiencia offline-first con sincronización robusta
- Interfaz moderna, accesible y mobile-first

---

## 💎 Propuesta de Valor

### Beneficios Clave

1. **Cierra contratos más rápido**
   - E-signatures integradas (HelloSign)
   - Templates legales predefinidos por país
   - Full-text search en cláusulas

2. **Liquida pagos en 1 clic**
   - Settlement automático multiparte (manager %, booking %, artist)
   - Cálculos de WHT (withholding tax) por país
   - Multi-moneda con conversión real-time

3. **Evita imprevistos**
   - IA predice problemas antes de ocurrir
   - Tour Health Score: diagnóstico de riesgos
   - ActionHub: tareas priorizado automáticamente

4. **Trabaja offline**
   - Sync robusto: Desktop → Carretera → Internet
   - Service Worker avanzado con caché estratégico
   - PWA instalable en teléfono/tablet

5. **Control total**
   - Dashboard unificado: Shows, Finanzas, Viajes, Equipo
   - Permisos por rol (Admin/Manager/Viewer)
   - Audit trail completo de cambios

---

## 👥 Usuarios Objetivo

| Segmento           | Perfil                     | Anual          | Necesidades Clave                              |
| ------------------ | -------------------------- | -------------- | ---------------------------------------------- |
| **Indie Artists**  | Solistas/bandas emergentes | 0-50 shows     | Primera herramienta profesional, fácil de usar |
| **Tour Managers**  | Profesionales dedicados    | 50-200 shows   | Gestión completa + automatización              |
| **Small Agencies** | 2-5 artistas en roster     | Multi-roster   | Sin caos, visibilidad centralizada             |
| **Mid-Market**     | 5-20 artistas              | 500-2000 shows | Escalabilidad, API, integraciones              |

---

## 🏗️ Arquitectura Técnica

### Stack Principal

```
Frontend:
  ├─ React 18 (componentes, hooks)
  ├─ TypeScript (tipado estricto)
  ├─ Vite (bundling, dev server)
  ├─ React Router v7 (SPA routing)
  └─ Tailwind CSS + Custom Design System

State & Data:
  ├─ React Context (Auth, Settings, UI)
  ├─ TanStack React Query @5.x (caching, mutations)
  ├─ Custom Hooks (negocio específico)
  └─ localStorage (demo mode, offline)

UI Components:
  ├─ Lucide React (icons)
  ├─ Framer Motion (animations)
  ├─ Sonner (toasts)
  ├─ dnd-kit (drag & drop)
  └─ TanStack Virtual (virtualization)

Visualización:
  ├─ Recharts (gráficos financieros)
  ├─ MapLibre GL (mapas interactivos)
  └─ Custom canvas/SVG (heatmaps)

Offline & PWA:
  ├─ Workbox v7.x (service worker)
  ├─ Web Workers (cálculos pesados)
  └─ IndexedDB (caché local)

Seguridad:
  ├─ Web Crypto API (PBKDF2, AES-GCM)
  ├─ Session Key Manager (en memoria)
  └─ CryptoJS legacy (deprecating)
```

### Componentes Arquitectónicos

```
┌─────────────────────────────────────────┐
│         Presentación (React)             │
│  Components + Pages + Layouts            │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│    Business Logic (Hooks + Context)     │
│  useShows, useFinance, useAuth, etc    │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│    Data Layer (Services + Storage)      │
│  showStore, financeApi, showsService    │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│  Persistence (localStorage + IndexedDB) │
└─────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
src/
├── pages/                          # Páginas de la aplicación
│   ├── Dashboard.tsx               # Dashboard principal (overview)
│   ├── Login.tsx                   # Autenticación
│   ├── Register.tsx                # Registro
│   ├── LandingPage.tsx             # Landing (públicas)
│   ├── OnboardingSimple.tsx        # Onboarding de nuevos usuarios
│   └── dashboard/
│       ├── Shows.tsx               # Tabla de shows (list/board)
│       ├── ShowDetails.tsx         # Modal/página de detalles
│       ├── Finance.tsx             # Dashboard financiero (beta)
│       ├── FinanceOverview.tsx     # Overview de finanzas
│       ├── Calendar.tsx            # Calendario interactivo
│       ├── TravelV2.tsx            # Gestión de viajes
│       ├── Settings.tsx            # Configuración de usuario
│       ├── MissionControlLab.tsx   # HUD de mapas (experimental)
│       ├── Story.tsx               # Visor de historias/eventos
│       └── org/
│           ├── OrgOverviewNew.tsx  # Overview de organización
│           ├── OrgClients.tsx      # Gestión de clientes
│           └── OrgReports.tsx      # Reportes

├── components/                     # Componentes reutilizables
│   ├── GlobalShowModal.tsx         # Modal global de shows
│   ├── CommandPalette.tsx          # Paleta de comandos (cmd+k)
│   ├── LanguageSelector.tsx        # Selector de idioma
│   ├── dashboard/
│   │   ├── ActionHub.tsx           # Hub de acciones inteligentes
│   │   ├── FinanceQuicklook.tsx    # Widget de finanzas rápidas
│   │   └── TourOverview.tsx        # Overview de gira
│   ├── finance/                    # Componentes financieros
│   ├── map/                        # Componentes de mapas
│   ├── shows/                      # Componentes de shows
│   ├── travel/                     # Componentes de viajes
│   ├── common/                     # Componentes básicos
│   ├── skeletons/                  # Skeleton loaders
│   └── pwa/                        # Componentes PWA

├── features/                       # Características agrupadas por dominio
│   ├── dashboard/                  # Lógica del dashboard
│   ├── finance/                    # Cálculos financieros
│   │   ├── types.ts                # Tipos (FinanceShow, BreakdownEntry)
│   │   ├── calculations.ts         # Lógica de cálculos
│   │   └── workers/                # Web Workers para cálculos pesados
│   ├── map/                        # Lógica de mapas
│   ├── shows/
│   │   ├── editor/
│   │   │   └── useShowDraft.ts    # Hook para editar borradores de shows
│   │   ├── selectors.ts            # Selectores (filtros por región/rango)
│   │   ├── actions.ts              # Acciones de shows
│   │   └── queries.ts              # React Query queries
│   └── travel/                     # Lógica de viajes

├── hooks/                          # Custom React Hooks
│   ├── useShows.ts                 # Hook de shows (legacy)
│   ├── useShowsQuery.ts            # Hook React Query para shows
│   ├── useAuth.tsx                 # (en context)
│   ├── useSettings.tsx             # (en context)
│   ├── useFinanceKpis.ts           # KPIs financieros
│   ├── useFinanceWorker.ts         # Manejo de web workers
│   ├── useCalendarState.ts         # Estado del calendario
│   ├── useDragDropShows.ts         # Drag & drop de shows
│   ├── useOptimizedFinanceCalculations.ts # Optimizaciones
│   ├── useNetworkStatus.tsx        # Monitoreo de conectividad
│   ├── useTourStats.ts             # Estadísticas de gira
│   └── ... (más hooks especializados)

├── context/                        # Context Providers (estado global)
│   ├── AuthContext.tsx             # Auth (userId, profile, prefs)
│   ├── SettingsContext.tsx         # Settings (idioma, región, formato dinero)
│   └── ShowModalContext.tsx        # Gestión del modal global

├── services/                       # APIs y servicios externos
│   ├── financeApi.ts               # Cálculos financieros
│   ├── travelApi.ts                # APIs de viajes
│   ├── amadeusFlightSearch.ts      # Integración Amadeus
│   ├── flightSearch.ts             # Búsqueda de vuelos
│   └── trips.ts                    # Gestión de itinerarios

├── lib/                            # Utilidades y librerías
│   ├── shows.ts                    # Tipos Show/DemoShow
│   ├── shows/
│   │   ├── export.ts               # Exportación CSV/XLSX
│   │   └── import.ts               # Importación de datos
│   ├── showStore.ts                # Singleton localStorage de shows
│   ├── showsService.ts             # Adaptador Promise de showStore
│   ├── demoDataset.ts              # Carga/gestión de datos demo
│   ├── demoAuth.ts                 # Autenticación demo (localStorage)
│   ├── tenants.ts                  # Multi-tenancy setup
│   ├── demoShows.ts                # Tipos DemoShow
│   ├── i18n.ts                     # Diccionario bilingüe (en/es)
│   ├── keyDerivation.ts            # PBKDF2, AES-GCM, SessionKeyManager
│   ├── secureStorage.ts            # Almacenamiento cifrado (legacy CryptoJS)
│   ├── serviceWorkerManager.ts     # Gestión del SW
│   ├── telemetry/                  # Tracking de eventos
│   ├── performance.ts              # Custom query hook (legacy)
│   └── ... (más utilities)

├── types/                          # Type definitions compartidas
│   ├── shows.ts                    # Tipos de shows (Cost, etc)
│   └── ... (más tipos)

├── layouts/                        # Layouts (DashboardLayout, AuthLayout)
│   ├── DashboardLayout.tsx         # Layout principal del dashboard
│   └── AuthLayout.tsx              # Layout de autenticación

├── shared/                         # Código compartido
│   ├── showStore.ts                # Store de shows (localStorage)
│   └── ... (más código compartido)

├── styles/                         # Estilos globales
│   └── globals.css                 # Tailwind imports, variables CSS

├── locales/                        # Archivos de i18n (if external files)
│   └── ... (traduciones)

├── workers/                        # Web Workers
│   └── financeWorker.ts            # Cálculos financieros en paralelo

├── content/                        # Contenido estático
│   └── ... (FAQ, documentación embebida)

├── design-system/                  # Design tokens y configuración
│   └── ... (colores, espaciado, etc)

├── ui/                             # UI utilities
│   ├── Toast.tsx                   # Toast provider
│   └── ... (más utilities de UI)

├── entry-client.tsx                # Punto de entrada cliente (SSR)
├── entry-server.tsx                # Punto de entrada servidor (SSR)
├── main.tsx                        # Entry point React
├── App.tsx                         # Root component
└── vite-env.d.ts                   # Types de Vite
```

---

## 🔑 Tipos de Datos Principales

### 1. **Show / DemoShow**

```typescript
type Show = {
  id: string; // UUID único
  tenantId?: string; // Multi-tenant
  name?: string; // Nombre del show/festival
  city: string; // Ciudad
  country: string; // Código país (ES, FR, etc)
  lat: number; // Latitud
  lng: number; // Longitud
  date: string; // ISO date (YYYY-MM-DD)
  fee: number; // Caché en moneda original
  feeCurrency?: 'EUR' | 'USD' | 'GBP' | 'AUD'; // Moneda original
  fxRateToBase?: number; // Tasa de cambio almacenada
  status: 'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived' | 'postponed';
  paid?: boolean; // Estado de pago
  venue?: string; // Nombre del venue
  whtPct?: number; // Retención de impuestos (%)
  mgmtAgency?: string; // Agencia de management
  bookingAgency?: string; // Agencia de booking
  notes?: string; // Notas libres
  cost?: number; // Costos de producción
  costs?: Cost[]; // Desglose de costos
};

// Backward compatibility
type DemoShow = Show;

type Cost = {
  id: string;
  type: string; // Categoría (Sound, Light, etc)
  amount: number;
  desc?: string; // Descripción
};
```

### 2. **FinanceShow**

```typescript
type FinanceShow = {
  id: string;
  name?: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  date: string; // ISO
  fee: number;
  status: 'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived' | 'postponed';
  route?: string; // Tramo de gira (EU/US/LatAm)
  venue?: string;
  promoter?: string;
  cost?: number;
};

type BreakdownEntry = {
  key: string;
  income: number;
  expenses: number;
  net: number;
  count: number;
};

type MarginBreakdown = {
  byRoute: BreakdownEntry[];
  byVenue: BreakdownEntry[];
  byPromoter: BreakdownEntry[];
};
```

### 3. **UserProfile & UserPrefs**

```typescript
type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'manager' | 'viewer';
  organization?: string;
};

type UserPrefs = {
  lang?: 'en' | 'es';
  theme?: 'light' | 'dark' | 'auto';
  currency?: 'EUR' | 'USD' | 'GBP' | 'AUD';
  region?: 'all' | 'AMER' | 'EMEA' | 'APAC';
  timezone?: string;
  notifications?: boolean;
};
```

### 4. **ShowsPrefs** (Preferencias de página Shows)

```typescript
type ShowsPrefs = {
  view?: 'list' | 'board';
  totalsVisible?: boolean;
  totalsPinned?: boolean;
  whtVisible?: boolean;
  dateRange?: { from: string; to: string };
  region?: 'all' | 'AMER' | 'EMEA' | 'APAC';
  feeRange?: { min?: number; max?: number };
  statusOn?: Record<'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived', boolean>;
  sort?: { key: 'date' | 'fee' | 'net'; dir: 'asc' | 'desc' };
  tab?: 'details' | 'finance' | 'costs';
  exportCols?: Record<string, boolean>;
  __version?: 2;
};
```

### 5. **ShowDraft**

```typescript
type ShowDraft = Partial<Show> & {
  whtPct?: number;
  venue?: string;
  mgmtAgency?: string;
  bookingAgency?: string;
  mgmtPct?: number; // Management commission %
  bookingPct?: number; // Booking commission %
  notes?: string;
  costs?: Cost[];
};
```

---

## 🔄 Flujo de Usuario

### 1. **Landing / Autenticación**

```
┌─────────────────────────┐
│   Visita on-tour.app    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   ¿Es usuario nuevo?    │
└────────┬────────────┬───┘
         │ SÍ         │ NO
         ▼            ▼
    Register        Login
         │            │
         └────┬───────┘
              ▼
    ┌──────────────────────┐
    │  Onboarding Simple   │
    │  (skip/completar)    │
    └────────┬─────────────┘
             ▼
    ┌──────────────────────┐
    │  Dashboard Principal │
    └──────────────────────┘
```

**Credenciales Demo:**

- No se requieren — localStorage persiste automáticamente
- Cada navegador/dispositivo es un "usuario" diferente

---

### 2. **Gestión de Shows (Flujo Principal)**

#### 2.1 Ver Shows

```
┌─────────────────────────────┐
│  Dashboard → Shows Tab      │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Cargar lista de shows      │
│  (localStorage → React      │
│   Query cache)              │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Renderizar tabla/board:    │
│  - Mostrar shows            │
│  - Calcular netos (comisiones)
│  - Aplicar filtros:         │
│    * Por fecha (rango)      │
│    * Por región (AMER/EMEA) │
│    * Por estado (confirmed, pending)
│    * Por rango de caché     │
│  - Ordenar (date/fee/net)   │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Usuario ve tabla o Kanban  │
│  board (arrastrables)       │
└─────────────────────────────┘
```

#### 2.2 Crear Show

```
┌─────────────────────────────┐
│  Clic en "Nuevo Show"       │
│  (FAB o botón)              │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  GlobalShowModal abre       │
│  (ShowEditor component)     │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Rellenar formulario:       │
│  - Fecha, ciudad, país      │
│  - Caché (fee) en EUR/USD   │
│  - Estado inicial (pending) │
│  - Datos opcionales         │
│    (venue, notes, comisiones)
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Clic en "Guardar"          │
│  (validar, normalizar)      │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  showsService.setAll()      │
│  → showStore.setAll()       │
│  → localStorage.setItem()   │
│  → React Query invalidate   │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Modal cierra, tabla        │
│  actualiza (optimistic)     │
│  Toast: "Show creado"       │
└─────────────────────────────┘
```

#### 2.3 Editar Show

```
┌─────────────────────────────┐
│  Clic en row menu → "Edit"  │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  GlobalShowModal + ShowDraft│
│  precargado con valores     │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Usuario modifica campos    │
│  (dirty state tracking)     │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Clic en "Guardar"          │
│  → Validar cambios          │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  showStore.updateShow(id)   │
│  → localStorage actualiza   │
│  → React Query invalidate   │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Modal cierra, tabla        │
│  actualiza con nuevos datos │
│  Toast: "Show actualizado"  │
└─────────────────────────────┘
```

#### 2.4 Cambiar Estado (Promover)

```
Usuario selecciona estado:
pending → offer → confirmed → paid → archived

Transiciones permitidas varían según lógica negocio.

Ejemplo: confirm pending show
├─ Cálculos: net = fee - comisiones - WHT
├─ Reavalúa ActionHub (recompute actions)
└─ Marca para viaje si está próximo
```

---

### 3. **Gestión Financiera**

#### Flujo Financiero Completo

```
1. Mostrar Dashboard Financiero
   ├─ KPIs: Total neto, run rate, forecast
   ├─ Gráficos: Ingresos vs gastos, margin by route
   └─ Tabla: Desglose por concepto

2. Cálculos en Tiempo Real
   ├─ Por cada show confirmed:
   │  ├─ Net = fee × (1 - (mgmtPct + bookingPct) / 100) - WHT
   │  └─ WHT = fee × (whtPct / 100)
   │
   ├─ Agregación por período:
   │  ├─ By route (EU/US/LatAm)
   │  ├─ By venue (agrupar por promotor)
   │  └─ By date range (rango seleccionado)
   │
   └─ Optimización:
      ├─ Web Worker si lista > 500 shows
      └─ Caché en React Query + memoización

3. Settlement (1-Click)
   ├─ Calcular distribuido:
   │  ├─ Artist: XX% (e.g., 70%)
   │  ├─ Management: XX% (e.g., 15%)
   │  └─ Booking: XX% (e.g., 15%)
   │
   ├─ Generar invoice template
   ├─ Exportar a contable (JSON/CSV)
   └─ Marcar shows como "paid"
```

---

### 4. **Gestión de Viajes**

```
Show confirmado próximo
        ↓
ActionHub sugiere: "Plan travel"
        ↓
Usuario abre TravelV2 page
        ↓
Buscar vuelos:
├─ Amadeus API (si backend configurado)
├─ Fallback: flightSearch local
└─ Mostrar opciones con precio

Usuario selecciona vuelo
        ↓
Crear Trip:
├─ Guardar en localStorage
├─ Asociar a show(s)
└─ Agregar a calendario

Itinerario construido:
├─ Flights: origin → destination
├─ Ground transport: airport → venue
├─ Hotel: check-in/check-out
└─ Notas: contactos, specs técnicos
```

---

### 5. **Calendario**

```
Calendario mensual interactivo
        ↓
┌─ Vista: mes actual por defecto
├─ Navegación: prev/next meses
├─ Clic en fecha → ver shows ese día
└─ Shows resaltados por estado (colores)

Gestos:
├─ Swipe left/right (cambiar mes)
├─ Tap para detalles
└─ Long-press para crear show en fecha
```

---

## 🎮 Módulos y Funcionalidades

### **1. Módulo de Shows**

**Responsabilidad:**

- CRUD de shows
- Validación y normalización de datos
- Filtrado y búsqueda
- Exportación (CSV/XLSX)
- Importación desde Excel

**Componentes Clave:**

- `Pages/dashboard/Shows.tsx` — Página principal
- `ShowEditor.tsx` — Componente de edición
- `ShowDetails.tsx` — Vista de detalles
- `RowActionsMenu.tsx` — Acciones por fila

**Hooks:**

- `useShows()` — Lectura de shows (legacy)
- `useShowsQuery()` — React Query (nuevo)
- `useShowDraft()` — Estado borrador
- `useDragDropShows()` — Drag & drop

**Servicios:**

- `showStore.ts` — Storage localStorage
- `showsService.ts` — Adaptador Promise
- `lib/shows/export.ts` — Exportación
- `lib/demoDataset.ts` — Demo data loading

---

### **2. Módulo Financiero**

**Responsabilidad:**

- Cálculos de ingresos/egresos/neto
- Breakdown por route/venue/promoter
- Forecast vs real
- Settlement (distribución de pagos)
- Exportación contable

**Componentes Clave:**

- `Pages/dashboard/Finance.tsx` — Dashboard beta
- `FinanceOverview.tsx` — Overview
- `FinanceQuicklook.tsx` — Widget rápido
- Gráficos: Recharts (line, bar, pie)

**Hooks:**

- `useFinanceKpis()` — KPIs calculados
- `useFinanceWorker()` — Web Worker
- `useOptimizedFinanceCalculations()` — Optimizaciones

**Servicios:**

- `financeApi.ts` — Cálculos y fetch
- `features/finance/calculations.ts` — Lógica
- `workers/financeWorker.ts` — Computación paralela

**Tipos:**

- `FinanceShow` — Show enriquecido
- `BreakdownEntry` — Entradas de desglose
- `MarginBreakdown` — Resultado de cálculos

---

### **3. Módulo de Viajes**

**Responsabilidad:**

- Búsqueda de vuelos (Amadeus o local)
- Gestión de itinerarios
- Associación flight ↔ show
- Timeline de viaje

**Componentes Clave:**

- `Pages/dashboard/TravelV2.tsx` — Gestión de viajes
- `TravelWorkspacePage.tsx` — Vista workspace
- Búsqueda de vuelos UI

**Hooks:**

- `useCreateTravelPrefill()` — Autocompletar travel form
- Más hooks de viaje

**Servicios:**

- `travelApi.ts` — API viajes
- `amadeusFlightSearch.ts` — Amadeus
- `flightSearch.ts` — Búsqueda local
- `trips.ts` — Gestión de trips

---

### **4. Módulo de Mapas**

**Responsabilidad:**

- Visualizar shows geográficamente
- Heatmap de ingresos
- Clustering automático
- Optimización de rutas (futuro)

**Componentes Clave:**

- MapLibre GL (renderer)
- Clustering con supercluster
- Custom layers (shows, revenue, vendors)

**Hooks:**

- `useMapClustering()` — Lógica clustering
- Más hooks de mapa

**Servicios:**

- Mapbox/MapLibre GL JS
- Supercluster librería

---

### **5. Módulo de ActionHub**

**Responsabilidad:**

- Computar acciones inteligentes
- Priorizar por urgencia
- Notificaciones
- Snooze/dismiss

**Componentes Clave:**

- `ActionHub.tsx` — Widget principal
- `HubAction.tsx` — Acción individual

**Lógica:**

```typescript
Acciones generadas:
├─ Travel planning: "Próximo show confirmado en 10 días, planifica viaje"
├─ Invoice reminder: "5 shows sin pagar este mes"
├─ Contract pending: "3 contratos sin firmar"
├─ Financial alert: "Margen < 10% en shows confirmados"
├─ Riskflag: "Weather alert para Madrid show"
└─ Team action: "@manager, necesito tu aprobación"
```

---

### **6. Módulo de Calendario**

**Responsabilidad:**

- Vista mensual/semana/día
- Eventos (shows + viajes)
- Gestos touch
- Crear show desde fechas

**Componentes Clave:**

- `Pages/dashboard/Calendar.tsx`
- Matriz de calendario
- Gesture handlers

**Hooks:**

- `useCalendarState()` — Estado mes/evento
- `useCalendarMatrix()` — Matriz de fechas
- `useCalendarGestures()` — Touch gestures
- `useEventLayout()` — Posicionamiento eventos

---

### **7. Módulo de Settings**

**Responsabilidad:**

- Configuración de usuario
- Preferencias de UI (idioma, tema, moneda)
- Datos de organización
- Seguridad (password, 2FA)

**Componentes Clave:**

- `Pages/dashboard/Settings.tsx`
- Secciones: Account, Preferences, Organization, Security

**Hooks:**

- `useSettings()` — Lectura/escritura prefs
- `useTheme()` — Tema actual + toggle

---

### **8. Módulo de Autenticación**

**Responsabilidad:**

- Login/registro
- Sesión de usuario
- Permisos por rol
- Token management (futuro)

**Contexto:**

- `AuthContext.tsx` — Proveedor global

**Funciones:**

- `demoAuth.ts` — Auth localStorage (demo)
- Roles: admin, manager, viewer

---

### **9. Módulo de PWA**

**Responsabilidad:**

- Service Worker avanzado
- Precaching de recursos
- Offline sync
- Push notifications
- Instalabilidad

**Componentes:**

- `sw-advanced.ts` — Service Worker
- `PWAComponents.tsx` — UI PWA
- `ServiceWorkerUpdater.tsx` — Update notifier

**Tecnología:**

- Workbox v7.x
- Web Manifest
- Estrategias: network-first, cache-first, stale-while-revalidate

---

## 🪝 Hooks y Estado

### **Hooks de Negocio**

| Hook                      | Responsabilidad        | Retorna                                         |
| ------------------------- | ---------------------- | ----------------------------------------------- |
| `useShows()`              | Reads shows, observers | `{ shows, add, update, remove }`                |
| `useShowsQuery()`         | React Query wrapper    | `{ data, isLoading, error, ...mutations }`      |
| `useAuth()`               | Contexto auth          | `{ userId, profile, prefs, setUserId, ... }`    |
| `useSettings()`           | Prefs usuario          | `{ lang, theme, currency, fmtMoney, ... }`      |
| `useFinanceKpis()`        | KPIs financieros       | `{ totalNet, runRate, forecast, ... }`          |
| `useOptimisticMutation()` | Updates optimistas     | `{ mutate, isPending, error }`                  |
| `useTourStats()`          | Stats gira             | `{ upcomingCount, confirmedCount, ... }`        |
| `useShowDraft()`          | Estado borrador        | `{ draft, setDraft, dirty, errors, normalize }` |

### **Contextos Globales**

| Contexto           | Propósito                              |
| ------------------ | -------------------------------------- |
| `AuthContext`      | Usuario actual, permisos, preferencias |
| `SettingsContext`  | Idioma, tema, moneda, región           |
| `ShowModalContext` | Control del modal global de shows      |

---

## 🔧 Servicios y APIs

### **showStore.ts** - Singleton Storage

```typescript
class ShowStore {
  getAll(): Show[];
  getById(id: string): Show | undefined;
  setAll(shows: Show[]): void;
  addShow(show: Show): void;
  updateShow(id: string, patch: Partial<Show>): void;
  removeShow(id: string): void;
  subscribe(listener: Listener): () => void;
}

// Uso:
const shows = showStore.getAll();
showStore.subscribe(shows => console.log('updated', shows));
```

### **showsService.ts** - Adaptador Promise

```typescript
export const showsService = {
  getAll(): Promise<Show[]>,
  getById(id: string): Promise<Show | undefined>,
  setAll(shows: Show[]): Promise<void>,
  addShow(show: Show): Promise<void>,
  updateShow(id: string, patch: Partial<Show>): Promise<void>,
  removeShow(id: string): Promise<void>
};
```

### **financeApi.ts** - Cálculos Financieros

```typescript
export async function fetchShows(): Promise<FinanceShow[]>;
export async function fetchFinanceSnapshot(now?: Date): Promise<FinanceSnapshot>;
export async function fetchTargets(): Promise<FinanceTargetsDTO>;
export async function buildFinanceSnapshot(now: Date): Promise<FinanceSnapshot>;
export async function computeMarginBreakdown(shows: FinanceShow[]): Promise<MarginBreakdown>;
```

### **demoAuth.ts** - Autenticación Demo

```typescript
export function ensureDemoAuth(): void;
export function getCurrentUserId(): string | null;
export function setCurrentUserId(id: string): void;
export function getUserProfile(id: string): UserProfile | null;
export function upsertUserProfile(profile: UserProfile): void;
export function getUserPrefs(id: string): UserPrefs;
export function upsertUserPrefs(id: string, patch: Partial<UserPrefs>): UserPrefs;
```

---

## 🔐 Seguridad

### **Implementación de Criptografía**

**Archivo:** `src/lib/keyDerivation.ts`

#### Derivación de Claves (PBKDF2)

```typescript
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = 100000
): Promise<CryptoKey>;

// Genera CryptoKey usando Web Crypto API
// ├─ Algoritmo: PBKDF2 con SHA-256
// ├─ Iteraciones: 100,000 (OWASP recomendado)
// ├─ Uso: extractable para encriptación AES-GCM
// └─ Salt: 16 bytes (generado por servidor)
```

#### Encriptación AES-256-GCM

```typescript
export async function encryptWithKey(
  data: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }>;

// ├─ Algoritmo: AES-256-GCM
// ├─ IV: 12 bytes random por encriptación
// ├─ Authentication tag: incluido en ciphertext
// └─ Resultado: Base64 encoded
```

#### Session Key Manager

```typescript
export class SecureSessionKeyManager {
  setKey(password: string, salt: Uint8Array): Promise<void>;
  getKey(): CryptoKey | null;
  clear(): void;
  isAvailable(): boolean;
}

// ├─ Almacenamiento: memoria (NO localStorage)
// ├─ Lifespan: sesión del navegador
// └─ Invalidación: logout o refresh
```

### **Autenticación Demo** (Desarrollo)

```typescript
// localStorage-based (insecuro para prod)
// ├─ userId: "user123"
// ├─ profile: { name, email, role }
// └─ prefs: { lang, theme, currency }

// Contraseña demo (para acceso a datos demo):
// const DEMO_PASSWORD = '...';
```

### **Roadmap Seguridad**

- [ ] Backend API para salt exchange
- [ ] JWT tokens (OAuth2)
- [ ] Two-factor authentication (TOTP)
- [ ] Rate limiting (backend)
- [ ] CSRF protection
- [ ] Content Security Policy (CSP)

---

## ⚡ Optimizaciones de Rendimiento

### **1. Web Workers**

**Archivo:** `src/workers/financeWorker.ts`

- Cálculos financieros en paralelo (off main thread)
- Usados si lista > 500 shows
- Transferencia de datos: Transferable objects

### **2. Virtual Scrolling**

- TanStack Virtual para listas largas
- Renderiza solo elementos visibles
- Caché de renders previos/siguientes

### **3. React Query**

- Caching automático de queries
- Stale-while-revalidate
- Background refetch
- Invalidación selectiva

### **4. Memoización**

- `useMemo` para cálculos pesados (filter, sort, format)
- `useCallback` para handlers de eventos
- Selectores memoizados en features

### **5. Code Splitting**

- Routes lazy-loaded con `React.lazy()`
- Componentes grandes en dynamic imports
- Critical path: index page + auth

### **6. Service Worker**

**Estrategias:**

- Network-first: API calls
- Cache-first: Assets (CSS, JS, fonts)
- Stale-while-revalidate: Data
- Background sync: Offl

ine mutations

### **7. Indexación de Datos**

- localStorage con keys versionadas
- Migraciones automáticas
- Limpieza periódica de datos obsoletos

---

## 🧪 Testing

### **Test Suites**

#### Unit Tests (`src/__tests__/*.test.ts`)

- Utilities (key derivation, encryption)
- Hooks (useShowDraft, useFinanceKpis)
- Selectores (filters, calculations)

#### Integration Tests (`src/__tests__/*integration*.test.ts`)

- useShowsQuery + showStore
- financeApi + calculations
- Auth flow

#### E2E Tests (`e2e/`)

- Login/autenticación
- CRUD de shows (crear, editar, eliminar)
- Navegación y flujos completos
- Offline sync

### **Test Runners**

- **Vitest** — Unit + integration
- **Playwright** — E2E
- **Coverage**: target 80%+

### **Fixtures**

- `e2e/fixtures/auth.fixtures.ts` — Auth test data
- `e2e/fixtures/data.fixtures.ts` — Data generators

### **Commands**

```bash
# Unit tests (watch)
npm run test

# Unit tests (run once)
npm run test:run

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui

# Coverage
npm run test:coverage
```

---

## 📊 Flujo de Datos

```
┌──────────────────────────────┐
│   Usuario Interactúa        │
│  (clic, input, drag)        │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│  React Event Handler        │
│  (onClick, onChange)        │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│  Actualiza Estado Local     │
│  (useState, context)        │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│  Valida/Normaliza datos     │
│  (schema validation)        │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│  Persiste:                  │
│  ├─ React Query mutation     │
│  ├─ showsService.setAll()   │
│  └─ localStorage.setItem()  │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│  Invalidar cache relacionado│
│  (React Query)              │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│  Rerender componentes       │
│  (React re-renders)         │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│  Mostrar feedback           │
│  (toast, optimistic UI)     │
└──────────────────────────────┘
```

---

## 📱 Interfaz de Usuario

### **Diseño System**

- **Color Palette:**
  - Primary: indigo-500
  - Success: green-500
  - Warning: amber-500
  - Danger: red-500
  - Neutral: slate/gray scale

- **Typography:**
  - Display: 3xl/4xl/5xl (headings)
  - Body: base/sm (content)
  - Caption: xs (meta)

- **Spacing:** Tailwind scale (4px base)

- **Breakpoints:**
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

### **Componentes Reutilizables**

```
components/
├── common/
│   ├── Button.tsx        # Botón base
│   ├── Input.tsx         # Input text
│   ├── Select.tsx        # Dropdown
│   ├── Modal.tsx         # Modal
│   ├── Card.tsx          # Card
│   ├── Badge.tsx         # Badge
│   ├── Loading.tsx       # Skeleton
│   └── Toast.tsx         # Notificaciones
│
├── shows/
│   ├── ShowRow.tsx       # Row en tabla
│   ├── ShowCard.tsx      # Card show
│   └── ShowEditor.tsx    # Form edición
│
├── finance/
│   ├── KpiCard.tsx       # KPI widget
│   ├── ChartComponent.tsx# Gráfico
│   └── Table.tsx         # Tabla datos
│
└── map/
    ├── MapContainer.tsx  # Mapa
    ├── ClusterMarker.tsx # Cluster
    └── Legend.tsx        # Leyenda
```

### **Responsividad**

- Mobile-first (xs by default)
- Touch targets: 44px minimum
- Bottom navigation en mobile
- FAB para acciones primarias
- Modals fullscreen en mobile

### **Accesibilidad**

- WCAG 2.1 AA target
- Semantic HTML (roles, aria-\*)
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader support
- Color contrast 4.5:1+

---

## 🌐 Internacionalización (i18n)

**Archivo:** `src/lib/i18n.ts`

```typescript
type Lang = 'en' | 'es';

const DICT: Record<Lang, Record<string, string>> = {
  en: { ... },
  es: { ... }
};

export function t(key: string, defaultValue?: string): string
```

**Ejemplo:**

```tsx
const { lang, setLang } = useSettings();
const message = t('shows.created', 'Show created');
```

**Idiomas Soportados:**

- Español (es)
- Inglés (en)

---

## 🚀 Roadmap Futuro

### **Q1 2026**

- [ ] Backend API migration
- [ ] OAuth2 / Single Sign-On
- [ ] Multi-user collaboration
- [ ] Real-time sync (WebSockets)
- [ ] Mobile app (React Native)

### **Q2 2026**

- [ ] AI-powered insights (predictive analytics)
- [ ] Automated email reminders
- [ ] E-signature integration (HelloSign)
- [ ] Accounting software integration (Xero, QuickBooks)

### **Q3 2026**

- [ ] Route optimization (traveling salesman)
- [ ] Budget vs actual forecasting
- [ ] Team management & permissions
- [ ] Venue database (capacidad, specs)

### **Q4 2026**

- [ ] Native iOS app
- [ ] Native Android app
- [ ] White-label SaaS
- [ ] B2B API para agencias

---

## 📞 Contacto y Soporte

- **Owner:** Danny Avila
- **Repository:** On-Tour-App-2.0
- **Documentation:** `/docs` folder
- **Issues & Features:** GitHub Issues

---

## 📄 Licencia

Todos los derechos reservados © 2024-2025 Danny Avila

---

**Fin de la Descripción Completa**

Este documento integra todas las funciones, tipos de datos, flujos de usuario, módulos, hooks, servicios, seguridad y optimizaciones del proyecto **On Tour App 2.0**.
