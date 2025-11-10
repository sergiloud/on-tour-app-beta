# 🚀 Production Deployment Checklist

**Fecha**: 10 de noviembre de 2025  
**Proyecto**: On Tour App 2.0  
**Objetivo**: Deploy a producción con 10 beta users

---

## ✅ Pre-Deploy Verification

### 1. Código y Build
- [x] Build de producción exitoso (`npm run build`)
- [x] Zero errores TypeScript críticos
- [x] PWA service worker generado correctamente
- [x] Bundle size optimizado (heavy: 2MB, charts: 618KB)

### 2. Firebase Services
- [x] Firebase Auth configurado y funcionando
- [x] 6 Firestore services implementados:
  - [x] FirestoreShowService (shows)
  - [x] FirestoreContactService (CRM contacts)
  - [x] FirestoreFinanceService (transactions, budgets)
  - [x] FirestoreTravelService (itineraries)
  - [x] FirestoreOrgService (organizations, teams)
  - [x] FirestoreUserService (profile, preferences, settings)

### 3. Hybrid Services
- [x] HybridShowService (localStorage + Firestore)
- [x] HybridContactService (localStorage + Firestore)
- [x] Demo user detection (`isDemoUser` check)
- [x] AuthContext inicializa todos los servicios

### 4. User Flows
- [x] Register.tsx crea documentos en Firestore
- [x] Login.tsx carga datos desde Firestore
- [x] Onboarding crea organización
- [x] Preferencias se aplican (idioma, tema, moneda)

---

## 🔥 Firebase Console Setup

### Paso 1: Habilitar Firestore Database

1. **Ir a Firebase Console**
   - URL: https://console.firebase.google.com/
   - Proyecto: `on-tour-app-712e2`

2. **Crear Firestore Database**
   - Menú lateral → **Firestore Database**
   - Click **"Create database"**
   - Modo: **Production mode** (seguro)
   - Región: **europe-west1** (Bélgica) - Más cercano a España
   - Click **Enable**
   - ⏳ Esperar 1-2 minutos

### Paso 2: Configurar Security Rules

1. **Click en pestaña "Rules"**

2. **Copiar y pegar estas reglas** (desde `FIRESTORE_SETUP.md` líneas 59-131):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - all user data nested under users/{userId}
    match /users/{userId} {
      // User can only access their own data
      allow read, write: if request.auth != null && 
                            request.auth.uid == userId;
      
      // Profile subcollection (user info, preferences, settings)
      match /profile/{document=**} {
        allow read, write: if request.auth != null && 
                              request.auth.uid == userId;
      }
      
      // Shows subcollection
      match /shows/{showId} {
        allow read, write: if request.auth != null && 
                              request.auth.uid == userId;
      }
      
      // Contacts (CRM) subcollection
      match /contacts/{contactId} {
        allow read, write: if request.auth != null && 
                              request.auth.uid == userId;
      }
      
      // Transactions (Finance) subcollection
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && 
                              request.auth.uid == userId;
      }
      
      // Finance targets/budgets subcollection
      match /finance/{document=**} {
        allow read, write: if request.auth != null && 
                              request.auth.uid == userId;
      }
      
      // Travel/Itineraries subcollection
      match /itineraries/{itineraryId} {
        allow read, write: if request.auth != null && 
                              request.auth.uid == userId;
      }
      
      // Organizations/Tenants subcollection
      match /organizations/{orgId} {
        allow read, write: if request.auth != null && 
                              request.auth.uid == userId;
      }
      
      // Activity tracking subcollection (optional)
      match /activity/{activityId} {
        allow read, write: if request.auth != null && 
                              request.auth.uid == userId;
      }
      
      // Settings subcollection
      match /settings/{document=**} {
        allow read, write: if request.auth != null && 
                              request.auth.uid == userId;
      }
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. **Click "Publish"**

### Paso 3: Verificar Firebase Authentication

