# 📋 GUÍA DE EJECUCIÓN - SPRINT DE REFINAMIENTO

**Cómo ejecutar el Sprint de Refinamiento paso a paso.**

---

## 🎬 ANTES DE COMENZAR (Toda el equipo)

### Paso 1: Reunión de Kick-off (30 minutos)

**Asistentes**: Tech Lead, todos los owners de tickets  
**Agenda**:

1. Revisar objetivos del sprint (5 min)
   - ¿Por qué? Mejorar mantenibilidad para FASE 6
   - ¿Qué? 5 áreas de refinamiento
   - ¿Resultado? Codebase sostenible, 0 tests skipped

2. Presentar los 5 tickets (10 min)
   - REFINE-001: BaseModal
   - REFINE-002: src/utils/
   - REFINE-003: Funciones complejas
   - REFINE-004: Tests skipped
   - REFINE-005: i18n

3. Asignar responsables (10 min)
   - ¿Quién toma cada ticket?
   - ¿Necesita pair programming?
   - ¿Blockers conocidos?

4. Confirmar timeline (5 min)
   - Semana de ejecución
   - Daily standups (15 min, mañana)
   - Code review process

### Paso 2: Preparación Técnica (Individual)

**Cada owner**:

```bash
# 1. Actualizar rama local
git fetch origin main
git checkout main
git pull origin main

# 2. Confirmar baseline
npm run build          # Debe ser GREEN
npm run test:run       # 400/400 pasando
npm run test:coverage  # Cobertura %

# 3. Crear rama de trabajo
git checkout -b feature/REFINE-00X-description

# 4. Documentar baseline
# En tu descripción de PR: [Baseline] npm run build: SUCCESS, tests: 400/400
```

### Paso 3: Validar Ambiente

```bash
# En terminal, en la raíz del proyecto
node --version        # v18+ requerido
npm --version         # v9+ requerido
npm install           # Asegurarse que todo instalado
npm run build         # Build debe ser limpio
npm run test:run      # Tests deben pasar
npm run lint          # Linting limpio
```

---

## 🎫 EJECUTAR CADA TICKET

### TICKET REFINE-001: BaseModal (3-4 días)

#### Paso 1: Estructura Base

```bash
# Crear archivos
touch src/components/ui/BaseModal.tsx
touch src/hooks/useFocusTrap.ts
touch src/hooks/useModalKeyboard.ts
touch src/__tests__/BaseModal.test.tsx
```

#### Paso 2: Implementar useFocusTrap

```typescript
// src/hooks/useFocusTrap.ts
import { useEffect } from 'react';

export const useFocusTrap = (ref: React.RefObject<HTMLElement>, active: boolean) => {
  useEffect(() => {
    if (!active || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    firstElement?.focus();
    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, ref]);
};
```

#### Paso 3: Implementar BaseModal

```typescript
// src/components/ui/BaseModal.tsx
import React, { useRef, useEffect } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSubmit?: () => void | Promise<void>;
  isLoading?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  onSubmit,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, isOpen);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose, isLoading]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          className={`relative bg-white dark:bg-gray-900 rounded-lg shadow-xl ${sizeClasses[size]} w-full transition-all`}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 id="modal-title" className="text-lg font-semibold">
                {title}
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

#### Paso 4: Tests

```typescript
// src/__tests__/BaseModal.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseModal } from '../components/ui/BaseModal';

describe('BaseModal', () => {
  it('renders when isOpen is true', () => {
    render(
      <BaseModal isOpen={true} onClose={() => {}}>
        Test content
      </BaseModal>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <BaseModal isOpen={false} onClose={() => {}}>
        Test content
      </BaseModal>
    );
    expect(screen.queryByText('Test content')).not.toBeInTheDocument();
  });

  it('closes on Escape key', async () => {
    const onClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={onClose}>
        Test content
      </BaseModal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on backdrop click', () => {
    const onClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={onClose}>
        Test content
      </BaseModal>
    );

    const backdrop = screen.getByRole('dialog').parentElement?.querySelector('[aria-hidden="true"]');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders title if provided', () => {
    render(
      <BaseModal isOpen={true} onClose={() => {}} title="Test Modal">
        Test content
      </BaseModal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders footer if provided', () => {
    render(
      <BaseModal
        isOpen={true}
        onClose={() => {}}
        footer={<button>Save</button>}
      >
        Test content
      </BaseModal>
    );
    expect(screen.getByRole('button', { name: /Save/ })).toBeInTheDocument();
  });

  it('traps focus inside modal', async () => {
    const user = userEvent.setup();
    render(
      <BaseModal isOpen={true} onClose={() => {}}>
        <button>First</button>
        <button>Last</button>
      </BaseModal>
    );

    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  });
});
```

#### Paso 5: Refactorizar GlobalShowModal

```typescript
// src/components/GlobalShowModal.tsx (ANTES - 120 líneas)
// DESPUÉS - usando BaseModal:

