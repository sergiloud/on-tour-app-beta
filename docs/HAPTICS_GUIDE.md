# Haptic Feedback Implementation Guide

El feedback háptico está implementado en los componentes principales. Para añadirlo a otros componentes:

## Uso básico

```tsx
import { haptics } from '../../../services/hapticsService';

// En el onClick del botón
<button onClick={() => {
  haptics.light(); // Para interacciones ligeras
  // ... resto del código
}}>
```

## Patrones disponibles

```tsx
haptics.light();      // 10ms - Hover, focus, selección
haptics.medium();     // 20ms - Botones estándar  
haptics.heavy();      // 30ms - Acciones importantes
haptics.success();    // [10,50,10] - Acción completada
haptics.warning();    // [30,50,30] - Advertencia
haptics.error();      // [100,50,100] - Error
haptics.selection();  // 5ms - Cambio en picker/selector
haptics.impact();     // 15ms - Impacto genérico
```

## Componentes con haptics implementados

### ✅ Implementado

- **AppIcon** - `light()` en click
- **AddShowModal** - `light()` en close, `success()`/`error()` en submit
- **ShowsApp** - `light()` en FAB button
- **AppLayout (shared)** - `light()` en botones back/add/filter
- **NotesApp** - `light()` en FAB
- **LinksApp** - `light()` en FAB

### 📋 Pendientes (casos de uso comunes)

Añadir `haptics.light()` en:

- **SettingsApp** - Toggles (línea 412)
- **CalendarApp** - Botones prev/next month (líneas 161, 178)
- **ShowsApp** - Filter buttons (línea 218)
- **TasksWidget** - Toggle checkbox (línea 95)
- **WhatsNext** - Botones prev/next (líneas 228, 240)
- **NotificationCenter** - Mark all as read, delete (líneas 86, 152, 160)
- **SpotlightSearch** - Search results (línea 175)
- **Th emeSelector** - Color selection (línea 66)

Añadir `haptics.success()` en:

- **ShowsApp** - Crear show exitoso
- **NotesApp** - Guardar nota (línea 235)
- **TasksWidget** - Completar tarea

Añadir `haptics.error()` en:

- **ShowsApp** - Error al crear show
- **NotesApp** - Error al guardar

## Configuración por usuario

Los usuarios pueden desactivar haptics desde Settings:

```tsx
import { setHapticsEnabled, getHapticsEnabled } from '../../../services/hapticsService';

// Toggle en settings
setHapticsEnabled(false); // Desactivar
setHapticsEnabled(true);  // Activar

// Leer estado
const enabled = getHapticsEnabled(); // true/false
```

## Notas

- Los haptics se persisten automáticamente en localStorage
- Si `navigator.vibrate` no está soportado, las llamadas no harán nada (fail silently)
- Los patrones están optimizados para iOS y Android PWA
- El servicio está en `src/services/hapticsService.ts`

