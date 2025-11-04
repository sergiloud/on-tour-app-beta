# 🚀 FASE 6 - Semana 1: Backend Foundation

**Objetivo**: Crear la base sólida del backend con autenticación y estructura inicial  
**Duración**: 3-5 días (esta semana)  
**Estado**: 🟢 INICIANDO

---

## 📋 Tareas Principales

### ✅ COMPLETADO (Hoy)

- [x] Crear estructura del directorio backend
- [x] Setup package.json con dependencias
- [x] Configurar TypeScript (tsconfig.json)
- [x] Crear Express app basic
- [x] Setup database schema (migrations)
- [x] Crear rutas placeholder
- [x] Escribir README backend

**Commits necesarios:**
```bash
git add backend/
git commit -m "feat: Setup backend FASE 6 foundation - Express + TypeScript + DB schema"
```

---

### 📝 TODO - Semana 1

#### Día 1-2: Instalación & Database

```bash
# 1. Instalar dependencias
cd backend
npm install

# 2. Setup PostgreSQL
createdb on_tour_db

# 3. Verificar conexión
# (Será parte del próximo paso)
```

**Archivos a crear:**
- `src/db/client.ts` - Kysely database client
- `src/db/types.ts` - TypeScript tipos para DB
- `src/db/migrations/runner.ts` - Migration runner

**Tareas:**
- [ ] Configurar conexión a PostgreSQL
- [ ] Crear migration runner
- [ ] Ejecutar primera migración
- [ ] Escribir test para DB connection

#### Día 2-3: Authentication (OAuth2)

**Archivos a crear:**
- `src/middleware/auth.ts` - Passport OAuth2 setup
- `src/services/authService.ts` - Auth business logic
- `src/types/auth.ts` - Auth types
- `src/utils/jwt.ts` - JWT helpers
- `src/routes/auth.ts` - Auth endpoints (reemplazar placeholder)

**Tareas:**
- [ ] Setup Passport.js con Google OAuth2
- [ ] Crear Google OAuth callback handler
- [ ] Generar JWT tokens en login
- [ ] Implementar JWT middleware
- [ ] Crear `/api/auth/profile` endpoint
- [ ] Escribir auth tests

#### Día 3-4: Shows API (Básico)

**Archivos a crear:**
- `src/services/showsService.ts`
- `src/types/shows.ts`
- `src/routes/shows.ts` (implementar endpoints)

**Tareas:**
- [ ] Implementar `GET /api/shows` (list)
- [ ] Implementar `POST /api/shows` (create)
- [ ] Implementar `GET /api/shows/:id` (get)
- [ ] Implementar `PUT /api/shows/:id` (update)
- [ ] Implementar `DELETE /api/shows/:id` (delete)
- [ ] Escribir CRUD tests

#### Día 4-5: Testing & Documentation

**Archivos a crear:**
- `jest.config.ts`
- `jest.e2e.config.ts`
- `__tests__/setup.ts`
- `docs/BACKEND_SETUP.md`

**Tareas:**
- [ ] Setup Jest + Supertest
- [ ] Escribir unit tests para services
- [ ] Escribir integration tests para rutas
- [ ] Conseguir 60%+ coverage
- [ ] Documentar API endpoints (OpenAPI)
- [ ] Crear guía para next dev

---

## 🏗️ Arquitectura Implementada

### Capas

```
Requests
   ↓
Middleware (auth, validation, logging)
   ↓
Routes (HTTP handlers)
   ↓
Services (business logic)
   ↓
Database (Kysely)
   ↓
PostgreSQL
```

### Error Handling

```typescript
// Todos los endpoints usan asyncHandler
router.post('/', asyncHandler(async (req, res) => {
  const result = await service.create(data);
  res.json(result);
  // Errores van automáticamente a errorHandler
}));
```

### Autenticación

```
User Login
   ↓
OAuth2 (Google)
   ↓
Create/Update User in DB
   ↓
Generate JWT
   ↓
Return JWT to frontend
   ↓
Frontend stores JWT
   ↓
Include JWT in all requests
   ↓
Auth middleware validates
```

---

## 📊 Integration con Frontend

### Cambios Necesarios en Frontend

1. **Cambiar de mock API a real backend**

```typescript
// Antes (mock)
const shows = mockShowsData;

// Después (real API)
const { data: shows } = useQuery({
  queryKey: ['shows'],
  queryFn: () => fetch('/api/shows').then(r => r.json())
});
```

2. **Setup de autenticación**

```typescript
// frontend/.env
VITE_API_URL=http://localhost:3001
```

3. **Interceptor de JWT**

```typescript
// Agregar JWT a todos los requests
const client = createApiClient({
  getToken: () => localStorage.getItem('jwt_token')
});
```

---

## 🔄 Próximos Pasos Después de Semana 1

### Semana 2: Finance & Real-time

- Finance records CRUD
- Settlement calculations
- WebSocket setup para multi-user sync

### Semana 3: Deployment

- Docker setup
- CI/CD pipeline
- Database backups
- Monitoring

---

## 📝 Checklist de Implementación

### Antes de Empezar

- [ ] Node.js 20 LTS instalado
- [ ] PostgreSQL 15 corriendo localmente
- [ ] `.env` configurado correctamente
- [ ] `npm install` completado

### Hitos Semanales

- [ ] **Día 2**: Database migrations funcionando
- [ ] **Día 3**: OAuth2 login working
- [ ] **Día 4**: Shows CRUD completo
- [ ] **Día 5**: 60%+ test coverage, documentación lista

### Pre-Deployment

- [ ] [ ] TypeScript: 0 errores
- [ ] [ ] Tests: 80%+ passing
- [ ] [ ] Frontend integration: probada
- [ ] [ ] Database backups: configurado

---

## 🚀 Comandos Rápidos

```bash
# Desarrollo
npm run dev          # Start server + watch
npm test             # Tests + watch
npm run type-check   # TypeScript validation

# Build
npm run build        # Compile TypeScript
npm start            # Run production build

# Database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed demo data

# Code Quality
npm run lint         # Run ESLint
npm run format       # Auto-format code
```

---

## 💡 Notas

- **Database**: Cada migración es reversible con `down()` function
- **Errors**: Usa `AppError` class para errores controlados
- **Logging**: Usa `logger` instance, nunca console.log
- **Types**: Todo debe estar tipado (TypeScript strict mode)
- **Tests**: Test behaviors, no implementations

---

**Estado**: Listo para comenzar instalación de dependencias  
**Próximo paso**: `npm install` en directorio backend

