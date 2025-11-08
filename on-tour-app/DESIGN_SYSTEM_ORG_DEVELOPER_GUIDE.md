# Design System Quick Reference - Developer Guide

## 🎨 Using the Design System in `/dashboard/org` Pages

### Quick Start

#### 1. Container Structure

Always wrap your page content in this container:

```tsx
<motion.div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-4 pb-8" layoutId="page-name">
  {/* Your content here */}
</motion.div>
```

#### 2. Card Component

For any card/section, use this base class:

```tsx
<div className="glass rounded-lg border border-white/10 p-3 md:p-4 bg-gradient-to-r from-white/6 to-white/3">
  {/* Card content */}
</div>
```

With hover effect:

```tsx
<div className="glass rounded-lg border border-white/10 p-3 md:p-4 bg-gradient-to-r from-white/6 to-white/3 hover:border-white/20 transition-all">
  {/* Card content */}
</div>
```

#### 3. Buttons

**Primary Action Button (Accent Gradient):**

```tsx
<button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 border border-accent-500/30 hover:border-accent-500/50 hover:from-accent-500/35 hover:via-accent-500/25 hover:to-accent-600/20 text-accent-200 font-semibold text-xs transition-all duration-300 shadow-lg shadow-accent-500/10">
  Action
</button>
```

**Secondary Button (Glass Style):**

```tsx
<button className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-white/30 hover:bg-white/12 text-white/90 text-xs font-semibold transition-all">
  Secondary
</button>
```

---

## 📐 Spacing Guidelines

### Container Padding

- Mobile: `px-3`
- Desktop: `md:px-4`
- Always use: `mx-auto max-w-[1400px]`

### Card Padding

- Mobile: `p-3`
- Desktop: `md:p-4`

### Gaps Between Elements

- Primary: `gap-4` or `space-y-4`
- Compact: `gap-3` or `space-y-3`

### Typography Spacing

- After headers: `mb-2` or `mb-3`
- Between sections: `space-y-3` or `space-y-4`

---

## 🎯 Typography Hierarchy

### Text Sizes & Weights

**Main Header (Page Title)**

```tsx
<h1 className="text-sm md:text-base font-semibold tracking-tight text-white/90">Page Title</h1>
```

**Section Header**

```tsx
<h2 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-3">Section Title</h2>
```

**Body Text**

```tsx
<p className="text-sm text-white/90">Body text</p>
```

**Secondary Text**

```tsx
<p className="text-xs text-white/70">Secondary text</p>
```

**Muted Text**

```tsx
<p className="text-xs text-white/60">Muted text</p>
```

---

## 🎨 Color & Opacity Mapping

### Text Colors

```
Primary:   text-white/90  (90% opacity)
Secondary: text-white/70  (70% opacity)
Tertiary:  text-white/60  (60% opacity)
Muted:     text-white/50  (50% opacity)
Placeholder: text-white/40 (40% opacity)
Disabled:  text-white/30  (30% opacity)
```

### Background & Border Colors

```
Card:        border-white/10
Card Hover:  border-white/20
Focus:       border-accent-500/30
Accent:      accent-500
Accent Alt:  accent-300
Background:  bg-white/5 (for inner elements)
Hover BG:    bg-white/8
```

---

## 🔄 Grid & Layout Patterns

### Two Column Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

### Three Column Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Four Column Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div>Column 1</div>
  {/* ... */}
</div>
```

---

## ✨ Animations & Interactions

### Standard Transition

```tsx
<div className="transition-all duration-300">Smooth transition</div>
```

### Card Hover with Scale

```tsx
<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="...">
  Card content
</motion.div>
```

### Subtle Scale (Recommended for most elements)

```tsx
<motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="...">
  Content
</motion.div>
```

### List Item Stagger Animation

```tsx
{
  items.map((item, idx) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
    >
      {item}
    </motion.div>
  ));
}
```

---

## 📱 Responsive Design

### Breakpoints Used

```
Mobile:   < 768px (default styles)
Tablet:   768px and up (md: prefix)
Desktop:  1024px and up (lg: prefix)
```

### Common Responsive Patterns

**Responsive Padding:**

```tsx
<div className="px-3 md:px-4">Content</div>
```

**Responsive Font Size:**

```tsx
<h1 className="text-sm md:text-base lg:text-lg">Title</h1>
```

**Responsive Grid:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{/* Content */}</div>
```

**Hide/Show Based on Screen:**

```tsx
<button className="hidden md:block">Desktop Only</button>
<button className="md:hidden">Mobile Only</button>
```

---

## 🎯 Common Components

### Header with Icon and Title

