# FASE 7 Session 2 - Permissions System Checklist

**Status**: IN PROGRESS  
**Duration**: ~2-3 hours (estimated)  
**Objective**: Build granular permission-based access control for multi-tenant platform

---

## Timeline & Deliverables

### Step 1: Permission Entity & Migration (0:00-0:30)

**Objective**: Create database schema for permissions

- [ ] Create `backend/src/database/entities/Permission.ts`
  - id: UUID (Primary Key)
  - code: string (Unique, e.g., "orgs:read", "users:write")
  - name: string (Human-readable)
  - description: string (What it allows)
  - createdAt, updatedAt (Audit)
- [ ] Create `backend/src/database/entities/RolePermission.ts`
  - id: UUID
  - roleId: string (FK to Role)
  - permissionId: UUID (FK to Permission)
  - Composite unique index: (roleId, permissionId)

- [ ] Create migration: `CreatePermissionsTable.ts`
  - permissions table with indices
  - role_permissions join table

- [ ] Update datasource to register entities

**Build Target**: 0 errors

---

### Step 2: RolePermissionService (0:30-1:00)

**Objective**: Service layer for permission management

- [ ] Create `backend/src/services/RolePermissionService.ts`
  - Methods:
    - assignPermissionsToRole(roleId, permissionCodes)
    - removePermissionFromRole(roleId, permissionCode)
    - getPermissionsForRole(roleId): string[] (returns permission codes)
    - checkPermission(userId, permissionCode): boolean
    - hasAllPermissions(userId, permissionCodes): boolean
    - hasAnyPermission(userId, permissionCodes): boolean
    - seedDefaultPermissions()

- [ ] Permission codes (RBAC model):
  - orgs:create, orgs:read, orgs:update, orgs:delete
  - users:create, users:read, users:update, users:delete
  - reports:create, reports:read, reports:update, reports:delete
  - settings:update, settings:read
  - admin:access (superadmin only)

- [ ] Error handling with logging

**Build Target**: 0 errors

---

### Step 3: Permission Middleware (1:00-1:30)

**Objective**: Route-level permission enforcement

- [ ] Create `backend/src/middleware/permissionMiddleware.ts`
  - requirePermission(permissionCode): Middleware factory
  - requireAnyPermission(...codes): Middleware factory
  - requireAllPermissions(...codes): Middleware factory

- [ ] Integration with existing middleware stack:
  - authMiddleware → tenantMiddleware → permissionMiddleware → routes

- [ ] Error responses:
  - 403 Forbidden (insufficient permissions)
  - Log unauthorized attempts

**Build Target**: 0 errors

---

### Step 4: Permission API Endpoints (1:30-2:00)

**Objective**: CRUD operations for permissions

- [ ] Create `backend/src/routes/permissions.ts`

**Endpoints**:

- GET /api/permissions - List all permissions
- GET /api/roles/:roleId/permissions - Get role permissions
- POST /api/roles/:roleId/permissions - Assign permissions to role
- DELETE /api/roles/:roleId/permissions/:permissionCode - Remove permission
- POST /api/permissions/check - Check user permission

**Security**: Admin/superadmin only for modifications

**Build Target**: 0 errors

---

### Step 5: Permission Tests (2:00-2:30)

**Objective**: Comprehensive test coverage

- [ ] Create `backend/src/__tests__/permissions.test.ts`
  - Permission assignment/removal
  - Permission checks (single, any, all)
  - Role hierarchy
  - Superadmin elevated access
  - Cross-tenant permission isolation

- [ ] Create `backend/src/__tests__/permission-middleware.test.ts`
  - Middleware enforcement
  - 403 responses for insufficient permissions
  - Permission checking logic
  - Superadmin bypass

**Target**: 300+ lines of tests

**Build Target**: 0 errors

---

### Step 6: Documentation & Verification (2:30-3:00)

**Objective**: Document and verify implementation

- [ ] Create `docs/FASE_7_SESSION_2_COMPLETE.md`
  - Permission model overview
  - RBAC hierarchy
  - Usage examples
  - Integration points

- [ ] Final build verification
- [ ] Git commits for each step
- [ ] All tests passing

**Build Target**: 0 errors

---

## Architecture Overview

### Permission Model

```
User
  ├── Role (admin, user, superadmin)
  └── Permissions (through Role)
      ├── orgs:read, orgs:write, orgs:delete
      ├── users:read, users:write, users:delete
      ├── reports:read, reports:write
      └── settings:read, settings:write

Middleware Stack:
  authMiddleware
    ↓
  tenantMiddleware (extract org)
    ↓
  permissionMiddleware (check permission)
    ↓
  Route Handler
```

### Permission Codes (RBAC)

| Resource | Operations                   |
| -------- | ---------------------------- |
| orgs     | create, read, update, delete |
| users    | create, read, update, delete |
| reports  | create, read, update, delete |
| settings | read, update                 |
| admin    | access (superadmin only)     |

---

## Success Criteria

- ✅ Permission entity created with migration
- ✅ RolePermissionService with all methods
- ✅ Permission middleware integrated
- ✅ 5 API endpoints functional
- ✅ 300+ lines of tests
- ✅ 0 TypeScript errors
- ✅ Clean git history (6 commits)
- ✅ All tests passing

---

## Estimated Output

- **Code Generated**: 1,200-1,500 lines
- **Tests**: 300-400 lines
- **Files Created**: 6-8
- **Time**: 2-3 hours
- **Git Commits**: 6
- **Build Status**: ✅ 0 errors

---

## Notes

- Leverage existing JWT payload (already has permissions field)
- Use existing tenantMiddleware for context
- Follow same patterns as Organization CRUD
- Ensure superadmin has all permissions
- Permission checks should happen after tenant verification
- Soft deletes not needed for permissions (they're system-level)

---

**Start Time**: Now  
**Target Completion**: Next 2-3 hours  
**Integration Ready**: Multi-tenant foundation from Session 1
