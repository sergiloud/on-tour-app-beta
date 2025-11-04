# 🎵 On Tour Backend - FASE 6

**Status**: 🟢 DEVELOPMENT READY  
**Version**: 1.0.0  
**Environment**: Node.js 20 LTS + Express 4.x + PostgreSQL 15

---

## 🚀 Quick Start

### 1. Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb on_tour_db

# Run migrations
npm run db:migrate

# (Optional) Seed with demo data
npm run db:seed
```

### 3. Development

```bash
# Start development server (with auto-reload)
npm run dev

# In another terminal, run tests
npm test

# Type checking
npm run type-check
```

The API will be available at `http://localhost:3001`

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server startup entry point
│   │
│   ├── middleware/
│   │   ├── auth.ts            # OAuth2 & JWT validation
│   │   ├── validation.ts       # Input validation (Zod)
│   │   └── errorHandler.ts    # Global error handling
│   │
│   ├── routes/
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── shows.ts           # Shows CRUD
│   │   ├── finance.ts         # Finance operations
│   │   └── users.ts           # User management
│   │
│   ├── services/
│   │   ├── authService.ts     # Auth business logic
│   │   ├── showsService.ts    # Shows business logic
│   │   ├── financeService.ts  # Finance calculations
│   │   └── usersService.ts    # User operations
│   │
│   ├── db/
│   │   ├── migrations/        # Database migrations
│   │   │   └── 001_initial_schema.ts
│   │   ├── types.ts           # Database types
│   │   └── client.ts          # Kysely database client
│   │
│   ├── types/
│   │   ├── auth.ts            # Auth types
│   │   ├── shows.ts           # Shows types
│   │   ├── finance.ts         # Finance types
│   │   └── api.ts             # API response types
│   │
│   └── utils/
│       ├── logger.ts          # Logging setup
│       ├── jwt.ts             # JWT utilities
│       └── validation.ts       # Validation helpers
│
├── __tests__/
│   ├── auth.test.ts           # Auth tests
│   ├── shows.test.ts          # Shows API tests
│   ├── finance.test.ts        # Finance API tests
│   └── integration/           # End-to-end tests
│
├── .env.example               # Environment variables template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - OAuth2 login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile

### Shows
- `GET /api/shows` - List all shows
- `POST /api/shows` - Create new show
- `GET /api/shows/:id` - Get show details
- `PUT /api/shows/:id` - Update show
- `DELETE /api/shows/:id` - Delete show

### Finance
- `GET /api/finance/overview` - Finance dashboard data
- `POST /api/finance/records` - Create finance record
- `GET /api/finance/records/:showId` - Get show finances
- `POST /api/finance/settlement` - Create settlement

### Users
- `GET /api/users` - List organization users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Remove from organization

---

## 🗄️ Database Schema

### Tables

**users**
- id (UUID, PK)
- email (VARCHAR, unique)
- name (VARCHAR)
- avatar_url (TEXT)
- oauth_provider (VARCHAR)
- oauth_id (VARCHAR)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)

**organizations**
- id (UUID, PK)
- name (VARCHAR)
- owner_id (UUID, FK→users)
- description (TEXT)
- logo_url (TEXT)
- settings (JSONB)
- created_at, updated_at (TIMESTAMP)

**organization_members**
- id (UUID, PK)
- organization_id (UUID, FK→organizations)
- user_id (UUID, FK→users)
- role (VARCHAR: owner, manager, member, viewer)
- joined_at (TIMESTAMP)

**shows**
- id (UUID, PK)
- organization_id (UUID, FK)
- name (VARCHAR)
- venue, city, country (VARCHAR)
- show_date (DATE)
- door_time, show_time, end_time (TIME)
- notes (TEXT)
- ticket_url (TEXT)
- status (VARCHAR: scheduled, cancelled, completed)
- metadata (JSONB)
- created_by, created_at, updated_at

**finance_records**
- id (UUID, PK)
- show_id (UUID, FK)
- organization_id (UUID, FK)
- amount (DECIMAL)
- currency (VARCHAR)
- category (VARCHAR: venue_fee, ticket_sales, expenses, settlement)
- description (TEXT)
- status (VARCHAR: pending, confirmed, settled)
- recorded_by (UUID, FK)
- created_at, updated_at

