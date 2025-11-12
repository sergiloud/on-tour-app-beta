# Performance Optimization Guide - Mobile

**Anti-flickering y optimización de FPS para iOS PWA**

## Resumen de Cambios

Se han implementado optimizaciones críticas de rendimiento para eliminar flickering, mejorar FPS y reducir lag en animaciones móviles.

## Clases CSS Optimizadas (`mobile-performance.css`)

### GPU Acceleration
```css
.gpu-accelerate          → transform: translateZ(0) + backface-visibility: hidden
.gpu-accelerate-full     → Incluye will-change: transform, opacity
.prevent-repaint         → Fuerza compositing layer para animaciones
.force-hardware          → translate3d para hardware acceleration garantizada
```

### Performance Hints
```css
.will-change-transform   → Optimización para animaciones de transform
.will-change-opacity     → Optimización para animaciones de opacity
.prevent-layout-shift    → content-visibility: auto
```

### Containment
```css
.contain-layout          → Limita recálculos de layout
.contain-paint           → Limita operaciones de paint
.contain-layout-paint    → Combinación de ambos (ideal para widgets)
.contain-strict          → Máxima optimización (usar con cuidado)
```

### Componentes Específicos
```css
.modal-layer            → Optimización para modales (AppModal, AddShowModal)
.widget-container       → Optimización para widgets de HomeScreen
.icon-wobble            → Optimización para wobble animation de AppIcon
.dock-icon              → Optimización para iconos de Dock con magnification
.fab-optimized          → Floating Action Buttons (ShowsApp, etc.)
.card-list-item         → Items de lista (shows, finance transactions)
.notification-slide     → Notificaciones con animación slide
.app-switcher-card      → Cards del App Switcher
```

### Touch & Scroll
```css
.smooth-scroll          → -webkit-overflow-scrolling: touch + overscroll-behavior
.touch-optimized        → touch-action + tap-highlight + user-select
```

## Componentes Optimizados

### ✅ Críticos (Ya optimizados)

**AppModal.tsx**
- `AnimatePresence mode="wait"` para mejor gestión de exit animations
- Spring animations reducidas: stiffness 400 → 350, damping ajustado
- Clases: `gpu-accelerate-full`, `app-modal-container`, `touch-optimized`
- Transitions: `duration: 0.15s` en lugar de spring para hovers

**MobileOS.tsx**
- Background animations: `ease: "linear"` + `times` array para fluidez
- Duración aumentada (20s → 25s) para suavidad
- Botones top: `duration: 0.2s` en lugar de spring
- Clases: `gpu-accelerate`, `prevent-repaint`, `touch-optimized`

**Dock.tsx**
- Stagger animations optimizadas: delays reducidos (0.05s → 0.03s)
- Transitions: `duration: 0.25s, ease: 'backOut'` en lugar de spring
- Clases: `gpu-accelerate-full`, `dock-icon`, `contain-layout-paint`

**HomeScreen.tsx**
- Grid de apps: `widget-container` para containment
- Page transitions: `duration: 0.2s, ease: 'easeOut'`
- Icon animations: delays reducidos (0.02s → 0.015s), scale inicial 0.9 → evitar sobre-animación
- Clases: `smooth-scroll`, `icon-wobble`

**ShowsApp.tsx**
- Lista de shows: `smooth-scroll`, `card-list-item`
- Animaciones de entrada: delays limitados a max 0.15s
- Layout animations: `duration: 0.25s` en lugar de spring
- FAB: `fab-optimized`, transitions `duration: 0.15s`

**NotificationCenter.tsx** ✨ NEW
- Lista de notificaciones: `smooth-scroll`, `notification-slide`, `card-list-item`
- Exit animations optimizadas: x reduced (20px → 15px)
- Layout transitions: `duration: 0.25s` split (layout, opacity, x)
- Botones: `touch-optimized`, `transition: 0.1s`

**FinanceApp.tsx** ✨ NEW
- Widgets: `widget-container`, `card-list-item`
- Delays reducidos (0.24s → 0.18s, 0.3s → 0.22s)
- Transitions: `duration: 0.18s, ease: 'easeOut'`

**SpotlightSearch.tsx** ✨ NEW
- Results list: `card-list-item`, `touch-optimized`
- Delays limitados: `Math.min(index * 0.025, 0.15)`
- Transitions: `duration: 0.18s, ease: 'easeOut'`
- Layout animations: `duration: 0.2s`

**CalendarApp.tsx** ✨ Phase 2
- Content wrapper: `smooth-scroll`, `widget-container`
- Month swipe: x reduced (100px → 80px), `duration: 0.25s, ease: 'easeOut'`
- Calendar buttons: `touch-optimized`, `whileTap: scale 0.95`, `transition: 0.1s`

