# Firebase Setup Guide

## 🔥 Configuración de Firebase para Autenticación

### Paso 1: Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Add project" / "Añadir proyecto"
3. Nombre del proyecto: `on-tour-app` (o el que prefieras)
4. Desactiva Google Analytics si no lo necesitas (opcional)
5. Click "Create project"

### Paso 2: Configurar Authentication

1. En el menú lateral, click en **"Authentication"**
2. Click en **"Get started"**
3. Habilita los métodos de autenticación:
   - ✅ **Email/Password** - Para registro con email
   - ✅ **Google** - Para "Sign in with Google"
   - ✅ **Apple** (opcional) - Para "Sign in with Apple"

#### Configurar Google Sign-In:

1. Click en "Google" en la lista de providers
2. Activa el toggle
3. Añade tu email de soporte
4. Guarda

#### Configurar Apple Sign-In (opcional):

1. Necesitas una Apple Developer Account ($99/año)
2. Configurar Service ID en Apple Developer
3. Añadir credenciales en Firebase

### Paso 3: Obtener credenciales de Firebase

1. Click en el icono de **engranaje** (⚙️) arriba a la izquierda
2. Selecciona **"Project settings"**
3. Scroll down hasta **"Your apps"**
4. Click en el icono **`</>`** (Web)
5. Registra la app:
   - App nickname: `on-tour-web`
   - ✅ Marca "Also set up Firebase Hosting" si quieres
6. Click **"Register app"**
7. **Copia el objeto `firebaseConfig`**

Debería verse así:

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  authDomain: 'on-tour-app-xxxxx.firebaseapp.com',
  projectId: 'on-tour-app-xxxxx',
  storageBucket: 'on-tour-app-xxxxx.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdef1234567890',
  measurementId: 'G-XXXXXXXXXX',
};
```

### Paso 4: Configurar variables de entorno

1. Copia el archivo de ejemplo:

   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y añade tus credenciales de Firebase:

   ```bash
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=on-tour-app-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=on-tour-app-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=on-tour-app-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **IMPORTANTE**: El archivo `.env` ya está en `.gitignore`, nunca lo subas a Git

### Paso 5: Configurar Vercel (Production)

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Settings"** → **"Environment Variables"**
3. Añade cada variable de Firebase:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
4. Marca **"Production"**, **"Preview"** y **"Development"**
5. Guarda y redeploy

### Paso 6: Configurar dominios autorizados

1. En Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Añade tus dominios:
   - `localhost` (ya está)
   - `on-tour-app.vercel.app` (tu dominio de Vercel)
   - `on-tour.app` (tu dominio custom)

### Paso 7: Probar la autenticación

```bash
# En local
npm run dev
```

1. Ve a la página de login
2. Intenta registrarte con email/password
3. Deberías ver el usuario creado en Firebase Console → Authentication → Users

## 🎯 Flujo de Autenticación

### Desarrollo (sin Firebase configurado):

- Usa el sistema demo/local con localStorage
- Los usuarios son temporales

### Producción (con Firebase configurado):

- Usa Firebase Authentication
- Los usuarios persisten en la nube
- Soporte para Google Sign-In, Apple Sign-In, etc.

## 🔐 Seguridad

### Reglas de Firestore (próximo paso)

Cuando configures Firestore, usa estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - solo el dueño puede leer/escribir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Shows collection - solo usuarios autenticados de la misma org
    match /shows/{showId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     request.resource.data.userId == request.auth.uid;
    }

    // Organizations collection
    match /organizations/{orgId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     get(/databases/$(database)/documents/organizations/$(orgId)).data.members[request.auth.uid] == true;
    }
  }
}
```

## 📱 Próximos pasos

1. ✅ Firebase Authentication configurado
2. ⏳ Firestore Database (para guardar shows, expenses, etc.)
3. ⏳ Firebase Storage (para subir archivos/imágenes)
4. ⏳ Cloud Functions (para lógica de backend)

## 🆘 Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"

- Verifica que `VITE_FIREBASE_API_KEY` esté correctamente configurado
- Asegúrate que no tenga espacios o comillas extras

### Error: "Firebase: Error (auth/unauthorized-domain)"

- Añade tu dominio a Authorized domains en Firebase Console

### No funciona en producción (Vercel)

- Verifica que las variables de entorno estén en Vercel
- Haz redeploy después de añadir las variables

### Google Sign-In no funciona

- Verifica que esté habilitado en Firebase Console
- Añade el dominio a Authorized domains
- Configura OAuth consent screen en Google Cloud Console
