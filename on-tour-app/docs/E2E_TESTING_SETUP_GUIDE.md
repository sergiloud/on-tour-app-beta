/\*\*

- E2E TEST INFRASTRUCTURE SETUP
- Week 4 - End-to-End Testing Strategy
-
- This guide covers:
- - Playwright configuration
- - E2E test structure
- - Critical user flow tests
- - CI/CD integration
- - Local debugging
    \*/

# E2E Testing Infrastructure Guide

## Overview

End-to-end (E2E) testing validates complete user workflows across the entire application stack. This guide covers setting up Playwright for E2E testing on the On Tour App.

## Setup

### Installation

```bash
npm install -D @playwright/test
npx playwright install
```

### Configuration

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Structure

### Directory Layout

```
e2e/
├── auth/
│   ├── login.spec.ts
│   └── logout.spec.ts
├── shows/
│   ├── create-show.spec.ts
│   ├── edit-show.spec.ts
│   └── delete-show.spec.ts
├── travel/
│   ├── map-view.spec.ts
│   └── filtering.spec.ts
├── finance/
│   ├── calculations.spec.ts
│   └── reports.spec.ts
└── fixtures/
    ├── auth.fixtures.ts
    └── data.fixtures.ts
```

### Base Test Pattern

```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures/auth.fixtures';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should do something', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Critical User Flows

### Flow 1: Complete Show Lifecycle

**Path**: Login → Create Show → Edit → Delete

**Tests**:

1. Can login with valid credentials
2. Can create a new show
3. Show appears in list
4. Can edit show details
5. Changes are persisted
6. Can delete show
7. Show removed from list
8. Can logout

**Selectors to Define**:

- Login form: `[data-testid="login-form"]`
- Email input: `[data-testid="email-input"]`
- Password input: `[data-testid="password-input"]`
- Create button: `[data-testid="create-show-btn"]`
- Show form: `[data-testid="show-form"]`
- Delete button: `[data-testid="delete-show-btn"]`

### Flow 2: Filtering & Search

**Path**: Login → Apply Filters → Verify Results Update

**Tests**:

1. Can filter by date range
2. Can filter by status
3. Can search by show name
4. Table updates with results
5. Map updates with results
6. Results count accurate
7. Can clear filters
8. All shows returned

**Selectors**:

- Date picker: `[data-testid="date-picker"]`
- Status filter: `[data-testid="status-filter"]`
- Search input: `[data-testid="search-input"]`
- Results table: `[data-testid="results-table"]`
- Map view: `[data-testid="map-view"]`
- Results count: `[data-testid="results-count"]`

### Flow 3: Financial Accuracy

**Path**: Create Show → Enter Financials → Verify Calculations

**Tests**:

1. Can enter ticket price
2. Can add fees
3. Can add commissions
4. Net calculation correct
5. Currency conversions accurate
6. Reports show correct totals
7. Historical data persists

**Selectors**:

- Ticket price: `[data-testid="ticket-price"]`
- Fee input: `[data-testid="fee-input"]`
- Commission input: `[data-testid="commission-input"]`
- Net amount: `[data-testid="net-amount"]`
- Financial report: `[data-testid="financial-report"]`

## Fixture Setup

### Authentication Fixture

```typescript
// e2e/fixtures/auth.fixtures.ts

import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login
    await page.goto('/login');

    // Enter credentials
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // Submit
    await page.click('[data-testid="submit-btn"]');

    // Wait for navigation
    await page.waitForURL('/dashboard');

    await use(page);
  },
});

export const loginAs = (email: string, password: string) => {
  return async page => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);
    await page.click('[data-testid="submit-btn"]');
    await page.waitForURL('/dashboard');
  };
};
```

### Data Fixture

```typescript
// e2e/fixtures/data.fixtures.ts

export const testShows = [
  {
    name: 'Test Show 1',
    date: '2025-12-15',
    venue: 'Test Venue 1',
    status: 'confirmed',
  },
  {
    name: 'Test Show 2',
    date: '2025-12-20',
    venue: 'Test Venue 2',
    status: 'pending',
  },
];