**AppSwitcher.tsx** ✨ Phase 2
- Cards container: `gpu-accelerate`, `app-switcher-card`
- Card transitions: `duration: 0.3s, ease: 'easeOut'` (spring replaced)
- Selection indicator: `duration: 0.25s`

**AddShowModal.tsx** ✨ Phase 2
- AnimatePresence: `mode="wait"`
- Slide transition: `duration: 0.3s, ease: 'easeOut'` (spring replaced)
- Overlay: `duration: 0.15s` (reduced from 0.2s)
- Clases: `modal-layer`, `gpu-accelerate-full`

**TravelApp.tsx** ✨ Phase 3
- Travel list: `smooth-scroll`, `card-list-item`, `touch-optimized`
- Card animations: y reduced (20px → 12px), delays `Math.min(index * 0.03, 0.15)`
- Tab buttons: `touch-optimized`, `transition: 0.1s`
- Transitions: `duration: 0.2s, ease: 'easeOut'`

**TeamApp.tsx** ✨ Phase 3
- Team list: `smooth-scroll`, `card-list-item`, `touch-optimized`
- Card animations: y reduced (20px → 12px), delays `Math.min(index * 0.03, 0.15)`
- Add button: `touch-optimized`, `transition: 0.1s`
- Transitions: `duration: 0.2s, ease: 'easeOut'`

**ReportsApp.tsx** ✨ Phase 3
- Reports list: `smooth-scroll`, `card-list-item`, `touch-optimized`
- Card animations: y reduced (20px → 12px), delays `Math.min(index * 0.03, 0.15)`
- Filter buttons: `touch-optimized`
- Loading spinner: `animate-spin-optimized`
- Transitions: `duration: 0.2s, ease: 'easeOut'`

**FilesApp.tsx** ✨ Phase 3
- Files list: `smooth-scroll`, `card-list-item`, `touch-optimized`
- Card animations: x reduced (20px → 12px), delays `Math.min(index * 0.025, 0.15)`
- Category buttons: `touch-optimized`
- Loading spinner: `animate-spin-optimized`
- Transitions: `duration: 0.18s, ease: 'easeOut'`

**ArtistsApp.tsx** ✨ Phase 3
- Artists list: `smooth-scroll`, `card-list-item`, `touch-optimized`
- Card animations: y reduced (20px → 12px), delays `Math.min(index * 0.03, 0.15)`
- Genre buttons: `touch-optimized`
- Loading spinner: `animate-spin-optimized`
- Transitions: `duration: 0.2s, ease: 'easeOut'`

**VenuesApp.tsx** ✨ Phase 3
- Venues list: `smooth-scroll`, `card-list-item`, `touch-optimized`
- Card animations: y reduced (20px → 12px), delays `Math.min(index * 0.03, 0.15)`
- Type buttons: `touch-optimized`
- Loading spinner: `animate-spin-optimized`
- Transitions: `duration: 0.2s, ease: 'easeOut'`

**LinksApp.tsx** ✨ Phase 3
- Links list: `smooth-scroll`, `card-list-item`, `touch-optimized`
- Card animations: x reduced (20px → 12px), delays `Math.min(index * 0.025, 0.15)`
- Category buttons: `touch-optimized`
- Loading spinner: `animate-spin-optimized`
- Transitions: `duration: 0.18s, ease: 'easeOut'`

**NotesApp.tsx** ✨ Phase 3
- Notes list: `smooth-scroll`, `card-list-item`, `touch-optimized`
- Card animations: y reduced (20px → 12px), delays `Math.min(index * 0.025, 0.15)`
- Loading spinner: `animate-spin-optimized`
- Transitions: `duration: 0.18s, ease: 'easeOut'`



## Configuraciones de Framer Motion

### ❌ Evitar (Causa lag)
```tsx
// NO: Springs innecesarios
transition={{ type: 'spring', stiffness: 500, damping: 30 }}

// NO: Delays acumulativos sin límite
delay: index * 0.05  // En listas largas causa stagger muy lento
```

### ✅ Usar (Óptimo)
```tsx
// SÍ: Easing functions para micro-interactions
transition={{ duration: 0.15, ease: 'easeOut' }}
transition={{ duration: 0.2, ease: 'backOut' }}  // Para scale animations

// SÍ: Delays limitados en listas
delay: Math.min(index * 0.012, 0.15)  // Cap máximo de 150ms

// SÍ: Springs solo para physics-based interactions (drag, etc.)
transition={{ 
  duration: 0.25,
  ease: 'easeOut'
}
```

