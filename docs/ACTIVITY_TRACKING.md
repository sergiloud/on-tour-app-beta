# Activity Tracking Implementation

Tracking automático de eventos para el **Timeline de la Organización**.

---

## ✅ ¿Qué está implementado?

### 1. **ActivityTracker Service** (`src/services/activityTracker.ts`)

Servicio centralizado con helpers para todos los módulos:

```typescript
import { activityTracker } from '../services/activityTracker';
import { auth } from '../lib/firebase';
import { getCurrentOrgId } from '../lib/tenants';

// Ejemplo: Tracking de shows
await activityTracker.trackShow(
  'create',              // action: create | update | delete | status_change
  show,                  // show object
  auth.currentUser,      // Firebase user
  getCurrentOrgId()      // organizationId
);
```

**Módulos soportados:**
- ✅ **Shows** - `trackShow(action, show, user, orgId, metadata?)`
- ✅ **Contacts** - `trackContact(action, contact, user, orgId, metadata?)`
- ✅ **Contracts** - `trackContract(action, contract, user, orgId, metadata?)`
- ✅ **Venues** - `trackVenue(action, venue, user, orgId, metadata?)`
- ✅ **Finance** - `trackFinance(action, transaction, user, orgId, metadata?)`

---

## 🚀 Integración Actual

### **Shows.tsx** ✅ Implementado

```typescript
const saveDraft = async (d: DraftShow) => {
  const currentUser = auth?.currentUser;
  const orgId = getCurrentOrgId();

  if (mode === 'add') {
    const newShow = { ...d, id, costs: d.costs || [] };
    add(newShow);
    
    // 🔔 Automatic tracking
    if (currentUser && orgId) {
      await activityTracker.trackShow('create', newShow, currentUser, orgId);
    }
  } else if (mode === 'edit' && d.id) {
    const oldShow = shows.find(s => s.id === d.id);
    const statusChanged = oldShow && oldShow.status !== d.status;
    
    update(d.id, { ...d, costs: d.costs || [] });
    
    // 🔔 Track update or status_change
    if (currentUser && orgId) {
      if (statusChanged) {
        await activityTracker.trackShow('status_change', d, currentUser, orgId);
      } else {
        await activityTracker.trackShow('update', d, currentUser, orgId);
      }
    }
  }
};

const deleteDraft = async (d: DraftShow) => {
  if (mode === 'edit' && d.id) {
    remove(d.id);
    
    // 🔔 Track deletion
    const currentUser = auth?.currentUser;
    const orgId = getCurrentOrgId();
    if (currentUser && orgId) {
      await activityTracker.trackShow('delete', d, currentUser, orgId);
    }
  }
};
```

**Eventos generados:**
- **Create:** `"Nuevo show creado: Arctic Monkeys - Madison Square Garden"` (importance: high)
- **Update:** `"Show actualizado: Arctic Monkeys"` (importance: low)
- **Status Change:** `"Show Arctic Monkeys: estado cambió a confirmed"` (importance: high si confirmed)
- **Delete:** `"Show eliminado: Arctic Monkeys"` (importance: medium)

---

## 📋 TODO: Extender a otros módulos

### **Contacts** (pendiente)

**Dónde integrar:** `src/components/crm/ContactEditorModal.tsx` o `src/services/hybridContactService.ts`

```typescript
// En handleSave() o createContact()
await activityTracker.trackContact('create', newContact, auth.currentUser, orgId);

// En handleUpdate()
await activityTracker.trackContact('update', updatedContact, auth.currentUser, orgId);

// En handleDelete()
await activityTracker.trackContact('delete', contact, auth.currentUser, orgId);
```

---

### **Contracts** (pendiente)

**Dónde integrar:** `src/services/hybridContractService.ts`

```typescript
// En createContract()
await activityTracker.trackContract('create', newContract, auth.currentUser, orgId);

// En updateContract() - detectar cambio de status
if (oldContract.status !== updatedContract.status) {
  await activityTracker.trackContract('status_change', updatedContract, auth.currentUser, orgId);
} else {
  await activityTracker.trackContract('update', updatedContract, auth.currentUser, orgId);
}
```

---

### **Venues** (pendiente)

**Dónde integrar:** `src/services/hybridVenueService.ts`

```typescript
await activityTracker.trackVenue('create', newVenue, auth.currentUser, orgId);
await activityTracker.trackVenue('update', updatedVenue, auth.currentUser, orgId);
await activityTracker.trackVenue('delete', venue, auth.currentUser, orgId);
```

---

### **Finance** (pendiente)

**Dónde integrar:** `src/features/finance/*` o `src/services/financeApi.ts`

