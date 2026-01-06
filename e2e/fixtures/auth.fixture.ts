/**
 * Authentication Fixtures for E2E Tests
 *
 * Provides pre-authenticated page contexts using storageState from global setup.
 * Falls back gracefully when credentials are not available.
 */

import { test as base, Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { setupAllMocks } from './api-mocks'

const authDir = path.join(__dirname, '..', '.auth')
const userAuthFile = path.join(authDir, 'user.json')
const adminAuthFile = path.join(authDir, 'admin.json')

type AuthFixtures = {
  authenticatedPage: Page
  adminPage: Page
  mockPage: Page // Page with all API mocks, no real auth needed
}

/**
 * Checks if a storageState file has valid auth (non-empty cookies)
 */
function hasValidAuth(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) return false
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return data.cookies && data.cookies.length > 0
  } catch {
    return false
  }
}

export const test = base.extend<AuthFixtures>({
  /**
   * Authenticated page using saved storageState.
   * Skips the test if no valid auth is available.
   */
  authenticatedPage: async ({ browser }, use, testInfo) => {
    if (!hasValidAuth(userAuthFile)) {
      testInfo.skip(true, 'Skipping: No valid user authentication available')
      return
    }

    const context = await browser.newContext({
      storageState: userAuthFile
    })
    const page = await context.newPage()

    await use(page)

    await context.close()
  },

  /**
   * Admin page using saved storageState.
   * Skips the test if no valid admin auth is available.
   */
  adminPage: async ({ browser }, use, testInfo) => {
    if (!hasValidAuth(adminAuthFile)) {
      testInfo.skip(true, 'Skipping: No valid admin authentication available')
      return
    }

    const context = await browser.newContext({
      storageState: adminAuthFile
    })
    const page = await context.newPage()

    await use(page)

    await context.close()
  },

  /**
   * Page with all API mocks enabled.
   * Use this for tests that don't need real backend connectivity.
   */
  mockPage: async ({ page }, use) => {
    // Enable verbose logging for debugging
    page.on('console', (msg) => {
      const text = msg.text()
      // Filter out noisy HMR logs or innocuous warnings if needed
      if (!text.includes('[HMR]') && !text.includes('React DevTools')) {
        console.log(`[Browser Console] ${msg.type()}: ${text}`)
      }
    })

    page.on('pageerror', (err) => {
      console.error(`[Browser Error] ${err.message}`)
    })

    await setupAllMocks(page)
    await use(page)
  }
})

export { expect } from '@playwright/test'