1. **Menú lateral → Authentication**
2. **Verificar que Email/Password está habilitado**
3. Si no está habilitado:
   - Click **"Get Started"**
   - Tab **"Sign-in method"**
   - Click **"Email/Password"**
   - Toggle **Enable**
   - Click **Save**

---

## 🌐 Vercel Deployment

### Paso 1: Verificar Environment Variables

1. **Ir a Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Proyecto: `on-tour-app-2-0` (o como lo hayas nombrado)

2. **Settings → Environment Variables**

3. **Verificar que TODAS estas variables existan**:

```bash
# Firebase Config (REQUERIDO)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=on-tour-app-712e2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=on-tour-app-712e2
VITE_FIREBASE_STORAGE_BUCKET=on-tour-app-712e2.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...

# Google Maps (REQUERIDO para mapas)
VITE_GOOGLE_MAPS_API_KEY=AIza...

# Backend API (si aplica)
VITE_API_URL=https://tu-backend.railway.app
```

4. **Si falta alguna variable**:
   - Click **Add New**
   - Name: `VITE_FIREBASE_API_KEY` (ejemplo)
   - Value: `AIza...` (desde Firebase Console)
   - Environment: `Production`, `Preview`, `Development` (marcar todos)
   - Click **Save**

5. **Obtener valores de Firebase Console**:
   - Firebase Console → Project Settings (⚙️ arriba izquierda)
   - Scroll down → "Your apps" → Web app
   - Click **Config** (código snippet)
   - Copiar valores de `firebaseConfig`

### Paso 2: Deploy a Production

**Opción A: Deploy desde Git (Recomendado)**

```bash
# 1. Commit todos los cambios
git add .
git commit -m "chore: production ready with Firebase sync"

# 2. Push a main branch
git push origin main

# 3. Vercel auto-deploya
# Ir a Vercel Dashboard → Deployments → Ver progreso
```

**Opción B: Deploy manual desde CLI**

```bash
# 1. Install Vercel CLI (si no lo tienes)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Confirmar settings
# ✓ Set up and deploy "~/Documents/On Tour App 2.0"? [Y/n] y
# ✓ Which scope? Your account
# ✓ Link to existing project? [Y/n] y
# ✓ What's the name of your existing project? on-tour-app-2-0
```

### Paso 3: Verificar Deployment

1. **Wait for build to complete** (~2-3 minutos)

2. **Abrir URL de producción**
   - URL: `https://on-tour-app-2-0.vercel.app` (o tu dominio custom)

3. **Verificar en la URL**:
   - [ ] App carga correctamente
   - [ ] No hay errores en browser console
   - [ ] Estilos se aplican correctamente (no texto sin CSS)
   - [ ] Service Worker se instala (check Network tab)

---

## 🧪 Post-Deploy Testing

### Test 1: Registro de Usuario

```bash
1. Abrir app en navegador incógnito
2. Ir a /register
3. Crear cuenta: beta-test@example.com / BetaTest123!
4. Completar registro

✅ Verificar:
- Usuario se crea correctamente
- Redirecciona a /onboarding
- No hay errores en console
```

**Verificar en Firebase Console**:
```
Firebase Console → Authentication → Users
- Debe aparecer: beta-test@example.com con UID

Firebase Console → Firestore Database → Data → users/{uid}
- Debe existir: profile/main (doc)
- Debe existir: profile/preferences (doc)
```

### Test 2: Login

```bash
1. Cerrar sesión (o usar nueva ventana incógnito)
2. Ir a /login
3. Login con beta-test@example.com / BetaTest123!

✅ Verificar:
- Login exitoso
- Redirecciona a /dashboard
- Idioma aplicado (español por defecto)
- Tema aplicado (dark por defecto)
- No hay errores en console
```

### Test 3: Crear Show

```bash
1. Login como beta-test@example.com
2. Ir a Shows
3. Click "Nuevo Show"
4. Llenar formulario:
   - Band: "Test Artist"
   - Venue: "Test Venue"
   - Date: fecha futura
   - Fee: 5000 EUR
5. Guardar

✅ Verificar:
- Show aparece en lista
- Show aparece en mapa (si tiene ubicación)
```

