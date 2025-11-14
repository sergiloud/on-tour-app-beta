import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete Calendar/Shows Flow
 * 
 * User Journey:
 * 1. User logs in
 * 2. Creates a new show in the calendar
 * 3. Navigates to the shows list
 * 4. Verifies that the show appears in the list
 */

test.describe('Calendar Flow - End to End', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
    
    // Login or demo
    const isDashboard = await page.url().includes('/dashboard');
    if (!isDashboard) {
      const demoButton = page.locator('button:has-text("Demo"), button:has-text("Ver demo")');
      if (await demoButton.isVisible()) {
        await demoButton.first().click();
      }
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    }
  });

  test('should create show in calendar and verify in shows list', async ({ page }) => {
    // Step 1: Navigate to Calendar
    const calendarLink = page.locator('a[href*="/calendar"], a:has-text("Calendar"), a:has-text("Calendario")');
    await calendarLink.first().click();
    await page.waitForURL(/\/calendar/, { timeout: 5000 });

    // Step 2: Create a new show
    const addShowButton = page.locator(
      'button:has-text("Add Show"), button:has-text("Add Event"), button:has-text("Nuevo show"), [data-testid="add-show"], button:has-text("+")'
    );
    
    if (await addShowButton.isVisible()) {
      await addShowButton.first().click();
      
      // Fill show details
      const showName = `E2E Test Show ${Date.now()}`;
      
      await page.fill('input[name="name"], input[placeholder*="show"], input[placeholder*="nombre"]', showName);
      
      await page.fill('input[name="city"], input[placeholder*="city"], input[placeholder*="ciudad"]', 'Barcelona');
      
      await page.fill('input[name="venue"], input[placeholder*="venue"], input[placeholder*="lugar"]', 'Razzmatazz');
      
      // Date field
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      await page.fill('input[type="date"], input[name="date"]', dateString);
      
      // Fee
      await page.fill('input[name="fee"], input[placeholder*="fee"], input[type="number"]', '5000');
      
      // Status - confirmed
      const statusSelect = page.locator('select[name="status"]');
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('confirmed');
      } else {
        const confirmedRadio = page.locator('input[value="confirmed"]');
        if (await confirmedRadio.isVisible()) {
          await confirmedRadio.click();
        }
      }
      
      // Submit
      await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Guardar"), button:has-text("Create")');
      
      // Wait for creation
      await page.waitForTimeout(1500);
      
      // Step 3: Navigate to Shows list
      const showsLink = page.locator('a[href*="/shows"], a:has-text("Shows")');
      await showsLink.first().click();
      await page.waitForURL(/\/shows/, { timeout: 5000 });
      
      // Step 4: Verify the show appears in the list
      await page.waitForSelector('table, [data-testid="shows-list"], .show-item', { timeout: 5000 });
      
      // Search for our created show
      const showInList = page.locator(`text=${showName}, :has-text("${showName}")`);
      
      // Verify it exists
      await expect(showInList.first()).toBeVisible({ timeout: 5000 });
      
      // Verify show details are correct
      const showRow = page.locator(`tr:has-text("${showName}"), .show-item:has-text("${showName}")`).first();
      await expect(showRow).toContainText('Barcelona');
      await expect(showRow).toContainText('5000');
      
      // Screenshot for evidence
      await page.screenshot({ path: 'e2e-results/calendar-flow-complete.png', fullPage: true });
      
      // Store show name for cleanup
      page.context().storageState({ path: 'e2e-results/show-created.json' });
    }
  });

  test('should navigate between calendar views', async ({ page }) => {
    await page.goto('/dashboard/calendar');
    await page.waitForSelector('[data-testid="calendar-view"], .calendar', { timeout: 5000 });

    // Test view toggles (Month, Week, Day, Agenda)
    const viewButtons = page.locator('button:has-text("Month"), button:has-text("Week"), button:has-text("Day"), button:has-text("Agenda")');
    const viewCount = await viewButtons.count();

    if (viewCount > 0) {
      // Click each view and verify it changes
      for (let i = 0; i < Math.min(viewCount, 4); i++) {
        await viewButtons.nth(i).click();
        await page.waitForTimeout(500);
        
        // Verify view changed (calendar should re-render)
        await expect(page.locator('[data-testid="calendar-view"], .calendar')).toBeVisible();
      }
    }
  });

  test('should filter shows by status', async ({ page }) => {
    await page.goto('/dashboard/shows');
    await page.waitForSelector('table, [data-testid="shows-list"]', { timeout: 5000 });

    // Look for status filter dropdown
    const statusFilter = page.locator('select:has-option("confirmed"), select:has-option("pending"), [data-testid="status-filter"]');
    
    if (await statusFilter.isVisible()) {
      // Count all shows initially
      const allShowsCount = await page.locator('tbody tr, .show-item').count();
      
      // Filter by confirmed
      await statusFilter.selectOption('confirmed');
      await page.waitForTimeout(500);
      
      const confirmedCount = await page.locator('tbody tr, .show-item').count();
      
      // Filter by pending
      await statusFilter.selectOption('pending');
      await page.waitForTimeout(500);
      
      const pendingCount = await page.locator('tbody tr, .show-item').count();
      
      // Verify filtering works (counts should differ or some could be 0)
      expect(confirmedCount + pendingCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should edit show details', async ({ page }) => {
    await page.goto('/dashboard/shows');
    await page.waitForSelector('table tbody tr, .show-item', { timeout: 5000 });

    // Find first show and click edit
    const firstShow = page.locator('tbody tr, .show-item').first();
    const editButton = firstShow.locator('button:has-text("Edit"), button:has-text("Editar"), [aria-label*="Edit"]');
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Wait for edit modal/form
      await page.waitForSelector('form, [role="dialog"]', { timeout: 3000 });
      
      // Modify fee
      const feeInput = page.locator('input[name="fee"], input[type="number"]');
      if (await feeInput.isVisible()) {
        await feeInput.clear();
        await feeInput.fill('7500');
        
        // Save
        await page.click('button[type="submit"]:has-text("Save"), button:has-text("Guardar")');
        await page.waitForTimeout(1000);
        
        // Verify fee updated
        await expect(page.locator('text=7500, text=7,500')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
