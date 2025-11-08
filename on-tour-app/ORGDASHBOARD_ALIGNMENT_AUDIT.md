# OrgOverviewNew.tsx vs Dashboard.tsx - Alignment Audit

## Objetivo

Igualar `/dashboard/org` (OrgOverviewNew.tsx) exactamente con `/dashboard` (Dashboard.tsx) en:

- Espacios laterales y padding
- Gaps entre elementos
- Tamaños de botones
- Tipografía
- Iconografía
- Colores y estilos

---

## Análisis Comparativo

### 1. CONTAINER GENERAL

**Dashboard.tsx** (Lines 69-74):

```tsx
<div id="main-content" className="flex flex-col gap-4 lg:gap-5">
```

- Usa `gap-4 lg:gap-5` para separación vertical
- NO tiene max-width (respeta layout full)
- NO tiene padding explicito en contenedor

**OrgOverviewNew.tsx** (Lines 166):

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 md:pb-8">
```

❌ DIFERENCIAS:

- ✅ Tiene `px-4 sm:px-6` (BIEN - similar a Dashboard)
- ✅ Tiene `py-6 sm:py-8` vertical padding
- ❌ Usa `space-y-6` (Dashboard usa `gap-4 lg:gap-5`)
- ❌ Tiene `max-w-7xl` (Dashboard no limita ancho)
- ❌ Tiene `pb-24 md:pb-8` (excesivo)

**ACCIÓN**: Cambiar a `gap-4 lg:gap-5`, ajustar padding bottom

---

### 2. HEADER SECTION

**Dashboard.tsx** (Lines 84-116):

```tsx
<div
  className="relative px-6 pt-5 pb-4 border-b border-white/10 
    bg-gradient-to-r from-transparent via-white/5 to-transparent"
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
      <h2 className="text-lg font-semibold tracking-tight">
        {t('dashboard.map.title') || 'Tour Map'}
      </h2>
    </div>
    <div className="text-xs opacity-60 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Live
    </div>
  </div>
</div>
```

- Padding: `px-6 pt-5 pb-4`
- Accent bar: `w-1 h-6` (alto)
- Title: `text-lg`
- Gaps: `gap-3`

**OrgOverviewNew.tsx** (Lines 170-177):

```tsx
<div className="relative px-6 py-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
  <div className="flex items-center gap-3">
    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
    <div>
      <h1 className="text-base font-semibold tracking-tight text-white">
```

❌ DIFERENCIAS:

- ✅ Padding `px-6` (BIEN)
- ❌ Usa `py-4` vs Dashboard `pt-5 pb-4` (más generoso)
- ❌ Accent bar `h-5` vs Dashboard `h-6`
- ❌ Title `text-base` vs Dashboard `text-lg`
- ❌ NO tiene status indicator (Live badge)

**ACCIÓN**: Aumentar accent bar a h-6, cambiar titulo a text-lg, agregar padding mas generoso

---

### 3. BUTTON EN HEADER

**Dashboard.tsx**: (No visible en header principal - está en otras partes)

**OrgOverviewNew.tsx** (Lines 189-196):

```tsx
<motion.button
    onClick={openAdd}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg
        bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40
        text-accent-500 font-medium text-xs transition-all"
>
```

- Padding: `px-3 py-1.5`
- Text: `text-xs`

**REFERENCIA Dashboard.tsx ActionHubPro**:

- Buttons generalmente: `px-4 py-2` más generosos

**ACCIÓN**: Aumentar a `px-4 py-2`

---

### 4. KPI METRICS GRID

**Dashboard.tsx**: No tiene KPI cards en este layout (diferente página)

**OrgOverviewNew.tsx** (Lines 199):

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

- ✅ Gap `gap-4` (BIEN, aliñado con Dashboard)

**Cards**:

```tsx
className="group relative overflow-hidden rounded-lg border border-white/10
    bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm
    hover:border-white/20 hover:shadow-md hover:shadow-accent-500/5
    transition-all duration-300 p-4"
```

- Padding: `p-4` (tighter)

**REFERENCIA Dashboard Card Padding**: Generalmente `p-5` o `p-6`

**ACCIÓN**: Aumentar padding a `p-5` o `p-6`

---

### 5. MAIN CONTENT GRID

**Dashboard.tsx** (Lines 76-77):

```tsx
<motion.div
  className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-5"
