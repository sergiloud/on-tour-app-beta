╔═══════════════════════════════════════════════════════════════════════════╗
║ ║
║ 🚀 FASE 7 - ENTERPRISE FEATURES (QUICK START) 🚀 ║
║ ║
║ Multi-Org | Advanced Permissions | Analytics ║
║ Estimated Duration: 2-3 weeks ║
║ ║
╚═══════════════════════════════════════════════════════════════════════════╝

**Phase**: FASE 7 - Enterprise Features  
**Status**: 🟢 Ready to Start  
**Prerequisites**: ✅ FASE 6 Complete (8,636+ LOC, 235+ tests)  
**Estimated Duration**: 20-30 hours (2-3 weeks)  
**Target Completion**: November 15-20, 2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PHASE OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FASE 7 will transform the backend from **single-organization** to **enterprise-grade** multi-tenant system with advanced permissions and analytics.

### Current State (After FASE 6)

```
✅ Single-org backend API (41 endpoints)
✅ PostgreSQL database (4 entities)
✅ User authentication (JWT)
✅ Real-time features (WebSockets)
✅ External integrations (Amadeus, Stripe, Email)
✅ Comprehensive testing (235+ tests)
```

### Target State (After FASE 7)

```
✅ Multi-organization backend (scalable architecture)
✅ Advanced permissions system (RBAC + fine-grained)
✅ Tenant isolation (data security)
✅ Analytics & reporting (business intelligence)
✅ Activity logging (audit trails)
✅ Organization management APIs (new)
✅ Permission management APIs (new)
✅ Analytics dashboard backend (new)
```

---

## 🎯 FASE 7 PRIORITIES

### Priority 1: Multi-Organization Architecture (8-10 hours)

**Goal**: Enable multiple organizations with proper isolation

#### Features to Implement

| Feature                   | Description                  | Complexity | Time |
| ------------------------- | ---------------------------- | ---------- | ---- |
| **Organization Entity**   | Create Org model with fields | Low        | 1h   |
| **User-Org Relationship** | Associate users to orgs      | Low        | 1h   |
| **Tenant Middleware**     | Extract org from request     | Medium     | 2h   |
| **Query Scoping**         | Scope all queries by org     | Medium     | 2h   |
| **Seed Multi-Org Data**   | Test scenarios               | Low        | 1h   |
| **Integration Tests**     | Multi-org workflows          | Medium     | 2h   |

#### Deliverables

```
Create:
  ✅ Organization.ts entity
  ✅ 1 new migration (AddOrganization)
  ✅ tenantMiddleware.ts
  ✅ organizationService.ts
  ✅ 5 API endpoints for org management

Update:
  ✅ All existing entities (add organizationId FK)
  ✅ All queries (add org filtering)
  ✅ 4 migrations (add FK columns)

Tests:
  ✅ 20+ organization tests
  ✅ 30+ multi-org integration tests
```

#### Implementation Roadmap

```
Step 1: Add Organization entity & migration
  └─ Create Organization.ts (50 lines)
  └─ Create migration with FK setup
  └─ Add organizationId to all entities

Step 2: Create Organization Service
  └─ OrganizationService.ts (300+ lines)
  └─ Methods: create, list, get, update, delete
  └─ Methods: addUser, removeUser, listMembers
  └─ Permission checks

Step 3: Implement Tenant Middleware
  └─ Extract org from JWT or header
  └─ Attach to request context
  └─ Scope all database queries

Step 4: Update Existing Services
  └─ Add org scoping to ShowsService
  └─ Add org scoping to FinanceService
  └─ Add org scoping to all others

Step 5: API Endpoints (5 new)
  └─ POST   /api/organizations         (create)
  └─ GET    /api/organizations        (list)
  └─ GET    /api/organizations/:id    (get)
  └─ PUT    /api/organizations/:id    (update)
  └─ DELETE /api/organizations/:id    (delete)

Step 6: Testing
  └─ Unit tests for service methods
  └─ Integration tests for multi-org workflows
  └─ Tenant isolation verification
```

#### Code Example Skeleton

```typescript
// Organization.ts
@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToMany(() => User, user => user.organization)
  users: User[];

  @OneToMany(() => Show, show => show.organization)
  shows: Show[];

  @OneToMany(() => FinanceRecord, finance => finance.organization)
  finances: FinanceRecord[];
}

// TenantMiddleware
export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  const orgId = req.headers['x-organization-id'] as string;
  if (!orgId) return res.status(400).json({ error: 'Missing organization' });

  req.context = { organizationId: orgId };
  next();
}

// Usage in service
const shows = await showRepository.find({
  where: { organizationId: req.context.organizationId },
});
```

---

### Priority 2: Advanced Permissions (RBAC) (6-8 hours)

**Goal**: Implement role-based and fine-grained access control

