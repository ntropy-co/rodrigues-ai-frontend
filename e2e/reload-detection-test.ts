/**
 * Reload Detection Test Script
 *
 * This standalone Playwright script tests that NO full page reloads occur
 * during chat operations:
 * 1. Sending a message
 * 2. Receiving the assistant response
 * 3. Deleting the conversation
 *
 * Run with: npx tsx e2e/reload-detection-test.ts
 */

import { chromium, Page, Browser, BrowserContext } from 'playwright'

interface NavigationEvent {
  type: 'load' | 'framenavigated' | 'navigation-entry'
  timestamp: number
  url?: string
  details?: string
}

interface StepResult {
  step: string
  reloadDetected: boolean
  events: NavigationEvent[]
}

// Configuration
const BASE_URL = 'https://verityagro.com'
const EMAIL =
  process.env.PLAYWRIGHT_EMAIL ||
  process.env.TEST_USER_EMAIL ||
  'teste@teste.com'
const PASSWORD =
  process.env.PLAYWRIGHT_PASSWORD ||
  process.env.TEST_USER_PASSWORD ||
  'Teste123'

// Store navigation events
let navigationEvents: NavigationEvent[] = []
let monitoringActive = false
let loadEventCount = 0
let frameNavigatedCount = 0

function setupNavigationMonitoring(page: Page) {
  navigationEvents = []
  loadEventCount = 0
  frameNavigatedCount = 0
  monitoringActive = false

  // Monitor 'load' events (full page reloads)
  page.on('load', () => {
    if (monitoringActive) {
      loadEventCount++
      navigationEvents.push({
        type: 'load',
        timestamp: Date.now(),
        url: page.url(),
        details: 'Full page load event'
      })
      console.log(`🔴 LOAD event detected at ${page.url()}`)
    }
  })

  // Monitor 'framenavigated' events (top-level navigation)
  page.on('framenavigated', (frame) => {
    if (monitoringActive && frame === page.mainFrame()) {
      frameNavigatedCount++
      navigationEvents.push({
        type: 'framenavigated',
        timestamp: Date.now(),
        url: frame.url(),
        details: 'Top-level frame navigation'
      })
      console.log(`🟠 FRAMENAVIGATED event detected: ${frame.url()}`)
    }
  })
}

async function getNavigationEntries(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const entries = performance.getEntriesByType(
      'navigation'
    ) as PerformanceNavigationTiming[]
    return entries.length
  })
}

function startMonitoring() {
  monitoringActive = true
  loadEventCount = 0
  frameNavigatedCount = 0
}

function stopMonitoring(): { loads: number; navigations: number } {
  monitoringActive = false
  return { loads: loadEventCount, navigations: frameNavigatedCount }
}

function checkForReload(): boolean {
  return loadEventCount > 0 || frameNavigatedCount > 0
}

function clearEvents() {
  navigationEvents = []
  loadEventCount = 0
  frameNavigatedCount = 0
}

async function login(page: Page): Promise<void> {
  console.log('\n🔐 Logging in...')
  console.log(`   Email: ${EMAIL}`)

  await page.goto(`${BASE_URL}/login`)
  await page.waitForLoadState('networkidle')

  // Fill login form
  await page.fill('input[name="email"], input[type="email"]', EMAIL)
  await page.fill('input[name="password"], input[type="password"]', PASSWORD)

  // Submit
  await page.click('button[type="submit"]')

  // Wait for navigation after login
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 30000
  })

  console.log('✅ Login successful!')
}

async function navigateToChat(page: Page): Promise<void> {
  console.log('\n📍 Navigating to /chat...')
  await page.goto(`${BASE_URL}/chat`)
  await page.waitForLoadState('networkidle')

  // Wait for chat input to be visible
  await page.waitForSelector('#chat-input', { timeout: 10000 })
  console.log('✅ Chat page loaded!')
}

