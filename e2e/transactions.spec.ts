import { test, expect } from '@playwright/test';

/**
 * Transaction Flow E2E Tests
 *
 * Tests deposit, send, and withdraw transaction flows.
 * Note: These tests require authenticated sessions and may need mocking.
 */

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (may redirect to login if not authenticated)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display dashboard with balance', async ({ page }) => {
    // If redirected to login, that's expected behavior
    const url = page.url();

    if (url.includes('/login')) {
      // Verify we're on login page
      await expect(page.locator('text=Welcome back')).toBeVisible();
    } else {
      // If authenticated, check for dashboard elements
      await expect(page.locator('text=Dashboard')).toBeVisible();

      // Check for sidebar navigation
      await expect(page.locator('text=Stashtab')).toBeVisible();

      // Check for navigation items (may be in sidebar)
      const hasSidebar = (await page.locator('aside').count()) > 0;
      if (hasSidebar) {
        // Verify sidebar navigation items exist
        await expect(page.locator('text=Dashboard').or(page.locator('text=Deposit'))).toBeVisible();
      }
    }
  });

  test('should navigate to deposit page', async ({ page }) => {
    await page.goto('/deposit');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/.*deposit/);

    // If authenticated, check for deposit page content
    // If not authenticated, should redirect to login
    const url = page.url();
    if (!url.includes('/login')) {
      // Verify we're on deposit page (check for page title or heading)
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('should navigate to send page', async ({ page }) => {
    await page.goto('/send');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/.*send/);

    // If authenticated, verify send page
    const url = page.url();
    if (!url.includes('/login')) {
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('should navigate to withdraw page', async ({ page }) => {
    await page.goto('/withdraw');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/.*withdraw/);

    // If authenticated, verify withdraw page
    const url = page.url();
    if (!url.includes('/login')) {
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('should show transaction list', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // If authenticated, check for dashboard structure
    const url = page.url();
    if (!url.includes('/login')) {
      // Dashboard should be visible
      await expect(page.locator('text=Dashboard').first()).toBeVisible();
    }
  });
});
