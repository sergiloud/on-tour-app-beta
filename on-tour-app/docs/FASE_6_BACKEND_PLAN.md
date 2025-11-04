# 🚀 FASE 6 Backend Development Plan

**Status**: Planning Phase  
**Target Start**: Immediately after FASE 5 validation  
**Estimated Duration**: 2-3 weeks  
**Priority**: CRITICAL PATH (blocks all other features)

---

## Executive Summary

FASE 6 is the **backend foundation** that unlocks real-world deployment. Without this, the frontend remains isolated with mock data. This phase transforms the On Tour App from a prototype to a **production-ready SaaS platform**.

### Key Deliverables

- ✅ Node.js/Express REST API
- ✅ PostgreSQL database schema
- ✅ OAuth2 authentication (Google/Spotify)
- ✅ User management & permissions
- ✅ Show CRUD API endpoints
- ✅ Multi-user sync via WebSockets (Phase 6.2)
- ✅ Backend test suite (Jest)
- ✅ API documentation (OpenAPI)
- ✅ Deployment pipeline (Docker, CI/CD)

### Success Criteria

- [ ] Backend API deployed to staging
- [ ] Frontend successfully integrates with backend
- [ ] Authentication flow working end-to-end
- [ ] 80%+ test coverage on backend
- [ ] All data persists in PostgreSQL
- [ ] Multi-tab sync works with backend

---

## Architecture Overview

### Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Runtime** | Node.js 20 LTS | Long-term support |
| **Framework** | Express 4.x | Minimal, flexible |
| **Database** | PostgreSQL 15 | Reliable, scalable |
| **Auth** | Passport.js + OAuth2 | Multiple providers |
| **Real-time** | Socket.io | WebSocket fallback |
| **Testing** | Jest + Supertest | Unit + integration |
| **Validation** | Zod/Joi | Input validation |
| **Logging** | Winston/Pino | Structured logs |
| **Deployment** | Docker + Railway | Easy scalability |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  - 408/449 tests passing                                     │
│  - Offline-first architecture                                │
│  - Multi-tab sync ready                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS/WebSocket
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Express API Gateway                             │
│  - Authentication middleware                                 │
│  - Request validation                                        │
│  - Error handling                                            │
│  - Logging/Monitoring                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │ Routes │ │Services│ │Workers │
    └───┬────┘ └───┬────┘ └───┬────┘
        │          │          │
        └──────────┼──────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │   DB   │ │ Cache  │ │ Queue  │
    │ (PG)   │ │ (Redis)│ │ (Bull) │
    └────────┘ └────────┘ └────────┘
```

### Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # Server startup
│   │
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts            # OAuth2 + JWT
│   │   ├── validation.ts       # Input validation
│   │   ├── errorHandler.ts    # Error handling
│   │   └── logging.ts         # Request logging
│   │
│   ├── routes/                # API endpoints
│   │   ├── auth.ts            # GET /api/auth, POST /api/auth/callback
│   │   ├── shows.ts           # CRUD /api/shows
│   │   ├── users.ts           # GET /api/users, PUT /api/users/{id}
│   │   ├── finance.ts         # GET /api/finance/summary
│   │   └── sync.ts            # WebSocket /ws/sync
│   │
│   ├── services/              # Business logic
│   │   ├── authService.ts     # OAuth flow, JWT generation
│   │   ├── showService.ts     # Show CRUD + permissions
│   │   ├── userService.ts     # User management
│   │   ├── financeService.ts  # Calculations
│   │   └── syncService.ts     # Real-time sync
│   │
│   ├── models/                # TypeORM entities
│   │   ├── User.ts
│   │   ├── Show.ts
│   │   ├── AuditLog.ts
│   │   └── Session.ts
│   │
│   ├── database/              # Database setup
│   │   ├── connection.ts       # TypeORM connection
│   │   └── migrations/         # Schema migrations
│   │
│   └── utils/                 # Helpers
│       ├── validators.ts       # Input validators
│       ├── errors.ts           # Custom errors
│       └── jwt.ts              # JWT utilities
│
├── tests/                     # Test suite
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # End-to-end tests
│
├── docker/                    # Docker setup
│   ├── Dockerfile             # Container definition
│   └── docker-compose.yml     # Local dev stack
│
├── .env.example               # Environment variables template
├── tsconfig.json              # TypeScript config
├── jest.config.js             # Test config
└── package.json               # Dependencies
```

---

## Phase 6.1: API Foundation (Week 1)

### 6.1.1 Project Setup

**Tasks:**
```
[ ] Create Node.js/Express project
[ ] Setup TypeScript + tsconfig
[ ] Install core dependencies
[ ] Configure environment variables
[ ] Setup TypeORM for database
```

**Dependencies:**
```bash
npm install express cors dotenv
npm install @types/express @types/node typescript ts-node
npm install typeorm pg
npm install passport passport-google-oauth20 jsonwebtoken
npm install zod joi validator
npm install winston
```

