# 🚀 FASE 6 PLANNING - BACKEND IMPLEMENTATION

**Documento Estratégico:** Plan detallado para FASE 6  
**Fecha:** 3 Noviembre 2025  
**Estado:** READY FOR KICKOFF  
**Timeline Estimado:** 3-4 semanas

---

## 📌 INTRODUCCIÓN

FASE 6 marca el **inicio de la arquitectura backend real**. Hasta ahora, todo ha sido frontend con `localStorage`. Ahora introducimos:

- API REST backend
- Base de datos persistente
- Autenticación real (OAuth2/JWT)
- Multi-usuario y colaboración
- Real-time sync con backend

**Objetivo:** Migrar de localStorage → Backend mientras mantenemos offline support.

---

## 🎯 FASE 6 HIGH LEVEL (4 Semanas)

```
Week 1: Foundation
├─ DB Schema design
├─ API endpoints definition
├─ Migration strategy
└─ Auth setup

Week 2: API Implementation (Part 1)
├─ Shows CRUD endpoints
├─ Finance endpoints
├─ Error handling
└─ Basic auth

Week 3: API Implementation (Part 2)
├─ Travel endpoints
├─ Calendar endpoints
├─ Real-time features
└─ Multi-user support

Week 4: Integration & Testing
├─ Frontend integration
├─ End-to-end testing
├─ Performance validation
└─ Staging deployment
```

---

## 🗄️ PARTE 1: BASE DE DATOS

### 1.1 Seleccionar Stack

**Options:**

| Stack                | Pros                                                   | Cons                          | Recommendation  |
| -------------------- | ------------------------------------------------------ | ----------------------------- | --------------- |
| PostgreSQL + Node.js | Mature, type-safe (TypeScript), excellent ORM (Prisma) | Need managed hosting          | ✅ BEST         |
| Firebase/Firestore   | Serverless, real-time built-in                         | Vendor lock-in, costs scale   | Option B        |
| Supabase             | PostgreSQL hosted, real-time                           | Still relatively new          | Good Option     |
| MongoDB              | Flexible schema, scalable                              | Less ideal for financial data | Not recommended |

**Decision:** **PostgreSQL + Node.js + Prisma ORM** (most control, scalability, type safety)

### 1.2 Database Schema

#### Shows Table

```sql
CREATE TABLE shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),

  -- Core data
  city VARCHAR(100),
  country VARCHAR(2),
  date_event TIMESTAMP NOT NULL,
  fee DECIMAL(12, 2) NOT NULL,
  fee_currency VARCHAR(3) DEFAULT 'EUR',

  -- Finance
  mgmt_agency VARCHAR(255),
  mgmt_agency_pct DECIMAL(5, 2),
  booking_agency VARCHAR(255),
  booking_agency_pct DECIMAL(5, 2),
  wht_pct DECIMAL(5, 2),

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending, confirmed, completed, canceled

  -- Timestamps & Versioning
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INT DEFAULT 1,

  -- Soft delete
  deleted_at TIMESTAMP,

  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_date_event (date_event),
  INDEX idx_status (status)
);
```

#### Costs Table

```sql
CREATE TABLE show_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,

  cost_type VARCHAR(50), -- 'sound', 'light', 'transport', etc
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'EUR',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_show_id (show_id)
);
```

#### Multi-Tab Sync Tracking

```sql
CREATE TABLE sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  event_type VARCHAR(50), -- 'create', 'update', 'delete'
  resource_type VARCHAR(50), -- 'show', 'cost', 'travel', etc
  resource_id UUID,

  data_before JSONB,
  data_after JSONB,

  source VARCHAR(50), -- 'ui', 'api', 'worker', 'offline'
  device_id VARCHAR(100),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

#### Offline Queue

```sql
CREATE TABLE offline_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  operation_type VARCHAR(50), -- 'create', 'update', 'delete'
  resource_type VARCHAR(50),
  resource_id UUID,

  payload JSONB,
  status VARCHAR(20) DEFAULT 'pending', -- pending, synced, failed

  attempt_count INT DEFAULT 0,
  last_error TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP,

  INDEX idx_user_id_status (user_id, status)
);
```

#### Audit Log

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id UUID,

  changes JSONB, -- { field: { before: x, after: y } }
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_resource (resource_type, resource_id)
);
```

