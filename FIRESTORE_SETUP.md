# Firestore Setup - Instrucciones de Configuración

## Problema Actual
Las agencias no se están guardando en Firestore. Error 400 en las peticiones.

## Pasos para Verificar y Corregir

### 1. Verificar Reglas de Firestore en Firebase Console

Ve a [Firebase Console](https://console.firebase.google.com/project/on-tour-app-712e2/firestore/rules)

Asegúrate de que las reglas estén publicadas:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the data
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // User data - users can only access their own data
    match /users/{userId} {
      // Allow user to read and write their own data
      allow read, write: if isOwner(userId);
      
      // User profile
      match /profile/{document=**} {
        allow read, write: if isOwner(userId);
      }
      
      // User shows
      match /shows/{showId} {
        allow read, write: if isOwner(userId);
      }
      
      // User contacts
      match /contacts/{contactId} {
        allow read, write: if isOwner(userId);
      }
      
      // User transactions/finance
      match /transactions/{transactionId} {
        allow read, write: if isOwner(userId);
      }
      
      // User travel/itineraries
      match /itineraries/{itineraryId} {
        allow read, write: if isOwner(userId);
      }
      
      // User organizations
      match /organizations/{orgId} {
        allow read, write: if isOwner(userId);
      }
      
      // User settings
      match /settings/{document=**} {
        allow read, write: if isOwner(userId);
      }
      
      // User preferences
      match /preferences/{document=**} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**IMPORTANTE**: Haz click en "Publicar" después de pegar las reglas.

### 2. Desplegar las Reglas desde la Terminal

Opción alternativa usando Firebase CLI:

```bash
# Si no tienes Firebase CLI instalado
npm install -g firebase-tools

# Login a Firebase
firebase login

# Inicializar proyecto (solo primera vez)
firebase init firestore

# Desplegar reglas
firebase deploy --only firestore:rules
```

### 3. Verificar Usuario Autenticado

En la consola del navegador, verifica:

```javascript
// Abre la consola y ejecuta:
console.log('Auth:', window.__firebase_auth__?.currentUser);
```

Deberías ver tu usuario con un `uid`.

### 4. Test Manual en Firestore Console

1. Ve a [Firestore Data](https://console.firebase.google.com/project/on-tour-app-712e2/firestore/data)
2. Crea manualmente este documento de prueba:
   - Colección: `users`
   - Documento ID: [TU_USER_ID] (copia el uid de la consola)
   - Subcolección: `profile`
   - Documento ID: `settings`
   - Campo: `test` = `"works"`

3. Si puedes crear el documento manualmente, las reglas funcionan.

### 5. Verificar Índices

Si ves errores sobre índices faltantes:

1. Ve a [Firestore Indexes](https://console.firebase.google.com/project/on-tour-app-712e2/firestore/indexes)
2. Agrega cualquier índice que Firebase te sugiera en los errores

### 6. Verificar Cuota de Firestore

1. Ve a [Usage](https://console.firebase.google.com/project/on-tour-app-712e2/usage)
2. Asegúrate de que no hayas excedido las cuotas gratuitas

### 7. Modo de Debugging Temporal

Si nada funciona, prueba temporalmente con reglas más permisivas:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // SOLO PARA DEBUG - ELIMINAR DESPUÉS
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ IMPORTANTE**: Estas reglas son INSEGURAS. Úsalas solo para debugging y luego restaura las reglas originales.

### 8. Revisar Logs de la App

Cuando crees una agencia, deberías ver en la consola:

```
[SettingsContext] Firebase Auth user detected: [TU_UID]
[SettingsContext] Syncing agencies to Firestore for userId: [TU_UID]
[SettingsContext] Booking agencies: [...]
[FirestoreUserService] Saving settings for user: [TU_UID]
[FirestoreUserService] Settings saved successfully
[SettingsContext] ✅ Agencies successfully synced to Firestore
```

Si ves errores, cópialos completos.

## Solución Rápida

Si quieres probar rápido, ejecuta esto en Firebase Console > Firestore Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Y haz click en **Publicar**.
