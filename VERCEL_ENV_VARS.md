# Variables de Entorno para Vercel - On Tour App

## ✅ Variables Requeridas (Firebase Authentication)

Estas son **obligatorias** para que funcione la autenticación con Firebase:

```bash
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=on-tour-app-712e2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=on-tour-app-712e2
VITE_FIREBASE_STORAGE_BUCKET=on-tour-app-712e2.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Cómo obtenerlas:

1. Firebase Console → Project Settings → General
2. Scroll down → Your apps → Web app
3. Copiar valores de `firebaseConfig`

---

## 🔧 Variables Opcionales

### RapidAPI Skyscanner (búsqueda de vuelos con precios reales)

```bash
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
```

- **Sin esta key**: La app funcionará con datos de ejemplo
- **Con esta key**: Búsquedas reales de vuelos con precios actuales
- Conseguir key: https://rapidapi.com/skyscanner/api/skyscanner-flight-search
- Free tier: 500 llamadas/mes
- **Estado**: Alternativa. Límite bajo.

### Amadeus Flight API (Opción recomendada para empezar)

```bash
VITE_AMADEUS_API_KEY=your_api_key_here
VITE_AMADEUS_API_SECRET=your_api_secret_here
```

- **Sin estas keys**: Fallback a precios estimados
- Conseguir: https://developers.amadeus.com/register
- Free tier: 2,000 llamadas/mes

---

## 📋 Checklist para Deploy

### Vercel Dashboard

- [ ] Project Settings → Environment Variables
- [ ] Agregar las 7 variables de Firebase (requeridas)
- [ ] Agregar VITE_RAPIDAPI_KEY (opcional pero recomendado)
- [ ] Apply to: Production, Preview, Development

### Firebase Console

- [ ] Authentication → Sign-in method → Email/Password (habilitado)
- [ ] Authentication → Sign-in method → Google (habilitado)
- [ ] Authentication → Settings → Authorized domains
  - `on-tour-app-2-0.vercel.app` ✓
  - `on-tour.app` ✓
  - `localhost` ✓

---

## 🚀 Estado Actual

**Firebase**: ✅ Configurado (proyecto: on-tour-app-712e2)
**Vercel**: ✅ Variables agregadas al dashboard
**Deploy**: ✅ Listo para producción

## 👥 Beta Testing (5 usuarios)

La app está configurada para:

- Autenticación con email/password
- Autenticación con Google Sign-In
- Datos demo disponibles para pruebas
- Sin límite de usuarios (Firebase free tier soporta ~50k/día)
