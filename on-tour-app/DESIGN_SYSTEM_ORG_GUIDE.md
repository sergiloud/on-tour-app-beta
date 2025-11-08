# Design System Guide para /dashboard/org

## Color Palette

### Primary Colors

- **Accent/Primary**: `accent-500` - `bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10`
- **Accent hover**: `hover:from-accent-500/35 hover:to-accent-600/20`
- **Accent text**: `text-accent-100`
- **Accent border**: `border-accent-500/40`

### Glass/Background Colors

- **Glass container**: `glass rounded-xl border border-white/10 backdrop-blur-md`
- **Card background**: `bg-gradient-to-r from-white/6 to-white/3`
- **Secondary glass**: `bg-white/8 border border-white/15`
- **Hover glass**: `hover:border-white/20 hover:bg-white/12`

### Text Colors

- **Primary text**: `text-white/90`
- **Secondary text**: `text-white/70`
- **Tertiary text**: `text-white/60` or `opacity-70`
- **Dim text**: `text-white/50` or `opacity-50`
- **Very dim**: `text-[10px] opacity-60`

### Border Colors

- **Primary border**: `border-white/10`
- **Hover border**: `border-white/15` or `hover:border-white/30`
- **Active border**: `border-white/20`

## Spacing Standards

### Container & Padding

- **Main container**: `max-w-[1400px] mx-auto px-3 md:px-4`
- **Section spacing**: `space-y-4` or `gap-4`
- **Card padding**: `px-3 md:px-4 lg:px-5 py-3`
- **Sub-section**: `gap-2` or `gap-2.5` or `gap-3`

### Components Padding

- **Buttons**: `px-3 py-1.5` or `px-2 md:px-2.5 py-1.5`
- **Small buttons**: `px-2 py-1`
- **Input/Select**: `px-2 py-0.5` or `px-3 py-2`

## Button Styles

### Primary Button (Accent)

```jsx
className =
  'px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 hover:from-accent-500/35 hover:to-accent-600/20 text-accent-100 border border-accent-500/40 font-semibold text-xs shadow-lg hover:shadow-lg transition-all';
```

### Secondary Button (Glass)

```jsx
className =
  'px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-white/30 hover:bg-white/12 text-white/90 text-xs font-semibold transition-all flex items-center gap-1.5';
```

### Ghost Button

```jsx
className =
  'px-2 py-1.5 rounded-md hover:bg-white/15 text-white/90 font-semibold text-xs transition-all duration-200';
```

### Small Button/Chip

```jsx
className =
  'px-1.5 py-0.5 rounded text-[10px] border bg-white/5 border-white/15 text-white/70 hover:bg-white/10';
```

## Card/Section Styles

### Main Card (Large)

```jsx
className =
  'glass rounded-xl border border-white/10 backdrop-blur-md px-3 md:px-4 lg:px-5 py-3 md:py-3 lg:py-3 hover:border-white/20 transition-all duration-300 shadow-lg bg-gradient-to-r from-white/6 to-white/3';
```

### Secondary Card (Medium)

```jsx
className =
  'rounded-lg bg-gradient-to-r from-white/6 to-white/3 border border-white/10 hover:border-white/20 transition-all shadow-sm px-4 py-3';
```

### Small Section Card

```jsx
className = 'glass rounded border border-white/10 p-3';
```

## Typography

### Titles/Headers

- **Large title**: `text-lg md:text-xl font-semibold`
- **Section title**: `text-sm md:text-base font-semibold`
- **Card title**: `text-xs font-semibold text-white/90`
- **Label**: `text-xs opacity-70 mb-2`

### Text

- **Body**: `text-sm`
- **Small**: `text-[10px] md:text-[11px]`
- **Tiny**: `text-[10px]`

## Layout Patterns

### Header + Content Layout

```jsx
<div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-4">
  {/* Toolbar/Header */}
  <div className="glass rounded-xl border border-white/10 px-4 py-3">{/* Content */}</div>

  {/* Main Content Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{/* Cards */}</div>
</div>
```

### Empty State

```jsx
className = 'glass rounded border border-dashed border-white/12 p-4 text-sm text-center';
```

## Transitions & Interactions

- **Hover transition**: `transition-all duration-200` or `duration-300`
- **Border transition**: `hover:border-white/30`
- **Color transition**: `hover:bg-white/12`
- **Shadow transition**: `hover:shadow-lg`

## Responsive Breakpoints

- **Mobile**: base
- **Tablet**: `md:` (768px)
- **Desktop**: `lg:` (1024px)
- **Large**: scales with max-w-[1400px]

### Common Patterns

- `px-3 md:px-4` - padding adjusts for screen size
- `text-sm md:text-base` - text size scales
- `gap-2 md:gap-3` - spacing adjusts
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - grid layout
