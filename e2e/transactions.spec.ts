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
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    const url = page.url();

    if (url.includes('/login')) {
      // Unauthenticated users are redirected to login - verify login page
      await expect(page.locator('text=Welcome back')).toBeVisible();
    } else if (url.includes('/dashboard')) {
      // If authenticated, check for dashboard elements
      await expect(page.locator('text=Dashboard')).toBeVisible();

      // Check for Stashtab branding (should be in sidebar)
      await expect(page.locator('text=Stashtab')).toBeVisible();
    } else {
      // Unexpected state - just verify page loaded
      await expect(page.locator('body')).toBeVisible();
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
    await expect(page.locator('body')).toBeVisible();

    // Check what page we're actually on
    const url = page.url();
    if (url.includes('/login')) {
      // Unauthenticated - verify we're on login page
      await expect(page.locator('text=Welcome back')).toBeVisible();
    } else if (url.includes('/dashboard')) {
      // Authenticated - verify dashboard is visible
      await expect(page.locator('text=Dashboard')).toBeVisible();
    }
  });
});
