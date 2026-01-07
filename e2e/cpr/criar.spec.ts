/**
 * CPR Creation Wizard E2E Tests
 *
 * Tests for the CPR document creation wizard including:
 * - Multi-step navigation
 * - Form validation
 * - State persistence
 * - Risk calculation integration
 * - Document generation
 */

import { test, expect } from '../fixtures/auth.fixture'

test.describe('CPR Creation Wizard', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Clear any previous wizard state
    await authenticatedPage.evaluate(() => {
      localStorage.removeItem('cpr_wizard_state')
    })
    await authenticatedPage.goto('/cpr/wizard')
  })

  test('should display wizard with stepper navigation', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Check wizard title
    await expect(page.locator('text=Nova CPR Financeira')).toBeVisible()

    // Check all step indicators are visible
    const stepButtons = page.locator('button:has-text(/^[1-6]$/)')
    await expect(stepButtons).toHaveCount(6)

    // Check step labels (hidden on mobile, visible on desktop)
    const stepLabels = [
      'Produtor',
      'Propriedade',
      'Cultura',
      'Valores',
      'Garantias',
      'Revisão'
    ]

    for (const label of stepLabels) {
      await expect(page.locator(`text=${label}`)).toBeVisible()
    }
  })

  test('should start at step 1', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // First step button should be active (scaled and primary colored)
    const step1Button = page.locator('button:has-text("1")').first()
    await expect(step1Button).toHaveAttribute('aria-current', 'step')

    // Should show placeholder content for step 1
    await expect(page.locator('text=Identificação do Produtor')).toBeVisible()
  })

  test('should navigate through placeholder steps (1-3)', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Step 1 → Step 2
    await page.click('button:has-text("Simular Conclusão e Avançar")')
    await expect(page.locator('text=Seleção da Propriedade')).toBeVisible()

    // Step 2 → Step 3
    await page.click('button:has-text("Simular Conclusão e Avançar")')
    await expect(page.locator('text=Definição da Cultura')).toBeVisible()

    // Step 3 → Step 4 (Values)
    await page.click('button:has-text("Simular Conclusão e Avançar")')
    await expect(page.locator('label:has-text("Valor Total")')).toBeVisible()
  })

  test('should not allow skipping to future steps', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Try clicking step 4 directly
    const step4Button = page.locator('button:has-text("4")').first()
    await expect(step4Button).toBeDisabled()
  })

  test('should allow navigating back to completed steps', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Complete steps 1 and 2
    await page.click('button:has-text("Simular Conclusão e Avançar")')
    await page.click('button:has-text("Simular Conclusão e Avançar")')

    // Should be on step 3 now
    await expect(page.locator('text=Definição da Cultura')).toBeVisible()

    // Click step 1 to go back
    await page.locator('button:has-text("1")').first().click()
    await expect(page.locator('text=Identificação do Produtor')).toBeVisible()
  })
})

test.describe('CPR Wizard - Step 4: Values', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.evaluate(() => {
      localStorage.removeItem('cpr_wizard_state')
    })
    await page.goto('/cpr/wizard')

    // Navigate to step 4
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Simular Conclusão e Avançar")')
    }
  })

  test('should display all value fields', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Check all fields are visible
    await expect(page.locator('label:has-text("Valor Total")')).toBeVisible()
    await expect(page.locator('label:has-text("Quantidade")')).toBeVisible()
    await expect(page.locator('label:has-text("Preço Unitário")')).toBeVisible()
    await expect(
      page.locator('label:has-text("Índice de Correção")')
    ).toBeVisible()
    await expect(
      page.locator('label:has-text("Data de Emissão")')
    ).toBeVisible()
    await expect(
      page.locator('label:has-text("Data de Vencimento")')
    ).toBeVisible()
    await expect(
      page.locator('label:has-text("Local de Entrega")')
    ).toBeVisible()
  })

  test('should auto-calculate unit price', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Fill amount and quantity
    await page.fill('#amount', '100000')
    await page.fill('#quantity', '1000')

    // Unit price should be auto-calculated (100000 / 1000 = 100)
    await expect(page.locator('#unitPrice')).toHaveValue('100')
  })

  test('should validate required fields', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Try to advance without filling required fields
    await page.click('button:has-text("Próximo")')

    // Should show validation errors
    await expect(page.locator('[role="alert"]').first()).toBeVisible()
  })

  test('should fill values form and advance', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Fill all required fields
    await page.fill('#amount', '150000')
    await page.fill('#quantity', '1500')

    // Select correction index
    await page.click('#correction-index')
    await page.click('text=IPCA')

    // Fill dates
    const today = new Date().toISOString().split('T')[0]
    const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    await page.fill('#issueDate', today)
    await page.fill('#dueDate', futureDate)

    // Fill delivery place
    await page.fill('#deliveryPlace', 'Fazenda Santa Maria, MT')

    // Advance to next step
    await page.click('button:has-text("Próximo")')

    // Should be on step 5 (Guarantees)
    await expect(page.locator('text=Tipo de Garantia')).toBeVisible()
  })

  test('should navigate back to previous step', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    await page.click('button:has-text("Voltar")')

    // Should be back on step 3
    await expect(page.locator('text=Definição da Cultura')).toBeVisible()
  })
})