import { useShowModal } from '../context/ShowModalContext';
import { BaseModal } from './ui/BaseModal';
import { CreateShowModal } from './shows/CreateShowModal';

export const GlobalShowModal: React.FC = () => {
  const { isOpen, mode, draft, close } = useShowModal();

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create Show';
      case 'edit':
        return 'Edit Show';
      default:
        return 'Show Details';
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={close}
      title={getTitle()}
      size="lg"
    >
      <CreateShowModal mode={mode} draft={draft} />
    </BaseModal>
  );
};
```

#### Paso 6: Tests y Validación

```bash
# Ejecutar tests específicos
npm run test -- BaseModal.test.tsx

# Ejecutar full suite
npm run test:run

# Verificar cobertura
npm run test:coverage

# Build debe estar verde
npm run build
```

#### Paso 7: PR y Review

```bash
# Commit
git add .
git commit -m "REFINE-001: Create BaseModal and refactor 15 modals

- Create BaseModal component with focus trap and keyboard handling
- Create useFocusTrap hook for accessibility
- Refactor GlobalShowModal to use BaseModal
- Refactor 5 finance modals to use BaseModal
- Refactor 3 travel modals to use BaseModal
- Add comprehensive tests (10 test cases)
- All tests passing (450/450)
- Accessibility validated (WCAG 2.1 AA)"

# Push y crear PR
git push origin feature/REFINE-001-base-modal
# En GitHub: Create PR desde feature/REFINE-001-base-modal a main

# En PR description:
"""
## REFINE-001: Consolidation of Modals

### What changed
- Created BaseModal component (96 lines) with:
  - State management (open/close)
  - Focus trap (WCAG 2.1 AA)
  - Keyboard handling (Escape, Tab)
  - Smooth animations

- Refactored 15 modals to use BaseModal:
  - GlobalShowModal (120 → 20 lines)
  - CreateShowModal (100 → 15 lines)
  - 5 finance modals
  - 3 travel modals
  - 4 other modals

### Tests
- All tests passing: 450/450
- New tests: 10 (BaseModal)
- No regressions

### Metrics
- Lines removed: 850
- Lines added: 200
- Net reduction: 650 lines
- Duplication: 0

### Checklist
- [x] Tests passing
- [x] No TypeScript errors
- [x] Accessibility validated
- [x] Dark mode support
- [x] Mobile responsive
- [x] Focus trap working
"""
```

---

### TICKET REFINE-002: src/utils/ (2-3 días)

#### Paso 1: Crear estructura

```bash
mkdir -p src/utils
touch src/utils/formatting.ts
touch src/utils/parsing.ts
touch src/utils/validation.ts
touch src/utils/currency.ts
touch src/utils/numbers.ts
touch src/utils/index.ts
mkdir -p src/utils/__tests__
```

#### Paso 2: Implementar formatting.ts

```typescript
// src/utils/formatting.ts
/**
 * Formatting utilities
 * Centralized place for all formatting logic
 */

export const formatCurrency = (
  amount: number,
  currency: string = 'EUR',
  locale: string = 'es-ES'
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

export const formatDate = (
  dateString: string,
  format: 'short' | 'long' | 'iso' = 'short',
  locale: string = 'es-ES'
): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  if (format === 'iso') {
    return date.toISOString().split('T')[0];
  }

  const options: Intl.DateTimeFormatOptions = {
    short: { year: '2-digit', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
  }[format];

  return date.toLocaleDateString(locale, options);
};

export const formatTime = (dateString: string, locale: string = 'es-ES'): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (
  value: number,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2,
  locale: string = 'es-ES'
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};
```

#### Paso 3: Implementar parsing.ts

```typescript
// src/utils/parsing.ts
export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const parseNumber = (value: string): number | null => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

// ... más funciones de parsing
```

#### Paso 4: Tests para utils

```typescript
// src/utils/__tests__/formatting.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatTime, formatNumber } from '../formatting';

describe('formatting utilities', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      const result = formatCurrency(1234.56, 'EUR', 'es-ES');
      expect(result).toBe('1.234,56 €');
    });

    it('handles large numbers', () => {
      const result = formatCurrency(1000000, 'EUR', 'es-ES');
      expect(result).toContain('1.000.000');
    });
  });

  describe('formatDate', () => {
    it('formats date in short format', () => {
      const result = formatDate('2025-11-03', 'short', 'es-ES');
      expect(result).toBe('3 nov 2025');
    });

    it('returns ISO format', () => {
      const result = formatDate('2025-11-03', 'iso');
      expect(result).toBe('2025-11-03');
    });

    it('handles invalid dates', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('—');
    });
  });

  // ... más tests
});
```

#### Paso 5: Refactorizar imports

```bash
# En DashboardTeaser.tsx, cambiar:
# const formatCurrency = (value: number) => '€' + ...
# A:
import { formatCurrency } from '@/utils/formatting';

