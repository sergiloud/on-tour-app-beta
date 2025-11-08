# Calendar Components Visual Audit & Enhancement Plan

## 📋 Auditoría Completa de Elementos del Calendario

### Referencia de Estilo: Dashboard Summary.tsx

- **Espaciado:** `px-4 md:px-6 py-6 md:py-8 lg:py-10`
- **Grid:** `gap-4` o `gap-6` entre elementos
- **Cards:** `glass rounded-xl border border-white/10 hover:border-white/20`
- **Typo:** `text-xs`, `text-sm`, `text-base` (responsive)
- **Icons:** Lucide icons con tamaños `w-4 h-4`, `w-5 h-5`
- **Motion:** Fade + Y translate en entrance
- **Colores:** `text-white/60`, `text-white/80`, `text-accent-400`

---

## 🔍 Componentes a Auditar

### 1. **CalendarToolbar.tsx**

**Status:** Parcialmente optimizado

#### Elementos a Mejorar:

- [ ] Padding/Spacing top/bottom
- [ ] Gap entre botones
- [ ] Altura de componentes
- [ ] Alineación vertical
- [ ] Responsive breakpoints (md:, lg:)
- [ ] Glassmorphism consistency
- [ ] Border radiuses

**Cambios Necesarios:**

- Mejorar padding a `px-6 py-4 md:py-5`
- Espaciado entre elementos: `gap-3 md:gap-4`
- Responsive text sizes
- Mejor altura de botones

---

### 2. **MonthGrid.tsx**

**Status:** Necesita mejoras significativas

#### Elementos a Mejorar:

- [ ] Padding de las celdas
- [ ] Espaciado vertical/horizontal
- [ ] Tamaño de la grilla
- [ ] Tipografía responsive
- [ ] Glassmorphism headers
- [ ] Border radiuses
- [ ] Sombras y borders
- [ ] Gap entre eventos

**Cambios Necesarios:**

- Padding: `p-3 md:p-4` en celdas
- Grid gap: `gap-2 md:gap-3`
- Responsive font sizes
- Better visual hierarchy
- Mejorar contraste

---

### 3. **EventChip.tsx** ✅ HECHO

**Status:** Ya mejorado con Framer Motion

---

### 4. **WeekGrid.tsx**

**Status:** No revisado

#### Elementos a Mejorar:

- [ ] Padding de filas
- [ ] Espaciado de columnas
- [ ] Tipografía responsive
- [ ] Altura de los slots
- [ ] Glassmorphism
- [ ] Animaciones

---

### 5. **DayGrid.tsx**

**Status:** No revisado

#### Elementos a Mejorar:

- [ ] Padding general
- [ ] Time slot spacing
- [ ] Event card styling
- [ ] Tipografía
- [ ] Responsive layout

---

### 6. **AgendaList.tsx**

**Status:** No revisado

#### Elementos a Mejorar:

- [ ] Item padding
- [ ] Row spacing
- [ ] Typography
- [ ] Responsive sizing
- [ ] Hover effects

---

### 7. **MorePopover.tsx**

**Status:** No revisado

#### Elementos a Mejorar:

- [ ] Padding
- [ ] Item height
- [ ] Spacing
- [ ] Border radius
- [ ] Animation

---

### 8. **QuickAdd.tsx**

**Status:** No revisado

#### Elementos a Mejorar:

- [ ] Form spacing
- [ ] Input styling
- [ ] Button sizing
- [ ] Responsive layout

---

### 9. **ContextMenu.tsx**

**Status:** No revisado

#### Elementos a Mejorar:

- [ ] Menu padding
- [ ] Item spacing
- [ ] Border radius
- [ ] Animations
- [ ] Position/z-index

---

## 🎨 Referencia de Estilos a Aplicar

### Padding Estándar

```tsx
// Cards/Containers
px-4 md:px-6 lg:px-8
py-4 md:py-6 lg:py-8

// Elements inside cards
px-3 md:px-4
py-2 md:py-3
```

### Spacing (Gap)

```tsx
// Large containers
gap-6 md:gap-8 lg:gap-10

// Medium sections
gap-4 md:gap-5

// Small items
gap-2 md:gap-3
gap-1.5 md:gap-2
```

### Typography

```tsx
// Headings
text-xl md:text-2xl lg:text-3xl
text-lg md:text-xl
text-base md:text-lg

// Body text
text-sm md:text-base
text-xs md:text-sm

// Labels
text-xs md:text-xs (uppercase tracking-wider)
```

### Styling Elements

```tsx
// Borders & Glass
rounded-xl (large containers)
rounded-lg (cards, inputs)
rounded-md (buttons, chips)

border border-white/10
hover:border-white/20

glass (on big containers)
bg-white/5 (subtle backgrounds)

shadow-md hover:shadow-lg
```

### Responsive Breakpoints

```tsx
// Mobile-first
base (no prefix)

// Tablet+
md:
- Aumentar padding
- Más espaciado
- Mejor alineación

// Desktop+
lg:
- Layouts alternativos
- Más espaciado
- Mejor utilización de espacio
```

---

## 📐 Plan de Mejora por Componente

### PRIORITY 1 - High Impact

1. **CalendarToolbar.tsx**
   - Padding responsive
   - Spacing between elements
   - Better responsive layout

2. **MonthGrid.tsx**
   - Header styling
   - Cell padding
   - Grid gaps
   - Typography

### PRIORITY 2 - Medium Impact

3. **WeekGrid.tsx**
   - Time slots styling
   - Row spacing
   - Header

4. **DayGrid.tsx**
   - Time slots
   - Event cards
   - Spacing

### PRIORITY 3 - Polish

5. **AgendaList.tsx**
   - Item styling
   - Spacing
   - Hover effects

6. **QuickAdd.tsx**
   - Form layout
   - Input styling
   - Spacing

7. **MorePopover.tsx**
   - Menu styling
   - Items

8. **ContextMenu.tsx**
   - Menu styling
   - Animation

---

## 🎯 Patrones a Estandarizar

### Card Pattern

```tsx
<motion.div className="glass rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 p-4 md:p-6">
  {/* content */}
</motion.div>
```

### List Item Pattern

```tsx
<motion.div className="px-4 md:px-6 py-3 md:py-4 hover:bg-white/5 rounded-lg transition-all duration-200">
  {/* content */}
</motion.div>
```

### Input Pattern

```tsx
<input className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-white/20 focus:outline-none transition-colors" />
```

### Button Pattern

```tsx
<button className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 hover:shadow-lg shadow-md transition-all duration-200">
  {label}
</button>
```

---

## ✅ Implementación Step-by-Step

1. **CalendarToolbar** → Mejorar padding y spacing
2. **MonthGrid** → Mejorar grilla y celdas
3. **WeekGrid** → Mejorar slots y spacing
4. **DayGrid** → Mejorar slots y cards
5. **AgendaList** → Mejorar items
6. **QuickAdd** → Mejorar form
7. **MorePopover** → Mejorar menu
8. **ContextMenu** → Mejorar context menu

---

## 📊 Expected Improvements

- ✨ Mejor spacing vertical y horizontal
- 📱 Responsive layout en todos los breakpoints
- 🎨 Consistencia visual con el dashboard
- ⚡ Mejor legibilidad y jerarquía
- 🎬 Animaciones suave en todas partes
- 👁️ Contraste y profundidad mejorados

---

## 🔧 Tools & Components

- `motion.div`, `motion.button` → Framer Motion
- Tailwind classes → Styling
- Lucide icons → Icons
- Card pattern → Standard containers

---

**Próximo paso:** Comenzar a aplicar mejoras en orden de prioridad.
