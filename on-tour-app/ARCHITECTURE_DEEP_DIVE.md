# Análisis de Arquitectura & Decisiones de Diseño

## Preguntas Estratégicas Respondidas

---

## 1. Web Workers y Rendimiento

### Patrón Actual: FinanceWorkerPool

**Implementación**:

- `src/lib/financeWorkerPool.ts` (300 líneas)
- Pool singleton de máximo 4 workers
- Load balancing + request queuing
- Automatic cleanup cada 5 minutos
- Fallback a sincrónico si falla

```typescript
// Arquitectura actual
FinanceWorkerPool (max 4 workers)
├── finance.optimized.worker.ts (calculations)
├── Load balancer (distribuye tareas)
├── Request queue (max 100 pendientes)
└── Error recovery (recrea workers si fallan)
```

**Estrategia Actual**:

```
✅ Implementado: Finance calculations paralelas
❌ No implementado: Map clustering en workers
❌ No implementado: Smart actions en workers
```

### Recomendación: Extender a Otras Áreas

**Áreas Candidatas** (costo-beneficio):

#### 1. **Map Clustering** (HIGH PRIORITY)

**Problema Actual**:

- `useMapClustering.ts` usa Supercluster en main thread
- 1000+ points = 50-100ms de bloqueo
- UI no responde durante clustering

**Solución**:

```typescript
// src/workers/clustering.worker.ts
self.onmessage = event => {
  const { points, zoom, bounds } = event.data;
  const cluster = new Supercluster({ radius: 60, maxZoom: 16 });
  cluster.load(points);
  const clusters = cluster.getClusters(bounds, zoom);
  self.postMessage({ clusters });
};

// src/hooks/useMapClusteringWorker.ts
export function useMapClusteringWorker(shows, zoom, bounds) {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    const worker = workerPool.execute({
      type: 'cluster',
      points: shows,
      zoom,
      bounds,
    });
    worker.then(setClusters);
  }, [shows, zoom, bounds]);

  return clusters;
}
```

**Impacto**:

- ✅ 50-100ms de latencia eliminada
- ✅ Smooth zoom/pan interactions
- ✅ 1000+ points sin lag

#### 2. **Smart Actions Analysis** (MEDIUM PRIORITY)

**Problema Actual**:

- useSmartActions probablemente hace análisis complejo
- Main thread puede bloquearse

**Solución**:

```typescript
// Delegado a worker para:
- Risk scoring (weighted calculations)
- Pattern detection (gaps, clusters)
- Recommendation ranking
```

#### 3. **Data Processing (CSV/Import)** (LATER)

**Nota**: Removimos los importadores, pero si se re-agregan:

- Validación masiva de datos
- Parsing/transformación
- Deduplicación
- Normalization

### Patrón Recomendado: Worker Pool Extensible

```typescript
// src/lib/workerPool.ts (generalizado)
export class GeneralWorkerPool {
  private workers: Map<WorkerType, Worker[]> = new Map();

  async execute<T>(
    type: 'finance' | 'clustering' | 'smartactions' | 'processing',
    payload: any
  ): Promise<T> {
    const pool = this.getOrCreatePool(type);
    return this.distributeToLeastBusyWorker(pool, payload);
  }
}

export const workerPool = new GeneralWorkerPool();
```

**Timeline Sugerido**:

- **Semana 1**: Map clustering (más impacto visual)
- **Semana 2**: Smart actions analysis
- **Semana 3**: Data processing (si se necesita)

---

## 2. Estrategia de Estado Global

### Análisis Actual: Tres Sistemas Coexistentes

**Sistema 1: React Context**

```typescript
// Contexts (9 total)
SettingsContext    → User preferences + formatting
DashboardContext   → Filters, view state
FinanceContext     → Period selection, breakdown
AuthContext        → Auth state
MissionControlContext → UI control (modal focus)
OrgContext         → Organization data
KPIDataContext     → KPI calculations
HighContrastContext → Accessibility
ShowModalContext   → Show editor modal
```

**Características**:

- ✅ Local state (UI-focused)
- ✅ No persisten en servidor
- ✅ Cambios rápidos (sync)
- ✅ Simple debugging

