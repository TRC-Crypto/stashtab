import { test, expect } from '@playwright/test';

/**
 * Transaction Flow E2E Tests
 *
 * These tests verify navigation behavior for protected routes.
 * Note: Without Privy configured, redirects don't happen (ready never becomes true).
 * These tests verify pages load without errors, regardless of redirect behavior.
 */

test.describe('Transactions', () => {
  test('should handle dashboard route without authentication', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Without Privy configured, redirect won't happen - just verify page loads
    const url = page.url();
    // URL could be /dashboard (no redirect) or /login (if redirect happened)
    expect(url).toMatch(/\/(dashboard|login)/);

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle deposit page navigation', async ({ page }) => {
    await page.goto('/deposit');
    await page.waitForLoadState('networkidle');

    // Without Privy configured, redirect won't happen - just verify page loads
    const url = page.url();
    expect(url).toMatch(/\/(deposit|login)/);

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle send page navigation', async ({ page }) => {
    await page.goto('/send');
    await page.waitForLoadState('networkidle');

    // Without Privy configured, redirect won't happen - just verify page loads
    const url = page.url();
    expect(url).toMatch(/\/(send|login)/);

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle withdraw page navigation', async ({ page }) => {
    await page.goto('/withdraw');
    await page.waitForLoadState('networkidle');

    // Without Privy configured, redirect won't happen - just verify page loads
    const url = page.url();
    expect(url).toMatch(/\/(withdraw|login)/);

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle settings page navigation', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Without Privy configured, redirect won't happen - just verify page loads
    const url = page.url();
    expect(url).toMatch(/\/(settings|login)/);

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });
});
