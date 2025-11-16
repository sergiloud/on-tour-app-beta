# On Tour App v2.2.2 - Descripción Completa de la Aplicación

## 📋 Resumen Ejecutivo

On Tour App es una plataforma integral de gestión para la industria musical, diseñada específicamente para artistas, agencias y venues. La aplicación combina gestión financiera de alto rendimiento, planificación de giras, reservas de viajes y herramientas colaborativas en una PWA moderna con arquitectura multi-tenant.

**Estado Actual**: v2.2.2 - Producción estable con WASM Financial Engine implementado

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico Principal
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js con TypeScript
- **Base de Datos**: Firebase Firestore + PostgreSQL (TypeORM)
- **Motor Financiero**: WebAssembly (WASM) con fallback JavaScript
- **Estilo**: TailwindCSS con tokens personalizados
- **Estado**: React Context + Zustand stores
- **Internacionalización**: Sistema i18n personalizado (EN/ES)
- **Despliegue**: Vercel con CI/CD automático

### Arquitectura de Componentes
```
src/
├── features/           # Vertical feature slices
│   ├── finance/       # Sistema financiero completo
│   ├── dashboard/     # Panel principal y navegación
│   └── travel/        # Gestión de viajes y logística
├── shared/            # Utilidades compartidas
├── lib/               # Bibliotecas y servicios core
├── context/           # React Contexts globales
├── components/        # Componentes reutilizables
└── pages/             # Páginas y rutas principales
```

---

## 💰 Sistema Financiero (WASM Engine)

### Características Principales
- **Motor de Cálculo WASM**: Procesamiento de alta velocidad para cálculos financieros complejos
- **Fallback JavaScript**: Degradación automática en entornos sin soporte WASM
- **Web Workers**: Procesamiento paralelo para evitar bloqueo de UI
- **Cálculos en Tiempo Real**: KPIs y métricas actualizadas instantáneamente

### Componentes Financieros
```typescript
// Motor financiero principal
src/lib/wasmFinancialEngine.ts
- Detección automática de capacidades WASM
- Fallback transparente a JavaScript
- Manejo de errores y notificaciones

// Proveedores de datos
src/context/KPIDataProvider.tsx
- Contexto para datos KPI globales
- Selectores memoizados para rendimiento
- Hooks personalizados: useKpi(), useFinanceData()

// Componentes de UI
src/features/finance/components/
├── KPICards.tsx           # Tarjetas de métricas principales
├── ExpenseTracker.tsx     # Seguimiento de gastos
├── RevenueChart.tsx       # Gráficos de ingresos
└── FinancialReports.tsx   # Reportes y exportación
```

### KPIs y Métricas
- **Ingresos Totales**: Suma de todos los shows confirmados
- **Gastos**: Tracking categorizado de expenses
- **Margen Neto**: Cálculo automático de rentabilidad
- **Proyecciones**: Análisis predictivo basado en datos históricos
- **ROI por Show**: Rentabilidad individual por evento

---

## 🗓️ Sistema de Dashboard y Calendario

### Dashboard Principal
```typescript
// Página principal del dashboard
src/pages/dashboard/Summary.tsx
- Vista unificada de todos los módulos
- Navegación rápida a secciones específicas
- Widgets de estado y notificaciones
- Accesos directos a acciones frecuentes

// Gestión de shows
src/shared/showStore.ts
- Store centralizado para datos de shows
- Persistencia en localStorage
- Suscripciones reactivas
- Filtros y búsquedas avanzadas
```

### Sistema de Calendario
- **Vista Mensual**: Calendario completo con eventos
- **Vista Semanal**: Planning detallado por semana
- **Vista Diaria**: Agenda específica con horarios
- **Gestión de Eventos**: CRUD completo para shows y eventos
- **Tipos de Eventos**: Shows, Travel, Meetings, Press, etc.

### Funcionalidades del Calendario
```typescript
// Componentes de calendario
src/pages/dashboard/Calendar.tsx
- Múltiples vistas (Mes/Semana/Día/Agenda)
- Drag & drop para reorganización
- Modales de edición contextual
- Integración con sistema de viajes
- Timezone awareness
- Export/Import de eventos
```

---

## ✈️ Sistema de Viajes y Logística

### Travel Workspace
```typescript
// Workspace principal de viajes
src/features/travel/workspace/TravelWorkspace.tsx
- Vista unificada de búsqueda y planificación
- Panel izquierdo: búsquedas y sugerencias
- Panel derecho: vista lista/timeline semanal
- Sistema de pins para comparar opciones
- Integración con proveedores de vuelos
```

