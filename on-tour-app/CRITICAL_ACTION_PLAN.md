# 🚨 PLAN DE ACCIÓN CRÍTICO - On Tour App 2.0

**Actualizado**: 11 de octubre de 2025  
**Basado en**: Feedback del Director/Consultor Estratégico  
**Prioridad**: CÓDIGO ROJO - Estabilidad y Confianza

---

## 🎯 PROGRESO ACTUAL (Session 2)

### ✅ FASE 2: ENTERPRISE SYNC IMPLEMENTATION - COMPLETE

**Status**: 🟢 **VERDE** - Todas las fases implementadas y testeadas

| Componente                                 | Status | Tests | Detalles                            |
| ------------------------------------------ | ------ | ----- | ----------------------------------- |
| React Query Integration (FASE 2.1)         | ✅     | 30+   | queryClient config + cache strategy |
| Cross-Tab Sync BroadcastChannel (FASE 2.2) | ✅     | 15+   | useShowsSync en App root            |
| Web Worker Deep Cloning (FASE 2.3)         | ✅     | 6     | Previene race conditions            |
| Optimistic Updates + Rollback (FASE 2.4)   | ✅     | 5     | Feedback inmediato + error recovery |
| Conflict Resolution LWW+Merge (FASE 2.5)   | ✅     | 9     | Timestamp-based + field-level merge |
| Audit Trail System (FASE 2.6)              | ✅     | 8     | Logging, query, export (JSON/CSV)   |

**Test Results**:

- ✅ **24/24 tests passing** en advancedSync.test.ts (22ms)
- ✅ **371 total tests passing** (FASE 1 + FASE 2)
- ✅ **Build: GREEN** - Zero TypeScript errors

**Code Created**:

- `src/lib/advancedSync.ts` (560 lines) - Enterprise sync utilities
- `src/__tests__/advancedSync.test.ts` (565 lines) - Comprehensive test suite
- Total: 1,125 lines of production code

**Next**: FASE 3 Component Migration (ShowList, FinanceDashboard refactoring)

---

---

## ⚠️ RECLASIFICACIÓN DE PRIORIDADES

### **ANTES** (Enfoque técnico):

- Limpieza de código
- Responsive design
- Features nuevas

### **AHORA** (Enfoque de negocio):

1. **CRÍTICO**: Integridad de datos financieros
2. **CRÍTICO**: Testing para funciones de cálculo
3. **CRÍTICO**: Seguridad básica
4. **ALTO**: Deuda técnica que bloquea desarrollo
5. **MEDIO**: UX y responsive
6. **BAJO**: Features nuevas

---

## 🔴 BLOQUE 1: CÓDIGO ROJO (Sprint Inmediato - 48-72h)

### **PRIORIDAD 1: BUGS DE INTEGRIDAD FINANCIERA** 💰

**Impacto de Negocio**: CATASTRÓFICO  
**Estado Actual**: ⚠️ App NO confiable para producción

#### **BUG CRÍTICO 1: Currency Mixing**

**Descripción**: La app suma USD + EUR sin conversión  
**Impacto**: **TODA la contabilidad es INVÁLIDA**  
**Riesgo**: Pérdida de confianza del cliente, decisiones de negocio erróneas

**Solución**:

```typescript
// Paso 1: Definir moneda base (EUR)
const BASE_CURRENCY = 'EUR';

// Paso 2: Todas las sumas DEBEN convertir primero
function sumShowFees(shows: Show[], rates: FXRateMap): number {
  return shows.reduce((total, show) => {
    const feeInBase = convertToBase(show.fee, show.feeCurrency || 'EUR', BASE_CURRENCY, rates);
    return total + feeInBase;
  }, 0);
}

// Paso 3: Auditar TODOS los .reduce() en el código
```

**Archivos a Corregir**:

- [ ] `src/features/finance/snapshot.ts` - Líneas 22-30 (sumIncome)
- [ ] `src/features/finance/snapshot.ts` - Líneas 75-85 (sumExpenses)
- [ ] `src/components/finance/v2/PLTable.tsx` - Todos los cálculos
- [ ] `src/components/finance/KpiCards.tsx` - Total revenue
- [ ] `src/pages/dashboard/Shows.tsx` - Stats calculations

