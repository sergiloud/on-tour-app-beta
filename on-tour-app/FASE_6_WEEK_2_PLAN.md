# FASE 6 Week 2+ Action Plan

**Status**: 🟢 Week 1 Complete - Ready for Week 2  
**Date**: November 4, 2025  
**Target**: PostgreSQL integration + 40% test coverage

---

## Overview

FASE 6 Week 1 successfully delivered 14 API endpoints with proper authentication, validation, and logging. Now we move to **production-grade implementation** with:

- Real database (PostgreSQL)
- Comprehensive testing
- Auto-generated documentation
- Performance optimization

---

## Week 2 Priorities (Next 1-2 weeks)

### Priority 1: PostgreSQL Integration 🔴 CRITICAL

**Objective**: Replace in-memory mock storage with PostgreSQL

**Tasks**:

1. **Database Setup** (2-3 hours)
   - Install PostgreSQL locally
   - Create `on_tour_app` database
   - Configure connection string in `.env`
   - Install TypeORM + PostgreSQL driver

2. **TypeORM Configuration** (1-2 hours)
   - Create `src/database/config.ts` with connection settings
   - Setup connection pool (10-20 connections)
   - Configure logger and migrations
   - Error handling for connection failures

3. **Entity Models** (2-3 hours)
   - Create `Show` entity
   - Create `Finance` entity
   - Create `Organization` entity
   - Add proper relationships and constraints

4. **Migrations System** (1-2 hours)
   - Setup migrations directory
   - Create initial schema migration
   - Document migration workflow
   - Test rollback capability

5. **Service Layer Update** (2-3 hours)
   - Update ShowsService to use TypeORM repository
   - Replace mock database calls with real queries
   - Add error handling & logging
   - Maintain same interface for routes

**Expected Result**:

- All 14 endpoints working with PostgreSQL
- Data persists across server restarts
- Migration system ready for future changes
- Connection pooling for performance

**File Structure**:

```
backend/src/
├── database/
│   ├── config.ts              # Connection configuration
│   ├── entities/
│   │   ├── Show.ts
│   │   ├── Finance.ts
│   │   └── Organization.ts
│   └── migrations/
│       └── 1_Initial.ts
└── services/
    └── showsService.ts        # Updated for TypeORM
```

---

### Priority 2: Testing Framework 🟡 HIGH

**Objective**: 40% code coverage with unit + integration tests

**Tasks**:

1. **Unit Tests for ShowsService** (3-4 hours)
   - Test listShows() with pagination
   - Test createShow() validation
   - Test getShow() not found
   - Test updateShow() partial updates
   - Test deleteShow() cascading
   - Mock database repository

2. **Integration Tests for Shows Routes** (2-3 hours)
   - Test GET /api/shows (happy path)
   - Test POST /api/shows (validation errors)
   - Test JWT auth failures
   - Test organization scoping
   - Test error responses

3. **Finance Service Tests** (2-3 hours)
   - Test fee calculations
   - Test settlement creation
   - Test financial summary

4. **Travel Service Tests** (1-2 hours)
   - Test flight search mock
   - Test itinerary creation

5. **Test Utilities** (1 hour)
   - Create factory functions for test data
   - Setup test database (separate instance)
   - Configure test reporter
   - Setup coverage reporting

**Coverage Target**:

- ShowsService: 100%
- Routes: 80%
- Utilities: 90%
- Overall: 40%+

**File Structure**:

```
backend/tests/
├── unit/
│   ├── shows.service.test.ts
│   ├── finance.service.test.ts
│   └── travel.service.test.ts
├── integration/
│   ├── shows.routes.test.ts
│   ├── finance.routes.test.ts
│   └── travel.routes.test.ts
└── fixtures/
    ├── factories.ts            # Test data builders
    └── mocks.ts                # Mock implementations
```

---

### Priority 3: API Documentation 🟡 HIGH

**Objective**: Auto-generated, interactive API documentation

**Tasks**:

1. **Swagger Setup** (2-3 hours)
   - Install `swagger-jsdoc` + `swagger-ui-express`
   - Configure Swagger in `index.ts`
   - Setup `/api-docs` route
   - Create base Swagger configuration

2. **Endpoint Documentation** (3-4 hours)
   - Add JSDoc comments to all routes
   - Document request/response schemas
   - Document error responses
   - Add examples for each endpoint
   - Document authentication requirement

3. **Schema Definitions** (2-3 hours)
   - Define Show schema
   - Define Finance schema
   - Define Travel schema
   - Define error schemas
   - Add validation examples

4. **Interactive Explorer** (1-2 hours)
   - Enable Swagger UI with authentication
   - Test endpoints from UI
   - Verify schema accuracy
   - Check documentation completeness