#### Features to Implement

| Feature                  | Description                               | Complexity | Time |
| ------------------------ | ----------------------------------------- | ---------- | ---- |
| **Role System**          | Predefined roles (Admin, Manager, Viewer) | Low        | 1h   |
| **Permission System**    | Fine-grained permissions                  | Medium     | 2h   |
| **Authorization Guards** | Middleware/decorators                     | Medium     | 2h   |
| **Audit Logging**        | Track permission changes                  | Low        | 1h   |
| **Permission APIs**      | GET/SET permissions                       | Low        | 1h   |
| **Testing**              | 30+ permission tests                      | Medium     | 2h   |

#### Role Hierarchy

```
Organization Owner
  └─ Full access to org
  └─ Can invite/remove users
  └─ Can assign roles

Administrator
  └─ Full access to org data
  └─ Cannot manage users/roles
  └─ Can view audit logs

Manager
  └─ Can manage shows, finance, itineraries
  └─ Cannot delete critical records
  └─ Can view analytics

Viewer
  └─ Read-only access
  └─ Can view shows, calendar, reports
  └─ Cannot modify anything
```

#### Permissions Matrix

```
                    Owner  Admin  Manager  Viewer
Create Shows         ✅     ✅      ✅       ✗
Edit Shows           ✅     ✅      ✅       ✗
Delete Shows         ✅     ✅      ✗        ✗
View Reports         ✅     ✅      ✅       ✅
Manage Users         ✅     ✗       ✗        ✗
Export Data          ✅     ✅      ✅       ✗
Delete Organization  ✅     ✗       ✗        ✗
```

#### Deliverables

```
Create:
  ✅ Role.ts entity
  ✅ Permission.ts entity
  ✅ RolePermission.ts junction table
  ✅ permissionService.ts
  ✅ authorizationMiddleware.ts
  ✅ 1 migration

Tests:
  ✅ 20+ permission tests
  ✅ 30+ authorization tests
```

#### Implementation Steps

```
Step 1: Create Role & Permission entities
  └─ Role.ts (with ENUM for standard roles)
  └─ Permission.ts
  └─ User-Role association

Step 2: Permission Service
  └─ assignRole(userId, roleId)
  └─ grantPermission(userId, permission)
  └─ checkPermission(userId, permission)
  └─ listUserPermissions(userId)

Step 3: Authorization Middleware
  └─ canAccess(permission)
  └─ canEdit(resource)
  └─ canDelete(resource)

Step 4: Audit Logging
  └─ Log all permission changes
  └─ Track who made changes & when
  └─ Queryable audit trail

Step 5: API Endpoints (new)
  └─ GET    /api/roles
  └─ POST   /api/users/:id/roles
  └─ DELETE /api/users/:id/roles/:roleId
  └─ GET    /api/users/:id/permissions
```

---

### Priority 3: Analytics & Reporting (6-8 hours)

**Goal**: Provide business intelligence and reporting capabilities

#### Analytics Features

| Feature                  | Description              | Complexity | Time |
| ------------------------ | ------------------------ | ---------- | ---- |
| **Event Logging**        | Track all user actions   | Medium     | 1.5h |
| **Finance Dashboard**    | Income/expense metrics   | Medium     | 2h   |
| **Activity Reports**     | User activity tracking   | Low        | 1h   |
| **Export Functionality** | CSV/JSON exports         | Low        | 1.5h |
| **Dashboard APIs**       | Aggregate data endpoints | Medium     | 2h   |

#### Analytics Endpoints (6 new)

```
GET /api/analytics/finance
  Returns: Income, expenses, profit by period

GET /api/analytics/activity
  Returns: User activity, login frequency

GET /api/analytics/shows
  Returns: Shows created, completion rate

GET /api/analytics/integrations
  Returns: API usage, transaction counts

POST /api/analytics/export
  Returns: CSV/JSON with filtered data

GET /api/analytics/dashboard
  Returns: Summary of all metrics
```

#### Deliverables

```
Create:
  ✅ EventLog.ts entity
  ✅ analyticsService.ts
  ✅ reportingService.ts
  ✅ 1 migration

Services:
  ✅ Track page views
  ✅ Track CRUD operations
  ✅ Track API usage
  ✅ Generate reports

Tests:
  ✅ 20+ analytics tests
  ✅ 10+ reporting tests
```

#### Implementation

```
Step 1: Create EventLog entity
  └─ Store: userId, action, resource, timestamp
  └─ Index by userId, action, timestamp

Step 2: Audit Middleware
  └─ Track all CRUD operations
  └─ Track API calls
  └─ Store in EventLog

Step 3: Analytics Service
  └─ getFinanceMetrics(org, period)
  └─ getActivityMetrics(org, user)
  └─ getShowMetrics(org)
  └─ getDashboardSummary(org)

Step 4: Export Functionality
  └─ exportData(org, format, filters)
  └─ Generate CSV
  └─ Generate JSON

Step 5: Dashboard APIs (6 endpoints)
```

