# 📱 Plan de Optimización Móvil - On Tour App (iOS 26 Style)

## 🎯 Concepto Principal
Transformar la app móvil en un sistema operativo tipo iOS 26 donde cada función es una "app" independiente con:
- **Home Screen** con grid de iconos editables
- **Dock** personalizable (4-5 apps favoritas)
- **App Launcher** con animaciones fullscreen
- **Drag & Drop** para reordenar apps
- **Widgets** para información rápida
- **Gestures** nativos (swipe, long-press)
- **Estilo consistente** con la app desktop (ink-900, accent-500, glass effects)

---

## 📊 Arquitectura del Sistema

### Home Screen (Pantalla Principal)
```
┌─────────────────────────────────┐
│  ⏰ 14:30    📶 5G    🔋 87%     │ ← Status Bar
├─────────────────────────────────┤
│                                 │
│   🎵      💰      ✈️      📅    │ ← Grid de Apps (4x5)
│  Shows  Finance  Travel  Calendar│
│                                 │
│   👥      📊      ⚙️      📁    │
│ Contacts Reports Settings Files │
│                                 │
│   🎤      🏛️      🌐      📧    │
│ Artists  Venues   Links   Email │
│                                 │
│   📝      🎨      👤      ➕    │
│  Notes  Branding Profile  More  │
│                                 │
│ ┌─────  Widget Area  ────────┐ │ ← Widgets
│ │  Next Show: Coachella     │ │
│ │  Apr 15 • $50,000        │ │
│ └───────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│  📊   🎵   ✈️   ⚙️   [•••]     │ ← Dock (Customizable)
└─────────────────────────────────┘
  └─ Safe Area Bottom ──────────┘
```

---

## 🏗️ Estructura de Componentes

### 1. SISTEMA PRINCIPAL

#### `MobileOS.tsx` (Container Principal)
```tsx
interface MobileOSState {
  currentView: 'home' | 'app' | 'appSwitcher' | 'search';
  openApp: AppDefinition | null;
  homeLayout: AppLayout;
  dockApps: string[];
}
```

**Features**:
- Gestiona estado global del "OS"
- Maneja transiciones entre vistas
- Controla app abierta actualmente
- Persiste configuración en localStorage

#### `HomeScreen.tsx`
```tsx
interface HomeScreenProps {
  apps: AppDefinition[];
  layout: AppLayout;
  onAppOpen: (app: AppDefinition) => void;
  onLayoutChange: (layout: AppLayout) => void;
}
```

**Features**:
- Grid 4x5 de apps (20 apps visibles)
- Paginación horizontal (swipe entre páginas)
- Modo edición con long-press
- Badges dinámicos (pending shows, notifications)
- Búsqueda tipo Spotlight (swipe down)

---

### 2. COMPONENTES DE UI

#### `AppIcon.tsx`
```tsx
interface AppIconProps {
  id: string;
  name: string;
  gradient: [string, string]; // Degradado tipo iOS
  badge?: number | string;
  size: 'small' | 'medium' | 'large';
  isEditing?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}
```

**Diseño** (siguiendo estilo app):
```css
/* Base glass effect matching desktop */
background: linear-gradient(135deg, var(--gradient-from), var(--gradient-to));
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.05);
box-shadow: 
  0 8px 32px rgba(0, 0, 0, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.1);

/* Active state */
.active {
  background: var(--accent-500);
  box-shadow: 0 0 20px var(--accent-500), /* glow effect */
}
```

**Gradientes por App**:
- Shows: `#8B5CF6 → #EC4899` (Purple to Pink)
- Finance: `#10B981 → #059669` (Green)
- Travel: `#3B82F6 → #1D4ED8` (Blue)
- Calendar: `#EF4444 → #DC2626` (Red)
- Settings: `#64748B → #475569` (Slate)
- Contacts: `#F59E0B → #D97706` (Amber)

#### `Dock.tsx`
```tsx
interface DockProps {
  apps: AppDefinition[];
  maxApps?: number; // default: 5
  onReorder: (apps: string[]) => void;
  onAppOpen: (app: AppDefinition) => void;
}
```

**Features**:
- Fondo glass blur (ink-900/95)
- Drag & drop para reordenar
- Swap con apps del home screen
- Indicador de app activa
- Safe area aware

#### `AppModal.tsx`
```tsx
interface AppModalProps {
  app: AppDefinition;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
```

**Animaciones**:
```tsx
// Slide up from bottom (iOS style)
initial: { y: '100%', scale: 0.9 }
animate: { y: 0, scale: 1 }
exit: { y: '100%', scale: 0.9 }
transition: { type: 'spring', damping: 25, stiffness: 300 }
```

**Header**:
- Back button (chevron left)
- App title
- Actions menu (3 dots)
- Blur background matching desktop

---