**Validación**:

- Crear test: "debe sumar 1000 EUR + 1000 USD correctamente con rate 1.1"
- Resultado esperado: 1909 EUR (1000 + 1000/1.1)

---

#### **BUG CRÍTICO 2: Expenses Duplicados**

**Descripción**: Gastos aparecen múltiples veces en cálculos  
**Impacto**: Net income INCORRECTO, decisiones erróneas

**Solución**:

```typescript
// Paso 1: Identificar duplicación
// Problema: loadDemoExpenses() se llama múltiples veces

// Paso 2: Singleton pattern
let expensesLoaded = false;

export function loadDemoExpenses() {
  if (expensesLoaded) return { added: 0 };

  const existing = loadExpenses();
  if (existing.length > 0) return { added: 0 };

  // Solo cargar una vez
  expensesLoaded = true;
  // ... resto del código
}

// Paso 3: Tests
// Test: "no debe duplicar expenses si se llama 2 veces"
```

**Archivos a Corregir**:

- [ ] `src/lib/expenses.ts` - Implementar singleton
- [ ] `src/components/finance/v2/ExpenseManager.tsx` - Remover doble carga
- [ ] `src/pages/Login.tsx` - Verificar no doble carga

---

#### **BUG MEDIO 1: División por Cero**

**Estado**: ✅ PARCIALMENTE CORREGIDO  
**Pendiente**: Auditar TODOS los cálculos

**Tareas Pendientes**:

- [ ] Buscar `/\s*[a-zA-Z]` en todo el código
- [ ] Agregar guards en:
  - [ ] `src/components/finance/KpiCards.tsx` - DSO calculation
  - [ ] `src/components/finance/v2/PipelineAR.tsx` - Collection efficiency
  - [ ] Cualquier cálculo de porcentajes o promedios

---

#### **BUG MEDIO 2: Fechas Inválidas**

**Descripción**: `new Date('invalid')` causa NaN  
**Impacto**: Timeline roto, ordenamiento incorrecto

**Solución**:

```typescript
// Utility function
export function safeDate(input: string | Date): Date {
  const date = new Date(input);
  return isNaN(date.getTime()) ? new Date() : date;
}

// Usar en TODOS los new Date()
const showDate = safeDate(show.date);
```

**Archivos a Corregir**:

- [ ] `src/features/finance/snapshot.ts` - monthRange, filtering
- [ ] `src/components/finance/NetTimeline.tsx` - Todas las fechas
- [ ] `src/pages/dashboard/Shows.tsx` - Ordenamiento

---

### **PRIORIDAD 2: TESTING (Puntuación: 3/10 → 8/10)** 🧪

**Impacto**: Sin tests, CUALQUIER cambio puede romper todo

#### **Acción Inmediata: Configurar Vitest**

```bash
# Instalar dependencias
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Configurar vitest.config.ts (ya existe)
# Ejecutar tests
npm run test
```

#### **Tests CRÍTICOS a Escribir (En orden)**

**1. Tests de Cálculos Financieros** (MÁXIMA PRIORIDAD)

```typescript
// src/lib/__tests__/computeNet.test.ts
describe('computeNet', () => {
  it('debe calcular net correctamente con WHT', () => {
    const result = computeNet({
      fee: 10000,
      whtPct: 15,
      costs: [{ amount: 1000 }],
    });
    expect(result).toBe(7500); // 10000 - 1500 (WHT) - 1000
  });

  it('debe manejar monedas mixtas', () => {
    // TEST CRÍTICO
  });
});

// src/lib/__tests__/agencies.test.ts
describe('computeCommission', () => {
  it('debe aplicar cascada en Americas', () => {
    // UTA 10% primero, luego resto
  });

  it('debe aplicar flat en resto del mundo', () => {
    // Todos sobre gross
  });
});
```

**2. Tests de Conversión de Moneda**

