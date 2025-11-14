# Plan de Migración: Datos por Organización (Opción B)
**Fecha:** 14 de noviembre de 2025  
**Objetivo:** Separar datos por organización usando paths nested

---

## 🎯 Objetivo

Migrar de:
```
users/{userId}/shows/{showId}
users/{userId}/contacts/{contactId}
users/{userId}/transactions/{transactionId}
```

A:
```
users/{userId}/organizations/{orgId}/shows/{showId}
users/{userId}/organizations/{orgId}/contacts/{contactId}
users/{userId}/organizations/{orgId}/transactions/{transactionId}
```

---

## 📋 Fase 1: Preparación (2-3 horas)

### 1.1. Crear Script de Migración de Datos

**Archivo:** `scripts/migrate-to-org-paths.mjs`

```javascript
import admin from 'firebase-admin';
import fs from 'fs';

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(
  fs.readFileSync('./firebase-admin-key.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateUserData(userId) {
  console.log(`\n[Migrate] Processing user: ${userId}`);
  
  // 1. Obtener organizaciones del usuario
  const orgsSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('organizations')
    .get();
  
  if (orgsSnapshot.empty) {
    console.log(`  ⚠️  No organizations found - skipping`);
    return;
  }
  
  const orgs = orgsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  console.log(`  Found ${orgs.length} organizations`);
  
  // Por ahora, migrar TODO a la primera org
  // TODO: Agregar lógica para detectar a qué org pertenece cada item
  const primaryOrg = orgs[0];
  console.log(`  Primary org: ${primaryOrg.name} (${primaryOrg.id})`);
  
  // 2. Migrar Shows
  await migrateCollection(
    userId,
    'shows',
    primaryOrg.id,
    (doc) => ({
      ...doc.data(),
      orgId: primaryOrg.id, // Agregar orgId al documento
      migratedAt: admin.firestore.FieldValue.serverTimestamp()
    })
  );
  
  // 3. Migrar Contacts
  await migrateCollection(
    userId,
    'contacts',
    primaryOrg.id,
    (doc) => ({
      ...doc.data(),
      orgId: primaryOrg.id,
      migratedAt: admin.firestore.FieldValue.serverTimestamp()
    })
  );
  
  // 4. Migrar Venues
  await migrateCollection(
    userId,
    'venues',
    primaryOrg.id,
    (doc) => ({
      ...doc.data(),
      orgId: primaryOrg.id,
      migratedAt: admin.firestore.FieldValue.serverTimestamp()
    })
  );
  
  // 5. Migrar Transactions
  await migrateCollection(
    userId,
    'transactions',
    primaryOrg.id,
    (doc) => ({
      ...doc.data(),
      orgId: primaryOrg.id,
      migratedAt: admin.firestore.FieldValue.serverTimestamp()
    })
  );
  
  // 6. Migrar Calendar Events
  await migrateCollection(
    userId,
    'calendarEvents',
    primaryOrg.id,
    (doc) => ({
      ...doc.data(),
      orgId: primaryOrg.id,
      migratedAt: admin.firestore.FieldValue.serverTimestamp()
    })
  );
  
  console.log(`  ✅ Migration completed for user ${userId}`);
}

async function migrateCollection(userId, collectionName, orgId, transformFn) {
  const oldPath = `users/${userId}/${collectionName}`;
  const newPath = `users/${userId}/organizations/${orgId}/${collectionName}`;
  
  console.log(`    Migrating ${collectionName}...`);
  
  const snapshot = await db.collection(oldPath).get();
  
  if (snapshot.empty) {
    console.log(`      (empty - skipping)`);
    return;
  }
  
  console.log(`      Found ${snapshot.size} documents`);
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.docs.forEach(doc => {
    const newDocRef = db.collection(newPath).doc(doc.id);
    const data = transformFn(doc);
    
    batch.set(newDocRef, data);
    count++;
    
    // Firestore batch limit is 500
    if (count >= 500) {
      console.log(`      Committing batch of ${count} docs...`);
      batch.commit();
      count = 0;
    }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`      ✅ Migrated ${snapshot.size} documents`);
  }
  
  // NO BORRAR los documentos antiguos todavía - mantener backup
  console.log(`      ⚠️  Old documents NOT deleted (kept as backup)`);
}

async function main() {
  console.log('🚀 Starting Firestore Data Migration\n');
  console.log('This will migrate data to organization-scoped paths');
  console.log('Old data will be PRESERVED as backup\n');
  
  // Obtener todos los usuarios
  const usersSnapshot = await db.collection('users').get();
  
  console.log(`Found ${usersSnapshot.size} users to migrate\n`);
  
  for (const userDoc of usersSnapshot.docs) {
    try {
      await migrateUserData(userDoc.id);
    } catch (error) {
      console.error(`❌ Error migrating user ${userDoc.id}:`, error);
    }
  }
  
  console.log('\n✅ Migration completed!');
  console.log('\nNext steps:');
  console.log('1. Verify data in Firebase Console');
  console.log('2. Update Firestore rules');
  console.log('3. Deploy new code version');
  console.log('4. Test thoroughly');
  console.log('5. Delete old data after confirming everything works');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
```

