#!/usr/bin/env node

/**
 * Quick test: Create a sample activity directly in Firestore
 * Run: node quick-test-activity.mjs
 */

console.log(`
📝 Para probar el Timeline:

OPCIÓN 1 - Crear show en la app (RECOMENDADO):
1. Ir a https://on-tour-app-beta.vercel.app/dashboard/shows
2. Click en "Add Show" (botón azul esquina superior derecha)
3. Completar formulario y guardar
4. Ir a /dashboard/timeline → Ver el evento "Nuevo show creado"

OPCIÓN 2 - Verificar en Firebase Console:
1. Ir a https://console.firebase.google.com/
2. Seleccionar proyecto "on-tour-app-beta"
3. Firestore Database → Collection "activities"
4. Si está vacío = no hay eventos todavía

OPCIÓN 3 - Desde DevTools en localhost:
1. npm run dev
2. Abrir http://localhost:5173
3. Login con demo@ontourapp.com
4. Crear un show desde /dashboard/shows
5. Ver /dashboard/timeline

✅ El tracking está configurado. Solo necesita datos.

Logs del navegador (F12 Console):
- [TimelineService] Subscribing to timeline for org: <orgId>
- [TimelineService] Received snapshot with X documents
- [TimelinePage] Received events callback: X events

Si ves "0 documents" = colección vacía (normal en primera vez)
Si ves "X documents" = Timeline funcionando!
`);