**Verificar en Firebase Console**:
```
Firestore Database → users/{uid}/shows/{showId}
- Debe existir documento con datos del show
```

### Test 4: Cross-Device Sync

```bash
1. Dispositivo 1: Login como beta-test@example.com
2. Dispositivo 2: Login con mismo usuario (móvil o otra computadora)

3. Dispositivo 1: Crear nuevo show "Cross Device Test"

✅ Verificar en Dispositivo 2:
- Show aparece automáticamente (real-time sync)
- No requiere refresh manual
```

### Test 5: Crear Contacto CRM

```bash
1. Ir a Contacts (menú lateral)
2. Click "Nuevo Contacto"
3. Llenar:
   - Name: "Jane Promoter"
   - Type: Promoter
   - Email: jane@promoter.com
4. Guardar

✅ Verificar:
- Contacto aparece en lista
- Contacto aparece en Firestore: users/{uid}/contacts/{contactId}
```

### Test 6: Finanzas

```bash
1. Ir a Finance
2. Crear transacción:
   - Type: Expense
   - Amount: 500 EUR
   - Category: Travel
   - Description: "Test expense"
3. Guardar

✅ Verificar:
- Transacción aparece en lista
- KPIs se actualizan
- Gráficos muestran datos
- Aparece en Firestore: users/{uid}/transactions/{transactionId}
```

### Test 7: Demo User Isolation

```bash
1. Logout
2. Login como demo user (danny@demo.com / demo123)
3. Crear shows, contactos, etc.

✅ Verificar:
- App funciona normalmente
- Datos se guardan en localStorage
- NO aparecen en Firestore Console
- isDemoUser = true
```

**Verificar en Firestore Console**:
```
Firestore Database → NO debe haber users/demo_* documentos
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Firestore not initialized"

**Síntoma**: Error en console al crear shows/contactos

**Causa**: Variables de entorno no configuradas

**Solución**:
1. Vercel Dashboard → Settings → Environment Variables
2. Verificar TODAS las variables VITE_FIREBASE_*
3. Re-deploy: Deployments → Latest → "..." → Redeploy

### Issue 2: "Missing permissions" en Firestore

**Síntoma**: Error 403 al intentar leer/escribir

**Causa**: Security rules incorrectas

**Solución**:
1. Firebase Console → Firestore Database → Rules
2. Copiar reglas exactas de FIRESTORE_SETUP.md
3. Click "Publish"
4. Esperar 30 segundos
5. Refrescar app

### Issue 3: Usuario no aparece en Firestore

**Síntoma**: Usuario registrado pero no hay docs en Firestore

**Causa**: Usuario creado antes de implementar saveProfile

**Solución**:
```javascript
// Ejecutar en browser console
const userId = localStorage.getItem('demo:lastUser');
import('../services/firestoreUserService').then(async (m) => {
  await m.FirestoreUserService.migrateFromLocalStorage(userId);
  console.log('Profile migrated!');
});
```

### Issue 4: CSS no carga (texto sin estilos)

**Síntoma**: App muestra HTML sin CSS

**Causa**: Vercel sirve .css como text/html

**Solución**:
1. Verificar `vercel.json` tiene:
```json
{
  "headers": [
    {
      "source": "/(.*).css",
      "headers": [
        { "key": "Content-Type", "value": "text/css" }
      ]
    }
  ]
}
```
2. Re-deploy

### Issue 5: Service Worker no se instala

**Síntoma**: Sin funcionalidad offline

**Causa**: PWA no configurado en Vercel

**Solución**:
1. Verificar build generó `dist/sw-advanced.js`
2. Verificar `vite.config.ts` tiene plugin PWA
3. Re-build y re-deploy

---

## 📊 Monitoring & Analytics

### Firebase Console Monitoring

**Authentication**:
- Ver usuarios activos: Authentication → Users
- Ver sign-in methods: Authentication → Sign-in method

**Firestore**:
- Ver datos: Firestore Database → Data
- Ver queries: Firestore Database → Usage
- Ver costos estimados: Firestore Database → Usage → Billing

**Métricas esperadas (10 beta users)**:
```
Reads/día: 100-500 (dentro de free tier: 50k/día)
Writes/día: 20-100 (dentro de free tier: 20k/día)
Storage: 10-50 MB (dentro de free tier: 1 GB)
Costo estimado: $0/mes
```

### Vercel Analytics

1. **Vercel Dashboard → Analytics**
2. Métricas importantes:
   - Page views
   - Unique visitors
   - Top pages
   - Load times (aim for <2s)
   - Build times

### Error Tracking

**Browser Console Logs**:
```javascript
// En producción, verificar estos logs:
✅ "Hybrid show service initialized"
✅ "Hybrid contact service initialized"
✅ "User profile loaded from Firestore"
⚠️ "Could not initialize X service" - investigar
❌ "Failed to sync from cloud" - revisar Firebase rules
```

**Sentry (opcional)**:
- Install: `npm install @sentry/react`
- Setup en `main.tsx`
- Ver errores en Sentry Dashboard

---

## 📝 Beta User Instructions

**Email template para enviar a beta users**:

```
Subject: 🎸 On Tour App Beta - Acceso Exclusivo