#### Users & Auth

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255), -- bcrypt

  -- OAuth
  oauth_provider VARCHAR(50), -- 'google', 'github', etc
  oauth_id VARCHAR(255),

  -- Profile
  full_name VARCHAR(255),
  avatar_url TEXT,

  -- Preferences
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  finance_rules JSONB, -- Configuration per user

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  email_verified_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  UNIQUE(oauth_provider, oauth_id)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  token VARCHAR(500), -- JWT token
  refresh_token VARCHAR(500),

  device_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,

  expires_at TIMESTAMP NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_token (token)
);
```

### 1.3 Prisma Schema

Create `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    String  @id @default(cuid())
  email String  @unique
  passwordHash String?
  fullName String?

  // Relations
  shows         Show[]
  costs         ShowCost[]
  syncEvents    SyncEvent[]
  offlineQueue  OfflineQueue[]
  auditLogs     AuditLog[]
  sessions      Session[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Show {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])

  city      String?
  country   String?
  dateEvent DateTime
  fee       Decimal  @db.Decimal(12, 2)
  feeCurrency String @default("EUR")

  status    String  @default("draft") // draft, pending, confirmed, completed
  version   Int     @default(1)

  // Relations
  costs     ShowCost[]
  syncEvents SyncEvent[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([userId])
  @@index([status])
  @@map("shows")
}

model ShowCost {
  id        String  @id @default(cuid())
  showId    String
  show      Show    @relation(fields: [showId], references: [id], onDelete: Cascade)
  userId    String
  user      User    @relation(fields: [userId], references: [id])

  costType  String
  amount    Decimal  @db.Decimal(10, 2)
  currency  String  @default("EUR")

  createdAt DateTime @default(now())

  @@index([showId])
  @@map("show_costs")
}

model SyncEvent {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])

  eventType String // create, update, delete
  resourceType String
  resourceId String?

  dataBefore Json?
  dataAfter  Json?

  source    String // ui, api, worker
  deviceId  String?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
  @@map("sync_events")
}

model OfflineQueue {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])

  operationType String
  resourceType String
  resourceId String?

  payload   Json
  status    String  @default("pending") // pending, synced, failed

  attemptCount Int     @default(0)
  lastError    String?

  createdAt DateTime @default(now())
  syncedAt  DateTime?

  @@index([userId, status])
  @@map("offline_queue")
}

model AuditLog {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])

  action    String
  resourceType String
  resourceId String?

  changes   Json
  ipAddress String?
  userAgent String?

  createdAt DateTime @default(now())

  @@index([userId])
  @@map("audit_logs")
}

model Session {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  token     String  @unique
  refreshToken String?

  deviceId  String?
  ipAddress String?
  userAgent String?

  expiresAt DateTime

  createdAt DateTime @default(now())

  @@index([userId])
  @@map("sessions")
}
```

### 1.4 Setup Checklist

- [ ] PostgreSQL database created
- [ ] Prisma schema defined (schema.prisma)
- [ ] Prisma migrations created: `npx prisma migrate dev --name init`
- [ ] Seed data created (optional): `prisma/seed.ts`
- [ ] Database connection verified
- [ ] Environment variables set: `DATABASE_URL`
- **Criterio de Aceptación:** `npx prisma studio` muestra las tablas

---

## 🔌 PARTE 2: API ENDPOINTS

### 2.1 Authentication Endpoints

```typescript
POST /api/auth/register
Body: { email, password, fullName }
Response: { userId, token, refreshToken }
Errors: 409 (email exists), 400 (invalid input)

POST /api/auth/login
Body: { email, password }
Response: { userId, token, refreshToken, user }
Errors: 401 (invalid credentials)

POST /api/auth/refresh
Body: { refreshToken }
Response: { token }
Errors: 401 (invalid refresh token)

POST /api/auth/logout
Headers: { Authorization: Bearer token }
Response: { success }

