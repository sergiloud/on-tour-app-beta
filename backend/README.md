# On Tour App Backend - FASE 6

Backend API for On Tour App, built with Node.js, Express, and TypeScript.

## Overview

**Status**: 🟢 Week 1 Ready  
**Build**: ✅ TypeScript configured  
**Tests**: 📝 Framework ready (Vitest)  
**Database**: 📋 PostgreSQL setup pending

## Quick Start

### Prerequisites

- Node.js 20 LTS
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Development
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Shows Management

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| GET    | `/api/shows`     | List all shows    |
| POST   | `/api/shows`     | Create a new show |
| GET    | `/api/shows/:id` | Get show details  |
| PUT    | `/api/shows/:id` | Update a show     |
| DELETE | `/api/shows/:id` | Delete a show     |

**Example: Create a Show**

```bash
curl -X POST http://localhost:3000/api/shows \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Tour 2025",
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-08-31T23:59:59Z",
    "location": "North America",
    "budget": 500000
  }'
```

### Finance Management

| Method | Endpoint                      | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/api/finance/summary`        | Get financial summary        |
| POST   | `/api/finance/calculate-fees` | Calculate fees & commissions |
| POST   | `/api/finance/settlement`     | Create a settlement          |
| GET    | `/api/finance/settlements`    | List settlements             |

**Example: Calculate Fees**

```bash
curl -X POST http://localhost:3000/api/finance/calculate-fees \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "showIds": ["show-id-1", "show-id-2"],
    "commissionRate": 0.15,
    "taxRate": 0.08
  }'
```

### Travel Management

| Method | Endpoint                      | Description        |
| ------ | ----------------------------- | ------------------ |
| POST   | `/api/travel/search-flights`  | Search for flights |
| POST   | `/api/travel/itineraries`     | Create itinerary   |
| GET    | `/api/travel/itineraries`     | List itineraries   |
| GET    | `/api/travel/itineraries/:id` | Get itinerary      |

**Example: Search Flights**

```bash
curl -X POST http://localhost:3000/api/travel/search-flights \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "departure": "LAX",
    "arrival": "NYC",
    "departureDate": "2025-06-01T10:00:00Z",
    "passengers": 5
  }'
```

## Architecture

### Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── routes/
│   │   ├── shows.ts             # Shows endpoints
│   │   ├── finance.ts           # Finance endpoints
│   │   └── travel.ts            # Travel endpoints
│   ├── services/
│   │   └── showsService.ts      # Business logic
│   ├── middleware/
│   │   ├── auth.ts              # Authentication
│   │   └── errorHandler.ts      # Error handling
│   ├── utils/
│   │   ├── logger.ts            # Pino logger
│   │   └── jwt.ts               # JWT utilities
│   └── types/
│       └── express.d.ts         # Express augmentations
├── tests/
│   ├── unit/                    # Unit tests
│   └── integration/             # Integration tests
├── package.json
├── tsconfig.json
└── .env.example
```

### Technology Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express 4.18
- **Language**: TypeScript 5
- **Validation**: Zod
- **Logging**: Pino
- **Database**: PostgreSQL (setup pending)
- **ORM**: TypeORM (setup pending)
- **Testing**: Vitest
- **Security**: Helmet, CORS, JWT

### Authentication

All endpoints except `/health` require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

Token format:

```typescript
{
  userId: string;
  organizationId: string;
  email: string;
  iat: number;
  exp: number;
}
```

## Development

### Commands

```bash
# Development server
npm run dev

# Build TypeScript
npm run build

# Type checking
npm run type-check

# Run tests
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # With coverage

# Linting
npm run lint

# Format code
npm run format
```

### Testing

Tests are organized by type:

- **Unit Tests** (`tests/unit/`) - Individual functions and services
- **Integration Tests** (`tests/integration/`) - API endpoints and workflows

Run tests:

```bash
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # With coverage report
```

## Database

### Setup (Pending)

PostgreSQL integration is planned for Week 2:

```bash
# Generate migration
npm run migration:generate -- -n CreateShowsTable

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Schema (Planned)

```sql
-- Shows table
CREATE TABLE shows (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  status VARCHAR(50),
  budget DECIMAL,
  revenue DECIMAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Similar tables for Finance and Travel
```

## Error Handling

API returns standard error format:

```json
{
  "error": "Error message",
  "code": "error_code",
  "status": 400
}
```

Validation errors:

```json
{
  "error": "Validation Error",
  "details": [
    {
      "path": "title",
      "message": "Required"
    }
  ]
}
```

## Logging

Pino logger configured for development and production:

- **Development**: Pretty-printed logs to console
- **Production**: JSON-formatted logs for machine parsing

Log levels: `debug`, `info`, `warn`, `error`

## Security

- CORS enabled for frontend (configured in `.env`)
- Helmet for HTTP headers
- JWT for authentication
- Input validation with Zod
- SQL injection prevention (will use TypeORM parameterized queries)

## Deployment

### Environment Variables

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with production values:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<strong-secret-key>
DATABASE_URL=postgresql://user:pass@host/db
CORS_ORIGIN=https://yourdomain.com
```

### Build

```bash
npm run build
npm start
```

### Docker (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t on-tour-backend .
docker run -p 3000:3000 --env-file .env on-tour-backend
```

## Next Steps (Week 2)

- [ ] PostgreSQL setup and migrations
- [ ] TypeORM integration
- [ ] Additional validation rules
- [ ] Integration tests for all endpoints
- [ ] API documentation with Swagger/OpenAPI
- [ ] Error logging and monitoring
- [ ] Rate limiting
- [ ] Request/response logging

## Roadmap

### FASE 6 (Backend Foundation)

- ✅ Week 1: Project setup, 3 API modules
- [ ] Week 2: PostgreSQL + TypeORM
- [ ] Week 3: Tests + validation
- [ ] Week 4: Documentation + deployment

### FASE 7 (Multi-User)

- Real-time collaboration
- WebSocket integration
- Advanced permissions

### FASE 8 (Advanced)

- Third-party integrations
- Analytics
- Mobile API

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and write tests
3. Run tests: `npm run test:run`
4. Format code: `npm run format`
5. Submit pull request

## Support

For issues or questions:

1. Check existing GitHub issues
2. Check `/docs` directory for guides
3. See `DOCUMENTATION_INDEX.md` for navigation

---

**Last Updated**: November 4, 2025  
**Maintainer**: @sergirecio  
**License**: MIT
