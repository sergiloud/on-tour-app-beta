# Sistema de Diseño Profesional - On Tour App

Guía completa del sistema de diseño visual profesional implementado en la aplicación On Tour. Este documento establece los estándares para mantener coherencia visual y profesionalismo en todos los módulos.

**Última actualización:** Noviembre 2025  
**Versión:** 2.0 (Refinamiento Profesional)

---

## 📐 Principios de Diseño

### 1. Profesionalismo Visual

- **Espaciado generoso**: Usa padding amplio (p-5, p-6) para permitir que el contenido respire
- **Tipografía refinada**: Jerarquía clara con tamaños incrementales (text-xs → text-sm → text-base → text-lg → text-2xl → text-3xl)
- **Alineación precisa**: Elementos alineados consistentemente usando margins calculados (ml-[52px] para alinear con headers de iconos)
- **Transiciones sutiles**: Animaciones suaves y discretas (scale: 1.01 en lugar de 1.02)

### 2. Jerarquía de Información

- **Primaria**: Títulos principales (text-lg/text-2xl) + valores numéricos grandes (text-2xl/text-3xl)
- **Secundaria**: Subtítulos y labels (text-sm/text-base)
- **Terciaria**: Metadata y descripciones (text-xs)
- **Cuaternaria**: Badges y anotaciones (text-[10px] uppercase)

### 3. Economía de Color

- **Accent (verde)** como color principal de marca
- **Colores secundarios** (amber, blue, purple) con propósito semántico claro
- **Blanco** en diferentes opacidades para jerarquía de texto
- **Evitar** sobresaturación - usar opacidades en lugar de colores plenos

---

## 🎨 Paleta de Colores

### Colores Primarios

#### Accent (Verde Emerald) - Color Corporativo Principal

```css
accent-500: #10b981 (emerald-500)
accent-600: #059669 (emerald-600)
accent-400: #34d399 (emerald-400)
```

**Uso:**

- Color principal de la aplicación
- KPI Cards positivos (ingresos, ganancias)
- Botones de acción primaria
- Estados de éxito
- Iconos destacados
- Bordes en hover de elementos interactivos

#### Colores Secundarios

**Amber (Naranja/Amarillo) - Advertencias**

```css
amber-500: #f59e0b
amber-600: #d97706
amber-400: #fbbf24
```

**Uso:**

- Estados de advertencia
- Gastos y costes
- Indicadores de precaución
- Porcentajes de presupuesto entre 80-99%

**Blue (Azul) - Información**

```css
blue-500: #3b82f6
blue-600: #2563eb
blue-400: #60a5fa
```

**Uso:**

- Información neutral
- Balance y métricas generales
- Estados informativos
- Elementos de navegación secundarios

**Purple (Morado) - Métricas Adicionales**

```css
purple-500: #8b5cf6
purple-600: #7c3aed
purple-400: #a78bfa
```

**Uso:**

- Métricas complementarias
- Categorías alternativas
- Gastos por categoría
- Indicadores pendientes

**Red (Rojo) - Errores/Excesos**

```css
red-500: #ef4444
red-600: #dc2626
red-400: #f87171
```

**Uso:**

- Estados de error
- Valores negativos críticos
- Presupuestos excedidos (>100%)
- Alertas urgentes

### Colores Neutros - Escala de Opacidad Blanca

```css
white       - Texto principal crítico (títulos, valores importantes)
white/90    - Texto principal
white/70    - Texto secundario
white/60    - Iconos estándar
white/50    - Labels y subtítulos
white/40    - Labels uppercase, texto terciario, placeholders
white/30    - Texto muy sutil, metadata
white/20    - Bordes suaves
white/15    - Bordes hover sutiles
white/10    - Backgrounds de contenedores, bordes base
white/5     - Backgrounds muy sutiles, borders en iconos
white/[0.06] - Hover states refinados
white/[0.03] - Hover states muy sutiles en tablas
```

**Principio de Uso:**

- Valores más altos (90-100%) para información crítica
- Valores medios (40-60%) para labels y metadata
- Valores bajos (5-20%) para backgrounds y bordes
- Usar opacidades intermedias específicas (3%, 6%) para estados hover

---

## 📦 Componentes Base

### Glass Containers Profesionales

**Container Principal (Refinado)**

```tsx
className = 'glass rounded-xl border border-white/10 p-6 hover:border-accent-500/30 transition-all';
```

**Container con Shadow (Para elementos destacados)**

```tsx
className =
  'glass rounded-xl border border-white/10 p-6 hover:border-accent-500/30 transition-all shadow-sm';
```

**Características:**