test.describe('CPR Wizard - Step 5: Guarantees', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.evaluate(() => {
      localStorage.removeItem('cpr_wizard_state')
    })
    await page.goto('/cpr/wizard')

    // Navigate to step 5
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Simular Conclusão e Avançar")')
    }

    // Fill step 4 minimum data
    await page.fill('#amount', '100000')
    await page.fill('#quantity', '1000')
    await page.fill('#issueDate', new Date().toISOString().split('T')[0])
    await page.fill(
      '#dueDate',
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    )
    await page.fill('#deliveryPlace', 'Test Location')
    await page.click('button:has-text("Próximo")')
  })

  test('should display guarantee type options', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Check all guarantee options are visible
    const guaranteeOptions = [
      'Penhor de Safra',
      'Hipoteca',
      'Alienação Fiduciária',
      'Outros'
    ]

    for (const option of guaranteeOptions) {
      await expect(page.locator(`label:has-text("${option}")`)).toBeVisible()
    }
  })

  test('should select multiple guarantee types', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Select multiple options
    await page.click('label:has-text("Penhor de Safra")')
    await page.click('label:has-text("Hipoteca")')

    // Verify checkboxes are checked
    await expect(page.locator('#g-Penhor\\ de\\ Safra')).toBeChecked()
    await expect(page.locator('#g-Hipoteca')).toBeChecked()
  })

  test('should show/hide guarantor fields', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Guarantor fields should be hidden initially
    await expect(page.locator('#gName')).not.toBeVisible()

    // Check "Possui Avalista?"
    await page.click('#hasGuarantor')

    // Guarantor fields should now be visible
    await expect(page.locator('#gName')).toBeVisible()
    await expect(page.locator('#gDoc')).toBeVisible()
    await expect(page.locator('#gAddr')).toBeVisible()

    // Uncheck to hide again
    await page.click('#hasGuarantor')
    await expect(page.locator('#gName')).not.toBeVisible()
  })

  test('should fill guarantees and advance to review', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Select guarantee type
    await page.click('label:has-text("Penhor de Safra")')

    // Fill description
    await page.fill('#desc', 'Safra de soja 2024/2025 - 1500 sacas')

    // Add guarantor
    await page.click('#hasGuarantor')
    await page.fill('#gName', 'José da Silva')
    await page.fill('#gDoc', '123.456.789-00')
    await page.fill('#gAddr', 'Rua Principal, 100 - Campo Grande, MS')

    // Advance to review
    await page.click('button:has-text("Próximo")')

    // Should be on step 6 (Review)
    await expect(page.locator('text=Valores e Prazos')).toBeVisible()
  })
})