---

### Priority 4: Advanced Security (Optional, 4-6 hours)

**Goal**: Enterprise-grade security features

#### Features

```
✅ Two-factor authentication (2FA)
✅ Session management
✅ IP whitelist/blacklist
✅ Rate limiting per org
✅ Encryption at rest
✅ Backup strategy
```

---

## 📊 IMPLEMENTATION BREAKDOWN

### Files to Create

```
Database Layer:
  ✅ entities/Organization.ts           (50 lines)
  ✅ entities/Role.ts                   (40 lines)
  ✅ entities/Permission.ts             (40 lines)
  ✅ entities/EventLog.ts               (50 lines)
  ✅ migrations/AddOrganization.ts      (50 lines)
  ✅ migrations/AddRoles.ts             (50 lines)
  ✅ migrations/AddEventLog.ts          (30 lines)

Services:
  ✅ services/OrganizationService.ts    (300+ lines)
  ✅ services/PermissionService.ts      (250+ lines)
  ✅ services/AnalyticsService.ts       (300+ lines)
  ✅ services/AuditService.ts           (200+ lines)

Middleware:
  ✅ middleware/tenantMiddleware.ts     (50 lines)
  ✅ middleware/authorizationMiddleware.ts (100 lines)
  ✅ middleware/auditMiddleware.ts      (80 lines)

API Routes:
  ✅ routes/organizations.ts            (100 lines)
  ✅ routes/permissions.ts              (80 lines)
  ✅ routes/analytics.ts                (120 lines)

Tests:
  ✅ tests/organizations.test.ts        (300+ lines)
  ✅ tests/permissions.test.ts          (400+ lines)
  ✅ tests/analytics.test.ts            (300+ lines)

Schemas:
  ✅ schemas/organization.schema.ts     (50 lines)
  ✅ schemas/permission.schema.ts       (50 lines)
  ✅ schemas/analytics.schema.ts        (50 lines)

Total New Code: 3,500+ LOC
Total New Tests: 1,000+ LOC
```

### Files to Modify

```
Existing Entities:
  ✅ entities/User.ts                   (add organizationId FK)
  ✅ entities/Show.ts                   (add organizationId FK)
  ✅ entities/FinanceRecord.ts          (add organizationId FK)
  ✅ entities/Itinerary.ts              (add organizationId FK)

Services:
  ✅ services/ShowsService.ts           (add org scoping)
  ✅ services/FinanceService.ts         (add org scoping)
  ✅ All other services                 (add org scoping)

Tests:
  ✅ All test suites                    (add org context)

Total Modified: 15+ files
```

---

## � CRITICAL ENTERPRISE REQUIREMENTS

Before implementing Session 1, integrate these production-critical features:

### 1. Tenant Identification via JWT (Security Critical) ⭐

**Problem**: Using `x-organization-id` headers is insecure and easily spoofable

**Solution**: Encode `organizationId` in JWT payload