### 3. SISTEMA DE APPS

#### `AppDefinition.ts`
```typescript
interface AppDefinition {
  id: string;
  name: string;
  icon: string; // Emoji or component
  gradient: [string, string];
  badge?: () => number | string | null;
  component: React.ComponentType<AppComponentProps>;
  category: 'productivity' | 'finance' | 'travel' | 'settings' | 'other';
  isRemovable: boolean; // Settings/Profile no removibles
  quickActions?: QuickAction[]; // 3D Touch actions
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}
```

#### Apps Core (Incluidas por defecto)

**1. Shows App** 🎵
```tsx
<ShowsApp>
  <ShowsList /> {/* Vista principal */}
  <ShowDetail /> {/* Modal sobre modal */}
  <QuickAdd /> {/* FAB */}
</ShowsApp>
```
- Badge: Número de shows pending
- Quick Actions: Add Show, View Calendar, Filter by Status

**2. Finance App** 💰
```tsx
<FinanceApp>
  <Dashboard /> {/* KPIs + Charts */}
  <Transactions /> {/* Lista virtualizada */}
  <Reports /> {/* P&L, Breakdown */}
</FinanceApp>
```
- Badge: Pending payments count
- Quick Actions: Add Expense, View P&L, Export Report

**3. Travel App** ✈️
```tsx
<TravelApp>
  <Itinerary /> {/* Timeline */}
  <Bookings /> {/* Flights, Hotels */}
  <Map /> {/* Mapa con markers */}
</TravelApp>
```
- Badge: Upcoming trips count
- Quick Actions: Add Flight, Add Hotel, View Map

**4. Calendar App** 📅
```tsx
<CalendarApp>
  <MonthView /> {/* Grid calendario */}
  <AgendaView /> {/* Lista cronológica */}
  <DayView /> {/* Detalle día */}
</CalendarApp>
```
- Badge: Events today
- Quick Actions: Today, Add Event, Week View

**5. Contacts App** 👥
```tsx
<ContactsApp>
  <ContactsList /> {/* Alfabético con index */}
  <ContactDetail /> {/* Perfil + actions */}
  <Groups /> {/* Booking agents, Promoters, etc */}
</ContactsApp>
```
- Badge: New contacts
- Quick Actions: Add Contact, Search, Favorites

**6. Reports App** 📊
```tsx
<ReportsApp>
  <ReportsList /> {/* Templates */}
  <ReportBuilder /> {/* Custom report */}
  <Analytics /> {/* Insights */}
</ReportsApp>
```
- Quick Actions: Generate P&L, Tour Summary, Tax Report

**7. Settings App** ⚙️
```tsx
<SettingsApp>
  <Profile /> {/* User info */}
  <Preferences /> {/* App settings */}
  <Agencies /> {/* Commission setup */}
  <Security /> {/* Auth, Privacy */}
  <About /> {/* Version, Legal */}
</SettingsApp>
```
- No badge
- Quick Actions: Profile, Preferences, Logout

**8. Files App** 📁
```tsx
<FilesApp>
  <Documents /> {/* Contracts, Riders */}
  <Receipts /> {/* Expense receipts */}
  <Photos /> {/* Venue photos */}
</FilesApp>
```
- Badge: Unread documents
- Quick Actions: Scan Document, Upload, Recent

**9. Artists App** 🎤 (Agency view)
```tsx
<ArtistsApp>
  <Roster /> {/* Lista de artistas */}
  <ArtistDetail /> {/* Shows, Finance del artista */}
  <Analytics /> {/* Performance metrics */}
</ArtistsApp>
```

**10. Venues App** 🏛️
```tsx
<VenuesApp>
  <VenuesList /> {/* Venues visitados */}
  <VenueDetail /> {/* Info, capacity, contacto */}
  <Map /> {/* Mapa global */}
</VenuesApp>
```

**11. Links App** 🌐 (Shared links management)
```tsx
<LinksApp>
  <ActiveLinks /> {/* Links compartidos */}
  <CreateLink /> {/* New shared link */}
  <Analytics /> {/* Views, access */}
</LinksApp>
```

**12. Notes App** 📝
```tsx
<NotesApp>
  <NotesList /> {/* Notas por show/tour */}
  <Editor /> {/* Rich text editor */}
  <Tags /> {/* Categorización */}
</NotesApp>
```

---

### 4. WIDGETS SYSTEM

#### `Widget.tsx`
```tsx
interface WidgetProps {
  type: 'small' | 'medium' | 'large';
  app: AppDefinition;
  data: any;
  onTap: () => void;
}
```

**Widgets Disponibles**:

**Next Show Widget** (Medium)
```
┌─────────────────────────┐
│ 🎵 Next Show           │
│ Coachella Festival     │
│ Apr 15, 2025 • 8:00 PM│
│ $50,000 Guarantee      │
└─────────────────────────┘
```

