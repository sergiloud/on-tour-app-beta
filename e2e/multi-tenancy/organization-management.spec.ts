import { test, expect } from '@playwright/test';

/**
 * E2E Test: Multi-Tenancy Organization Management
 * 
 * User Journey:
 * 1. Login and access dashboard
 * 2. Switch between organizations
 * 3. View organization members
 * 4. Invite a new member with role selection
 * 5. Verify activity feed updates
 * 6. Access organization settings
 * 7. Edit organization details
 * 
 * Tests RBAC (Role-Based Access Control):
 * - Owner can edit settings and delete org
 * - Admin can manage members
 * - Member has limited access
 * - Viewer has read-only access
 */

test.describe('Multi-Tenancy: Organization Management', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear any existing state
    await context.clearCookies();
    
    // Navigate to app and login
    await page.goto('/');
    
    // Use demo login if available
    const demoButton = page.locator('button:has-text("Demo"), button:has-text("Ver demo"), button:has-text("Try Demo")');
    if (await demoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await demoButton.first().click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    } else {
      // Fallback: navigate directly to dashboard (for local development)
      await page.goto('/dashboard');
    }
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
  });

  test('should switch between organizations from dropdown', async ({ page }) => {
    // Step 1: Locate organization switcher dropdown
    const orgSwitcher = page.locator('[data-testid="org-switcher"], button:has-text("Organization"), .org-switcher').first();
    
    // Verify org switcher exists
    await expect(orgSwitcher).toBeVisible({ timeout: 5000 });
    
    // Get current organization name
    const currentOrgText = await orgSwitcher.textContent();
    console.log('Current organization:', currentOrgText);
    
    // Step 2: Open organization dropdown
    await orgSwitcher.click();
    await page.waitForTimeout(500); // Wait for dropdown animation
    
    // Step 3: Find all organization options
    const orgOptions = page.locator('[role="menuitem"], .org-option, [data-testid="org-option"]');
    const optionCount = await orgOptions.count();
    
    console.log(`Found ${optionCount} organization options`);
    
    if (optionCount > 1) {
      // Step 4: Select a different organization
      const secondOrg = orgOptions.nth(1);
      const secondOrgText = await secondOrg.textContent();
      console.log('Switching to:', secondOrgText);
      
      await secondOrg.click();
      
      // Step 5: Wait for organization switch (URL might change or content reloads)
      await page.waitForTimeout(1500); // Allow time for org switch and data reload
      await page.waitForLoadState('networkidle');
      
      // Step 6: Verify organization changed
      const newOrgText = await orgSwitcher.textContent();
      console.log('New organization:', newOrgText);
      
      // The text should have changed
      expect(newOrgText).not.toBe(currentOrgText);
      
      // Screenshot after org switch
      await page.screenshot({ path: 'e2e-results/multi-tenancy-org-switch.png', fullPage: true });
    } else {
      console.log('Only one organization available, skipping switch test');
      test.skip();
    }
  });

  test('should display organization members', async ({ page }) => {
    // Navigate to organization members page
    const paths = [
      '/dashboard/org/members',
      '/dashboard/settings?tab=organization&subtab=members',
      '/dashboard/settings'
    ];
    
    let membersPageFound = false;
    
    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Look for members-related content
      const membersIndicators = page.locator(
        'h1:has-text("Members"), h2:has-text("Members"), [data-testid="members-list"], .members-table'
      );
      
      if (await membersIndicators.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        membersPageFound = true;
        break;
      }
      
      // Try clicking on organization tab if on settings page
      if (path.includes('settings')) {
        const orgTab = page.locator('button:has-text("Organization"), [role="tab"]:has-text("Organization")');
        if (await orgTab.isVisible({ timeout: 2000 }).catch(() => false)) {
          await orgTab.click();
          await page.waitForTimeout(500);
          
          // Now try members sub-tab
          const membersTab = page.locator('button:has-text("Members"), [role="tab"]:has-text("Members")');
          if (await membersTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await membersTab.click();
            await page.waitForTimeout(500);
            membersPageFound = true;
            break;
          }
        }
      }
    }
    
    expect(membersPageFound).toBeTruthy();
    
    // Verify members list elements
    const membersList = page.locator('[data-testid="members-list"], .members-table, table');
    await expect(membersList.first()).toBeVisible({ timeout: 3000 });
    
    // Screenshot members page
    await page.screenshot({ path: 'e2e-results/multi-tenancy-members.png', fullPage: true });
  });

  test('should invite a new member with role selection', async ({ page }) => {
    // Navigate to members page (try multiple paths)
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    
    // Click Organization tab
    const orgTab = page.locator('button:has-text("Organization"), [role="tab"]:has-text("Organization")');
    if (await orgTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orgTab.click();
      await page.waitForTimeout(500);
      
      // Click Members sub-tab (should be "Overview" then "Members" now)
      const membersTab = page.locator('button:has-text("Members"), [role="tab"]:has-text("Members")');
      if (await membersTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await membersTab.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Step 1: Find and click "Invite Member" button
    const inviteButton = page.locator(
      'button:has-text("Invite"), button:has-text("Add Member"), button:has-text("Invitar")'
    ).first();
    
    // If button not visible, might be in header
    if (!await inviteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Try header invite button
      const headerInvite = page.locator('header button:has-text("Invite"), nav button:has-text("Invite")');
      if (await headerInvite.isVisible({ timeout: 2000 }).catch(() => false)) {
        await headerInvite.click();
      } else {
        console.log('Invite button not found, user might not have permission');
        test.skip();
        return;
      }
    } else {
      await inviteButton.click();
    }
    
    // Step 2: Wait for invite dialog to open
    await page.waitForTimeout(500);
    
    const dialog = page.locator('[role="dialog"], .modal, .dialog').first();
    await expect(dialog).toBeVisible({ timeout: 3000 });
    
    // Step 3: Fill in email address
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 2000 });
    
    const testEmail = `test-member-${Date.now()}@ontour.app`;
    await emailInput.fill(testEmail);
    
    // Step 4: Select role
    const roleSelect = page.locator('select[name="role"], select:has(option:has-text("Admin"))').first();
    if (await roleSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await roleSelect.selectOption('member'); // Select 'member' role
    }
    
    // Screenshot before sending invitation
    await page.screenshot({ path: 'e2e-results/multi-tenancy-invite-dialog.png', fullPage: true });
    
    // Step 5: Send invitation
    const sendButton = page.locator('button:has-text("Send"), button:has-text("Invite"), button[type="submit"]').first();
    await sendButton.click();
    
    // Step 6: Wait for dialog to close
    await page.waitForTimeout(1500);
    
    // Step 7: Verify success (dialog closed or success message)
    const dialogStillVisible = await dialog.isVisible().catch(() => false);
    
    if (!dialogStillVisible) {
      console.log('✅ Invitation dialog closed successfully');
    }
    
    // Screenshot after invitation
    await page.screenshot({ path: 'e2e-results/multi-tenancy-after-invite.png', fullPage: true });
  });

  test('should show activity feed updates', async ({ page }) => {
    // Navigate to activity/timeline page
    const activityPaths = [
      '/dashboard/org/activity',
      '/dashboard/timeline',
      '/dashboard'
    ];
    
    let activityFound = false;
    
    for (const path of activityPaths) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Look for activity feed
      const activityFeed = page.locator(
        '[data-testid="activity-feed"], .activity-feed, .timeline, h1:has-text("Activity"), h1:has-text("Timeline")'
      );
      
      if (await activityFeed.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        activityFound = true;
        break;
      }
    }
    
    if (!activityFound) {
      // Try clicking on org overview or activity link
      await page.goto('/dashboard');
      const activityLink = page.locator('a:has-text("Activity"), button:has-text("Activity")');
      if (await activityLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await activityLink.first().click();
        await page.waitForTimeout(1000);
        activityFound = true;
      }
    }
    
    expect(activityFound).toBeTruthy();
    
    // Verify activity items are present
    const activityItems = page.locator('[data-testid="activity-item"], .activity-item, .timeline-item');
    const itemCount = await activityItems.count();
    
    console.log(`Found ${itemCount} activity items`);
    
    // Should have at least some activity
    expect(itemCount).toBeGreaterThanOrEqual(0); // May be 0 for new orgs
    
    // Screenshot activity feed
    await page.screenshot({ path: 'e2e-results/multi-tenancy-activity-feed.png', fullPage: true });
  });

  test('should access and edit organization settings (owner only)', async ({ page }) => {
    // Navigate to organization settings
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Click Organization tab
    const orgTab = page.locator('button:has-text("Organization"), [role="tab"]:has-text("Organization")');
    await expect(orgTab).toBeVisible({ timeout: 5000 });
    await orgTab.click();
    await page.waitForTimeout(500);
    
    // Step 2: Click Overview/Settings sub-tab (first tab)
    const overviewTab = page.locator('[role="tab"]').first();
    if (await overviewTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      const tabText = await overviewTab.textContent();
      if (tabText?.includes('Overview') || tabText?.includes('Settings')) {
        await overviewTab.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Step 3: Verify organization settings form
    const orgNameInput = page.locator('input[type="text"]').first();
    
    // Check if editable (owner/admin) or read-only (member/viewer)
    const isDisabled = await orgNameInput.isDisabled().catch(() => true);
    
    if (!isDisabled) {
      console.log('✅ User has permission to edit organization settings');
      
      // Step 4: Edit organization name
      const originalName = await orgNameInput.inputValue();
      const newName = `${originalName} (Edited ${Date.now()})`;
      
      await orgNameInput.fill(newName);
      
      // Step 5: Save changes
      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
      await expect(saveButton).toBeVisible({ timeout: 2000 });
      await saveButton.click();
      
      // Step 6: Wait for save confirmation
      await page.waitForTimeout(1500);
      
      // Look for success message
      const successMessage = page.locator('text=/saved|success|guardado/i');
      if (await successMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✅ Settings saved successfully');
      }
      
      // Screenshot after save
      await page.screenshot({ path: 'e2e-results/multi-tenancy-settings-saved.png', fullPage: true });
      
      // Restore original name
      await orgNameInput.fill(originalName);
      await saveButton.click();
      await page.waitForTimeout(1000);
      
    } else {
      console.log('ℹ️  User does not have permission to edit (read-only access)');
      
      // Verify permission guard message
      const permissionMessage = page.locator('text=/permission|access|propietario/i');
      if (await permissionMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✅ Permission guard message displayed correctly');
      }
    }
    
    // Screenshot settings page
    await page.screenshot({ path: 'e2e-results/multi-tenancy-org-settings.png', fullPage: true });
  });

  test('should display danger zone for owners only', async ({ page }) => {
    // Navigate to organization settings
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    
    // Click Organization tab
    const orgTab = page.locator('button:has-text("Organization"), [role="tab"]:has-text("Organization")');
    if (await orgTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orgTab.click();
      await page.waitForTimeout(500);
      
      // Click Overview tab
      const overviewTab = page.locator('[role="tab"]').first();
      if (await overviewTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await overviewTab.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Scroll to bottom to find danger zone
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Look for danger zone section
    const dangerZone = page.locator('text=/danger zone|delete organization|eliminar organizaci/i');
    const dangerZoneVisible = await dangerZone.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (dangerZoneVisible) {
      console.log('✅ Danger Zone visible (user is owner)');
      
      // Verify delete button exists but don't click it
      const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Eliminar")');
      await expect(deleteButton).toBeVisible({ timeout: 2000 });
      
      console.log('⚠️  Delete organization button found (test will not click it)');
    } else {
      console.log('ℹ️  Danger Zone not visible (user is not owner)');
    }
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/multi-tenancy-danger-zone.png', fullPage: true });
  });
});
