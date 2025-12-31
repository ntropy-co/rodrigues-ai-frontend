/**
 * Authentication Fixtures for E2E Tests
 *
 * Provides pre-authenticated page contexts for testing protected routes.
 */

import { test as base, Page } from '@playwright/test'

type AuthFixtures = {
  authenticatedPage: Page
  adminPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login as regular user
    await page.goto('/login')
    await page.fill(
      '[name="email"]',
      process.env.TEST_USER_EMAIL || 'test@example.com'
    )
    await page.fill(
      '[name="password"]',
      process.env.TEST_USER_PASSWORD || 'TestPassword123!'
    )
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })
    await use(page)
  },

  adminPage: async ({ page }, use) => {
    // Login as admin
    await page.goto('/login')
    await page.fill(
      '[name="email"]',
      process.env.TEST_ADMIN_EMAIL || 'admin@example.com'
    )
    await page.fill(
      '[name="password"]',
      process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!'
    )
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 10000 })
    await use(page)
  }
})

export { expect } from '@playwright/test'