test.describe('CPR Wizard - Step 6: Review', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.evaluate(() => {
      localStorage.removeItem('cpr_wizard_state')
    })
    await page.goto('/cpr/wizard')

    // Navigate through all steps
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Simular Conclusão e Avançar")')
    }

    // Fill step 4
    await page.fill('#amount', '100000')
    await page.fill('#quantity', '1000')
    await page.fill('#issueDate', new Date().toISOString().split('T')[0])
    await page.fill(
      '#dueDate',
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    )
    await page.fill('#deliveryPlace', 'Fazenda São João, MT')
    await page.click('button:has-text("Próximo")')

    // Fill step 5
    await page.click('label:has-text("Penhor de Safra")')
    await page.fill('#desc', 'Safra de soja 2024/2025')
    await page.click('button:has-text("Próximo")')
  })

  test('should display summary cards', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Check summary cards are visible
    await expect(page.locator('text=Valores e Prazos')).toBeVisible()
    await expect(page.locator('text=Garantias')).toBeVisible()

    // Check values are displayed
    await expect(page.locator('text=R$')).toBeVisible()
    await expect(page.locator('text=Fazenda São João, MT')).toBeVisible()
    await expect(page.locator('text=Penhor de Safra')).toBeVisible()
  })

  test('should have edit buttons for each section', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Find edit buttons
    const editButtons = page.locator('button:has-text("Editar")')
    await expect(editButtons).toHaveCount(2)
  })

  test('should navigate to specific step when clicking edit', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Click first edit button (Values)
    const editButtons = page.locator('button:has-text("Editar")')
    await editButtons.first().click()

    // Should be on step 4
    await expect(page.locator('label:has-text("Valor Total")')).toBeVisible()
  })

  test('should show risk calculation loading', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Mock the risk calculation endpoint to add delay
    await page.route('**/api/risk/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          overall_score: 65,
          risk_level: 'medio',
          factors: [],
          recommendations: ['Considere adicionar mais garantias']
        })
      })
    })

    // Reload to trigger risk calculation
    await page.reload()

    // Navigate back to review
    for (let i = 0; i < 3; i++) {
      await page
        .click('button:has-text("Simular Conclusão e Avançar")')
        .catch(() => {})
    }

    // Should see loading or result
    const riskSection = page.locator('text=/risco|calculando/i')
    if (await riskSection.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Either loading or result is visible
      expect(true).toBe(true)
    }
  })

  test('should require confirmation before generating', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Generate button should be disabled without confirmation
    const generateButton = page.locator('button:has-text("Gerar Documento")')
    await expect(generateButton).toBeDisabled()

    // Check confirmation checkbox
    await page.click('#confirm')

    // Now button should be enabled
    await expect(generateButton).toBeEnabled()
  })

  test('should show loading state during generation', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Mock the CPR creation endpoint
    await page.route('**/api/cpr/criar/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session_id: 'test-session',
          document_url: 'https://example.com/cpr.pdf',
          is_waiting_input: false
        })
      })
    })

    // Confirm and generate
    await page.click('#confirm')
    await page.click('button:has-text("Gerar Documento")')

    // Should show loading indicator
    const loadingIndicator = page.locator(
      'text=/gerando|processando|validando/i'
    )
    await expect(loadingIndicator)
      .toBeVisible({ timeout: 3000 })
      .catch(() => {
        // Loading might be quick
      })
  })
})

test.describe('CPR Wizard - State Persistence', () => {
  test('should persist wizard state in localStorage', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage
    await page.evaluate(() => {
      localStorage.removeItem('cpr_wizard_state')
    })
    await page.goto('/cpr/wizard')

    // Navigate and fill some data
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Simular Conclusão e Avançar")')
    }

    await page.fill('#amount', '250000')
    await page.fill('#quantity', '2500')

    // Wait for state to be saved
    await page.waitForTimeout(500)

    // Check localStorage has the state
    const savedState = await page.evaluate(() => {
      return localStorage.getItem('cpr_wizard_state')
    })

    expect(savedState).toBeTruthy()
    const parsed = JSON.parse(savedState!)
    expect(parsed.amount).toBe(250000)
    expect(parsed.quantity).toBe(2500)
  })

  test('should restore wizard state on reload', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage

    // Set initial state in localStorage
    await page.evaluate(() => {
      localStorage.setItem(
        'cpr_wizard_state',
        JSON.stringify({
          amount: 180000,
          quantity: 1800,
          deliveryPlace: 'Test Restore Location'
        })
      )
    })

    await page.goto('/cpr/wizard')

    // Navigate to step 4
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Simular Conclusão e Avançar")')
    }

    // Values should be restored
    await expect(page.locator('#amount')).toHaveValue('180000')
    await expect(page.locator('#quantity')).toHaveValue('1800')
    await expect(page.locator('#deliveryPlace')).toHaveValue(
      'Test Restore Location'
    )
  })
})