**Finance Summary Widget** (Small)
```
┌──────────────┐
│ 💰 This Month│
│   $125,000   │
│   +12.5% ↑   │
└──────────────┘
```

**Travel Widget** (Medium)
```
┌─────────────────────────┐
│ ✈️ Next Trip           │
│ LAX → JFK              │
│ Tomorrow, 2:30 PM      │
│ Delta 1234             │
└─────────────────────────┘
```

**Calendar Widget** (Small)
```
┌──────────────┐
│  📅 APR 15  │
│   Monday     │
│   3 events   │
└──────────────┘
```

---

### 5. GESTURES & INTERACTIONS

#### Gestures Implementados

**Long Press** (Entrar en modo edición)
```tsx
const longPressProps = useLongPress(() => {
  setEditMode(true);
  navigator.vibrate?.(50); // Haptic feedback
}, 500);
```

**Drag & Drop**
```tsx
// Usando framer-motion drag
<motion.div
  drag
  dragConstraints={parentRef}
  dragElastic={0.1}
  onDragStart={() => setIsDragging(true)}
  onDragEnd={(e, info) => handleDrop(info.point)}
>
  <AppIcon {...props} />
</motion.div>
```

**Swipe Between Pages**
```tsx
const [page, setPage] = useState(0);
const swipeHandlers = useSwipeable({
  onSwipedLeft: () => setPage(p => Math.min(p + 1, maxPages)),
  onSwipedRight: () => setPage(p => Math.max(p - 1, 0)),
  trackMouse: false,
});
```

**Pull to Refresh**
```tsx
const { isRefreshing, pullToRefreshProps } = usePullToRefresh(async () => {
  await syncData();
});
```

**Swipe Down for Search** (Spotlight style)
```tsx
const [searchOpen, setSearchOpen] = useState(false);
const handleSwipeDown = (e) => {
  if (scrollY === 0 && e.deltaY > 50) {
    setSearchOpen(true);
  }
};
```

---

### 6. APP SWITCHER (Multitasking)

#### `AppSwitcher.tsx`
```tsx
interface AppSwitcherProps {
  openApps: OpenApp[];
  onSwitchTo: (app: OpenApp) => void;
  onClose: (app: OpenApp) => void;
}
```

**Activación**: Double-tap home button o swipe up and hold

**UI**:
```
┌─────────────────────────────┐
│                             │
│  ┌─────┐  ┌─────┐  ┌─────┐│
│  │Shows│  │Fin  │  │Trvl ││ ← App cards (horizontal scroll)
│  │     │  │     │  │     ││
│  └─────┘  └─────┘  └─────┘│
│     ×        ×        ×    │ ← Close buttons
│                             │
└─────────────────────────────┘
```

---

### 7. SPOTLIGHT SEARCH

#### `SpotlightSearch.tsx`
```tsx
interface SearchResult {
  type: 'app' | 'show' | 'contact' | 'action';
  title: string;
  subtitle?: string;
  icon: string;
  onSelect: () => void;
}
```

**Búsqueda Universal**:
- Apps (por nombre)
- Shows (por venue, ciudad, fecha)
- Contacts (por nombre, rol)
- Actions ("Add show", "Export report")
- Settings ("Change currency", "Add agency")

**UI**:
```
┌─────────────────────────────┐
│ 🔍 Search                   │
├─────────────────────────────┤
│ 🎵 Coachella Festival       │
│    Apr 15 • $50,000         │
├─────────────────────────────┤
│ 👤 John Doe (Promoter)      │
│    john@promotions.com      │
├─────────────────────────────┤
│ ⚡ Add Show                 │
│    Quick action             │
└─────────────────────────────┘
```

---

### 8. NOTIFICATION CENTER

#### `NotificationCenter.tsx`
**Swipe down from top** → Notificaciones

```
┌─────────────────────────────┐
│  Notifications              │
├─────────────────────────────┤
│ 🎵 Show Reminder            │
│    Coachella in 24 hours    │
│    2h ago                   │
├─────────────────────────────┤
│ 💰 Payment Received         │
│    $50,000 from Live Nation │
│    1d ago                   │
├─────────────────────────────┤
│ ✈️ Flight Check-in          │
│    Delta 1234 opens now     │
│    3h ago                   │
└─────────────────────────────┘
```

**Tipos de Notificaciones**:
- Show reminders (24h, 1h before)
- Payment confirmations
- Travel check-ins
- Shared link access
- Team updates

---

### 9. CONTROL CENTER

#### `ControlCenter.tsx`
**Swipe up from bottom** → Quick toggles