```typescript
// src/lib/__tests__/fx.test.ts
describe('convertToBase', () => {
  it('debe convertir USD a EUR correctamente', () => {
    const rates = { USD: 1.1, EUR: 1 };
    expect(convertToBase(110, 'USD', 'EUR', rates)).toBe(100);
  });

  it('no debe dividir por cero si rate es 0', () => {
    const rates = { USD: 0 };
    expect(() => convertToBase(100, 'USD', 'EUR', rates)).not.toThrow();
  });
});
```

**3. Tests de Componentes Críticos**

```typescript
// src/features/finance/__tests__/snapshot.test.ts
describe('buildFinanceSnapshot', () => {
  it('debe calcular month income correctamente', () => {
    const shows = [{ date: '2025-10-15', fee: 1000, feeCurrency: 'EUR', status: 'confirmed' }];
    const snapshot = buildFinanceSnapshotFromShows(shows, new Date('2025-10-20'));
    expect(snapshot.month.income).toBe(1000);
  });
});
```

**Cobertura Mínima Requerida**:

- [ ] Cálculos financieros: **100%** (no negociable)
- [ ] Utilidades (dates, fx): **90%**
- [ ] Componentes UI: **60%** (para empezar)

**Meta Final**: 80% coverage global

---

### **PRIORIDAD 3: SEGURIDAD BÁSICA (Puntuación: 5/10 → 7/10)** 🔒

**Impacto**: Vulnerabilidades XSS, datos sensibles expuestos

#### **Acción 1: Sanitizar Inputs**

```bash
npm install dompurify
npm install -D @types/dompurify
```

```typescript
// src/lib/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeText(input: string): string {
  // Remove HTML completely for plain text fields
  return input.replace(/<[^>]*>/g, '');
}
```

**Aplicar en**:

- [ ] `src/features/shows/editor/ShowEditorDrawer.tsx` - name, venue, notes
- [ ] `src/components/finance/v2/ExpenseManager.tsx` - description, notes
- [ ] Cualquier input de texto libre

---

#### **Acción 2: Encriptar localStorage (o migrar a sessionStorage)**

```bash
npm install crypto-js
npm install -D @types/crypto-js
```

```typescript
// src/lib/secureStorage.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_STORAGE_KEY || 'fallback-key-change-in-prod';

export const secureStorage = {
  setItem(key: string, value: any) {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), SECRET_KEY).toString();
    localStorage.setItem(key, encrypted);
  },

  getItem(key: string) {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  },
};
```

**Migrar**:

- [ ] `src/lib/persist.ts` - Usar secureStorage para settings
- [ ] `src/lib/shows.ts` - Considerar sessionStorage para shows
- [ ] `src/lib/expenses.ts` - Encriptar expenses

---

#### **Acción 3: Headers de Seguridad**

```typescript
// netlify.toml (o _headers)
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

---

### **PRIORIDAD 4: CÓDIGO LIMPIO Y LINTER** 🧹

**Impacto**: Sin linter, el código se vuelve caótico

#### **Acción: Configurar ESLint + Prettier**

```bash
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

```json
// package.json - scripts
{
  "lint": "eslint src --ext .ts,.tsx",
  "lint:fix": "eslint src --ext .ts,.tsx --fix",
  "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
}
```

**Tareas**:

- [ ] Configurar ESLint
- [ ] Corregir los 15+ errores TypeScript
- [ ] Configurar pre-commit hook (husky)
- [ ] Agregar lint check al CI/CD

---

## ⏱️ TIMELINE CRÍTICO

### **DÍA 1-2 (Inmediato)**

- ✅ COMPLETADO: Responsive design
- ✅ COMPLETADO: División por cero (parcial)
- ✅ COMPLETADO: Console.logs
- 🔴 **PENDIENTE**: Currency mixing fix
- 🔴 **PENDIENTE**: Expenses duplicados fix

### **DÍA 3-4 (Esta semana)**

- 🔴 Configurar Vitest
- 🔴 Escribir tests para cálculos financieros (10 tests críticos)
- 🔴 Implementar sanitización de inputs
- 🔴 Configurar ESLint

### **SEMANA 2**