- Efecto glassmorphism con backdrop-blur
- Bordes sutiles: `border-white/10`
- Esquinas más redondeadas: `rounded-xl` (12px) - nunca usar rounded-lg
- Hover effect con color accent: `hover:border-accent-500/30`
- Padding generoso: `p-6` (24px) para secciones principales, `p-5` (20px) para secundarias
- Transiciones suaves: `transition-all`
- Shadow opcional: `shadow-sm` para dar profundidad

### Cards y KPIs - Diseño Profesional Refinado

**Estructura de KPI Card (Versión 2.0)**

```tsx
<motion.div
  whileHover={{ scale: 1.01, y: -1 }}
  className="glass rounded-xl p-5 border border-white/10 hover:border-accent-500/30 transition-all group"
>
  <div className="flex items-start justify-between mb-3">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
      <Icon className="w-5 h-5 text-accent-400" />
    </div>
  </div>
  <div className="space-y-1">
    <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
      Label Superior
    </div>
    <div className="text-3xl font-bold text-white tabular-nums">$12,500</div>
    <div className="text-xs text-white/30">Descripción adicional</div>
  </div>
</motion.div>
```

**Mejoras Profesionales:**

- **Hover más sutil**: `scale: 1.01, y: -1` en lugar de `scale: 1.02, y: -2`
- **Icon container mejorado**:
  - Tamaño mayor: `w-10 h-10` + icono `w-5 h-5`
  - Border adicional: `border border-white/5`
  - Shadow sutil: `shadow-sm`
  - Corners: `rounded-xl` (consistente)
- **Espaciado refinado**:
  - Padding: `p-5` en lugar de `p-4`
  - Margin bottom: `mb-3` en lugar de `mb-2`
  - Usar `space-y-1` para agrupar texto
- **Tipografía mejorada**:
  - Label: `text-[10px] uppercase tracking-wider text-white/40 font-medium`
  - Valor: `text-3xl font-bold text-white` (blanco pleno para destacar)
  - Descripción: `text-xs text-white/30` (más sutil)
- **Tabular nums obligatorio** para todos los números

### Iconos Containers - Versión Profesional

**Patrón estándar mejorado**

```tsx
<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
  <IconComponent className="w-5 h-5 text-accent-400" />
</div>
```

**Tamaños estandarizados:**

- **Principal (headers, KPIs)**: `w-10 h-10` con icono `w-5 h-5`
- **Secundario (listas)**: `w-9 h-9` con icono `w-4 h-4`
- **Compacto (badges)**: `w-8 h-8` con icono `w-4 h-4`

**Siempre incluir:**

- `rounded-xl` (nunca rounded-lg)
- `shadow-sm` para profundidad
- `border border-white/5` para definición

**Variantes por tipo:**

- **Accent (Principal):** `from-accent-500/20 to-accent-600/10 border-accent-500/10` + `text-accent-400`
- **Amber (Advertencia):** `from-amber-500/20 to-amber-600/10 border-amber-500/10` + `text-amber-400`
- **Blue (Info):** `from-blue-500/20 to-blue-600/10 border-blue-500/10` + `text-blue-400`
- **Purple (Métrica):** `from-purple-500/20 to-purple-600/10 border-purple-500/10` + `text-purple-400`

---

## 🎭 Animaciones y Transiciones Profesionales

### Hover Effects - Versión Refinada

**Cards Interactivas**

```tsx
whileHover={{ scale: 1.02, y: -2 }}
className="hover:border-accent-500/30"
```

**Botones**

````tsx
**Cards Interactivas - Refinado**

```tsx
whileHover={{ scale: 1.01, y: -1 }}  // Más sutil que antes (era 1.02, y: -2)
className="hover:border-accent-500/30"
````

**Botones - Refinado**

```tsx
whileHover={{ scale: 1.01 }}  // Más sutil
whileTap={{ scale: 0.99 }}    // Más sutil
```

**Iconos Escalables - Refinado**

```tsx
className = 'group-hover:scale-105 transition-transform'; // Antes era scale-110
```

**Principio**: Las animaciones deben ser **perceptibles pero no distractoras**. Reducir magnitudes para mayor profesionalismo.

### Variantes de Motion

```typescript
const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const staggerFast = {
  animate: { transition: { staggerChildren: 0.05 } },
};
```

### Transiciones CSS

```tsx
transition - all; // Para propiedades múltiples
transition - colors; // Solo para colores (más eficiente)
transition - transform; // Solo para transforms
```

**Duración implícita**: Tailwind usa 150ms por defecto - suficientemente rápido para sentirse responsive.

---

## 🔘 Botones Profesionales

### Botón Primario (Accent)

```tsx
<button className="px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-black text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
  Acción Principal
</button>
```

### Botón Secundario (Glass) - Refinado

```tsx
<button className="px-4 py-2.5 rounded-xl glass border border-white/10 hover:border-accent-500/30 hover:bg-white/[0.03] text-sm font-medium transition-all">
  Acción Secundaria