```
┌─────────────────────────────┐
│  ┌────┐  ┌────┐  ┌────┐    │
│  │ 🌙 │  │ 📶 │  │ 🔊 │    │ ← Toggles
│  │Dark│  │Wifi│  │Mute│    │
│  └────┘  └────┘  └────┘    │
│                             │
│  ┌─────────────────────┐   │
│  │ 🔆  ▬▬▬▬▬▬▬▬━━━  │   │ ← Brightness
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ 🔊  ▬▬▬▬▬━━━━━━━  │   │ ← Volume
│  └─────────────────────┘   │
│                             │
│  ┌────┐  ┌────┐  ┌────┐    │
│  │Sync│  │Offl│  │Help│    │ ← Quick actions
│  └────┘  └────┘  └────┘    │
└─────────────────────────────┘
```

---

### 10. PERSISTENCIA & ESTADO

#### `useAppLayout.ts`
```typescript
interface AppLayout {
  pages: AppPage[];
  dock: string[]; // App IDs en el dock
  widgets: WidgetConfig[];
}

interface AppPage {
  id: string;
  apps: (string | null)[]; // 20 slots (4x5)
}

const useAppLayout = () => {
  const [layout, setLayout] = useState<AppLayout>(() => 
    loadFromLocalStorage('mobileOS:layout') || getDefaultLayout()
  );

  const moveApp = (fromIndex: number, toIndex: number, pageId: string) => {
    // Swap apps logic
  };

  const addToDock = (appId: string) => {
    // Add to dock, max 5
  };

  const removeFromDock = (appId: string) => {
    // Remove from dock
  };

  // Auto-save on changes
  useEffect(() => {
    saveToLocalStorage('mobileOS:layout', layout);
  }, [layout]);

  return { layout, moveApp, addToDock, removeFromDock };
};
```

---

## 🎨 TEMA Y ESTILOS

### Colores (Matching Desktop)
```css
:root {
  /* Base colors from desktop */
  --ink-900: #0f172a;
  --accent-500: #fbbf24; /* Yellow/Gold accent */
  --accent-600: #f59e0b;
  
  /* Glass effects */
  --glass-bg: rgba(15, 23, 42, 0.95);
  --glass-border: rgba(255, 255, 255, 0.05);
  
  /* Shadows */
  --shadow-glow: 0 0 20px var(--accent-500);
  --shadow-deep: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

### Typography
```css
/* Matching desktop font stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui;

/* App labels */
.app-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