**Sistema 2: Custom Store (showStore)**

```typescript
// src/shared/showStore.ts
class ShowStore {
  private shows: Show[] = [];
  private listeners = Set<Listener>;

  // Métodos
  getAll()
  subscribe(fn)    // Event emitter pattern
  setAll(next)
  updateShow(id, patch)
  removeShow(id)

  // Persistence
  localStorage.getItem('shows-store-v3')
  localStorage.setItem() on every emit()
}
```

**Características**:

- ✅ Persistent (localStorage)
- ✅ Centralized domain data
- ✅ Event-driven (observable)
- ❌ Single source of truth (no sync con servidor)
- ❌ Manual subscription management

**Sistema 3: react-query (TanStack Query)**

```typescript
// Queries (probablemente en components)
useQuery({
  queryKey: ['shows'],
  queryFn: () => api.get('/shows'),
});

useMutation({
  mutationFn: show => api.post('/shows', show),
  onSuccess: () => queryClient.invalidateQueries(['shows']),
});
```

**Características**:

- ✅ Server state management
- ✅ Caching + deduplication
- ✅ Background refetching
- ❌ Probablemente no usado para todos los datos

### Decisiones Actuales (Implícitas)

| Tipo de Estado                            | Sistema                          | Razón                        |
| ----------------------------------------- | -------------------------------- | ---------------------------- |
| User preferences (lang, currency, region) | Context (SettingsContext)        | Frecuente acceso + formateo  |
| UI state (filters, search, modal)         | Context (DashboardContext, etc.) | Local, no persiste           |
| Show data (CRUD)                          | ShowStore                        | Domain data + persistence    |
| Auth tokens                               | Context (AuthContext)            | Rápido acceso                |
| Server data                               | react-query                      | Caché + sync (probablemente) |

### Problemas Identificados

**1. Inconsistencia en Fetch**:

- ShowStore: Solo localStorage (no server sync visible)
- react-query: Server-driven pero probablemente no integrado
- Riesgo: Datos desincronizados entre cliente y servidor

**2. Falta de Reglas Claras**:

```
❌ ¿Dónde va estado nuevo?
❌ ¿Context vs ShowStore vs react-query?
❌ ¿Cómo sincronizar con servidor?
```

**3. Escalabilidad**:

- 9 Context providers en App.tsx = deep nesting
- Difícil de mantener cuando crece

### Recomendación: Arquitectura de Estado Formalizada

**Propuesta: "State Layer Pattern"**

```typescript
// NIVEL 1: UI State (React Context)
// ├─ Form inputs, modals, filters
// └─ Scope: Single component or feature
UIState {
  DashboardFilters: { dateRange, status, search }
  ShowModal: { isOpen, selectedShowId }
  SettingsPanel: { activeTab }
}

// NIVEL 2: Domain State (Centralized Store)
// ├─ Business objects (shows, travels, expenses)
// └─ Scope: Application-wide
DomainState {
  Shows: ShowStore (custom)
  Travels: TravelStore (to create)
  Expenses: ExpenseStore (to create)
}

// NIVEL 3: Server State (react-query)
// ├─ Data from API
// └─ Scope: Cache + sync
ServerState {
  queries: useShowsQuery()
  mutations: useCreateShowMutation()
}

// NIVEL 4: Derived State (Selectors)
// ├─ Computed from other states
// └─ Scope: Memoized calculations
DerivedState {
  FilteredShows: useFilteredShows()
  RevenueStats: useRevenueProjection()
}

// NIVEL 5: Persistent State (Storage)
// ├─ Client-side preferences
// └─ Scope: localStorage/sessionStorage
PersistentState {
  User settings (via SettingsContext)
  UI state (via localStorage)
}
```

**Decisión Matrix** (para nuevas features):

```typescript
// Decidir dónde va el estado
if (isUserPreference || isUIState) {
  → React Context (local)
} else if (isDomainData) {
  if (needsServerSync) {
    → react-query
  } else {
    → Centralized Store
  }
} else if (isDerived) {
  → Selector hook (useMemo)
} else if (needsPersistence) {
  → localStorage (via Context o Store)
}
```

**Implementación Sugerida**:

1. **Crear ARCHITECTURE.md**:

```markdown
# State Management Architecture

## Decision Tree

1. Is it a user preference? → SettingsContext
2. Is it temporary UI state? → Local Context or useState
3. Is it domain data? → ShowStore (no server) OR react-query (with server)
4. Is it derived? → Selector hook
5. Does it need persistence? → Add persistence layer
```

2. **Crear `src/state/README.md`**:
   - Documenta cada store/context
   - Uso recomendado
   - Anti-patterns

3. **ESLint Rule** (opcional):

```javascript
// Prevent context nesting depth > 5
// Prevent mixing useState + Context in same component
```

---

## 3. Seguridad del Lado del Cliente

### Análisis Actual: secureStorage.ts

**Implementación**:

```typescript
// Current approach
function getEncryptionKey(): string {
  let key = sessionStorage.getItem('__enc_key');
  if (!key) {
    key = CryptoJS.lib.WordArray.random(256 / 8).toString();
    sessionStorage.setItem('__enc_key', key);
  }
  return key;
}

// Uso
const encrypted = encrypt(JSON.stringify(sensitiveData));
localStorage.setItem('userData', encrypted);
```

**Fortalezas**:

- ✅ AES-256 encryption
- ✅ sessionStorage (no persiste entre sesiones)
- ✅ Protege contra XSS básico
- ✅ Fallback seguro (no guarda datos si encryption falla)

**Limitaciones**:

```
1. Clave generada en cliente → Accesible por DevTools
2. sessionStorage todavía es localStorage (accessible por DevTools)
3. Si XSS compromete JavaScript → Clave está expuesta
4. No hay binding por usuario o dispositivo
```

### Threat Model Actual

```
┌─────────────────────────────────────────┐
│ XSS Attack                              │
│ (attacker.js gets injected)             │
├─────────────────────────────────────────┤
│ Scenario 1: SimpleXSS                   │
│ ├─ Puede ver datos en memory            │
│ ├─ Puede leer sessionStorage            │
│ └─ Puede leer localStorage (encrypted)  │ ← PARTIALLY SAFE
│                                         │
│ Scenario 2: AdvancedXSS + DevTools      │
│ ├─ Puede ver datos en memory            │
│ ├─ Puede leer sessionStorage (key!)     │
│ ├─ Puede decrypt localStorage           │ ← NOT SAFE
│ └─ Full compromise                      │
│                                         │
│ Scenario 3: MITM Attack                 │
│ ├─ Puede intercept traffic              │ ← HTTPS prevents
│ ├─ Puede steal session tokens           │ ← If sent in clear
│ └─ No afecta localStorage local         │ (mitigation: HttpOnly cookies)
└─────────────────────────────────────────┘
```

### Recomendación: Multi-Layer Security Strategy

**Phase 1: Short-term (Immediate)**

```typescript
// 1. Use HttpOnly Cookies for auth tokens
// (NO localStorage para tokens)
app.use((req, res) => {
  res.setHeader('Set-Cookie', [
    `authToken=${token}; HttpOnly; Secure; SameSite=Strict`,
    `refreshToken=${refresh}; HttpOnly; Secure; SameSite=Strict`
  ]);
});

// 2. Never store sensitive data in localStorage
// Replace with:
// - sessionStorage (transient, session-only)
// - Memory (no persistence)
// - HTTP-only cookies (no JS access)

// 3. Add CSP header
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'nonce-{random}';
```

**Phase 2: Medium-term (1-2 weeks)**

```typescript
// 1. Key derivation from server
// On login:
GET /auth/login →
  ✅ HttpOnly cookie (authToken)
  ✅ Response body: { encryptionKeyHint, salt }

// Client-side: derive key from master key
function deriveEncryptionKey(masterKey, salt) {
  return PBKDF2(masterKey, salt, iterations=100000)
}

// 2. End-to-end encryption for sensitive data
// Only PII encrypted with user's key
// Metadata (show dates, amounts) can stay unencrypted

// 3. Integrity checks
import { hmac } from 'tweetnacl';
const signature = hmac(ciphertext, key);
// Verify on decrypt
```

**Phase 3: Long-term (1-2 months)**

