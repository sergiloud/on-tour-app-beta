# 🔄 Migración de Datos de Prophecy a Firebase

**Usuario Firebase**:
- Email: `booking@prophecyofficial.com`
- Password: `Casillas123!`

---

## 📋 Pasos de Migración

### Opción A: Migración Automática (RECOMENDADO) ⭐

Los servicios híbridos YA tienen migración automática integrada. Solo necesitas:

#### Paso 1: Crear Usuario en Firebase (Primera vez solamente)

1. **Ir a la app en producción**:
   - URL: https://on-tour-app-beta.vercel.app/register

2. **Completar registro**:
   ```
   Email: booking@prophecyofficial.com
   Password: Casillas123!
   Name: Prophecy
   Business Type: Artist
   Company Name: Prophecy
   ```

3. **Completar onboarding**:
   - Seguir el wizard
   - Click "Get Started"

#### Paso 2: Login por Primera Vez

1. **Logout** (si estás autenticado)

2. **Login con credenciales de Prophecy**:
   ```
   Email: booking@prophecyofficial.com
   Password: Casillas123!
   ```

3. **La migración sucede AUTOMÁTICAMENTE** 🎉

   En el momento del login, `AuthContext.tsx` ejecuta:
   ```typescript
   // Detecta que NO es demo user
   const isDemoUser = id.includes('@demo.com'); // false para booking@prophecyofficial.com
   
   if (!isDemoUser) {
     // Migra TODOS los datos desde localStorage a Firestore
     HybridShowService.initialize(userId);              // ✅ 139 shows
     HybridContactService.initialize(userId);           // ✅ Contactos
     FirestoreFinanceService.migrateFromLocalStorage(); // ✅ Transacciones
     FirestoreTravelService.migrateFromLocalStorage();  // ✅ Itinerarios
     FirestoreOrgService.migrateFromLocalStorage();     // ✅ Organizaciones
     FirestoreUserService.migrateFromLocalStorage();    // ✅ Perfil
   }
   ```

#### Paso 3: Verificar en Firebase Console

1. **Ir a Firebase Console**:
   - URL: https://console.firebase.google.com/project/on-tour-app-712e2

2. **Authentication → Users**:
   - Buscar: `booking@prophecyofficial.com`
   - Copiar el **User UID**

3. **Firestore Database → Data**:
   ```
   users/
     {userId}/  ← El UID copiado
       ├── profile/
       │   ├── main (name, email, bio)
       │   └── preferences (theme, language)
       │
       ├── shows/  ← Debería haber ~139 shows
       │   ├── {showId1}/
       │   ├── {showId2}/
       │   └── ...
       │
       ├── contacts/  ← Contactos CRM
       │   └── {contactId}/
       │
       ├── transactions/  ← Finanzas
       │   └── {transactionId}/
       │
       ├── itineraries/  ← Viajes
       │   └── {itineraryId}/
       │
       └── organizations/  ← org_artist_prophecy
           └── {orgId}/
   ```

4. **Contar shows**:
   - Click en `shows/` collection
   - Verificar que hay ~139 documentos
   - Cada show debería tener: band, venue, date, fee, etc.

---

### Opción B: Migración Manual con Script (Si la automática falla)

Si por alguna razón la migración automática no funciona:

#### Paso 1: Obtener Firebase UID

1. **Login en la app** con `booking@prophecyofficial.com`

2. **Abrir Browser Console** (F12 o Cmd+Option+I)

3. **Ejecutar**:
   ```javascript
   localStorage.getItem('demo:lastUser')
   // Copiar el UID que devuelve (algo como: "abc123xyz456...")
   ```

#### Paso 2: Ejecutar Script de Migración

1. **Abrir Browser Console**

2. **Copiar y pegar este código** (reemplazar `YOUR_UID_HERE` con el UID del paso anterior):

   ```javascript
   const PROPHECY_UID = 'YOUR_UID_HERE'; // ⚠️ Reemplazar con UID real

   async function migrateProphecy() {
     console.log('🚀 Migrando Prophecy a Firebase...');
     
     try {
       // Shows
       const { FirestoreShowService } = await import('./src/services/firestoreShowService');
       const shows = await FirestoreShowService.migrateFromLocalStorage(PROPHECY_UID);
       console.log(`✅ ${shows} shows migrados`);

       // Contactos
       const { FirestoreContactService } = await import('./src/services/firestoreContactService');
       const contacts = await FirestoreContactService.migrateFromLocalStorage(PROPHECY_UID);
       console.log(`✅ ${contacts} contactos migrados`);

       // Finanzas
       const { FirestoreFinanceService } = await import('./src/services/firestoreFinanceService');
       const finance = await FirestoreFinanceService.migrateFromLocalStorage(PROPHECY_UID);
       console.log(`✅ ${finance} transacciones migradas`);

       // Travel
       const { FirestoreTravelService } = await import('./src/services/firestoreTravelService');
       const travel = await FirestoreTravelService.migrateFromLocalStorage(PROPHECY_UID);
       console.log(`✅ ${travel} itinerarios migrados`);

       // Organizaciones
       const { FirestoreOrgService } = await import('./src/services/firestoreOrgService');
       const orgs = await FirestoreOrgService.migrateFromLocalStorage(PROPHECY_UID);
       console.log(`✅ ${orgs} organizaciones migradas`);

       // Perfil
       const { FirestoreUserService } = await import('./src/services/firestoreUserService');
       await FirestoreUserService.migrateFromLocalStorage(PROPHECY_UID);
       console.log(`✅ Perfil migrado`);

       console.log('🎉 ¡Migración completada!');
     } catch (error) {
       console.error('❌ Error:', error);
     }
   }

   migrateProphecy();
   ```