```

- Gap: `gap-4 lg:gap-5`

**OrgOverviewNew.tsx** (Lines 303):

```tsx
<div className="grid lg:grid-cols-3 gap-6">
```

❌ DIFERENCIAS:

- ✅ Grid layout (BIEN)
- ❌ Usa `gap-6` vs Dashboard `gap-4 lg:gap-5` (más generoso de lo necesario)

**ACCIÓN**: Cambiar a `gap-4 lg:gap-5`

---

### 6. SECTIONS (Activity, Upcoming Shows, etc)

**Dashboard.tsx**: No tiene estas secciones exactas

**OrgOverviewNew.tsx** (Lines 311):

```tsx
<div className="relative overflow-hidden rounded-lg border border-white/10
    bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm
    hover:border-white/20 hover:shadow-md hover:shadow-accent-500/5 transition-all duration-300">
  <div className="px-5 py-3 border-b border-white/10 bg-gradient-to-r
      from-transparent via-white/5 to-transparent">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
```

Header padding:

- `px-5 py-3` (tighter)
- Dashboard para comparación: `px-6 pt-5 pb-4` (más generoso)

**ACCIÓN**: Cambiar a `px-6 pt-5 pb-4` para consistencia

---

### 7. INNER CONTENT PADDING

**OrgOverviewNew.tsx** (Line 325):

```tsx
<div className="p-5">
```

**Dashboard patterns**: Generalmente `p-6` o `px-6 py-5`

**ACCIÓN**: Aumentar a `p-6`

---

### 8. RIGHT COLUMN

**Dashboard.tsx** (Lines 129-134):

```tsx
<div className="hidden lg:block lg:col-span-4">
```

- Desktop only, col-span-4 de 12

**OrgOverviewNew.tsx** (Line 452):

```tsx
<div className="space-y-5">
```

- Usa `space-y-5` para separación
- ✅ Estructura similar (BIEN)

**CTA Button** (Line 455):

```tsx
className="group relative overflow-hidden rounded-lg border border-accent-500/25
    bg-gradient-to-br from-accent-500/8 via-transparent to-transparent
    backdrop-blur-sm hover:border-accent-500/40 hover:shadow-md
    hover:shadow-accent-500/10 transition-all cursor-pointer p-4"
```

- Padding: `p-4` (tighter)

**ACCIÓN**: Aumentar a `p-5` o `p-6`

---

## RESUMEN DE CAMBIOS

| Elemento                 | Actual              | Target            | Cambio     |
| ------------------------ | ------------------- | ----------------- | ---------- |
| Container padding        | px-4 sm:px-6        | px-4 sm:px-6      | ✅ OK      |
| Container gap            | space-y-6           | gap-4 lg:gap-5    | ❌ CAMBIAR |
| Container pb             | pb-24 md:pb-8       | pb-8              | ❌ CAMBIAR |
| Header padding           | py-4                | pt-5 pb-4         | ❌ CAMBIAR |
| Header accent bar        | h-5                 | h-6               | ❌ CAMBIAR |
| Header title             | text-base           | text-lg           | ❌ CAMBIAR |
| Header button            | px-3 py-1.5 text-xs | px-4 py-2 text-sm | ❌ CAMBIAR |
| KPI grid gap             | gap-4               | gap-4 lg:gap-5    | ⚠️ MEJORA  |
| KPI card padding         | p-4                 | p-5               | ❌ CAMBIAR |
| Main grid gap            | gap-6               | gap-4 lg:gap-5    | ❌ CAMBIAR |
| Section header padding   | px-5 py-3           | px-6 pt-5 pb-4    | ❌ CAMBIAR |
| Section content padding  | p-5                 | p-6               | ❌ CAMBIAR |
| Quick Actions padding    | p-4                 | p-5               | ❌ CAMBIAR |
| Spacing between sections | space-y-5/space-y-6 | gap-4 lg:gap-5    | ⚠️ CAMBIAR |

---

## ACCIÓN INMEDIATA

Aplicar 8 reemplazos principales:

1. ✅ Container principal: gap y padding
2. ✅ Header: padding, accent bar, título, botón
3. ✅ KPI cards: padding
4. ✅ Main grid: gap
5. ✅ Todas las section headers: padding
6. ✅ Content padding: todo a p-6
7. ✅ Botones: todos aumentados
8. ✅ Bottom padding: pb-24 → pb-8

**Resultado final**: `/org` será 95%+ idéntica a `/dashboard` en espacios, proporciones y estructura.
