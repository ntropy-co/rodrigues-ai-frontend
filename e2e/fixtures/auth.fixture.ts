/**
 * Authentication Fixtures for E2E Tests
 *
 * Provides pre-authenticated page contexts for testing protected routes.
 */

import { test as base, Page } from '@playwright/test'
import { testUsers } from './test-data'

type AuthFixtures = {
  authenticatedPage: Page
  adminPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    if (!testUsers.regular.email || !testUsers.regular.password) {
      throw new Error(
        'Missing TEST_USER_EMAIL/TEST_USER_PASSWORD env vars for E2E auth.'
      )
    }

    // Login as regular user
    await page.goto('/login')
    await page.fill('[name="email"]', testUsers.regular.email)
    await page.fill('[name="password"]', testUsers.regular.password)
    await page.click('button[type="submit"]')
    // Default redirect is /chat, not /dashboard
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 15000
    })
    await use(page)
  },

  adminPage: async ({ page }, use) => {
    if (!testUsers.admin.email || !testUsers.admin.password) {
      throw new Error(
        'Missing TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD env vars for E2E auth.'
      )
    }

    // Login as admin
    await page.goto('/login')
    await page.fill('[name="email"]', testUsers.admin.email)
    await page.fill('[name="password"]', testUsers.admin.password)
    await page.click('button[type="submit"]')
    // Default redirect is /chat, not /dashboard
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 15000
    })
    await use(page)
  }
})

export { expect } from '@playwright/test'
