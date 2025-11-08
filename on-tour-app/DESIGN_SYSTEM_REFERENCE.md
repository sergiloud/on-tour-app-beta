# 🎨 Design System Quick Reference

**On Tour App 2.0** - Unified component patterns and styling guidelines

---

## 📐 Spacing System

### Container Padding

```tsx
// Standard page container
className = 'px-4 sm:px-6 flex flex-col gap-4 lg:gap-5 pb-8';

// Mobile:   px-4 (16px sides)
// Tablet+:  sm:px-6 (24px sides)
// Gap:      4px mobile, 5px desktop
// Bottom:   pb-8 (32px for FAB clearance)
```

### Gaps Between Elements

```tsx
// Card grid gaps
gap-4 lg:gap-5
// 16px mobile → 20px desktop

// Header spacing
pt-5 pb-4 px-6
// Header padding: 20px top, 16px bottom, 24px sides
```

---

## 🎯 Header Pattern

```tsx
{
  /* Header Container */
}
<div
  className="relative overflow-hidden rounded-lg border border-white/10 
  bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm 
  transition-all duration-300 hover:border-white/20 hover:shadow-md"
>
  {/* Header Content */}
  <div
    className="px-6 pt-5 pb-4 border-b border-white/10 
    bg-gradient-to-r from-transparent via-white/5 to-transparent"
  >
    <div className="flex items-center justify-between">
      {/* Left: Title + Accent Bar */}
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-6 rounded-full 
          bg-gradient-to-b from-accent-500 to-blue-500"
        />
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">Page Title</h1>
          <p className="text-xs text-white/60 mt-1">Subtitle or description</p>
        </div>
      </div>

      {/* Right: Actions (hidden on mobile) */}
      <div className="hidden sm:flex items-center gap-2">{/* Buttons here */}</div>
    </div>
  </div>
</div>;
```

**Key Points**:

- Accent bar: `w-1 h-6` gradient (accent-500 → blue-500)
- Title: `text-lg` font-semibold tracking-tight
- Subtitle: `text-xs` text-white/60
- Hidden on mobile, visible on sm+

---

## 🎴 Card Pattern

```tsx
{
  /* Standard Card */
}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: idx * 0.05 }}
  whileHover={{ scale: 1.01 }}
  className="relative overflow-hidden rounded-lg border border-white/10 
    bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm 
    hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
>
  {/* Card Content */}
</motion.div>;
```

**Variants**:

```tsx
// Minimal card (no shadow)
className = 'rounded-lg border border-white/10 bg-white/5 p-4';

// Prominent card (with accent border)
className = 'rounded-lg border-2 border-accent-500/30 bg-accent-500/5 p-5';

// Danger card
className = 'rounded-lg border border-red-500/30 bg-red-500/5 p-5';
```

---

## 🔘 Button Pattern

```tsx
// Primary Button
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="px-4 py-2 rounded-lg text-sm font-medium
    bg-accent-500/10 border border-accent-500/20
    hover:border-accent-500/40 text-accent-500 transition-all"
>
  Button Text
</motion.button>

// Secondary Button
className="px-4 py-2 rounded-lg text-sm font-medium
  bg-white/5 border border-white/10
  hover:border-white/20 text-white transition-all"

// Ghost Button
className="px-4 py-2 rounded-lg text-sm font-medium
  bg-transparent border border-transparent
  hover:bg-white/5 text-white hover:text-white/70 transition-all"

// Danger Button
className="px-4 py-2 rounded-lg text-sm font-medium
  bg-red-500/10 border border-red-500/20
  hover:border-red-500/40 text-red-400 transition-all"
```

---

## 📊 Grid Patterns

### 3-Column Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
  {items.map((item, idx) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
    >
      {/* Card */}
    </motion.div>
  ))}
</div>
```

### 2-Column Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">{/* Content */}</div>
```

### Flex Layout

```tsx
<div className="flex flex-wrap items-center gap-3">{/* Flexible items */}</div>
```

---

## 🎭 Animation Patterns

### Entrance Animation (Staggered)

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: idx * 0.05 }}
>
  {/* Content - fades in and slides up */}
</motion.div>
```

### Hover Animation

```tsx
<motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
  {/* Content - scales on hover, compresses on tap */}
</motion.div>
```

### Complete Pattern

```tsx
<motion.button
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="..."
>
  Interactive Button
</motion.button>
```

---

## 🎨 Color System

### Semantic Colors

```tsx
// Success
bg-green-500/10 border-green-500/20 text-green-400

// Warning
bg-yellow-500/10 border-yellow-500/20 text-yellow-400

// Danger
bg-red-500/10 border-red-500/20 text-red-400

// Info
bg-blue-500/10 border-blue-500/20 text-blue-400