### 1.2. Actualizar Firestore Rules

**Archivo:** `firestore.rules`

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Helper: Verificar que la org pertenece al usuario
    function userOwnsOrg(userId, orgId) {
      return exists(/databases/$(database)/documents/users/$(userId)/organizations/$(orgId));
    }
    
    match /users/{userId} {
      // Perfil del usuario (no cambia)
      match /profile/{document=**} {
        allow read, write: if isOwner(userId);
      }
      
      // Organizaciones del usuario
      match /organizations/{orgId} {
        // Metadatos de la org
        allow read, write: if isOwner(userId);
        
        // Shows de la org
        match /shows/{showId} {
          allow read, write: if isOwner(userId) && userOwnsOrg(userId, orgId);
        }
        
        // Contactos de la org
        match /contacts/{contactId} {
          allow read, write: if isOwner(userId) && userOwnsOrg(userId, orgId);
        }
        
        // Venues de la org
        match /venues/{venueId} {
          allow read, write: if isOwner(userId) && userOwnsOrg(userId, orgId);
        }
        
        // Transacciones de la org
        match /transactions/{transactionId} {
          allow read, write: if isOwner(userId) && userOwnsOrg(userId, orgId);
        }
        
        // Eventos de calendario de la org
        match /calendarEvents/{eventId} {
          allow read, write: if isOwner(userId) && userOwnsOrg(userId, orgId);
        }
      }
      
      // Settings del usuario (no cambia)
      match /settings/{document=**} {
        allow read, write: if isOwner(userId);
      }
      
      // Preferencias del usuario (no cambia)
      match /preferences/{document=**} {
        allow read, write: if isOwner(userId);
      }
      
      // LEGACY PATHS (para backward compatibility temporal)
      // ELIMINAR DESPUÉS DE MIGRACIÓN COMPLETA
      match /shows/{showId} {
        allow read: if isOwner(userId); // Solo lectura
        allow write: if false; // Forzar uso de nuevo path
      }
      
      match /contacts/{contactId} {
        allow read: if isOwner(userId);
        allow write: if false;
      }
      
      match /transactions/{transactionId} {
        allow read: if isOwner(userId);
        allow write: if false;
      }
    }
    
    // Deny all por defecto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 📋 Fase 2: Actualizar Servicios (4-6 horas)

### 2.1. Actualizar Interfaces

**Archivo:** `src/types/show.ts` (ejemplo)

```typescript
export interface Show {
  id: string;
  orgId: string;  // ← AGREGAR
  date: string;
  venue: string;
  city: string;
  country: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  // ... resto de campos
}
```

### 2.2. Actualizar FirestoreShowService

**Archivo:** `src/services/firestoreShowService.ts`

```typescript
export class FirestoreShowService {
  // ANTES
  private static getUserShowsPath(userId: string): string {
    return `users/${userId}/shows`;
  }
  
  // DESPUÉS
  private static getOrgShowsPath(userId: string, orgId: string): string {
    return `users/${userId}/organizations/${orgId}/shows`;
  }
  
  // Actualizar todos los métodos para recibir orgId
  static async saveShow(show: Show, userId: string, orgId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    
    const showRef = doc(db, this.getOrgShowsPath(userId, orgId), show.id);
    const showData = this.removeUndefined({
      ...show,
      orgId, // Asegurar que orgId esté en el documento
      updatedAt: Timestamp.now()
    });
    
    await setDoc(showRef, showData, { merge: true });
  }
  
  static async getShows(userId: string, orgId: string): Promise<Show[]> {
    if (!db) throw new Error('Firestore not initialized');
    
    const showsRef = collection(db, this.getOrgShowsPath(userId, orgId));
    const q = query(showsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Show));
  }
  
  // Actualizar TODOS los métodos: getShow, updateShow, deleteShow, batchSaveShows, etc.
}
```

### 2.3. Servicios a Actualizar

**Lista completa (20+ archivos):**

1. ✅ `src/services/firestoreShowService.ts`
2. ✅ `src/services/firestoreContactService.ts`
3. ✅ `src/services/firestoreVenueService.ts`
4. ✅ `src/services/firestoreFinanceService.ts`
5. ✅ `src/services/calendarEventService.ts`
6. ✅ `src/services/hybridContactService.ts`
7. ✅ `src/services/hybridVenueService.ts`
8. ✅ `src/hooks/useShows.ts`
9. ✅ `src/hooks/useContacts.ts`
10. ✅ `src/hooks/useVenues.ts`
11. ✅ `src/hooks/useTransactions.ts`
12. ✅ `src/hooks/useSyncedCalendarEvents.ts`
13. ✅ `src/hooks/useRawTransactions.ts`
14. ✅ `src/hooks/useUnifiedCalendarEvents.ts`
15. ✅ `src/context/SettingsContext.tsx` (si guarda datos)
16. ✅ Todos los componentes que llaman a estos hooks/servicios

---

## 📋 Fase 3: Actualizar Hooks y Contextos (3-4 horas)

### 3.1. useShows Hook

**Archivo:** `src/hooks/useShows.ts`

