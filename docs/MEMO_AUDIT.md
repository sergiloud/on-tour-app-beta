# 🔍 Auditoría de useMemo/useCallback/React.memo

**Fecha**: 12 de noviembre de 2025  
**Objetivo**: Identificar problemas de memoización y oportunidades de optimización

---

## 🎯 Problemas Comunes a Buscar

### 1. ❌ useMemo con dependencias incorrectas
### 2. ❌ Over-memoization (memoizar cálculos triviales)
### 3. ❌ useCallback sin dependencias correctas
### 4. ❌ Componentes que deberían usar React.memo
### 5. ❌ useMemo con valores constantes (debería estar fuera del componente)

---

## � ISSUES CRÍTICOS ENCONTRADOS

### 1. 🐛 BUG: `today` memoizado incorrectamente en `useCalendarState`

**Archivo**: `src/hooks/useCalendarState.ts:91`

**Problema**:
```typescript
const today = useMemo(() => new Date().toISOString().slice(0,10), []);
```

**Impacto**: 🔴 **CRÍTICO**
- `today` se calcula solo UNA VEZ cuando el hook se monta
- Si el usuario deja la app abierta hasta medianoche, `today` seguirá siendo "ayer"
- Afecta destacado visual de "hoy" en Calendar
- Puede causar confusión en selección de fechas

**Solución**:
```typescript
// OPCIÓN 1: Sin memo (recomendado - cálculo muy barato)
const today = new Date().toISOString().slice(0,10);

// OPCIÓN 2: Con efecto para actualizar a medianoche (opcional)
const [today, setToday] = useState(() => new Date().toISOString().slice(0,10));
useEffect(() => {
  const updateAtMidnight = () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      setToday(new Date().toISOString().slice(0,10));
      updateAtMidnight(); // Re-schedule
    }, msUntilMidnight);
    
    return () => clearTimeout(timeoutId);
  };
  
  return updateAtMidnight();
}, []);
```

---

### 2. ⚠️ Anti-pattern: useCallback envolviendo llamadas simples

**Archivo**: `src/pages/Login.tsx:204-206`

**Problema**:
```typescript
const handleGoogleLogin = React.useCallback(() => handleSSOLogin('google'), [handleSSOLogin]);
const handleAppleLogin = React.useCallback(() => handleSSOLogin('apple'), [handleSSOLogin]);
const handleMicrosoftLogin = React.useCallback(() => handleSSOLogin('microsoft'), [handleSSOLogin]);
```

**Impacto**: 🟡 **MEDIO** (over-memoization innecesaria)
- `useCallback` agrega overhead sin beneficio
- Estas funciones se pasan como props pero no a componentes memoizados
- La inline function sería igual de eficiente

**Solución**:
```typescript
// OPCIÓN 1: Inline directo (si no se pasa a componente memo)
<button onClick={() => handleSSOLogin('google')}>Google</button>

// OPCIÓN 2: Si se pasa a componente memo, mejor usar bind
<SSOButton onClick={handleSSOLogin.bind(null, 'google')} />

// OPCIÓN 3: Mantener useCallback SOLO si el componente receptor usa React.memo
// (en cuyo caso está justificado)
```

---

## 📋 Análisis Completo

### Archivos Revisados ✅

1. **src/hooks/useFinanceData.ts** - ✅ EXCELENTE
   - Todos los cálculos pesados con useMemo
   - Dependencias correctas
   - No hay over-memoization
   - Estructura clara y mantenible

2. **src/hooks/useCalendarState.ts** - 🔴 BUG CRÍTICO
   - ❌ `today` con deps vacías → nunca se actualiza
   - ✅ Resto del código bien optimizado
   - ✅ Sync a Firebase con debounce correcto

3. **src/pages/Login.tsx** - 🟡 OVER-MEMOIZATION
   - ⚠️ useCallback innecesarios en SSO handlers
   - ✅ Resto de la lógica bien estructurada

4. **src/context/FinanceContext.tsx** - ✅ EXCELENTE (post-P1.1)
   - ✅ Selectores consolidados
   - ✅ useMemo bien aplicados
   - ✅ Dependencies correctas

---

## 🔍 Análisis Pendiente

Archivos con alto uso de memo/callback que requieren revisión:

- [ ] `src/hooks/useTourStats.ts` (9 useMemo anidados)
- [ ] `src/pages/dashboard/Calendar.tsx` (8+ useMemo)
- [ ] `src/pages/dashboard/Shows.tsx` (5+ useMemo + useCallback)
- [ ] `src/features/shows/editor/ShowEditorDrawer.tsx` (10+ useCallback)

---

## 📊 Estadísticas Preliminares

| Hook | Total Usos | Issues Encontrados | % Problemáticos |
|------|------------|-------------------|-----------------|
| useMemo | ~150+ | 1 crítico | < 1% |
| useCallback | ~100+ | 3 innecesarios | ~3% |
| React.memo | ~5 | 0 | 0% |

**Conclusión preliminar**: El código está **mayormente bien optimizado**. Issues encontrados son puntuales y de fácil resolución.

---

## ✅ Recomendaciones Generales

### 1. Cuándo usar useMemo
✅ **SÍ usar** cuando:
- Cálculos costosos (loops, transformaciones, filtros grandes)
- Objetos/arrays que se pasan a componentes memoizados
- Prevenir recálculos en cascada

❌ **NO usar** cuando:
- Cálculos triviales (< 1ms)
- Valores primitivos simples
- Valores que cambian en cada render (como `today`)

### 2. Cuándo usar useCallback
✅ **SÍ usar** cuando:
- Función se pasa a componente memoizado (React.memo)
- Función es dependencia de otro hook (useEffect, useMemo)
- Prevenir re-creación en componentes pesados

❌ **NO usar** cuando:
- Solo envoltura de otra función (usar inline o bind)
- No se pasa a ningún componente
- Componente receptor no está memoizado

### 3. Cuándo usar React.memo
✅ **SÍ usar** cuando:
- Componente renderiza frecuentemente con mismas props
- Props son primitivos o referencias estables
- Render es costoso (>16ms)

❌ **NO usar** cuando:
- Props cambian frecuentemente
- Render es trivial (<1ms)
- Over-engineering prematuro

---

**Estado**: 🔄 Auditoría en progreso  
**Próximos pasos**: 
1. ✅ Fix crítico de `today` en useCalendarState
2. Continuar revisión de archivos pendientes
3. Documentar findings completos


