# Prophecy Data Architecture - Migration Plan

## Situación Actual ❌

Actualmente, los datos de Prophecy se manejan de forma híbrida:

### Frontend (localStorage)
- ✅ **Datos de Prophecy**: Se cargan en `localStorage` cuando el usuario hace login
- ✅ **Persistencia local**: Los datos se mantienen entre sesiones del navegador
- ❌ **Problema**: Los datos solo existen en el navegador local
- ❌ **Problema**: No hay sincronización entre dispositivos
- ❌ **Problema**: Se pierden si se limpia el cache del navegador

### Backend (API REST)
- ✅ **API completa**: Endpoints para CRUD de shows por organización
- ✅ **Estructura correcta**: Modelos de datos apropiados
- ❌ **Problema**: No se están usando desde el frontend de Prophecy
- ❌ **Problema**: Los datos de Prophecy no están en la base de datos

## Arquitectura Correcta ✅

### 1. **Backend como Fuente de Verdad**
```
Backend (PostgreSQL/Memory)
└── Organizations
    ├── org_artist_prophecy
    │   └── Shows (todos los shows de Prophecy)
    ├── org_artist_danny
    │   └── Shows (shows de Danny Avila)
    └── org_agency_shalizi
        └── Shows (shows de la agencia)
```

### 2. **Frontend Conectado al Backend**
```
Usuario Login Prophecy
├── 1. Autenticación → Backend JWT
├── 2. Seed datos (una vez) → Backend /api/organizations/org_artist_prophecy/seed-prophecy
├── 3. Fetch shows → Backend /api/shows?organizationId=org_artist_prophecy
└── 4. CRUD operations → Backend APIs
```

### 3. **Flujo de Datos Correcto**
```
[Login Prophecy] → [Check Backend] → [Seed if needed] → [Fetch Shows] → [Display in UI]
       ↓
[User adds show] → [POST /api/shows] → [Update Backend] → [Refresh UI]
```

## Implementación Realizada ⚡

### Backend
- ✅ **Scripts de seeding**: `backend/src/scripts/seedProphecyData.ts`
- ✅ **APIs de seeding**: `POST /api/organizations/:id/seed-prophecy`  
- ✅ **API de status**: `GET /api/organizations/:id/prophecy-status`
- ✅ **APIs de shows**: Full CRUD disponible en `/api/shows`

### Frontend  
- ✅ **Servicio de backend**: `src/services/prophecyBackendService.ts`
- ✅ **Integración en login**: Auto-seed cuando usuario Prophecy hace login
- ✅ **Fallback**: Mantiene datos locales como respaldo

## Próximos Pasos 📋

### Fase 1: Backend Ready ✅ COMPLETADO
- [x] Crear scripts de seeding para datos de Prophecy
- [x] Crear APIs para inicializar datos de Prophecy
- [x] Integrar APIs en rutas del backend

### Fase 2: Frontend Integration (EN PROGRESO)
- [x] Crear servicio para conectar con backend
- [x] Modificar login para usar backend
- [ ] **PENDIENTE**: Modificar showStore para usar backend APIs
- [ ] **PENDIENTE**: Implementar autenticación real (JWT)
- [ ] **PENDIENTE**: Probar flujo completo

### Fase 3: Testing & Migration
- [ ] **PENDIENTE**: Iniciar backend sin errores
- [ ] **PENDIENTE**: Probar seeding de datos de Prophecy
- [ ] **PENDIENTE**: Verificar que shows aparecen correctamente
- [ ] **PENDIENTE**: Migrar completamente de localStorage a backend

## Estado Actual 🎯

**✅ FUNCIONAL**: El usuario puede hacer login con `booking@prophecyofficial.com` / `Casillas123` y ve los datos de Prophecy (desde localStorage como fallback).

**🔄 EN DESARROLLO**: La conexión completa con el backend está implementada pero necesita testing y debugging del backend.

**🎯 OBJETIVO**: Tener una arquitectura completamente basada en backend donde todos los shows se persistan en base de datos y se sincronicen entre dispositivos.