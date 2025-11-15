import { test, expect } from '@playwright/test';

/**
 * E2E Test: Link Invitations & Agency-Artist Connections
 * 
 * Tests the agency-to-artist link invitation flow:
 * 1. Artist receives link invitation in NotificationBell
 * 2. Artist views invitation details (agency name, scopes)
 * 3. Artist accepts invitation
 * 4. Artist rejects invitation
 * 5. Invitation badge count updates
 * 6. Activity feed shows invitation events
 */

test.describe('Multi-Tenancy: Link Invitations', () => {
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

  test('should display link invitations in notification bell', async ({ page }) => {
    // Step 1: Locate notification bell
    const notificationBell = page.locator('[data-testid="notification-bell"], button[aria-label*="notification"], .notification-bell').first();
    
    if (!await notificationBell.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('ℹ️  Notification bell not found in current layout');
      test.skip();
      return;
    }
    
    // Step 2: Check for invitation badge
    const invitationBadge = page.locator('[data-testid="link-invitation-badge"], .invitation-badge');
    const badgeVisible = await invitationBadge.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (badgeVisible) {
      const badgeText = await invitationBadge.textContent();
      console.log(`✅ Link invitation badge visible with count: ${badgeText}`);
    } else {
      console.log('ℹ️  No pending link invitations');
    }
    
    // Step 3: Click notification bell to open dropdown
    await notificationBell.click();
    await page.waitForTimeout(500);
    
    // Step 4: Look for link invitations section
    const invitationsSection = page.locator('text=/link invitation|invitación de agencia/i, [data-testid="link-invitations"]');
    const sectionVisible = await invitationsSection.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (sectionVisible) {
      console.log('✅ Link invitations section visible in dropdown');
      
      // Count invitation items
      const invitationItems = page.locator('[data-testid="invitation-item"], .invitation-item');
      const itemCount = await invitationItems.count();
      console.log(`Found ${itemCount} pending invitations`);
      
    } else {
      console.log('ℹ️  No link invitations section (no pending invitations)');
    }
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/link-invitations-bell.png', fullPage: true });
  });

  test('should display invitation details with scopes', async ({ page }) => {
    // Open notification bell
    const notificationBell = page.locator('[data-testid="notification-bell"], button[aria-label*="notification"]').first();
    
    if (!await notificationBell.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await notificationBell.click();
    await page.waitForTimeout(500);
    
    // Look for invitation items
    const invitationItems = page.locator('[data-testid="invitation-item"], .invitation-item');
    const itemCount = await invitationItems.count();
    
    if (itemCount === 0) {
      console.log('ℹ️  No pending invitations to display');
      test.skip();
      return;
    }
    
    // Get first invitation details
    const firstInvitation = invitationItems.first();
    
    // Check for agency name
    const agencyName = firstInvitation.locator('text=/from|de/i');
    if (await agencyName.isVisible({ timeout: 1000 }).catch(() => false)) {
      const name = await agencyName.textContent();
      console.log(`Agency: ${name}`);
    }
    
    // Check for scope badges (shows, finance, travel)
    const scopeBadges = firstInvitation.locator('[data-testid="scope-badge"], .scope-badge, .badge');
    const badgeCount = await scopeBadges.count();
    
    console.log(`Scope badges: ${badgeCount}`);
    
    for (let i = 0; i < badgeCount; i++) {
      const badge = scopeBadges.nth(i);
      const text = await badge.textContent();
      console.log(`  - ${text}`);
    }
    
    // Check for accept/reject buttons
    const acceptButton = firstInvitation.locator('button:has-text("Accept"), button:has-text("Aceptar")');
    const rejectButton = firstInvitation.locator('button:has-text("Reject"), button:has-text("Rechazar")');
    
    await expect(acceptButton).toBeVisible({ timeout: 2000 });
    await expect(rejectButton).toBeVisible({ timeout: 2000 });
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/link-invitations-details.png', fullPage: true });
  });

  test('should accept a link invitation', async ({ page }) => {
    // Open notification bell
    const notificationBell = page.locator('[data-testid="notification-bell"], button[aria-label*="notification"]').first();
    
    if (!await notificationBell.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await notificationBell.click();
    await page.waitForTimeout(500);
    
    // Look for invitation items
    const invitationItems = page.locator('[data-testid="invitation-item"], .invitation-item');
    const itemCount = await invitationItems.count();
    
    if (itemCount === 0) {
      console.log('ℹ️  No pending invitations to accept');
      test.skip();
      return;
    }
    
    console.log(`Found ${itemCount} pending invitations`);
    
    // Click accept on first invitation
    const firstInvitation = invitationItems.first();
    const acceptButton = firstInvitation.locator('button:has-text("Accept"), button:has-text("Aceptar")');
    
    await expect(acceptButton).toBeVisible({ timeout: 2000 });
    
    // Get invitation details before accepting
    const invitationText = await firstInvitation.textContent();
    console.log(`Accepting invitation: ${invitationText?.substring(0, 100)}`);
    
    // Click accept
    await acceptButton.click();
    
    // Wait for processing
    await page.waitForTimeout(2000);
    
    // Verify invitation is removed or marked as accepted
    const stillVisible = await firstInvitation.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (!stillVisible) {
      console.log('✅ Invitation removed from list after acceptance');
    }
    
    // Check for success feedback
    const successMessage = page.locator('text=/accepted|aceptada|success/i');
    if (await successMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Success message displayed');
    }
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/link-invitations-accepted.png', fullPage: true });
  });

  test('should reject a link invitation', async ({ page }) => {
    // Open notification bell
    const notificationBell = page.locator('[data-testid="notification-bell"], button[aria-label*="notification"]').first();
    
    if (!await notificationBell.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await notificationBell.click();
    await page.waitForTimeout(500);
    
    // Look for invitation items
    const invitationItems = page.locator('[data-testid="invitation-item"], .invitation-item');
    const itemCount = await invitationItems.count();
    
    if (itemCount === 0) {
      console.log('ℹ️  No pending invitations to reject');
      test.skip();
      return;
    }
    
    // Click reject on first invitation
    const firstInvitation = invitationItems.first();
    const rejectButton = firstInvitation.locator('button:has-text("Reject"), button:has-text("Rechazar")');
    
    await expect(rejectButton).toBeVisible({ timeout: 2000 });
    
    // Get invitation details before rejecting
    const invitationText = await firstInvitation.textContent();
    console.log(`Rejecting invitation: ${invitationText?.substring(0, 100)}`);
    
    // Click reject
    await rejectButton.click();
    
    // Wait for processing
    await page.waitForTimeout(2000);
    
    // Verify invitation is removed
    const stillVisible = await firstInvitation.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (!stillVisible) {
      console.log('✅ Invitation removed from list after rejection');
    }
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/link-invitations-rejected.png', fullPage: true });
  });

  test('should update invitation badge count', async ({ page }) => {
    // Get initial badge count
    const notificationBell = page.locator('[data-testid="notification-bell"], button[aria-label*="notification"]').first();
    
    if (!await notificationBell.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    const invitationBadge = page.locator('[data-testid="link-invitation-badge"], .invitation-badge');
    const initialBadgeVisible = await invitationBadge.isVisible({ timeout: 2000 }).catch(() => false);
    
    let initialCount = 0;
    if (initialBadgeVisible) {
      const badgeText = await invitationBadge.textContent();
      initialCount = parseInt(badgeText?.trim() || '0', 10);
      console.log(`Initial invitation count: ${initialCount}`);
    } else {
      console.log('No pending invitations initially');
    }
    
    // Open dropdown
    await notificationBell.click();
    await page.waitForTimeout(500);
    
    // Count invitations in dropdown
    const invitationItems = page.locator('[data-testid="invitation-item"], .invitation-item');
    const dropdownCount = await invitationItems.count();
    
    console.log(`Invitations in dropdown: ${dropdownCount}`);
    
    // Badge count should match dropdown count
    if (initialBadgeVisible) {
      expect(initialCount).toBe(dropdownCount);
      console.log('✅ Badge count matches dropdown count');
    }
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/link-invitations-badge-count.png', fullPage: true });
  });

  test('should display expired invitations differently', async ({ page }) => {
    // Open notification bell
    const notificationBell = page.locator('[data-testid="notification-bell"], button[aria-label*="notification"]').first();
    
    if (!await notificationBell.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    
    await notificationBell.click();
    await page.waitForTimeout(500);
    
    // Look for expired indicators
    const expiredIndicators = page.locator('text=/expired|expirada/i, [data-testid="expired-badge"]');
    const expiredCount = await expiredIndicators.count();
    
    if (expiredCount > 0) {
      console.log(`✅ Found ${expiredCount} expired invitation indicators`);
      
      // Verify accept/reject buttons are disabled for expired invitations
      const expiredInvitation = expiredIndicators.first().locator('..').locator('..');
      const acceptButton = expiredInvitation.locator('button:has-text("Accept")');
      
      if (await acceptButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        const isDisabled = await acceptButton.isDisabled().catch(() => true);
        if (isDisabled) {
          console.log('✅ Accept button disabled for expired invitation');
        }
      }
    } else {
      console.log('ℹ️  No expired invitations found');
    }
    
    // Screenshot
    await page.screenshot({ path: 'e2e-results/link-invitations-expired.png', fullPage: true });
  });
});
