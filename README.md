# On Tour App

**"De caos a control. De datos a decisiones."**

El copiloto inteligente para tus giras musicales. Gestiona shows, finanzas, contratos y logística en una sola plataforma profesional con IA proactiva.

## 🎯 Value Proposition

On Tour App transforma la gestión de tours musicales de Excel caótico a una experiencia inteligente y proactiva:

- ✅ **Cierra contratos más rápido** - E-signature integrada, templates legales
- ✅ **Liquida pagos en 1 clic** - Settlement automático multiparte
- ✅ **Evita imprevistos** - IA predice problemas antes de que ocurran
- ✅ **Trabaja offline** - Sync robusto para tour managers en carretera
- ✅ **Control total** - Finanzas, shows, team, todo en un dashboard

## 🎪 Target Users

- **Indie Artists** (0-50 shows/año): Primera herramienta profesional
- **Tour Managers** (50-200 shows/año): Gestión completa + IA
- **Small Agencies** (2-5 artistas): Multi-roster sin caos
- **Mid-Market** (5-20 artistas): Escalabilidad + API

## 🚀 Key Features

### ⚡ Intelligent Tour Management

- **Quick Entry NLP**: "Madrid tomorrow 8pm €5000" → show completo
- **ActionHub**: Prioriza tareas urgentes automáticamente
- **Tour Health Score**: Detecta problemas logísticos/financieros
- **Kanban Visual**: Arrastra shows por estados
- **Offline-First**: Trabaja sin internet, sync automático

### 💰 Financial Intelligence

- **Real-time Calculations**: Fee neto, profit margins, breakeven
- **Settlement 1-Click**: Distribuye pagos multiparte automáticamente
- **Multi-currency**: Soporte EUR/USD/GBP con conversión real-time
- **Tax Compliance**: Cálculos por país, exports contable
- **Revenue Heatmap**: Visualiza ganancias geográficamente

### 📄 Contracts & Legal

- **E-Signature**: Integración HelloSign para firmas legales
- **Templates**: Riders, contratos, invoices por país
- **Full-Text Search**: Encuentra cualquier cláusula en segundos
- **Audit Trail**: Historial completo de cambios
- **Auto-reminders**: Notificaciones pre-show

### 📨 Centralized Inbox

- **Email Threading**: Conversaciones contextuales por show
- **Smart Parsing**: Attachments automáticos a shows
- **Team Mentions**: @mention para colaboración
- **Status Tracking**: pending/resolved workflows

### 🗺️ Interactive Maps

- **Show Locations**: Visualiza tu tour geográficamente
- **Revenue Heatmap**: Calor = más dinero
- **Route Optimization**: IA sugiere rutas eficientes
- **Venue Database**: Capacidad, specs técnicos, contactos

### 🎨 Premium UX

- **Glassmorphism**: Diseño moderno profesional
- **Dark Mode Adaptativo**: Auto/light/dark con transiciones suaves
- **Mobile-First**: Touch targets 44px+, bottom nav, FAB
- **Accessibility**: WCAG 2.1 AA, screen readers, keyboard nav
- **PWA**: Instalable, push notifications, offline

## 📚 Documentation

**START HERE**: Read [`EXECUTIVE_SUMMARY.md`](EXECUTIVE_SUMMARY.md) for project health status, architecture overview, and readiness assessment.

### Strategic Documents (Latest)