**audit_logs**
- id (UUID, PK)
- organization_id (UUID, FK)
- user_id (UUID, FK)
- action (VARCHAR)
- entity_type, entity_id (VARCHAR, UUID)
- changes (JSONB)
- ip_address, user_agent (VARCHAR, TEXT)
- created_at

---

## 🧪 Testing

```bash
# Run all tests (watch mode)
npm test

# Run tests once with coverage
npm run test:run

# Run only E2E tests
npm run test:e2e

# Run tests matching pattern
npm test -- shows

# Watch specific test file
npm test -- auth.test.ts --watch
```

---

## 🔐 Authentication Flow

### OAuth2 (Google/Spotify)

```
1. User clicks "Sign in with Google"
   └─> Frontend redirects to /api/auth/google

2. Google OAuth dialog opens
   └─> User authorizes
   
3. Google redirects to /api/auth/google/callback
   └─> Backend creates/updates user in DB
   
4. Backend creates JWT token
   └─> Redirects to frontend with token
   
5. Frontend stores JWT
   └─> Uses for all API requests
```

### JWT Validation

All protected endpoints expect:
```
Authorization: Bearer <jwt_token>
```

The JWT contains:
- `sub` (user ID)
- `email`
- `org_id` (organization ID)
- `role` (user role)
- `exp` (expiration)

---

## 📊 Development Workflow

### Add New API Endpoint

1. **Define types** in `src/types/`
   ```typescript
   export interface CreateShowRequest {
     name: string;
     venue: string;
     show_date: string;
   }
   ```

2. **Create service** in `src/services/`
   ```typescript
   export class ShowsService {
     async create(orgId: string, data: CreateShowRequest) {
       // Business logic
     }
   }
   ```

3. **Create route** in `src/routes/`
   ```typescript
   router.post('/', asyncHandler(async (req, res) => {
     const show = await showsService.create(req.org.id, req.body);
     res.json(show);
   }));
   ```

4. **Write tests** in `__tests__/`
   ```typescript
   describe('POST /api/shows', () => {
     it('creates a new show', async () => {
       // Test implementation
     });
   });
   ```

5. **Run type check**
   ```bash
   npm run type-check
   ```

---

## 🚀 Deployment

### Production Build

```bash
# Compile TypeScript
npm run build

# Start production server
npm start
```

### Docker

```bash
# Build image
docker build -t on-tour-backend .

# Run container
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  on-tour-backend
```

---

## 📝 Environment Variables

See `.env.example` for complete list. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWT tokens
- `GOOGLE_CLIENT_ID/SECRET` - OAuth2 Google credentials
- `SPOTIFY_CLIENT_ID/SECRET` - OAuth2 Spotify credentials
- `CORS_ORIGIN` - Frontend URL for CORS
- `NODE_ENV` - development, production, test

---

## 🆘 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432

→ Ensure PostgreSQL is running
→ Verify DATABASE_URL in .env
→ Run: createdb on_tour_db
```

### Port Already in Use

```
Error: listen EADDRINUSE :::3001

→ Kill process: lsof -i :3001 | kill <PID>
→ Or use different port: PORT=3002 npm run dev
```

### TypeScript Errors

```bash
npm run type-check
```

Fix any reported errors before committing.

---

## 📚 Architecture Decisions

### Why Kysely + PostgreSQL?

- **Type-safe**: Full TypeScript support, compile-time SQL validation
- **Lightweight**: ~5KB bundle (vs 50KB+ for Prisma)
- **Flexible**: Raw SQL when needed, but type-safe query builders
- **PostgreSQL**: JSONB, arrays, full-text search, PostGIS for coordinates

### Why Express?

- **Minimal**: Only what you need, no bloat
- **Ecosystem**: Best middleware ecosystem in Node.js
- **Performance**: Benchmarks consistently fast
- **Familiar**: Most developers know Express

### Why Socket.io?

- **Real-time**: WebSocket with fallbacks
- **Scalable**: Works with multi-process/cluster
- **Rooms**: Channel management built-in
- **Reconnect**: Automatic reconnection logic

---

## 📞 Support

For issues or questions:
1. Check existing docs in `docs/`
2. Review code comments
3. Run tests to verify behavior
4. Check git history for context

---

## 📄 License

MIT

---

**Backend ready to begin development!** 🚀

Next: Install dependencies and setup database.
