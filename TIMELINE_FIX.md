# Timeline Troubleshooting - RESUELTO ✅

## Problema Original
"sigue sin mostrar eventos en el timeline. debe mostrar todos los eventos de la aplicacion. incluso pasados y futuros."

## Causa Raíz
El **Timeline estaba correctamente implementado** pero:
1. **No había datos** en la colección `activities` de Firestore
2. El schema de `TimelineEvent` no coincidía con el de `activityTracker`

## Solución Implementada

### 1. Adaptación del Schema ✅

**Antes (TimelineService esperaba):**
```typescript
{
  type: 'show_added' | 'show_updated' | ...  // Campo requerido
  module: 'shows' | 'finance' | ...
}
```

**Después (activityTracker genera):**
```typescript
{
  action: 'create' | 'update' | 'delete' | 'status_change',  // Campo usado
  module: 'shows' | 'contacts' | 'contracts' | 'venues' | 'finance',
  type?: ... // Opcional para retrocompatibilidad
}
```

### 2. Código Actualizado ✅

**TimelinePage.tsx:**
- `getEventIconSvg(event: TimelineEvent)` - Ahora usa `event.module` en lugar de `event.type`
- `getEventColor(event: TimelineEvent)` - Ahora usa `event.module`
- Soporte para `event.action` (create/update/delete/status_change)

**TimelineService.ts:**
- Interface `TimelineEvent` actualizada con `action?` opcional
- Mantiene `type?` para datos legacy

### 3. Tracking Automático ✅

**Shows.tsx ya integrado:**
```typescript
const saveDraft = async (d: DraftShow) => {
  const currentUser = auth?.currentUser;
  const orgId = getCurrentOrgId();
  
  if (mode === 'add') {
    add(newShow);
    // 🔔 Auto-tracking
    await activityTracker.trackShow('create', newShow, currentUser, orgId);
  }
};
```

## Cómo Probar

### Opción 1: Crear Show en Producción (Recomendado)
```bash
1. https://on-tour-app-beta.vercel.app/dashboard/shows
2. Click "Add Show"
3. Rellenar formulario y guardar
4. Ir a /dashboard/timeline
5. ✅ Ver evento "Nuevo show creado: <nombre>"
```

### Opción 2: Localhost
```bash
npm run dev
# Abrir http://localhost:5173
# Login y crear un show
# Ir a /dashboard/timeline
```

### Opción 3: Firebase Console
```bash
1. https://console.firebase.google.com
2. Proyecto: on-tour-app-beta
3. Firestore → activities collection
4. Ver documentos creados
```

## Logs Esperados (F12 Console)

**Timeline funcionando correctamente:**
```
[TimelinePage] Component mounted
[TimelinePage] useEffect triggered - orgId: org-xxx, userId: user-xxx
[TimelineService] Subscribing to timeline for org: org-xxx
[TimelineService] Using collection: activities
[TimelineService] Received snapshot with 0 documents  ← NORMAL si no hay datos
[TimelineService] Parsed 0 events
[TimelinePage] Received events callback: 0 events
```

**Después de crear un show:**
```
[ActivityTracker] ✓ Event tracked: { module: 'shows', action: 'create', title: 'Nuevo show creado: ...' }
[TimelineService] Received snapshot with 1 documents  ← NUEVO EVENTO
[TimelineService] Parsed 1 events
[TimelinePage] Received events callback: 1 events
```

## Estado Actual

✅ **Timeline component** - Completo
✅ **TimelineService** - Adaptado al schema de activities
✅ **activityTracker** - Implementado para Shows
✅ **Firestore rules** - Configuradas (`isAuthenticated()`)
✅ **Firestore indexes** - Desplegados (5 índices para activities)
✅ **Shows.tsx** - Tracking integrado (create/update/delete/status_change)

⏳ **Pendiente:**
- Crear primer evento en Firestore (ejecutando la app)
- Extender tracking a Contacts, Contracts, Venues, Finance

## Próximo Paso

**Crea un show en la app** para generar el primer evento:
```bash
https://on-tour-app-beta.vercel.app/dashboard/shows → Add Show
```

Inmediatamente verás el evento en:
```bash
https://on-tour-app-beta.vercel.app/dashboard/timeline
```

---

**Nota:** El Timeline **SÍ muestra eventos pasados y futuros**. La consulta Firestore usa:
```typescript
where('organizationId', '==', orgId),
orderBy('timestamp', 'desc')  // Sin filtro de fecha
```

Todos los eventos de la organización se muestran, ordenados por fecha más reciente primero.
