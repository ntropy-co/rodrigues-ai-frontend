/**
 * Global Setup for E2E Tests
 *
 * Performs programmatic authentication and saves the browser state
 * so individual tests don't need to log in via UI.
 */

import { chromium, FullConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authDir = path.join(__dirname, '.auth')
const userAuthFile = path.join(authDir, 'user.json')
const adminAuthFile = path.join(authDir, 'admin.json')

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000'
  const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

  // Ensure auth directory exists
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  const userEmail = process.env.TEST_USER_EMAIL
  const userPassword = process.env.TEST_USER_PASSWORD
  const adminEmail = process.env.TEST_ADMIN_EMAIL
  const adminPassword = process.env.TEST_ADMIN_PASSWORD

  // If no credentials, create empty auth files so tests can skip gracefully
  if (!userEmail || !userPassword) {
    console.log(
      '⚠️  TEST_USER_EMAIL/TEST_USER_PASSWORD not set. Auth tests will be skipped.'
    )
    fs.writeFileSync(userAuthFile, JSON.stringify({ cookies: [], origins: [] }))
    fs.writeFileSync(
      adminAuthFile,
      JSON.stringify({ cookies: [], origins: [] })
    )
    return
  }

  const browser = await chromium.launch()

  try {
    // Authenticate regular user
    const userContext = await browser.newContext()
    const userPage = await userContext.newPage()

    console.log('🔐 Authenticating regular user via API...')

    // Try API login first (fastest)
    const loginResponse = await userPage.request
      .post(`${apiURL}/api/auth/login`, {
        data: {
          email: userEmail,
          password: userPassword
        }
      })
      .catch(() => null)

    if (loginResponse?.ok()) {
      // API login succeeded - get cookies from response and navigate to set them
      await userPage.goto(baseURL)
      // The cookies should be set by the API response, save the state
      await userContext.storageState({ path: userAuthFile })
      console.log('✅ Regular user authenticated via API')
    } else {
      // Fallback to UI login
      console.log('⚠️  API login failed, falling back to UI login...')
      await userPage.goto(`${baseURL}/login`)
      await userPage.fill('[name="email"]', userEmail)
      await userPage.fill('[name="password"]', userPassword)
      await userPage.click('button[type="submit"]')
      await userPage.waitForURL((url) => !url.pathname.includes('/login'), {
        timeout: 30000
      })
      await userContext.storageState({ path: userAuthFile })
      console.log('✅ Regular user authenticated via UI')
    }

    await userContext.close()

    // Authenticate admin user (if credentials exist)
    if (adminEmail && adminPassword) {
      const adminContext = await browser.newContext()
      const adminPage = await adminContext.newPage()

      console.log('🔐 Authenticating admin user...')

      await adminPage.goto(`${baseURL}/login`)
      await adminPage.fill('[name="email"]', adminEmail)
      await adminPage.fill('[name="password"]', adminPassword)
      await adminPage.click('button[type="submit"]')
      await adminPage.waitForURL((url) => !url.pathname.includes('/login'), {
        timeout: 30000
      })
      await adminContext.storageState({ path: adminAuthFile })
      console.log('✅ Admin user authenticated')

      await adminContext.close()
    } else {
      // Create empty admin auth file
      fs.writeFileSync(
        adminAuthFile,
        JSON.stringify({ cookies: [], origins: [] })
      )
    }
  } catch (error) {
    console.error('❌ Authentication failed:', error)
    // Create empty files so tests can skip gracefully instead of crashing
    fs.writeFileSync(userAuthFile, JSON.stringify({ cookies: [], origins: [] }))
    fs.writeFileSync(
      adminAuthFile,
      JSON.stringify({ cookies: [], origins: [] })
    )
  } finally {
    await browser.close()
  }
}

export default globalSetup