async function runTest(): Promise<void> {
  console.log('='.repeat(80))
  console.log('🧪 RELOAD DETECTION TEST')
  console.log('='.repeat(80))
  console.log(`Target URL: ${BASE_URL}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)

  let browser: Browser | null = null
  let context: BrowserContext | null = null
  let page: Page | null = null

  const results: StepResult[] = []
  let testFailed = false
  let failedStep = ''

  try {
    // Launch browser
    console.log('\n🚀 Launching browser...')
    browser = await chromium.launch({
      headless: false, // Visual mode for debugging
      slowMo: 100
    })

    context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    })

    page = await context.newPage()
    setupNavigationMonitoring(page)

    // Step 0: Login
    await login(page)

    // Step 1: Navigate to chat
    await navigateToChat(page)

    // Now start monitoring for reloads
    console.log('\n📡 Starting reload monitoring...')

    // ========================================================================
    // STEP 1: Send a message
    // ========================================================================
    console.log('\n' + '='.repeat(60))
    console.log('📤 STEP 1: Sending message...')
    console.log('='.repeat(60))

    clearEvents()
    startMonitoring()

    const chatInput = page.locator('#chat-input')
    await chatInput.fill(
      'Olá, esta é uma mensagem de teste para verificar reloads.'
    )

    // Click send or press Enter
    const sendButton = page.locator('button[aria-label="Enviar mensagem"]')
    if (await sendButton.isVisible()) {
      await sendButton.click()
    } else {
      await chatInput.press('Enter')
    }

    // Wait a bit for any potential reload
    await page.waitForTimeout(2000)

    const step1Stats = stopMonitoring()
    const step1Reload = checkForReload()

    results.push({
      step: 'Send Message',
      reloadDetected: step1Reload,
      events: [...navigationEvents]
    })

    if (step1Reload) {
      testFailed = true
      failedStep = 'Send Message'
      console.log('🔴 RELOAD DETECTED during message send!')
    } else {
      console.log('✅ No reload detected during message send')
    }
    console.log(
      `   Load events: ${step1Stats.loads}, Frame navigations: ${step1Stats.navigations}`
    )

    // ========================================================================
    // STEP 2: Wait for assistant response
    // ========================================================================
    if (!testFailed) {
      console.log('\n' + '='.repeat(60))
      console.log('📥 STEP 2: Waiting for assistant response...')
      console.log('='.repeat(60))

      clearEvents()
      startMonitoring()

      // Wait for assistant response to appear
      // Look for any assistant message container or content
      try {
        await page.waitForSelector(
          '[data-role="assistant"], [class*="assistant"], [class*="bot-message"]',
          { timeout: 60000 }
        )
        console.log('   Assistant response detected!')
      } catch {
        // If specific selector not found, wait for any new content
        console.log('   Waiting for response content...')
        await page.waitForTimeout(30000) // Wait up to 30s for response
      }

      // Additional wait to ensure response is complete
      await page.waitForTimeout(2000)

      const step2Stats = stopMonitoring()
      const step2Reload = checkForReload()

      results.push({
        step: 'Receive Response',
        reloadDetected: step2Reload,
        events: [...navigationEvents]
      })

      if (step2Reload) {
        testFailed = true
        failedStep = 'Receive Response'
        console.log('🔴 RELOAD DETECTED while receiving response!')
      } else {
        console.log('✅ No reload detected while receiving response')
      }
      console.log(
        `   Load events: ${step2Stats.loads}, Frame navigations: ${step2Stats.navigations}`
      )
    }

    // ========================================================================
    // STEP 3: Delete conversation
    // ========================================================================
    if (!testFailed) {
      console.log('\n' + '='.repeat(60))
      console.log('🗑️  STEP 3: Deleting conversation...')
      console.log('='.repeat(60))

      clearEvents()
      startMonitoring()

      // Try to find and click delete button
      // First, look for conversation in sidebar and hover to reveal delete button
      const sidebarSession = page
        .locator(
          '[data-testid="session-item"], [class*="session"], [class*="conversation"]'
        )
        .first()

      if (
        await sidebarSession.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await sidebarSession.hover()
        await page.waitForTimeout(500)

        // Look for delete/trash button
        const deleteButton = page
          .locator(
            'button[title="Excluir"], button:has(svg.lucide-trash-2), button:has([data-lucide="trash-2"]), [aria-label*="excluir" i], [aria-label*="delete" i]'
          )
          .first()

        if (
          await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)
        ) {
          await deleteButton.click()
          await page.waitForTimeout(500)

          // Confirm deletion in modal/dialog
          const confirmButton = page
            .locator(
              'button:has-text("Excluir"), button:has-text("Confirmar"), button:has-text("Delete")'
            )
            .last()
          if (
            await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)
          ) {
            await confirmButton.click()
          }
        } else {
          console.log(
            '   ⚠️  Delete button not found, trying alternative approach...'
          )

          // Try context menu or dropdown menu
          const moreButton = page
            .locator(
              'button:has(svg.lucide-more-vertical), button:has(svg.lucide-more-horizontal), [aria-label*="mais" i], [aria-label*="more" i]'
            )
            .first()
          if (
            await moreButton.isVisible({ timeout: 2000 }).catch(() => false)
          ) {
            await moreButton.click()
            await page.waitForTimeout(300)

            const deleteMenuItem = page
              .locator('text=/excluir|delete/i')
              .first()
            if (
              await deleteMenuItem
                .isVisible({ timeout: 2000 })
                .catch(() => false)
            ) {
              await deleteMenuItem.click()

              // Confirm
              const confirmBtn = page
                .locator(
                  'button:has-text("Excluir"), button:has-text("Confirmar")'
                )
                .last()
              if (
                await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)
              ) {
                await confirmBtn.click()
              }
            }
          }
        }
      } else {
        console.log('   ⚠️  No session found in sidebar to delete')
      }

      // Wait for deletion to process
      await page.waitForTimeout(2000)

      const step3Stats = stopMonitoring()
      const step3Reload = checkForReload()

      results.push({
        step: 'Delete Conversation',
        reloadDetected: step3Reload,
        events: [...navigationEvents]
      })

      if (step3Reload) {
        testFailed = true
        failedStep = 'Delete Conversation'
        console.log('🔴 RELOAD DETECTED during deletion!')
      } else {
        console.log('✅ No reload detected during deletion')
      }
      console.log(
        `   Load events: ${step3Stats.loads}, Frame navigations: ${step3Stats.navigations}`
      )
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n' + '='.repeat(80))
    console.log('📊 FINAL SUMMARY')
    console.log('='.repeat(80))

    console.log('\n📋 Results by Step:')
    for (const result of results) {
      const status = result.reloadDetected
        ? '🔴 RELOAD DETECTED'
        : '✅ No reload'
      console.log(`   ${result.step}: ${status}`)
      if (result.events.length > 0) {
        console.log('      Events:')
        for (const event of result.events) {
          console.log(
            `        - ${event.type} at ${new Date(event.timestamp).toISOString()} - ${event.url || event.details}`
          )
        }
      }
    }

    console.log('\n' + '-'.repeat(80))

    if (testFailed) {
      console.log(`\n❌ TEST FAILED: Reload detected at step "${failedStep}"`)
    } else {
      console.log('\n✅ TEST PASSED: No reloads detected in any step!')
    }

    console.log('\n📊 Collected Events Summary:')
    console.log(
      `   Total navigation events captured: ${navigationEvents.length}`
    )

    // Get final navigation entries from performance API
    const navEntries = await page.evaluate(() => {
      const entries = performance.getEntriesByType(
        'navigation'
      ) as PerformanceNavigationTiming[]
      return entries.map((e) => ({
        name: e.name,
        type: e.type,
        startTime: e.startTime,
        responseEnd: e.responseEnd
      }))
    })
    console.log('\n📈 Performance Navigation Entries:')
    console.log(JSON.stringify(navEntries, null, 2))
  } catch (error) {
    console.error('\n❌ Test error:', error)
  } finally {
    // Keep browser open for inspection
    console.log('\n⏳ Keeping browser open for 10 seconds for inspection...')
    await new Promise((resolve) => setTimeout(resolve, 10000))

    if (browser) {
      await browser.close()
    }
  }
}

// Run the test
runTest().catch(console.error)
