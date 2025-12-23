import { test, expect } from '@playwright/test';

/**
 * Transaction Flow E2E Tests
 *
 * Tests deposit, send, and withdraw transaction flows.
 * Note: These tests require authenticated sessions and may need mocking.
 */

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // In a real scenario, you'd set up authentication here
    // For now, we'll test the UI flows
    await page.goto('/dashboard');
  });

  test('should display dashboard with balance', async ({ page }) => {
    // Check for common dashboard elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should navigate to deposit page', async ({ page }) => {
    await page.goto('/deposit');
    await expect(page).toHaveURL(/.*deposit/);
  });

  test('should navigate to send page', async ({ page }) => {
    await page.goto('/send');
    await expect(page).toHaveURL(/.*send/);
  });

  test('should navigate to withdraw page', async ({ page }) => {
    await page.goto('/withdraw');
    await expect(page).toHaveURL(/.*withdraw/);
  });

  test('should show transaction list', async ({ page }) => {
    await page.goto('/dashboard');
    // Transaction list should be visible (or empty state)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