3. **Verificar en Firebase Console** que todos los datos aparecen

---

## 🧪 Testing Post-Migración

### Test 1: Verificar Shows

1. **Login** como `booking@prophecyofficial.com`
2. **Ir a Shows** → Deberías ver ~139 shows
3. **Abrir un show** → Verificar que todos los datos están completos
4. **Editar un show** → Guardar → Debería actualizar en Firestore

### Test 2: Cross-Device Sync

1. **Dispositivo 1**: Login como Prophecy
2. **Dispositivo 2**: Login como Prophecy (otro navegador/móvil)
3. **Dispositivo 1**: Editar un show
4. **Dispositivo 2**: El cambio debería aparecer automáticamente (real-time)

### Test 3: Finanzas

1. **Ir a Finance** → Verificar transacciones
2. **Crear nueva transacción** → Debería guardarse en Firestore
3. **Exportar datos** → Debería funcionar

### Test 4: Contactos CRM

1. **Ir a Contacts** → Verificar contactos existentes
2. **Crear nuevo contacto** → Debería guardarse en Firestore
3. **Editar contacto** → Debería actualizar en Firestore

---

## 🔍 Troubleshooting

### Problema 1: "No veo los shows después de migrar"

**Solución**:
```javascript
// Browser console
localStorage.clear(); // Limpiar localStorage
// Logout y login de nuevo
```

### Problema 2: "Error al migrar - Missing permissions"

**Causa**: Security rules no están configuradas

**Solución**:
1. Firebase Console → Firestore Database → Rules
2. Copiar reglas de `FIRESTORE_SETUP.md`
3. Publish
4. Esperar 30 segundos
5. Intentar de nuevo

### Problema 3: "Migración duplica datos"

**Causa**: La migración ya se ejecutó antes

**Solución**:
```javascript
// Browser console
// Ver si ya se migró
localStorage.getItem('firestore-shows-migrated') // Si es "true", ya se migró
```

La migración solo sucede UNA VEZ por usuario. Si necesitas re-migrar:
```javascript
localStorage.removeItem('firestore-shows-migrated');
localStorage.removeItem('firestore-contacts-migrated');
localStorage.removeItem('firestore-finance-migrated');
// Logout y login de nuevo
```

### Problema 4: "Firebase Auth error"

**Verificar**:
1. Email/Password correctos: `booking@prophecyofficial.com` / `Casillas123!`
2. Firebase Console → Authentication → Email/Password está habilitado
3. Variables de entorno en Vercel están configuradas

---

## 📊 Verificación de Datos en Firebase Console

### Estructura Esperada

```
Firestore Database → users/{userId}/

├── profile/
│   ├── main
│   │   ├── id: {userId}
│   │   ├── name: "Prophecy"
│   │   ├── email: "booking@prophecyofficial.com"
│   │   ├── bio: "..."
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│   ├── preferences
│   │   ├── theme: "dark"
│   │   ├── language: "es"
│   │   ├── currency: "EUR"
│   │   └── timezone: "Europe/Madrid"
│   │
│   └── settings
│       └── ...
│
├── shows/ (collection) ~139 documentos
│   ├── {showId1}
│   │   ├── band: "Prophecy"
│   │   ├── venue: "..."
│   │   ├── date: "2025-..."
│   │   ├── fee: 5000
│   │   ├── city: "..."
│   │   └── country: "..."
│   └── ...
│
├── contacts/ (collection)
│   └── {contactId}
│       ├── firstName: "..."
│       ├── lastName: "..."
│       ├── type: "promoter" | "venue_manager" | ...
│       └── email: "..."
│
├── transactions/ (collection)
│   └── {transactionId}
│       ├── type: "income" | "expense"
│       ├── amount: 1000
│       ├── currency: "EUR"
│       ├── category: "travel"
│       └── date: timestamp
│
├── itineraries/ (collection)
│   └── {itineraryId}
│       ├── name: "Tour 2025"
│       ├── startDate: timestamp
│       ├── endDate: timestamp
│       └── events: []
│
└── organizations/ (collection)
    └── org_artist_prophecy
        ├── name: "Prophecy"
        ├── type: "artist"
        ├── seatLimit: 10
        └── guestLimit: 5
```

---

## ✅ Checklist de Migración

- [ ] Usuario creado en Firebase Auth (`booking@prophecyofficial.com`)
- [ ] Primer login exitoso
- [ ] Verificar en Firebase Console: Authentication → Users (aparece Prophecy)
- [ ] Verificar en Firestore: `users/{userId}/` existe
- [ ] Verificar en Firestore: `users/{userId}/shows/` tiene ~139 documentos
- [ ] Verificar en Firestore: `users/{userId}/profile/main` existe
- [ ] Test: Editar un show → Se guarda en Firestore
- [ ] Test: Crear nuevo show → Aparece en Firestore
- [ ] Test: Cross-device sync funciona
- [ ] Test: Logout y login → Datos persisten

---

## 📞 Soporte

Si tienes problemas:

1. **Ver logs en Browser Console** (F12)
   - Buscar errores con "Firestore" o "Firebase"
   - Buscar warnings de migración

2. **Verificar variables de entorno** en Vercel:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - etc.

3. **Verificar Security Rules** en Firebase Console

4. **Re-ejecutar migración** (borrar flags de localStorage)

---

**Última actualización**: 10 de noviembre de 2025  
**Estado**: ✅ Listo para ejecutar  
**Usuario**: booking@prophecyofficial.com  
**Password**: Casillas123!
