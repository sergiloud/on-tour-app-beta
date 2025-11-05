# UI Component Library Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│              (Your Pages, Routes, Features)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────────┐     ┌──────────────────────┐
│  COMPONENT LAYER     │     │   HOOK LAYER         │
├──────────────────────┤     ├──────────────────────┤
│ • Button             │     │ • useInView          │
│ • Card               │     │ • useHoverEffect     │
│ • Badge              │     │ • useStaggerAnimation│
│ • Input              │     │ • useScrollAnimation │
│ • Select             │     │ • useCounterAnimation│
│ • Modal              │     │ • useThemeTransition │
│ • Alert              │     │ • useSystemTheme     │
│ • Toast              │     │ • useSpringValue     │
│ • Skeleton           │     │ • usePulseAnimation  │
└──────────┬───────────┘     └──────────┬───────────┘
           │                            │
           └────────────────┬───────────┘
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │     DESIGN SYSTEM LAYER              │
         ├──────────────────────────────────────┤
         │ Design Tokens (tokens.ts)            │
         │ ├─ Colors                            │
         │ ├─ Spacing                           │
         │ ├─ Typography                        │
         │ ├─ Shadows                           │
         │ ├─ Transitions                       │
         │ ├─ Animation Presets                 │
         │ ├─ Button Variants                   │
         │ ├─ Card Variants                     │
         │ ├─ Input Variants                    │
         │ └─ Badge Variants                    │
         └──────────────────────────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
         ▼                                     ▼
┌──────────────────────┐         ┌──────────────────────┐
│   STYLING ENGINE     │         │   ANIMATION ENGINE   │
├──────────────────────┤         ├──────────────────────┤
│ • Tailwind CSS       │         │ • Framer Motion      │
│ • Dark Mode          │         │ • GPU Acceleration   │
│ • Responsive         │         │ • Spring Physics     │
└──────────────────────┘         └──────────────────────┘
```

## Component Hierarchy

```
UI Components
│
├─ Interactive Components
│  ├─ Button (with loading, icons)
│  ├─ Select (searchable dropdown)
│  └─ Input (form input with validation)
│
├─ Container Components
│  ├─ Card (flexible container)
│  ├─ Modal (dialog overlay)
│  └─ Toast (notification)
│
├─ Indicator Components
│  ├─ Badge (status indicator)
│  ├─ Alert (notification alert)
│  └─ Skeleton (loading state)
│
└─ Provider Components
   └─ ToastProvider (context provider)
```

## Data Flow

```
User Interaction
    ↓
Component State Update
    ↓
Animation Hook Trigger (optional)
    ↓
Design Token Application
    ↓
Tailwind CSS Class Generation
    ↓
Framer Motion Animation (optional)
    ↓
