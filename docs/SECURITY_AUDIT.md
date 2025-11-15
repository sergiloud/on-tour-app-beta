# 🔒 Security Audit & Pending Actions

**Fecha:** 15 de noviembre de 2025  
**Proyecto:** On Tour App 2.0  
**Versión:** 1.0.0  
**Status:** ⚠️ Action Required - Environment Variables Migration Pending

---

## 🟢 ESTADO ACTUAL: FUNCIONALMENTE SEGURO

### ✅ Verificaciones Completadas

**1. Firebase Admin Key (`firebase-admin-key.json`)**
- ✅ Archivo **NO está en Git tracking**
- ✅ Incluido en `.gitignore` (línea 47)
- ✅ Historial de Git limpio (nunca fue commiteado)
- ✅ No está en repositorio beta
- ⚠️  **Acción requerida:** Mover a variables de entorno

**2. Firestore Security Rules**
- ✅ Reglas implementadas correctamente
- ✅ Autenticación requerida para todas las operaciones
- ✅ Validación de ownership (isOwner function)
- ✅ Subcollections protegidas por userId

**3. Git Repositories**
- ✅ `.gitignore` configurado correctamente
- ✅ No hay secretos en commits recientes
- ✅ Remote beta: `https://github.com/sergiloud/on-tour-app-beta.git`

---

## 🔴 ACCIONES CRÍTICAS PENDIENTES

### 1. Migrar Firebase Admin Key a Variables de Entorno

**Estado actual:**
```bash
firebase-admin-key.json  # ⚠️  En disco local
```

**Acción requerida:**

**Paso 1: Backend - Usar variables de entorno**
```typescript
// backend/src/config/firebase.ts
import { initializeApp, cert } from 'firebase-admin/app';

// ❌ NUNCA hacer esto:
// const serviceAccount = require('../../firebase-admin-key.json');

// ✅ CORRECTO - Usar variables de entorno:
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

initializeApp({
  credential: cert(serviceAccount),
});
```

**Paso 2: Configurar variables de entorno**
```bash
# .env (NUNCA commitear este archivo)
FIREBASE_PROJECT_ID=on-tour-app-712e2
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@on-tour-app-712e2.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Paso 3: Deployment (Vercel/Netlify/Railway)**
```bash
# Añadir variables de entorno en el dashboard:
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

**Paso 4: Eliminar archivo local (DESPUÉS de migrar)**
```bash
rm firebase-admin-key.json
```

---

## 🟡 MEJORAS RECOMENDADAS

### 1. Environment Variables Validation

**Crear: `backend/src/config/env.ts`**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  VITE_OPENWEATHER_API_KEY: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
```

### 2. API Key Rotation Policy

**Frecuencia:** Cada 90 días

**Proceso:**
1. Generar nueva service account key en Firebase Console
2. Actualizar variables de entorno en todos los environments
3. Verificar deployment exitoso
4. Revocar key anterior después de 24h
5. Documentar en CHANGELOG.md

### 3. Secrets Management

**Opciones recomendadas:**
- **Desarrollo:** `.env.local` (gitignored)
- **Staging/Beta:** Vercel Environment Variables
- **Producción:** Railway/Render Secrets Vault
- **CI/CD:** GitHub Secrets

---

## 📋 Checklist de Seguridad

### Antes de cada Deploy

- [ ] Verificar `.gitignore` actualizado
- [ ] `git status` no muestra archivos sensibles
- [ ] Variables de entorno configuradas en hosting
- [ ] API keys rotadas en los últimos 90 días
- [ ] Firestore rules actualizadas y desplegadas

### Auditoría Mensual

- [ ] Revisar logs de autenticación Firebase
- [ ] Verificar permisos de service accounts
- [ ] Analizar tráfico de Firestore para patrones sospechosos
- [ ] Actualizar dependencias con `npm audit fix`
- [ ] Revisar FIREBASE_AUDIT_REPORT.md

---

## 🔗 Referencias

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/best-practices)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)
- [Git Secrets Prevention](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

---

## 📝 Historial de Cambios

**12 Nov 2025**
- ✅ Audit inicial completado
- ✅ Verificado que firebase-admin-key.json NO está en Git
- ✅ Confirmado .gitignore correcto
- ⏳ Pendiente: Migración a variables de entorno