GET /api/auth/me
Headers: { Authorization: Bearer token }
Response: { user }
Errors: 401 (unauthorized)
```

### 2.2 Shows Endpoints

```typescript
// List
GET /api/shows?status=confirmed&limit=20&offset=0
Headers: { Authorization: Bearer token }
Response: { shows: Show[], total: number }

// Get Single
GET /api/shows/:id
Headers: { Authorization: Bearer token }
Response: { show: Show }
Errors: 404 (not found), 403 (not authorized)

// Create
POST /api/shows
Headers: { Authorization: Bearer token }
Body: { city, country, dateEvent, fee, feeCurrency, ... }
Response: { show: Show }
Errors: 400 (validation), 401 (unauthorized)

// Update
PATCH /api/shows/:id
Headers: { Authorization: Bearer token }
Body: { ...changes }
Response: { show: Show }
Errors: 400 (validation), 404 (not found), 409 (version conflict)

// Delete
DELETE /api/shows/:id
Headers: { Authorization: Bearer token }
Response: { success }
Errors: 404 (not found), 403 (not authorized)

// Batch Operations
POST /api/shows/batch
Headers: { Authorization: Bearer token }
Body: { operations: [{ op: 'create'|'update'|'delete', data }] }
Response: { results: Result[] }
```

### 2.3 Sync Endpoints

```typescript
// Get events since last sync
GET /api/sync/events?since=timestamp
Headers: { Authorization: Bearer token }
Response: { events: SyncEvent[], timestamp: number }

// Process offline queue
POST /api/sync/flush
Headers: { Authorization: Bearer token }
Body: { operations: OfflineOperation[] }
Response: { results: Result[], conflicts?: Conflict[] }

// Conflict resolution
POST /api/sync/resolve-conflicts
Headers: { Authorization: Bearer token }
Body: { conflicts: Conflict[] }
Response: { resolved: Conflict[] }
```

### 2.4 Implementation Structure

```typescript
// src/routes/auth.ts
export router = express.Router();

router.post('/register', validateInput, async (req, res) => {
  // ...
});

router.post('/login', validateInput, async (req, res) => {
  // ...
});

// src/routes/shows.ts
router.get('/', authenticate, async (req, res) => {
  const shows = await db.show.findMany({
    where: { userId: req.user.id, deletedAt: null },
    take: 20,
    skip: 0,
  });
  res.json({ shows });
});

router.post('/', authenticate, validateInput, async (req, res) => {
  const show = await db.show.create({
    data: {
      ...req.body,
      userId: req.user.id,
    },
  });
  res.status(201).json({ show });
});

// src/routes/sync.ts
router.get('/events', authenticate, async (req, res) => {
  const since = parseInt(req.query.since) || 0;
  const events = await db.syncEvent.findMany({
    where: {
      userId: req.user.id,
      createdAt: { gt: new Date(since) },
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ events, timestamp: Date.now() });
});
```

### 2.5 Checklist

- [ ] Auth endpoints implemented (register, login, refresh, logout)
- [ ] Shows CRUD endpoints implemented
- [ ] Sync endpoints implemented
- [ ] Error handling standardized
- [ ] Input validation middleware
- [ ] Authentication middleware
- [ ] Rate limiting configured
- [ ] API documentation (Swagger/OpenAPI)
- **Criterio de Aceptación:** `npm run test:api` - todos pasan

---

## 🔐 PARTE 3: AUTENTICACIÓN

### 3.1 JWT Strategy

```typescript
// JWT Payload
{
  sub: userId,           // Subject
  email: userEmail,      // Email
  iat: issuedAt,        // Issued at
  exp: expiresAt,       // Expires
  deviceId: deviceId,   // Device fingerprint
}

// Tokens:
// - Access token: 15 minutes
// - Refresh token: 7 days
```

### 3.2 Implementation

```typescript
// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateTokens(userId: string, email: string, deviceId: string) {
  const now = Math.floor(Date.now() / 1000);

  const accessToken = jwt.sign({ sub: userId, email, deviceId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ sub: userId, email, deviceId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    throw new Error('Invalid token');
  }
}
```

### 3.3 OAuth2 Integration (Optional)

Para permitir login con Google/GitHub:

```typescript
// src/routes/auth.ts
router.get('/oauth/google/callback', async (req, res) => {
  const { code } = req.query;

  // Exchange code for tokens from Google
  const googleTokens = await exchangeCodeForTokens(code);

  // Get user info
  const googleUser = await getGoogleUserInfo(googleTokens.accessToken);

  // Find or create user
  let user = await db.user.findUnique({
    where: { email: googleUser.email },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: googleUser.email,
        fullName: googleUser.name,
        avatarUrl: googleUser.picture,
        oauthProvider: 'google',
        oauthId: googleUser.id,
      },
    });
  }

  // Generate app tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.email, 'web');

  // Redirect with tokens
  res.redirect(`${process.env.FRONTEND_URL}?token=${accessToken}&refreshToken=${refreshToken}`);
});
```

### 3.4 Checklist

- [ ] Password hashing (bcrypt)
- [ ] JWT token generation
- [ ] Token verification
- [ ] Refresh token rotation
- [ ] OAuth2 setup (optional)
- [ ] Session management
- [ ] CORS configured
- [ ] HTTPS enforced (production)
- **Criterio de Aceptación:** Login/logout flow funciona

---

## 📦 PARTE 4: FRONTEND MIGRATION

### 4.1 Add API Client Layer

```typescript
// src/lib/apiClient.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_URL,
});

