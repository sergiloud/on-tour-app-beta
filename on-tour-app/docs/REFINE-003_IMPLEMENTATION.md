# REFINE-003: Hook & Function Simplification - Implementación

## Estado: PLANIFICACIÓN EN PROGRESO 🔄

### Situación Actual

- `useShowsMutations.ts`: 282 líneas, CC ~15, 8 responsabilidades
- `useOptimisticMutation.ts`: 191 líneas (ya existe parcialmente)
- `financeCalculations.ts`: 529 líneas, CC ~20, 9 responsabilidades

### Arquitectura Actual (Como Está)

```
src/hooks/
├─ useShowsMutations.ts (282 líneas)
│  ├─ Add mutation (optimistic + offline)
│  ├─ Update mutation (optimistic + offline)
│  ├─ Remove mutation (optimistic + offline)
│  ├─ Offline queue management
│  ├─ Retry logic
│  ├─ Sync management
│  └─ Convenience methods (add, update, remove)
│
└─ useOptimisticMutation.ts (191 líneas - EXISTE)
   ├─ Generic optimistic mutation wrapper
   ├─ Automatic rollback
   └─ Toast notifications

src/lib/finance/
└─ financeCalculations.ts (529 líneas)
   ├─ Income calculations (inline)
   ├─ Commission calculations (inline)
   ├─ Tax calculations (inline)
   ├─ Settlement calculations (inline)
   ├─ Formatting helpers (inline)
   └─ Validation/utilities (inline)
```

---

## 🎯 Objetivo de Refactoring

### REFINE-003A: Hook Simplification

**Convertir**:

```
useShowsMutations.ts (282 líneas, 8 responsibilities)
         ↓↓↓
Dividir en:
├─ useOptimisticMutation.ts (refine existing - 100 líneas, CC ~5)
├─ useOfflineMutation.ts (new - 80 líneas, CC ~6)
└─ useShowsMutations.ts (simplified - 40 líneas, CC ~2)
```

### REFINE-003B: Finance Module Simplification

**Convertir**:

```
financeCalculations.ts (529 líneas, 9 responsibilities)
         ↓↓↓
Crear structure:
src/lib/finance/calculations/
├─ income.ts (<100 líneas)
├─ commissions.ts (<100 líneas)
├─ taxes.ts (<100 líneas)
├─ settlements.ts (<100 líneas)
├─ formatting.ts (<50 líneas) - MOVE to src/utils/
└─ index.ts (<50 líneas - re-exports)
```

---

## 📋 Plan de Implementación Detallado

### PASO 1: Refine useOptimisticMutation.ts (30 min)

**Ubicación**: `src/hooks/useOptimisticMutation.ts`  
**Acción**: Revisar, limpiar, documentar código existente

**Cambios**:

- [ ] Revisar implementación actual (191 líneas)
- [ ] Eliminar código muerto
- [ ] Simplificar interface
- [ ] Mejorar documentación
- [ ] Target: <100 líneas, CC ~5

**Responsabilidades**:

1. Generic optimistic mutation pattern
2. Automatic rollback on error
3. Success/error notifications
4. React Query integration

### PASO 2: Create useOfflineMutation.ts (45 min)

**Ubicación**: `src/hooks/useOfflineMutation.ts`  
**Acción**: Extraer lógica offline de `useShowsMutations.ts`

**Contenido**:

```typescript
/**
 * useOfflineMutation - Offline-aware mutation hook
 *
 * Responsibilities:
 * 1. Detect online/offline state
 * 2. Queue operations when offline
 * 3. Sync queued operations on reconnect
 * 4. Handle retry with exponential backoff
 * 5. Track operation status
 */

export function useOfflineMutation<TData, TVariables>() {
  // Implementation: Extract from useShowsMutations
}
```

**Target**: <80 líneas, CC ~6

### PASO 3: Simplify useShowsMutations.ts (45 min)

**Ubicación**: `src/hooks/useShowsMutations.ts`  
**Acción**: Refactor para usar composición de hooks

**De**:

```typescript
// 282 líneas - todas las responsibilities inline
export function useShowsMutations() {
  // +80 líneas: Add mutation logic
  // +80 líneas: Update mutation logic
  // +80 líneas: Remove mutation logic
  // +30 líneas: Convenience methods
  // +12 líneas: Offline management
}
```

**A**:

```typescript
// 40 líneas - composición de hooks
export function useShowsMutations() {
  const optimistic = useOptimisticMutation({...});
  const offline = useOfflineMutation({...});

  const add = (show: Show) => optimistic.mutate(...);
  const update = (id, patch) => optimistic.mutate(...);
  const remove = (id) => optimistic.mutate(...);

  return { add, update, remove, ... };
}
```

**Target**: <40 líneas, CC ~2

### PASO 4: Refactor financeCalculations.ts (2 horas)

**Ubicación**: `src/lib/finance/`  
**Acción**: Dividir en módulos especializados

#### PASO 4.1: Create income.ts

- Extract income-related calculations
- Target: <100 líneas
- Exports: `calculateIncome()`, `calculateGrossRevenue()`, etc.

#### PASO 4.2: Create commissions.ts

- Extract commission calculations
- Target: <100 líneas
- Exports: `calculateCommission()`, `calculateCommissionNet()`, etc.

#### PASO 4.3: Create taxes.ts

- Extract tax calculations
- Target: <100 líneas
- Exports: `calculateTax()`, `calculateWithholdingTax()`, etc.

#### PASO 4.4: Create settlements.ts

- Extract settlement calculations
- Target: <100 líneas
- Exports: `calculateSettlement()`, `calculateNet()`, etc.

#### PASO 4.5: Move formatting.ts

- Move formatting functions to `src/utils/formatting.ts`
- Already created in REFINE-002 ✅

#### PASO 4.6: Create index.ts

- Re-export all modules
- Maintain backward compatibility
- Target: <50 líneas

---

## 📝 Tareas Específicas

### Tareas de Hook Refactoring

**Task A**: Review useOptimisticMutation.ts

```
File: src/hooks/useOptimisticMutation.ts
Size: 191 → <100 líneas
Changes:
  - Remove unused functions
  - Simplify interface
  - Add TypeScript strict types
  - Improve JSDoc comments
```

**Task B**: Create useOfflineMutation.ts

```
File: src/hooks/useOfflineMutation.ts (NEW)
Size: <80 líneas
Extract from useShowsMutations.ts:
  - Offline detection logic
  - Queue management
  - Retry logic with backoff
  - Sync on reconnect
```

**Task C**: Simplify useShowsMutations.ts

```
File: src/hooks/useShowsMutations.ts
Size: 282 → 40 líneas
Changes:
  - Use useOptimisticMutation
  - Use useOfflineMutation
  - Compose hooks
  - Keep shows-specific logic only
```

### Tareas de Finance Refactoring

**Task D**: Create finance/calculations/income.ts

```
File: src/lib/finance/calculations/income.ts (NEW)
Size: <100 líneas
Functions:
  - calculateGrossRevenue()
  - calculateNetRevenue()
  - calculateIncome()
```

**Task E**: Create finance/calculations/commissions.ts

```
File: src/lib/finance/calculations/commissions.ts (NEW)
Size: <100 líneas
Functions:
  - calculateCommission()
  - calculateCommissionNet()
  - calculateCommissionTax()
```

**Task F**: Create finance/calculations/taxes.ts

```
File: src/lib/finance/calculations/taxes.ts (NEW)
Size: <100 líneas
Functions:
  - calculateTax()
  - calculateWithholdingTax()
  - calculateVAT()
```

**Task G**: Create finance/calculations/settlements.ts

```
File: src/lib/finance/calculations/settlements.ts (NEW)
Size: <100 líneas
Functions:
  - calculateSettlement()
  - calculateNet()
  - calculatePayableAmount()
```

**Task H**: Create finance/calculations/index.ts

