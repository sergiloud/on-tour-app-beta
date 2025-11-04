# REFINE-001: Consolidación de BaseModal - Plan de Implementación

## Estado: EN PROGRESO ✅

### ✅ Completado

- [x] Creado `src/components/ui/BaseModal.tsx` (componente centralizado)
  - Focus management (focus trap + focus restoration)
  - WCAG 2.1 AA accessibility
  - Keyboard support (Escape, Tab)
  - Click-outside support
  - Framer Motion animations
  - Flexible sizing (sm, md, lg, xl, full)
  - Props: title, description, header, footer, size, etc.

- [x] Creado `src/hooks/useModal.ts` (hooks de utilidad)
  - `useModal()`: Simple modal state
  - `useModalWithData<T>()`: Modal with data management
  - `useConfirmModal()`: Confirmation dialog

### 📋 Por Hacer

#### Fase 1: Migración de Modales Identificados (Today)

**1. GlobalShowModal.tsx** (CRÍTICO)

- Ubicación: `src/components/GlobalShowModal.tsx`
- Estado actual: Usa DrawerModal custom
- Acción: Migrar a BaseModal + useShowModal context
- Archivos a actualizar: `GlobalShowModal.tsx`, contexto ShowModal
- Tiempo: 30-45 min

**2. CreateShowModal.tsx** (IMPORTANTE)

- Ubicación: `src/components/shows/CreateShowModal.tsx`
- Estado actual: Custom modal con steps
- Acción: Reemplazar con BaseModal + custom steps
- Archivos a actualizar: `CreateShowModal.tsx`, reducir de 537→150 líneas
- Tiempo: 45 min

**3. Travel Modales** (IMPORTANTE)

- `AddFlightModal.tsx` (480 líneas)
- `FlightSearchModal.tsx`
- `FlightSearchModalReal.tsx`
- `FlightSearchModalSimple.tsx`
- Acción: Consolidar a 1 BaseFlightModal
- Archivos a actualizar: Travel folder
- Tiempo: 1 hora

**4. Finance Modales** (IMPORTANTE)

- Buscar en: `src/components/finance/` y `src/features/finance/`
- Acción: Consolidar custom modales a BaseModal
- Tiempo: 45 min

**5. Welcome/Setup Modales** (MODERADO)

- `BrandingModal.tsx` (55 líneas)
- `IntegrationsModal.tsx` (31 líneas)
- `InviteManagerModal.tsx` (44 líneas)
- Acción: Migrar a BaseModal
- Tiempo: 30 min

**6. Otros Modales** (BÚSQUEDA NECESARIA)

- Buscar en: `src/features/`, `src/pages/`
- Comando: `grep -r "Modal\|Dialog\|Drawer" src/ --include="*.tsx"`
- Tiempo: 30 min para búsqueda + 1-2 horas para migración

---

#### Fase 2: Actualizar Contexto (30 min)

**ShowModalContext.tsx**

- Ubicación: `src/context/ShowModalContext.tsx`
- Cambios:
  - Actualizar tipos para usar BaseModal
  - Simplificar lógica (ya en BaseModal)
  - Mantener API actual para compatibilidad
- Archivos afectados: ~20 componentes que usan `useShowModal()`

---

#### Fase 3: Actualizar Tests (1 hora)

**test-utils.tsx**

- Ubicación: `src/__tests__/test-utils.tsx`
- Cambios:
  - Actualizar renderWithAllProviders() para BaseModal
  - Agregar tests de accesibilidad para BaseModal
- Nuevo archivo: `src/components/ui/BaseModal.test.tsx`
  - Focus trap tests
  - Escape key tests
  - Tab trapping tests
  - ARIA attributes tests

**Component Tests**

- Archivos: `src/__tests__/*Modal*.test.tsx`
- Acción: Unskip tests que usen BaseModal
- Beneficio: Desbloquea 10-15 tests skipped

---

### 📊 Impacto Esperado

| Métrica            | Antes          | Después      | Beneficio       |
| ------------------ | -------------- | ------------ | --------------- |
| Modales duplicados | 15+ impl.      | 1 BaseModal  | -650 líneas     |
| Líneas de código   | 650+           | ~150         | -500 líneas     |
| Accesibilidad      | Inconsistente  | WCAG 2.1 AA  | ✅ Garantizado  |
| Focus Management   | Manual         | Automático   | ✅ Mejorado     |
| Animaciones        | Inconsistentes | Consistentes | ✅ Estándar     |
| Mantenibilidad     | Baja           | Alta         | ✅ Centralizado |

---

### 🎯 Criterios de Éxito

- [x] BaseModal component creado y completamente documentado
- [x] useModal hooks creados (3 variantes)
- [ ] GlobalShowModal migrado a BaseModal
- [ ] CreateShowModal migrado a BaseModal
- [ ] Todos los travel modales consolidados
- [ ] Todos los finance modales consolidados
- [ ] Tests actualizados (+10 tests unblocked)
- [ ] Build: 🟢 GREEN
- [ ] Tests: 410+/410+ PASSING (from 400)
- [ ] 0 TypeScript errors
- [ ] ESLint: 0 issues
- [ ] Documentación actualizada

---

### 📝 Notas Técnicas

#### BaseModal Features

- ✅ Backdrop click to close
- ✅ Escape key support
- ✅ Focus trap (Tab key wrapping)
- ✅ Focus restoration (return focus on close)
- ✅ Framer Motion animations
- ✅ Dark mode support
- ✅ Responsive sizing
- ✅ Accessibility attributes (role, aria-\*)
- ✅ Scroll lock (body overflow hidden)

#### Hook Utilities

- `useModal()`: Minimal state
- `useModalWithData<T>()`: State + data injection
- `useConfirmModal()`: Promise-based confirmation

#### Migration Pattern

```tsx
// Before
<Modal isOpen={isOpen} onClose={handleClose}>
  Content
</Modal>

// After
<BaseModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Title"
  description="For accessibility"
>
  Content
</BaseModal>
```

---

### 🚀 Próximos Pasos

1. **Ahora**: Verificar BaseModal compilar correctamente
2. **Siguiente**: Migrar GlobalShowModal (CRÍTICO)
3. **Después**: Migrar otros modales en paralelo
4. **Final**: Tests y validación

---

Documento preparado: 3 Noviembre 2025  
Status: IMPLEMENTACIÓN ACTIVA  
Asignado a: [EQUIPO]  
Estimado: 3-4 días  
Story Points: 8

---