// Add token to requests
client.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Try to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      localStorage.setItem('accessToken', data.token);

      // Retry original request
      return client.request(error.config);
    }
    throw error;
  }
);

export default client;
```

### 4.2 Migrate showStore to API

```typescript
// src/lib/showStore.ts - UPDATED
class ShowStore extends EventEmitter {
  private shows: Show[] = [];
  private useApi = true; // Use backend instead of localStorage

  async loadShows() {
    if (this.useApi) {
      const { data } = await client.get('/shows');
      this.shows = data.shows;
    } else {
      // Fallback to localStorage
      this.shows = JSON.parse(localStorage.getItem('shows') || '[]');
    }
    this.emit('change', this.shows);
  }

  async createShow(show: Show) {
    if (this.useApi) {
      const { data } = await client.post('/shows', show);
      this.shows.push(data.show);
    } else {
      this.shows.push(show);
      localStorage.setItem('shows', JSON.stringify(this.shows));
    }
    this.emit('change', this.shows);
  }

  async updateShow(id: string, updates: Partial<Show>) {
    if (this.useApi) {
      const { data } = await client.patch(`/shows/${id}`, updates);
      this.shows = this.shows.map(s => (s.id === id ? data.show : s));
    } else {
      this.shows = this.shows.map(s => (s.id === id ? { ...s, ...updates } : s));
      localStorage.setItem('shows', JSON.stringify(this.shows));
    }
    this.emit('change', this.shows);
  }