- **Executive Summary**: [`EXECUTIVE_SUMMARY.md`](EXECUTIVE_SUMMARY.md) - 🟢 Project health, architecture, metrics, roadmap
- **Project Status**: [`PROYECTO_ESTADO_ACTUAL.md`](PROYECTO_ESTADO_ACTUAL.md) - Complete current state & phase breakdown
- **Prioritized Roadmap**: [`docs/TODO_PRIORIZADO.md`](docs/TODO_PRIORIZADO.md) - 24 tasks for FASE 6-8
- **Session Summary**: [`SESSION_FASE_6_WEEK_2_COMPLETE.md`](SESSION_FASE_6_WEEK_2_COMPLETE.md) - Latest session accomplishments
- **Phase 6 Week 2 Details**: [`FASE_6_WEEK_2_COMPLETE.md`](FASE_6_WEEK_2_COMPLETE.md) - PostgreSQL, testing, Swagger implementation
- **Maintenance Guide**: [`docs/DOCUMENTATION_MAINTENANCE_GUIDE.md`](docs/DOCUMENTATION_MAINTENANCE_GUIDE.md) - Documentation organization

### Quick Links

- **Current Phase**: [`docs/FASE_5_COMPLETE.md`](docs/FASE_5_COMPLETE.md) - Multi-tab sync & offline support ✅ COMPLETE
- **Project Overview**: [`docs/COMPLETE_PROJECT_DESCRIPTION.md`](docs/COMPLETE_PROJECT_DESCRIPTION.md)
- **Critical Areas**: [`docs/CRITICAL_AREAS_DETAILED.md`](docs/CRITICAL_AREAS_DETAILED.md) - Key challenges & solutions
- **Architecture**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - State management decisions
- **Finance Guide**: [`docs/FINANCE_CALCULATION_GUIDE.md`](docs/FINANCE_CALCULATION_GUIDE.md) - Financial calculations reference
- **Testing**: [`docs/TEST_INFRASTRUCTURE_GUIDE.md`](docs/TEST_INFRASTRUCTURE_GUIDE.md) - Testing patterns & setup
- **E2E Testing**: [`docs/E2E_TESTING_SETUP_GUIDE.md`](docs/E2E_TESTING_SETUP_GUIDE.md) - Playwright setup

### Documentation Reorganization (Nov 2025)

- Cleaned up 143 docs → 65 active docs (54% reduction of obsolete/duplicate content)
- Created [`docs/MASTER_INDEX.md`](docs/MASTER_INDEX.md) as central navigation
- Archived old WEEK\*_, SEMANA_, SESSION\*\_, OPTION\_\_ docs
- Kept only active, relevant documentation

## �🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **State Management**: React Context + custom hooks
- **Data Fetching**: TanStack Query (React Query)
- **Maps**: MapLibre GL
- **Virtualization**: TanStack Virtual
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier

## 📦 Installation

```bash
# Install dependencies
npm install
```

## 🔥 Firebase Configuration

### For Development (Optional)
The app works without Firebase using localStorage. To enable cloud features:

1. Create a Firebase project at https://console.firebase.google.com/
2. Copy `.env.example` to `.env`
3. Add your Firebase credentials to `.env`
4. Enable Authentication and Firestore in Firebase Console

### For Production (Vercel)
If you see OAuth errors on Vercel:

**Error**: `The current domain is not authorized for OAuth operations`

**Fix**: Add your Vercel domain to Firebase authorized domains:
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add: `your-app.vercel.app` and `*.vercel.app`
3. See [FIREBASE_OAUTH_SETUP.md](./FIREBASE_OAUTH_SETUP.md) for detailed steps

**Note**: Email/password authentication works without authorized domains.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Card, etc.)
│   ├── home/           # Landing page components
│   ├── dashboard/      # Dashboard-specific components
│   └── ...
├── context/            # React Context providers
├── features/           # Feature-specific modules
│   ├── finance/        # Financial management
│   ├── travel/         # Travel and logistics
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
├── routes/             # Routing configuration
├── services/           # API services
├── shared/             # Shared state and utilities
├── styles/             # Global styles and tokens
├── types/              # TypeScript type definitions
└── __tests__/          # Test files
```

## 🎨 Design System

### Colors

- **Primary**: Blue gradient (`from-blue-600 to-purple-600`)
- **Accent**: Yellow-green (`#bfff00`)
- **Background**: Dark theme (`ink-900`, `ink-800`, `ink-700`)

