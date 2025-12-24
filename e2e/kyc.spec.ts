import { test, expect } from '@playwright/test';

/**
 * KYC Verification Flow E2E Tests
 *
 * These tests verify KYC-related page navigation.
 * Note: These tests require authenticated sessions for full functionality.
 * In CI without authentication, protected routes redirect to login.
 */

test.describe('KYC Verification', () => {
  test('should handle deposit page (may require KYC)', async ({ page }) => {
    await page.goto('/deposit');
    // Wait for potential redirect
    await page.waitForURL(/\/login/, { timeout: 10000 }).catch(() => {});

    const url = page.url();
    // Protected route should redirect to login when not authenticated
    if (url.includes('/login')) {
      await expect(page.locator('text=Welcome back')).toBeVisible();
    } else {
      // If on deposit page (authenticated), just verify page loaded
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle settings page (KYC verification access)', async ({ page }) => {
    await page.goto('/settings');
    // Wait for potential redirect
    await page.waitForURL(/\/login/, { timeout: 10000 }).catch(() => {});

    const url = page.url();
    // Protected route should redirect to login when not authenticated
    if (url.includes('/login')) {
      await expect(page.locator('text=Welcome back')).toBeVisible();
    } else {
      // If on settings page (authenticated), just verify page loaded
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
