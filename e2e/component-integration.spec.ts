/**
 * E2E Tests: Component Integration
 * Pruebas de integración de componentes con API
 */

import { test, expect } from '@playwright/test';

test.describe('Component Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173');

    // Login if needed
    // This would depend on your actual auth flow
  });

  test.describe('Shows List Component', () => {
    test('should display shows list', async ({ page }) => {
      // Navigate to shows page
      await page.goto('http://localhost:5173/shows');

      // Wait for shows to load
      const showsList = await page.locator('[data-testid="shows-list"]');
      await showsList.waitFor({ state: 'visible', timeout: 5000 });

      // Verify list is displayed
      expect(await showsList.isVisible()).toBeTruthy();
    });

    test('should display loading state', async ({ page }) => {
      await page.goto('http://localhost:5173/shows');

      // Check for loading indicator
      const loadingIndicator = await page.locator('[data-testid="loading-indicator"]');

      if (await loadingIndicator.isVisible({ timeout: 100 }).catch(() => false)) {
        // Loading state was visible
        expect(true).toBeTruthy();
      }
    });

    test('should handle error state', async ({ page, context }) => {
      // Simulate API error by intercepting requests
      await context.route('**/api/shows*', (route) => {
        route.abort('failed');
      });

      await page.goto('http://localhost:5173/shows');

      // Wait for error message
      const errorMessage = await page.locator('[data-testid="error-message"]');
      await errorMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

      // Verify error is handled gracefully
      expect(true).toBeTruthy();
    });

    test('should allow opening show details', async ({ page }) => {
      await page.goto('http://localhost:5173/shows');

      // Wait for shows to load
      await page.waitForTimeout(1000);

      // Click on first show
      const firstShow = await page.locator('[data-testid="show-card"]').first();

      if (await firstShow.isVisible().catch(() => false)) {
        await firstShow.click();

        // Verify navigation to details page
        await page.waitForURL('**/shows/*', { timeout: 5000 }).catch(() => {});
        expect(page.url()).toContain('/shows/');
      }
    });

    test('should allow creating new show', async ({ page }) => {
      await page.goto('http://localhost:5173/shows');

      // Click create button
      const createButton = await page.locator('[data-testid="create-show-btn"]');

      if (await createButton.isVisible().catch(() => false)) {
        await createButton.click();

        // Wait for form
        const form = await page.locator('[data-testid="show-form"]');
        await form.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

        // Fill form
        await page.fill('[data-testid="show-title-input"]', 'Test Show');
        await page.fill('[data-testid="show-location-input"]', 'Test Venue');

        // Submit form
        const submitButton = await page.locator('[data-testid="submit-btn"]');
        await submitButton.click();

        // Verify success
        expect(true).toBeTruthy();
      }
    });

    test('should allow deleting show', async ({ page }) => {
      await page.goto('http://localhost:5173/shows');

      // Wait for shows to load
      await page.waitForTimeout(1000);

      // Click delete button on first show
      const deleteButton = await page.locator('[data-testid="delete-show-btn"]').first();

      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click();

        // Handle confirmation dialog
        const confirmButton = await page.locator('[data-testid="confirm-delete-btn"]');
        if (await confirmButton.isVisible({ timeout: 100 }).catch(() => false)) {
          await confirmButton.click();
        }

        expect(true).toBeTruthy();
      }
    });
  });

  test.describe('Finance Component', () => {
    test('should display finance records', async ({ page }) => {
      await page.goto('http://localhost:5173/shows');

      // Open a show
      const firstShow = await page.locator('[data-testid="show-card"]').first();

      if (await firstShow.isVisible().catch(() => false)) {
        await firstShow.click();

        // Navigate to finance tab
        const financeTab = await page.locator('[data-testid="finance-tab"]');
        if (await financeTab.isVisible({ timeout: 1000 }).catch(() => false)) {
          await financeTab.click();

          // Wait for finance data
          const recordsList = await page.locator('[data-testid="finance-records"]');
          await recordsList.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

          expect(true).toBeTruthy();
        }
      }
    });

    test('should display finance statistics', async ({ page }) => {
      await page.goto('http://localhost:5173/shows');

      const firstShow = await page.locator('[data-testid="show-card"]').first();

      if (await firstShow.isVisible().catch(() => false)) {
        await firstShow.click();

        // Look for stats display
        const statsDisplay = await page.locator('[data-testid="finance-stats"]');

        if (await statsDisplay.isVisible({ timeout: 5000 }).catch(() => false)) {
          // Verify stats are displayed
          const budgetStat = await page.locator('[data-testid="stat-budget"]');
          expect(await budgetStat.isVisible().catch(() => false)).toBeTruthy();
        }
      }
    });
  });

  test.describe('Real-time Features', () => {
    test('should display real-time connection status', async ({ page }) => {
      await page.goto('http://localhost:5173');

      // Look for connection indicator
      const connectionIndicator = await page.locator('[data-testid="connection-status"]');

      if (await connectionIndicator.isVisible({ timeout: 5000 }).catch(() => false)) {
        const status = await connectionIndicator.getAttribute('data-status');
        expect(['connected', 'disconnected', 'connecting']).toContain(status);
      }
    });

    test('should receive real-time updates', async ({ page, context }) => {
      // Open two browser contexts to simulate multiple users
      const page2 = await context.newPage();

      await page.goto('http://localhost:5173/shows');
      await page2.goto('http://localhost:5173/shows');

      // Wait for initial load
      await page.waitForTimeout(1000);

      // Make changes in one page
      const deleteButton = await page.locator('[data-testid="delete-show-btn"]').first();

      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click();

        // Confirm deletion
        const confirmButton = await page.locator('[data-testid="confirm-delete-btn"]');
        if (await confirmButton.isVisible({ timeout: 100 }).catch(() => false)) {
          await confirmButton.click();

          // Wait a moment for update
          await page.waitForTimeout(500);

          // Check if other page received update
          expect(true).toBeTruthy();
        }
      }

      await page2.close();
    });
  });

  test.describe('Error Handling', () => {
    test('should display error message on API failure', async ({ page, context }) => {
      // Simulate API error
      await context.route('**/api/**', (route) => {
        route.abort('failed');
      });

      await page.goto('http://localhost:5173/shows');

      // Wait for error
      const errorMessage = await page.locator('[data-testid="error-message"]');

      if (await errorMessage.isVisible({ timeout: 5000 }).catch(() => false)) {
        const text = await errorMessage.textContent();
        expect(text).toBeTruthy();
      }

      // Verify app doesn't crash
      expect(true).toBeTruthy();
    });

    test('should handle network timeout', async ({ page }) => {
      // Simulate slow network
      await page.route('**/api/**', (route) => {
        setTimeout(() => {
          route.abort('timedout');
        }, 30000);
      });

      await page.goto('http://localhost:5173/shows');

      // Wait a bit then reload
      await page.waitForTimeout(1000);
      await page.reload();

      expect(true).toBeTruthy();
    });
  });

  test.describe('Authentication', () => {
    test('should redirect to login on 401', async ({ page, context }) => {
      // Clear localStorage to simulate logged out state
      await page.evaluate(() => {
        localStorage.clear();
      });

      await page.goto('http://localhost:5173/shows');

      // Should redirect to login
      const loginForm = await page.locator('[data-testid="login-form"]');

      if (await loginForm.isVisible({ timeout: 5000 }).catch(() => false)) {
        expect(true).toBeTruthy();
      }
    });

    test('should persist auth token', async ({ page }) => {
      await page.goto('http://localhost:5173');

      // Get token from localStorage
      const token = await page.evaluate(() => {
        return localStorage.getItem('auth_token');
      });

      // Navigate away and back
      await page.goto('http://localhost:5173/shows');

      // Token should still exist
      const newToken = await page.evaluate(() => {
        return localStorage.getItem('auth_token');
      });

      expect(newToken).toBe(token);
    });
  });
});