</button>
```

### Botón con Icono - Profesional

```tsx
<motion.button
  whileHover={{ scale: 1.01, y: -1 }}
  whileTap={{ scale: 0.99 }}
  className="glass rounded-xl border border-white/10 p-5 hover:border-accent-500/30 hover:bg-white/[0.03] transition-all text-left group"
>
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm border border-white/5">
      <Icon className="w-5 h-5 text-accent-400" />
    </div>
    <div>
      <p className="text-base font-semibold text-white tracking-tight mb-0.5">Título Acción</p>
      <p className="text-xs text-white/40">Descripción breve</p>
    </div>
  </div>
</motion.button>
```

**Mejoras aplicadas:**

- Padding generoso: `p-5` en lugar de `p-4`
- Icono más grande: `w-12 h-12` con icono `w-5 h-5`
- Texto base en lugar de text-sm para título
- Gap más amplio: `gap-4`
- Tracking ajustado: `tracking-tight` en títulos
- Margin bottom sutil: `mb-0.5` para separar título de descripción

### Botón con Icono

<motion.button
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
className="px-4 py-2.5 rounded-lg glass border border-white/10 hover:border-accent-500/30 text-sm flex items-center gap-2 transition-all"

>   <Icon className="w-4 h-4" />
>   <span>Acción</span>
> </motion.button>

````

### Botón Destructivo

```tsx
<button className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all">
  Eliminar
</button>
````

---

## 📐 Headers de Sección - Patrón Profesional

### Header Estándar (Versión 2.0)

```tsx
<div className="mb-5">
  <div className="flex items-center gap-3 mb-1.5">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
      <Icon className="w-5 h-5 text-accent-400" />
    </div>
    <h3 className="text-lg font-semibold text-white tracking-tight">Título de Sección</h3>
  </div>
  <p className="text-xs text-white/40 ml-[52px]">Descripción breve de la sección</p>
</div>
```

**Detalles clave:**

- **Margin bottom generoso**: `mb-5` (20px) para separar del contenido
- **Flexbox con gap**: `gap-3` (12px) entre icono y título
- **Icon container profesional**:
  - Tamaño: `w-10 h-10` (40px)
  - Esquinas: `rounded-xl`
  - Shadow: `shadow-sm`
  - Border: `border-white/5`
- **Título mejorado**:
  - Tamaño: `text-lg` (18px) - más grande que antes
  - Tracking: `tracking-tight` para compactar
- **Descripción alineada**:
  - Margen left: `ml-[52px]` (40px icono + 12px gap = 52px total)
  - Esto alinea perfectamente con el título
- **Espaciado interno**: `mb-1.5` entre título y descripción

### Header con Badge

```tsx
<div className="flex items-start justify-between mb-5">
  <div>
    <div className="flex items-center gap-3 mb-1.5">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
        <Icon className="w-5 h-5 text-accent-400" />
      </div>
      <h3 className="text-lg font-semibold text-white tracking-tight">Título</h3>
    </div>
    <p className="text-xs text-white/40 ml-[52px]">Descripción</p>
  </div>
  <span className="text-[10px] uppercase tracking-wider text-white/40 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-medium">
    Badge Info
  </span>
</div>
```

---

## 📏 Espaciado Profesional - Sistema Consistente

### Padding de Containers

```tsx
p - 6; // 24px - Containers principales (dashboards, secciones importantes)
p - 5; // 20px - Containers secundarios (cards, modales)
p - 4; // 16px - Elementos compactos (badges, botones pequeños)
```

**Regla**: Nunca usar p-3 en containers principales - mínimo p-4 para profesionalismo.

### Margin Bottom (Separación vertical)

```tsx
mb - 6; // 24px - Entre secciones principales
mb - 5; // 20px - Entre headers y contenido
mb - 4; // 16px - Entre subsecciones
mb - 3; // 12px - Entre elementos relacionados (ej: icono y valor en KPI)
mb - 2; // 8px  - Entre metadata relacionada
mb - 1.5; // 6px - Entre título y subtítulo
mb - 1; // 4px  - Entre label y valor
mb - 0.5; // 2px - Espaciado mínimo
```

### Gap (Espaciado en Flexbox/Grid)

```tsx
gap - 5; // 20px - Grid principal (entre cards grandes)
gap - 4; // 16px - Grid secundario (entre elementos medianos)
gap - 3.5; // 14px - Lista de transacciones
gap - 3; // 12px - Entre icono y texto en headers
gap - 2.5; // 10px - Lista densa
gap - 2; // 8px  - Elementos muy relacionados
```

### Space-Y (Espaciado vertical en stacks)

```tsx
space - y - 6; // Entre secciones del dashboard
space - y - 5; // Entre subsecciones
space - y - 4; // Entre elementos de formulario
space - y - 2.5; // Entre items de lista
space - y - 1; // Entre labels y valores en mismo componente
```

