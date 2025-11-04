# 🎫 TICKETS ESPECÍFICOS - SPRINT DE REFINAMIENTO

Estos son los 5 tickets listos para asignar y comenzar. Cada uno es independiente y puede ejecutarse en paralelo.

---

## 🎫 TICKET #1: Consolidación de Componentes Modales

**ID**: REFINE-001  
**Título**: Crear BaseModal centralizado y refactorizar 15+ modales  
**Área**: UI/Components  
**Prioridad**: 🔴 CRÍTICA  
**Estimado**: 3-4 días  
**Puntos Story**: 8

### Descripción

Actualmente existen 15+ implementaciones de modales con código duplicado. Este ticket consolida todo en un componente `BaseModal` reutilizable con:

- Gestión de estado (abierto/cerrado)
- Focus trap (accesibilidad WCAG 2.1 AA)
- Animaciones y estilos base
- Contenido inyectable

### Archivos Impactados

**Crear**:

- [ ] `src/components/ui/BaseModal.tsx` (NEW)
- [ ] `src/hooks/useFocusTrap.ts` (NEW)
- [ ] `src/hooks/useModalKeyboard.ts` (NEW)
- [ ] `src/__tests__/BaseModal.test.tsx` (NEW - 10 tests)

**Refactorizar**:

- [ ] `src/components/GlobalShowModal.tsx`
- [ ] `src/components/shows/CreateShowModal.tsx`
- [ ] `src/features/finance/components/*Modal*.tsx` (5+)
- [ ] `src/features/travel/components/*Modal*.tsx` (3+)
- [ ] Otros modales encontrados en búsqueda

### Definición de Terminado

- [ ] BaseModal implementado con todas las features
- [ ] 15+ modales refactorizados para usar BaseModal
- [ ] Todos los tests pasen (no regresión)
- [ ] Focus trap funciona correctamente (keyboard navigation)
- [ ] Escape key cierra modal
- [ ] Accesibilidad validada (WCAG 2.1 AA)
- [ ] README actualizado con patrón de uso
- [ ] 0 TypeScript errors
- [ ] 0 ESLint issues

### Aceptación

```typescript
// Debe funcionar así:
<BaseModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Create Show"
  size="lg"
  onSubmit={handleSubmit}
  isLoading={isLoading}
>
  <ShowEditorForm />
</BaseModal>
```

**Pruebas Manuales**:

- [ ] Abrir/cerrar modal con botón
- [ ] Presionar Escape para cerrar
- [ ] Tab entre elementos sin salir del modal
- [ ] Funciona en light/dark mode
- [ ] Responsive en mobile

### Notas

- No romper comportamiento existente de ShowModalContext
- Validar que GlobalShowModal sigue siendo entry point único
- Considerar animaciones Framer Motion si está disponible

---

## 🎫 TICKET #2: Unificación de Funciones en src/utils/

**ID**: REFINE-002  
**Título**: Crear src/utils/ centralizado y unificar funciones duplicadas  
**Área**: Utils/Lib  
**Prioridad**: 🔴 CRÍTICA  
**Estimado**: 2-3 días  
**Puntos Story**: 8

### Descripción

Existen múltiples implementaciones de `formatCurrency`, `formatDate`, `parseDate`, `validateInput` en diferentes módulos. Este ticket:

1. Crea estructura `src/utils/` centralizada
2. Unifica todas las funciones duplicadas
3. Refactoriza componentes para usar las nuevas utils

### Archivos a Crear

```
src/utils/ (NEW)
├── formatting.ts      (formatCurrency, formatDate, formatTime, formatNumber)
├── parsing.ts         (parseDate, parseNumber, parseDateToken)
├── validation.ts      (validateInput, validateEmail, validatePhone, etc.)
├── currency.ts        (currency conversion helpers)
├── numbers.ts         (number rounding, decimals)
├── calendar.ts        (date helpers specific to calendar)
├── index.ts           (barrel export)
└── __tests__/         (tests para cada módulo)
    ├── formatting.test.ts
    ├── parsing.test.ts
    ├── validation.test.ts
    └── ...
```

### Archivos Impactados (Refactorizar)

**Source Locations**:

- [ ] `src/features/finance/calculations.ts` (line 243 - formatCurrency)
- [ ] `src/components/landing/DashboardTeaser.tsx` (line 23 - formatCurrency inline)
- [ ] `src/components/dashboard/ItineraryWidget.tsx` (line 17 - formatDate)
- [ ] `src/components/shows/BoardView.tsx` (line 86 - formatDate)
- [ ] `src/components/shows/SmartShowRow.tsx` (line 71 - formatDate)
- [ ] `src/features/travel/components/TravelTimeline.tsx` (line 77 - formatDate)
- [ ] `src/features/travel/components/SmartFlightSearch/SmartFlightSearch.tsx` (line 264 - formatDateInput)
- [ ] `src/lib/calendar/ics.ts` (line 17 - parseDate)
- [ ] `src/features/travel/nlp/parse.ts` (line 25 - parseDateToken)
- [ ] - 5+ más encontrados en auditoría

### Definición de Terminado

- [ ] `src/utils/` creado con todos los módulos
- [ ] Funciones duplicadas unificadas (0 duplicados)
- [ ] Tests para cada función (100% cobertura)
- [ ] Todos los imports actualizados (20+ archivos)
- [ ] Todos los tests pasan (no regresión)
- [ ] 0 TypeScript errors
- [ ] 0 ESLint issues
- [ ] README actualizado con uso de utils
- [ ] Barrel export en `src/utils/index.ts` funciona correctamente

### Aceptación

```typescript
// Antes (duplicado):
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// Después (centralizado):
import { formatCurrency } from '@/utils/formatting';
const formatted = formatCurrency(1000, 'EUR', 'es-ES');
```

**Validar**:

- [ ] `formatCurrency(1234.56, 'EUR')` → "1.234,56 €"
- [ ] `formatDate('2025-11-03')` → "3 nov 2025"
- [ ] `parseDate('2025-11-03')` → Date object
- [ ] `validateInput('test', { required: true })` → { valid: true, errors: [] }

### Notas

- Usar Intl API para localization (no Date libraries si es posible)
- Mantener backward compatibility si es posible
- Considerar performance en loops (memoize formatters)

---

## 🎫 TICKET #3: Refactorización de Funciones Complejas

**ID**: REFINE-003  
**Título**: Dividir hooks complejos y simplificar financeCalculations  
**Área**: Hooks/Core  
**Prioridad**: 🟡 ALTA  
**Estimado**: 3-4 días  
**Puntos Story**: 8

### Descripción

`useShowsMutations` (282 líneas) y `financeCalculations` (529 líneas) tienen responsabilidades múltiples. Este ticket:

1. Extrae lógica genérica de mutación a `useOptimisticMutation`
2. Extrae lógica offline-specific a `useOfflineMutation`
3. Divide financeCalculations en módulos temáticos (<100 líneas cada uno)
4. Simplifica comprensión y mantenimiento

### Archivos a Crear

```
src/hooks/
├── useOptimisticMutation.ts (NEW - 60 líneas)
├── useOfflineMutation.ts (NEW - 80 líneas)
└── useShowsMutations.ts (REFACTORIZADO - 40 líneas)

src/features/finance/calculations/
├── income.ts (NEW - 80 líneas)
├── commissions.ts (NEW - 70 líneas)
├── taxes.ts (NEW - 90 líneas)
├── settlements.ts (NEW - 100 líneas)
├── index.ts (NEW - barrel export)
└── __tests__/ (tests por módulo)
```

### Archivos Impactados (Refactorizar)

- [ ] `src/hooks/useShowsMutations.ts` (282 → 40 líneas)
- [ ] `src/features/finance/calculations.ts` (529 → retire)
- [ ] Cualquier archivo que importe desde estos

### Definición de Terminado

- [ ] Hooks genéricos extraídos
- [ ] useShowsMutations refactorizado (<50 líneas)
- [ ] financeCalculations dividido en 5 módulos
- [ ] Cada módulo < 100 líneas
- [ ] Complejidad ciclomática < 10 en todos los hooks
- [ ] Todos los tests pasan (no regresión)
- [ ] 0 TypeScript errors
- [ ] 0 ESLint issues

### Aceptación