export const testUser = {
  email: 'test@example.com',
  password: 'password123',
};
```

## Example Tests

### Test 1: Login Flow

```typescript
test('should login successfully', async ({ page }) => {
  // Arrange
  await page.goto('/login');

  // Act
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="submit-btn"]');

  // Assert
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
});
```

### Test 2: Create Show Flow

```typescript
test('should create a new show', async ({ page }) => {
  // Arrange
  await loginAs('test@example.com', 'password123')(page);

  // Act
  await page.click('[data-testid="create-show-btn"]');
  await page.fill('[data-testid="show-name-input"]', 'New Test Show');
  await page.fill('[data-testid="venue-input"]', 'Test Venue');
  await page.click('[data-testid="save-btn"]');

  // Assert
  await expect(page.locator('text=New Test Show')).toBeVisible();
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
});
```

### Test 3: Financial Calculation

```typescript
test('should calculate net correctly', async ({ page }) => {
  // Arrange
  await loginAs('test@example.com', 'password123')(page);
  const ticketPrice = 100;
  const fee = 10;
  const commission = 5;
  const expectedNet = ticketPrice - fee - commission;

  // Act
  await page.click('[data-testid="create-show-btn"]');
  await page.fill('[data-testid="ticket-price"]', ticketPrice.toString());
  await page.fill('[data-testid="fee-input"]', fee.toString());
  await page.fill('[data-testid="commission-input"]', commission.toString());

  // Assert
  const netAmount = await page.locator('[data-testid="net-amount"]').textContent();
  expect(parseFloat(netAmount || '0')).toBe(expectedNet);
});
```

## Best Practices

### 1. Use Data-TestID Selectors

```typescript
// ✅ Good - specific and stable
await page.click('[data-testid="delete-btn"]');

// ❌ Bad - fragile, depends on text
await page.click('button:has-text("Delete")');

// ❌ Bad - brittle, depends on structure
await page.click('div > section > button:nth-child(3)');
```

### 2. Wait for Elements Properly

```typescript
// ✅ Good - waits for visibility
await expect(page.locator('[data-testid="modal"]')).toBeVisible();

// ✅ Good - waits for API response
await page.waitForResponse(
  response => response.url().includes('/api/shows') && response.status() === 200
);

// ❌ Bad - fixed sleep
await page.waitForTimeout(2000);
```

### 3. Test User Workflows, Not Implementation

```typescript
// ✅ Good - user perspective
test('user can create and delete a show', async ({ page }) => {
  await createShow(page, 'My Show');
  await expect(page.locator('text=My Show')).toBeVisible();
  await deleteShow(page, 'My Show');
  await expect(page.locator('text=My Show')).not.toBeVisible();
});

// ❌ Bad - testing implementation details
test('useState updates state', async ({ page }) => {
  // Testing React internals, not user behavior
});
```

### 4. Create Reusable Helper Functions

```typescript
// ✅ Good
async function createShow(page, name) {
  await page.click('[data-testid="create-show-btn"]');
  await page.fill('[data-testid="show-name-input"]', name);
  await page.click('[data-testid="save-btn"]');
  await expect(page.locator(`text=${name}`)).toBeVisible();
}

// ❌ Bad - repeated in every test
test('create show 1', async ({ page }) => {
  await page.click('[data-testid="create-show-btn"]');
  // ... 10 lines of setup
});

test('create show 2', async ({ page }) => {
  await page.click('[data-testid="create-show-btn"]');
  // ... same 10 lines duplicated
});
```

## Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e shows/create-show.spec.ts

# Run with UI (interactive debugging)
npm run test:e2e --ui

# Run in debug mode
npm run test:e2e --debug

# Run specific test
npm run test:e2e --grep "should create show"

# View test report
npm run test:e2e && npx playwright show-report
```

### Add to package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Debugging

### 1. Use --debug Flag

```bash
npx playwright test --debug
```

### 2. Add Debugger Statements

```typescript
test('my test', async ({ page }) => {
  await page.goto('/dashboard');

  // Opens inspector
  await page.pause();

  await page.click('[data-testid="btn"]');
});
```

### 3. Check Screenshots & Videos

Playwright auto-captures on failure in CI. Locally, enable in config:

```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
},
```

## Next Steps

1. ✅ Configure playwright.config.ts
2. ✅ Create e2e/ directory structure
3. ✅ Setup auth fixtures
4. ✅ Implement 5-10 critical user flow tests
5. ✅ Integrate with CI/CD
6. ✅ Add test report generation

## Resources

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

---

_Ready to build robust E2E tests! 🚀_