/* Headers */
.app-header {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
```

### Animaciones
```css
/* Matching desktop motion-safe transitions */
@media (prefers-reduced-motion: no-preference) {
  .app-icon {
    transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  .app-icon:active {
    transform: scale(0.9);
  }
}
```

---

## � ROADMAP DE IMPLEMENTACIÓN

### **Sprint 1: Core System** (Semana 1)
- [ ] MobileOS container con routing
- [ ] AppDefinition types & registry
- [ ] HomeScreen con grid estático
- [ ] AppIcon component base
- [ ] AppModal con animaciones

### **Sprint 2: Interactividad** (Semana 2)  
- [ ] Dock component
- [ ] Drag & Drop system
- [ ] Long-press para edit mode
- [ ] Page pagination (swipe)
- [ ] Persistencia layout

### **Sprint 3: Apps Core** (Semana 3)
- [ ] Shows App wrapper
- [ ] Finance App wrapper
- [ ] Travel App wrapper
- [ ] Calendar App wrapper
- [ ] Settings App wrapper

### **Sprint 4: Advanced Features** (Semana 4)
- [ ] Spotlight Search
- [ ] App Switcher
- [ ] Widgets system
- [ ] Notification Center
- [ ] Control Center

### **Sprint 5: Polish** (Semana 5)
- [ ] Animaciones refinadas
- [ ] Haptic feedback
- [ ] Performance optimization
- [ ] Testing en dispositivos reales
- [ ] Accessibility (VoiceOver)

---

## 🎯 CARACTERÍSTICAS CLAVE

### Personalización Total
✅ Reordenar apps con drag & drop
✅ Dock personalizable (4-5 apps favoritas)
✅ Múltiples páginas de apps
✅ Widgets configurables
✅ Temas (siguiendo theme system desktop)

### Gestures Nativos
✅ Swipe between pages
✅ Long-press to edit
✅ Pull to refresh
✅ Swipe to go back
✅ Pinch to close app

### Multitasking
✅ App switcher (apps recientes)
✅ Background app state preservation
✅ Quick app switching
✅ Picture-in-picture (para videos)

### Productividad
✅ Spotlight search universal
✅ Quick actions (3D Touch style)
✅ Shortcuts automation
✅ Siri-like voice commands (futuro)

---

## 📏 ESPECIFICACIONES TÉCNICAS

### Breakpoints
```typescript
const MOBILE_OS_BREAKPOINT = 768; // Show mobile OS below this
const TABLET_MODE = 1024; // Hybrid mode tablet
```

### Performance Targets
- **App Launch**: < 200ms
- **Page Transition**: 60fps
- **Drag Response**: < 16ms
- **Search Results**: < 100ms

### Accessibility
- VoiceOver support completo
- Minimum touch targets: 44x44px
- Color contrast ratio: 4.5:1
- Keyboard navigation support

---

## 🚀 PRÓXIMOS PASOS

1. **Crear estructura base de MobileOS**
2. **Implementar HomeScreen con grid**
3. **Desarrollar AppIcon component**
4. **Integrar drag & drop**
5. **Wrapper primera app (Shows)**
6. **Testing iterativo**

¿Comenzamos con la implementación del MobileOS container y HomeScreen? 🎨

---

## 📱 FASE 1: NAVEGACIÓN MÓVIL (4-6 horas)

### 1.1 Bottom Navigation Bar
**Objetivo**: Navegación principal accesible con el pulgar

**Implementación**:
```tsx
// src/components/mobile/BottomNav.tsx
interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
  badge?: number;
}

const MAIN_TABS: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: <HomeIcon />, path: '/dashboard' },
  { id: 'shows', label: 'Shows', icon: <CalendarIcon />, path: '/dashboard/shows' },
  { id: 'finance', label: 'Finance', icon: <ChartIcon />, path: '/dashboard/finance' },
  { id: 'travel', label: 'Travel', icon: <PlaneIcon />, path: '/dashboard/travel' },
  { id: 'more', label: 'More', icon: <DotsIcon />, path: '/dashboard/more' },
];
```

**Features**:
- Fixed bottom position (iOS safe area aware)
- Active state con animación
- Badge support (pending items)
- Haptic feedback en tap (Vibration API)
- Smooth transitions entre tabs

**Archivos a crear**:
- `src/components/mobile/BottomNav.tsx`
- `src/components/mobile/MoreMenu.tsx` (drawer con opciones secundarias)
- `src/hooks/useBottomNavVisibility.ts` (hide on scroll down)

### 1.2 Mobile Header
**Objetivo**: Header compacto con acciones contextuales

**Features**:
- Sticky header con shadow on scroll
- Breadcrumb compacto (iconos en lugar de texto)
- Actions menu (3 dots) para acciones secundarias
- Search bar expandible
- Profile/Org switcher accesible

**Archivos a modificar**:
- `src/components/layout/Header.tsx` → añadir variante mobile
- Crear `src/components/mobile/MobileHeader.tsx`

### 1.3 Gesture-based Drawer
**Objetivo**: Sidebar accesible mediante swipe desde borde izquierdo

**Features**:
- Swipe desde borde izquierdo para abrir
- Overlay con blur backdrop
- Swipe down/up para cerrar
- Configuración, perfil, orgs, logout

**Librería sugerida**: `framer-motion` (ya instalada) o `react-spring`

---

## 🎨 FASE 2: OPTIMIZACIÓN DE VISTAS CLAVE (8-12 horas)

### 2.1 Shows Board (Mobile)

#### **Vista List (Default Mobile)**
```tsx
// Componente nuevo: src/components/shows/ShowsListMobile.tsx
- Card compacto por show (80px height)
- Swipe actions: Edit, Delete, Duplicate
- Pull to refresh
- Infinite scroll con skeleton loaders
- Quick filters sticky (Offer/Confirmed/Pending chips)
- Search bar colapsable
```

#### **Vista Kanban (Opcional Mobile)**
```tsx
// Adaptar: src/components/shows/ShowsBoard.tsx
- Columnas horizontales scrollables (snap scroll)
- Cards más pequeños (60px)
- Drag & drop simplificado (hold to drag)
- Haptic feedback en drop
```

#### **Vista Calendario Mobile**
```tsx
// Nuevo: src/components/calendar/MobileCalendar.tsx
- Month view default (compact)
- Swipe left/right para cambiar mes
- Tap en día → mini drawer con shows
- Agenda view como alternativa (lista cronológica)
```

**Archivos**:
- `src/components/shows/ShowsListMobile.tsx` (nuevo)
- `src/components/shows/ShowCardCompact.tsx` (nuevo)
- `src/components/calendar/MobileCalendar.tsx` (nuevo)
- `src/hooks/usePullToRefresh.ts` (nuevo)
- `src/hooks/useInfiniteScroll.ts` (nuevo)

### 2.2 Finance Dashboard (Mobile)

#### **Overview Screen**
```tsx
// Adaptar: src/components/finance/v2/DashboardTab.tsx
- Period selector como horizontal scroll chips
- KPI cards en carousel (swipe horizontal)
- Charts: stack vertical en lugar de grid
- Pie chart: full width, tap para detalles
- Waterfall chart: horizontal scroll
```

#### **Transactions Table**
```tsx
// Nuevo: src/components/finance/v2/TransactionsListMobile.tsx
- Lista virtualizada (react-window)
- Card por transacción con swipe actions
- Group by date (sticky headers)
- Bottom sheet para filtros
- Export via share API
```

#### **P&L Table Mobile**
```tsx
// Nuevo: src/components/finance/v2/PLTableMobile.tsx
- Acordeón: tap row para expandir detalles
- Horizontal scroll para múltiples períodos
- Sticky first column (show name)
- Totals row sticky bottom
```

**Archivos**:
- `src/components/finance/v2/DashboardTabMobile.tsx` (nuevo)
- `src/components/finance/v2/TransactionsListMobile.tsx` (nuevo)
- `src/components/finance/v2/PLTableMobile.tsx` (nuevo)
- `src/components/mobile/BottomSheet.tsx` (component reutilizable)
- `src/hooks/useVirtualList.ts` (wrapper react-window)

### 2.3 Travel Planner (Mobile)

#### **Itinerary View**
```tsx
// Nuevo: src/components/travel/MobileItinerary.tsx
- Timeline vertical con cards por día
- Swipe horizontal en card para ver opciones (hotel, vuelo, transfer)
- Map view: full screen modal con markers
- Quick actions FAB: Add flight, Add hotel
```

#### **Booking Flow**
```tsx
// Optimizar: src/components/travel/BookingModal.tsx → MobileBookingFlow.tsx
- Multi-step wizard (progress indicator top)
- Full screen en mobile
- Inputs optimizados para mobile keyboards
- Autocomplete con bottom sheet results
```

**Archivos**:
- `src/components/travel/MobileItinerary.tsx` (nuevo)
- `src/components/travel/TravelCard.tsx` (compact card)
- `src/components/travel/MobileBookingFlow.tsx` (nuevo)
- `src/components/mobile/StepWizard.tsx` (reutilizable)

### 2.4 Show Detail Modal → Fullscreen Mobile

**Adaptación**:
```tsx
// Modificar: src/components/shows/ShowDetailModal.tsx
- Fullscreen en mobile (height: 100vh)
- Sticky header con save/close
- Tabs horizontales scrollables
- Inputs con type correcto (tel, email, url, date)
- Agency selectors: bottom sheet en lugar de dropdown
- Financial breakdown: accordion expandible
```

**Features adicionales**:
- Auto-save draft (local storage)
- Offline queue si no hay conexión
- Image upload optimizado (compression)

---

## 👆 FASE 3: TOUCH & GESTURES (4-6 horas)

### 3.1 Swipe Actions en Listas
**Implementación**: `react-swipeable-list` o custom con `framer-motion`

**Aplicar en**:
- Shows list → Edit, Delete, Duplicate, Archive
- Transactions list → Edit, Delete, Mark as paid
- Contacts list → Edit, Delete, Message

**Features**:
- Swipe threshold configurable
- Haptic feedback
- Undo snackbar después de delete
- Color coding (green = confirm, red = delete, blue = info)

### 3.2 Pull to Refresh
**Hook reutilizable**: `src/hooks/usePullToRefresh.ts`

**Aplicar en**:
- Shows board
- Finance dashboard
- Travel itinerary
- Contacts list

**Implementación**:
```tsx
const { isRefreshing, pullToRefreshProps } = usePullToRefresh(async () => {
  await HybridShowService.syncFromCloud(userId);
  await queryClient.invalidateQueries(['shows']);
});

