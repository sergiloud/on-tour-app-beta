╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║          🚀 FASE 7 SESSION 1 - QUICK REFERENCE CHECKLIST 🚀             ║
║                                                                           ║
║              Multi-Organization Foundation Implementation                 ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

**Document**: FASE_7_SESSION_1_CHECKLIST.md  
**Estimated Duration**: 3-4 hours  
**Objective**: Multi-org foundation with enterprise security  
**Status**: 🟢 Ready to execute  

---

## 📋 PRE-SESSION CHECKLIST

Before starting, verify:

```bash
# 1. Check FASE 6 is complete
npm run test:run

# Expected: ✅ 235+ tests passing, 0 errors

# 2. Review documents
cat FASE_7_QUICK_START.md | head -50
cat FASE_7_ENTERPRISE_SECURITY.md | head -50

# 3. Verify database
psql -d on_tour_app -c "SELECT version();"
psql -d on_tour_app -c "SELECT COUNT(*) FROM users;"

# 4. Create backup
git stash  # (if uncommitted changes exist)
git log --oneline -5

# 5. Create feature branch (optional)
git checkout -b feat/fase7-multi-org
```

---

## ⏱️ SESSION TIMELINE

### 0:00-0:15 (15 min) - JWT Security Updates

```bash
# Step 1: Update JWT payload structure
# File: src/auth/auth.service.ts

TASK: Update authService.createToken()
  - Add organizationId to JWT payload
  - Add permissions array
  - Add scope field (for superadmin)

CODE EXAMPLE:
interface JwtPayload {
  sub: string;           // userId
  org: string;           // organizationId ← ADD
  role: string;
  permissions: string[]; // ← ADD
  scope?: string;        // ← ADD
  iat: number;
  exp: number;
}

VERIFY:
  - npm run build (0 errors)
  - Existing tests still pass

COMMIT: "Add organizationId to JWT payload"
```

### 0:15-0:45 (30 min) - Tenant Middleware Update

```bash
# Step 2: Replace tenantMiddleware.ts
# File: src/middleware/tenantMiddleware.ts

TASK: JWT-based tenant extraction (no headers!)
  - Extract organizationId from JWT (not from header)
  - Handle superadmin scope
  - Set req.context with org info

KEY CODE:
const payload = jwt.verify(token) as JwtPayload;
req.context = {
  userId: payload.sub,
  organizationId: payload.org,  // ← From JWT
  role: payload.role,
  permissions: payload.permissions,
  isSuperAdmin: payload.scope === 'superadmin'
};

VERIFY:
  - npm run build (0 errors)
  - npm run test:run (all tests pass)

COMMIT: "JWT-based tenant middleware (secure)"
```

### 0:45-1:15 (30 min) - Organization Entity

```bash
# Step 3: Create Organization.ts entity
# File: src/entities/Organization.ts

TASK: Enterprise organization entity with validation
  - PrimaryGeneratedColumn('uuid')
  - Column: name, slug (unique), description, websiteUrl, logoUrl
  - Column: ownerId, createdAt, updatedAt, deletedAt
  - BeforeInsert: generateSlug()
  - BeforeInsert/Update: validateSlug()
  - OneToMany relationships with CASCADE

KEY FIELDS:
  id: UUID
  name: string (required)
  slug: string (unique, auto-generated)
  ownerId: UUID (required)
  users: User[] (oneToMany, cascade)
  shows: Show[] (oneToMany, cascade: delete)
  deletedAt?: Date (soft delete)

HOOKS:
  @BeforeInsert()
  generateSlug() { this.slug = slugify(this.name); }
  
  @BeforeInsert()
  @BeforeUpdate()
  validateSlug() { /* check slug = slugify(name) */ }

VERIFY:
  - npm run build (0 errors)
  - No TypeScript issues

COMMIT: "Add Organization entity with validation"
```

### 1:15-1:45 (30 min) - Migration File

```bash
# Step 4: Create migration
# File: src/migrations/[timestamp]-CreateOrganization.ts

TASK: Database migration for organizations table
  - Create organizations table
  - Add all columns with proper types
  - Add indices (slug unique, ownerId, createdAt)
  - Add foreign key to users.ownerId (if exists)

MIGRATION STEPS:
  1. Create organizations table
  2. Add columns (id, name, slug, ownerId, etc.)
  3. Create unique index on slug
  4. Create foreign key to users

RUN MIGRATION:
  npm run migration:run

VERIFY:
  - Table created: psql -c "\\d organizations"
  - Index exists: psql -c "\\d organizations_slug_key"

COMMIT: "Add CreateOrganization migration"
```

