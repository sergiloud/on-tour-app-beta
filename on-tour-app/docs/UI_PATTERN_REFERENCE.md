# On Tour App UI/UX Pattern Reference Guide

**Version 1.0** | Baseline: Dashboard + Shows Pages  
**Last Updated:** November 5, 2025  
**Status:** Active Design System Reference

---

## Table of Contents

1. [Overview & Philosophy](#overview--philosophy)
2. [Color & Tone System](#color--tone-system)
3. [Typography Hierarchy](#typography-hierarchy)
4. [Spacing & Layout](#spacing--layout)
5. [Button Patterns](#button-patterns)
6. [Form Controls (Inputs, Selects)](#form-controls-inputs-selects)
7. [Card & Container Patterns](#card--container-patterns)
8. [Badge & Status Indicators](#badge--status-indicators)
9. [Table Patterns](#table-patterns)
10. [Modal & Overlay Patterns](#modal--overlay-patterns)
11. [Accessibility (a11y) Requirements](#accessibility-a11y-requirements)
12. [Animation & Transitions](#animation--transitions)
13. [Responsive Breakpoints](#responsive-breakpoints)

---

## Overview & Philosophy

**Core Design Principles:**

1. **Glass Morphism**: Semi-transparent backgrounds with backdrop blur for depth
2. **Generous Spacing**: Consistent gap and padding use from Tailwind scale (4px units)
3. **Subtle Gradients**: Gradient overlays on cards and containers for visual interest
4. **Semantic Colors**: Status colors (green=confirmed, amber=pending, red=danger, blue=info)
5. **Accessible by Default**: Sufficient contrast, clear focus states, keyboard navigation
6. **Responsive First**: Mobile-optimized, scales up to desktop
7. **Motion-Safe**: Animations respect `prefers-reduced-motion` via `motion-safe:` prefix

**Design System Stack:**

- **Colors**: Tailwind default palette + custom `accent-*` (purple/yellow gradient)
- **Typography**: System font stack (Segoe UI, Roboto) with semantic sizes
- **Components**: React + TypeScript with reutilizable UI components
- **Layout**: CSS Grid + Flexbox with consistent gap spacing
- **Animations**: Framer Motion with pre-defined variants

---

## Color & Tone System

### Primary Color Usage

**Accent Color (Primary CTA):** `bg-accent-500` = Purple (#a855f7)

```tsx
// Primary buttons, active states, highlights
<button className="bg-accent-500 hover:bg-accent-600 text-black">CTA</button>

// Disabled state
<button className="bg-accent-500/50 opacity-50 cursor-not-allowed">Disabled</button>

// Soft background (secondary context)
<div className="bg-accent-500/10 border border-accent-500/25 text-accent-400">
  Soft accent container
</div>
```

### Status Colors

| Status        | Color Class | Background        | Border                | Text             |
| ------------- | ----------- | ----------------- | --------------------- | ---------------- |
| **Confirmed** | `green-*`   | `bg-green-500/20` | `border-green-500/30` | `text-green-400` |
| **Pending**   | `amber-*`   | `bg-amber-500/10` | `border-amber-400/20` | `text-amber-400` |
| **Offer**     | `blue-*`    | `bg-blue-500/20`  | `border-blue-500/30`  | `text-blue-400`  |
| **Canceled**  | `red-*`     | `bg-red-500/20`   | `border-red-500/30`   | `text-red-400`   |
| **Info**      | `cyan-*`    | `bg-cyan-500/20`  | `border-cyan-500/30`  | `text-cyan-400`  |

### Glass Containers

"Glass morphism" is the default card/container style:

```tsx
// Standard glass container (with border)
<div className="glass rounded-lg border border-white/10">
  Content here
</div>

// Glass with gradient overlay
<div className="glass bg-gradient-to-br from-accent-500/15 to-accent-500/5 rounded-lg border border-white/10">
  Accent emphasis
</div>

// Glass without border (minimal)
<div className="glass rounded-lg">
  Minimal container
</div>
```

**CSS Definition** (in styles):

```css
.glass {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-color: rgba(255, 255, 255, 0.1);
}
```

---

## Typography Hierarchy

### Heading Levels

| Level       | Size        | Weight          | Tracking          | Usage                            |
| ----------- | ----------- | --------------- | ----------------- | -------------------------------- |
| **h1**      | `text-3xl`  | `font-bold`     | `tracking-tight`  | Page title (rare)                |
| **h2**      | `text-2xl`  | `font-semibold` | `tracking-tight`  | Section title (Dashboard header) |
| **h3**      | `text-lg`   | `font-semibold` | `tracking-tight`  | Subsection, Card title           |
| **h4**      | `text-base` | `font-semibold` | `tracking-normal` | Label, Form title                |
| **Caption** | `text-xs`   | `font-medium`   | `tracking-wider`  | Metadata, timestamps             |

### Body Text

```tsx
// Primary body text
<p className="text-sm text-white/90">Regular paragraph</p>

// Secondary body (reduced contrast)
<p className="text-sm text-white/70">Muted description</p>

// Tertiary (minimal emphasis)
<p className="text-xs text-white/50">Tooltip, hint text</p>

// Tabular data (monospace)
<div className="text-sm tabular-nums">$12,345.67</div>
```

### Label Style

```tsx
<label className="text-xs font-medium uppercase tracking-wider text-white/70">Field Label</label>
```

---

## Spacing & Layout

### Consistent Gap Scale

**Gap/Padding Units (4px base):**

```
1 = 4px  |  2 = 8px   |  3 = 12px  |  4 = 16px  |  5 = 20px  |  6 = 24px
8 = 32px | 10 = 40px  | 12 = 48px  | 16 = 64px  | 20 = 80px
```

**Application:**

```tsx
// Within cards: p-4 (16px)
<div className="glass p-4 rounded-lg border border-white/10">
  Content
</div>

// Between card elements: gap-2 (8px) or gap-3 (12px)
<div className="flex flex-col gap-3">
  <header>Title</header>
  <content>Data</content>
</div>

// Grid gaps: gap-4 (16px) or gap-6 (24px)
<div className="grid grid-cols-3 gap-4">
  {/* Items */}
</div>

// Flex spacing
<div className="flex items-center justify-between">
  <span>Label</span>
  <span>Value</span>
</div>
```

### Container Max-Width

```tsx
// Standard content container
<div className="max-w-[1600px] mx-auto px-4 md:px-6">Content</div>

// Mobile: px-4 (16px sides)
// Tablet: px-6 (24px sides)
// Desktop: px-6 → scales to fit max-w
```

---

## Button Patterns

### Primary Button (CTA - Call To Action)

```tsx
<button className="px-5 py-2.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-black text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
  <PlusIcon className="w-4 h-4" />
  Add Show
</button>
```

**Variants:**

- Normal: `bg-accent-500 hover:bg-accent-600`
- Hover: Darker shade + enhanced shadow
- Active: `active:scale-[.98]` (slight press effect)
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`

### Secondary Button (Glass)

```tsx
<button className="px-4 py-2.5 rounded-lg glass border border-white/10 hover:border-accent-500/30 text-sm flex items-center gap-2 transition-all">
  <FilterIcon className="w-4 h-4" />
  Filter
</button>
```

**Variants:**

- Normal: `glass border border-white/10`
- Hover: `hover:border-white/20 hover:bg-white/10`
- Interaction: `transition-all` for smooth changes

### Ghost Button (Text-only)

```tsx
<button className="px-3 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
```

**For Icon Buttons (requires aria-label):**

```tsx
<button
  className="p-2 rounded-lg hover:bg-white/10 transition-colors focus-ring"
  aria-label="Close menu"
  title="Close"
>
  <XIcon className="w-5 h-5" />
</button>
```

### Focus Ring (Accessibility)

```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:ring-offset-2 focus:ring-offset-ink-900;
}
```

---

## Form Controls (Inputs, Selects)

### Input Field

```tsx
<input
  type="text"
  placeholder="Search..."
  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent-500/50 focus:outline-none text-sm transition-all"
/>
```

**States:**

- Default: `bg-white/5 border-white/10`
- Hover: `border-white/20`
- Focus: `border-accent-500/50` (clear indication)
- Placeholder: `placeholder-text-white/30`

### Select Dropdown

```tsx
<select className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 focus:border-accent-500/50 focus:outline-none cursor-pointer transition-all">
  <option value="">Select option</option>
</select>
```

### Form Label + Input

```tsx
<div className="flex flex-col gap-2">
  <label className="text-xs font-medium uppercase tracking-wider text-white/70">Field Name</label>
  <input
    type="text"
    className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-accent-500/50 focus:outline-none"
  />
</div>
```

### Date Input

```tsx
<input
  type="date"
  className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 hover:border-white/30 focus:border-accent-500/50 focus:outline-none transition-all"
/>
```

---

## Card & Container Patterns

### Standard Card (with Content)

```tsx
<div className="glass p-4 rounded-lg border border-white/10">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-lg font-semibold">Card Title</h3>
    <span className="text-xs opacity-60">Metadata</span>
  </div>
  <div className="space-y-2">{/* Content */}</div>
</div>
```

### KPI Card (with Value Highlight)

```tsx
<div className="glass p-4 rounded-lg border border-white/10">
  <div className="text-xs font-medium uppercase tracking-wider text-white/70 mb-2">Label</div>
  <div className="text-2xl font-semibold tabular-nums text-white">$45,200</div>
  <div className="text-[11px] text-white/50 mt-1">+12% from last month</div>
</div>
```

### Section Container (with Header Divider)

```tsx
<div className="glass rounded-xl border border-white/10 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all duration-300">
  {/* Header */}
  <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-5 border-b border-white/10">
    <div className="flex items-center gap-4">
      <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
      <h2 className="text-xl lg:text-2xl font-semibold tracking-tight">Section Title</h2>
    </div>
  </div>

  {/* Content */}
  <div className="px-6 py-5">{/* Content goes here */}</div>
</div>
```

---

## Badge & Status Indicators

### Status Badge (Inline)

```tsx
<span className="px-2.5 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-[11px] font-medium">
  Confirmed
</span>
```

**Status Color Mapping:**

```tsx
const statusStyles = {
  confirmed: 'bg-green-500/20 border-green-500/30 text-green-400',
  pending: 'bg-amber-500/10 border-amber-400/20 text-amber-400',
  offer: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  canceled: 'bg-red-500/20 border-red-500/30 text-red-400',
};
```

### Live Indicator (with Pulse)

```tsx
<div className="flex items-center gap-2 text-xs text-white/60">
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
  </span>
  Live
</div>
```

### Dot Indicators

```tsx
// With label
<div className="flex items-center gap-2.5">
  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
  <span className="text-xs font-medium">Confirmed</span>
</div>
```

---

## Table Patterns

### Table Header & Row

```tsx
<table className="w-full border-collapse text-sm">
  {/* Header */}
  <thead className="sticky top-0 bg-ink-900/80 z-10">
    <tr>
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
        Date
      </th>
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
        City
      </th>
      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/70">
        Fee
      </th>
    </tr>
  </thead>

  {/* Body */}
  <tbody>
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">2025-11-05</td>
      <td className="px-4 py-3">Berlin</td>
      <td className="px-4 py-3 text-right tabular-nums font-medium">$15,000</td>
    </tr>
  </tbody>
</table>
```

### Table Cell with Highlight

```tsx
<td className="px-4 py-3">
  <span className="inline-block px-2.5 py-1 rounded-lg bg-accent-500/10 border border-accent-500/25 text-accent-400 tabular-nums font-bold group-hover:bg-accent-500/20 group-hover:border-accent-500/40 transition-all">
    $12,500.00
  </span>
</td>
```

---

## Modal & Overlay Patterns

### Modal Container

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

  {/* Modal */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="relative z-10 rounded-2xl glass border border-white/10 shadow-2xl max-w-2xl w-full mx-4"
  >
    {/* Header */}
    <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent flex items-center justify-between">
      <h2 className="text-xl font-semibold">Modal Title</h2>
      <button
        onClick={onClose}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Close modal"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>

    {/* Content */}
    <div className="px-6 py-5 space-y-4">{/* Form fields, content */}</div>

    {/* Footer */}
    <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
      <button
        onClick={onClose}
        className="px-4 py-2.5 rounded-lg glass border border-white/10 text-sm font-medium hover:bg-white/10 transition-all"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        className="px-5 py-2.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-black text-sm font-semibold shadow-lg transition-all"
      >
        Save
      </button>
    </div>
  </motion.div>
</div>
```

---

## Accessibility (a11y) Requirements

### Always Include:

1. **aria-label** for icon-only buttons

   ```tsx
   <button aria-label="Close dialog" className="...">
     <XIcon />
   </button>
   ```

2. **aria-expanded** for toggle buttons

   ```tsx
   <button aria-expanded={isOpen} onClick={toggle}>
     Menu
   </button>
   ```

3. **aria-haspopup** for dropdown/menu triggers

   ```tsx
   <button aria-haspopup="menu" onClick={toggleMenu}>
     Options
   </button>
   ```

4. **role** attributes for custom components

   ```tsx
   <div role="menuitem" tabIndex={0} onClick={handle}>
     Option
   </div>
   ```

5. **Semantic HTML** (prefer native elements)

   ```tsx
   // ✅ Good
   <button>Click me</button>
   <input type="text" />
   <label htmlFor="field">Label</label>

   // ❌ Avoid
   <div role="button">Click me</div>
   <div role="textbox" />
   ```

6. **Focus Indicators** with high contrast

   ```tsx
   className = 'focus:outline-none focus:ring-2 focus:ring-accent-500';
   ```

7. **Color Contrast** (WCAG AA minimum 4.5:1 for text)
   - White text on dark backgrounds: ✓ Good
   - Light gray text (opacity-70): Verify contrast on case-by-case

8. **Keyboard Navigation**
   - All interactive elements must be reachable via Tab key
   - Logical tab order: left-to-right, top-to-bottom
   - Test with keyboard only (no mouse)

### Skip Link (for full pages)

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-500 focus:text-white focus:rounded-lg focus:shadow-lg"
>
  Skip to main content
</a>

<main id="main-content" className="...">
  {/* Page content */}
</main>
```

---

## Animation & Transitions

### Framer Motion Variants

**Standard Entry Animation:**

```tsx
const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

<motion.div variants={slideUp} initial="initial" animate="animate">
  Content
</motion.div>;
```

### Tailwind Transitions

```tsx
// For hover/focus changes
className = 'transition-all duration-300 hover:scale-105';

// Motion-safe (respects prefers-reduced-motion)
className = 'motion-safe:transition-transform motion-safe:duration-200';

// Specific properties
className = 'transition-colors hover:bg-white/10';
```

### Common Patterns

```tsx
// Button press effect
className = 'active:scale-[.98] transition-transform';

// Smooth hover color change
className = 'transition-colors hover:bg-accent-500';

// Scale & opacity
className = 'motion-safe:transition-all hover:scale-105 hover:shadow-xl';
```

---

## Responsive Breakpoints

**Tailwind Breakpoints:**

| Prefix  | Breakpoint | Usage                        |
| ------- | ---------- | ---------------------------- |
| _none_  | 0px        | Mobile (default)             |
| **sm**  | 640px      | Large phones / small tablets |
| **md**  | 768px      | Tablets                      |
| **lg**  | 1024px     | Desktop                      |
| **xl**  | 1280px     | Large desktop                |
| **2xl** | 1536px     | Extra large screens          |

### Responsive Pattern

```tsx
// Mobile-first approach
<div className="px-4 md:px-6 py-4 md:py-6">
  {/* Mobile: 16px sides, 16px top/bottom */}
  {/* Tablet+: 24px sides, 24px top/bottom */}
</div>

// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>

// Flex responsive
<div className="flex flex-col md:flex-row gap-4">
  {/* Stacked on mobile, side-by-side on tablet+ */}
</div>

// Show/hide on breakpoints
<div className="hidden lg:block">
  Desktop-only content
</div>

<div className="lg:hidden">
  Mobile-only content
</div>
```

---

## Implementation Checklist

When adding/modifying UI components:

- [ ] **Color**: Uses semantic status colors or accent-500
- [ ] **Spacing**: Consistent gap/padding from 4px scale
- [ ] **Typography**: Follows hierarchy (h1-h4, body sizes)
- [ ] **Buttons**: Primary (accent bg), Secondary (glass), Ghost patterns
- [ ] **Forms**: Input has focus ring and proper label
- [ ] **Cards**: Uses glass container with border
- [ ] **Accessibility**: aria-labels, focus-visible, semantic HTML
- [ ] **Responsive**: Tested on mobile, tablet, desktop
- [ ] **Animation**: Respects motion-safe, smooth transitions
- [ ] **Contrast**: Text passes WCAG AA (4.5:1 minimum)

---

## Quick Copy-Paste Examples

### Header Block

```tsx
<div className="glass rounded-xl border border-white/10 backdrop-blur-sm mb-6 lg:mb-8">
  <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-5">
    <div className="flex items-center gap-4">
      <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold tracking-tight mb-1">Page Title</h1>
        <p className="text-sm opacity-70">Optional subtitle</p>
      </div>
    </div>
  </div>
</div>
```

### KPI Row

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  {[
    { label: 'Year Net', value: '$250K', tone: 'pos' },
    { label: 'Pending', value: '$85K', tone: 'neutral' },
    { label: 'This Month', value: '$42K', tone: 'neutral' },
    { label: 'Forecast EOM', value: '$48K', tone: 'pos' },
  ].map(kpi => (
    <div key={kpi.label} className="glass p-4 rounded-lg border border-white/10">
      <div className="text-xs font-medium uppercase tracking-wider text-white/70 mb-2">
        {kpi.label}
      </div>
      <div className="text-2xl font-semibold tabular-nums">{kpi.value}</div>
    </div>
  ))}
</div>
```

### Filter Button Row

```tsx
<div className="flex flex-wrap items-center gap-2">
  <button className="px-4 py-2.5 rounded-lg glass border border-white/10 hover:border-accent-500/30 text-sm font-medium transition-all">
    <FilterIcon className="w-4 h-4 mr-2 inline" />
    Filters
  </button>
  <button className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium transition-colors">
    Export
  </button>
  <button className="px-5 py-2.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-black text-sm font-semibold shadow-lg transition-all ml-auto">
    <PlusIcon className="w-4 h-4 mr-1 inline" />
    New
  </button>
</div>
```

---

## Resources & References

- **Tailwind CSS**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **Design System Reference**: `/src/design-system/`
- **UI Components**: `/src/ui/`
- **Component Examples**: `/src/components/dashboard/`, `/src/pages/dashboard/Shows.tsx`

---

**Last Updated:** November 5, 2025  
**Maintained By:** Frontend Design System Team  
**Status:** Active - Reference for all UI refactorization work