// Accent (Primary)
bg-accent-500/10 border-accent-500/20 text-accent-500

// Neutral
bg-white/5 border-white/10 text-white
```

### Opacity System

```tsx
// High contrast
(text - white, border - white / 20);

// Medium contrast
(text - white / 70, border - white / 10);

// Low contrast (subtle)
(text - white / 40, bg - white / 5);
```

---

## 📝 Typography

### Size Scale

```tsx
// Page Titles
text-lg font-semibold tracking-tight

// Section Headers
text-sm font-semibold

// Body Text
text-sm font-normal

// Labels
text-xs font-medium uppercase tracking-wider

// Captions
text-[11px] text-white/50

// KPI Numbers
text-xl font-bold (or text-2xl)
```

### Font Weights

```tsx
font - light; // 300
font - normal; // 400
font - medium; // 500
font - semibold; // 600
font - bold; // 700
```

---

## 🏗️ Component Examples

### KPI Card

```tsx
<motion.div
  delay={idx * 0.05}
  className="p-5 border border-white/10 rounded-lg 
    bg-gradient-to-br from-slate-900/40 to-slate-800/20 
    hover:border-white/20 hover:shadow-md"
>
  <div className="flex items-start justify-between mb-3">
    <p className="text-xs text-white/60 font-medium uppercase">KPI Label</p>
    <Icon className="w-5 h-5 text-blue-400 opacity-50" />
  </div>
  <p className="text-2xl font-bold text-white mb-1">42</p>
  <p className="text-xs text-white/50">Description</p>
</motion.div>
```

### Input Field

```tsx
<div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-white">
    Label
    {required && <span className="text-red-400">*</span>}
  </label>
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
    <input
      placeholder="Placeholder text"
      className="w-full pl-10 pr-3 py-2 rounded-lg 
        bg-slate-900/40 border border-white/10 
        hover:border-white/20 text-white
        focus:border-accent-500/40 focus:ring-2 focus:ring-accent-500/20"
    />
  </div>
  {error && <p className="text-xs text-red-400">Error message</p>}
</div>
```

### Tab Navigation

```tsx
<div className="flex items-center gap-2 border-b border-white/10 pb-2">
  {tabs.map(tab => (
    <motion.button
      key={tab.id}
      onClick={() => setActive(tab.id)}
      whileHover={{ scale: 1.02 }}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${
          active === tab.id
            ? 'bg-accent-500/15 text-accent-300 border border-accent-500/30'
            : 'text-white/70 hover:text-white hover:bg-white/5 border border-white/10'
        }`}
    >
      {tab.icon && <span className="mr-2">{tab.icon}</span>}
      {tab.label}
      {tab.badge && <span className="ml-2 text-xs">{tab.badge}</span>}
    </motion.button>
  ))}
</div>
```

---

## ✅ Checklist for New Components

- [ ] Use `px-4 sm:px-6` for container padding
- [ ] Use `gap-4 lg:gap-5` for responsive gaps
- [ ] Apply glassmorphism: `bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm`
- [ ] Add hover state: `hover:border-white/20 hover:shadow-md`
- [ ] Include transitions: `transition-all duration-300`
- [ ] Use motion divs for cards/items
- [ ] Stagger animations: `delay: idx * 0.05`
- [ ] Use semantic colors (green, red, blue, yellow)
- [ ] Ensure mobile-first responsive design
- [ ] Test hover/tap interactions
- [ ] Check accessibility (ARIA labels, focus states)
- [ ] Verify TypeScript types

---

## 🚀 Quick Start

### New Page Template

```tsx
import React from 'react';
import { motion } from 'framer-motion';

export default function NewPage() {
  return (
    <div className="px-4 sm:px-6 flex flex-col gap-4 lg:gap-5 pb-8">
      {/* Header */}
      <div
        className="relative overflow-hidden rounded-lg border border-white/10 
        bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm"
      >
        <div className="px-6 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-6 rounded-full 
              bg-gradient-to-b from-accent-500 to-blue-500"
            />
            <h1 className="text-lg font-semibold">Page Title</h1>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.01 }}
            className="p-5 border border-white/10 rounded-lg 
              bg-gradient-to-br from-slate-900/40 to-slate-800/20 
              hover:border-white/20 hover:shadow-md transition-all"
          >
            {/* Item Content */}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📚 Resources

- **Components**: `src/components/`
- **Org Pages**: `src/pages/org/`
- **Dashboard Pages**: `src/pages/dashboard/`
- **Utilities**: `src/lib/`
- **Context**: `src/context/`

---

**Last Updated**: November 5, 2025  
**Version**: 2.0.0

For questions or updates, refer to `CONTINUOUS_IMPROVEMENT_PHASE.md`
