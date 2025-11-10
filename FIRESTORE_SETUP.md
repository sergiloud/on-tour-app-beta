# 🔥 Firestore Setup - URGENTE

## ⚠️ Error Actual

Estás viendo este error en producción:
```
GET https://firestore.googleapis.com/.../Listen/channel 400 (Bad Request)
```

**Causa**: Firestore no está habilitado en tu proyecto Firebase.

---

## ✅ Solución: Habilitar Firestore

### Paso 1: Crear Firestore Database

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **on-tour-app-712e2**
3. En el menú lateral → Click en **"Firestore Database"**
4. Click en **"Create database"**

### Paso 2: Configurar Modo de Firestore

Aparecerán dos opciones:

#### Opción A: Production Mode (Recomendado para producción)
- ✅ Selecciona **"Start in production mode"**
- Click **"Next"**
- Reglas: Denegar todo por defecto (las configuraremos luego)

#### Opción B: Test Mode (Solo para desarrollo rápido)
- ⚠️ **PELIGRO**: Cualquiera puede leer/escribir tus datos
- Solo úsalo si estás probando
- Expira en 30 días

**Recomendación**: Usa Production Mode y configura reglas después.

### Paso 3: Seleccionar Región

1. Elige la región más cercana a tus usuarios:
   - **europe-west1** (Bélgica) - Si tus usuarios están en Europa
   - **us-central1** (Iowa) - Si tus usuarios están en América
   - **asia-northeast1** (Tokio) - Si tus usuarios están en Asia

2. Click **"Enable"**

⏳ Espera 1-2 minutos mientras Firebase crea la base de datos.

---

## 🔐 Paso 4: Configurar Reglas de Seguridad

Una vez creado Firestore:

1. Click en la pestaña **"Rules"**
2. Copia y pega estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Shows collection - solo usuarios autenticados pueden leer/escribir sus propios shows
    match /shows/{showId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    // Users collection - solo el dueño puede leer/escribir
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == userId;
    }
    
    // Organizations collection
    match /organizations/{orgId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId == orgId;
    }
    
    // Denegar todo lo demás por defecto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **"Publish"**

---

## 📊 Paso 5: Verificar que funciona

### Prueba en local:

```bash
npm run dev
```

1. Crea un usuario nuevo (o login con Prophecy)
2. Ve a Firebase Console → Firestore Database → Data
3. Deberías ver aparecer documentos en `shows/` cuando crees un show

### Prueba en producción:

1. Ve a tu app en Vercel: https://on-tour-app-beta.vercel.app
2. Crea una cuenta nueva
3. Deberías ver el mensaje de sync exitoso sin errores 400

---

## 🎯 Estructura de Datos que se creará

```
firestore/
├── shows/
│   ├── {showId}/
│   │   ├── userId: string
│   │   ├── band: string
│   │   ├── venue: string
│   │   ├── date: string
│   │   ├── fee: number
│   │   ├── ...otros campos
│   └── ...
├── users/
│   ├── {userId}/
│   │   ├── email: string
│   │   ├── displayName: string
│   │   ├── createdAt: timestamp
│   └── ...
└── organizations/ (futuro)
```

---

## ⚡ Índices (Opcional - solo si hay errores de query)

Si ves errores como:
```
The query requires an index
```

1. Click en el link del error → Te llevará a crear el índice automáticamente
2. O ve a Firestore → **Indexes** → **Create index** manualmente

---

## 🆘 Troubleshooting

### Error: "Missing or insufficient permissions"
- **Causa**: Las reglas de Firestore están bloqueando la operación
- **Solución**: Verifica que las reglas permitan lectura/escritura para usuarios autenticados

### Error: "PERMISSION_DENIED: Missing or insufficient permissions"
- **Causa**: El usuario no está autenticado o intenta acceder a datos de otro usuario
- **Solución**: Asegúrate de estar logged in y que `userId` coincida con `auth.uid`

### Error: "The query requires an index"
- **Causa**: Firestore necesita un índice para queries complejas
- **Solución**: Click en el link del error → Firebase creará el índice automáticamente

### Error sigue igual después de habilitar Firestore
- **Causa**: Cache del navegador
- **Solución**: 
  1. Hard refresh: Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)
  2. Abre DevTools → Application → Clear storage → Clear site data

---

## 📝 Checklist Final

- [ ] Firestore Database creado en Firebase Console
- [ ] Región seleccionada (europe-west1 o us-central1)
- [ ] Reglas de seguridad configuradas
- [ ] Test en local: Usuario puede crear/leer shows
- [ ] Test en producción: Sin errores 400 en console

---

## 🚀 Próximo Paso

Una vez Firestore esté funcionando:

1. ✅ Los datos se guardarán en la nube automáticamente
2. ✅ Sincronización cross-device funcionará
3. ✅ El componente `StorageStatus` mostrará "Cloud sync enabled"
4. ✅ La página `/dashboard/data-security` mostrará el estado correcto

**Tiempo estimado**: 5 minutos
