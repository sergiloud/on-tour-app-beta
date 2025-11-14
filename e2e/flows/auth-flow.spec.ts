import { test, expect } from '@playwright/test';

/**
 * E2E Test: Authentication Flow
 * 
 * User Journey:
 * 1. Unauthenticated user tries to access /dashboard
 * 2. User is redirected to /login
 * 3. User logs in successfully
 * 4. User is redirected to /dashboard
 * 5. User logs out
 * 6. User is redirected back to login/home
 */

test.describe('Authentication Flow - End to End', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear any existing auth state
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    // Step 1: Try to access protected route directly
    await page.goto('/dashboard');
    
    // Step 2: Verify redirect to login or home
    await page.waitForURL(/\/(login|auth|$)/, { timeout: 10000 });
    
    const currentUrl = page.url();
    const isLoginPage = currentUrl.includes('/login') || 
                       currentUrl.includes('/auth') ||
                       currentUrl === new URL('/', page.url()).href;
    
    expect(isLoginPage).toBeTruthy();
    
    // Verify login UI elements are visible
    const loginElements = page.locator(
      'input[type="email"], input[type="password"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Demo")'
    );
    
    await expect(loginElements.first()).toBeVisible({ timeout: 5000 });
  });

  test('should login and access dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Look for login form or demo button
    const demoButton = page.locator('button:has-text("Demo"), button:has-text("Ver demo"), button:has-text("Try Demo")');
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign in"), button[type="submit"]');
    
    if (await demoButton.isVisible()) {
      // Step 3: Use demo login
      await demoButton.first().click();
      
      // Step 4: Verify redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      
    } else if (await loginButton.isVisible()) {
      // Regular login flow
      await page.fill('input[type="email"]', 'test@ontour.app');
      await page.fill('input[type="password"]', 'TestPassword123!');
      await loginButton.first().click();
      
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    }
    
    // Verify we're on dashboard
    const dashboardIndicators = page.locator(
      'h1:has-text("Dashboard"), h1:has-text("Panel"), [data-testid="dashboard"], .dashboard'
    );
    
    await expect(dashboardIndicators.first()).toBeVisible({ timeout: 5000 });
    
    // Screenshot authenticated state
    await page.screenshot({ path: 'e2e-results/auth-dashboard.png' });
  });

  test('should logout and redirect to home', async ({ page }) => {
    // Login first
    await page.goto('/');
    
    const demoButton = page.locator('button:has-text("Demo"), button:has-text("Ver demo")');
    if (await demoButton.isVisible()) {
      await demoButton.first().click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    }
    
    // Step 5: Find logout button (usually in user menu)
    const userMenuButton = page.locator(
      '[data-testid="user-menu"], button:has([aria-label*="user"]), button:has-text("Profile"), .user-menu'
    );
    
    if (await userMenuButton.isVisible()) {
      await userMenuButton.first().click();
      await page.waitForTimeout(500);
    }
    
    const logoutButton = page.locator(
      'button:has-text("Logout"), button:has-text("Sign out"), button:has-text("Salir"), a:has-text("Logout")'
    );
    
    if (await logoutButton.isVisible()) {
      await logoutButton.first().click();
      
      // Step 6: Verify redirect to home/login
      await page.waitForURL(/\/(login|auth|$)/, { timeout: 10000 });
      
      // Verify we're logged out (login button should be visible)
      const loginElements = page.locator(
        'button:has-text("Login"), button:has-text("Demo"), input[type="email"]'
      );
      
      await expect(loginElements.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should persist auth state across page reloads', async ({ page }) => {
    // Login
    await page.goto('/');
    const demoButton = page.locator('button:has-text("Demo")');
    if (await demoButton.isVisible()) {
      await demoButton.first().click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    }
    
    // Reload page
    await page.reload();
    
    // Verify still on dashboard (not redirected to login)
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    
    const dashboardIndicators = page.locator('[data-testid="dashboard"], h1:has-text("Dashboard")');
    await expect(dashboardIndicators.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Try invalid credentials
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword');
      await submitButton.click();
      
      // Wait for error message
      const errorMessage = page.locator(
        ':has-text("Invalid"), :has-text("Error"), :has-text("incorrect"), [role="alert"]'
      );
      
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
      
      // Verify we're still on login page
      const currentUrl = page.url();
      expect(currentUrl).toContain('/login');
    }
  });

  test('should protect finance routes when unauthenticated', async ({ page, context }) => {
    await context.clearCookies();
    
    // Try to access finance directly
    await page.goto('/dashboard/finance');
    
    // Should redirect to login
    await page.waitForURL(/\/(login|auth|$)/, { timeout: 10000 });
    
    const isProtected = !page.url().includes('/finance');
    expect(isProtected).toBeTruthy();
  });

  test('should protect shows routes when unauthenticated', async ({ page, context }) => {
    await context.clearCookies();
    
    // Try to access shows directly
    await page.goto('/dashboard/shows');
    
    // Should redirect to login
    await page.waitForURL(/\/(login|auth|$)/, { timeout: 10000 });
    
    const isProtected = !page.url().includes('/shows');
    expect(isProtected).toBeTruthy();
  });
});