```typescript
// JWT Payload Structure (auth.service.ts)
interface JwtPayload {
  sub: string; // userId
  org: string; // organizationId ← SECURE
  role: string; // user role
  permissions: string[]; // fine-grained permissions
  scope?: 'superadmin'; // for support/migrations
  iat: number;
  exp: number;
}

// Token generation
const token = jwt.sign(
  {
    sub: user.id,
    org: user.organizationId,
    role: user.role,
    permissions: user.permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  },
  SECRET_KEY
);

// Updated tenantMiddleware.ts
export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const payload = jwt.verify(token, SECRET_KEY) as JwtPayload;

    // Superadmin can bypass tenant scoping
    if (payload.scope === 'superadmin') {
      req.context = {
        userId: payload.sub,
        organizationId: null, // bypass filtering
        role: payload.role,
        permissions: payload.permissions,
        isSuperAdmin: true,
      };
      return next();
    }

    // Regular user: locked to their organization
    req.context = {
      userId: payload.sub,
      organizationId: payload.org, // ← From JWT, cannot be spoofed
      role: payload.role,
      permissions: payload.permissions,
      isSuperAdmin: false,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

**Advantages**:

- ✅ Cannot be spoofed (JWT-signed)
- ✅ Stateless (no server lookup)
- ✅ Audit-ready (org in token)
- ✅ Scalable (no permission DB lookup per request)

---

### 2. Organization Slug + Unique Constraint

```typescript
// Organization.ts
@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string; // e.g., "broadway-2025", "acme-corp"

  @BeforeInsert()
  generateSlug() {
    if (!this.slug) {
      this.slug = this.slugify(this.name);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateSlug() {
    const expectedSlug = this.slugify(this.name);
    if (this.slug !== expectedSlug) {
      throw new Error('Slug must be derived from organization name');
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  @OneToMany(() => User, user => user.organization, { onDelete: 'CASCADE' })
  users: User[];

  @OneToMany(() => Show, show => show.organization, { onDelete: 'CASCADE' })
  shows: Show[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
```

**Benefits**:

- Unique slug per org → URL-friendly domain mapping
- Auto-generated → no manual entry
- Validates consistency → name=slug relationship
- Future-proof → app.broadway-2025.yourdomain.com

---

### 3. Soft Deletes + Cascade (Data Safety)

```typescript
// All entities: Add soft delete column
@DeleteDateColumn()
deletedAt?: Date;

// Organization: Add cascade delete
@OneToMany(() => Show, show => show.organization, {
  onDelete: 'CASCADE'  // ← Critical for safety
})
shows: Show[];

// Query scope (auto-exclude soft-deleted)
// Add to base service:
protected getBaseQuery(repository: Repository<any>) {
  return repository.find({
    where: { deletedAt: IsNull() }
  });
}
```

**Why Critical**:

- Soft deletes = audit trail + recovery
- Cascade = when org deleted, all data goes too
- Prevents orphaned data

---

### 4. DRY Query Builder: scopeByOrg() Utility

**Problem**: Repeating `where: { organizationId }` in 50 services

**Solution**: Single utility function

```typescript
// utils/tenantQueryBuilder.ts
import { SelectQueryBuilder } from 'typeorm';

export function scopeByOrg<T>(
  queryBuilder: SelectQueryBuilder<T>,
  orgId: string,
  entityAlias: string = 'entity'
): SelectQueryBuilder<T> {
  // Skip if superadmin (orgId === null)
  if (!orgId) return queryBuilder;

  return queryBuilder.andWhere(
    `${entityAlias}.organizationId = :orgId`,
    { orgId }
  );
}

// Usage example:
// showsService.ts
async listForOrg(orgId: string, filters: any) {
  let qb = this.showRepository.createQueryBuilder('show')
    .where('show.status = :status', { status: 'active' })
    .leftJoinAndSelect('show.finance', 'finance');

  qb = scopeByOrg(qb, orgId, 'show');

  return qb.getMany();
}
```

**Benefits**:

- Single source of truth
- Easy to audit (find all org filtering)
- One place to fix bugs

---

### 5. Super Admin Access (Support + Migrations)

```typescript
// JWT with superadmin scope
const superAdminToken = jwt.sign(
  {
    sub: 'support-user-789',
    org: null, // ← null signals superadmin
    scope: 'superadmin',
    role: 'superadmin',
    iat: Math.floor(Date.now() / 1000),
  },
  SECRET_KEY
);

// In middleware: already handled above
// If scope === 'superadmin', bypass org filtering

// Use cases:
// 1. Support: npm run support -- --org-id=abc123 (full access)
// 2. Migration: npm run migrate:tenant-split (process all orgs)
// 3. Debug: API calls without org restriction
```

**Caution**: Only give to trusted operations, log everything

---

### 6. Rate Limiting per Organization

```typescript
// middleware/orgRateLimiter.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiters = new Map<string, RateLimiterMemory>();

const DEFAULT_LIMIT = {
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
  blockDuration: 300, // block for 5 minutes if exceeded
};

export function orgRateLimiter(req: Request, res: Response, next: NextFunction) {
  const orgId = req.context?.organizationId;

  // Superadmin bypass
  if (req.context?.isSuperAdmin) return next();

  // No org = skip (public endpoint)
  if (!orgId) return next();

  // Get or create limiter for this org
  let limiter = rateLimiters.get(orgId);
  if (!limiter) {
    limiter = new RateLimiterMemory(DEFAULT_LIMIT);
    rateLimiters.set(orgId, limiter);
  }

  limiter
    .consume(orgId, 1) // consume 1 point
    .then(() => next())
    .catch(error => {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });
    });
}

// Register in Express:
// app.use('/api', orgRateLimiter);
```

**Why per-org**: Prevents one org's spike from affecting others

---

### 7. Analytics: Time-Series Optimization

```typescript
// EventLog.ts with indices
@Entity()
@Index(['organizationId', 'action', 'createdAt'])
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  userId: string;

  @Column()
  action: string; // 'show.create', 'finance.update', etc.

  @Column({ type: 'varchar' })
  resourceType: string; // 'Show', 'FinanceRecord', etc.

  @Column()
  resourceId: string;

  @Column({ type: 'json', nullable: true })
  changes: Record<string, any>;

  @Column({ type: 'timestamptz' })
  createdAt: Date;
}

// analyticsService.ts - Efficient query
async getActivityByDay(orgId: string, days: number = 30) {
  const query = `
    SELECT
      date_trunc('day', created_at) as day,
      action,
      COUNT(*) as count
    FROM event_log
    WHERE organization_id = $1
      AND created_at > NOW() - INTERVAL '${days} days'
    GROUP BY day, action
    ORDER BY day DESC
  `;

  return this.eventLogRepository.query(query, [orgId]);
}
```

**Why**: Composite indices make time-series queries O(log n)

---

### 8. Export: Streaming + Background Jobs Strategy

```typescript
// v1 (Session 1): Streaming
// analyticsService.ts
async streamCSV(
  orgId: string,
  filters: any,
  res: Response
) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="export.csv"');

  const query = this.buildExportQuery(orgId, filters);
  const stream = this.database.query(query);

  stream.pipe(res);
}

// v2 (Session 3+): Async with Jobs
// exportService.ts (future)
async requestExport(orgId: string, filters: any) {
  const job = await jobQueue.add('export', {
    orgId,
    filters,
    userId: req.context.userId
  });

  return { jobId: job.id, status: 'queued' };
}

// GET /api/analytics/export/:jobId
async getExportStatus(jobId: string) {
  const job = await jobQueue.getJob(jobId);

  if (job.isCompleted()) {
    return { status: 'ready', downloadUrl: `/downloads/${jobId}.csv` };
  }
  if (job.isFailed()) {
    return { status: 'failed', error: job.failedReason };
  }

  return { status: job.getState() };
}
```

---

### 9. Zero-Downtime Migration Strategy

**Problem**: Adding `organizationId NOT NULL` breaks existing data

**Solution**: Gradual backfill

```typescript
// Step 1: Create column (nullable)
// migration: AddOrganizationIdToShows.ts
@Column({ nullable: true })
organizationId?: string;

// Step 2: Deploy + backfill
// scripts/backfill-org.ts
async function backfillOrganizations() {
  const usersWithoutOrg = await userRepository.find({
    where: { organizationId: IsNull() }
  });

  for (const user of usersWithoutOrg) {
    // Create default org per user
    const org = await organizationService.create({
      name: `${user.name}'s Organization`,
      owner: user
    });

    user.organizationId = org.id;
    await userRepository.save(user);

    // Update all user's data
    await showRepository.update(
      { userId: user.id },
      { organizationId: org.id }
    );

    console.log(`✅ Backfilled ${user.email} → ${org.id}`);
  }
}

// Run: npm run backfill:org

// Step 3: After verification (1-2 days later)
// migration: MakeOrganizationIdNotNull.ts
ALTER TABLE shows ALTER COLUMN organization_id SET NOT NULL;
```

**Why Gradual**:

- No data loss
- Can rollback if needed
- Auditability

---

### 10. Testing: Organization Factory

```typescript
// tests/factories/organization.factory.ts
import { OrganizationService } from 'src/services/OrganizationService';

export async function createTestOrg(
  name: string = 'Test Org',
  overrides: Partial<Organization> = {}
) {
  return organizationService.create({
    name,
    slug: `test-${Date.now()}`,
    ...overrides
  });
}

export async function createMultiTenantScenario() {
  const org1 = await createTestOrg('Broadway Co');
  const org2 = await createTestOrg('Off-Broadway Ltd');

  const user1 = await createTestUser('alice@broadway.com', {
    organizationId: org1.id
  });
  const user2 = await createTestUser('bob@offbroadway.com', {
    organizationId: org2.id
  });

  return { org1, org2, user1, user2 };
}

// In tests:
it('should not leak data between orgs', async () => {
  const { org1, org2, user1, user2 } = await createMultiTenantScenario();

  const org1Shows = await showService.listForOrg(org1.id);
  const org2Shows = await showService.listForOrg(org2.id);

  expect(org1Shows).not.toContain(any show from org2);
});
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Session 1: Multi-Organization Foundation (3-4 hours)

**WITH CRITICAL SECURITY ENHANCEMENTS**

```
Time    Task
0:00    1. Update JWT generation (add organizationId + scope)
0:15    2. Update tenantMiddleware.ts (JWT-based extraction)
0:30    3. Create Organization entity (with slug validation)
1:00    4. Create migration (with CASCADE, soft delete)
1:15    5. Create OrganizationService (CRUD + backfill helpers)
1:45    6. Create scopeByOrg() utility (for DRY queries)
2:00    7. Implement orgRateLimiter middleware
2:15    8. Update existing services (add scoping)
2:45    9. Create API endpoints (5 new)
3:15    10. Write comprehensive tests (with org factory)
3:45    11. Integration testing (multi-org isolation)
4:00    ✅ Commit & document
```

**Deliverables**:

- Organization entity & migration
- OrganizationService with CRUD
- Tenant middleware
- 5 new API endpoints
- 50+ tests

**Success Criteria**:

- ✅ Multiple orgs can be created
- ✅ Users can be assigned to orgs
- ✅ All queries properly scoped
- ✅ No cross-org data leaks
- ✅ All tests passing

---

### Session 1 Files to Create/Modify

**Security-First Approach**:

```typescript
// Step 1: Update JWT in auth.service.ts
// Before token generation, ensure:
const payload: JwtPayload = {
  sub: user.id,
  org: user.organizationId,  // ← ADDED
  role: user.role,
  permissions: calculatePermissions(user.role),  // ← ADDED
  scope: user.isSuperAdmin ? 'superadmin' : undefined
};

// Step 2: Replace tenantMiddleware.ts completely
// Use JWT payload instead of headers

// Step 3: Create scopeByOrg() in utils/
// Use in ALL service queries

// Step 4: Add orgRateLimiter to Express
app.use(tenantMiddleware);
app.use(orgRateLimiter);
app.use('/api', routes);

// Step 5: Organization entity validations
@BeforeInsert()
@BeforeUpdate()
validateAndSlugify() { ... }

// Step 6: All FK entities add @DeleteDateColumn()
```

**Expected Result After Session 1**:

- ✅ JWT-based tenant identification (no headers)
- ✅ Organization with unique slug
- ✅ Soft deletes + CASCADE
- ✅ DRY query scoping
- ✅ Rate limiting per org
- ✅ 100% multi-org isolation

---

### Session 2: Advanced Permissions (3-4 hours)

```
Time    Task
0:00    1. Create Role & Permission entities
0:30    2. Create migration
1:00    3. Create PermissionService
1:30    4. Implement authorization middleware
2:00    5. Add role assignment APIs
2:30    6. Add permission checking
3:00    7. Write tests
3:45    8. Integration testing
4:00    ✅ Commit & document
```

**Deliverables**:

- Role & Permission entities
- PermissionService with methods
- Authorization middleware
- 4 new API endpoints
- 60+ tests

**Success Criteria**:

- ✅ Roles properly assigned
- ✅ Permissions enforced
- ✅ Unauthorized access blocked
- ✅ All tests passing

---

### Session 3: Analytics & Reporting (3-4 hours)

```
Time    Task
0:00    1. Create EventLog entity
0:30    2. Create migration
1:00    3. Create AnalyticsService
1:30    4. Add audit middleware
2:00    5. Create export functionality
2:30    6. Create analytics endpoints (6 new)
3:00    7. Write tests
3:45    8. Integration testing
4:00    ✅ Commit & document
```

**Deliverables**:

- EventLog entity
- AnalyticsService with aggregations
- 6 analytics endpoints
- Export functionality
- 50+ tests

**Success Criteria**:

- ✅ Events properly logged
- ✅ Metrics accurately calculated
- ✅ Export works for CSV/JSON
- ✅ All tests passing

---

### Session 4: Documentation & Finalization (2-3 hours)

```
Time    Task
0:00    1. Update Swagger with new endpoints (20+ endpoints)
0:45    2. Create API_REFERENCE update
1:30    3. Create FASE_7_COMPLETE.md
2:00    4. Final testing & validation
2:30    5. Git commits & cleanup
3:00    ✅ FASE 7 COMPLETE
```

**Deliverables**:

- Updated API documentation (OpenAPI)
- Complete reference guide
- Session summary

---

## 📈 EXPECTED OUTCOMES

### Code Statistics

```
New Code:       3,500+ lines
New Tests:      1,000+ lines
Total FASE 7:   4,500+ lines

Files Created:  20+ files
Files Modified: 15+ files
Migrations:     3 new

Total Project After FASE 7:
  Backend Code: 13,000+ lines
  Tests:        1,200+ lines
  Coverage:     95%+ critical paths
```

### Endpoints

```
New Endpoints Added:      15
  Organizations:     5
  Permissions:       4
  Analytics:         6

Total Project Endpoints:  56 (41 + 15)
All Endpoints:           Documented in OpenAPI
```

### Test Coverage

```
New Tests:        100+
Total Tests:      335+ (235 + 100)
Pass Rate:        100% ✅
Coverage:         95%+ of critical paths
```

---

## ✅ PRE-REQUISITES CHECKLIST

Before starting FASE 7, verify:

```
Database:
  ✅ PostgreSQL running locally
  ✅ FASE 6 migrations applied
  ✅ Connection working

Backend:
  ✅ Node.js 20 LTS installed
  ✅ npm run build passes (0 errors)
  ✅ npm run test:run passes (235+ tests)

Environment:
  ✅ .env configured
  ✅ Port 3000 available
  ✅ Git repo ready

Documentation:
  ✅ Read FASE_6_FINAL_COMPLETION_SUMMARY.md
  ✅ Understand current architecture
  ✅ Review API_REFERENCE.md (41 endpoints)
```

---

## 🎯 SUCCESS CRITERIA

### During Development

```
✅ Code compiles (0 errors)
✅ Tests pass (100% pass rate)
✅ No type errors
✅ ESLint clean
✅ Code coverage maintained (95%+)
```

### End of FASE 7

```
✅ Multi-org fully working
✅ Permissions enforced
✅ Analytics operational
✅ 100+ new tests passing
✅ 56 endpoints documented
✅ 0 production issues
✅ Ready for FASE 8
```

---

## 📚 REFERENCE DOCUMENTS

### Completed

- `FASE_6_FINAL_COMPLETION_SUMMARY.md` - What was built in FASE 6
- `API_REFERENCE.md` - Current 41 endpoints
- `WEEK_4_REALTIME_COMPLETE.md` - WebSocket implementation
- `FASE_6_WEEK_3_EXECUTIVE_SUMMARY.md` - Integrations

### For FASE 7

- This document - Quick start & roadmap
- Architecture diagrams (will create during implementation)
- Entity relationship diagram (will create)
- Permission matrix (referenced above)

---

## 🚀 GETTING STARTED RIGHT NOW

### Immediate Actions

```bash
# 1. Verify FASE 6 complete
npm run test:run        # Should show 235+ passing

# 2. Check the code
git log --oneline       # Review FASE 6 commits

# 3. Read the architecture
cat API_REFERENCE.md | head -100

# 4. Start planning entities
# Draw: Organization, Role, Permission entities
# Plan: How they relate to existing entities
```

### Today (Session Start)

1. ✅ Read this document completely
2. ✅ Review FASE_6_FINAL_COMPLETION_SUMMARY.md
3. ✅ Create Organization entity
4. ✅ Create migration
5. ✅ Run migration
6. ✅ First commit: "FASE 7 Session 1: Organization entity"

### This Week

```
Session 1 (3-4h): Multi-org foundation
Session 2 (3-4h): Permissions system
Session 3 (3-4h): Analytics
Session 4 (2-3h): Documentation

Total: 12-15 hours (fits in 2-3 days of focused work)
```

---

## 💡 KEY TIPS FOR SUCCESS

### 1. Database Migrations

```typescript
// Always create migration AFTER entity
// This ensures proper schema evolution

// Create entity
// Then: npx typeorm migration:create

// Commit: Entity + Migration together
```

### 2. Scoping Queries

```typescript
// Always scope by organizationId in WHERE clause
// This prevents cross-org data leaks

const shows = await showRepository.find({
  where: {
    organizationId: req.context.organizationId,
  },
});
```

### 3. Testing Multi-Org

```typescript
// Create separate orgs in tests
const org1 = await createOrganization('Org 1');
const org2 = await createOrganization('Org 2');

// Create data in different orgs
const show1 = await createShow(org1.id);
const show2 = await createShow(org2.id);

// Verify isolation
// Org 1 queries should NOT return Org 2 data
```

### 4. Commit Strategy

```
Commit 1: Add Organization entity + migration
Commit 2: Add Role & Permission entities
Commit 3: Update existing entities with FK
Commit 4: Create services
Commit 5: Create middleware
Commit 6: Create API endpoints
Commit 7: Add tests
Commit 8: Documentation

Keep commits focused and logical
```

---

## 📞 TROUBLESHOOTING

### Common Issues

**Issue**: "Missing organization ID in request"

```
Solution: Ensure tenant middleware is applied before routes
Check: middleware/index.ts registers tenantMiddleware
```

**Issue**: "Query returns data from different organizations"

```
Solution: Check WHERE clause includes organizationId
Review: All service methods add org scoping
```

**Issue**: "Tests failing with permission denied"

```
Solution: Ensure test user has required role
Check: Test setup assigns roles before API calls
```

---

## 🔒 DEPLOYMENT & AUDIT STRATEGY

### Zero-Downtime Checklist

Before deploying Session 1 to production:

```
PHASE 1: Preparation (Thursday)
  ☐ Add JWT claim generation logic (backward compatible)
  ☐ Deploy with nullable organizationId columns
  ☐ Enable dual-path: header-based (old) + JWT (new)
  ☐ Start backfilling in background

PHASE 2: Verification (Friday)
  ☐ Verify all backfills completed
  ☐ Smoke test multi-org scenarios
  ☐ Check tenant isolation in staging
  ☐ Load testing with multiple orgs

PHASE 3: Cutover (Monday)
  ☐ Make organizationId NOT NULL
  ☐ Remove header-based fallback
  ☐ Enable rate limiter
  ☐ Monitor for errors (24h)

ROLLBACK PLAN (If issues):
  ☐ Revert to header-based auth
  ☐ Add nullable column back
  ☐ Run backfill reversal script
  ☐ No data loss (soft delete strategy)
```

### Audit & Monitoring

```typescript
// Log all org operations
eventLog.action === 'organization.created'
eventLog.action === 'organization.deleted'
eventLog.action === 'user.org.assigned'
eventLog.action === 'auth.superadmin.used'

// Monitor these metrics:
- Requests per org over time
- Rate limit violations
- Tenant isolation breaches (should be 0)
- Backfill progress
- JWT decode errors
```

---

## 🚨 COMMON PITFALLS TO AVOID

### ❌ Mistake 1: Querying without org scope

```typescript
// ❌ DANGEROUS
const shows = await showRepository.find();

// ✅ CORRECT
const shows = await showRepository.find({
  where: { organizationId: req.context.organizationId },
});

// 🚀 BEST (using utility)
const shows = await this.scopeByOrg(
  this.showRepository.createQueryBuilder('show'),
  req.context.organizationId
).getMany();
```

### ❌ Mistake 2: Forgetting CASCADE on delete

```typescript
// ❌ DANGEROUS
@OneToMany(() => Show, show => show.organization)
shows: Show[];

// ✅ CORRECT
@OneToMany(() => Show, show => show.organization, {
  onDelete: 'CASCADE'  // ← Auto-delete child records
})
shows: Show[];
```

### ❌ Mistake 3: Hardcoding organization in tests

```typescript
// ❌ DANGEROUS
const show = await showService.create({
  title: 'Test Show',
  organizationId: 'hardcoded-org-id',
});

// ✅ CORRECT
const testOrg = await createTestOrg('Test');
const show = await showService.create({
  title: 'Test Show',
  organizationId: testOrg.id,
});
```

### ❌ Mistake 4: Allowing org change via API

```typescript
// ❌ DANGEROUS
PUT /api/shows/:id
{
  title: 'New Title',
  organizationId: 'hacker-org-id'  // ← Can change org!
}

// ✅ CORRECT
Immutable: organizationId comes from JWT, cannot change
PUT /api/shows/:id
{
  title: 'New Title'
  // organizationId is determined by auth context
}
```

### ❌ Mistake 5: Not validating slug uniqueness

```typescript
// ❌ DANGEROUS
async createOrganization(name: string) {
  return this.orgRepository.create({
    name,
    slug: name.toLowerCase()
  }).save();
  // Fails if duplicate slug exists (but no index!)
}

// ✅ CORRECT
@Column({ unique: true, index: true })
slug: string;

// With validation
@BeforeInsert()
validateSlug() {
  if (this.slug !== this.slugify(this.name)) {
    throw new Error('Invalid slug');
  }
}
```

---

## 📊 SUCCESS METRICS FOR FASE 7

### Code Quality (Verify After Session 1)

```
✅ 0 TypeScript errors
✅ npm run test:run passes (all tests)
✅ No unused imports
✅ ESLint clean
✅ No console.log in production code
✅ Proper error handling (try/catch)
```

### Security Metrics

```
✅ All org-scoped queries use scopeByOrg()
✅ No org ID in headers (only JWT)
✅ Rate limiter active for all orgs
✅ Soft deletes implemented
✅ CASCADE deletes configured
```

### Multi-Tenant Isolation

```
✅ Org A cannot see Org B data
✅ Org A cannot modify Org B records
✅ User A in Org A cannot access Org B APIs
✅ Superadmin can access any org (logged)
✅ Rate limits per org (not global)
```

### Testing Coverage

```
✅ 50+ organization tests
✅ 30+ multi-tenant isolation tests
✅ 20+ permission tests
✅ 100% critical path coverage
✅ All edge cases covered
```

---

╔═══════════════════════════════════════════════════════════════════════════╗
║ ║
║ ✨ ENTERPRISE-GRADE FASE 7 - PRODUCTION READY! ✨ ║
║ ║
║ Duration: 2-3 weeks (12-15 hours) ║
║ Output: 4,500+ LOC + Security ║
║ Status: 🚀 Ready to Execute ║
║ ║
║ Key Differences from v1: ║
║ • JWT-based tenant identification (not headers) ║
║ • Organization slug validation ║
║ • Soft deletes + CASCADE ║
║ • DRY query scoping utility ║
║ • Rate limiting per organization ║
║ • Zero-downtime deployment strategy ║
║ • Comprehensive audit logging ║
║ • Production-hardened from day 1 ║
║ ║
║ Next: Begin Session 1 (3-4 hours) ║
║ ║
╚═══════════════════════════════════════════════════════════════════════════╝

**Document Created**: November 5, 2025  
**Status**: Ready for implementation  
**Next**: Create Organization entity & start Session 1

🎯 **Begin with**: Priority 1 - Multi-Organization Architecture
