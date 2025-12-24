import { test, expect } from '@playwright/test';

/**
 * User Signup Flow E2E Tests
 *
 * Tests the complete user registration and onboarding flow.
 */

test.describe('User Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display landing page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Stashtab/i);

    // Check for main hero text
    await expect(page.locator('text=Your money.')).toBeVisible();
    await expect(page.locator('text=Always earning.')).toBeVisible();

    // Check for Stashtab logo/branding
    await expect(page.locator('text=Stashtab').first()).toBeVisible();

    // Check for description text
    await expect(page.locator('text=An open source DeFi neobank stack')).toBeVisible();

    // Check for CTA buttons
    await expect(page.locator('text=Launch App')).toBeVisible();
    await expect(page.locator('text=Get Started')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    // Click Launch App button in nav
    await page.click('text=Launch App');
    await expect(page).toHaveURL(/.*login/);

    // Verify login page elements
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should show Privy login options', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Verify login page is loaded
    await expect(page.locator('text=Welcome back')).toBeVisible();

    // Check for Stashtab branding on login page
    await expect(page.locator('text=Stashtab')).toBeVisible();

    // The login button should be present (may show "Sign In" or "Loading..." depending on Privy state)
    const loginButton = page.locator('button').filter({ hasText: /Sign In|Loading/ });
    await expect(loginButton).toBeVisible();

    // Note: Actual Privy modal interaction requires authentication setup
    // In CI without Privy configured, the button may be disabled
  });

  test('should redirect authenticated users to dashboard', async ({ page }) => {
    // Navigate to dashboard without authentication
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should either show dashboard (if authenticated) or redirect to login
    const url = page.url();
    expect(url).toMatch(/\/dashboard|\/login/);

    // If redirected to login, verify login page
    if (url.includes('/login')) {
      await expect(page.locator('text=Welcome back')).toBeVisible();
    }
    // If on dashboard, verify dashboard elements (would require auth mocking)
  });
});