  // ... etc
}
```

### 4.3 Checklist

- [ ] API client setup
- [ ] Token management (access + refresh)
- [ ] Interceptors configured
- [ ] Shows CRUD via API
- [ ] Error handling
- [ ] Loading states
- [ ] Fallback to localStorage when offline
- **Criterio de Aceptación:** Frontend hits API, shows sync correctly

---

## 🧪 PARTE 5: TESTING STRATEGY

### 5.1 Backend Tests

```typescript
// tests/auth.test.ts
describe('Authentication', () => {
  it('should register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password', fullName: 'Test' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('should not register duplicate email', async () => {
    await createUser({ email: 'test@test.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password' });

    expect(res.status).toBe(409);
  });
});

// tests/shows.test.ts
describe('Shows API', () => {
  it('should create show', async () => {
    const token = generateToken();

    const res = await request(app)
      .post('/api/shows')
      .set('Authorization', `Bearer ${token}`)
      .send({ city: 'Madrid', fee: 10000 });

    expect(res.status).toBe(201);
    expect(res.body.show.id).toBeDefined();
  });

  it('should list user shows', async () => {
    const token = generateToken();
    await createShow({ userId: decodeToken(token).sub });

    const res = await request(app).get('/api/shows').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.shows.length).toBeGreaterThan(0);
  });
});
```

### 5.2 Integration Tests

```typescript
// tests/integration/offline-to-api.test.ts
describe('Offline to API Migration', () => {
  it('should sync offline changes to API', async () => {
    // 1. User offline, creates show locally
    const show = { city: 'Madrid', fee: 10000 };
    offlineManager.queueOperation('create', 'show', show);

    // 2. User goes online
    await offlineManager.sync();

    // 3. Verify show exists in API
    const res = await apiClient.get('/shows');
    expect(res.shows.some(s => s.city === 'Madrid')).toBe(true);
  });

  it('should resolve conflicts (last-write-wins)', async () => {
    // Local version: fee 10000 v2
    // Remote version: fee 12000 v1
    // Expected: remote wins (newer version)
    const conflict = await resolveConflict(localShow, remoteShow);
    expect(conflict.fee).toBe(12000);
  });
});
```

### 5.3 Checklist

- [ ] Auth tests (register, login, token refresh)
- [ ] Shows CRUD tests
- [ ] Error handling tests
- [ ] Authorization tests (user can't access other users' shows)
- [ ] Offline queue tests
- [ ] Sync conflict resolution tests
- [ ] Performance tests (response times < 200ms)
- [ ] Load tests (1000 concurrent users)
- **Criterio de Aceptación:** `npm run test:api` - 80+ tests passing

---

## 📊 DEPLOYMENT CHECKLIST

- [ ] Backend environment variables set (.env)
- [ ] Database migrations run (production)
- [ ] SSL/HTTPS configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Monitoring setup (error tracking, logging)
- [ ] Backup strategy
- [ ] Load balancer configured
- [ ] CI/CD pipeline
- **Criterio de Aceptación:** Backend running in staging

---

## 🎯 SUCCESS CRITERIA FOR FASE 6

- ✅ Database schema complete and normalized
- ✅ All API endpoints working
- ✅ Authentication flow functioning
- ✅ Frontend successfully migrated to API
- ✅ Offline sync working with API
- ✅ 80+ backend tests passing
- ✅ Performance: API response < 200ms (p95)
- ✅ Deployed to staging environment
- ✅ Ready for user acceptance testing

---

## 📚 DELIVERABLES

### Documentation

- `BACKEND_SETUP_GUIDE.md` - How to setup backend locally
- `API_DOCUMENTATION.md` - Full API reference
- `DATABASE_SCHEMA.md` - Database design
- `DEPLOYMENT_GUIDE.md` - How to deploy to production

### Code

- `backend/` directory with Node.js + Prisma setup
- `src/lib/apiClient.ts` - Frontend API client
- `tests/` directory with 80+ tests

### Infrastructure

- PostgreSQL database
- Backend server (Node.js/Express)
- Staging deployment
- CI/CD pipeline

---

## 🚦 PHASE 6 TIMELINE

| Week | Focus                | Deliverable                         |
| ---- | -------------------- | ----------------------------------- |
| 1    | DB Schema + Auth     | Prisma setup, auth endpoints        |
| 2    | API CRUD             | Shows/costs endpoints, testing      |
| 3    | Frontend Integration | API client, migration, offline sync |
| 4    | Testing + Staging    | E2E tests, staging deploy, QA       |

**Total Duration:** 4 weeks (3-4 with experienced team)

---

## ⚠️ RISKS & MITIGATIONS

| Risk                        | Probability | Impact   | Mitigation                              |
| --------------------------- | ----------- | -------- | --------------------------------------- |
| API performance degradation | MEDIUM      | HIGH     | Load testing, indexing, caching         |
| Data migration issues       | MEDIUM      | CRITICAL | Backup strategy, dry-run first          |
| Offline sync conflicts      | HIGH        | MEDIUM   | Comprehensive conflict resolution tests |
| Auth token leaks            | MEDIUM      | CRITICAL | HTTPS, CSRF protection, secure tokens   |
| Database not scaling        | MEDIUM      | CRITICAL | Optimization, read replicas planned     |

---

## 📝 NOTES

- Backend development should proceed in parallel with frontend
- Keep localStorage as fallback for offline scenarios
- Don't rush - quality over speed
- Test thoroughly before production
- Monitor performance metrics

---

**Document Created:** 3 Noviembre 2025  
**Status:** READY FOR BACKEND TEAM KICKOFF