### 1:45-2:15 (30 min) - Query Scoping Utility

```bash
# Step 5: Create scopeByOrg() utility
# File: src/utils/tenantQueryBuilder.ts

TASK: DRY query scoping function
  - Function: scopeByOrg<T>(qb, orgId, alias)
  - Handle superadmin (orgId = null → no filtering)
  - Return scoped QueryBuilder

KEY CODE:
export function scopeByOrg<T>(
  qb: SelectQueryBuilder<T>,
  orgId: string | null,
  alias: string = 'entity'
): SelectQueryBuilder<T> {
  if (!orgId) return qb;  // Superadmin
  return qb.andWhere(
    `${alias}.organizationId = :orgId`,
    { orgId }
  );
}

USAGE:
let qb = showRepository.createQueryBuilder('show');
qb = scopeByOrg(qb, orgId, 'show');
const shows = await qb.getMany();

VERIFY:
  - Compiles without errors
  - Can use in existing services

COMMIT: "Add scopeByOrg() utility for DRY scoping"
```

### 2:15-2:45 (30 min) - Rate Limiter Middleware

```bash
# Step 6: Create orgRateLimiter middleware
# File: src/middleware/orgRateLimiter.ts

TASK: Rate limiting per organization
  - Per-org RateLimiterMemory instances
  - 100 req/min per org
  - Superadmin bypass
  - Return 429 on limit

KEY CODE:
const rateLimiters = new Map<string, RateLimiterMemory>();

limiter.consume(orgId, 1)
  .then(() => next())
  .catch((error) => {
    res.status(429).json({ error: 'Rate limit exceeded' });
  });

REGISTER:
In app.ts:
  app.use(tenantMiddleware);
  app.use(orgRateLimiter);

VERIFY:
  - npm run build (0 errors)
  - Can register in Express

COMMIT: "Add rate limiting per organization"
```

### 2:45-3:15 (30 min) - Organization Service

```bash
# Step 7: Create OrganizationService
# File: src/services/OrganizationService.ts

TASK: CRUD + utility methods
  - create(name, ownerId)
  - list(orgId) / listAll() (superadmin)
  - getById(id)
  - update(id, data)
  - delete(id)
  - addUser(orgId, userId)
  - removeUser(orgId, userId)

METHODS:
  async create(data: CreateOrgDTO): Organization
  async getById(id: string, orgId?: string): Organization
  async list(orgId: string): Organization[]
  async update(id, data, orgId): Organization
  async delete(id, orgId): void
  async addUser(orgId, userId): void
  async removeUser(orgId, userId): void

VERIFY:
  - Service methods work
  - Org scoping applied
  - Soft delete logic correct

COMMIT: "Add OrganizationService with CRUD"
```

### 3:15-3:45 (30 min) - API Endpoints

```bash
# Step 8: Create organization API routes
# File: src/routes/organizations.ts

TASK: 5 REST endpoints
  - POST   /api/organizations            (create)
  - GET    /api/organizations           (list)
  - GET    /api/organizations/:id       (get)
  - PUT    /api/organizations/:id       (update)
  - DELETE /api/organizations/:id       (delete)

ROUTES:
  router.post('/', auth, async (req, res) => {
    const org = await orgService.create(req.body);
    res.status(201).json(org);
  });

  router.get('/', auth, async (req, res) => {
    const orgs = await orgService.list(req.context.organizationId);
    res.json(orgs);
  });

  // ... GET /:id, PUT /:id, DELETE /:id

REGISTER:
In app.ts:
  app.use('/api/organizations', organizationRoutes);

VERIFY:
  - npm run build (0 errors)
  - Routes work in tests

COMMIT: "Add organization API endpoints"
```

### 3:45-4:00 (15 min) - Tests