# En SmartShowRow.tsx, cambiar:
# const formatDate = (dateString: string) => ...
# A:
import { formatDate } from '@/utils/formatting';

# Hacer para todos los archivos encontrados en auditoría
```

#### Paso 6: Commit y PR

```bash
git add .
git commit -m "REFINE-002: Create src/utils/ and centralize functions

- Create src/utils/ with:
  - formatting.ts (formatCurrency, formatDate, formatTime)
  - parsing.ts (parseDate, parseNumber)
  - validation.ts (validateInput, validateEmail)
  - currency.ts (currency conversion)
  - numbers.ts (number utilities)
- Refactor 20+ files to use src/utils
- Add comprehensive tests (50+ test cases)
- All tests passing (450+/450)
- 0 code duplication"

git push origin feature/REFINE-002-centralize-utils
```

---

### TICKET REFINE-003: Funciones Complejas (3-4 días)

Seguir patrón similar a REFINE-001 y REFINE-002. Crear nuevos hooks, dividir módulos, refactorizar imports, tests, y PR.

---

### TICKET REFINE-004: Tests Skipped (4-5 días)

#### Paso 1: Actualizar test-utils.tsx

```typescript
// src/__tests__/test-utils.tsx (AGREGACIÓN)

export const setupComponentTests = () => {
  const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' };
  const mockShow = { id: 'show-1', title: 'Test Show', date: '2025-11-03' };
  const mockSettings = { theme: 'light', language: 'es' };

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider defaultUser={mockUser}>
          <SettingsProvider defaultSettings={mockSettings}>
            <FinanceContextProvider>
              <ShowModalProvider>
                <ThemeProvider>
                  {children}
                </ThemeProvider>
              </ShowModalProvider>
            </FinanceContextProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return {
    AllTheProviders,
    render: (component: React.ReactElement) =>
      render(component, { wrapper: AllTheProviders }),
    mockUser,
    mockShow,
    mockSettings,
    waitForLoadingToFinish: () =>
      waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      }),
  };
};
```

#### Paso 2: Unskip uno de los tests

```typescript
// src/__tests__/actionHub.test.tsx

// ANTES:
describe.skip('ActionHub', () => {
  it('renders action items', () => { ... });
});

// DESPUÉS:
describe('ActionHub', () => {
  it('renders action items', () => {
    const { render, waitForLoadingToFinish } = setupComponentTests();
    render(<ActionHub />);
    // Implementar test
  });
});
```

#### Paso 3: Repetir para todos los tests skipped

```bash
# Unskip todos los tests skipped
# sed -i 's/describe\.skip(/describe(/g' src/__tests__/*.test.tsx

# Implementar tests uno a uno
npm run test:run     # Ejecutar y ver cuáles fallan
# Arreglar cada uno
```

#### Paso 4: Validar cobertura

```bash
npm run test:coverage
# Debe mostrar 95%+ cobertura
```

---

### TICKET REFINE-005: i18n (2-3 días)

#### Paso 1: Identificar keys faltantes

```bash
# Script para comparar keys
node -e "
const en = require('./locales/en.json');
const fr = require('./locales/fr.json');
const enKeys = Object.keys(en);
const frKeys = Object.keys(fr);
const missing = enKeys.filter(k => !frKeys.includes(k));
console.log('FR missing:', missing.length, 'keys');
missing.slice(0, 10).forEach(k => console.log('  -', k));
"
```

#### Paso 2: Completar traducciones

```typescript
// locales/fr.json
// Agregar keys faltantes