```typescript
// Cuando se registra un pago
await activityTracker.trackFinance('payment', {
  id: paymentId,
  amount: 250000,
  currency: 'EUR',
  concept: 'Anticipo Ed Sheeran'
}, auth.currentUser, orgId);

// Cuando se crea una transacción
await activityTracker.trackFinance('create', transaction, auth.currentUser, orgId);
```

---

## 🧪 Testing

### Opción 1: Crear eventos manualmente desde la app

1. Ir a `/dashboard/shows`
2. Crear un nuevo show
3. Editarlo (cambiar status)
4. Eliminarlo
5. Ir a `/dashboard/timeline` → Deberías ver 3 eventos

---

### Opción 2: Script de test automático

```bash
# Instalar dependencias (si no están)
npm install firebase

# Ejecutar script
node create-test-activities.mjs
```

**Resultado:** 10 eventos de prueba en el Timeline:
- 4 eventos de Shows (create, status_change, update, delete)
- 2 eventos de Contacts (create, update)
- 2 eventos de Contracts (create, status_change)
- 1 evento de Venues (update)
- 1 evento de Finance (payment)

---

## 📊 Estructura de datos

**Firestore Collection:** `activities`

**Documento:**
```typescript
{
  organizationId: 'org-demo-001',
  module: 'shows', // shows | contacts | contracts | venues | finance | crm
  action: 'create', // create | update | delete | status_change | payment | note_add
  userId: 'user-123',
  userName: 'John Smith',
  userEmail: 'john@example.com',
  title: 'Nuevo show creado: Arctic Monkeys - MSG',
  description: 'Show confirmado para el 15 de Junio 2025', // optional
  importance: 'high', // low | medium | high | critical
  relatedId: 'show-001', // ID del show/contact/contract
  relatedName: 'Arctic Monkeys - MSG', // Nombre para búsqueda rápida
  metadata: { // Datos específicos del módulo
    showDate: '2025-06-15',
    venue: 'Madison Square Garden',
    artist: 'Arctic Monkeys',
    status: 'confirmed'
  },
  timestamp: serverTimestamp(),
  createdAt: serverTimestamp()
}
```

---

## 🔍 Firestore Indexes

Ya desplegados en Firebase:

```json
{
  "collectionGroup": "activities",
  "fields": [
    { "fieldPath": "organizationId", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "activities",
  "fields": [
    { "fieldPath": "organizationId", "order": "ASCENDING" },
    { "fieldPath": "module", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "activities",
  "fields": [
    { "fieldPath": "organizationId", "order": "ASCENDING" },
    { "fieldPath": "importance", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
}
```

---

## 🔒 Firestore Rules

```javascript
match /activities/{activityId} {
  // Cualquier usuario autenticado puede leer activities
  // (el filtrado por organizationId se hace en el cliente)
  allow read: if isAuthenticated();
  
  // Solo usuarios autenticados pueden crear activities
  allow create: if isAuthenticated();
  
  // No permitir updates ni deletes (activities son inmutables)
  allow update, delete: if false;
}
```

---

## 🎯 Próximos Pasos

1. **Extender tracking a otros módulos:**
   - [ ] Contacts
   - [ ] Contracts
   - [ ] Venues
   - [ ] Finance

2. **Mejorar experiencia:**
   - [ ] Añadir avatares de usuarios en Timeline
   - [ ] Click en evento → navegar al elemento relacionado (show, contact, etc.)
   - [ ] Filtros avanzados (rango de fechas personalizado)
   - [ ] Export CSV del Timeline

3. **Real-time collaboration (opcional):**
   - [ ] Implementar Socket.io (ver `docs/SOCKET_IO_ARCHITECTURE.md`)
   - [ ] O usar Firestore real-time listeners (ya funciona)
   - [ ] Indicador "Usuario X está editando este show"

---

## 📚 Archivos Relacionados

- `src/services/activityTracker.ts` - Servicio principal
- `src/services/timelineService.ts` - Subscripción a Firestore
- `src/pages/dashboard/TimelinePage.tsx` - UI del Timeline
- `src/pages/dashboard/Shows.tsx` - Integración en Shows (✅ completo)
- `firestore.indexes.json` - Índices de Firestore
- `firestore.rules` - Reglas de seguridad
- `docs/TIMELINE_IMPLEMENTATION.md` - Documentación completa del Timeline
- `docs/SOCKET_IO_ARCHITECTURE.md` - Plan para real-time con Socket.io

---

**¿Dudas?** Revisa los logs de la consola: `[ActivityTracker] ✓ Event tracked: { ... }`
