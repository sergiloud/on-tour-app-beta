import { test as base, expect, Page } from '@playwright/test';

/**
 * Authentication Fixtures for E2E Tests
 *
 * Provides:
 * - Pre-configured authenticated page
 * - Test user credentials
 * - Common login/logout operations
 *
 * Usage:
 * ```typescript
 * test('my test', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/dashboard');
 * });
 * ```
 */

// Test credentials
export const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
};

export const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
  },
  user: {
    email: 'test@example.com',
    password: 'password123',
  },
  viewer: {
    email: 'viewer@example.com',
    password: 'viewer123',
  },
};

/**
 * Helper to login on a page
 */
export async function loginAs(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login');

  // Wait for login form to be visible
  await expect(page.locator('[data-testid="login-form"]')).toBeVisible({
    timeout: 5000,
  });

  // Fill in credentials
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);

  // Submit form
  await page.click('[data-testid="login-submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });

  // Wait for dashboard to be ready
  await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Helper to logout from a page
 */
export async function logout(page: Page): Promise<void> {
  // Click user menu
  await page.click('[data-testid="user-menu-btn"]');

  // Click logout
  await page.click('[data-testid="logout-btn"]');

  // Wait for login page
  await page.waitForURL('/login', { timeout: 5000 });
}

/**
 * Fixture: Pre-authenticated page with test user
 */
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await use(page);
  },

  /**
   * Fixture: Page authenticated as admin
   */
  adminPage: async ({ page }, use) => {
    await loginAs(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await use(page);
  },

  /**
   * Fixture: Page authenticated as viewer (read-only)
   */
  viewerPage: async ({ page }, use) => {
    await loginAs(page, TEST_USERS.viewer.email, TEST_USERS.viewer.password);
    await use(page);
  },
});

export { expect };
