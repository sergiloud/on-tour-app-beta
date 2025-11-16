# 📋 AUDITORÍA DE DISEÑO - ON TOUR APP 2.0

**Fecha:** 16 de noviembre de 2025  
**Objetivo:** Documentar patrones de diseño existentes para implementar el roadmap manteniendo consistencia visual

---

## 🎨 SISTEMA DE DISEÑO ACTUAL

### Paleta de Colores Principal

**Colores Accent (Verde Emerald)** - Color corporativo:
```css
--color-accent-400: #bfff00 (lime)
--color-accent-500: #c4ff1a (lima principal) 
--color-accent-600: #d1ff4d (lima claro)
```

**Colores Semánticos:**
- `emerald-500`: #10b981 - Éxito, confirmado, positivo
- `amber-500`: #f59e0b - Advertencias, gastos, pendiente  
- `blue-500`: #3b82f6 - Información, neutral, balance
- `purple-500`: #8b5cf6 - Métricas adicionales
- `red-500`: #ef4444 - Errores, negativo, cancelado

### Sistema de Tokens CSS

**Glass Morphism:**
```css
--glass-bg: rgba(255,255,255,0.06)
--glass-border: rgba(255,255,255,0.18) 
--glass-shadow: 0 4px 16px -2px rgba(0,0,0,0.4)
```

**Espaciado Estándar:**
```css
--space-1: 4px  | --space-4: 16px
--space-2: 8px  | --space-5: 20px  
--space-3: 12px | --space-6: 24px
```

**Tipografía:**
```css
--text-xs: 12px   | --text-lg: 16px
--text-sm: 13px   | --text-xl: 20px
--text-base: 14px | --text-2xl: 24px
```

---

## 📦 COMPONENTES BASE IDENTIFICADOS

### 1. Glass Containers (Patrón Dominante)

**Estructura Principal:**
```tsx
className="glass rounded-xl border border-white/10 p-6 hover:border-accent-500/30 transition-all"
```

**Variantes Encontradas:**
- **Básico:** `glass rounded-xl p-5 border border-white/10`
- **Con hover:** `hover:border-accent-500/30 transition-all`
- **Con shadow:** `shadow-sm` para elementos destacados
- **Elevated:** `shadow-lg hover:shadow-xl` para modales/dropdowns

**Espaciado Consistente:**
- `p-6` (24px) para containers principales
- `p-5` (20px) para cards secundarios  
- `p-4` (16px) para elementos compactos

### 2. KPI Cards (Patrón Financiero)

**Estructura Estándar:**
```tsx
<motion.div whileHover={{ scale: 1.01, y: -1 }} className="glass rounded-xl p-5 border border-white/10 hover:border-accent-500/30">
  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 border border-white/5">
    <Icon className="w-5 h-5 text-accent-400" />
  </div>
  <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">LABEL</div>
  <div className="text-3xl font-bold text-white tabular-nums">$12,500</div>
  <div className="text-xs text-white/30">Descripción</div>
</motion.div>
```

**Elementos Clave:**
- **Icon Container:** `w-10 h-10 rounded-xl` con gradiente suave
- **Labels:** `text-[10px] uppercase tracking-wider` 
- **Valores:** `text-3xl font-bold tabular-nums` (SIEMPRE tabular-nums para números)
- **Hover:** `scale: 1.01, y: -1` (refinado, no agresivo)

### 3. Headers de Sección (Patrón Universal)

**Estructura Profesional:**
```tsx
<div className="mb-5">
  <div className="flex items-center gap-3 mb-1.5">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 border border-white/5">
      <Icon className="w-5 h-5 text-accent-400" />
    </div>
    <h3 className="text-lg font-semibold text-white tracking-tight">Título</h3>
  </div>
  <p className="text-xs text-white/40 ml-[52px]">Descripción</p>
</div>
```

**Regla de Alineación:** `ml-[52px]` para alinear descripción (40px icono + 12px gap)

### 4. Botones (Jerarquía Establecida)

**Primario (Accent):**
```tsx
className="px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-black font-semibold"
```

**Secundario (Glass):**
```tsx
className="px-4 py-2.5 rounded-xl glass border border-white/10 hover:border-accent-500/30"
```

**Destructivo:**
```tsx
className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
```

---

## 🎭 SISTEMA DE ANIMACIONES

### Framer Motion - Patrones Identificados

**Hover Effects Estándar:**
- Cards: `whileHover={{ scale: 1.01, y: -1 }}` (refinado)
- Botones: `whileHover={{ scale: 1.01 }}, whileTap={{ scale: 0.99 }}`
- Iconos: `group-hover:scale-105` (dentro de contenedor)

**Animaciones de Entrada:**
- `fadeIn`: opacity 0→1, duration: 0.15s
- `slideUp`: opacity + y: 12px→0, duration: 0.18s  
- `scaleIn`: opacity + scale: 0.97→1, duration: 0.2s
- `staggerFast`: staggerChildren: 0.05s (rápido)

**Transiciones:**
- Estándar: `transition-all duration-300`
- Rápido: `transition-fast` (0.15s)
- Solo colores: `transition-colors` (más eficiente)

### CSS Animations (Alternativa Optimizada)

**Clases Disponibles:**
```css
.animate-fade-in     /* 0.3s fade */
.animate-slide-up    /* 0.3s slide + fade */
.animate-scale-in    /* 0.2s scale + fade */
.hover-scale         /* hover: scale(1.05) */
.hover-lift          /* hover: translateY(-2px) */
```

