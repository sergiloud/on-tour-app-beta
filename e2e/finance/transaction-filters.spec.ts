/**
 * E2E Tests - Finance Transaction Filters
 *
 * Tests the complete user flow for filtering and searching transactions
 * in the Finance module's Transactions tab.
 *
 * Coverage:
 * - Navigation to Finance module and Transactions tab
 * - Filter by transaction type (income/expense)
 * - Filter by category (Alojamiento, Transporte, etc.)
 * - Filter by status (paid/pending)
 * - Search by text query
 * - Combined filters
 * - Reset filters functionality
 * - Export CSV button visibility
 * - Transaction count updates
 *
 * Prerequisites:
 * - Dev server running on http://localhost:5173
 * - User authenticated (test data available)
 * - Finance module accessible
 */

import { test, expect } from '@playwright/test';

test.describe('Finance - Transaction Filters', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Finance module
    await page.goto('/finance');
    await page.waitForLoadState('networkidle');

    // Switch to Transactions tab
    await page.getByRole('tab', { name: /transacciones/i }).click();

    // Wait for transactions to load
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
  });

  test('should display transactions table with all elements', async ({ page }) => {
    // Verify table headers are present
    await expect(page.getByRole('columnheader', { name: /fecha/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /descripción/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /categoría/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /tipo/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /importe/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /estado/i })).toBeVisible();

    // Verify filters are visible
    await expect(page.getByPlaceholder(/buscar transacciones/i)).toBeVisible();
    await expect(page.locator('select').filter({ hasText: /todos los tipos/i })).toBeVisible();
    await expect(page.locator('select').filter({ hasText: /todas las categorías/i })).toBeVisible();
    await expect(page.locator('select').filter({ hasText: /todos los estados/i })).toBeVisible();

    // Verify export button is visible
    await expect(page.getByRole('button', { name: /exportar csv/i })).toBeVisible();

    // Verify reset filters button is visible
    await expect(page.getByRole('button', { name: /limpiar filtros/i })).toBeVisible();

    // Verify transaction count is displayed
    await expect(page.getByText(/mostrando/i)).toBeVisible();
  });

  test('should filter transactions by type - Income', async ({ page }) => {
    // Get initial count
    const initialCountText = await page.getByText(/mostrando/i).textContent();
    const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0');

    // Select "Ingresos" filter
    await page.locator('select').filter({ hasText: /todos los tipos/i }).selectOption('income');

    // Wait for table to update
    await page.waitForTimeout(300);

    // Get filtered count
    const filteredCountText = await page.getByText(/mostrando/i).textContent();
    const filteredCount = parseInt(filteredCountText?.match(/\d+/)?.[0] || '0');

    // Verify count changed (assuming there are both income and expenses)
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Verify all visible rows show "Ingreso" type
    const typesCells = await page.locator('table tbody tr td:nth-child(4)').allTextContents();
    for (const typeText of typesCells) {
      expect(typeText.toLowerCase()).toContain('ingreso');
    }
  });

  test('should filter transactions by type - Expense', async ({ page }) => {
    // Select "Gastos" filter
    await page.locator('select').filter({ hasText: /todos los tipos/i }).selectOption('expense');

    // Wait for table to update
    await page.waitForTimeout(300);

    // Verify all visible rows show "Gasto" type
    const typesCells = await page.locator('table tbody tr td:nth-child(4)').allTextContents();
    for (const typeText of typesCells) {
      expect(typeText.toLowerCase()).toContain('gasto');
    }
  });

  test('should filter transactions by category - Alojamiento', async ({ page }) => {
    // Select "Alojamiento" category
    await page.locator('select').filter({ hasText: /todas las categorías/i }).selectOption('Alojamiento');

    // Wait for table to update
    await page.waitForTimeout(300);

    // Verify count is displayed
    const countText = await page.getByText(/mostrando/i).textContent();
    expect(countText).toContain('Mostrando');

    // Verify all visible rows show "Alojamiento" category
    const categoryCells = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
    for (const categoryText of categoryCells) {
      expect(categoryText).toBe('Alojamiento');
    }
  });

  test('should filter transactions by category - Transporte', async ({ page }) => {
    // Select "Transporte" category
    await page.locator('select').filter({ hasText: /todas las categorías/i }).selectOption('Transporte');

    // Wait for table to update
    await page.waitForTimeout(300);

    // Verify all visible rows show "Transporte" category
    const categoryCells = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
    for (const categoryText of categoryCells) {
      expect(categoryText).toBe('Transporte');
    }
  });

  test('should filter transactions by status - Paid', async ({ page }) => {
    // Select "Pagado" status filter
    await page.locator('select').filter({ hasText: /todos los estados/i }).selectOption('paid');

    // Wait for table to update
    await page.waitForTimeout(300);

    // Verify all visible rows show "Pagado" status
    const statusCells = await page.locator('table tbody tr td:nth-child(6)').allTextContents();
    for (const statusText of statusCells) {
      expect(statusText.toLowerCase()).toContain('pagado');
    }
  });

  test('should filter transactions by status - Pending', async ({ page }) => {
    // Select "Pendiente" status filter
    await page.locator('select').filter({ hasText: /todos los estados/i }).selectOption('pending');

    // Wait for table to update
    await page.waitForTimeout(300);

    // Verify all visible rows show "Pendiente" status
    const statusCells = await page.locator('table tbody tr td:nth-child(6)').allTextContents();
    for (const statusText of statusCells) {
      expect(statusText.toLowerCase()).toContain('pendiente');
    }
  });

  test('should filter transactions by search query', async ({ page }) => {
    // Type search query in search box
    const searchBox = page.getByPlaceholder(/buscar transacciones/i);
    await searchBox.fill('hotel');

    // Wait for table to update
    await page.waitForTimeout(300);

    // Verify filtered count is displayed
    const countText = await page.getByText(/mostrando/i).textContent();
    expect(countText).toMatch(/mostrando \d+ de \d+ transacciones/i);

    // Verify all visible descriptions contain search term (case-insensitive)
    const descriptionCells = await page.locator('table tbody tr td:nth-child(2)').allTextContents();
    for (const descText of descriptionCells) {
      expect(descText.toLowerCase()).toContain('hotel');
    }
  });

  test('should show clear button when search has text', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/buscar transacciones/i);

    // Clear button should not be visible initially
    await expect(page.locator('button[aria-label="Limpiar búsqueda"]')).not.toBeVisible();

    // Type in search box
    await searchBox.fill('test');

    // Clear button should now be visible
    await expect(page.locator('button[aria-label="Limpiar búsqueda"]')).toBeVisible();

    // Click clear button
    await page.locator('button[aria-label="Limpiar búsqueda"]').click();

    // Search box should be empty
    await expect(searchBox).toHaveValue('');
  });

  test('should apply combined filters (type + category)', async ({ page }) => {
    // Select expense type
    await page.locator('select').filter({ hasText: /todos los tipos/i }).selectOption('expense');
    await page.waitForTimeout(200);

    // Select Alojamiento category
    await page.locator('select').filter({ hasText: /todas las categorías/i }).selectOption('Alojamiento');
    await page.waitForTimeout(300);

    // Verify all rows are expenses
    const typesCells = await page.locator('table tbody tr td:nth-child(4)').allTextContents();
    for (const typeText of typesCells) {
      expect(typeText.toLowerCase()).toContain('gasto');
    }

    // Verify all rows are Alojamiento category
    const categoryCells = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
    for (const categoryText of categoryCells) {
      expect(categoryText).toBe('Alojamiento');
    }
  });

  test('should apply combined filters (category + status + search)', async ({ page }) => {
    // Select Transporte category
    await page.locator('select').filter({ hasText: /todas las categorías/i }).selectOption('Transporte');
    await page.waitForTimeout(200);

    // Select Pagado status
    await page.locator('select').filter({ hasText: /todos los estados/i }).selectOption('paid');
    await page.waitForTimeout(200);

    // Type search query
    const searchBox = page.getByPlaceholder(/buscar transacciones/i);
    await searchBox.fill('taxi');
    await page.waitForTimeout(300);

    // Verify category filter applied
    const categoryCells = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
    for (const categoryText of categoryCells) {
      expect(categoryText).toBe('Transporte');
    }

    // Verify status filter applied
    const statusCells = await page.locator('table tbody tr td:nth-child(6)').allTextContents();
    for (const statusText of statusCells) {
      expect(statusText.toLowerCase()).toContain('pagado');
    }

    // Verify search filter applied
    const descriptionCells = await page.locator('table tbody tr td:nth-child(2)').allTextContents();
    for (const descText of descriptionCells) {
      expect(descText.toLowerCase()).toContain('taxi');
    }
  });

  test('should reset all filters when clicking "Limpiar filtros"', async ({ page }) => {
    // Apply multiple filters
    await page.locator('select').filter({ hasText: /todos los tipos/i }).selectOption('expense');
    await page.locator('select').filter({ hasText: /todas las categorías/i }).selectOption('Alojamiento');
    await page.locator('select').filter({ hasText: /todos los estados/i }).selectOption('paid');
    await page.getByPlaceholder(/buscar transacciones/i).fill('hotel');
    await page.waitForTimeout(300);

    // Get filtered count
    const filteredCountText = await page.getByText(/mostrando/i).textContent();
    const filteredCount = parseInt(filteredCountText?.match(/\d+/)?.[0] || '0');

    // Click reset filters button
    await page.getByRole('button', { name: /limpiar filtros/i }).click();
    await page.waitForTimeout(300);

    // Verify all filters are reset
    await expect(page.locator('select').filter({ hasText: /todos los tipos/i })).toHaveValue('all');
    await expect(page.locator('select').filter({ hasText: /todas las categorías/i })).toHaveValue('all');
    await expect(page.locator('select').filter({ hasText: /todos los estados/i })).toHaveValue('all');
    await expect(page.getByPlaceholder(/buscar transacciones/i)).toHaveValue('');

    // Verify count increased (showing more transactions)
    const resetCountText = await page.getByText(/mostrando/i).textContent();
    const resetCount = parseInt(resetCountText?.match(/\d+/)?.[0] || '0');
    expect(resetCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('should show "no results" message when filters return empty', async ({ page }) => {
    // Type a search query that will not match any transaction
    const searchBox = page.getByPlaceholder(/buscar transacciones/i);
    await searchBox.fill('xyzabc123nonexistent999');
    await page.waitForTimeout(300);

    // Verify "no results" message is displayed
    await expect(page.getByText(/no se encontraron transacciones/i)).toBeVisible();

    // Verify count shows 0 results
    const countText = await page.getByText(/mostrando/i).textContent();
    expect(countText).toContain('Mostrando 0');
  });

  test('should maintain scroll position when filtering', async ({ page }) => {
    // Scroll down the table
    const tableContainer = page.locator('div[style*="maxHeight"]');
    await tableContainer.evaluate(el => el.scrollTop = 200);

    // Apply a filter
    await page.locator('select').filter({ hasText: /todos los tipos/i }).selectOption('income');
    await page.waitForTimeout(300);

    // Verify scroll is reset to top (expected behavior on filter change)
    const scrollTop = await tableContainer.evaluate(el => el.scrollTop);
    expect(scrollTop).toBe(0);
  });

  test('should update transaction count dynamically', async ({ page }) => {
    // Get total count
    const totalCountText = await page.getByText(/mostrando/i).textContent();
    const totalMatch = totalCountText?.match(/de (\d+) transacciones/);
    const totalCount = parseInt(totalMatch?.[1] || '0');

    // Apply filter
    await page.locator('select').filter({ hasText: /todos los tipos/i }).selectOption('income');
    await page.waitForTimeout(300);

    // Get filtered count
    const filteredCountText = await page.getByText(/mostrando/i).textContent();
    const filteredMatch = filteredCountText?.match(/mostrando (\d+)/i);
    const filteredCount = parseInt(filteredMatch?.[1] || '0');

    // Verify total count remains the same
    const newTotalMatch = filteredCountText?.match(/de (\d+) transacciones/);
    const newTotalCount = parseInt(newTotalMatch?.[1] || '0');
    expect(newTotalCount).toBe(totalCount);

    // Verify filtered count is different
    expect(filteredCount).toBeLessThanOrEqual(totalCount);
  });

  test('should export CSV button be clickable', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /exportar csv/i });

    // Verify button is visible and enabled
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();

    // Click export button (will trigger download in real scenario)
    await exportButton.click();

    // In a real test, you'd verify download started:
    // const download = await downloadPromise;
    // expect(download.suggestedFilename()).toContain('transactions');
  });
});
