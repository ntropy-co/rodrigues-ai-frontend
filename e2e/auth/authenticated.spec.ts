/**
 * Authenticated User E2E Tests
 *
 * Tests for authenticated user flows including dashboard access,
 * navigation, and logout.
 */

import { test, expect } from '../fixtures/auth.fixture'

test.describe('Authenticated User Flow', () => {
  test('should access chat when authenticated', async ({
    authenticatedPage
  }) => {
    // Default redirect after login is /chat
    await expect(authenticatedPage).toHaveURL(/\/chat/)

    // Check chat elements are visible
    await expect(authenticatedPage.getByRole('heading').first()).toBeVisible({
      timeout: 10000
    })
  })

  test('should display user info in header/sidebar', async ({
    authenticatedPage
  }) => {
    // User avatar shows first letter of name (e.g., "U" for "Usuário")
    // Look for avatar button in the header
    const userAvatar = authenticatedPage
      .locator('header button')
      .filter({ hasText: /^[A-Z]$/ })
      .first()

    await expect(userAvatar).toBeVisible({ timeout: 10000 })
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
    // First click on the user avatar button in header (shows single letter like "U")
    const userAvatar = authenticatedPage.getByRole('button', {
      name: /^[A-Z]$/
    })
    await userAvatar.click()

    // Wait for dropdown menu to appear
    const menu = authenticatedPage.getByRole('menu')
    await expect(menu).toBeVisible({ timeout: 5000 })

    // Click logout/sair menuitem
    const logoutButton = authenticatedPage.getByRole('menuitem', {
      name: 'Sair'
    })
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

    // Should still be on chat (not redirected to login)
    await expect(authenticatedPage).toHaveURL(/\/chat/)
  })
})

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/chat')

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('should redirect to chat after login', async ({ page }) => {
    // Go directly to login
    await page.goto('/login')

    // Login with valid credentials
    await page.fill('[name="email"]', 'teste@teste.com')
    await page.fill('[name="password"]', 'Teste123')
    await page.click('button[type="submit"]')

    // Should redirect to chat (default route)
    await page.waitForURL(/\/chat/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/chat/)
  })
})