```typescript
import { useAuth } from '../context/AuthContext';
import { useOrg } from '../context/OrgContext';  // ← AGREGAR

export function useShows() {
  const { userId } = useAuth();
  const { orgId } = useOrg();  // ← OBTENER ORG ACTUAL
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!userId || !orgId) return;  // ← VALIDAR AMBOS
    
    // Cargar shows de la org actual
    const loadShows = async () => {
      try {
        const orgShows = await FirestoreShowService.getShows(userId, orgId);
        setShows(orgShows);
      } catch (error) {
        console.error('Error loading shows:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadShows();
    
    // Suscripción real-time
    const unsubscribe = FirestoreShowService.subscribeToShows(
      userId,
      orgId,  // ← PASAR ORG
      (orgShows) => {
        setShows(orgShows);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [userId, orgId]);  // ← DEPENDENCIA: orgId
  
  return { shows, loading };
}
```

**IMPORTANTE:** Cuando el usuario cambia de org (setCurrentOrgId), todos los hooks se recargan automáticamente porque `orgId` cambia.

---

## 📋 Fase 4: Testing (2-3 horas)

### 4.1. Plan de Testing

1. **Local Testing (localhost)**
   - Crear usuario de prueba con 2 orgs
   - Crear shows/contacts en cada org
   - Verificar que al cambiar org, se muestran datos correctos
   - Verificar que no se mezclan datos entre orgs

2. **Firestore Console Verification**
   - Verificar estructura de paths
   - Verificar que cada documento tiene `orgId`
   - Verificar que no hay duplicados

3. **Production Testing (Beta)**
   - Migrar 1-2 usuarios reales
   - Verificar funcionalidad completa
   - Monitorear errores

---

## 📋 Fase 5: Deployment (1 hora)

### 5.1. Secuencia de Deployment

```bash
# 1. Backup de Firestore (antes de migración)
gcloud firestore export gs://on-tour-app-backup/$(date +%Y%m%d)

# 2. Correr script de migración
node scripts/migrate-to-org-paths.mjs

# 3. Desplegar nuevas rules
firebase deploy --only firestore:rules

# 4. Build y deploy código
npm run build
git add -A
git commit -m "feat: migrate to org-scoped data paths"
git push origin main
git push beta main

# 5. Monitorear logs
# Esperar 5-10 min, verificar que no hay errores

# 6. Si todo OK, eliminar datos legacy (OPCIONAL)
# node scripts/cleanup-legacy-paths.mjs
```

---

## 🚨 Riesgos y Mitigaciones

### Riesgo 1: Pérdida de Datos
**Mitigación:**
- ✅ Backup automático antes de migración
- ✅ Script NO borra datos antiguos
- ✅ Datos legacy quedan como backup

### Riesgo 2: Usuarios Activos Durante Migración
**Mitigación:**
- ⚠️ Comunicar ventana de mantenimiento
- ⚠️ O: Hacer migración gradual por lotes de usuarios
- ⚠️ O: Mantener backward compatibility (leer de ambos paths)

### Riesgo 3: Código Roto en Producción
**Mitigación:**
- ✅ Testing exhaustivo en localhost
- ✅ Beta deployment primero
- ✅ Rollback plan ready

---

## ⏱️ Timeline Estimado

| Fase | Tareas | Tiempo | Status |
|------|--------|--------|--------|
| **Fase 1** | Script migración + Rules | 2-3h | ⏳ Pendiente |
| **Fase 2** | Actualizar servicios (20+ archivos) | 4-6h | ⏳ Pendiente |
| **Fase 3** | Actualizar hooks + contextos | 3-4h | ⏳ Pendiente |
| **Fase 4** | Testing completo | 2-3h | ⏳ Pendiente |
| **Fase 5** | Deployment + monitoring | 1h | ⏳ Pendiente |
| **TOTAL** | | **12-17h** | |

---

## ✅ Checklist Pre-Deployment

- [ ] Script de migración testeado en local
- [ ] Firestore rules actualizadas y testeadas
- [ ] Todos los servicios actualizados
- [ ] Todos los hooks actualizados
- [ ] Interfaces actualizadas con `orgId`
- [ ] Testing local completo
- [ ] Backup de Firestore creado
- [ ] Plan de rollback documentado
- [ ] Usuarios notificados (si aplica)

---

## 🎯 Próximos Pasos INMEDIATOS

1. **Crear firebase-admin-key.json** (si no existe)
   - Ir a Firebase Console
   - Project Settings → Service Accounts
   - Generate New Private Key

2. **Instalar firebase-admin**
   ```bash
   npm install firebase-admin
   ```

3. **Crear script de migración**
   - Copiar template arriba a `scripts/migrate-to-org-paths.mjs`
   - Ajustar lógica de detección de org (si es necesario)

4. **Testing en development**
   - Crear usuario de prueba
   - Correr migración
   - Verificar en Firestore Console

---

**¿Quieres que empiece con alguna fase específica?**

Opciones:
A) Crear el script de migración completo
B) Actualizar un servicio como ejemplo (ej: firestoreShowService)
C) Actualizar las Firestore rules
D) Otro enfoque