```bash
# Step 9: Write tests
# File: src/__tests__/organizations.test.ts

TASK: 50+ tests covering:
  - CRUD operations
  - Organization creation with slug generation
  - Multi-org isolation
  - Soft delete behavior
  - User assignment
  - Rate limiting

TEST CATEGORIES:
  ✅ Create organization (name, slug, owner)
  ✅ List organizations (only own org, superadmin sees all)
  ✅ Get organization
  ✅ Update organization
  ✅ Delete organization (soft delete)
  ✅ Add/remove users
  ✅ Org isolation (org A cannot access org B)
  ✅ Rate limiting per org

VERIFY:
  npm run test:run

  Expected: All new tests ✅
            Existing tests still pass ✅

COMMIT: "Add organization tests (50+)"
```

---

## 🎯 SESSION DELIVERABLES

After 4 hours, you should have:

```
✅ CREATED:
  - src/entities/Organization.ts (entity with validation)
  - src/migrations/[timestamp]-CreateOrganization.ts (migration)
  - src/utils/tenantQueryBuilder.ts (scopeByOrg utility)
  - src/middleware/orgRateLimiter.ts (rate limiting)
  - src/services/OrganizationService.ts (CRUD service)
  - src/routes/organizations.ts (5 API endpoints)
  - src/__tests__/organizations.test.ts (50+ tests)

✅ UPDATED:
  - src/auth/auth.service.ts (JWT with organizationId)
  - src/middleware/tenantMiddleware.ts (JWT-based extraction)
  - src/app.ts (register rate limiter)
  - database.ts (auto-load Organization entity)

✅ COMMITTED:
  - 7-8 meaningful commits
  - Clean git history

✅ VERIFIED:
  - npm run build → 0 errors
  - npm run test:run → all tests pass
  - No TypeScript errors
  - No ESLint violations

✅ METRICS:
  - +500-600 LOC (code)
  - +300-400 LOC (tests)
  - 0 production errors
  - Multi-org isolation 100%
```

---

## 🚨 CRITICAL DO'S & DON'Ts

### DO ✅

```typescript
✅ DO: Use JWT for org identification
  const orgId = req.context.organizationId;  // ← From JWT

✅ DO: Scope all queries
  const shows = scopeByOrg(qb, req.context.organizationId);

✅ DO: Soft delete (never hard delete)
  @DeleteDateColumn() deletedAt?: Date;

✅ DO: Use CASCADE delete
  @OneToMany(..., { onDelete: 'CASCADE' })

✅ DO: Test multi-org isolation
  const org1Shows = await getShowsForOrg(org1.id);
  expect(org1Shows).not.toContain(org2Show);

✅ DO: Generate slug from name
  @BeforeInsert()
  generateSlug() { this.slug = slugify(this.name); }
```

### DON'T ❌

```typescript
❌ DON'T: Use headers for org ID
  const orgId = req.headers['x-organization-id'];  // ← Spoofable!

❌ DON'T: Query without org scope
  const shows = await showRepository.find();  // ← Leaks data!

❌ DON'T: Hard delete organizations
  await orgRepository.remove(org);  // ← No recovery!

❌ DON'T: Forget CASCADE delete
  @OneToMany(() => Show, s => s.org)  // Missing cascade!

❌ DON'T: Allow manual slug entry
  slug: req.body.slug  // ← Can conflict!

❌ DON'T: Skip multi-org tests
  // No cross-org isolation tests
```

---

## 🧪 QUICK TEST TEMPLATE

```typescript
// Quick test to verify isolation
it('should isolate data between organizations', async () => {
  // Setup
  const org1 = await createOrganization('Org 1');
  const org2 = await createOrganization('Org 2');
  
  // Create data in org1
  const show1 = await showService.create({
    title: 'Show 1',
    organizationId: org1.id
  });
  
  // Verify org2 cannot access
  const result = await showService.getById(show1.id, org2.id);
  expect(result).toBeNull();  // ← Should not find
});
```

---

## 🔧 TROUBLESHOOTING QUICK FIX

### Build error: "Cannot find Organization"

```bash
# Problem: Entity not registered
# Fix in database.ts:
entities: [
  User,
  Show,
  Organization,  // ← Add this
  FinanceRecord,
  Itinerary
]
```

### Test failing: "organizationId is required"

```bash
# Problem: Forgot org scoping
# Fix in service:
async list(orgId: string) {
  return showRepository.find({
    where: { organizationId: orgId }  // ← Add org filter
  });
}
```

