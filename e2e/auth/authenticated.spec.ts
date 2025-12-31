/**
 * Authenticated User E2E Tests
 *
 * Tests for authenticated user flows including dashboard access,
 * navigation, and logout.
 */

import { test, expect } from '../fixtures/auth.fixture'

test.describe('Authenticated User Flow', () => {
  test('should access dashboard when authenticated', async ({
    authenticatedPage
  }) => {
    await expect(authenticatedPage).toHaveURL(/\/dashboard/)

    // Check dashboard elements are visible
    await expect(
      authenticatedPage.getByRole('heading', { level: 1 })
    ).toBeVisible()
  })

  test('should display user info in header/sidebar', async ({
    authenticatedPage
  }) => {
    // Look for user avatar or name in header
    const userMenu = authenticatedPage.locator(
      '[data-testid="user-menu"], [data-testid="user-avatar"], .user-menu'
    )

    await expect(userMenu).toBeVisible()
  })

  test('should be able to navigate to settings', async ({
    authenticatedPage
  }) => {
    // Click on settings link (could be in sidebar or dropdown)
    const settingsLink = authenticatedPage.locator(
      'a[href*="settings"], [data-testid="settings-link"]'
    )

    if (await settingsLink.isVisible()) {
      await settingsLink.click()
      await expect(authenticatedPage).toHaveURL(/\/settings/)
    }
  })

  test('should be able to logout', async ({ authenticatedPage }) => {
    // Find and click logout button
    const logoutButton = authenticatedPage.locator(
      '[data-testid="logout-button"], button:has-text("Sair"), button:has-text("Logout")'
    )

    // May need to open user menu first
    const userMenu = authenticatedPage.locator('[data-testid="user-menu"]')
    if (await userMenu.isVisible()) {
      await userMenu.click()
    }

    await logoutButton.click()

    // Should redirect to login
    await authenticatedPage.waitForURL('**/login**', { timeout: 10000 })
    await expect(authenticatedPage).toHaveURL(/\/login/)
  })

  test('should persist session on page reload', async ({
    authenticatedPage
  }) => {
    // Reload the page
    await authenticatedPage.reload()

    // Should still be on dashboard (not redirected to login)
    await expect(authenticatedPage).toHaveURL(/\/dashboard/)
  })
})

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect to original URL after login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/settings')

    // Should be on login page
    await expect(page).toHaveURL(/\/login/)

    // Login
    await page.fill(
      '[name="email"]',
      process.env.TEST_USER_EMAIL || 'test@example.com'
    )
    await page.fill(
      '[name="password"]',
      process.env.TEST_USER_PASSWORD || 'TestPassword123!'
    )
    await page.click('button[type="submit"]')

    // Should redirect to original URL or dashboard
    await page.waitForURL(/\/(settings|dashboard)/, { timeout: 15000 })
  })
})