**Principio**: Usar valores mayores (5, 6) para aire profesional. Evitar valores pequeños (1, 2) excepto para elementos muy relacionados.

---

## ✍️ Tipografía Profesional - Jerarquía Completa

### Sistema de Tamaños

```tsx
// Títulos principales de módulo
text-2xl  // 24px - Título principal de página (ej: "Finanzas")

// Títulos de sección
text-lg   // 18px - Títulos de cards/secciones (ej: "Análisis de Rentabilidad")

// Títulos secundarios
text-base // 16px - Subtítulos, botones principales (ej: "Añadir Ingreso")

// Texto estándar
text-sm   // 14px - Texto de cuerpo, descripciones (ej: "Registra un nuevo ingreso")

// Metadata y labels
text-xs   // 12px - Descripciones secundarias, metadata (ej: "Período seleccionado")

// Badges y anotaciones
text-[10px] // 10px - Labels uppercase, badges (ej: "INGRESO BRUTO")
```

### Valores Numéricos (KPIs y Métricas)

```tsx
// Valores principales (KPI cards)
text-3xl  // 30px - Valores destacados en KPIs
font-bold
tabular-nums  // SIEMPRE para números
text-white    // Color blanco pleno para máximo contraste

// Valores secundarios (tablas, listas)
text-base // 16px - Cantidades en transacciones
font-semibold
tabular-nums
text-white    // Blanco para destacar

// Valores terciarios (resúmenes)
text-sm   // 14px - Totales pequeños
font-medium
tabular-nums
```

**Reglas para números:**

1. **SIEMPRE** usar `tabular-nums` - sin excepciones
2. Preferir `text-white` (pleno) sobre `text-accent-400` para valores
3. Usar `font-bold` para KPIs principales, `font-semibold` para secundarios
4. Incluir signos: `+` para positivos, `−` (no `-`) para negativos

### Labels y Metadata

```tsx
// Labels uppercase (estilo profesional)
className = 'text-[10px] uppercase tracking-wider text-white/40 font-medium';
// Ejemplo: "INGRESOS TOTALES", "BALANCE NETO"

// Metadata regular
className = 'text-xs text-white/30';
// Ejemplo: "Período seleccionado", "Total de egresos"

// Descripciones de sección (bajo títulos)
className = 'text-xs text-white/40 ml-[52px]';
// ml-[52px] para alinear con título (40px icono + 12px gap)
```

### Font Weight

```tsx
font - bold; // 700 - Valores numéricos principales, títulos destacados
font - semibold; // 600 - Títulos de sección, valores secundarios
font - medium; // 500 - Labels uppercase, badges, texto importante
font - normal; // 400 - Texto de cuerpo (por defecto)
```

**Regla**: Nunca usar `font-light` o pesos menores - reduce legibilidad en dark theme.

### Tracking (Letter Spacing)

```tsx
tracking - tight; // -0.025em - Títulos grandes para compactar (text-lg, text-2xl)
tracking - normal; // 0em - Texto de cuerpo (por defecto)
tracking - wider; // 0.05em - Labels uppercase para mejorar legibilidad
```

**Cuándo usar cada uno:**

- `tracking-tight`: Títulos de sección (text-lg, text-2xl) para que no ocupen tanto
- `tracking-wider`: Labels uppercase (text-[10px]) para separar letras y mejorar lectura
- `tracking-normal`: Todo lo demás (implícito)

### Ejemplos Completos por Caso de Uso

**KPI Card Value:**

```tsx
<div className="text-3xl font-bold text-white tabular-nums">$12,500</div>
```

**KPI Card Label:**

```tsx
<div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
  Ingresos Totales
</div>
```

**Section Header Title:**

```tsx
<h3 className="text-lg font-semibold text-white tracking-tight">Análisis de Rentabilidad</h3>
```

**Section Header Description:**

```tsx
<p className="text-xs text-white/40 ml-[52px]">
  Flujo de dinero desde ingreso bruto hasta beneficio neto
</p>
```

**Transaction Amount:**

```tsx
<p className="text-base font-semibold tabular-nums text-white">+$1,250.00</p>
```

**Badge/Tag:**

```tsx
<span className="text-[10px] uppercase tracking-wider text-white/40 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-medium">
  Últimos 6 meses
</span>
```

---

## 📊 Gráficos y Visualizaciones

### Colores de Gráficos

**Para AreaChart/LineChart:**

```typescript
const CHART_COLORS = {
  income: 'rgba(16, 185, 129, 0.8)', // accent/emerald
  expense: 'rgba(251, 146, 60, 0.8)', // amber
  balance: 'rgba(59, 130, 246, 0.8)', // blue
};
```

**Gradientes para áreas:**

```tsx
<defs>
  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
  </linearGradient>
</defs>
```