### Rate limiter not working

```bash
# Problem: Not registered before routes
# Fix in app.ts:
app.use(tenantMiddleware);
app.use(orgRateLimiter);     // ← BEFORE routes
app.use('/api', routes);
```

### Slug validation failing

```bash
# Problem: Slug doesn't match name
# Fix in Organization entity:
@BeforeInsert()
@BeforeUpdate()
validateSlug() {
  const expected = this.slugify(this.name);
  if (this.slug !== expected) {
    throw new Error('Slug must match name');
  }
}
```

---

## ✅ PRE-COMMIT CHECKLIST

Before each commit:

```bash
# 1. Build
npm run build
# Expected: ✅ 0 errors

# 2. Tests
npm run test:run
# Expected: ✅ All tests passing

# 3. Linting
npm run lint
# Expected: ✅ No violations

# 4. Review git diff
git diff --cached

# 5. Meaningful commit message
git commit -m "Add X feature - description"

# 6. Verify commit
git log --oneline -3
```

---

## 📊 SUCCESS CRITERIA (After 4 hours)

Check these before considering Session 1 complete:

```
Backend Code:
  ✅ Organization entity created with all fields
  ✅ Slug validation + auto-generation working
  ✅ Migration runs without errors
  ✅ OrganizationService CRUD functional
  ✅ 5 API endpoints working
  ✅ 50+ tests passing

Security:
  ✅ JWT includes organizationId
  ✅ Tenant middleware uses JWT (not headers)
  ✅ All queries scoped to org
  ✅ Rate limiter active per org
  ✅ Soft delete implemented

Quality:
  ✅ npm run build → 0 errors
  ✅ npm run test:run → all pass
  ✅ npm run lint → clean
  ✅ No TypeScript errors
  ✅ No console.log in production code

Isolation:
  ✅ Org A cannot access Org B data
  ✅ User A in Org A blocked from Org B APIs
  ✅ Rate limits per org (not global)
  ✅ Multi-org scenarios tested

Git:
  ✅ 7-8 meaningful commits
  ✅ Clean commit history
  ✅ Descriptive messages
```

---

## 📁 FILE STRUCTURE AFTER SESSION 1

```
src/
├── entities/
│   ├── Organization.ts        ← NEW
│   ├── User.ts                (no changes)
│   ├── Show.ts                (no changes)
│   └── ...
│
├── migrations/
│   ├── [timestamp]-CreateOrganization.ts  ← NEW
│   └── ...
│
├── services/
│   ├── OrganizationService.ts  ← NEW
│   ├── ShowsService.ts         (no changes)
│   └── ...
│
├── routes/
│   ├── organizations.ts        ← NEW
│   └── ...
│
├── middleware/
│   ├── tenantMiddleware.ts     (UPDATED - JWT)
│   ├── orgRateLimiter.ts       ← NEW
│   └── ...
│
├── utils/
│   ├── tenantQueryBuilder.ts   ← NEW
│   └── ...
│
└── __tests__/
    ├── organizations.test.ts   ← NEW (50+ tests)
    └── ...
```

---

## 🎓 LEARNING RESOURCES

Read in this order:

1. **FASE_7_QUICK_START.md** (overview)
2. **FASE_7_ENTERPRISE_SECURITY.md** (detailed patterns)
3. This file (checklist)
4. Code examples in security guide
5. Existing tests (for patterns)

---

## 📞 QUICK REFERENCE LINKS

- JWT documentation: `src/auth/auth.service.ts`
- Entity patterns: `src/entities/User.ts` (example)
- Service patterns: `src/services/ShowsService.ts` (example)
- Test patterns: `src/__tests__/shows.test.ts` (example)
- Query builder: `src/utils/tenantQueryBuilder.ts` (create this)

---

╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║            ✨ SESSION 1 READY - 4 HOURS TO COMPLETION ✨               ║
║                                                                           ║
║              Step-by-step timeline with clear milestones                  ║
║              Detailed deliverables checklist                              ║
║              Security patterns included                                   ║
║              Success criteria defined                                     ║
║                                                                           ║
║                         LET'S GO! 🚀                                      ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

**Created**: November 5, 2025  
**Status**: Ready for immediate execution  
**Duration**: 3-4 hours  
**Next**: Begin with JWT updates (Step 1)  