```typescript
// 1. Hardware token support (WebAuthn/FIDO2)
// For high-value transactions

// 2. Blind encryption
// Server never sees plaintext keys or sensitive data

// 3. Multi-device support
// Recover encryption keys on new device via authorized channel
```

### Implementación Recomendada Inmediata

**Crear `src/lib/secureAuth.ts`**:

```typescript
/**
 * Secure Authentication Strategy
 *
 * 1. Auth tokens → HTTP-only cookies (server sets)
 * 2. Encryption keys → Never persistent
 * 3. Sensitive data → Encrypted with server-derived key
 */

export async function login(email: string, password: string) {
  // Server response includes HTTP-only cookie
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include', // Include cookies
    body: JSON.stringify({ email, password }),
  });

  // No token in response body (it's in HttpOnly cookie)
  // Only metadata returned
  const { keyDerivationHint, salt } = await response.json();

  return {
    keyHint: keyDerivationHint,
    salt,
    // Key never stored, derived from memory only
  };
}

export function deriveEncryptionKey(password: string, salt: string): Promise<CryptoKey> {
  // PBKDF2: memory-only, never persisted
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: Buffer.from(salt), iterations: 100000, hash: 'SHA-256' },
    password,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptSensitive(data: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(data)
  );
  return `${Buffer.from(iv).toString('base64')}:${Buffer.from(ciphertext).toString('base64')}`;
}
```

**Cambios Necesarios**:

1. Backend: Set HttpOnly cookies en login
2. Frontend: Remove tokens from localStorage
3. Backend: Implement key derivation endpoint
4. Frontend: Derive keys in memory, never persist

---

## 4. Estrategia de Testing

### Setup Actual: Vitest

**Configuración**:

- `vitest.config.ts` - Configuración
- `vitest.setup.ts` - Setup global
- Probablemente `src/__tests__/**` para tests

**Observado**:

```bash
npm run test          # Run vitest
npm run test:run      # Run once
npm run test:coverage # Con cobertura
```

### Recomendación: Testing Strategy Piramidal

```
                  E2E (5%)
                 /     \
              5-10%
              /    \
           Integration (30-40%)
          /              \
       30-40%            /
         /    \         /
      Unit Tests (50-60%)
         /      \
      50-60%   Testing time
```

**Estrategia por Capa**:

#### 1. **Unit Tests** (50-60% de tests)

**Prioridad: HIGH**

```typescript
// src/__tests__/lib/computeNet.ts
describe('computeNet', () => {
  it('should calculate net correctly', () => {
    const result = computeNet({
      fee: 1000,
      wht: 200,
      commissions: 100,
      costs: 50,
    });
    expect(result).toBe(650); // 1000 - 200 - 100 - 50
  });

  it('should handle edge cases', () => {
    expect(computeNet({ fee: 0 })).toBe(0);
    expect(computeNet({ fee: -100 })).toThrow(); // Invalid
  });
});

// src/__tests__/lib/fx.ts
describe('FX calculations', () => {
  it('should convert currency correctly', () => {
    const rate = 1.1;
    expect(convertCurrency(1000, 'USD', 'EUR', rate)).toBe(1100);
  });

  it('should cache rates', () => {
    // Verify memoization
  });
});

// src/__tests__/lib/selectors/showSelectors.ts
describe('useFilteredShows', () => {
  it('should filter by status', () => {
    // Mock showStore
    // Verify filtering logic
  });

  it('should filter by date range', () => {
    // Verify date math
  });

  it('should memoize correctly', () => {
    // Verify no unnecessary recalculations
  });
});
```

**Qué testear**:

- ✅ Lógica de negocio (computeNet, fx, filtrado)
- ✅ Edge cases y errores
- ✅ Memoization/performance
- ❌ UI rendering (para integration tests)

#### 2. **Integration Tests** (30-40%)

**Prioridad: HIGH**