```typescript
// useOptimisticMutation - hook genérico
const mutation = useOptimisticMutation({
  mutationFn: async (show) => api.shows.create(show),
  onMutate: (show) => console.log('creating', show),
  onSuccess: (result) => console.log('created', result),
});

// useShowsMutations - orquestador simple
export function useShowsMutations() {
  return {
    addMutation: useOfflineMutation({ ... }),
    updateMutation: useOfflineMutation({ ... }),
    removeMutation: useOfflineMutation({ ... }),
  };
}

// financeCalculations - módulos temáticos
import { calculateGrossIncome } from '@/features/finance/calculations/income';
import { calculateCommissions } from '@/features/finance/calculations/commissions';
import { calculateTaxes } from '@/features/finance/calculations/taxes';
```

### Notas

- Mantener 100% API compatibility (ningún cambio en imports)
- Validar que tests de integración siguen pasando
- Actualizar imports en componentes

---

## 🎫 TICKET #4: Desbloqueo de Tests Skipped

**ID**: REFINE-004  
**Título**: Crear setupComponentTests() y desbloquear 44 tests  
**Área**: Testing  
**Prioridad**: 🔴 CRÍTICA  
**Estimado**: 4-5 días  
**Puntos Story**: 10

### Descripción

44 tests están skipped porque necesitan múltiples providers. Este ticket:

1. Crea helper `setupComponentTests()` en test-utils.tsx
2. Desbloquea y implementa todos los component tests skipped
3. Alcanza 100% cobertura de tests (450+/450+)

### Archivos a Crear/Modificar

**Modificar**:

- [ ] `src/__tests__/test-utils.tsx` (agregar setupComponentTests helper)

**Unskip Tests** (20+):

- [ ] `src/__tests__/actionHub.test.tsx`
- [ ] `src/__tests__/shows.editor.enhancements.test.tsx`
- [ ] `src/__tests__/finance.masking.test.tsx`
- [ ] `src/__tests__/shortcuts.palette.test.tsx`
- [ ] `src/__tests__/cta.navigation.test.tsx`
- [ ] `src/__tests__/missionControl.test.tsx`
- [ ] ... (5+ más encontrados en búsqueda)

### Definición de Terminado

- [ ] Helper `setupComponentTests()` implementado
- [ ] Documentación de patrón en README
- [ ] Todos los component tests unskkipped
- [ ] Todos los integration tests unskipped
- [ ] i18n completeness tests unskipped
- [ ] 450+/450+ tests pasando
- [ ] 0 tests skipped
- [ ] Cobertura no cae (95%+ lines, 95%+ branches)
- [ ] 0 TypeScript errors
- [ ] 0 ESLint issues

### Aceptación

```typescript
// test-utils.tsx setup
export const setupComponentTests = () => {
  return {
    AllTheProviders: ({ children }) => (
      // 6 providers wrapped
    ),
    render: (component) => render(component, { wrapper: AllTheProviders }),
    mockShow: { id: 'show-1', ... },
    mockUser: { id: 'user-1', ... },
    waitForLoadingToFinish: async () => { ... },
  };
};

// test usage
describe('ActionHub', () => {
  it('renders action items', async () => {
    const { render, waitForLoadingToFinish } = setupComponentTests();
    render(<ActionHub />);
    await waitForLoadingToFinish();
    expect(screen.getByText(/Actions/i)).toBeInTheDocument();
  });
});
```

**Validation**:

- [ ] `npm run test:run` → 450+/450+ pasando
- [ ] `npm run test:coverage` → 95%+ cobertura
- [ ] Todos los tests en < 30 segundos
- [ ] CI/CD pasa completamente

### Notas

- Usar factory functions para mock data
- Reutilizar providers en helpers
- Validar que no hay test pollution (state leakage entre tests)

---

## 🎫 TICKET #5: Completar Traducciones i18n

**ID**: REFINE-005  
**Título**: Completar traducciones (FR, DE, IT, PT) a 100%  
**Área**: i18n  
**Prioridad**: 🟡 ALTA  
**Estimado**: 2-3 días  
**Puntos Story**: 5

### Descripción

Traducciones incompletas para idiomas secundarios:

- FR: 66% (2,100/3,200 keys)
- DE: 55% (1,760/3,200 keys)
- IT: 50% (1,600/3,200 keys)
- PT: 45% (1,440/3,200 keys)

Este ticket completa todas las traducciones a 100%.

### Archivos a Modificar

```
locales/ (translations directory)
├── en.json (3,200 keys) - BASE
├── es.json (3,200 keys) ✅
├── fr.json (2,100 → 3,200 keys)
├── de.json (1,760 → 3,200 keys)
├── it.json (1,600 → 3,200 keys)
└── pt.json (1,440 → 3,200 keys)
```

### Definición de Terminado

- [ ] FR completado a 3,200 keys
- [ ] DE completado a 3,200 keys
- [ ] IT completado a 3,200 keys
- [ ] PT completado a 3,200 keys
- [ ] i18n.completeness.test.ts unskipped y pasando
- [ ] Cada idioma tiene 100% de keys
- [ ] No hay placeholders sin traducción
- [ ] Tecnicismos validados
- [ ] 0 TypeScript errors

### Aceptación

```typescript
// Test validation (must pass)
describe('i18n Completeness', () => {
  it('has all keys for all languages', () => {
    const enKeys = Object.keys(en);
    const allLanguages = [es, fr, de, it, pt];

    allLanguages.forEach(lang => {
      expect(Object.keys(lang).length).toBe(enKeys.length);
      enKeys.forEach(key => {
        expect(lang[key]).toBeDefined();
        expect(lang[key]).not.toBe('');
      });
    });
  });
});
```

**Validation**:

- [ ] Cada idioma tiene 3,200 keys
- [ ] No hay keys duplicadas
- [ ] No hay placeholders vacíos
- [ ] Tecnicismos de dominio correctos

### Notas

- Considerar usar Google Translate API para traducción automática inicial
- Revisión manual por hablante nativo si disponible
- Validar moneda, fechas, formatos según locale

---

## 📊 RESUMEN DE TICKETS

| Ticket     | Área          | Prioridad  | Estimado       | Puntos | Estado |
| ---------- | ------------- | ---------- | -------------- | ------ | ------ |
| REFINE-001 | UI/Components | 🔴 CRÍTICA | 3-4 días       | 8      | Listo  |
| REFINE-002 | Utils/Lib     | 🔴 CRÍTICA | 2-3 días       | 8      | Listo  |
| REFINE-003 | Hooks/Core    | 🟡 ALTA    | 3-4 días       | 8      | Listo  |
| REFINE-004 | Testing       | 🔴 CRÍTICA | 4-5 días       | 10     | Listo  |
| REFINE-005 | i18n          | 🟡 ALTA    | 2-3 días       | 5      | Listo  |
| **TOTAL**  |               |            | **14-19 días** | **39** |        |

---

## 🚀 ORDEN RECOMENDADO

### Día 1-2: Paralelizar REFINE-001 y REFINE-002

- **REFINE-001**: Crear BaseModal + hooks
- **REFINE-002**: Crear src/utils/ + unificar funciones

### Día 3-4: Paralelizar REFINE-003, REFINE-004, REFINE-005

- **REFINE-003**: Refactorizar useShowsMutations y financeCalculations
- **REFINE-004**: Crear setupComponentTests + unskip tests
- **REFINE-005**: Completar traducciones

### Día 5: Consolidación

- Resolver conflicts
- Validar que build sigue limpio
- Todos los tests pasan

### Día 6-7: Testing y QA

- Full test suite execution
- Code reviews
- Merge a main

---

## ✅ CHECKLIST PRE-SPRINT

Antes de comenzar cualquier ticket:

- [ ] Revisar este documento con todo el equipo
- [ ] Confirmar estimados con cada owner
- [ ] Crear ramas git: `feature/REFINE-00X-description`
- [ ] Crear issues en backlog
- [ ] Baseline metrics captured:
  - [ ] `npm run test:run` output
  - [ ] `npm run build` output
  - [ ] Code coverage report
- [ ] CI/CD pipeline ready
- [ ] Code review process established

---

**Preparado por**: AI Assistant  
**Fecha**: 3 Noviembre 2025  
**Estado**: LISTO PARA ASIGNACIÓN ✅