```tsx
<div className="flex items-center gap-3">
  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
  <div>
    <h1 className="text-sm md:text-base font-semibold text-white/90">Title</h1>
    <p className="text-xs text-white/60 mt-1">Subtitle</p>
  </div>
</div>
```

### Badge/Status Indicator

```tsx
<span className="px-2 py-1 rounded-lg bg-accent-500/15 border border-accent-500/20 text-xs font-semibold text-accent-200">
  Active
</span>
```

### Icon Container

```tsx
<div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center border border-accent-500/20">
  <Icon className="w-4 h-4 text-accent-300" />
</div>
```

### Info Card

```tsx
<div className="glass rounded-lg border border-white/10 p-3 md:p-4 bg-gradient-to-r from-white/6 to-white/3">
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-accent-300 flex-shrink-0 mt-0.5" />
    <div>
      <h3 className="text-sm font-semibold text-white/90 mb-1">Title</h3>
      <p className="text-xs text-white/70">Description</p>
    </div>
  </div>
</div>
```

---

## 🚀 Best Practices

### DO ✅

- Use `max-w-[1400px] mx-auto` for all page containers
- Apply `transition-all duration-300` to interactive elements
- Use `text-white/XX` for explicit opacity levels
- Group related elements with `space-y-4` or `gap-4`
- Use `motion.div` from Framer Motion for animated elements
- Keep card padding consistent: `p-3 md:p-4`
- Add hover states to interactive cards

### DON'T ❌

- Don't use hardcoded colors like `#000` or `rgb(255, 255, 255)`
- Don't mix opacity (e.g., `opacity-70` + `text-white/70`)
- Don't use different container max-widths (always `1400px`)
- Don't add shadows unnecessarily (only on buttons with gradients)
- Don't use `sm:` breakpoint (use `md:` instead)
- Don't create inconsistent spacing patterns
- Don't forget responsive padding on cards

---

## 🔍 Debugging Tips

### Check if Design System Applied

Look for these key characteristics:

- ✅ Glass cards have gradient background
- ✅ Buttons have accent colors
- ✅ Padding responsive (px-3 md:px-4)
- ✅ Text has proper opacity levels
- ✅ Hover states smooth and visible

### Common Issues & Fixes

**Card looks flat/boring:**

- Add gradient: `bg-gradient-to-r from-white/6 to-white/3`
- Add hover: `hover:border-white/20 transition-all`

**Button doesn't stand out:**

- Use accent gradient for primary actions
- Add shadow: `shadow-lg shadow-accent-500/10`

**Text not readable:**

- Check opacity: primary `text-white/90`, secondary `text-white/70`
- Use `font-semibold` for important text

**Layout breaks on mobile:**

- Ensure padding: `px-3 md:px-4`
- Check grid: `grid-cols-1 md:grid-cols-X`
- Verify gaps: `gap-4` consistent

---

## 📚 Reference Documents

For more detailed information, see:

1. **DESIGN_SYSTEM_ORG_GUIDE.md** - Comprehensive design tokens
2. **DESIGN_SYSTEM_ORG_REFACTOR_COMPLETE.md** - Complete refactor summary
3. **DESIGN_SYSTEM_ORG_VISUAL_COMPARISON.md** - Before/after comparison

---

## 🎓 Learning Examples

### Example 1: Simple Card Page

```tsx
export const MyPage = () => (
  <motion.div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-4 pb-8">
    {/* Header */}
    <div className="glass rounded-lg border border-white/10 p-3 md:p-4 bg-gradient-to-r from-white/6 to-white/3">
      <h1 className="text-sm md:text-base font-semibold text-white/90">My Page</h1>
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card 1 */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="glass rounded-lg border border-white/10 p-3 md:p-4 bg-gradient-to-r from-white/6 to-white/3"
      >
        <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-3">Title</h2>
        <p className="text-sm text-white/90">Content goes here</p>
      </motion.div>

      {/* Card 2 */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="glass rounded-lg border border-white/10 p-3 md:p-4 bg-gradient-to-r from-white/6 to-white/3"
      >
        <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-3">Title</h2>
        <button className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-white/30 text-white/90 text-xs font-semibold transition-all">
          Action
        </button>
      </motion.div>
    </div>
  </motion.div>
);
```

---

## ✨ Summary

The design system for `/dashboard/org` pages is built on these core principles:

1. **Consistency** - Same patterns everywhere
2. **Responsiveness** - Mobile-first design
3. **Accessibility** - Proper contrast and sizing
4. **Performance** - Optimized CSS and animations
5. **Professionalism** - Enterprise-grade aesthetic

Follow this guide and your org pages will integrate seamlessly with the rest of the application! 🚀

---

**Last Updated**: November 2024
**Status**: Active & Maintained
**Questions?** Refer to the comprehensive design system documentation.