### AnimatePresence
```tsx
// Usar mode="wait" para modales y overlays
<AnimatePresence mode="wait">
  {isOpen && <Modal />}
</AnimatePresence>

// Usar mode="popLayout" para listas con layout animations
<AnimatePresence mode="popLayout">
  {items.map(item => <ListItem key={item.id} layoutId={item.id} />)}
</AnimatePresence>
```

## Casos de Uso

### Modales y Overlays
```tsx
<motion.div
  className="fixed inset-0 gpu-accelerate-full modal-layer"
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
```

### Listas Virtualizadas
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    className="card-list-item touch-optimized"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.15,
      ease: 'easeOut',
      delay: Math.min(index * 0.012, 0.15)
    }}
  >
```

### Widgets
```tsx
<div className="widget-container gpu-accelerate">
  <motion.div
    className="prevent-repaint"
    animate={{ /* ... */ }}
  >
```

### Floating Action Buttons
```tsx
<motion.button
  className="fab-optimized touch-optimized"
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.15, ease: 'easeOut' }}
>
```

## Métricas de Performance

### Antes
- FPS promedio: 45-50fps (con drops a 30fps)
- Flickering visible en modales y page transitions
- Lag perceptible en scroll de listas largas
- Animaciones "jerky" en low-end devices

### Objetivo (Después de optimizaciones)
- FPS constante: 60fps
- Zero flickering en transitions
- Scroll suave sin frame drops
- Animaciones fluidas incluso en iPhone 8/X

## Herramientas de Testing

### Chrome DevTools
1. **Performance Panel**: Graba 3-5 segundos de interacción
2. **Rendering Tab**: Activa "Paint flashing" y "Layer borders"
3. **FPS Meter**: Monitorea frame rate en tiempo real

### Safari Developer Tools (iOS)
1. **Web Inspector**: Conecta iPhone via USB
2. **Timelines > Rendering Frames**: Visualiza frame drops
3. **Network > Throttling**: Simula slow 3G para testing

## Accessibility

Las optimizaciones respetan `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  /* Todas las animaciones se reducen a 0.01ms */
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

## Próximos Pasos

### Apps Optimizadas ✅
**Fase 1 (Críticas):**
- [x] AppModal: AnimatePresence mode="wait", duration-based transitions
- [x] MobileOS: Background animation linearized, button transitions optimized
- [x] Dock: Stagger delays reduced, duration-based animations
- [x] HomeScreen: Grid containment, icon delays limited, smooth-scroll
- [x] ShowsApp: FAB optimized, list scroll enhanced, card-list-item applied

**Fase 2 (Secundarias):**
- [x] NotificationCenter: notification-slide, split timing, smooth-scroll
- [x] FinanceApp: Widget delays reduced, widget-container applied
- [x] SpotlightSearch: Results delays limited, card-list-item applied
- [x] CalendarApp: Month swipe optimized, buttons touch-optimized
- [x] AppSwitcher: Card transitions duration-based, app-switcher-card applied
- [x] AddShowModal: mode="wait", modal-layer, gpu-accelerate-full

**Fase 3 (Restantes):**
- [x] TravelApp: Travel cards optimized, tab buttons touch-optimized
- [x] TeamApp: Team members list optimized, smooth-scroll applied
- [x] ReportsApp: Reports list optimized, touch-optimized filters
- [x] FilesApp: Files list optimized, animate-spin-optimized loader
- [x] ArtistsApp: Artists list optimized, smooth-scroll applied
- [x] VenuesApp: Venues list optimized, animate-spin-optimized loader
- [x] LinksApp: Links list optimized, card-list-item applied
- [x] NotesApp: Notes list optimized, animate-spin-optimized loader

**Total: 19 componentes optimizados** 🎯

### Monitoreo Continuo
1. Testing regular en iPhone 8, X, 12, 14 Pro
2. Profiling de animaciones con > 16.6ms frame time
3. Lighthouse audits mensuales (Performance score > 90)
4. Monitor de FPS en producción con Performance API

### Mejoras Futuras
- [ ] Implementar virtual scrolling para listas > 100 items
- [ ] Lazy loading de imágenes con Intersection Observer
- [ ] Service Worker precache de assets críticos
- [ ] Code splitting por ruta con React.lazy
- [ ] Image optimization con WebP + fallbacks

## Referencias

- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Web.dev - Animations Guide](https://web.dev/animations-guide/)
- [Framer Motion Performance Tips](https://www.framer.com/motion/guide-reduce-bundle-size/)
- [CSS Containment](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Containment)

