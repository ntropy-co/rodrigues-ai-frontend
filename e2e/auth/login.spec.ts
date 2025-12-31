/**
 * Login Flow E2E Tests
 *
 * Tests for the authentication login flow including validation,
 * success cases, and error handling.
 */

import { test, expect } from '@playwright/test'
import { testUsers, testData } from '../fixtures/test-data'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login form elements', async ({ page }) => {
    // Check form is visible
    await expect(page.locator('[name="email"]')).toBeVisible()
    await expect(page.locator('[name="password"]')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /entrar|login|submit/i })
    ).toBeVisible()

    // Check links are present
    await expect(
      page.getByRole('link', { name: /esquec|forgot/i })
    ).toBeVisible()
  })

  test('should show validation error for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]')

    // Should show required field error
    await expect(page.locator('text=/obrigatório|required/i')).toBeVisible()
  })

  test('should show validation error for invalid email format', async ({
    page
  }) => {
    await page.fill('[name="email"]', testData.invalidEmail)
    await page.fill('[name="password"]', testData.validPassword)
    await page.click('button[type="submit"]')

    await expect(
      page.locator('text=/email.*inválido|invalid.*email/i')
    ).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[name="password"]', 'WrongPassword123!')
    await page.click('button[type="submit"]')

    // Wait for API response
    await page
      .waitForResponse(
        (response) => response.url().includes('/api/auth/login'),
        { timeout: 10000 }
      )
      .catch(() => {})

    await expect(
      page.locator(
        'text=/credenciais.*inválidas|invalid.*credentials|senha.*incorreta/i'
      )
    ).toBeVisible({ timeout: 5000 })
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('[name="email"]', testUsers.regular.email)
    await page.fill('[name="password"]', testUsers.regular.password)
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 15000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should show rate limit message after multiple failed attempts', async ({
    page
  }) => {
    // Make multiple failed login attempts
    for (let i = 0; i < 6; i++) {
      await page.fill('[name="email"]', 'test@example.com')
      await page.fill('[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(500)
    }

    // Should show rate limit error
    await expect(
      page.locator('text=/muitas.*tentativas|too.*many.*attempts|rate.*limit/i')
    ).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.click('text=/esquec|forgot/i')
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('[name="password"]')
    await page.fill('[name="password"]', 'TestPassword123!')

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle button (if exists)
    const toggleButton = page.locator(
      '[data-testid="toggle-password"], button:has(svg)'
    )
    if (await toggleButton.isVisible()) {
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
    }
  })
})