// Ejemplo:
{
  "common": {
    "tomorrow": "Demain",
    "today": "Aujourd'hui",
    ...
  },
  ...
}
```

#### Paso 3: Validar con test

```typescript
// src/__tests__/i18n.completeness.test.ts (UNSKIP)
describe('i18n Completeness', () => {
  it('has all keys for all languages', () => {
    const en = require('../../locales/en.json');
    const fr = require('../../locales/fr.json');
    const de = require('../../locales/de.json');
    const it = require('../../locales/it.json');
    const pt = require('../../locales/pt.json');

    const enKeys = Object.keys(en);
    const languages = { fr, de, it, pt };

    Object.entries(languages).forEach(([lang, dict]) => {
      const dictKeys = Object.keys(dict);
      expect(dictKeys.length).toBe(enKeys.length);

      enKeys.forEach(key => {
        expect(dict[key]).toBeDefined();
        expect(dict[key]).not.toBe('');
      });
    });
  });
});
```

---

## ✅ DAILY STANDUPS (15 minutos)

Cada mañana:

```
1. ¿Qué completaste ayer?
   - Implementé BaseModal + 2 hooks
   - Escribí tests (8/10 pasando)

2. ¿Qué harás hoy?
   - Refactorizar 5 modales
   - Validar tests

3. ¿Blockers?
   - Necesito aclaración en X
   - PR bloqueado esperando review

4. Métricas
   - Todos los tickets en verde
   - Build: GREEN
   - Tests: 420/450 pasando
```

---

## 🔄 CODE REVIEW PROCESS

**Para cada PR**:

1. **Verificar cambios**:

   ```bash
   npm run build        # Sin errores
   npm run test:run     # Todos los tests pasan
   npm run lint         # Sin issues
   npm run test:coverage # Cobertura arriba de 95%
   ```

2. **Checklist de revisión**:
   - [ ] Tests completos
   - [ ] 0 TypeScript errors
   - [ ] 0 ESLint issues
   - [ ] Documentación actualizada
   - [ ] No breaking changes
   - [ ] Commits bien descritos

3. **Merge criteria**:
   - [ ] 1+ approvals
   - [ ] CI/CD verde
   - [ ] No conflicts
   - [ ] Baseline metrics met

---

## 📊 TRACKING PROGRESS

### Daily Metrics Sheet

```
| Día | REFINE-001 | REFINE-002 | REFINE-003 | REFINE-004 | REFINE-005 | Build | Tests |
|-----|-----------|-----------|-----------|-----------|-----------|-------|-------|
| D1  | 20%       | 20%       | 0%        | 0%        | 0%        | 🟢    | 400/400 |
| D2  | 40%       | 50%       | 20%       | 10%       | 0%        | 🟢    | 410/450 |
| D3  | 70%       | 80%       | 40%       | 30%       | 20%       | 🟢    | 420/450 |
| D4  | 90%       | 100%      | 70%       | 60%       | 60%       | 🟢    | 430/450 |
| D5  | 100% ✅   | 100% ✅   | 90%       | 80%       | 90%       | 🟢    | 440/450 |
| D6  | Merge ✅  | Merge ✅  | 100% ✅   | 100% ✅   | 100% ✅   | 🟢    | 450/450 |
```

---

## 🚀 FINAL MERGE (Día 6-7)

```bash
# Una vez que todos los tickets estén completos:

# 1. Pull main actualizado
git checkout main
git pull origin main

# 2. Merge cada rama
git merge feature/REFINE-001-base-modal
git merge feature/REFINE-002-centralize-utils
git merge feature/REFINE-003-complex-functions
git merge feature/REFINE-004-unskip-tests
git merge feature/REFINE-005-i18n-complete

# 3. Resolver conflictos si hay
# git mergetool

# 4. Validar final
npm run build
npm run test:run
npm run lint

# 5. Push
git push origin main

# 6. Tag del sprint
git tag -a v5.1.0-refinement -m "Sprint of refinement and quality - all metrics met"
git push origin v5.1.0-refinement
```

---

## 📋 DOCUMENTACIÓN POST-SPRINT

Actualizar en el proyecto:

```markdown
# README.md additions

## Refinement Sprint v5.1 (Completed)

### What changed

- [x] BaseModal component created and centralized
- [x] src/utils/ created with 5 core modules
- [x] useShowsMutations refactored to 40 lines
- [x] financeCalculations divided into 5 modules
- [x] setupComponentTests() helper implemented
- [x] All 44 skipped tests unskipped and passing
- [x] i18n translations completed to 100%

### Metrics

- Tests: 400/400 → 450+/450+
- Skipped tests: 44 → 0
- Code duplication: removed 650 lines
- i18n coverage: 60% → 100%

### New patterns

- See BaseModal usage in docs/COMPONENT_PATTERNS.md
- See src/utils/ structure in docs/UTILS_GUIDE.md
- See setupComponentTests() in src/**tests**/test-utils.tsx
```

---

**Esta guía es TU mapa de ejecución. Sigue paso a paso y consulta si tienes dudas.**

¡Adelante! 🚀