### Typography

- **Font Family**: System fonts with fallbacks
- **Scale**: Responsive text sizing (4xl to 7xl for headings)

### Spacing

- **System**: 4px base unit (0.25rem increments)
- **Consistent**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px

## 🔧 Development

### Code Quality

- **ESLint**: Configured with TypeScript and React rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks (v9+)
- **lint-staged**: Run linters on staged files
- **EditorConfig**: Consistent editor settings

### Testing

- **Unit Tests**: Component and utility testing with Vitest
- **Integration Tests**: Feature-level testing
- **Coverage**: Minimum 70% coverage required (branches, functions, lines, statements)
- **E2E**: Playwright for end-to-end testing (planned)

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Type-check and build for production
npm run preview      # Preview production build locally
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage report
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking
npm run validate     # Run type-check, lint, and tests
```

### Performance

- **Bundle Splitting**: Code splitting by route and feature
- **Lazy Loading**: Components and routes loaded on demand
- **Image Optimization**: Responsive images with lazy loading
- **Caching**: React Query for efficient data caching

## 🌐 Internationalization

The app supports multiple languages with a key-based system:

```typescript
import { t } from '../lib/i18n';

// Usage
const title = t('dashboard.title');
```

Add new keys to both `en.ts` and `es.ts` files in `src/lib/i18n/locales/`.

## ♿ Accessibility

- **WCAG 2.1 AA**: Compliant with web accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **Reduced Motion**: Respects user preferences

## 📊 Analytics & Telemetry

Custom telemetry system for user behavior tracking:

```typescript
import { trackEvent } from '../lib/telemetry';

trackEvent('user.action', { action: 'button_click', component: 'hero' });
```

## 🚀 Deployment

### Netlify (Recommended)

```bash
# Build command
npm run build

# Publish directory
dist
```

### Environment Variables

```env
VITE_API_URL=https://api.ontourapp.com
VITE_ENVIRONMENT=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Commit Convention

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Testing
- `chore:` Maintenance

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support, please contact the development team or create an issue in the repository. 2. Add localized label/help keys to both `en` and `es` in `src/lib/i18n.ts` (group fields logically; keep alphabetical inside section when practical). 3. Implement a `usePrevious` (or ref) comparison inside the editor component to guard transitions. 4. Emit events via the central `trackEvent` helper. Never inline string literals. 5. Add tests mirroring real interaction (set → change → clear) and assert ordered emission.

### Edge Cases Covered

- Re-typing identical value (after trimming) → no duplicate event.
- Clearing via select-all + delete → emits `SHOW_VENUE_CLEARED` once.
- Input with trailing spaces that resolves to same normalized value → no `CHANGED` event.
- Rapid sequential changes: each distinct normalized value produces at most one `CHANGED` per transition path.

### i18n Keys

(Ensure both languages are present; names illustrative if you search inside `i18n.ts`.)

```
show.venue.label
show.venue.help
```

Spanish equivalents mirror the same keys with translated values.

### Quality Checklist

- a11y: Input has accessible label (from i18n key) and optional description/help text.
- Telemetry: All three events asserted by test; no console warnings.
- Performance: Comparison is O(1); no additional renders introduced.
- Resilience: Safe if telemetry system is disabled (calls become no-ops).

### Potential Enhancements (Deferred)

- Autocomplete from previously used venue values (client-side LRU list).
- Structured venue object (link to canonical venue directory) with future disambiguation UI.
- Geo enrichment (resolving venue to city / coordinates for routing & travel prefill).
- Inline validation (flag extremely long entries or pure punctuation).

---

## Development (Quick Reference)

Install & run:

```
npm install
npm run dev
```

Run tests (includes venue telemetry tests):

```
npm test
```

---

If you expand this README beyond the venue field later, consider adding: architecture overview, routing & prefetch strategy, i18n workflow, and accessibility conventions.