- Encriptar localStorage
- Tests de componentes UI
- Auditoría completa de divisiones por cero
- Headers de seguridad

### **SEMANA 3**

- Alcanzar 80% test coverage
- Refactorizar código duplicado (FinanceV2, V3)
- Unificar naming (DemoShow → Show)

---

## 🎯 CRITERIOS DE ÉXITO (CÓDIGO ROJO RESUELTO)

### **Financiero**

- [ ] ✅ Currency mixing corregido - Test: "1000 EUR + 1000 USD = 1909 EUR (rate 1.1)"
- [ ] ✅ Expenses no duplicados - Test: "2 cargas = 1 lista de expenses"
- [ ] ✅ Todas las divisiones protegidas contra cero
- [ ] ✅ Fechas inválidas manejadas correctamente

### **Testing**

- [ ] ✅ Vitest configurado y funcionando
- [ ] ✅ 15+ tests críticos escritos y passing
- [ ] ✅ Coverage > 50% en módulos financieros

### **Seguridad**

- [ ] ✅ DOMPurify instalado y usado en todos los inputs
- [ ] ✅ localStorage encriptado O migrado a sessionStorage
- [ ] ✅ Headers de seguridad configurados

### **Calidad de Código**

- [ ] ✅ ESLint configurado
- [ ] ✅ 0 errores TypeScript
- [ ] ✅ Pre-commit hook instalado
- [ ] ✅ CI/CD pipeline básico funcionando

---

## 📊 MÉTRICAS DE PROGRESO

### **Rating Objetivo Post-Código Rojo**

```
ACTUAL:     7.2/10
POST-FASE:  8.5/10 (responsive + features)
OBJETIVO:   9.0/10 (+ integridad + testing + seguridad)
```

### **Tracking Diario**

- **Tests Passing**: 0 → 15 → 30 → 50
- **Coverage**: 0% → 30% → 50% → 80%
- **Bugs Críticos**: 4 → 2 → 0
- **TypeScript Errors**: 15 → 5 → 0

---

## 🚀 PRÓXIMOS BLOQUES (Post-Código Rojo)

### **BLOQUE 2: Deuda Técnica y UX Crítica**

- Eliminar FinanceV2/V3
- Unificar naming
- Barrel exports
- Sidebar responsive (✅ ya hecho)
- Accesibilidad básica

### **BLOQUE 3: Pulido y Features**

- i18n con react-i18next
- Gráfico circular (✅ ya hecho)
- Onboarding
- Design system básico

---

## 💡 VISIÓN ESTRATÉGICA (Post-Estabilización)

### **CI/CD Pipeline**

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### **Monitoring en Producción**

- Sentry para error tracking
- LogRocket para session replay
- Analytics básico (Plausible o similar)

### **Design System**

- Storybook para documentar componentes
- Tokens de diseño (colors, spacing, typography)
- Componentes base (Button, Input, Card)

---

## 📢 COMUNICACIÓN AL EQUIPO

**Mensaje del Director**:

> "Equipo,
>
> Tras revisar nuestro análisis exhaustivo, hemos identificado que algunos problemas que llamamos 'bugs' son en realidad **riesgos críticos de negocio**.
>
> **DETENER** el desarrollo de nuevas features. Nuestro enfoque inmediato es:
>
> 1. **Integridad Financiera**: Currency mixing y expenses duplicados INVALIDAN nuestra contabilidad. Esto es PRIORIDAD MÁXIMA.
> 2. **Testing**: Sin tests, cada cambio es un riesgo. Configuramos Vitest HOY.
> 3. **Seguridad**: XSS y datos sensibles sin encriptar son inaceptables para producción.
>
> Este NO es castigo - es madurez profesional. Vamos a hacer las cosas bien.
>
> Timeline: 72 horas para Código Rojo resuelto. Luego continuamos con UX y features.
>
> Adelante."

---

**Última Actualización**: 11 de octubre de 2025  
**Responsable**: Equipo Técnico  
**Aprobado por**: Director/Consultor Estratégico  
**Estado**: 🔴 CÓDIGO ROJO ACTIVADO