return (
  <div {...pullToRefreshProps}>
    {isRefreshing && <RefreshSpinner />}
    {/* content */}
  </div>
);
```

### 3.3 Long Press Actions
**Use cases**:
- Shows board card → Quick actions menu
- Calendar date → Add show
- Transaction → Mark as paid

**Hook**: `src/hooks/useLongPress.ts`
```tsx
const longPressProps = useLongPress(() => {
  navigator.vibrate(50);
  showContextMenu();
}, 500);
```

---

## ⚡ FASE 4: PERFORMANCE & UX (6-8 horas)

### 4.1 Virtualización de Listas Largas

**Componente base**: `src/components/mobile/VirtualList.tsx`
```tsx
// Wrapper de @tanstack/react-virtual
interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  estimateSize: number;
  overscan?: number;
}
```

**Aplicar en**:
- Shows list (100+ shows)
- Transactions list (1000+ transactions)
- Contacts list
- P&L table rows

**Mejora esperada**: 60fps con 10,000+ items

### 4.2 Optimización de Imágenes

**Implementar**:
```tsx
// src/components/mobile/OptimizedImage.tsx
- Lazy loading con Intersection Observer
- Blur placeholder (low quality image placeholder)
- WebP with JPEG fallback
- Responsive sizes (srcSet)
- Cache con service worker
```

**Aplicar en**:
- Venue photos
- Artist photos
- Contact avatars

### 4.3 Skeleton Loaders

**Crear biblioteca**:
```
src/components/mobile/skeletons/
  - ShowCardSkeleton.tsx
  - TransactionSkeleton.tsx
  - ChartSkeleton.tsx
  - TableSkeleton.tsx
