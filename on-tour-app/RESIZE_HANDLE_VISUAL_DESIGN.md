# EventResizeHandle - Visual Design Specifications

## Handle States & Progression

### Visual States Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│ IDLE STATE                                                      │
├─────────────────────────────────────────────────────────────────┤
│ Width: 0.1875rem (3px)                                          │
│ Opacity: 0.35 (very subtle)                                     │
│ Color Gradient: white/50 → white/30                             │
│ Glow: 4px, rgba(255,255,255,0.25)                              │
│ Brightness: 1x (normal)                                         │
│ Visual: Almost invisible thin line on event border              │
└─────────────────────────────────────────────────────────────────┘
           ↓↓↓ (on mouseEnter) ↓↓↓
┌─────────────────────────────────────────────────────────────────┐
│ HOVER STATE                                                     │
├─────────────────────────────────────────────────────────────────┤
│ Width: 0.375rem (6px)                                           │
│ Opacity: 0.9 (visible)                                          │
│ Color Gradient: cyan-300/90 → cyan-200/80                       │
│ Glow: 8px, rgba(34,211,238,0.7)                                │
│ Brightness: 1.2x (slightly enhanced)                            │
│ Visual: Clear cyan handle with subtle glow                      │
└─────────────────────────────────────────────────────────────────┘
           ↓↓↓ (on dragStart) ↓↓↓
┌─────────────────────────────────────────────────────────────────┐
│ DRAGGING STATE                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Width: 0.625rem (10px)                                          │
│ Opacity: 1.0 (fully opaque)                                     │
│ Color Gradient: cyan-200 → cyan-300 → cyan-400                  │
│ Glow: 12px + inset, rgba(34,211,238,1.0)                       │
│ Inset Shadow: inset 0 0 8px rgba(34,211,238,0.4)               │
│ Brightness: 1.4x (significantly brighter)                       │
│ Visual: Prominent glowing handle with depth                     │
└─────────────────────────────────────────────────────────────────┘
```

## CSS Properties by State

### Idle State

```css
width: 0.1875rem;
opacity: 0.35;
background: linear-gradient(to-right, white/50, white/30);
box-shadow: 0 0 4px rgba(255, 255, 255, 0.25);
filter: brightness(1);
```

### Hover State

```css
width: 0.375rem;
opacity: 0.9;
background: linear-gradient(to-right, rgb(34, 211, 238, 0.9), rgb(34, 211, 238, 0.8));
box-shadow: 0 0 8px rgba(34, 211, 238, 0.7);
filter: brightness(1.2);
```

### Dragging State

```css
width: 0.625rem;
opacity: 1;
background: linear-gradient(to-right, rgb(165, 243, 252), rgb(34, 211, 238), rgb(6, 182, 212));
box-shadow:
  0 0 12px rgba(34, 211, 238, 1),
  inset 0 0 8px rgba(34, 211, 238, 0.4);
filter: brightness(1.4);
```

## Animation Characteristics

### Width Animation

```
Type: Spring
Stiffness: 700
Damping: 40
Mass: 0.7
Duration: Immediate (spring-based)
Effect: Natural, responsive expansion
```

### Glow Animation

```
Type: Ease Out
Duration: 250ms
Progression: Smooth fade between glow sizes and intensities
```

### Pulsing Indicator (Dragging Only)

```
Type: Infinite loop during drag
Duration: 0.8s
Scale: 1 → 1.5 → 1
Opacity: 0.9 → 1.0 → 0.9
Box-shadow: 8px → 16px → 8px glow
```

### Expanding Ring (Dragging Only)

```
Type: Infinite loop during drag
Duration: 0.8s
Scale: 1 → 1.4 → 1
Opacity: 0.3 → 0.5 → 0.3
Border: cyan-300/50 animated thickness
```

## Visual Feedback Elements

### 1. Main Handle Bar

- Gradient background that changes by state
- Smooth width animation via spring physics
- Rounded corners: `rounded-l-md` (start handle) / `rounded-r-md` (end handle)

### 2. Pulsing Indicator Dot

- **Only shown during drag**
- Size: 8px (w-2 h-2)
- Color: cyan-200
- Animation: Pulses in and out with glow effect
- Entrance: Scale from 0, opacity from 0
- Exit: Scale to 0, opacity to 0

### 3. Expanding Glow Ring

- **Only shown during drag**
- Initial: Scale 0.8, opacity 0
- Animation: Scale 1 → 1.4 → 1, opacity pulsing
- Border: 2px, animated color from cyan-300/50
- Creates visual "echo" effect

### 4. Hover Indicator Line

- **Only shown on hover (not dragging)**
- Size: 2px width, 16px height
- Color: cyan-300/60
- Position: Centered vertically in handle
- Entrance/Exit: Smooth opacity transition

## Interaction Flow

```
User Hovers over Handle
    ↓
1. Width increases: 3px → 6px
2. Handle becomes visible (opacity: 0.35 → 0.9)
3. Cyan glow appears (4px → 8px)
4. Brightness increases (1x → 1.2x)
5. Hover indicator line appears (centered)
    ↓
User Begins Drag
    ↓
1. Width expands: 6px → 10px
2. Full opacity (0.9 → 1.0)
3. Glow intensifies: 8px → 12px + inset shadow
4. Brightness maxes out (1.2x → 1.4x)
5. Pulsing dot appears
6. Expanding ring appears
7. Hover indicator disappears
    ↓
User Drags Over Cells
    ↓
- All animations continue
- Console logs show: "🟠 DRAG OVER" messages
- resizingInfo updates in MonthGrid
    ↓
User Releases Mouse (Drop)
    ↓
1. All dragging animations exit
2. Pulsing dot fades (0.2s exit animation)
3. Glow ring fades (0.2s exit animation)
4. Width returns to previous state (3px or 6px)
5. Back to idle or hover state
    ↓
Event Resized ✅
```

## Performance Considerations

- **Spring Physics**: Used for width animation (more responsive than timing functions)
- **GPU Acceleration**: Box-shadow and filter effects are GPU-accelerated
- **Minimal Repaints**: Only necessary properties animate
- **Conditional Rendering**: Pulsing dot and ring only render during drag (AnimatePresence)

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS 14+, Android 11+)

All animations use standard CSS and CSS-in-JS (Framer Motion) with full fallback support.

## Accessibility

- `role="button"`: Handle is properly labeled as interactive
- `aria-label`: Describes handle purpose (e.g., "Resize start date")
- `aria-pressed={isDragging}`: Indicates active state during drag
- `title` attribute: Provides hover tooltip with instructions
- Keyboard support: Can be extended with arrow key handlers

---

**Last Updated:** November 6, 2025  
**Status:** Production Ready ✅