### 6.1.2 Database Schema

**Create PostgreSQL schema:**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  avatar_url VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user', -- user, admin, team_admin
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX(email),
  INDEX(google_id)
);

-- Shows table
CREATE TABLE shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  date DATE NOT NULL,
  city VARCHAR(255) NOT NULL,
  country VARCHAR(2) NOT NULL,
  venue VARCHAR(255),
  fee DECIMAL(10, 2),
  fee_currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'draft', -- draft, pending, confirmed, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INT DEFAULT 1,
  INDEX(user_id),
  INDEX(date),
  INDEX(status)
);

-- Finance details table
CREATE TABLE show_finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  wht_percentage DECIMAL(5, 2),
  mgmt_agency_percentage DECIMAL(5, 2),
  booking_agency_percentage DECIMAL(5, 2),
  costs JSONB DEFAULT '[]',
  fx_rate DECIMAL(10, 6) DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(show_id)
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  entity_type VARCHAR(50), -- 'show', 'user', etc
  entity_id UUID,
  action VARCHAR(50), -- 'create', 'update', 'delete'
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX(user_id),
  INDEX(entity_type),
  INDEX(entity_id),
  INDEX(created_at)
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX(user_id),
  INDEX(expires_at)
);
```

### 6.1.3 Authentication Setup

**OAuth2 Flow (Google):**

```typescript
// Passport configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.API_URL}/api/auth/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ google_id: profile.id });
  
  if (!user) {
    user = await User.create({
      email: profile.emails[0].value,
      name: profile.displayName,
      google_id: profile.id,
      avatar_url: profile.photos[0]?.value,
    });
  }
  
  const jwtToken = generateJWT(user);
  return done(null, { user, jwtToken });
}));

// Routes
router.get('/api/auth', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/api/auth/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${req.user.jwtToken}`);
  }
);

// JWT verification middleware
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = verifyJWT(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 6.1.4 Shows API Endpoints

```typescript
// GET /api/shows - List all shows
router.get('/api/shows', authMiddleware, async (req, res) => {
  const shows = await Show.find({
    where: { user_id: req.user.id },
    order: { date: 'DESC' }
  });
  res.json(shows);
});

// GET /api/shows/:id - Get single show
router.get('/api/shows/:id', authMiddleware, async (req, res) => {
  const show = await Show.findOne({
    where: { id: req.params.id, user_id: req.user.id }
  });
  if (!show) return res.status(404).json({ error: 'Not found' });
  res.json(show);
});

// POST /api/shows - Create show
router.post('/api/shows', authMiddleware, validateShowInput, async (req, res) => {
  const show = await Show.create({
    ...req.body,
    user_id: req.user.id,
    version: 1
  });
  res.status(201).json(show);
});

// PUT /api/shows/:id - Update show
router.put('/api/shows/:id', authMiddleware, validateShowInput, async (req, res) => {
  const show = await Show.findOne({
    where: { id: req.params.id, user_id: req.user.id }
  });
  if (!show) return res.status(404).json({ error: 'Not found' });
  
  // Conflict detection
  if (show.version !== req.body.expectedVersion) {
    return res.status(409).json({ error: 'Version conflict' });
  }
  
  Object.assign(show, req.body);
  show.version += 1;
  await show.save();
  
  res.json(show);
});

// DELETE /api/shows/:id - Delete show
router.delete('/api/shows/:id', authMiddleware, async (req, res) => {
  const show = await Show.findOne({
    where: { id: req.params.id, user_id: req.user.id }
  });
  if (!show) return res.status(404).json({ error: 'Not found' });
  
  await show.remove();
  res.status(204).send();
});
```

---

## Phase 6.2: Real-Time Sync (Week 2)

### 6.2.1 WebSocket Setup

```typescript
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL },
  transports: ['websocket', 'polling']
});

// Namespace for sync events
const syncNamespace = io.of('/ws/sync');

syncNamespace.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = verifyJWT(token);
    socket.userId = user.id;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

syncNamespace.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Subscribe to show updates
  socket.on('subscribe_show', (showId) => {
    socket.join(`show:${showId}`);
  });
  
  // Broadcast show update to all subscribers
  socket.on('show_updated', async (showId, data) => {
    const show = await Show.findOne(showId);
    if (show && show.user_id === socket.userId) {
      Object.assign(show, data);
      await show.save();
      
      syncNamespace.to(`show:${showId}`).emit('show_updated', show);
    }
  });
});
```

### 6.2.2 Sync Event Types

```typescript
// Events from frontend to backend
socket.emit('show_created', newShow);
socket.emit('show_updated', { id, patch });
socket.emit('show_deleted', showId);