### Componentes de Viaje
```typescript
// Búsqueda inteligente de vuelos
src/features/travel/components/SmartFlightSearch/
├── SmartFlightSearch.tsx    # Componente principal de búsqueda
├── FlightProvider.tsx       # Abstracción de proveedores
└── PinnedDrawer.tsx        # Sistema de comparación

// Gestión de itinerarios
src/components/travel/
├── AddFlightModal.tsx      # Modal para añadir vuelos
├── TripList.tsx           # Lista de viajes planificados
├── FlightSearchResults.tsx # Resultados de búsqueda
└── TravelSuggestions.tsx  # Sugerencias inteligentes
```

### Proveedores de Vuelos
- **Mock Provider**: Datos de prueba para desarrollo
- **Google Flights**: Deep links para comparación de precios
- **Amadeus API**: Integración con servicio real de vuelos (backend)
- **Sistema de Reservas**: Lookup inteligente por código de reserva

### Funcionalidades de Viaje
- **Búsqueda Multi-Proveedor**: Comparación de opciones
- **Vista Timeline**: Planificación visual por semanas
- **Sistema de Pins**: Marcar y comparar vuelos favoritos
- **Trip Builder**: Construcción de itinerarios completos
- **Deep Links**: Enlaces directos a sitios de reserva

---

## 👥 Sistema Multi-Tenant y Organizaciones

### Arquitectura Multi-Tenant
```typescript
// Sistema de tenants
src/lib/tenants.ts
- Organizaciones: Artists, Agencies, Venues
- Membresías con roles: Owner, Manager, Member
- Teams y colaboración interna
- Links entre organizaciones (agency ↔ artist)
- Configuraciones por organización
```

### Tipos de Organizaciones
- **Artist**: Artistas individuales o bandas
- **Agency**: Agencias de booking y management
- **Venue**: Venues y promotores de eventos

### Sistema de Roles
- **Owner**: Control total, no removible
- **Manager**: Gestión de miembros y datos
- **Member**: Edición de shows/finanzas, sin gestión de usuarios
- **Viewer**: Solo lectura

### Funcionalidades Multi-Tenant
```typescript
// Hooks de organizaciones
src/hooks/useOrganizations.ts
- Creación y gestión de organizaciones
- Sistema de invitaciones
- Cambio de contexto organizacional
- RBAC (Role-Based Access Control)
- Auditoría de acciones
```

---

## 🔐 Autenticación y Seguridad

### Sistema de Autenticación Híbrido
```typescript
// Servicio de autenticación
src/services/authService.ts
- Firebase Auth (producción)
- Demo Auth (desarrollo/testing)
- OAuth providers: Google, Apple
- Persistencia de sesiones
- Password reset y recuperación
```

### Características de Seguridad
- **Encrypted Storage**: Datos sensibles encriptados
- **Session Management**: Manejo seguro de sesiones
- **Rate Limiting**: Protección contra ataques
- **CORS Protection**: Configuración estricta de CORS
- **Input Validation**: Validación exhaustiva de datos

### Demo vs Producción
```typescript
// Demo authentication
src/lib/demoAuth.ts
- Sistema de usuarios demo
- Perfiles y preferencias persistentes
- Organizaciones de prueba
- Data seeding automático

// Production authentication
backend/src/middleware/auth.ts
- JWT validation
- Firebase Admin SDK
- Tenant isolation
- Rate limiting
```

---

## 🎨 Interfaz de Usuario y UX

### Sistema de Diseño
```css
/* Tokens de diseño */
styles/tokens.css
- Variables CSS personalizadas
- Esquemas de color dark/light
- Tipografía y espaciado consistente
- Componentes glassmorphism
```

### Componentes UI Principales
```typescript
// Componentes base
src/components/
├── common/              # Componentes comunes
│   ├── PageHeader.tsx   # Headers consistentes
│   ├── LoadingStates.tsx # Estados de carga
│   └── EmptyStates.tsx  # Estados vacíos
├── forms/               # Elementos de formulario
└── layout/              # Layout y navegación
```

### Características UX
- **Responsive Design**: Adaptación completa mobile/desktop
- **Dark/Light Mode**: Soporte completo de temas
- **High Contrast**: Modo de alto contraste para accesibilidad
- **Progressive Enhancement**: Funcionalidad incremental
- **Keyboard Navigation**: Navegación completa por teclado
- **Screen Reader Support**: Compatibilidad con lectores de pantalla

---

## 📱 PWA y Características Móviles

