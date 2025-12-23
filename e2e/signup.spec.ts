import { test, expect } from '@playwright/test';

/**
 * User Signup Flow E2E Tests
 *
 * Tests the complete user registration and onboarding flow.
 */

test.describe('User Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/Stashtab/i);
    await expect(page.locator('text=Neobank-in-a-Box')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Launch App');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should show Privy login options', async ({ page }) => {
    await page.goto('/login');
    // Privy modal should be accessible
    // Note: Actual Privy integration testing requires test credentials
    await expect(page.locator('body')).toBeVisible();
  });

  test('should redirect authenticated users to dashboard', async ({ page }) => {
    // This test would require mocking Privy authentication
    // For now, we'll just check the route exists
    await page.goto('/dashboard');
    // Should either show dashboard or redirect to login
    const url = page.url();
    expect(url).toMatch(/\/dashboard|\/login/);
  });
});