```typescript
// src/__tests__/hooks/useShows.integration.test.tsx
describe('useShows integration', () => {
  it('should load, update, and persist shows', () => {
    const { result } = renderHook(() => useShows(), {
      wrapper: ShowStoreProvider
    });

    // Load
    expect(result.current.shows.length).toBeGreaterThan(0);

    // Update
    act(() => {
      result.current.update(showId, { status: 'confirmed' });
    });

    // Persist
    expect(localStorage.getItem('shows-store-v3')).toContain('confirmed');
  });
});

// src/__tests__/components/ShowEditor.integration.test.tsx
describe('ShowEditor integration', () => {
  it('should handle complete edit flow', async () => {
    const { getByText, getByDisplayValue } = render(
      <ShowEditor showId="123" />
    );

    // User interactions
    fireEvent.change(getByDisplayValue('Original Title'), {
      target: { value: 'New Title' }
    });

    fireEvent.click(getByText('Save'));

    // Verify
    await waitFor(() => {
      expect(getByText('Show updated')).toBeInTheDocument();
    });
  });
});
```

**Qué testear**:

- ✅ Hooks + Context integration
- ✅ Component interactions
- ✅ State mutations
- ✅ Persistence flows

#### 3. **E2E Tests** (5-10%)

**Prioridad: MEDIUM (después de tener unit + integration)**

```typescript
// e2e/shows.e2e.test.ts (usando Playwright)
import { test, expect } from '@playwright/test';

test('complete show workflow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button:text("Sign in")');

  // Add show
  await page.click('button:text("Add show")');
  await page.fill('input[name="city"]', 'Madrid');
  await page.fill('input[name="venue"]', 'Palacio Vistalegre');
  await page.click('button:text("Save")');

  // Verify
  await expect(page).toHaveURL('/dashboard/shows');
  await expect(page.locator('text=Madrid')).toBeVisible();
});
```

**Qué testear**:

- ✅ Critical user workflows
- ✅ End-to-end flows (login → add → edit → delete)
- ✅ Cross-browser compatibility
- ❌ Every feature (too slow)

### Implementación Sugerida

**Phase 1: NOW (Improve coverage)**

```bash
# Current estimate: probablemente <30% coverage

# Priority:
1. Business logic (computeNet, fx, finance calculations)
2. Selectors (useFilteredShows, etc.)
3. Stores (showStore mutations)
4. Critical hooks (useShows, useOptimisticMutation)

# Target: 60% coverage in 1 week
```

**Phase 2: Integration (1-2 weeks)**

```bash
# Add integration tests
1. Hook + Context interactions
2. Component + Store integration
3. Persistence flows
4. API mutation flows

# Target: 80% coverage
```

**Phase 3: E2E (2-3 weeks)**

```bash
# Add Playwright E2E tests
1. Critical workflows (login, show CRUD)
2. Multi-step operations
3. Error scenarios

# Target: 95% coverage + E2E
```

### ESLint Rule para Testing

```javascript
// .eslintrc
{
  "rules": {
    // Require tests for new files in src/lib
    "no-untested-code": {
      "paths": ["src/lib/", "src/hooks/"]
    }
  }
}
```

---

## 5. Design System & Component Library

### Situación Actual: Implícito

**Observado**:

- UI components en `src/ui/` (probablemente)
- Tailwind para styling
- No hay Storybook o documentación central

### Recomendación: Formalizando el Design System

**Phase 1: Document Existing** (30 min)

```typescript
// src/design-system/COLORS.ts
export const colors = {
  // Neutrals
  gray: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    // ... hasta 900
  },

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

// src/design-system/TYPOGRAPHY.ts
export const typography = {
  // Headings
  h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },

  // Body
  body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
  caption: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
};

// src/design-system/SPACING.ts
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
};
```

**Phase 2: Create Component Library** (1-2 days)

```typescript
// src/components/ui/Button.tsx
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700'
    };

    const sizeClasses = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    return (
      <button
        ref={ref}
        className={clsx(
          'font-semibold rounded transition',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
```

**Phase 3: Add Storybook** (3-4 hours)

```bash
# Install
npx sb init --builder webpack5

# Create stories
src/components/ui/Button.stories.tsx
src/components/ui/Input.stories.tsx
src/components/ui/Select.stories.tsx

# Run
npm run storybook
```

**Phase 4: Document in Markdown** (Optional, 1 day)