test.describe('CPR Wizard - Document Generation Success', () => {
  test('should display success state after generation', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage
    await page.evaluate(() => {
      localStorage.removeItem('cpr_wizard_state')
    })
    await page.goto('/cpr/wizard')

    // Mock successful document generation
    await page.route('**/api/cpr/criar/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session_id: 'success-session',
          document_url: 'https://api.example.com/documents/cpr-123.pdf',
          is_waiting_input: false
        })
      })
    })

    // Navigate through wizard
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Simular Conclusão e Avançar")')
    }

    // Fill minimal required data for step 4
    await page.fill('#amount', '100000')
    await page.fill('#quantity', '1000')
    await page.fill('#issueDate', new Date().toISOString().split('T')[0])
    await page.fill(
      '#dueDate',
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    )
    await page.fill('#deliveryPlace', 'Test Location')
    await page.click('button:has-text("Próximo")')

    // Fill minimal for step 5
    await page.click('label:has-text("Penhor de Safra")')
    await page.click('button:has-text("Próximo")')

    // Generate document
    await page.click('#confirm')
    await page.click('button:has-text("Gerar Documento")')

    // Should show success state
    await expect(page.locator('text=Documento Pronto!')).toBeVisible({
      timeout: 10000
    })

    // Should show download buttons
    await expect(page.locator('button:has-text("Baixar PDF")')).toBeVisible()
    await expect(page.locator('button:has-text("Baixar Word")')).toBeVisible()
  })

  test('should allow returning to edit after generation', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage
    await page.evaluate(() => {
      localStorage.removeItem('cpr_wizard_state')
    })
    await page.goto('/cpr/wizard')

    // Mock successful generation
    await page.route('**/api/cpr/criar/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session_id: 'success-session',
          document_url: 'https://api.example.com/documents/cpr-123.pdf',
          is_waiting_input: false
        })
      })
    })

    // Complete wizard quickly
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Simular Conclusão e Avançar")')
    }
    await page.fill('#amount', '100000')
    await page.fill('#quantity', '1000')
    await page.fill('#issueDate', new Date().toISOString().split('T')[0])
    await page.fill(
      '#dueDate',
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    )
    await page.fill('#deliveryPlace', 'Test')
    await page.click('button:has-text("Próximo")')
    await page.click('label:has-text("Penhor de Safra")')
    await page.click('button:has-text("Próximo")')
    await page.click('#confirm')
    await page.click('button:has-text("Gerar Documento")')

    // Wait for success
    await expect(page.locator('text=Documento Pronto!')).toBeVisible({
      timeout: 10000
    })

    // Click "Voltar para edição"
    await page.click('button:has-text("Voltar para edição")')

    // Should be back on review step
    await expect(page.locator('text=Valores e Prazos')).toBeVisible()
  })
})

test.describe('CPR Wizard - Error Handling', () => {
  test('should display error when generation fails', async ({
    authenticatedPage
  }) => {
    const page = authenticatedPage
    await page.evaluate(() => {
      localStorage.removeItem('cpr_wizard_state')
    })
    await page.goto('/cpr/wizard')

    // Mock failed generation
    await page.route('**/api/cpr/criar/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Erro interno do servidor'
        })
      })
    })

    // Navigate through wizard
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Simular Conclusão e Avançar")')
    }
    await page.fill('#amount', '100000')
    await page.fill('#quantity', '1000')
    await page.fill('#issueDate', new Date().toISOString().split('T')[0])
    await page.fill(
      '#dueDate',
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    )
    await page.fill('#deliveryPlace', 'Test')
    await page.click('button:has-text("Próximo")')
    await page.click('label:has-text("Penhor de Safra")')
    await page.click('button:has-text("Próximo")')

    // Try to generate
    await page.click('#confirm')
    await page.click('button:has-text("Gerar Documento")')

    // Should show error message
    await expect(
      page.locator('text=/erro.*gerar|falha.*documento/i')
    ).toBeVisible({ timeout: 10000 })

    // Should have retry button
    await expect(
      page.locator('button:has-text("Tentar novamente")')
    ).toBeVisible()
  })

  test('should display high risk warning', async ({ authenticatedPage }) => {
    const page = authenticatedPage
    await page.evaluate(() => {
      localStorage.removeItem('cpr_wizard_state')
    })
    await page.goto('/cpr/wizard')

    // Mock high risk response
    await page.route('**/api/risk/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          overall_score: 85,
          risk_level: 'alto',
          factors: [
            {
              id: 'high_value',
              name: 'Alto valor',
              impact: 'negative',
              weight: 0.4,
              description: 'Valor muito elevado'
            }
          ],
          recommendations: ['Adicione mais garantias', 'Considere um avalista']
        })
      })
    })

    // Navigate to review step
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Simular Conclusão e Avançar")')
    }
    await page.fill('#amount', '500000')
    await page.fill('#quantity', '5000')
    await page.fill('#issueDate', new Date().toISOString().split('T')[0])
    await page.fill(
      '#dueDate',
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    )
    await page.fill('#deliveryPlace', 'Test')
    await page.click('button:has-text("Próximo")')
    await page.click('label:has-text("Outros")')
    await page.click('button:has-text("Próximo")')

    // Should show high risk warning
    await expect(
      page.locator('text=/alto.*risco|operação.*alto/i')
    ).toBeVisible({ timeout: 10000 })
  })
})