```

**Features**:
- Shimmer animation
- Match real component dimensions
- Dark mode support

### 4.4 Progressive Enhancement

**Network-aware features**:
```tsx
// src/hooks/useNetworkStatus.ts
const { isOnline, effectiveType } = useNetworkStatus();

// Reducir calidad si 2G/3G
const imageQuality = effectiveType === '4g' ? 'high' : 'low';

// Disable auto-refresh si offline
const shouldAutoRefresh = isOnline && effectiveType !== 'slow-2g';
```

### 4.5 Reducir Bundle Size

**Acciones**:
1. **Code splitting por ruta** (ya implementado ✅)
2. **Lazy load heavy components**:
   ```tsx
   const MapView = lazy(() => import('./MapView'));
   const ChartComponent = lazy(() => import('./Chart'));
   ```
3. **Tree-shake unused Tailwind** (verificar `tailwind.config.js`)
4. **Comprimir assets**: Optimize images, minify SVGs
5. **Remove unused dependencies**: Audit con `npx depcheck`

**Target**:
- Initial bundle: < 200KB (gzip)
- Total bundle: < 800KB
- Time to Interactive: < 3s (3G)

---

## 🚀 FASE 5: FEATURES MÓVIL-ESPECÍFICOS (6-10 horas)

### 5.1 Offline-First Architecture

**Implementar**:
```tsx
// src/lib/offlineQueue.ts ya existe ✅
// Mejorar UI feedback:

// src/components/mobile/OfflineIndicator.tsx
- Banner sticky top cuando offline
- Queue count badge
- Sync progress bar
- Retry failed operations
```

**Features**:
- Conflict resolution UI (server vs local)
- Last synced timestamp visible
- Manual sync button

### 5.2 Native Share API

```tsx
// src/hooks/useNativeShare.ts
const shareShow = async (show: Show) => {
  if (navigator.share) {
    await navigator.share({
      title: show.name,
      text: `${show.venue} - ${show.city}`,
      url: `${window.location.origin}/shows/${show.id}`,
    });
  } else {
    copyToClipboard(shareUrl);
  }
};
```

**Aplicar en**:
- Shows → Share itinerary
- Finance → Export report
- Contacts → Share vCard

### 5.3 Push Notifications (Opcional)

**Use cases**:
- Show reminders (24h before)
- Payment due dates
- Travel booking confirmations
- Team updates

**Implementación**:
```tsx
// src/services/pushNotificationService.ts
- Request permission
- Subscribe to FCM topics
- Handle foreground notifications
- Deep linking a vistas específicas
```

### 5.4 Biometric Auth (Opcional)

**Feature**:
- FaceID/TouchID/Fingerprint para login rápido
- WebAuthn API
- Fallback a PIN

**Implementación**:
```tsx
// src/lib/biometricAuth.ts
const isBiometricAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
```

### 5.5 Camera Integration

**Use cases**:
- Scan venue contracts (OCR)
- Photo receipts para expenses
- Upload artist photos

**Implementación**:
```tsx
// src/hooks/useCamera.ts
const { capturePhoto, isCapturing } = useCamera({
  maxWidth: 1200,
  quality: 0.8,
  format: 'webp'
});
```

### 5.6 Voice Input (Opcional)

**Feature**: Dictar notas de shows mediante Web Speech API
```tsx
// src/hooks/useVoiceInput.ts
const { transcript, isListening, startListening } = useVoiceInput();
```

---

## 🎨 DISEÑO & TOKENS MOBILE

### Breakpoints Responsive
```css
/* styles/tokens.css */
--mobile-sm: 375px;  /* iPhone SE */
--mobile-md: 390px;  /* iPhone 12/13/14 */
--mobile-lg: 430px;  /* iPhone 14 Pro Max */
--tablet: 768px;
--desktop: 1024px;
```

### Touch Targets
```css
/* Minimum 44x44px (Apple HIG) / 48x48px (Material Design) */
--touch-target-min: 44px;
--button-height-mobile: 48px;
--input-height-mobile: 52px;
```

### Safe Areas (iOS)
```css
/* Respect iPhone notch & home indicator */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### Typography Mobile
```css
--text-xs-mobile: 12px;
--text-sm-mobile: 14px;
--text-base-mobile: 16px; /* Body default */
--text-lg-mobile: 18px;
--text-xl-mobile: 20px;
--text-2xl-mobile: 24px;
--text-3xl-mobile: 28px; /* Headers */
```