### Configuración de Recharts

**Tooltip estándar:**

```tsx
<Tooltip
  contentStyle={{
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: '12px',
  }}
/>
```

**Ejes:**

```tsx
<XAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
<YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
```

---

## 📝 Tipografía

### Jerarquía de Textos

```tsx
// Títulos principales de página
<h1 className="text-2xl font-bold text-white">Título Principal</h1>

// Subtítulos de página
<p className="text-sm text-white/50">Descripción del módulo</p>

// Títulos de sección
<h2 className="text-base font-semibold text-white">Sección</h2>

// Subtítulos de sección
<p className="text-xs text-white/40">Descripción de sección</p>

// Labels uppercase
<label className="text-[10px] uppercase tracking-wide text-white/40">LABEL</label>

// Valores destacados
<span className="text-2xl font-bold text-accent-400 tabular-nums">$1,234.56</span>

// Texto de tabla
<td className="text-sm text-white/70">Dato</td>

// Texto pequeño/terciario
<span className="text-xs text-white/40">Información adicional</span>
```

### Fuentes Numéricas

**Siempre usar `tabular-nums` para números:**

```tsx
className = 'text-2xl font-bold tabular-nums';
```

Esto garantiza alineación vertical en columnas de números.

---

## 🏷️ Badges y Estados

### Badge de Estado (Pagado)

```tsx
<span className="inline-block text-[10px] px-2.5 py-1 rounded-md font-medium bg-accent-500/10 text-accent-400 border border-accent-500/20">
  Pagado
</span>
```

### Badge de Advertencia (Pendiente)

```tsx
<span className="inline-block text-[10px] px-2.5 py-1 rounded-md font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
  Pendiente
</span>
```

### Badge de Error/Crítico

```tsx
<span className="inline-block text-[10px] px-2.5 py-1 rounded-md font-medium bg-red-500/10 text-red-400 border border-red-500/20">
  Excedido
</span>
```

### Badge Neutro

```tsx
<span className="text-[10px] uppercase tracking-wide text-accent-400/60 px-2 py-1 rounded-md bg-accent-500/10">
  CATEGORÍA
</span>
```

---

## 📋 Tablas

### Estructura de Tabla

```tsx
<div className="glass rounded-xl border border-white/10 overflow-hidden hover:border-accent-500/30 transition-all">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-white/10 bg-white/5">
          <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-wider text-white/50 font-semibold">
            Columna
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
          <td className="px-4 py-3.5 text-sm text-white/70">Dato</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**Características:**

- Headers con uppercase y tracking amplio
- Hover sutil en filas: `hover:bg-white/[0.03]`
- Bordes muy sutiles: `border-white/5` entre filas
- Padding vertical generoso: `py-3.5`

---

## 🔍 Inputs y Formularios

### Input de Búsqueda

```tsx
<div className="relative">
  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
  <input
    type="text"
    placeholder="Buscar..."
    className="w-full pl-11 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-500/50 transition-all"
  />
</div>
```

### Select

```tsx
<select className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-accent-500/50 hover:border-white/20 transition-all cursor-pointer">
  <option>Opción</option>
</select>
```

### Input de Fecha

```tsx
<input
  type="date"
  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500/50 transition-colors"
/>
```

---

## 🎯 Headers de Sección

### Patrón Estándar

```tsx
<div className="flex items-center gap-2 mb-1">
  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center">
    <Icon className="w-4 h-4 text-accent-400" />
  </div>
  <h3 className="text-base font-semibold text-white">Título de Sección</h3>
</div>
<p className="text-xs text-white/40 ml-10">Descripción breve</p>
```

**Características:**

- Icon container con gradiente
- Título alineado con icono
- Descripción indentada (ml-10) para alinear con el texto del título

---

## 🔄 Tabs de Navegación

```tsx
<div className="flex items-center gap-2 border-b border-white/10">
  {tabs.map(tab => (
    <button
      key={tab}
      className={`px-3 py-2 text-xs font-medium transition-all flex items-center gap-2 border-b-2 -mb-[1px] ${
        activeTab === tab
          ? 'border-accent-500 text-white'
          : 'border-transparent text-white/50 hover:text-white/70 hover:border-white/20'
      }`}
    >
      <Icon className="w-4 h-4" />
      {tab}
    </button>
  ))}
</div>
```

**Características:**

- Tab activo con borde accent inferior
- Hover sutil en tabs inactivos
- Iconos opcionales en tabs
- Borde negativo para conectar con container

---

## 📱 Modales y Overlays

### Modal Backdrop

```tsx
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
```

### Modal Container

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  className="glass rounded-xl border border-white/10 backdrop-blur-md"
>
  <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
    <div>
      <h3 className="text-base font-semibold text-white">Título del Modal</h3>
      <p className="text-xs text-white/40 mt-1">Descripción</p>
    </div>
    <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-accent-500/20 border border-white/10 hover:border-accent-500/30">
      <X className="w-4 h-4 text-white/60" />
    </button>
  </div>
  <div className="p-6">{/* Contenido */}</div>
</motion.div>
```