// Events from backend to frontend
socket.on('show_created', (show) => { /* update local state */ });
socket.on('show_updated', (show) => { /* update local state */ });
socket.on('show_deleted', (showId) => { /* remove from local state */ });
```

---

## Phase 6.3: Testing & Deployment (Week 3)

### 6.3.1 Test Suite

```bash
# Setup Jest
npm install --save-dev jest @types/jest ts-jest supertest

# Test structure
tests/
├── unit/
│   ├── authService.test.ts
│   ├── showService.test.ts
│   └── financeService.test.ts
├── integration/
│   ├── auth.integration.test.ts
│   ├── shows.integration.test.ts
│   └── sync.integration.test.ts
└── e2e/
    └── user-flow.e2e.test.ts
```

**Example Test:**

```typescript
describe('Shows API', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Setup
    const user = await User.create({ email: 'test@example.com' });
    userId = user.id;
    token = generateJWT(user);
  });

  test('GET /api/shows returns user shows', async () => {
    const response = await request(app)
      .get('/api/shows')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/shows creates new show', async () => {
    const response = await request(app)
      .post('/api/shows')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Show',
        date: '2025-12-01',
        city: 'Madrid',
        country: 'ES',
        fee: 1000
      });
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

### 6.3.2 Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: on_tour_db
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    environment:
      DATABASE_URL: postgresql://postgres:dev_password@postgres:5432/on_tour_db
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## Integration with Frontend

### Frontend Changes Needed

**1. Update API base URL:**

```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${getStoredToken()}`
  }
});
```

**2. Replace mock data with real API calls:**

```typescript
// Before
const shows = MOCK_SHOWS;

// After
const { data: shows } = await apiClient.get('/shows');
```

**3. Connect WebSocket for real-time sync:**

```typescript
// src/lib/socketClient.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.VITE_API_URL, {
  auth: {
    token: getStoredToken()
  }
});

socket.on('show_updated', (show) => {
  showStore.updateShow(show);
  multiTabSync.broadcast('show_updated', show);
});
```

---

## Environment Variables

**Backend `.env`:**

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/on_tour_db
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
JWT_SECRET=super-secret-key
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
```

**Frontend `.env.local`:**

```
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
```

---

## Success Criteria & Testing

### Unit Tests

- [ ] AuthService: 80%+ coverage
- [ ] ShowService: 80%+ coverage
- [ ] FinanceService: 100% coverage
- [ ] Validators: 100% coverage

### Integration Tests

- [ ] OAuth2 flow end-to-end
- [ ] Show CRUD with permissions
- [ ] Multi-user isolation
- [ ] Conflict detection
- [ ] Version management

### E2E Tests

- [ ] User login → create show → sync → logout
- [ ] Multi-user concurrent edits
- [ ] Offline queue + backend sync
- [ ] WebSocket reconnection

### Performance Benchmarks

- [ ] Show list: <100ms (10k shows)
- [ ] Create show: <200ms
- [ ] Finance calculation: <50ms
- [ ] WebSocket latency: <50ms

---

## Deployment Checklist

### Pre-Production

- [ ] All tests passing (80%+ coverage)
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Error handling implemented
- [ ] Logging operational
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting implemented

### Production

- [ ] Database backups configured
- [ ] Monitoring/alerting setup (Sentry)
- [ ] CDN configured
- [ ] SSL certificate installed
- [ ] Load balancer configured
- [ ] Docker image built & tested
- [ ] Kubernetes deployment manifests ready
- [ ] Rollback procedure documented

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Database schema needs revision | Medium | Schema versioning, migration strategy |
| OAuth provider outage | Low | Fallback to email/password |
| WebSocket scalability | Medium | Redis pub/sub for horizontal scaling |
| Data loss during migration | High | Full backup before migration, zero-downtime strategy |
| Performance degradation | Medium | Load testing, caching strategy, indexing |

---

## Timeline

```
Week 1 (FASE 6.1):
  Mon-Wed: Project setup, DB schema
  Thu-Fri: Auth implementation, tests

Week 2 (FASE 6.2):
  Mon-Wed: WebSocket implementation
  Thu-Fri: Sync integration testing

Week 3 (FASE 6.3):
  Mon-Tue: Full test suite
  Wed-Thu: Docker & deployment
  Fri: Final testing & documentation
```

---

## Success Metrics

- ✅ 80%+ backend test coverage
- ✅ Frontend + backend fully integrated
- ✅ Authentication working end-to-end
- ✅ Real-time sync operational
- ✅ Multi-user support verified
- ✅ Deployed to staging environment
- ✅ Performance benchmarks met
- ✅ Disaster recovery plan documented

---

## Next: FASE 7 (Multi-User Collaboration)

Once FASE 6 is complete:
- Real-time multi-user editing
- Presence tracking
- Comments & collaboration
- Team management
- Role-based access control

---

**Prepared By**: GitHub Copilot  
**Date**: November 4, 2025  
**Status**: Ready for Implementation