```
File: src/lib/finance/calculations/index.ts (NEW)
Size: <50 líneas
Exports:
  - Re-export from ./income
  - Re-export from ./commissions
  - Re-export from ./taxes
  - Re-export from ./settlements
Maintains backward compatibility with old imports
```

**Task I**: Update imports across codebase

```
Search: import.*financeCalculations
Replace: import.*finance/calculations

Files affected: ~15-20 files in:
  - src/components/finance/
  - src/features/finance/
  - src/hooks/
  - src/services/
```

---

## ✅ Validation Checklist

### Build Validation

- [ ] `npm run build` - GREEN ✅
- [ ] TypeScript errors - 0 ✅
- [ ] ESLint issues - 0 ✅

### Tests Validation

- [ ] `npm run test:run` - 400+ PASSING ✅
- [ ] No new test failures
- [ ] Hook tests pass
- [ ] Finance tests pass

### Code Quality Validation

- [ ] Cyclomatic Complexity
  - useOptimisticMutation: <10 ✅
  - useOfflineMutation: <10 ✅
  - useShowsMutations: <5 ✅
  - finance modules: each <15 ✅
- [ ] Line count
  - useOptimisticMutation: <100 ✅
  - useOfflineMutation: <80 ✅
  - useShowsMutations: <40 ✅
  - Each finance module: <100 ✅

- [ ] No code duplication
  - grep for duplicate functions
  - grep for duplicate patterns

### Functionality Validation

- [ ] Shows CRUD works (add, update, remove)
- [ ] Offline operations queue correctly
- [ ] Sync on reconnect works
- [ ] Finance calculations produce same results
- [ ] All imports resolve correctly

---

## 🎯 Success Criteria

### HARD REQUIREMENTS

- [ ] All TypeScript errors: 0
- [ ] All ESLint issues: 0
- [ ] Tests passing: 400+ / 400+
- [ ] Build: GREEN
- [ ] All files compiling

### SOFT REQUIREMENTS (Quality)

- [ ] useShowsMutations reduced: 282 → <40 líneas (-85%)
- [ ] Finance calculations structured: 1 file → 5 files
- [ ] Each hook/module: single responsibility
- [ ] Each module: <100 líneas
- [ ] Each module: CC <10
- [ ] Code readability improved
- [ ] Maintainability improved

---

## ⏳ Timing Estimates

| Tarea                           | Estimado       | Status  |
| ------------------------------- | -------------- | ------- |
| A: Review useOptimisticMutation | 30 min         | Pending |
| B: Create useOfflineMutation    | 45 min         | Pending |
| C: Simplify useShowsMutations   | 45 min         | Pending |
| D-G: Create finance modules     | 90 min         | Pending |
| H: Create finance/index         | 20 min         | Pending |
| I: Update imports               | 30 min         | Pending |
| Testing & validation            | 30 min         | Pending |
| **TOTAL**                       | **~4.5 horas** | Pending |

---

## 📚 Related Files to Update

### Imports affected by finance refactor

```
src/components/finance/**
src/features/finance/**
src/hooks/useFinanceKpis.ts
src/hooks/useFinanceSnapshot.ts
src/hooks/useFinanceWorker.ts
src/hooks/useOptimizedFinanceCalculations.ts
src/pages/dashboard/**
src/services/**
```

### Tests affected

```
src/__tests__/finance*.test.ts
src/__tests__/useShowsMutations*.test.ts
src/__tests__/hooks.*.test.tsx
```

---

## 🚀 Next Steps

1. **NOW** (Ongoing REFINE-003)
   - [ ] Review current architecture
   - [ ] Complete Hook refactoring
   - [ ] Complete Finance refactoring

2. **NEXT** (REFINE-004)
   - [ ] Create setupComponentTests() helper
   - [ ] Unskip all 44 tests

3. **AFTER** (REFINE-005)
   - [ ] Complete i18n translations
   - [ ] Validate 100% coverage

---

**Documento**: REFINE-003_IMPLEMENTATION.md  
**Status**: PLANIFICACIÓN ACTIVA  
**Asignado**: [EQUIPO]  
**Estimado**: 3-4 días  
**Story Points**: 8

---
