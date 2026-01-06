import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 *
 * Uses global setup for programmatic authentication and
 * API mocking for backend-independent testing.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  // Enable parallelism for faster local testing
  fullyParallel: !process.env.CI,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Increase local workers for speed, keep 1 for CI safety
  workers: process.env.CI ? 1 : 4,
  reporter: process.env.CI ? 'github' : 'html',

  // Global setup runs once before all tests to handle authentication
  globalSetup: require.resolve('./e2e/global-setup'),

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      // Use localhost for local development; mocks handle CI
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:8000'
    }
  }
})
