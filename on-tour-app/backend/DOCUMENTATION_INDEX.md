# Backend Documentation Index - FASE 6

Navigation guide for On Tour App backend documentation.

## Quick Navigation

### Getting Started

- **[Backend README](./README.md)** - Project overview and quick start
- **[Installation Guide](#installation-guide)** - Step-by-step setup

### API Reference

- **[Shows API](./docs/SHOWS_API.md)** - Shows management endpoints
- **[Finance API](./docs/FINANCE_API.md)** - Finance operations endpoints
- **[Travel API](./docs/TRAVEL_API.md)** - Travel management endpoints

### Architecture

- **[Shows Architecture](./docs/SHOWS_ARCHITECTURE.md)** - Technical design
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Data models (planned)

### Development

- **[Testing Guide](./TESTING_GUIDE.md)** - Unit and integration tests
- **[Authentication](./docs/AUTHENTICATION.md)** - JWT setup
- **[Error Handling](./docs/ERROR_HANDLING.md)** - Error patterns

## Installation Guide

### Prerequisites

- Node.js 20 LTS ([install](https://nodejs.org/))
- npm 10+ (comes with Node)
- PostgreSQL 15+ (optional, for Week 2)

### Setup Steps

1. **Install dependencies**

```bash
cd backend
npm install
```

2. **Create environment file**

```bash
cp .env.example .env
```

3. **Start development server**

```bash
npm run dev
```

Server runs on `http://localhost:3000`

4. **Verify it's working**

```bash
curl http://localhost:3000/health
```

Response:

```json
{ "status": "ok", "timestamp": "2025-11-04T..." }
```

## Project Structure

```
backend/
├── README.md                      # This file
├── DOCUMENTATION_INDEX.md         # Documentation navigation
├── TESTING_GUIDE.md               # Testing guide
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── .env.example                   # Environment template
├── src/
│   ├── index.ts                   # Entry point
│   ├── routes/                    # API endpoints
│   │   ├── shows.ts               # Show endpoints
│   │   ├── finance.ts             # Finance endpoints
│   │   └── travel.ts              # Travel endpoints
│   ├── services/                  # Business logic
│   │   ├── showsService.ts        # Show operations
│   │   ├── financeService.ts      # Finance operations (planned)
│   │   └── travelService.ts       # Travel operations (planned)
│   ├── middleware/
│   │   ├── auth.ts                # JWT authentication
│   │   └── errorHandler.ts        # Error handling
│   ├── utils/
│   │   ├── logger.ts              # Pino logger
│   │   └── jwt.ts                 # JWT utilities
│   └── types/
│       └── express.d.ts           # Express type extensions
├── tests/
│   ├── unit/                      # Unit tests
│   └── integration/               # Integration tests
└── docs/
    ├── SHOWS_API.md               # Shows API docs
    ├── FINANCE_API.md             # Finance API docs
    ├── TRAVEL_API.md              # Travel API docs
    ├── SHOWS_ARCHITECTURE.md      # System design
    ├── AUTHENTICATION.md          # Auth guide
    ├── DATABASE_SCHEMA.md         # Data models (planned)
    └── ERROR_HANDLING.md          # Error patterns
```

## API Endpoints Overview

### Shows Module

| Method | Path             | Auth | Description    |
| ------ | ---------------- | ---- | -------------- |
| GET    | `/api/shows`     | ✅   | List all shows |
| POST   | `/api/shows`     | ✅   | Create show    |
| GET    | `/api/shows/:id` | ✅   | Get show       |
| PUT    | `/api/shows/:id` | ✅   | Update show    |
| DELETE | `/api/shows/:id` | ✅   | Delete show    |

### Finance Module

| Method | Path                          | Auth | Description       |
| ------ | ----------------------------- | ---- | ----------------- |
| GET    | `/api/finance/summary`        | ✅   | Financial summary |
| POST   | `/api/finance/calculate-fees` | ✅   | Calculate fees    |
| POST   | `/api/finance/settlement`     | ✅   | Create settlement |
| GET    | `/api/finance/settlements`    | ✅   | List settlements  |

### Travel Module

| Method | Path                          | Auth | Description      |
| ------ | ----------------------------- | ---- | ---------------- |
| POST   | `/api/travel/search-flights`  | ✅   | Search flights   |
| POST   | `/api/travel/itineraries`     | ✅   | Create itinerary |
| GET    | `/api/travel/itineraries`     | ✅   | List itineraries |
| GET    | `/api/travel/itineraries/:id` | ✅   | Get itinerary    |

## Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run type-check      # Check TypeScript types
npm run lint            # Run ESLint

# Building
npm run build           # Compile TypeScript

# Testing
npm run test            # Run tests (watch mode)
npm run test:run        # Run tests once
npm run test:coverage   # Run with coverage report

# Code Quality
npm run format          # Format code with Prettier
npm run lint            # Check for linting errors

# Database (Week 2)
npm run migration:generate    # Create new migration
npm run migration:run         # Run migrations
npm run migration:revert      # Revert migration
```

## Key Concepts

### Authentication

All endpoints (except `/health`) require a Bearer token:

```
Authorization: Bearer <jwt-token>
```

See [Authentication Guide](./docs/AUTHENTICATION.md) for details.

### Request Validation

Input validation using **Zod**:

- Automatic type checking
- Descriptive error messages
- Safe parsing before database

```typescript
const showSchema = z.object({
  title: z.string().min(1).max(255),
  startDate: z.string().datetime(),
});
```

### Error Handling

Standard error format:

```json
{
  "error": "Error message",
  "code": "error_code",
  "status": 400
}
```

### Logging

Pino logger for development and production:

- **Development**: Human-readable console output
- **Production**: JSON for log aggregation

```typescript
logger.info({ showId: '123' }, 'Show created');
logger.error(error, 'Database connection failed');
```

## Development Workflow

### 1. Feature Development

```bash
# Start dev server
npm run dev

# In another terminal, run tests
npm run test
```

### 2. Make Changes

Edit files in `src/` directory. Server auto-restarts.

### 3. Run Tests

```bash
npm run test:run
```

### 4. Format & Lint

```bash
npm run format
npm run lint
```

### 5. Type Check

```bash
npm run type-check
```

### 6. Build

```bash
npm run build
```

## Common Tasks

### Add a New API Endpoint

1. Create service in `services/`
2. Add route handler in `routes/`
3. Add validation schema (Zod)
4. Write tests in `tests/`
5. Update documentation

### Add a New Dependency

```bash
npm install package-name
npm run type-check
```

For dev dependencies:

```bash
npm install --save-dev package-name
```

### Fix TypeScript Errors

1. Check error message: `npm run type-check`
2. Look at specific file and line
3. Fix the issue
4. Re-run type-check

## Troubleshooting

### "Cannot find module" errors

Solution: Install dependencies

```bash
npm install
```

### Port already in use

Change PORT in `.env`:

```
PORT=3001
npm run dev
```

### Database connection error

Skip for now (Week 2 feature). Comment out database imports.

### Tests failing

1. Check error output
2. Review test file
3. Check service implementation
4. Run specific test: `npm run test -- showsService`

## Next Steps

1. **Read**: [Shows API Documentation](./docs/SHOWS_API.md)
2. **Try**: Test the Shows endpoints with curl
3. **Build**: Create a Finance service
4. **Test**: Write unit tests
5. **Learn**: Explore how authentication works

## Documentation Files

### Getting Started

- `README.md` - Project overview ← Start here
- `DOCUMENTATION_INDEX.md` - This file

### API Documentation

- `docs/SHOWS_API.md` - Shows endpoint reference
- `docs/FINANCE_API.md` - Finance endpoint reference (planned)
- `docs/TRAVEL_API.md` - Travel endpoint reference (planned)

### Architecture & Design

- `docs/SHOWS_ARCHITECTURE.md` - Shows system design
- `docs/AUTHENTICATION.md` - JWT authentication (planned)
- `docs/DATABASE_SCHEMA.md` - Data models (planned)
- `docs/ERROR_HANDLING.md` - Error patterns (planned)

### Development

- `TESTING_GUIDE.md` - Testing strategies

### Session Reports

- `SESSION_COMPLETE.md` - This session's work

## FAQ

**Q: How do I get a JWT token?**  
A: Token generation is typically done during login. For development, see the testing guide.

**Q: Can I use this without a database?**  
A: Yes! Week 1 uses in-memory storage. PostgreSQL is for Week 2+.

**Q: How do I add a new field to Shows?**  
A: 1) Update `ShowsService`, 2) Update validation schema, 3) Add tests.

**Q: What's the difference between /api/shows and /api/shows/:id?**  
A: First endpoint works with collections, second with individual items.

## Support & Resources

- **Docs**: See files in this directory
- **Code**: Check `src/` for implementations
- **Tests**: See `tests/` for examples
- **Issues**: Create a GitHub issue

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0 - Week 1  
**Status**: 🟢 Ready for development

For questions or clarifications, check the specific documentation file or the main README.md.