```markdown
# Design System Documentation

## Colors

- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Danger**: Red (#EF4444)

## Typography

- **H1**: 2rem, Bold, Line 1.2
- **Body**: 1rem, Regular, Line 1.5
- **Caption**: 0.875rem, Regular, Line 1.5

## Components

### Button

- Variants: primary, secondary, danger
- Sizes: sm, md, lg
- States: normal, loading, disabled

[See Storybook for interactive examples]
```

### Implementación Recomendada

**Corto Plazo (This Week)**:

1. ✅ Crear `src/design-system/` con tokens
2. ✅ Documentar colores, tipografía, spacing
3. ✅ Listar componentes existentes

**Mediano Plazo (Next Sprint)**:

1. ✅ Instalar y configurar Storybook
2. ✅ Crear stories para top 10 componentes
3. ✅ Documentar component API

**Largo Plazo (Future)**:

1. ✅ Automatizar generación de docs
2. ✅ Agregar visual regression testing
3. ✅ Crear design system package

---

## Resumen Ejecutivo

### Recomendaciones Priorizadas

| Tema                            | Prioridad | Esfuerzo | Impacto                  | Timeline           |
| ------------------------------- | --------- | -------- | ------------------------ | ------------------ |
| **1. Map Clustering Worker**    | HIGH      | 4 horas  | UI responsiveness +50%   | Esta semana        |
| **2. State Management Docs**    | HIGH      | 2 horas  | -confusion, +consistency | Hoy                |
| **3. Formalizar Design System** | MEDIUM    | 4 horas  | Desarrollo más rápido    | Esta semana        |
| **4. HttpOnly Auth Cookies**    | HIGH      | 8 horas  | Security mejorada 100%   | Próxima semana     |
| **5. Expandir Worker Pool**     | MEDIUM    | 8 horas  | Smart actions worker     | Próximas 2 semanas |
| **6. Testing Strategy**         | MEDIUM    | Ongoing  | 80% coverage target      | Próximas 3 semanas |
| **7. Storybook**                | LOW       | 6 horas  | Developer experience     | Próximo sprint     |

### Arquitectura Propuesta (Completa)

```
┌─────────────────────────────────────────────────────┐
│ Application                                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ UI Layer (React Components)                  │  │
│  ├──────────────────────────────────────────────┤  │
│  │ - Presentational components                  │  │
│  │ - Container components                       │  │
│  │ - Layout components                          │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ State Management Layer                       │  │
│  ├──────────────────────────────────────────────┤  │
│  │ Level 1: UI Context (9 contexts)             │  │
│  │ Level 2: Domain Store (ShowStore, etc.)      │  │
│  │ Level 3: Server State (react-query)          │  │
│  │ Level 4: Selectors (useFilteredShows)        │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ Performance Layer                            │  │
│  ├──────────────────────────────────────────────┤  │
│  │ - Worker Pool (Finance, Clustering)          │  │
│  │ - Memoization (useMemo, memo)                │  │
│  │ - Virtual scrolling                          │  │
│  │ - Code splitting                             │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ Security Layer                               │  │
│  ├──────────────────────────────────────────────┤  │
│  │ - HttpOnly Cookies (auth)                    │  │
│  │ - Secure Storage (sensitive data)            │  │
│  │ - CSP headers                                │  │
│  │ - Input validation                           │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ API Layer                                    │  │
│  ├──────────────────────────────────────────────┤  │
│  │ - Centralized API client (src/lib/api.ts)   │  │
│  │ - Auto-retry + exponential backoff           │  │
│  │ - Timeout + error handling                   │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│         Backend API (REST/GraphQL)                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Próximos Pasos

**Hoy**:

1. ✅ Crear `ARCHITECTURE.md` con state decision tree
2. ✅ Documentar `src/design-system/` tokens

**Esta Semana**:

1. ✅ Implementar Map Clustering Worker
2. ✅ Formalizar Design System

**Próxima Semana**:

1. ✅ Implement HttpOnly auth cookies
2. ✅ Expandir Worker Pool

**Próximas 3 Semanas**:

1. ✅ Testing strategy + coverage improvements
2. ✅ Setup Storybook
3. ✅ E2E tests para workflows críticos