### Spacing Mobile
```css
--spacing-mobile-xs: 8px;
--spacing-mobile-sm: 12px;
--spacing-mobile-md: 16px;
--spacing-mobile-lg: 24px;
--spacing-mobile-xl: 32px;
```

---

## 📦 DEPENDENCIAS ADICIONALES

### Necesarias
```json
{
  "@tanstack/react-virtual": "^3.0.0",     // Virtualización listas
  "react-window": "^1.8.10",                // Alternativa virtualización
  "framer-motion": "^10.16.0",              // Ya instalado ✅ (animaciones)
  "react-swipeable": "^7.0.1",              // Swipe gestures
  "react-use-gesture": "^9.1.3"             // Touch gestures avanzados
}
```

### Opcionales
```json
{
  "workbox-window": "^7.0.0",               // Better service worker
  "idb-keyval": "^6.2.1",                   // IndexedDB simple API
  "compress.js": "^2.1.5",                  // Image compression
  "tesseract.js": "^5.0.0"                  // OCR para receipts
}
```

---

## 🧪 TESTING MOBILE

### Device Testing Matrix
| Device | Viewport | Priority |
|--------|----------|----------|
| iPhone SE (3rd) | 375x667 | Alta |
| iPhone 13/14 | 390x844 | Alta |
| iPhone 14 Pro Max | 430x932 | Media |
| Samsung S21 | 360x800 | Media |
| iPad Mini | 768x1024 | Baja |

### Performance Budgets
```yaml
Mobile (3G):
  - FCP: < 1.8s
  - LCP: < 2.5s
  - TTI: < 3.8s
  - TBT: < 300ms
  - CLS: < 0.1

Mobile (4G):
  - FCP: < 1.0s
  - LCP: < 1.5s
  - TTI: < 2.0s
  - TBT: < 150ms
```

### Lighthouse CI
```json
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:5173/dashboard"],
      "settings": {
        "preset": "desktop",
        "throttling": {
          "cpuSlowdownMultiplier": 4
        }
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

---

## 📅 ROADMAP DE IMPLEMENTACIÓN

### Sprint 1 (Semana 1) - Fundamentos
- [ ] Bottom Navigation Bar
- [ ] Mobile Header
- [ ] Drawer Navigation
- [ ] Shows List Mobile View
- [ ] Show Detail Modal Fullscreen

**Entregable**: Navegación móvil funcional + Shows mobile-friendly

### Sprint 2 (Semana 2) - Finance & Performance
- [ ] Finance Dashboard Mobile
- [ ] Transactions List Mobile
- [ ] P&L Table Mobile
- [ ] Virtualización de listas
- [ ] Skeleton loaders

**Entregable**: Finance completamente optimizado para móvil

### Sprint 3 (Semana 3) - Gestures & UX
- [ ] Swipe actions en listas
- [ ] Pull to refresh
- [ ] Long press menus
- [ ] Travel Mobile View
- [ ] Calendar Mobile View

**Entregable**: Interacciones táctiles nativas

### Sprint 4 (Semana 4) - Polish & Features
- [ ] Optimización de imágenes
- [ ] Offline indicator mejorado
- [ ] Native share API
- [ ] Performance audit & fixes
- [ ] Testing en dispositivos reales

**Entregable**: App mobile production-ready

### Sprint 5 (Opcional) - Advanced Features
- [ ] Push notifications
- [ ] Biometric auth
- [ ] Camera integration
- [ ] Voice input
- [ ] PWA install prompt

---

## 🎯 MÉTRICAS DE ÉXITO

### Cuantitativas
- **Performance Score**: > 90 (Lighthouse Mobile)
- **Accessibility**: > 95
- **Bundle Size**: < 200KB initial
- **Time to Interactive**: < 3s (3G)
- **Core Web Vitals**: All green

### Cualitativas
- **Navegación**: 1 tap para acciones principales
- **Scroll Performance**: 60fps consistente
- **Touch Targets**: 100% accesibles
- **Offline Experience**: Sin errores, feedback claro
- **User Feedback**: > 4.5/5 en mobile usability

---

## 📚 RECURSOS & REFERENCIAS

### Design Systems Mobile
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Mobile](https://m3.material.io/)
- [Inclusive Components](https://inclusive-components.design/)

### Performance
- [Web.dev Mobile Performance](https://web.dev/fast/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [React Performance](https://react.dev/learn/render-and-commit)

### Libraries
- [@tanstack/react-virtual](https://tanstack.com/virtual/latest)
- [Framer Motion](https://www.framer.com/motion/)
- [React Use Gesture](https://use-gesture.netlify.app/)

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Crear componente BottomNav** (1-2h)
2. **Adaptar Shows List para mobile** (2-3h)
3. **Implementar pull-to-refresh** (1h)
4. **Testing en dispositivos reales** (ongoing)

**¿Por dónde empezamos?** 🎨