**Result**: Interactive API documentation at `http://localhost:3000/api-docs`

**File Structure**:

```
backend/src/
├── swagger/
│   ├── config.ts               # Swagger configuration
│   ├── schemas/
│   │   ├── show.schema.ts
│   │   ├── finance.schema.ts
│   │   └── travel.schema.ts
│   └── endpoints/
│       ├── shows.yaml
│       ├── finance.yaml
│       └── travel.yaml
└── index.ts                    # Swagger route setup
```

---

## Week 3+ Advanced Features

### 1. Real Business Logic

**Finance Module**:

- Accurate commission calculations
- Multi-currency support
- Tax calculation per jurisdiction
- Settlement tracking
- Reconciliation reports

**Travel Module**:

- Amadeus API integration
- Real flight search
- Hotel booking integration
- Itinerary optimization
- Price alerts

### 2. Performance Optimization

- Database query optimization
- Redis caching layer
- Request deduplication
- Pagination refinement
- Bulk operations

### 3. Enterprise Features

- Multi-organization support
- Role-based access control
- Audit logging
- Data encryption
- Compliance reporting

---

## Success Metrics (Week 2 End)

| Metric            | Target             | Status          |
| ----------------- | ------------------ | --------------- |
| **Test Coverage** | 40%                | 📝 To measure   |
| **API Endpoints** | 14/14              | ✅ Already met  |
| **Database**      | PostgreSQL working | 📝 To implement |
| **Documentation** | Swagger live       | 📝 To implement |
| **Build Time**    | <30s               | 📝 To measure   |
| **Response Time** | <100ms avg         | 📝 To measure   |

---

## Getting Started Next Session

### Session Checklist

Before starting Week 2:

1. ✅ Read `backend/CONTINUATION_SUMMARY.md`
2. ✅ Review `backend/README.md`
3. ✅ Check `backend/TESTING_GUIDE.md`
4. 📝 Install PostgreSQL locally
5. 📝 Create `.env` file with DB credentials
6. 📝 Run `npm install` in backend
7. 📝 Start with Priority 1: PostgreSQL integration

### Commands to Know

```bash
# Start development
cd backend && npm run dev

# Test database
psql -U postgres -d on_tour_app

# Run tests
npm run test

# Check types
npm run type-check

# Build
npm run build
```

---

## Risks & Mitigations

| Risk               | Impact | Mitigation                                       |
| ------------------ | ------ | ------------------------------------------------ |
| DB schema mismatch | High   | Careful migration planning, test rollbacks       |
| Test flakiness     | Medium | Use stable factories, avoid time-dependent tests |
| Performance issues | High   | Database indexing, query optimization            |
| Type safety loss   | Medium | Maintain strict TypeScript mode                  |

---

## Estimated Timeline

| Task             | Duration        | Week         |
| ---------------- | --------------- | ------------ |
| PostgreSQL setup | 3-5 hours       | W2.1         |
| TypeORM config   | 1-2 hours       | W2.1         |
| Entity models    | 2-3 hours       | W2.1-2.2     |
| Migrations       | 1-2 hours       | W2.2         |
| Service updates  | 2-3 hours       | W2.2-2.3     |
| **Subtotal**     | **9-15 hours**  | **Week 2**   |
| Testing          | 8-10 hours      | W2.3-W3.1    |
| Documentation    | 6-8 hours       | W2.3-W3.2    |
| Buffer/fixes     | 4-6 hours       | W3.1         |
| **Total**        | **27-39 hours** | **Week 2-3** |

---

## Key Resources

### Documentation

- `backend/README.md` - Quick start
- `backend/DOCUMENTATION_INDEX.md` - Full index
- `backend/TESTING_GUIDE.md` - Testing strategies
- `backend/SESSION_COMPLETE.md` - What was built

### Code Reference

- `backend/src/services/showsService.ts` - Service pattern
- `backend/src/routes/shows.ts` - Route pattern
- `backend/src/middleware/auth.ts` - Auth pattern

### External

- TypeORM docs: https://typeorm.io/
- PostgreSQL docs: https://www.postgresql.org/docs/
- Swagger/OpenAPI: https://swagger.io/

---

## Next Steps Now

1. **Read**: `CONTINUATION_SUMMARY.md`
2. **Review**: Backend architecture in `backend/README.md`
3. **Understand**: Show patterns in `backend/src/`
4. **Plan**: Week 2 PostgreSQL setup
5. **Schedule**: Dedicated time for database integration

---

**Status**: ✅ Week 1 Complete - Ready for Week 2  
**Next Review**: Week 2 completion (November 11, 2025)  
**Maintainer**: Backend Team

---

For questions: See `backend/DOCUMENTATION_INDEX.md`