---

## 🎨 Tooltips Personalizados

```tsx
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload) return null;

  return (
    <div className="glass rounded-xl border border-white/20 px-4 py-3 shadow-2xl backdrop-blur-md">
      <p className="text-sm font-medium text-white mb-1">{payload[0].name}</p>
      <p className="text-lg font-bold text-accent-400 tabular-nums">
        {formatValue(payload[0].value)}
      </p>
      <p className="text-xs text-white/50 mt-1">Información adicional</p>
    </div>
  );
};
```

---

## 📐 Espaciado y Layout

### Grid Layouts Comunes

**4 Columnas (KPIs)**

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
```

**2 Columnas (Dashboard)**

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
```

**3 Columnas (Resúmenes)**

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
```

### Espaciado Vertical

```tsx
className = 'space-y-4'; // Entre secciones principales
className = 'space-y-5'; // Entre secciones con más aire
className = 'space-y-2'; // Entre elementos relacionados
className = 'space-y-1'; // Entre elementos muy relacionados
```

### Padding Estándar

- Containers principales: `p-6` (24px)
- Containers secundarios: `p-5` (20px)
- Elementos pequeños: `p-4` (16px)
- Elementos compactos: `p-3` (12px)

---

## ✨ Efectos Especiales

### Backdrop Blur

```tsx
className = 'backdrop-blur-md'; // Para modales y overlays
className = 'backdrop-blur-sm'; // Para fondos de modal
```

### Shadows

```tsx
className = 'shadow-lg'; // Sombras estándar
className = 'shadow-xl'; // Sombras más profundas
className = 'shadow-2xl'; // Sombras máximas (tooltips)
```

### Gradientes de Fondo

```tsx
className = 'bg-gradient-to-br from-accent-500/20 to-accent-600/10';
className = 'bg-gradient-to-br from-amber-500/20 to-amber-600/10';
className = 'bg-gradient-to-br from-blue-500/20 to-blue-600/10';
```

---

## 🎯 Casos de Uso por Componente

### KPI Cards

- **Color:** Según métrica (accent=positivo, amber=gasto, blue=neutral, purple=métrica)
- **Hover:** `scale: 1.02, y: -2`
- **Border hover:** Color correspondiente a la métrica
- **Icon:** Gradiente suave del color de la métrica

### Gráficos

- **Container:** Glass con hover accent
- **Header:** Icon con gradiente + título base + descripción xs
- **Badge superior:** `bg-accent-500/10 text-accent-400/60` uppercase

### Tablas

- **Header:** Uppercase, tracking-wider, text-white/50
- **Hover en fila:** `hover:bg-white/[0.03]`
- **Bordes:** Muy sutiles (white/5)
- **Container:** Hover border accent

### Formularios

- **Focus:** `focus:border-accent-500/50`
- **Hover:** `hover:border-white/20`
- **Labels:** Uppercase, tracking-wide, text-[10px]

---

## 🚫 Anti-Patrones (Evitar)

❌ **NO usar:**

- Colores brillantes o saturados puros (siempre con opacidad)
- Borders gruesos o muy visibles
- Sombras muy marcadas en elementos no modales
- Gradientes llamativos con múltiples colores
- Texto completamente opaco excepto títulos principales
- Hover effects bruscos sin transición
- Números sin `tabular-nums`
- Emojis en interfaces profesionales
- Iconos muy grandes o desproporcionados

✅ **SÍ usar:**

- Colores con opacidad (rgba o /XX)
- Borders sutiles (white/10, white/20)
- Transiciones suaves (`transition-all` o `transition-colors`)
- Gradientes sutiles (opacidad 10-20%)
- Jerarquía visual clara mediante opacidad
- Hover effects sutiles con scale y colores
- `tabular-nums` para todos los números
- Iconos proporcionados (w-4 h-4 en containers de w-8 h-8)

---

## 📋 Checklist de Componente Nuevo

Al crear un nuevo componente, verificar:

- [ ] Container usa `glass rounded-xl border border-white/10`
- [ ] Hover effect en container: `hover:border-accent-500/30`
- [ ] Iconos tienen container con gradiente apropiado
- [ ] Títulos siguen jerarquía (text-base, text-sm, text-xs)
- [ ] Labels usan uppercase y tracking-wide
- [ ] Números usan `tabular-nums`
- [ ] Colores tienen opacidad apropiada
- [ ] Transiciones están aplicadas (`transition-all`)
- [ ] Hover effects son sutiles (scale 1.02, no 1.1)
- [ ] Badges usan el patrón estándar
- [ ] Spacing es consistente (p-6, gap-4, space-y-4)
- [ ] Inputs tienen focus:border-accent-500/50
- [ ] Motion variants se usan para animaciones
- [ ] Backdrop blur en modales
- [ ] Tooltips tienen rounded-xl y border-white/20

---

## 🔧 Utilidades de Desarrollo

### Clases Personalizadas Comunes

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
```

