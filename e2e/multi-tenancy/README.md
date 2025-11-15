# Multi-Tenancy E2E Tests

End-to-end tests for the multi-tenancy organization management system using Playwright.

## Test Suites

### 1. Organization Management (`organization-management.spec.ts`)

Tests core organization functionality:

- ✅ **Organization Switching**: Switch between organizations from dropdown
- ✅ **Member Display**: View organization members list
- ✅ **Member Invitation**: Invite new members with role selection
- ✅ **Activity Feed**: Display real-time organization activity updates
- ✅ **Organization Settings**: Edit organization name, type, description
- ✅ **Danger Zone**: Delete organization (owner only)

**Test Coverage**: 7 tests

### 2. Permission Guards & RBAC (`permission-guards.spec.ts`)

Tests role-based access control and permission guards:

- ✅ **Hide Mode**: Elements hidden based on permissions
- ✅ **Disable Mode**: Elements grayed out for insufficient permissions
- ✅ **Fallback Mode**: Alternative UI for permission-restricted areas
- ✅ **Role Badges**: Display user roles (owner, admin, member, viewer)
- ✅ **ViewOnlyBadge**: Module-level read-only indicators
- ✅ **Owner-Only Actions**: Settings write and org delete (owner only)
- ✅ **Admin Permissions**: Member management (admin/owner only)
- ✅ **Module Permissions**: Finance/shows/calendar write access

**Test Coverage**: 8 tests

### 3. Link Invitations (`link-invitations.spec.ts`)

Tests agency-artist link invitation flow:

- ✅ **Notification Bell**: Display link invitations with badge count
- ✅ **Invitation Details**: Show agency name, scopes, and permissions
- ✅ **Accept Invitation**: Accept and establish agency-artist link
- ✅ **Reject Invitation**: Decline invitation
- ✅ **Badge Count Updates**: Real-time invitation count
- ✅ **Expired Invitations**: Display and handle expired invitations

**Test Coverage**: 6 tests

## Running Tests

### All Multi-Tenancy Tests

```bash
npm run test:e2e e2e/multi-tenancy
```

### Individual Test Suites

```bash
# Organization management
npm run test:e2e e2e/multi-tenancy/organization-management.spec.ts

# Permission guards & RBAC
npm run test:e2e e2e/multi-tenancy/permission-guards.spec.ts

# Link invitations
npm run test:e2e e2e/multi-tenancy/link-invitations.spec.ts
```

### Interactive UI Mode

```bash
npm run test:e2e e2e/multi-tenancy --ui
```

### Debug Mode

```bash
npm run test:e2e e2e/multi-tenancy --debug
```

### Headed Mode (Watch Browser)

```bash
npm run test:e2e e2e/multi-tenancy --headed
```

### Specific Test

```bash
npm run test:e2e --grep "should switch between organizations"
```

## Test Results

Results are saved to:

- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/junit.xml`
- **Screenshots**: `e2e-results/*.png`

View HTML report:

```bash
npx playwright show-report
```

## Test Data

Tests use demo data with multiple organizations:

- **Artist Organization**: Personal artist account
- **Agency Organization**: Agency managing multiple artists
- **Venue Organization**: Venue/promoter account

Each organization has different:
- Members with various roles (owner, admin, member, viewer)
- Permission configurations
- Link invitations (agency-artist connections)

## Permission Roles

Tests validate these roles:

| Role   | Permissions                                  |
|--------|----------------------------------------------|
| Owner  | Full access, settings.write, org.delete      |
| Admin  | Manage members, all data access, no settings |
| Member | Edit shows/finance, no member management     |
| Viewer | Read-only access to all modules              |

## Test Scenarios

### Organization Switching
1. Login to dashboard
2. Click organization switcher dropdown
3. Select different organization
4. Verify organization context updates
5. Verify data isolation (correct org data loads)

### Member Invitation
1. Navigate to Members page
2. Click "Invite Member" button
3. Enter email address
4. Select role (admin/member/viewer)
5. Send invitation
6. Verify invitation created
7. Check activity feed for event

### Permission Guards
1. Login with different role (owner/admin/member/viewer)
2. Navigate to protected areas
3. Verify UI elements visibility:
   - Hidden (removed from DOM)
   - Disabled (grayed out)
   - Fallback (alternative message)
4. Attempt restricted actions
5. Verify permission enforcement

### Link Invitations
1. Artist logs in
2. Open notification bell
3. View link invitation from agency
4. Check invitation details (scopes, permissions)
5. Accept or reject invitation
6. Verify invitation removed from list
7. Verify badge count updated

## CI/CD Integration

Tests run automatically on:

- ✅ Pull requests
- ✅ Pushes to main branch
- ✅ Pre-deployment checks

GitHub Actions workflow:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Failed Tests

### 1. View Screenshots

All tests capture screenshots on failure:

```bash
open e2e-results/
```

### 2. View Traces

Playwright captures traces on retry:

```bash
npx playwright show-trace test-results/.../trace.zip
```

### 3. Run in Debug Mode

```bash
npm run test:e2e e2e/multi-tenancy --debug
```

Step through tests line by line with Playwright Inspector.

### 4. Run in Headed Mode

```bash
npm run test:e2e e2e/multi-tenancy --headed --slowmo=1000
```

Watch browser execution with 1s delay between actions.

### 5. Check Console Logs

Tests include detailed console.log statements:

```typescript
console.log('Current organization:', currentOrgText);
console.log('✅ User has permission to edit');
console.log('ℹ️  No pending invitations');
```

## Best Practices

### Selectors

Use data-testid attributes for reliable selectors:

```tsx
<button data-testid="org-switcher">Organization Name</button>
```

```typescript
const orgSwitcher = page.locator('[data-testid="org-switcher"]');
```

### Timeouts

Use appropriate timeouts for different actions:

```typescript
// Short timeout for expected elements
await expect(button).toBeVisible({ timeout: 2000 });

// Longer timeout for navigation
await page.waitForURL(/\/dashboard/, { timeout: 10000 });

// Network-dependent actions
await page.waitForLoadState('networkidle');
```

### Assertions

Use meaningful assertions:

```typescript
// Good
expect(invitationCount).toBeGreaterThan(0);
expect(badgeText).toBe('3');

// Better with message
expect(dangerZoneVisible, 'Danger zone should be visible for owners').toBeTruthy();
```

### Screenshots

Capture screenshots at key points:

```typescript
await page.screenshot({ 
  path: 'e2e-results/multi-tenancy-org-switch.png',
  fullPage: true 
});
```

## Maintenance

### Updating Tests

When adding new features:

1. Add test cases to relevant spec file
2. Update this README with new scenarios
3. Add data-testid attributes to new components
4. Run tests locally before committing

### Test Flakiness

If tests are flaky:

1. Increase timeouts for slow operations
2. Add explicit waits: `await page.waitForTimeout(500)`
3. Use `waitForLoadState('networkidle')` after navigation
4. Check for race conditions
5. Use retries in CI: `retries: 2`

## Coverage

**Total E2E Tests**: 21 tests across 3 suites

**Coverage Areas**:
- ✅ Organization CRUD operations
- ✅ Member management (invite, remove, role changes)
- ✅ Permission guards (hide, disable, fallback modes)
- ✅ Role-based access control (owner, admin, member, viewer)
- ✅ Link invitations (send, accept, reject)
- ✅ Activity feed updates
- ✅ Organization settings editing
- ✅ Danger zone (delete organization)
- ✅ Real-time UI updates
- ✅ Data isolation between organizations

## Future Enhancements

Potential additions:

- [ ] Team management tests
- [ ] Bulk member invitation
- [ ] Permission customization
- [ ] Organization transfer (change owner)
- [ ] Multi-organization dashboard views
- [ ] Cross-organization data sharing
- [ ] API endpoint tests for multi-tenancy
- [ ] Performance tests (large orgs, many members)

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Multi-Tenancy Architecture](../../docs/MULTI_TENANCY_ARCHITECTURE.md)
- [Permission Guards Examples](../../src/examples/PermissionGuardsExamples.tsx)
- [Organization Context](../../src/context/OrganizationContext.tsx)