### Progressive Web App
```javascript
// Service Worker
public/sw-v3.js
- Caché estratégico de recursos
- Offline functionality
- Background sync
- Push notifications
- Update management
```

### Integración Mobile
```typescript
// iOS App Integration
src/components/mobile/ios/
├── IOSHomeScreen.tsx    # Pantalla principal iOS
├── apps/                # Apps individuales
│   ├── ShowsApp.tsx     # App de shows
│   ├── FinanceApp.tsx   # App financiera
│   └── TravelApp.tsx    # App de viajes
└── IOSAppProvider.tsx   # Context provider
```

### Funcionalidades PWA
- **Offline Mode**: Funcionamiento sin conexión
- **Install Prompt**: Instalación como app nativa
- **Push Notifications**: Notificaciones en tiempo real
- **Background Sync**: Sincronización en segundo plano
- **App Shell**: Carga rápida de interfaz

---

## 🔧 Backend y APIs

### Express Backend
```typescript
// Estructura del backend
backend/src/
├── routes/              # Endpoints REST
│   ├── shows.ts         # API de shows
│   ├── finance.ts       # API financiera
│   ├── travel.ts        # API de viajes
│   └── organizations.ts # API multi-tenant
├── services/            # Lógica de negocio
└── middleware/          # Autenticación y validación
```

### APIs Principales
- **Shows API**: CRUD completo para eventos
- **Finance API**: Gestión de ingresos y gastos
- **Travel API**: Búsquedas y reservas de vuelos
- **Organizations API**: Multi-tenancy y roles
- **Amadeus Integration**: API real de vuelos
- **Stripe Integration**: Procesamiento de pagos

### Documentación API
- **Swagger/OpenAPI**: Documentación automática
- **Postman Collections**: Colecciones de prueba
- **Rate Limiting**: Límites por endpoint
- **Validation**: Esquemas Zod para validación

---

## 🌐 Internacionalización (i18n)

### Sistema i18n Personalizado
```typescript
// Core i18n
src/lib/i18n.ts
- Diccionario basado en claves
- Soporte EN/ES completo
- Lazy loading de traducciones
- Pluralización automática
- Fallbacks inteligentes
```

### Uso de Traducciones
```typescript
// Ejemplo de uso
import { t } from 'src/lib/i18n';
<h2>{t('finance.quicklook')}</h2>
<p>{t('travel.workspace.open')}</p>
```

### Idiomas Soportados
- **Inglés (EN)**: Idioma principal
- **Español (ES)**: Traducción completa
- **Extensible**: Arquitectura preparada para más idiomas

---

## 📊 Rendimiento y Optimización

### Estrategias de Performance
```typescript
// Prefetch de rutas
src/routes/prefetch.ts
- Precarga inteligente de chunks
- Activación por hover/focus
- Manejo graceful de errores
- No bloqueo de UI
```

### Optimizaciones Implementadas
- **Code Splitting**: División de código por rutas
- **Lazy Loading**: Carga diferida de componentes
- **Memoization**: React.memo y useMemo extensivo
- **Web Workers**: Procesamiento paralelo
- **Virtual Scrolling**: Listas virtualizadas
- **Image Optimization**: Imágenes optimizadas

### Monitoreo y Métricas
- **Performance Monitoring**: Core Web Vitals
- **Error Tracking**: Sentry integration preparada
- **Analytics**: Event tracking opcional
- **Bundle Analysis**: Análisis de tamaño de bundles

---

## 🧪 Testing y Calidad

### Estrategia de Testing
```typescript
// Configuración de tests
vitest.config.ts
- Unit tests con Vitest
- Integration tests con Testing Library
- E2E tests con Playwright
- Coverage reporting
```

### Tipos de Tests
- **Unit Tests**: Componentes y utilidades
- **Integration Tests**: Flujos completos
- **E2E Tests**: Scenarios de usuario final
- **API Tests**: Endpoints del backend
- **Performance Tests**: Métricas de rendimiento

### Herramientas de Calidad
- **TypeScript**: Tipado estricto
- **ESLint**: Linting de código
- **Prettier**: Formateo automático
- **Husky**: Git hooks para calidad

---

## 🚀 Despliegue y DevOps

### Pipeline de Despliegue
```json
// Configuración Vercel
vercel.json
- Build commands optimizados
- Environment variables
- WASM support detection
- Fallback strategies
```

### Estrategia de Despliegue
- **Vercel Hosting**: Despliegue automático
- **GitHub Integration**: CI/CD desde commits
- **Environment Management**: Variables por entorno
- **Rollback Support**: Rollback automático si falla