---

## 📚 Referencias

- **Componentes de Referencia:** `Dashboard.tsx`, `Shows.tsx`, `Calendar.tsx`
- **Módulo Finance:** `FinanceV2.tsx`, `FinancialDistributionPieChart.tsx`, `ProfitabilityWaterfallChart.tsx`
- **Colores Base:** TailwindCSS emerald, amber, blue, purple, red palettes
- **Animaciones:** Framer Motion (whileHover, whileTap, variants)

---

## 🎨 Resumen Ejecutivo

**Filosofía de Diseño:**

1. **Minimalismo sofisticado:** Menos es más, usar opacidades en lugar de colores plenos
2. **Coherencia cromática:** Accent (verde) como color principal, colores secundarios con propósito
3. **Jerarquía visual clara:** Mediante opacidad, tamaño y peso de fuente
4. **Interactividad sutil:** Hover effects discretos pero perceptibles
5. **Glassmorphism:** Efecto de vidrio esmerilado para profundidad
6. **Profesionalismo:** Sin emojis, con tipografía clara y números tabulares

**Colores por Contexto:**

- 🟢 **Accent/Verde:** Éxito, ingresos, acciones primarias
- 🟠 **Amber:** Advertencias, gastos, precaución
- 🔵 **Blue:** Información, balance, neutralidad
- 🟣 **Purple:** Métricas adicionales, categorías alternativas
- 🔴 **Red:** Errores, valores negativos críticos, excesos

---

## ✅ Checklist de Diseño Profesional

### Al crear un nuevo componente, verificar:

#### Estructura y Espaciado

- [ ] Container usa `glass rounded-xl border border-white/10 p-6`
- [ ] Padding generoso: mínimo `p-5` para cards, `p-6` para secciones
- [ ] Margins bottom consistentes: `mb-5` entre header y contenido, `mb-6` entre secciones
- [ ] Gap apropiado en flexbox/grid: `gap-4` o `gap-5` para elementos principales
- [ ] Usar `space-y-6` o `space-y-5` para stacks verticales

#### Headers y Títulos

- [ ] Icon container profesional: `w-10 h-10 rounded-xl shadow-sm border border-white/5`
- [ ] Icono tamaño correcto: `w-5 h-5` dentro de container `w-10 h-10`
- [ ] Título con tamaño adecuado: `text-lg` para secciones, `text-2xl` para páginas
- [ ] Tracking ajustado: `tracking-tight` en títulos grandes
- [ ] Descripción alineada: `ml-[52px]` para alinear con título (40px icono + 12px gap)
- [ ] Gap entre icono y título: `gap-3` (12px)
- [ ] Margin bottom del header: `mb-5` (20px)

#### Tipografía

- [ ] Jerarquía clara: text-3xl (valores) → text-lg (títulos) → text-sm (descripciones) → text-xs (metadata) → text-[10px] (badges)
- [ ] Labels uppercase con tracking: `text-[10px] uppercase tracking-wider text-white/40 font-medium`
- [ ] Números SIEMPRE con `tabular-nums`
- [ ] Valores principales en `text-white` (pleno) en lugar de colores
- [ ] Font weights apropiados: `font-bold` (valores), `font-semibold` (títulos), `font-medium` (labels)

#### Colores y Opacidades

- [ ] Texto principal: `text-white` (pleno)
- [ ] Labels uppercase: `text-white/40`
- [ ] Metadata: `text-white/30`
- [ ] Bordes: `border-white/10`
- [ ] Backgrounds sutiles: `bg-white/5` o `bg-white/[0.03]`
- [ ] Iconos: `text-accent-400` o color semántico apropiado

#### Interactividad

- [ ] Hover effect en container: `hover:border-accent-500/30`
- [ ] Hover background sutil: `hover:bg-white/[0.03]` o `hover:bg-white/[0.06]`
- [ ] Motion sutil: `whileHover={{ scale: 1.01, y: -1 }}` (no más de 1.02)
- [ ] Transiciones aplicadas: `transition-all` o `transition-colors`
- [ ] Iconos con scale suave: `group-hover:scale-105` (no más de 110)

#### Icon Containers

- [ ] Gradientes sutiles: `from-accent-500/20 to-accent-600/10`
- [ ] Border adicional: `border border-white/5` o `border-accent-500/10`
- [ ] Shadow para profundidad: `shadow-sm`
- [ ] Corners consistentes: `rounded-xl` (nunca rounded-lg)
- [ ] Tamaños estandarizados: 10x10 (principal), 9x9 (secundario), 12x12 (botones grandes)

