# Finance E2E Tests

Comprehensive end-to-end tests for the Finance module using Playwright.

## 📁 Test Files

### `transaction-filters.spec.ts`

Complete test suite for transaction filtering and search functionality.

**Coverage (17 tests):**

- ✅ Table display and UI elements
- ✅ Filter by transaction type (income/expense)
- ✅ Filter by category (Alojamiento, Transporte, etc.)
- ✅ Filter by status (paid/pending)
- ✅ Search by text query (case-insensitive)
- ✅ Combined filters (type + category + status + search)
- ✅ Reset filters functionality
- ✅ Empty state handling
- ✅ Dynamic transaction count updates
- ✅ CSV export button
- ✅ Search clear button
- ✅ Scroll behavior

## 🚀 Running Tests

### Prerequisites

1. **Start dev server:**

   ```bash
   npm run dev
   ```

   Server should be running on `http://localhost:5173`

2. **Ensure you're authenticated** in the app (test data available)

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Only Finance Tests

```bash
npx playwright test e2e/finance
```

### Run Specific Test File

```bash
npx playwright test e2e/finance/transaction-filters.spec.ts
```

### Interactive Mode (UI)

```bash
npm run test:e2e:ui
```

Opens Playwright UI for interactive test execution, debugging, and time-travel inspection.

### Debug Mode

```bash
npm run test:e2e:debug
```

Runs tests in headed mode with Playwright Inspector for step-by-step debugging.

### Run Specific Test

```bash
npx playwright test -g "should filter transactions by category - Alojamiento"
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## 🔍 Test Structure

Each test follows this pattern:

```typescript
test('should [expected behavior]', async ({ page }) => {
  // 1. Navigate and setup
  await page.goto('/finance');
  await page.getByRole('tab', { name: /transacciones/i }).click();

  // 2. Perform action (filter, search, etc.)
  await page.locator('select').selectOption('Alojamiento');

  // 3. Verify results
  const categoryCells = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
  for (const categoryText of categoryCells) {
    expect(categoryText).toBe('Alojamiento');
  }
});
```

## 🎯 Test Scenarios

### Basic Filtering

- **Type Filter**: Isolate income or expense transactions
- **Category Filter**: Show only specific categories (Alojamiento, Transporte, etc.)
- **Status Filter**: Filter by paid/pending status
- **Search**: Case-insensitive text search across description, category, show

### Advanced Filtering

- **Combined Filters**: Multiple filters applied simultaneously
- **Reset Filters**: Clear all filters and return to default view
- **Empty Results**: Handle no-match scenarios gracefully

### UI Interactions

- **Transaction Count**: Dynamic updates as filters change
- **Search Clear Button**: Appears/disappears based on search input
- **Export CSV**: Button visibility and clickability
- **Scroll Behavior**: Reset to top on filter change

## 📝 Adding New Tests

1. **Identify user flow** to test
2. **Create test case** in appropriate file
3. **Use semantic selectors** (getByRole, getByText, getByPlaceholder)
4. **Verify expected behavior** with assertions
5. **Add descriptive test name** starting with "should..."

Example:

```typescript
test('should highlight active filters', async ({ page }) => {
  // Navigate to Transactions tab
  await page.goto('/finance');
  await page.getByRole('tab', { name: /transacciones/i }).click();

  // Apply filter
  await page
    .locator('select')
    .filter({ hasText: /todos los tipos/i })
    .selectOption('income');

  // Verify filter is highlighted or shows active state
  await expect(page.locator('select[value="income"]')).toBeVisible();
});
```

## 🐛 Debugging Tips

1. **Use headed mode** to see browser:

   ```bash
   npx playwright test --headed
   ```

2. **Slow down execution**:

   ```bash
   npx playwright test --slow-mo=1000
   ```

3. **Take screenshots** on failure (automatic in config)

4. **Use Playwright Inspector**:

   ```bash
   npm run test:e2e:debug
   ```

5. **Check console logs** in test:
   ```typescript
   page.on('console', msg => console.log(msg.text()));
   ```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Assertions Guide](https://playwright.dev/docs/test-assertions)

## 🔄 CI/CD Integration

Tests are configured for CI environments:

- **Retries**: 2 retries on CI (0 locally)
- **Workers**: 1 worker on CI (parallel locally)
- **Reports**: HTML, JSON, and JUnit formats
- **Artifacts**: Screenshots and videos on failure

Configuration in `playwright.config.ts`.