---

## 📊 PATRONES POR MÓDULO

### Dashboard
- **Layout:** Grid responsivo con `gap-4 lg:gap-5`
- **Cards:** Glass containers con mission control styling
- **Headers:** Iconos con gradientes + títulos `text-2xl`
- **Live indicators:** Pulse animations con `bg-emerald-500`

### Finanzas  
- **KPI Cards:** Estructura estándar con colores semánticos
- **Charts:** Recharts con tooltips glass + ejes `rgba(255,255,255,0.3)`
- **Transactions:** Lista con hover `bg-white/[0.03]`
- **Modales:** Glass strong + backdrop blur

### Travel/Shows
- **Timeline:** Cards temporales con drag & drop visual
- **Status badges:** Colores semánticos con opacidades `bg-{color}-500/20`
- **Filters:** Toggle groups con `bg-white/5` activos
- **Maps:** Overlays glass con leyenda flotante

---

## 🎯 GUÍAS PARA EL ROADMAP

### 1. Componentes de Nodos (RoadmapNode.tsx)

**Estructura Recomendada:**
```tsx
// Polimórfico según tipo de evento
const RoadmapNode: React.FC<{node: RoadmapNode}> = ({node}) => {
  const config = {
    show: { color: 'emerald', icon: Calendar },
    travel: { color: 'blue', icon: Plane },
    task: { color: 'amber', icon: CheckSquare },
    finance: { color: 'purple', icon: DollarSign }
  }[node.type];

  return (
    <motion.div 
      whileHover={{ scale: 1.01, y: -1 }}
      className={`glass rounded-xl p-4 border border-white/10 hover:border-${config.color}-500/30`}
    >
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${config.color}-500/20 to-${config.color}-600/10`}>
        <config.icon className={`w-4 h-4 text-${config.color}-400`} />
      </div>
      {/* Contenido específico por tipo */}
    </motion.div>
  );
};
```

### 2. Filtros (RoadmapFilters.tsx)

**Patrón Establecido:**
```tsx
<div className="glass rounded-xl border border-white/10 p-4">
  <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Filters</div>
  <div className="flex flex-wrap gap-2">
    {filters.map(filter => (
      <button 
        className={`px-3 py-2 rounded-lg text-sm transition-all ${
          active ? 'bg-accent-500/20 text-accent-400 border-accent-500/30' : 
                   'bg-white/5 text-white/60 border-white/10'
        }`}
      />
    ))}
  </div>
</div>
```

### 3. Vista Gantt (RoadmapView.tsx)

**Container Principal:**
```tsx
<div className="glass rounded-xl border border-white/10 overflow-hidden">
  <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
    <Header />
  </div>
  <div className="p-6">
    <GanttLibrary 
      nodes={nodes}
      renderNode={(node) => <RoadmapNode node={node} />}
      onDrop={handleSimulation}
    />
  </div>
</div>
```

### 4. Modo Simulación

**Indicadores Visuales:**
```tsx
// Toggle button
<div className={`px-4 py-2 rounded-xl transition-all ${
  isSimulation ? 
    'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
    'bg-white/5 text-white/60 border-white/10'
}`}>
  Simulation Mode
</div>

// Nodos en simulación
<div className="relative">
  {isSimulation && (
    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
  )}
</div>
```

---

## 🔧 TOKENS REQUERIDOS ADICIONALES

### Nuevos Gradientes para Roadmap

```css
/* Roadmap status gradients */
--roadmap-confirmed: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%);
--roadmap-pending: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%);
--roadmap-simulation: linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(245,158,11,0.1) 100%);

/* Timeline track */
--timeline-track: rgba(255,255,255,0.05);
--timeline-progress: linear-gradient(90deg, var(--color-accent-500) 0%, var(--color-accent-400) 100%);
```

### Estados Específicos

```css
/* Drag states */
--drag-over: rgba(59,130,246,0.2);
--drop-zone: rgba(16,185,129,0.15);
--drag-preview: rgba(255,255,255,0.1);
```

---

## ✅ CONCLUSIONES Y RECOMENDACIONES

### Mantener Consistencia
1. **SIEMPRE** usar `glass rounded-xl` para containers
2. **SIEMPRE** usar `tabular-nums` para valores numéricos  
3. **SIEMPRE** usar hover states refinados (`scale: 1.01`)
4. **SIEMPRE** seguir jerarquía de colores semánticos

### Nuevo Roadmap - Seguir Patrones
1. Reutilizar KPI Cards para métricas de roadmap
2. Usar headers de sección con iconos para filtros
3. Aplicar glass morphism a todos los containers
4. Mantener animaciones sutiles y profesionales
5. Usar colores semánticos para estados (confirmed=emerald, pending=amber, etc.)

### Librerías Recomendadas para Gantt
- **React-Gantt-Chart** o **Frappe-Gantt** con customización
- Aplicar glass styling a elementos de la librería
- Override CSS para mantener coherencia visual
- Implementar drag & drop con states visuales definidos

---

**📎 Archivos de Referencia Clave:**
- `/docs/DESIGN_SYSTEM.md` - Guía completa del sistema
- `/src/styles/tokens.css` - Variables CSS centralizadas  
- `/src/components/finance/KPICards.tsx` - Patrón de cards
- `/src/pages/Dashboard.tsx` - Layout y containers
- `/src/lib/animations.ts` - Sistema de animaciones optimizado

**🎯 Próximo Paso:** Implementar feature slice `src/features/roadmap/` siguiendo estos patrones exactos.