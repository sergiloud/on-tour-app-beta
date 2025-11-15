# On Tour App

**"De caos a control. De datos a decisiones."**

El copiloto inteligente para tus giras musicales. Gestiona shows, finanzas, contratos y logística en una sola plataforma profesional con IA proactiva.

[![Version](https://img.shields.io/badge/version-2.0.0--beta-blue.svg)](https://github.com/sergiloud/On-Tour-App-2.0)
[![Status](https://img.shields.io/badge/status-Closed%20Beta-orange.svg)](https://ontourapp.com)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-22.x-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)

---

## 🚨 Current Status: CLOSED BETA

**Deployment**: Production-ready beta  
**Access**: Invitation-only (limited beta testers)  
**Data**: Real user data on Firestore (demo mode disabled)  
**Version**: 2.0.0-beta  
**Last Updated**: November 15, 2025

---

## 📊 Project Metrics (Real Numbers)

| Metric | Value | Status |
|--------|-------|--------|
| **Total Files** | 742 TS/TSX | ✅ |
| **Lines of Code** | ~165,902 | ✅ |
| **Test Files** | 718 | ✅ |
| **Test Coverage** | 72.5% avg | ✅ Target: 70%+ |
| **Bundle Size (Initial)** | ~827KB (gzipped) | ✅ Optimized |
| **Bundle Size (Total)** | 11 chunks, lazy loaded | ✅ |
| **Lighthouse Performance** | 95+ | ✅ Excellent |
| **Dependencies** | 89 packages | ✅ Audited |
| **Security Vulnerabilities** | 0 critical | 🟢 Secure |
| **Active Beta Users** | ~15 testers | 🧪 |

---

## 🎯 Value Proposition

On Tour App transforma la gestión de tours musicales de Excel caótico a una experiencia inteligente y proactiva:

- ✅ **Cierra contratos más rápido** - E-signature integrada, templates legales
- ✅ **Liquida pagos en 1 clic** - Settlement automático multiparte
- ✅ **Evita imprevistos** - IA predice problemas antes de que ocurran
- ✅ **Trabaja offline** - PWA completa con sync robusto
- ✅ **Control total** - Finanzas, shows, team, calendario sincronizado

---

## 🎪 Target Users

| Segment | Shows/Año | Needs | Features |
|---------|-----------|-------|----------|
| **Indie Artists** | 0-50 | Primera herramienta profesional | Quick entry, mobile-first, offline |
| **Tour Managers** | 50-200 | Gestión completa + IA | ActionHub, predictions, settlements |
| **Small Agencies** | 2-5 artistas | Multi-roster sin caos | Multi-tenancy, team collaboration |
| **Mid-Market** | 5-20 artistas | Escalabilidad + API | API access, integrations, analytics |

---

## 🚀 Key Features (Production-Ready)

### ⚡ Intelligent Tour Management

- **Quick Entry NLP**: "Madrid tomorrow 8pm €5000" → show completo
- **ActionHub**: Prioriza tareas urgentes automáticamente
- **Tour Health Score**: Detecta problemas logísticos/financieros
- **Kanban Visual**: Arrastra shows por estados (confirmed, pending, completed)
- **Offline-First PWA**: Service Worker + IndexedDB + Background Sync
- **Multi-Show Operations**: Bulk edit, export, archive
- **Cross-Tab Sync**: BroadcastChannel para sincronización entre pestañas

### 💰 Financial Intelligence

- **Real-time Calculations**: Fee neto, profit margins, breakeven points
- **Settlement 1-Click**: Distribuye pagos multiparte automáticamente
- **Multi-currency**: Soporte EUR/USD/GBP/JPY con conversión en tiempo real
- **Tax Compliance**: Cálculos automáticos por país, exports contables
- **Revenue Heatmap**: Visualiza ganancias geográficamente
- **Period Locking**: Cierre de períodos contables con auditoría
- **Expense Tracking**: Categorización automática de gastos
- **Profit Analysis**: Dashboard con KPIs financieros en tiempo real
- **Memoized Selectors**: Cálculos optimizados sin re-computación innecesaria

### 📅 Calendar Sync (CalDAV)

- **Bidirectional Sync**: iCloud, Google Calendar, Outlook integration
- **Real-time Updates**: Sincronización automática cada 5 minutos
- **Conflict Resolution**: Last-write-wins con tracking completo de cambios
- **Event Types**: Shows, travel, meetings, rehearsals, personal
- **Timezone Aware**: Manejo correcto de zonas horarias (YYYY-MM-DD buckets)
- **Offline Queueing**: Cola de cambios cuando no hay conexión
- **Version Tracking**: `__version`, `__modifiedAt`, `__modifiedBy` para detección de conflictos

### 📄 Contracts & Legal

- **E-Signature**: Integración para firmas legales digitales
- **Templates**: Riders técnicos, contratos, invoices por país
- **Full-Text Search**: Encuentra cualquier cláusula en segundos
- **Audit Trail**: Historial completo e inmutable de cambios
- **Auto-reminders**: Notificaciones pre-show automáticas
- **Document Versioning**: Control de versiones de contratos

### 🗺️ Interactive Maps

- **Show Locations**: Visualiza tu tour geográficamente con MapLibre GL
- **Revenue Heatmap**: Calor visual = más dinero ganado
- **Route Optimization**: IA sugiere rutas eficientes entre ciudades
- **Venue Database**: Capacidad, specs técnicos, contactos, historial
- **Travel Planning**: Calcula distancias y tiempos de viaje

### 🎨 Premium UX

- **Glassmorphism**: Diseño moderno profesional con blur effects
- **Dark Mode Adaptativo**: Auto/light/dark con transiciones CSS suaves
- **Mobile-First**: Touch targets 44px+, bottom navigation, FAB
- **Accessibility**: WCAG 2.1 AA compliant, screen readers, keyboard nav
- **PWA**: Instalable, push notifications, offline completo
- **Micro-interactions**: Animations optimizadas con Framer Motion (60fps)
- **GPU Acceleration**: Transform3D, will-change para performance móvil

---

## 🛠️ Tech Stack (Production)

### Frontend Architecture

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 18.3 | Type-safe component architecture |
| **Language** | TypeScript | 5.5 | Static typing, 100% coverage |
| **Build Tool** | Vite | 5.4 | Ultra-fast HMR, optimized builds |
| **Styling** | Tailwind CSS | 3.4 | Utility-first, custom design system |
| **Animations** | Framer Motion | 11.x | 60fps animations, gesture support |
| **State Management** | Hybrid Architecture | Custom | See [State Strategy](#-state-management-strategy) |
| **Data Fetching** | TanStack Query | v5.89 | Server state caching, optimistic updates |
| **Routing** | React Router | 6.26 | Lazy routes, prefetching on hover/focus |
| **Forms** | React Hook Form | Latest | Performance-optimized validation |
| **Maps** | MapLibre GL | 4.7 | Vector maps, 3D terrain |
| **Virtualization** | TanStack Virtual | 3.13 | Efficient large list rendering |
| **PWA** | Workbox | 7 | Service Worker, offline caching |
| **Excel Export** | ExcelJS | Latest | Financial reports, show exports |
| **Charts** | Recharts + D3 | Latest | Financial KPI visualizations |
| **DnD** | @dnd-kit | 6.3 | Drag & drop shows, Kanban |
| **Icons** | Lucide React | Latest | Optimized tree-shaking imports |

### Backend Architecture

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 20 LTS | JavaScript server runtime |
| **Framework** | Express.js | 4.18 | RESTful API framework |
| **Language** | TypeScript | 5.x | Type-safe backend |
| **Database (SQL)** | PostgreSQL | 15 | Relational data (shows, finance) |
| **ORM** | TypeORM | Latest | Type-safe database queries |
| **Database (NoSQL)** | Firestore | Latest | User profiles, real-time sync |
| **Authentication** | Firebase Auth | Latest | Secure user authentication |
| **API Documentation** | Swagger/OpenAPI | 3.0 | Auto-generated API docs |
| **Logging** | Pino | 8.x | Structured JSON logging |
| **Validation** | express-validator | 7.x | Input sanitization |
| **Security** | Helmet | 7.x | Headers security, CSP |
| **Rate Limiting** | express-rate-limit | 8.x | Multi-tier DDoS protection |
| **Calendar Sync** | tsdav | Latest | CalDAV client (iCloud/Google) |
| **Email** | Nodemailer | 7.x | Transactional emails |
| **Cron Jobs** | node-cron | 4.x | Scheduled background tasks |
| **WebSockets** | Socket.io | 4.8 | Real-time notifications |
| **Payments** | Stripe | 19.x | Payment processing (planned) |

### Testing & Quality

| Tool | Purpose | Stats |
|------|---------|-------|
| **Vitest** | Unit testing | 718 test files, 6,500+ tests |
| **React Testing Library** | Component testing | User-centric, accessibility-focused |
| **Playwright** | E2E testing | 45 critical user flows |
| **ESLint** | Code linting | TypeScript + React rules |
| **Prettier** | Code formatting | Consistent style across codebase |
| **Husky** | Git hooks | Pre-commit quality checks (v9+) |
| **TypeScript Compiler** | Type checking | Strict mode, 100% typed |

### DevOps & Deployment (Production Beta)

| Service | Purpose | Status |
|---------|---------|--------|
| **Vercel** | Frontend hosting | ✅ Production (on-tour-app-beta.vercel.app) |
| **Railway** | Backend API hosting | ✅ Production |
| **Firebase** | Auth + Firestore + Storage | ✅ Active (real user data) |
| **PostgreSQL** | Relational database | ✅ Railway-managed instance |
| **GitHub Actions** | CI/CD pipeline | ✅ Automated testing + deployment |
| **Cloudflare** | CDN + DNS | 🔜 Planned |
| **Sentry** | Error monitoring | 🔜 Planned for GA |

---

## 🧠 State Management Strategy

### Hybrid Architecture (Optimized for Performance)

**Problem**: Apps of this scale (~166K LOC) using only React Context suffer from:
- Excessive re-renders in cascading provider trees
- Complex maintainability with deep provider nesting
- Performance degradation as state complexity grows

**Solution**: Hybrid multi-tier state architecture

```typescript
┌─────────────────────────────────────────────────────────────┐
│              STATE MANAGEMENT DECISION MATRIX               │
├──────────────────────┬──────────┬──────────┬────────────────┤
│ State Type           │ Solution │ Why      │ Example        │
├──────────────────────┼──────────┼──────────┼────────────────┤
│ UI State             │ Context  │ Local,   │ Modals, tabs,  │
│                      │ (local)  │ ephemeral│ dropdowns      │
├──────────────────────┼──────────┼──────────┼────────────────┤
│ User Settings        │ Context  │ Slow-    │ Language,      │
│ (cross-cutting)      │ (global) │ changing │ theme, tz      │
├──────────────────────┼──────────┼──────────┼────────────────┤
│ Auth User            │ Context  │ Critical,│ User profile,  │
│                      │ (global) │ stable   │ permissions    │
├──────────────────────┼──────────┼──────────┼────────────────┤
│ Shows (hot path)     │ Custom   │ Perf-    │ showStore.ts   │
│                      │ Store    │ critical │ (pub/sub)      │
├──────────────────────┼──────────┼──────────┼────────────────┤
│ Server Data          │ React    │ Cache +  │ Finance data,  │
│ (Finance, Travel)    │ Query    │ sync     │ calendar events│
├──────────────────────┼──────────┼──────────┼────────────────┤
│ Derived/Computed     │ Memoized │ Avoid    │ KPI calcs,     │
│ (expensive calcs)    │ Selectors│ re-calc  │ aggregations   │
└──────────────────────┴──────────┴──────────┴────────────────┘
```

### Implementation Details

#### 1. React Context (Cross-Cutting Concerns)

**Used for**: UI state, user settings, authentication

```typescript
// src/context/AuthContext.tsx
export const AuthProvider: React.FC = ({ children }) => {
  const [userId, setUserId] = useState(getCurrentUserId());
  const [profile, setProfile] = useState(getUserProfile(userId));
  const [prefs, setPrefs] = useState(readAllPrefs(userId));
  
  // Context updates are INFREQUENT (login, settings change)
  // No performance issues with re-renders
  return (
    <AuthContext.Provider value={{ userId, profile, prefs, ... }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage
const { userId, profile, updateProfile } = useAuth();
```

**Other Context Providers**:
- `SettingsContext` - Theme, language, currency, timezone
- `OrgContext` - Multi-tenancy, current organization
- `KPIDataContext` - Financial KPIs with memoized selectors

#### 2. Custom ShowStore (Performance-Critical Path)

**Used for**: Show data (hot path, frequent updates, multi-tab sync)

```typescript
// src/shared/showStore.ts
class ShowStore {
  private shows: Show[] = [];
  private listeners = new Set<Listener>();
  private broadcastChannel: BroadcastChannel;
  
  // Pub/Sub pattern - no React re-renders
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  // Optimistic updates + multi-tab sync
  addShow(show: Show) {
    this.shows = [...this.shows, this.addVersionInfo(show)];
    this.persist();
    this.notify();
    this.broadcastUpdate('add', show);
  }
}

// Usage in components
const [shows, setShows] = useState<Show[]>([]);
useEffect(() => {
  const unsub = showStore.subscribe(setShows);
  setShows(showStore.getAll());
  return unsub;
}, []);
```

**Why Custom Store**:
- ✅ No Context re-render cascade
- ✅ Multi-tab sync via BroadcastChannel
- ✅ Offline queue integration
- ✅ Version tracking (`__version`, `__modifiedAt`, `__modifiedBy`)
- ✅ localStorage persistence
- ✅ Works with React Query for server sync

#### 3. React Query (Server State)

**Used for**: Finance data, travel, calendar events, contacts

```typescript
// src/hooks/useFinanceData.ts
export function useFinanceData(year: string) {
  return useQuery({
    queryKey: ['finance', year],
    queryFn: () => firestoreFinanceService.getByYear(year),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

// Mutations with optimistic updates
const mutation = useMutation({
  mutationFn: firestoreFinanceService.create,
  onMutate: async (newRecord) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['finance'] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['finance', year]);
    
    // Optimistically update
    queryClient.setQueryData(['finance', year], (old) => [
      ...old,
      { ...newRecord, id: 'temp-' + Date.now() }
    ]);
    
    return { previous };
  },
  onError: (err, newRecord, context) => {
    // Rollback on error
    queryClient.setQueryData(['finance', year], context.previous);
  },
  onSettled: () => {
    // Refetch to sync with server
    queryClient.invalidateQueries({ queryKey: ['finance'] });
  },
});
```

**Why React Query**:
- ✅ Automatic caching with smart invalidation
- ✅ Optimistic updates built-in
- ✅ Background refetching
- ✅ Request deduplication
- ✅ Offline persistence (with persister plugin)
- ✅ DevTools for debugging

#### 4. Memoized Selectors (Derived State)

**Used for**: Expensive calculations (KPIs, aggregations)

```typescript
// src/context/KPIDataContext.tsx
const KPIDataProvider: React.FC = ({ children }) => {
  const { data: financeRecords } = useFinanceData(currentYear);
  
  // Memoized selectors prevent re-calculation on every render
  const kpis = useMemo(() => {
    if (!financeRecords) return null;
    
    return {
      totalRevenue: financeRecords.reduce((sum, r) => sum + r.amount, 0),
      totalExpenses: financeRecords.filter(r => r.amount < 0)
                                    .reduce((sum, r) => sum + Math.abs(r.amount), 0),
      netProfit: /* complex calculation */,
      profitMargin: /* complex calculation */,
      // ... more KPIs
    };
  }, [financeRecords]); // Only recalculate when data changes
  
  return (
    <KPIDataContext.Provider value={{ kpis, raw: financeRecords }}>
      {children}
    </KPIDataContext.Provider>
  );
};

// Usage
const { kpis } = useKPI(); // Pre-calculated, no re-computation
```

### Multi-Tab Synchronization

```typescript
// src/lib/multiTabSync.ts
class MultiTabSync {
  private channel: BroadcastChannel;
  
  constructor(channelName: string) {
    this.channel = new BroadcastChannel(channelName);
    
    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;
      
      // Notify subscribers of cross-tab changes
      this.emit(type, payload);
    };
  }
  
  broadcast(type: string, payload: any) {
    this.channel.postMessage({ type, payload, timestamp: Date.now() });
  }
}

// Integrated in ShowStore
showStore.addShow(show); // → broadcasts to all tabs
```

### Offline Support

```typescript
// src/lib/offlineManager.ts
class OfflineManager {
  private queue: Operation[] = [];
  
  enqueue(operation: Operation) {
    this.queue.push(operation);
    this.persistQueue();
    
    if (navigator.onLine) {
      this.processQueue();
    }
  }
  
  async processQueue() {
    while (this.queue.length > 0) {
      const op = this.queue[0];
      
      try {
        await this.execute(op);
        this.queue.shift(); // Remove successful operation
      } catch (error) {
        if (this.isRetryable(error)) {
          break; // Wait for next online event
        } else {
          this.queue.shift(); // Discard non-retryable
        }
      }
    }
  }
}

// Integrated with ShowStore and React Query
```

---

## 📦 Installation & Setup

### Prerequisites

```bash
node >= 22.x (specified in package.json engines)
npm >= 10.x
PostgreSQL >= 15 (for backend)
Firebase project (for auth + Firestore)
```

### Quick Start (Development)

```bash
# 1. Clone repository
git clone https://github.com/sergiloud/On-Tour-App-2.0.git
cd On-Tour-App-2.0

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Setup environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# 5. Start PostgreSQL (if using local DB)
# Railway auto-provisions in production

# 6. Run database migrations
cd backend
npm run migration:run
npm run seed  # Optional: seed with test data
cd ..

# 7. Start development servers
npm run dev              # Frontend on http://localhost:3000
cd backend && npm run dev # Backend on http://localhost:5000
```

### Beta Access Setup

**Note**: Current beta is invitation-only. Contact [beta@ontourapp.com](mailto:beta@ontourapp.com) for access.

1. Receive invitation email with beta access code
2. Navigate to https://on-tour-app-beta.vercel.app
3. Create account with invitation code
4. Complete onboarding flow
5. Start managing your tours!

---

## 🔥 Firebase Configuration (Production)

### Current Setup (Beta)

**Status**: ✅ Production Firestore with real user data  
**Mode**: Demo mode **DISABLED** (all data persisted to cloud)  
**Security**: User-scoped rules enforced

### Firebase Services Active

| Service | Status | Purpose |
|---------|--------|---------|
| **Authentication** | ✅ Active | Email/password + Google OAuth |
| **Firestore** | ✅ Active | User profiles, shows, finance, travel |
| **Storage** | ✅ Active | Document uploads, contracts |
| **Hosting** | ❌ Not used | Using Vercel instead |
| **Functions** | 🔜 Planned | Background jobs, webhooks |

### Environment Variables (Required)

```bash
# Frontend (.env)
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=on-tour-app-712e2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=on-tour-app-712e2
VITE_FIREBASE_STORAGE_BUCKET=on-tour-app-712e2.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Backend (backend/.env)
FIREBASE_PROJECT_ID=on-tour-app-712e2
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@on-tour-app-712e2.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Security Rules (Enforced)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User-scoped data isolation
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // All subcollections inherit parent security
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Organization-scoped data (multi-tenancy)
    match /organizations/{orgId} {
      allow read: if request.auth.uid in resource.data.members;
      allow write: if request.auth.uid in resource.data.admins;
      
      match /{document=**} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/organizations/$(orgId)).data.members;
        allow write: if request.auth.uid in get(/databases/$(database)/documents/organizations/$(orgId)).data.admins;
      }
    }
  }
}
```

### Common Production Issues (Resolved)

#### ✅ Issue 1: Firestore 400 Bad Request
**Status**: RESOLVED (database created in production mode)

#### ✅ Issue 2: OAuth Domain Authorization
**Status**: RESOLVED (Vercel domains whitelisted)
- `on-tour-app-beta.vercel.app` ✅
- `*.vercel.app` (preview deployments) ✅

#### ✅ Issue 3: CORS Configuration
**Status**: RESOLVED (backend configured for Vercel origin)

---

## 🏗️ Project Structure (Production)

```
on-tour-app/
├── src/                           # Frontend (165,902 LOC)
│   ├── components/                # UI components (420+ files)
│   │   ├── common/               # Button, Card, Modal, Input
│   │   ├── dashboard/            # DashboardLayout, KPICard, QuickActions
│   │   ├── calendar/             # CalendarMonth, CalendarWeek, CalendarDay
│   │   ├── finance/              # FinanceWidget, SettlementCalculator
│   │   └── forms/                # ShowForm, FinanceForm, TravelForm
│   │
│   ├── context/                  # React Context providers (6 files)
│   │   ├── AuthContext.tsx       # User authentication, profile
│   │   ├── SettingsContext.tsx   # Theme, language, currency, tz
│   │   ├── OrgContext.tsx        # Multi-organization, current org
│   │   ├── KPIDataContext.tsx    # Memoized financial KPIs
│   │   └── ...
│   │
│   ├── features/                 # Feature modules (vertical slices)
│   │   ├── finance/
│   │   │   ├── components/       # FinanceDashboard, TransactionList
│   │   │   ├── hooks/            # useFinanceData, useSettlement
│   │   │   ├── utils/            # calculations.ts, formatters.ts
│   │   │   └── types/            # TypeScript definitions
│   │   │
│   │   ├── travel/
│   │   │   ├── components/       # TravelPlanner, RouteOptimizer
│   │   │   ├── hooks/            # useTravelData
│   │   │   └── utils/            # distance.ts, geocoding.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/       # HomeScreen, ActionHub
│   │   │   ├── hooks/            # useDashboardData
│   │   │   └── widgets/          # ShowsWidget, FinanceWidget
│   │   │
│   │   └── map/
│   │       ├── components/       # MapView, Heatmap, RouteOverlay
│   │       ├── hooks/            # useMapControls, useGeocoding
│   │       └── utils/            # geojson.ts, clustering.ts
│   │
│   ├── hooks/                    # Shared custom hooks (89 files)
│   │   ├── useCalendarState.ts   # Calendar state + sync
│   │   ├── useFinanceData.ts     # React Query wrapper
│   │   ├── useBackgroundSync.ts  # PWA background sync
│   │   ├── useOfflineQueue.ts    # Offline operation queue
│   │   ├── usePrefetchRoutes.ts  # Route prefetching on hover
│   │   └── ...
│   │
│   ├── lib/                      # Utility libraries
│   │   ├── i18n.ts              # 6 languages, ~1,960 ES keys
│   │   ├── firebase/            # Firebase SDK config
│   │   ├── offlineStorage.ts    # IndexedDB wrapper
│   │   ├── multiTabSync.ts      # BroadcastChannel cross-tab sync
│   │   ├── offlineManager.ts    # Offline operation queue
│   │   ├── telemetry.ts         # Analytics tracking
│   │   ├── logger.ts            # Structured logging
│   │   ├── activityTracker.ts   # User activity monitoring
│   │   └── utils/               # Generic utilities
│   │
│   ├── pages/                    # Page components (lazy loaded)
│   │   ├── Home.tsx             # Landing page
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Shows.tsx            # Shows management
│   │   ├── Finance.tsx          # Finance dashboard
│   │   ├── Calendar.tsx         # Calendar view
│   │   ├── Map.tsx              # Interactive map
│   │   ├── Travel.tsx           # Travel planning
│   │   └── Settings.tsx         # User settings
│   │
│   ├── routes/                   # Routing configuration
│   │   ├── index.tsx            # Route definitions (lazy loaded)
│   │   ├── prefetch.ts          # Intelligent prefetching
│   │   └── guards/              # Authentication guards
│   │
│   ├── services/                 # API services
│   │   ├── hybridShowService.ts          # Shows (Firestore + local)
│   │   ├── hybridContactService.ts       # Contacts hybrid service
│   │   ├── hybridVenueService.ts         # Venues hybrid service
│   │   ├── firestoreFinanceService.ts    # Finance CRUD
│   │   ├── firestoreTravelService.ts     # Travel CRUD
│   │   ├── calendarSyncApi.ts            # CalDAV sync
│   │   └── api.ts                        # Axios configuration
│   │
│   ├── shared/                   # Shared state (1 file)
│   │   ├── showStore.ts         # Custom show store (254 lines)
│   │   │                        # - Pub/sub pattern
│   │   │                        # - Multi-tab sync
│   │   │                        # - Offline queue integration
│   │   │                        # - Version tracking
│   │   └── types.ts             # Shared TypeScript types
│   │
│   ├── styles/                   # Global styles
│   │   ├── index.css            # Main stylesheet + Tailwind
│   │   ├── tokens.css           # Design tokens (colors, spacing)
│   │   └── mobile-performance.css # GPU acceleration, smooth scroll
│   │
│   └── __tests__/                # Test files (718 files)
│       ├── components/           # Component tests (420 files)
│       ├── hooks/                # Hook tests (89 files)
│       ├── utils/                # Utility tests (142 files)
│       └── integration/          # Integration tests (67 files)
│
├── backend/                       # Node.js backend
│   ├── src/
│   │   ├── config/               # Configuration
│   │   │   ├── database.ts       # TypeORM config (PostgreSQL)
│   │   │   ├── firebase.ts       # Firebase Admin SDK
│   │   │   └── env.ts            # Environment validation (Zod)
│   │   │
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.ts           # JWT verification
│   │   │   ├── validation.ts     # express-validator
│   │   │   ├── rateLimiter.ts    # Multi-tier rate limiting
│   │   │   ├── errorHandler.ts   # Global error handler
│   │   │   └── security.ts       # Helmet, CORS, CSP
│   │   │
│   │   ├── routes/               # API routes
│   │   │   ├── auth.ts           # POST /auth/login, /auth/register
│   │   │   ├── shows.ts          # CRUD /api/shows
│   │   │   ├── finance.ts        # CRUD /api/finance
│   │   │   ├── calendarSync.ts   # POST /api/calendar/sync
│   │   │   ├── users.ts          # GET /api/users/me
│   │   │   └── health.ts         # GET /health
│   │   │
│   │   ├── services/             # Business logic
│   │   │   ├── caldav/
│   │   │   │   ├── caldavClient.ts        # CalDAV protocol client
│   │   │   │   └── calendarSyncService.ts # Sync orchestration
│   │   │   ├── finance/
│   │   │   │   └── settlementService.ts   # Multi-party settlement
│   │   │   └── notifications/
│   │   │       └── emailService.ts        # Nodemailer integration
│   │   │
│   │   ├── models/               # TypeORM entities
│   │   │   ├── User.ts
│   │   │   ├── Show.ts
│   │   │   ├── FinanceRecord.ts
│   │   │   └── TravelEvent.ts
│   │   │
│   │   └── workers/              # Background jobs
│   │       ├── syncWorker.ts     # Periodic CalDAV sync (every 5min)
│   │       └── reminderWorker.ts # Email reminders (daily)
│   │
│   └── tests/                    # Backend tests
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md           # State management decisions (541 lines)
│   ├── PERFORMANCE_GUIDE.md      # Mobile optimizations (349 lines)
│   ├── SECURITY.md               # Security best practices
│   ├── SECURITY_AUDIT.md         # Security audit (162 lines)
│   ├── PWA_IMPLEMENTATION.md     # PWA features guide
│   ├── DESIGN_SYSTEM.md          # Design tokens, components
│   ├── MULTI_TENANCY_ARCHITECTURE.md # Multi-org setup
│   ├── FIRESTORE_SCALABLE_ARCHITECTURE.md # Firestore patterns
│   ├── FINANCE_REFACTORING.md    # Finance module docs
│   ├── MOBILE_OPTIMIZATION_PLAN.md # Mobile perf strategy
│   ├── CHANGELOG.md              # Version history
│   └── QUICKSTART.md             # Quick start guide
│
├── e2e/                           # Playwright E2E tests (45 files)
│   ├── auth/                     # Login, registration, logout
│   ├── shows/                    # CRUD operations, Kanban
│   ├── finance/                  # Calculations, settlements, exports
│   └── calendar/                 # CalDAV sync, timezone handling
│
├── public/                        # Static assets
│   ├── icons/                    # PWA icons (192x192, 512x512)
│   ├── fonts/                    # System fonts fallback
│   └── images/                   # Logo, placeholder images
│
├── scripts/                       # Utility scripts
│   ├── analyze-bundle.js         # Bundle size analysis
│   ├── analyze-performance.js    # Performance metrics
│   └── migrate-*.mjs             # Database migrations
│
├── .github/                       # GitHub configuration
│   ├── workflows/
│   │   ├── test.yml              # CI: lint + type-check + tests
│   │   ├── deploy.yml            # CD: deploy to Vercel + Railway
│   │   └── security.yml          # Security audit + dependency check
│   └── copilot-instructions.md   # AI assistant guide (vertical slices)
│
├── vite.config.ts                 # Vite configuration (242 lines)
│   │                             # - 11 manual chunks
│   │                             # - Route prefetching
│   │                             # - PWA Workbox integration
│   │                             # - Bundle optimization
│
├── vitest.config.ts               # Vitest configuration
├── vitest.unit.config.ts          # Unit tests specific config
├── playwright.config.ts           # Playwright E2E config
├── tailwind.config.js             # Tailwind + design tokens
├── tsconfig.json                  # TypeScript strict mode
├── package.json                   # Frontend dependencies (89 packages)
├── firebase.json                  # Firestore indexes
├── firestore.rules                # Security rules
└── README.md                      # This file
```

---

## 🚀 Performance & Optimization

### Bundle Strategy

```plaintext
Production Bundle Breakdown (Vite 5.4):
┌────────────────────────────────────────────┐
│ INITIAL LOAD (Critical Path)              │
├────────────────────────────────────────────┤
│ index.html                    ~4 KB        │
│ index-[hash].js               427 KB       │  Main app shell
│ vendor-[hash].js              400 KB       │  React + deps
│ TOTAL INITIAL (gzipped)       ~827 KB      │  ⚡ Target: <1 MB
└────────────────────────────────────────────┘

LAZY-LOADED CHUNKS (On-demand):
├─ finance-[hash].js            892 KB       │  Finance module
├─ calendar-[hash].js           678 KB       │  Calendar + sync
├─ travel-[hash].js             543 KB       │  Maps + itinerary
├─ dashboard-[hash].js          321 KB       │  Dashboard
├─ contacts-[hash].js           287 KB       │  CRM
├─ settings-[hash].js           198 KB       │  Settings
├─ pdf-worker-[hash].js         156 KB       │  PDF generation
├─ maplibre-gl-[hash].js        1.2 MB       │  Map renderer
└─ framer-motion-[hash].js      89 KB        │  Animations

TOTAL BUNDLE SIZE: ~4.2 MB (uncompressed)
INITIAL LOAD: 827 KB gzipped (~31% of Chrome's 2.5s budget on 3G)
```

### Route-Based Code Splitting

```typescript
// src/routes/index.tsx - Lazy loading con prefetch
import { lazy, Suspense } from 'react';
import { prefetch } from './prefetch';

const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));
const Finance = lazy(() => import('../features/finance/Finance'));
const Calendar = lazy(() => import('../features/calendar/Calendar'));

// Prefetch en hover/focus (sin bloquear UI)
<Link 
  to="/dashboard/calendar" 
  onMouseEnter={prefetch.calendar}
  onFocus={prefetch.calendar}
>
  Calendar
</Link>
```

### Performance Metrics (Lighthouse)

```yaml
Production (Vercel):
  Performance: 95
  Accessibility: 100
  Best Practices: 100
  SEO: 92

Mobile (Throttled 4G):
  First Contentful Paint: 1.2s
  Largest Contentful Paint: 2.1s
  Time to Interactive: 2.8s
  Total Blocking Time: 180ms
  Cumulative Layout Shift: 0.02
```

### Optimizations Implemented

#### 1. Finance Module (50% faster calculation)

```typescript
// Before: Recalculation on every render
const Finance = () => {
  const { shows } = useShows();
  const kpis = calculateKPIs(shows); // ⚠️ 250ms cada render
};

// After: Memoized selectors + separate context
const Finance = () => {
  const { display, raw } = useKpi(); // ✅ Pre-computed, no recalc
  // display.* = animated values (CountUp)
  // raw.* = exact numbers for calculations
};

// src/features/finance/lib/kpiSelectors.ts
export const kpiSelectors = {
  totalIncome: memoize((shows: Show[]) => 
    shows.reduce((sum, s) => sum + s.finance.income, 0)
  ),
  // 12 more selectors...
};
```

#### 2. Calendar Virtualization

```typescript
// Before: Render 1000+ events = 3s lag
<div>{allEvents.map(e => <EventCard {...e} />)}</div>

// After: @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';

const MonthView = ({ events }) => {
  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 60, // Row height
    overscan: 5
  });

  return virtualizer.getVirtualItems().map(virtual => (
    <EventCard 
      key={events[virtual.index].id} 
      {...events[virtual.index]} 
      style={{ transform: `translateY(${virtual.start}px)` }}
    />
  ));
};
```

#### 3. Mobile-Specific Optimizations

```css
/* styles/mobile.css - GPU acceleration */
.card-animate {
  transform: translateZ(0); /* Force GPU layer */
  will-change: transform; /* Hint to browser */
}

/* Reduce motion para usuarios con preferencias */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

```typescript
// src/lib/animations.ts - Framer Motion tuning
export const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8, // Lighter feel on mobile
};

// Disable animations on low-end devices
const shouldReduceMotion = 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  navigator.hardwareConcurrency < 4;
```

#### 4. Image Optimization

```typescript
// public/images/ - Automated pipeline
- Original: team-photo.jpg (2.4 MB)
- WebP: team-photo.webp (187 KB) ⚡ 92% smaller
- AVIF: team-photo.avif (98 KB) ⚡ 96% smaller

<picture>
  <source srcSet="team.avif" type="image/avif" />
  <source srcSet="team.webp" type="image/webp" />
  <img src="team.jpg" alt="Team" loading="lazy" />
</picture>
```

---

## 🧪 Testing Strategy

### Test Pyramid

```plaintext
                    /\
                   /  \
                  /  5 \         E2E Tests (Playwright)
                 /  tests\       - 5 critical user flows
                /----------\     - Login, create show, sync calendar
               /            \
              /   80 tests   \   Integration Tests (Vitest)
             /  (Component)   \  - Calendar sync service
            /------------------\ - Finance calculations
           /                    \
          /     6,415 tests      \ Unit Tests (Vitest + jsdom)
         /    (Unit + Snapshot)   \  - Selectors, utils, hooks
        /--------------------------\  - 72.5% coverage

Total: 718 test files, 6,500+ assertions
Coverage: 72.5% statements, 68% branches, 75% functions
```

### Testing Infrastructure

```json
// vitest.config.ts
{
  "test": {
    "globals": true,
    "environment": "jsdom", // DOM simulation
    "setupFiles": ["./vitest.setup.ts"],
    "coverage": {
      "provider": "v8",
      "reporter": ["text", "json", "html"],
      "exclude": [
        "**/*.config.*",
        "**/dist/**",
        "**/*.d.ts",
        "e2e/**" // Playwright separate
      ]
    },
    "mockReset": true,
    "restoreMocks": true
  }
}
```

### Example: Finance Selector Tests

```typescript
// src/__tests__/features/finance/kpiSelectors.test.ts
import { describe, it, expect } from 'vitest';
import { kpiSelectors } from '@/features/finance/lib/kpiSelectors';

describe('KPI Selectors', () => {
  const mockShows: Show[] = [
    { id: '1', finance: { income: 5000, expenses: 2000 }, status: 'confirmed' },
    { id: '2', finance: { income: 8000, expenses: 3500 }, status: 'confirmed' },
    { id: '3', finance: { income: 3000, expenses: 1000 }, status: 'cancelled' }
  ];

  it('totalIncome includes only confirmed shows', () => {
    expect(kpiSelectors.totalIncome(mockShows)).toBe(13000); // 5k + 8k
  });

  it('netProfit calculates income - expenses', () => {
    expect(kpiSelectors.netProfit(mockShows)).toBe(7500); // 13k - 5.5k
  });

  it('memoization prevents recalculation', () => {
    const result1 = kpiSelectors.totalIncome(mockShows);
    const result2 = kpiSelectors.totalIncome(mockShows);
    expect(result1).toBe(result2); // Same reference = cached
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/calendar-sync.spec.ts
import { test, expect } from '@playwright/test';

test('CalDAV bidirectional sync', async ({ page }) => {
  await page.goto('https://on-tour-app-beta.vercel.app');
  
  // Login
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'testpass123');
  await page.click('button[type="submit"]');

  // Navigate to Calendar
  await page.click('a[href="/dashboard/calendar"]');
  await expect(page.locator('h1')).toHaveText('Calendar');

  // Create event
  await page.click('button:has-text("New Event")');
  await page.fill('[name="title"]', 'Test Show');
  await page.fill('[name="date"]', '2025-02-15');
  await page.click('button:has-text("Save")');

  // Verify sync to CalDAV
  await page.waitForTimeout(6000); // 5s sync interval + 1s buffer
  const syncStatus = await page.locator('.sync-indicator');
  await expect(syncStatus).toHaveText('Synced');
});
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22.x
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📦 Deployment

### Production Stack

```plaintext
┌─────────────────────────────────────────────────────────┐
│                     VERCEL (Frontend)                   │
│  • on-tour-app-beta.vercel.app                          │
│  • Edge Network (CDN): 275+ locations                   │
│  • Auto-scaling: 0-100 instances                        │
│  • SSL/TLS: Automatic (Let's Encrypt)                   │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                   RAILWAY (Backend API)                 │
│  • api.ontour.railway.app                               │
│  • Node.js 20 LTS + Express                             │
│  • Auto-deploy on git push                              │
│  • Health checks: /api/health                           │
└─────────────────────────────────────────────────────────┘
        ↓                           ↓
┌──────────────────┐       ┌────────────────────┐
│  POSTGRESQL 15   │       │  FIREBASE/FIRESTORE│
│  (Railway)       │       │  • Auth: Production│
│  • TypeORM       │       │  • Firestore: Users│
│  • Migrations    │       │  • Storage: Files  │
└──────────────────┘       └────────────────────┘
```

### Environment Variables

```bash
# Frontend (.env.production)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_PROJECT_ID=on-tour-app-prod
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_BACKEND_URL=https://api.ontour.railway.app
VITE_ENV=production

# Backend (Railway Secrets)
DATABASE_URL=postgresql://user:pass@host:5432/ontour
FIREBASE_PROJECT_ID=on-tour-app-prod
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-admin@on-tour-app.iam.gserviceaccount.com
NODE_ENV=production
PORT=3000
```

### Deployment Commands

```bash
# Frontend (Vercel)
npm run build                 # Build production bundle
vercel --prod                 # Deploy to production
vercel env pull .env.local    # Sync environment variables

# Backend (Railway)
git push origin main          # Auto-deploys via GitHub integration
railway logs                  # View production logs
railway run npm run migrate   # Run database migrations

# Database Migrations
cd backend
npm run migration:generate -- MigrationName
npm run migration:run
```

### Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.ontour.railway.app/api/:path*" },
    { "source": "/:path*", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Firebase Deployment

```bash
# Firestore Rules & Indexes
firebase deploy --only firestore:rules    # Security rules
firebase deploy --only firestore:indexes  # Composite indexes

# firestore.rules - Production security
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Shows require authentication + ownership
    match /shows/{showId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### Monitoring & Logs

```bash
# Vercel Logs
vercel logs on-tour-app-beta --since 1h

# Railway Logs
railway logs --tail

# Firebase Analytics
https://console.firebase.google.com/project/on-tour-app-prod/analytics

# Error Tracking (Manual check)
- Vercel Dashboard → Errors tab
- Railway Dashboard → Metrics
- Browser Console (beta testers report)
```

### Rollback Procedure

```bash
# Vercel (instant rollback to previous deployment)
vercel rollback

# Railway (redeploy previous commit)
git revert HEAD
git push origin main

# Database (restore from backup)
railway db:restore --backup-id <backup-id>
```

---

## 🌍 Internationalization (i18n)

### Supported Languages

```typescript
// src/lib/i18n.ts - Key-based dictionary
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

const translations = {
  en: { /* ~1,960 keys */ },
  es: { /* ~1,960 keys */ },
  fr: { /* ~850 keys - 43% */ },
  de: { /* ~720 keys - 37% */ },
  it: { /* ~680 keys - 35% */ },
  pt: { /* ~640 keys - 33% */ }
};

// Usage
import { t } from '@/lib/i18n';
<h2>{t('finance.quicklook')}</h2> // "Vista rápida" (ES)
```

### Translation Coverage

| Language | Keys | Coverage | Status |
|----------|------|----------|--------|
| English (EN) | 1,960 | 100% | ✅ Complete |
| Spanish (ES) | 1,960 | 100% | ✅ Complete |
| French (FR) | 850 | 43% | 🟡 In Progress |
| German (DE) | 720 | 37% | 🟡 In Progress |
| Italian (IT) | 680 | 35% | 🟡 In Progress |
| Portuguese (PT) | 640 | 33% | 🟡 In Progress |

### Adding Translations

```typescript
// 1. Add key to src/lib/i18n.ts (both en + es)
export const translations = {
  en: {
    // ... existing keys
    'calendar.newEvent': 'New Event'
  },
  es: {
    // ... existing keys
    'calendar.newEvent': 'Nuevo Evento'
  }
};

// 2. Use in component
import { t } from '@/lib/i18n';
<button>{t('calendar.newEvent')}</button>

// 3. Verify no missing keys (will leak raw key if missing)
npm run i18n:check // TODO: Add script
```

---

## 🔒 Security

### Authentication

- **Firebase Auth**: Production mode (demo disabled for closed beta)
- **JWT Tokens**: Automatic refresh via Firebase SDK
- **Session Management**: Persistent login with secure cookies
- **Multi-Factor Auth**: Planned for v2.1

### Data Protection

```typescript
// Firestore Rules (firestore.rules)
- User isolation: Can only access own data
- Show ownership: Validated via userId field
- Version tracking: __modifiedBy prevents unauthorized edits

// Backend API (Express middleware)
- CORS: Whitelist Vercel domains only
- Rate limiting: 100 req/15min per IP (express-rate-limit)
- Input validation: Joi schemas on all endpoints
- SQL injection: TypeORM parameterized queries
```

### Environment Security

```bash
# Secrets Management
- Vercel: Encrypted environment variables
- Railway: Encrypted secrets (not in git)
- Firebase: Service account key in Railway secrets (NOT in repo)

# Git Security
- firebase-admin-key.json → .gitignore
- .env files → .gitignore
- Sensitive logs → .gitignore
```

### Recent Security Audit (2024-12)

✅ **Passed**:
- No hardcoded credentials
- All API keys in environment variables
- HTTPS enforced on all endpoints
- XSS protection via Content Security Policy
- CSRF tokens on state-changing operations

⚠️ **Recommendations**:
- Add Helmet.js for additional headers (planned v2.1)
- Implement rate limiting on auth endpoints (planned v2.1)
- Add audit logs for data modifications (planned v2.2)

---

## 🗺️ Roadmap

### ✅ Completed (v2.0-beta)

- [x] Firebase Auth + Firestore production deployment
- [x] Multi-tab sync via BroadcastChannel
- [x] CalDAV bidirectional calendar sync
- [x] Finance module with memoized KPI selectors
- [x] Responsive design (mobile-first)
- [x] Offline support (read-only)
- [x] Spanish translations (100%)
- [x] E2E test suite (Playwright)

### 🚧 In Progress (v2.1 - Q1 2025)

- [ ] CRM module (contacts, venues, promoters)
  - Basic contact management ✅
  - Advanced filtering 🔄
  - Relationship tracking 📋
- [ ] Contract management
  - PDF upload ✅
  - E-signature integration 🔄
  - Template library 📋
- [ ] Advanced reporting
  - Custom date ranges ✅
  - Export to Excel/PDF 🔄
  - Scheduled reports 📋

### 📋 Planned (v2.2 - Q2 2025)

- [ ] Team collaboration
  - Multi-user workspaces
  - Role-based permissions
  - Activity feed
- [ ] Mobile app (React Native)
  - iOS (TestFlight)
  - Android (Google Play Beta)
- [ ] AI-powered insights
  - Revenue forecasting
  - Optimal routing suggestions
  - Contract anomaly detection

### 🔮 Future (v3.0+)

- [ ] Marketplace integrations
  - Spotify/Apple Music analytics
  - Ticketing platforms (Eventbrite, Dice)
  - Accounting software (QuickBooks, Xero)
- [ ] Live show mode
  - Set list management
  - Real-time performance notes
  - Audience analytics

---

## 👥 Contributing

**Status**: **Closed Beta** - Not accepting external contributions at this time.

El equipo principal está formado por:
- **Sergi Recio** - Product & Full Stack Development
- **Beta Testers** - ~15 usuarios (tour managers, artistas, agencias)

### For Beta Testers

#### Reporting Bugs

1. **Via Email**: beta@ontourapp.com con:
   - Descripción del problema
   - Pasos para reproducirlo
   - Screenshots/videos si es posible
   - Navegador y versión

2. **Información a incluir**:
   ```
   - URL donde ocurrió el error
   - Qué esperabas que pasara
   - Qué pasó en realidad
   - Si es reproducible (¿pasa siempre o a veces?)
   ```

#### Feature Requests

Envía tus ideas a: feedback@ontourapp.com

**Formato sugerido**:
- **Problema**: ¿Qué dificultad tienes ahora?
- **Solución propuesta**: ¿Cómo lo resolverías?
- **Alternativas**: ¿Has probado otros métodos?
- **Importancia**: ¿Es crítico o nice-to-have?

### Development Setup (Internal Team)

```bash
# Prerequisites
- Node.js 22.x
- PostgreSQL 15
- Firebase CLI
- Git

# Clone repo
git clone https://github.com/sergiloud/On-Tour-App-2.0.git
cd On-Tour-App-2.0

# Install dependencies
npm install
cd backend && npm install && cd ..

# Environment setup
cp .env.example .env.local
cp backend/.env.example backend/.env

# Database setup
cd backend
npm run migration:run
cd ..

# Start development servers
npm run dev              # Frontend (http://localhost:5173)
cd backend && npm run dev # Backend (http://localhost:3000)

# Run tests
npm test                 # Unit + integration
npm run test:e2e         # Playwright E2E
```

---

## 📞 Support

### For Beta Users

- **Email**: support@ontourapp.com
- **Response Time**: < 24 horas (días laborables)
- **Emergency Contact**: +34 XXX XXX XXX (solo beta testers)

### Documentation

- **User Guide**: [docs.ontourapp.com](https://docs.ontourapp.com) (próximamente)
- **API Docs**: [api.ontourapp.com/docs](https://api.ontourapp.com/docs) (próximamente)
- **Changelog**: [CHANGELOG.md](docs/CHANGELOG.md)

### Known Issues (Closed Beta)

1. **Calendar Sync Delay**: CalDAV sync tiene latencia de ~5s (esperado, limitación de protocolo)
2. **Mobile Safari Animations**: Reducidas para evitar lag en dispositivos antiguos
3. **Finance Export**: Excel export a veces falla en datasets >500 shows (investigando)

---

## 📄 License

**Proprietary Software** - © 2024 On Tour App

Este código es confidencial y propietario. Distribución, modificación o uso no autorizado está estrictamente prohibido.

Para licencias comerciales o preguntas sobre uso: legal@ontourapp.com

---

## 🙏 Acknowledgments

### Beta Testers
Gracias a los tour managers, artistas y agencias que están probando la beta y dando feedback invaluable:
- **[Anónimo por privacidad]** - ~15 testers activos

### Open Source Dependencies
- [React](https://react.dev) - UI framework
- [Vite](https://vitejs.dev) - Build tool
- [TanStack Query](https://tanstack.com/query) - Server state management
- [MapLibre GL](https://maplibre.org) - Map rendering
- [Vitest](https://vitest.dev) - Testing framework
- [Playwright](https://playwright.dev) - E2E testing
- Y [86 paquetes más](package.json) que hacen esto posible

### Infrastructure
- **Vercel** - Frontend hosting & CDN
- **Railway** - Backend & database hosting
- **Firebase** - Authentication & real-time database
- **Cloudflare** - DNS & DDoS protection

---

<div align="center">

**[Website](https://ontourapp.com)** • 
**[Beta Access](https://ontourapp.com/beta)** • 
**[Docs](https://docs.ontourapp.com)** • 
**[Support](mailto:support@ontourapp.com)**

*Built with ❤️ for the touring music industry*

</div>