### Monitoreo de Producción
- **Health Checks**: Endpoints de salud
- **Error Monitoring**: Tracking de errores
- **Performance Metrics**: Métricas de rendimiento
- **Uptime Monitoring**: Monitoreo de disponibilidad

---

## 📋 Estado Actual y Funcionalidades

### ✅ Características Implementadas

#### Sistema Financiero
- ✅ WASM Financial Engine con fallback JavaScript
- ✅ Cálculos KPI en tiempo real
- ✅ Web Workers para procesamiento paralelo
- ✅ Dashboard de métricas financieras
- ✅ Tracking de gastos por categorías
- ✅ Export de reportes financieros

#### Gestión de Shows
- ✅ CRUD completo de eventos
- ✅ Calendario multi-vista (Mes/Semana/Día)
- ✅ Drag & drop para reorganización
- ✅ Filtros avanzados y búsqueda
- ✅ Estados de shows (Confirmed, Pending, etc.)
- ✅ Integración con sistema financiero

#### Sistema de Viajes
- ✅ Travel Workspace unificado
- ✅ Búsqueda multi-proveedor de vuelos
- ✅ Vista timeline semanal
- ✅ Sistema de pins para comparación
- ✅ Deep links a sitios de booking
- ✅ Gestión de itinerarios

#### Multi-Tenancy
- ✅ Organizaciones (Artist/Agency/Venue)
- ✅ Sistema de roles y permisos
- ✅ Invitaciones y gestión de usuarios
- ✅ Configuraciones por organización
- ✅ Links entre organizaciones

#### PWA y Mobile
- ✅ Service Worker con offline support
- ✅ Instalación como app nativa
- ✅ Responsive design completo
- ✅ iOS app integration mockup
- ✅ Push notifications preparadas

#### UX y Accesibilidad
- ✅ Dark/Light mode
- ✅ High contrast mode
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ i18n EN/ES completo

### 🚧 En Desarrollo/Próximamente

#### Integraciones API
- 🚧 Amadeus Flight API (backend implementado, frontend en progreso)
- 🚧 Stripe Payments (estructura preparada)
- 🚧 Calendar sync (Google/Apple)
- 🚧 Slack notifications

#### Funcionalidades Avanzadas
- 🚧 Drag & drop en Travel Timeline
- 🚧 Real-time collaboration
- 🚧 Advanced reporting y analytics
- 🚧 Contract management
- 🚧 CRM system

#### Performance
- 🚧 Server-side rendering
- 🚧 Advanced caching strategies
- 🚧 Database optimization
- 🚧 CDN integration

---

## 🛠️ Desarrollo y Configuración

### Setup del Proyecto
```bash
# Instalación
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Tests
npm test
```

### Variables de Entorno
```bash
# Principales variables
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_AMADEUS_API_KEY=
VITE_STRIPE_PUBLIC_KEY=
```

### Estructura de Comandos
```json
// package.json scripts principales
{
  "dev": "vite",
  "build": "vite build",
  "build:wasm:safe": "SKIP_WASM=true vite build",
  "test": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

---

## 📈 Roadmap y Futuro

### V2.2.3 (Próximo Release)
- Completar integración Amadeus API
- Implementar drag & drop en Travel Timeline
- Optimizaciones de rendimiento
- Más tests de integración

### V2.3.0 (Q1 2024)
- Real-time collaboration
- Advanced contract management
- Enhanced mobile experience
- More API integrations

### V3.0.0 (Q2 2024)
- Full CRM system
- Advanced analytics dashboard
- Multi-language expansion
- Enterprise features

---

## 🤝 Contribución y Mantenimiento

### Convenciones de Código
- **TypeScript Strict**: Tipado estricto obligatorio
- **Component Structure**: Functional components con hooks
- **State Management**: Context + Zustand patterns
- **Testing**: Tests obligatorios para nuevas features
- **Documentation**: JSDoc para funciones públicas

### Git Workflow
- **Feature branches**: `feature/descripcion-funcionalidad`
- **Commits semánticos**: `feat:`, `fix:`, `docs:`, etc.
- **Pull requests**: Review obligatorio
- **CI/CD**: Tests automáticos en cada PR

---

## 📞 Soporte y Contacto

Esta aplicación está en constante desarrollo y evolución. La arquitectura modular y el diseño orientado a features facilita la extensión y mantenimiento continuo.

**Version actual**: v2.2.2  
**Última actualización**: Enero 2024  
**Estado**: Producción estable con WASM Engine