Hola [Nombre],

¡Bienvenido al programa beta de On Tour App!

🔗 URL: https://on-tour-app-2-0.vercel.app

📋 Instrucciones:
1. Crear cuenta con tu email
2. Completar onboarding (tipo de negocio, etc.)
3. Explorar la app y crear shows, contactos, finanzas

🐛 Reportar bugs:
- Email: sergi@ontour.app
- WhatsApp: +34 XXX XXX XXX

🎯 Qué testear:
- Crear shows y ver en mapa
- Gestionar contactos CRM
- Tracking de finanzas
- Itinerarios de travel
- Sincronización entre dispositivos

⚠️ Importante:
- Todos tus datos están seguros y encriptados
- La app funciona offline (PWA)
- Tus datos se sincronizan en todos tus dispositivos

¡Gracias por tu ayuda!

Equipo On Tour App
```

---

## ✅ Final Checklist

### Before Launch
- [ ] Build de producción exitoso
- [ ] Firestore database creado y reglas configuradas
- [ ] Environment variables configuradas en Vercel
- [ ] Deploy a producción completado
- [ ] Test de registro exitoso
- [ ] Test de login exitoso
- [ ] Test de creación de show exitoso
- [ ] Verificado en Firebase Console (Auth + Firestore)

### After Launch
- [ ] 5 beta users invitados
- [ ] Monitoring configurado (Firebase + Vercel Analytics)
- [ ] Sistema de bug reporting configurado
- [ ] Backups automáticos de Firestore configurados
- [ ] Email de onboarding enviado a beta users

### Week 1 Post-Launch
- [ ] Check diario de Firebase Console (usuarios, datos)
- [ ] Review de errores en Sentry/Console
- [ ] Recopilación de feedback de beta users
- [ ] Fix de bugs críticos (si hay)
- [ ] Optimizaciones de performance

---

## 🚨 Emergency Rollback

Si algo sale mal en producción:

```bash
# Opción 1: Rollback en Vercel Dashboard
1. Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → Promote to Production

# Opción 2: Rollback via Git
git revert HEAD
git push origin main

# Opción 3: Rollback via CLI
vercel rollback [deployment-url]
```

---

## 📞 Support Contacts

**Firebase Issues**:
- Firebase Console: https://console.firebase.google.com/
- Firebase Support: https://firebase.google.com/support

**Vercel Issues**:
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

**Developer**:
- Email: sergi@ontour.app
- GitHub: sergiloud/On-Tour-App-2.0

---

**Última actualización**: 10 de noviembre de 2025  
**Versión**: 1.0.0  
**Estado**: ✅ READY FOR PRODUCTION  
**Autor**: AI Assistant + Sergio Recio