#### KPI Cards

- [ ] Padding: `p-5` (20px)
- [ ] Margin entre icono y valor: `mb-3`
- [ ] Usar `space-y-1` para agrupar label + valor + descripción
- [ ] Label: `text-[10px] uppercase tracking-wider text-white/40 font-medium`
- [ ] Valor: `text-3xl font-bold text-white tabular-nums`
- [ ] Descripción: `text-xs text-white/30`

#### Botones

- [ ] Corners: `rounded-xl` (nunca rounded-lg)
- [ ] Padding: `px-4 py-2.5` o mayor
- [ ] Hover border: `hover:border-accent-500/30`
- [ ] Hover background: `hover:bg-white/[0.03]`
- [ ] Font medium o semibold: `font-medium` o `font-semibold`
- [ ] Motion sutil: `scale: 1.01` en hover

#### Transacciones y Listas

- [ ] Padding por item: `p-4` (16px) o `p-3.5` (14px)
- [ ] Gap entre elementos: `gap-3.5` (14px)
- [ ] Hover muy sutil: `hover:bg-white/[0.03]`
- [ ] Borders redondeados: `rounded-xl`
- [ ] Icon containers: `w-9 h-9` con iconos `w-4 h-4`

#### Badges y Tags

- [ ] Uppercase: `text-[10px] uppercase tracking-wider`
- [ ] Padding: `px-2.5 py-1.5` (generoso)
- [ ] Font medium: `font-medium`
- [ ] Border y background: `border border-white/10 bg-white/5`
- [ ] Corners: `rounded-lg` o `rounded-md`

#### Gráficos

- [ ] Container con padding: `p-6`
- [ ] Header con margin: `mb-5`
- [ ] Tooltips con `rounded-xl backdrop-blur-md`
- [ ] Grid sutil: `stroke="rgba(255,255,255,0.05)"`
- [ ] Ejes discretos: `stroke="rgba(255,255,255,0.3)"`

#### Evitar (Anti-Patrones)

- [ ] ❌ NO usar `rounded-lg` en containers principales (usar `rounded-xl`)
- [ ] ❌ NO usar padding pequeño (p-3 o menos) en secciones
- [ ] ❌ NO usar animaciones exageradas (scale > 1.02)
- [ ] ❌ NO usar colores sin opacidad excepto blanco en valores
- [ ] ❌ NO olvidar `tabular-nums` en números
- [ ] ❌ NO usar text-accent-400 en valores numéricos (usar text-white)
- [ ] ❌ NO usar tracking-wider en textos normales (solo uppercase)
- [ ] ❌ NO usar margins inconsistentes (adherirse a 1, 1.5, 2, 3, 4, 5, 6)

---

## 🎯 Casos de Uso Rápidos

### Crear un nuevo KPI Card

```tsx
<motion.div
  whileHover={{ scale: 1.01, y: -1 }}
  className="glass rounded-xl p-5 border border-white/10 hover:border-accent-500/30 transition-all group"
>
  <div className="flex items-start justify-between mb-3">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
      <Icon className="w-5 h-5 text-accent-400" />
    </div>
  </div>
  <div className="space-y-1">
    <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Label</div>
    <div className="text-3xl font-bold text-white tabular-nums">$12,500</div>
    <div className="text-xs text-white/30">Descripción</div>
  </div>
</motion.div>
```

### Crear un Header de Sección

```tsx
<div className="mb-5">
  <div className="flex items-center gap-3 mb-1.5">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
      <Icon className="w-5 h-5 text-accent-400" />
    </div>
    <h3 className="text-lg font-semibold text-white tracking-tight">Título</h3>
  </div>
  <p className="text-xs text-white/40 ml-[52px]">Descripción</p>
</div>
```

### Crear un Botón de Acción

```tsx
<motion.button
  whileHover={{ scale: 1.01, y: -1 }}
  whileTap={{ scale: 0.99 }}
  className="glass rounded-xl border border-white/10 p-5 hover:border-accent-500/30 hover:bg-white/[0.03] transition-all group"
>
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm border border-white/5">
      <Icon className="w-5 h-5 text-accent-400" />
    </div>
    <div>
      <p className="text-base font-semibold text-white tracking-tight mb-0.5">Título</p>
      <p className="text-xs text-white/40">Descripción</p>
    </div>
  </div>
</motion.button>
```

---

_Última actualización: Noviembre 2025_  
_Versión: 2.0 - Refinamiento Profesional_  
_Aplicado en: Finance Module V2.1, Dashboard, Shows, Calendar_

_Última actualización: Noviembre 2025_
_Aplicado en: Finance Module V2.1_