Visual Update on Screen
```

## Component Composition Example

```
┌─────────────────────────────────────┐
│         Modal Component              │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────────┐ │
│  │  Header (Modal.tsx)            │ │
│  │  ├─ Title (typography token)   │ │
│  │  └─ Close Button (Button comp) │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  Content Area                  │ │
│  │  (User's custom content)       │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  Footer (Modal.tsx)            │ │
│  │  ├─ Cancel Button (Button)     │ │
│  │  └─ Confirm Button (Button)    │ │
│  └────────────────────────────────┘ │
│                                     │
│  Backdrop:                          │
│  ├─ Tailwind dark classes          │
│  ├─ Blur effect (CSS)              │
│  └─ Animation (Framer Motion)      │
│                                     │
└─────────────────────────────────────┘
```

## Token Application Flow

```
Design Token
    │
    ├─ Color Token
    │  └─→ Tailwind bg-{color}, text-{color}
    │
    ├─ Spacing Token
    │  └─→ Tailwind p-{size}, m-{size}, gap-{size}
    │
    ├─ Typography Token
    │  └─→ Tailwind text-{size}, font-{weight}
    │
    ├─ Shadow Token
    │  └─→ Tailwind shadow-{size}
    │
    ├─ Transition Token
    │  └─→ Tailwind transition-{property}
    │
    └─ Animation Token
       └─→ Framer Motion preset
```

## File Organization

```
Design System Foundation
│
├─ tokens.ts (700 lines)
│  ├─ colors = {...}
│  ├─ spacing = {...}
│  ├─ typography = {...}
│  ├─ shadows = {...}
│  ├─ transitions = {...}
│  ├─ animationPresets = {...}
│  └─ export all
│
└─ hooks.ts (300 lines)
   ├─ export useAnimatedState
   ├─ export useInView
   ├─ export useCounterAnimation
   ├─ export useHoverEffect
   ├─ export useSkeletonAnimation
   ├─ export useStaggerAnimation
   ├─ export useScrollAnimation
   ├─ export useSpringValue
   ├─ export usePulseAnimation
   ├─ export useThemeTransition
   ├─ export useSystemTheme
   └─ export usePageTransition

UI Components (1,100 lines)
│
├─ Button.tsx (75 lines)
│  └─ uses: colors, spacing, animationPresets
│
├─ Card.tsx (70 lines)
│  └─ uses: shadows, spacing, animationPresets
│
├─ Badge.tsx (55 lines)
│  └─ uses: colors, spacing
│
├─ Input.tsx (85 lines)
│  └─ uses: colors, typography, spacing
│
├─ Select.tsx (240 lines)
│  └─ uses: colors, spacing, animationPresets
│
├─ Modal.tsx (110 lines)
│  └─ uses: shadows, animationPresets, spacing
│
├─ Alert.tsx (95 lines)
│  └─ uses: colors, animationPresets
│
├─ Toast.tsx (180 lines)
│  └─ uses: colors, shadows, animationPresets
│
├─ Skeleton.tsx (125 lines)
│  └─ uses: colors, animationPresets
│
└─ index.ts (30 lines)
   └─ exports: all components + hooks + tokens
```

## Type Safety Flow

```
TypeScript Definition
    ↓
Component Props Interface
    ↓
Variant Type Union
    ↓
Props Validation
    ↓
IDE Autocomplete
    ↓
Runtime Type Checking
    ↓
Full Type Safety ✅
```

## Responsive Design Implementation

```
Design System
    │
    └─ Breakpoints
       ├─ xs: 0px     → Mobile
       ├─ sm: 640px   → Small Tablet
       ├─ md: 768px   → Tablet
       ├─ lg: 1024px  → Desktop
       ├─ xl: 1280px  → Large Desktop
       └─ 2xl: 1536px → Extra Large

    Applied to:
    ├─ Component Padding
    ├─ Component Grid
    ├─ Component Spacing
    ├─ Font Sizes
    └─ Layout Wrapping
```

## Dark Mode Implementation

```
System Preference Detected (useSystemTheme)
    ↓
Tailwind dark: classes applied
    ↓
Design tokens use dark variants
    ├─ dark:bg-slate-900
    ├─ dark:text-white
    ├─ dark:border-slate-700
    └─ dark:shadow-none

    Result: ✅ Automatic dark mode
```

## Performance Optimization

```
Code Optimization
├─ React.forwardRef
│  └─ Optimal ref passing
├─ Memoization
│  └─ Prevent unnecessary re-renders
└─ Lazy Loading
   └─ Components loaded on demand

Animation Optimization
├─ Framer Motion
│  └─ GPU acceleration
├─ Transform-based animations
│  └─ Better performance
└─ requestAnimationFrame
   └─ Smooth 60fps

Bundle Optimization
├─ Tree-shaking
│  └─ Only used components included
├─ Code splitting
│  └─ Components loaded per route
└─ Minimal dependencies
   └─ Only Framer Motion + React
```

## Integration Points

```
Application
    │
    ├─ ToastProvider (context provider)
    │  └─ Provides useToast hook
    │
    ├─ Components Layer
    │  ├─ Direct component usage
    │  └─ Props-based customization
    │
    ├─ Hooks Layer
    │  ├─ useInView for animations
    │  ├─ useHoverEffect for interactions
    │  └─ useStaggerAnimation for lists
    │
    └─ Design Tokens
       ├─ Direct import and usage
       ├─ Extends Tailwind classes
       └─ Consistent styling
```

## Example Component Usage Flow

```
Component Import
    ↓
Prop Definition
    ├─ variant: 'primary' (from union type)
    ├─ onClick: handler function
    └─ loading: boolean state
    ↓
Component Render
    ├─ Apply design tokens
    ├─ Generate Tailwind classes
    ├─ Trigger animation preset
    └─ Attach event handlers
    ↓
User Interaction
    ├─ Click event fired
    ├─ Animation triggered
    ├─ State updated
    └─ Visual feedback displayed
    ↓
Animation Complete
    └─ Component in final state
```

## Extensibility Points

```
Design Tokens → Can be extended/overridden
Component Variants → Can add new variants
Animation Hooks → Can create custom hooks
Styling System → Can add custom Tailwind classes
Color System → Can add new colors
Spacing System → Can modify spacing values
Typography → Can extend font sizes
Shadows → Can add new shadow presets
```

---

This architecture ensures:

- ✅ Consistency across all components
- ✅ Maintainability through centralization
- ✅ Scalability for future extensions
- ✅ Type safety throughout
- ✅ Performance optimization
- ✅ Accessibility compliance
- ✅ Easy debugging and testing
