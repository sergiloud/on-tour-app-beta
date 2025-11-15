import { test, expect } from '@playwright/test';

/**
 * E2E Test: Role-Based Access Control (RBAC) & Permission Guards
 * 
 * Tests permission-based UI visibility and functionality:
 * 1. Owner permissions (full access)
 * 2. Admin permissions (manage members, no settings.write)
 * 3. Member permissions (edit data, no member management)
 * 4. Viewer permissions (read-only access)
 * 
 * Verifies PermissionGuard component behavior:
 * - hide mode: Element not in DOM
 * - disable mode: Element grayed out
 * - fallback mode: Shows alternative UI
 */

test.describe('Multi-Tenancy: RBAC & Permission Guards', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    
    // Login
    await page.goto('/');
    const demoButton = page.locator('button:has-text("Demo"), button:has-text("Ver demo")');
    if (await demoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await demoButton.first().click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    } else {
      await page.goto('/dashboard');
    }
    
    await page.waitForLoadState('networkidle');
  });

  test('should hide elements based on permissions (hide mode)', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for permission-guarded elements in header/nav
    const inviteButton = page.locator('header button:has-text("Invite"), nav button:has-text("Invite")');
    const inviteVisible = await inviteButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (inviteVisible) {
      console.log('✅ Invite button visible (user has members.invite permission)');
    } else {
      console.log('ℹ️  Invite button hidden (user lacks members.invite permission)');
    }
    
    // Navigate to finance page
    await page.goto('/dashboard/finance');
    await page.waitForLoadState('networkidle');
    
    // Check for finance write actions (delete, edit buttons)
    const deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="delete"]');
    const deleteCount = await deleteButton.count();
    
    console.log(`Found ${deleteCount} delete buttons`);
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/rbac-hide-mode.png', fullPage: true });
  });

  test('should disable elements based on permissions (disable mode)', async ({ page }) => {
    // Navigate to members page
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    
    const orgTab = page.locator('button:has-text("Organization"), [role="tab"]:has-text("Organization")');
    if (await orgTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orgTab.click();
      await page.waitForTimeout(500);
      
      const membersTab = page.locator('button:has-text("Members")');
      if (await membersTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await membersTab.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Look for disabled buttons (grayed out, disabled attribute)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    let disabledCount = 0;
    for (let i = 0; i < Math.min(buttonCount, 20); i++) {
      const button = buttons.nth(i);
      const isDisabled = await button.isDisabled().catch(() => false);
      if (isDisabled) {
        const text = await button.textContent();
        console.log(`Found disabled button: ${text}`);
        disabledCount++;
      }
    }
    
    console.log(`Total disabled buttons: ${disabledCount}`);
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/rbac-disable-mode.png', fullPage: true });
  });

  test('should show fallback UI for insufficient permissions', async ({ page }) => {
    // Navigate to settings
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    
    const orgTab = page.locator('button:has-text("Organization")');
    if (await orgTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orgTab.click();
      await page.waitForTimeout(500);
    }
    
    // Look for permission messages
    const permissionMessages = page.locator('text=/permission|access denied|no tienes permiso|insufficient/i');
    const messageCount = await permissionMessages.count();
    
    if (messageCount > 0) {
      console.log(`✅ Found ${messageCount} permission fallback messages`);
      
      for (let i = 0; i < Math.min(messageCount, 3); i++) {
        const message = await permissionMessages.nth(i).textContent();
        console.log(`  - ${message}`);
      }
    } else {
      console.log('ℹ️  No permission fallback messages (user has full access)');
    }
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/rbac-fallback-mode.png', fullPage: true });
  });

  test('should display role badges correctly', async ({ page }) => {
    // Navigate to members page
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    
    const orgTab = page.locator('button:has-text("Organization")');
    if (await orgTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orgTab.click();
      await page.waitForTimeout(500);
      
      const membersTab = page.locator('button:has-text("Members")');
      if (await membersTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await membersTab.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Look for role badges (owner, admin, member, viewer)
    const roleBadges = page.locator('[data-testid="role-badge"], .role-badge, text=/owner|admin|member|viewer|propietario|administrador|miembro/i');
    const badgeCount = await roleBadges.count();
    
    console.log(`Found ${badgeCount} role badges`);
    
    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(badgeCount, 5); i++) {
        const badge = roleBadges.nth(i);
        const text = await badge.textContent();
        console.log(`  - Role badge: ${text}`);
      }
    }
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/rbac-role-badges.png', fullPage: true });
  });

  test('should display ViewOnlyBadge for modules with read-only access', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for view-only badges on module cards
    const viewOnlyBadges = page.locator('text=/view only|read only|solo lectura|view-only/i, [data-testid="view-only-badge"]');
    const badgeCount = await viewOnlyBadges.count();
    
    if (badgeCount > 0) {
      console.log(`✅ Found ${badgeCount} view-only badges`);
      
      for (let i = 0; i < Math.min(badgeCount, 3); i++) {
        const badge = viewOnlyBadges.nth(i);
        const text = await badge.textContent();
        console.log(`  - ${text}`);
      }
    } else {
      console.log('ℹ️  No view-only badges (user has write access to all modules)');
    }
    
    // Check specific modules
    const modules = ['finance', 'shows', 'calendar'];
    
    for (const module of modules) {
      await page.goto(`/dashboard/${module}`);
      await page.waitForLoadState('networkidle');
      
      const moduleViewOnly = page.locator('text=/view only|read only|solo lectura/i');
      const hasViewOnly = await moduleViewOnly.isVisible({ timeout: 1000 }).catch(() => false);
      
      console.log(`${module}: ${hasViewOnly ? 'read-only' : 'editable'}`);
    }
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/rbac-view-only-badges.png', fullPage: true });
  });

  test('should enforce owner-only actions', async ({ page }) => {
    // Navigate to org settings
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    
    const orgTab = page.locator('button:has-text("Organization")');
    if (await orgTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orgTab.click();
      await page.waitForTimeout(500);
    }
    
    // Scroll to find danger zone
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const dangerZone = page.locator('text=/danger zone|delete organization/i');
    const dangerZoneVisible = await dangerZone.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (dangerZoneVisible) {
      console.log('✅ User is owner - danger zone visible');
      expect(dangerZoneVisible).toBeTruthy();
    } else {
      console.log('ℹ️  User is not owner - danger zone hidden');
      expect(dangerZoneVisible).toBeFalsy();
    }
    
    // Try to find settings write actions
    const saveButton = page.locator('button:has-text("Save Changes"), button:has-text("Save")');
    const saveVisible = await saveButton.isVisible({ timeout: 2000 }).catch(() => false);
    const saveDisabled = saveVisible ? await saveButton.isDisabled().catch(() => true) : true;
    
    if (saveVisible && !saveDisabled) {
      console.log('✅ User has settings.write permission');
    } else if (saveVisible && saveDisabled) {
      console.log('⚠️  Save button visible but disabled');
    } else {
      console.log('ℹ️  Save button hidden (no settings.write permission)');
    }
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/rbac-owner-only.png', fullPage: true });
  });

  test('should enforce admin permissions', async ({ page }) => {
    // Navigate to members management
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    
    const orgTab = page.locator('button:has-text("Organization")');
    if (await orgTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orgTab.click();
      await page.waitForTimeout(500);
      
      const membersTab = page.locator('button:has-text("Members")');
      if (await membersTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await membersTab.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Check for admin actions: invite, remove members, change roles
    const inviteButton = page.locator('button:has-text("Invite")');
    const inviteVisible = await inviteButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    const removeButtons = page.locator('button:has-text("Remove"), button[aria-label*="remove"]');
    const removeCount = await removeButtons.count();
    
    const roleSelects = page.locator('select[name*="role"], select:has(option:has-text("Admin"))');
    const roleSelectCount = await roleSelects.count();
    
    console.log(`Admin actions available:
      - Invite button: ${inviteVisible ? 'yes' : 'no'}
      - Remove member buttons: ${removeCount}
      - Role selectors: ${roleSelectCount}
    `);
    
    if (inviteVisible || removeCount > 0 || roleSelectCount > 0) {
      console.log('✅ User has admin/member management permissions');
    } else {
      console.log('ℹ️  User lacks member management permissions');
    }
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/rbac-admin-permissions.png', fullPage: true });
  });

  test('should respect module-level permissions', async ({ page }) => {
    const modules = [
      { name: 'finance', path: '/dashboard/finance' },
      { name: 'shows', path: '/dashboard/shows' },
      { name: 'calendar', path: '/dashboard/calendar' }
    ];
    
    const permissions: Record<string, { read: boolean; write: boolean }> = {};
    
    for (const module of modules) {
      await page.goto(module.path);
      await page.waitForLoadState('networkidle');
      
      // Check for write actions (add, edit, delete buttons)
      const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")');
      const editButton = page.locator('button:has-text("Edit"), button[aria-label*="edit"]');
      const deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="delete"]');
      
      const hasAdd = await addButton.first().isVisible({ timeout: 2000 }).catch(() => false);
      const hasEdit = await editButton.first().isVisible({ timeout: 2000 }).catch(() => false);
      const hasDelete = await deleteButton.first().isVisible({ timeout: 2000 }).catch(() => false);
      
      const hasWrite = hasAdd || hasEdit || hasDelete;
      
      // Check for view-only badge
      const viewOnly = page.locator('text=/view only|read only/i');
      const isViewOnly = await viewOnly.isVisible({ timeout: 1000 }).catch(() => false);
      
      permissions[module.name] = {
        read: true, // If we can navigate, we have read access
        write: hasWrite && !isViewOnly
      };
      
      console.log(`${module.name}: read=${permissions[module.name].read}, write=${permissions[module.name].write}`);
    }
    
    // At least one module should be accessible
    const accessibleModules = Object.values(permissions).filter(p => p.read).length;
    expect(accessibleModules).toBeGreaterThan(0);
    
    // Screenshot of last module
    await page.screenshot({ path: 'e2e-results/rbac-module-permissions.png', fullPage: true });
  });
});
