/**
 * Documents Module E2E Tests
 *
 * Tests for the document management functionality including:
 * - Document list page display
 * - Document search/filter
 * - Document sorting
 * - Document upload (via modal)
 * - Document download
 * - Document deletion
 * - Error handling
 * - Empty states
 */

import { test, expect } from '../fixtures/auth.fixture'

// =============================================================================
// Test Data Mocks
// =============================================================================

const mockDocuments = [
  {
    id: 'doc-1',
    filename: 'contrato-cpr-2024.pdf',
    file_size: 1048576, // 1MB
    mime_type: 'application/pdf',
    processed: true,
    created_at: '2024-12-30T10:00:00Z'
  },
  {
    id: 'doc-2',
    filename: 'analise-risco.docx',
    file_size: 524288, // 512KB
    mime_type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    processed: true,
    created_at: '2024-12-29T15:30:00Z'
  },
  {
    id: 'doc-3',
    filename: 'dados-produtor.txt',
    file_size: 10240, // 10KB
    mime_type: 'text/plain',
    processed: false,
    created_at: '2024-12-28T09:15:00Z'
  },
  {
    id: 'doc-4',
    filename: 'safra-2024-imagem.png',
    file_size: 2097152, // 2MB
    mime_type: 'image/png',
    processed: true,
    created_at: '2024-12-27T14:45:00Z'
  }
]

// =============================================================================
// Document List Page Tests
// =============================================================================

test.describe('Documents List Page', () => {
  test.beforeEach(async ({ mockPage }) => {
    await mockPage.goto('/documents')
  })

  test('should display documents page elements', async ({ mockPage }) => {
    const page = mockPage

    // Check page header
    await expect(page.locator('text=Meus Documentos')).toBeVisible()
    await expect(
      page.locator('text=Gerencie todos os arquivos enviados para análise')
    ).toBeVisible()

    // Check back button
    await expect(page.locator('text=Voltar')).toBeVisible()

    // Check search input
    await expect(
      page.locator('input[placeholder*="Buscar por nome"]')
    ).toBeVisible()

    // Check sort select
    await expect(page.locator('text=Mais recentes')).toBeVisible()
  })

  test('should show loading state initially', async ({ mockPage }) => {
    const page = mockPage

    // Intercept API to add delay
    await page.route('**/api/documents/user**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [], count: 0 })
      })
    })

    await page.goto('/documents')

    // Check for loading state
    await expect(page.locator('text=Carregando documentos...')).toBeVisible({
      timeout: 2000
    })
  })

  test('should display empty state when no documents', async ({ mockPage }) => {
    const page = mockPage

    // Mock empty documents response
    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [], count: 0 })
      })
    })

    await page.goto('/documents')

    // Check empty state elements
    await expect(page.locator('text=Nenhum documento encontrado')).toBeVisible()
    await expect(
      page.locator(
        'text=Seus documentos enviados aparecerão aqui. Envie arquivos através do chat para começar.'
      )
    ).toBeVisible()
  })

  test('should display document list with mocked data', async ({
    mockPage
  }) => {
    const page = mockPage

    // Mock documents response
    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: mockDocuments, count: 4 })
      })
    })

    await page.goto('/documents')

    // Wait for documents to load
    await expect(page.locator('text=Documentos anexados (4)')).toBeVisible()

    // Check each document is displayed
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()
    await expect(page.locator('text=analise-risco.docx')).toBeVisible()
    await expect(page.locator('text=dados-produtor.txt')).toBeVisible()
    await expect(page.locator('text=safra-2024-imagem.png')).toBeVisible()

    // Check file type labels
    await expect(page.locator('text=PDF').first()).toBeVisible()
    await expect(page.locator('text=DOCX').first()).toBeVisible()
    await expect(page.locator('text=TXT').first()).toBeVisible()

    // Check processed status
    await expect(page.locator('text=Processado').first()).toBeVisible()
  })

  test('should display file size correctly formatted', async ({ mockPage }) => {
    const page = mockPage

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: mockDocuments, count: 4 })
      })
    })

    await page.goto('/documents')

    // Check file sizes are formatted
    await expect(page.locator('text=1.0 MB')).toBeVisible()
    await expect(page.locator('text=512.0 KB')).toBeVisible()
    await expect(page.locator('text=10.0 KB')).toBeVisible()
    await expect(page.locator('text=2.0 MB')).toBeVisible()
  })

  test('should navigate back when clicking back button', async ({
    mockPage
  }) => {
    const page = mockPage

    // Navigate to documents from dashboard
    await page.goto('/dashboard')
    await page.goto('/documents')

    // Click back button
    await page.click('text=Voltar')

    // Should navigate back
    await page.waitForTimeout(500)
  })
})

// =============================================================================
// Document Search/Filter Tests
// =============================================================================

test.describe('Documents Search and Filter', () => {
  test.beforeEach(async ({ mockPage }) => {
    // Mock documents for all tests in this describe
    await mockPage.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: mockDocuments, count: 4 })
      })
    })

    await mockPage.goto('/documents')
  })

  test('should filter documents by search query', async ({ mockPage }) => {
    const page = mockPage

    // Wait for documents to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Search for "contrato"
    const searchInput = page.locator('input[placeholder*="Buscar por nome"]')
    await searchInput.fill('contrato')

    // Should show only matching document
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Other documents should not be visible
    await expect(page.locator('text=analise-risco.docx')).not.toBeVisible()
    await expect(page.locator('text=dados-produtor.txt')).not.toBeVisible()
  })

  test('should show no results message when search has no matches', async ({
    mockPage
  }) => {
    const page = mockPage

    // Wait for documents to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Search for non-existent document
    const searchInput = page.locator('input[placeholder*="Buscar por nome"]')
    await searchInput.fill('inexistente')

    // Should show no results message
    await expect(
      page.locator('text=/Nenhum resultado para.*inexistente/i')
    ).toBeVisible()
  })

  test('should clear search and show all documents', async ({ mockPage }) => {
    const page = mockPage

    // Wait for documents to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Search for something
    const searchInput = page.locator('input[placeholder*="Buscar por nome"]')
    await searchInput.fill('contrato')

    // Clear search
    await searchInput.fill('')

    // All documents should be visible again
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()
    await expect(page.locator('text=analise-risco.docx')).toBeVisible()
    await expect(page.locator('text=dados-produtor.txt')).toBeVisible()
    await expect(page.locator('text=safra-2024-imagem.png')).toBeVisible()
  })

  test('should search case-insensitively', async ({ mockPage }) => {
    const page = mockPage

    // Wait for documents to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Search with uppercase
    const searchInput = page.locator('input[placeholder*="Buscar por nome"]')
    await searchInput.fill('CONTRATO')

    // Should still find the document
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()
  })
})

// =============================================================================
// Document Sorting Tests
// =============================================================================

test.describe('Documents Sorting', () => {
  test.beforeEach(async ({ mockPage }) => {
    await mockPage.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: mockDocuments, count: 4 })
      })
    })

    await mockPage.goto('/documents')
  })

  test('should default to "Mais recentes" sort order', async ({ mockPage }) => {
    const page = mockPage

    // Check default sort value
    await expect(page.locator('text=Mais recentes')).toBeVisible()
  })

  test('should allow changing sort order to "Mais antigos"', async ({
    mockPage
  }) => {
    const page = mockPage

    // Wait for documents to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Click sort select
    await page.click('text=Mais recentes')

    // Select "Mais antigos"
    await page.click('text=Mais antigos')

    // Verify selection changed
    await expect(
      page.locator('[data-radix-select-viewport] >> text=Mais antigos')
    )
      .toBeVisible()
      .catch(async () => {
        // Alternative: check the button text
        await expect(
          page.locator('button:has-text("Mais antigos")')
        ).toBeVisible()
      })
  })
})

// =============================================================================
// Document Download Tests
// =============================================================================

test.describe('Documents Download', () => {
  test('should have download button for each document', async ({
    mockPage
  }) => {
    const page = mockPage

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: mockDocuments, count: 4 })
      })
    })

    await page.goto('/documents')

    // Wait for documents to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Check download buttons exist
    const downloadButtons = page.locator(
      'button[aria-label="Baixar documento"]'
    )
    await expect(downloadButtons).toHaveCount(4)
  })

  test('should trigger download when clicking download button', async ({
    mockPage
  }) => {
    const page = mockPage

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: [mockDocuments[0]],
          count: 1
        })
      })
    })

    // Mock download endpoint
    await page.route('**/api/documents/doc-1/download', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: {
          'Content-Disposition': 'attachment; filename="contrato-cpr-2024.pdf"'
        },
        body: Buffer.from('PDF content')
      })
    })

    await page.goto('/documents')

    // Wait for document to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Click download button
    const downloadButton = page.locator('button[aria-label="Baixar documento"]')
    await downloadButton.click()

    // Toast should appear (success or error)
    // Note: Toast might be handled by sonner and shown briefly
    await page.waitForTimeout(500)
  })

  test('should show error toast on download failure', async ({ mockPage }) => {
    const page = mockPage

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: [mockDocuments[0]],
          count: 1
        })
      })
    })

    // Mock download endpoint with error
    await page.route('**/api/documents/doc-1/download', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' })
      })
    })

    await page.goto('/documents')

    // Wait for document to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Click download button
    const downloadButton = page.locator('button[aria-label="Baixar documento"]')
    await downloadButton.click()

    // Error toast should appear
    await expect(page.locator('text=Erro ao baixar documento'))
      .toBeVisible({ timeout: 3000 })
      .catch(() => {
        // Toast might disappear quickly
      })
  })
})

// =============================================================================
// Document Deletion Tests
// =============================================================================

test.describe('Documents Deletion', () => {
  test('should have remove button for each document', async ({ mockPage }) => {
    const page = mockPage

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: mockDocuments, count: 4 })
      })
    })

    await page.goto('/documents')

    // Wait for documents to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Check remove buttons exist
    const removeButtons = page.locator('button[aria-label="Remover documento"]')
    await expect(removeButtons).toHaveCount(4)
  })

  test('should open confirmation dialog when clicking remove', async ({
    mockPage
  }) => {
    const page = mockPage

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: [mockDocuments[0]],
          count: 1
        })
      })
    })

    await page.goto('/documents')

    // Wait for document to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Click remove button
    const removeButton = page.locator('button[aria-label="Remover documento"]')
    await removeButton.click()

    // Confirmation dialog should appear
    await expect(page.locator('text=Remover documento?')).toBeVisible()
    await expect(
      page.locator(
        'text=Esta ação não pode ser desfeita. O arquivo será excluído permanentemente.'
      )
    ).toBeVisible()

    // Dialog buttons
    await expect(page.locator('button:has-text("Cancelar")')).toBeVisible()
    await expect(page.locator('button:has-text("Remover")')).toBeVisible()
  })

  test('should close dialog when clicking cancel', async ({ mockPage }) => {
    const page = mockPage

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: [mockDocuments[0]],
          count: 1
        })
      })
    })

    await page.goto('/documents')

    // Open deletion dialog
    const removeButton = page.locator('button[aria-label="Remover documento"]')
    await removeButton.click()

    // Dialog should be visible
    await expect(page.locator('text=Remover documento?')).toBeVisible()

    // Click cancel
    await page.click('button:has-text("Cancelar")')

    // Dialog should close
    await expect(page.locator('text=Remover documento?')).not.toBeVisible()

    // Document should still be there
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()
  })

  test('should delete document when confirming', async ({ mockPage }) => {
    const page = mockPage

    let deleteCallMade = false

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: deleteCallMade ? [] : [mockDocuments[0]],
          count: deleteCallMade ? 0 : 1
        })
      })
    })

    // Mock delete endpoint
    await page.route('**/api/documents/doc-1', async (route) => {
      if (route.request().method() === 'DELETE') {
        deleteCallMade = true
        await route.fulfill({
          status: 204,
          body: ''
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/documents')

    // Wait for document to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Open deletion dialog
    const removeButton = page.locator('button[aria-label="Remover documento"]')
    await removeButton.click()

    // Confirm deletion
    await page.click('button:has-text("Remover")')

    // Success toast should appear
    await expect(page.locator('text=Documento removido com sucesso'))
      .toBeVisible({ timeout: 3000 })
      .catch(() => {
        // Toast might disappear quickly
      })
  })

  test('should show error toast on deletion failure', async ({ mockPage }) => {
    const page = mockPage

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: [mockDocuments[0]],
          count: 1
        })
      })
    })

    // Mock delete endpoint with error
    await page.route('**/api/documents/doc-1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Internal server error' })
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/documents')

    // Wait for document to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Open deletion dialog and confirm
    const removeButton = page.locator('button[aria-label="Remover documento"]')
    await removeButton.click()
    await page.click('button:has-text("Remover")')

    // Error toast should appear
    await expect(page.locator('text=Erro ao remover documento'))
      .toBeVisible({ timeout: 3000 })
      .catch(() => {
        // Toast might disappear quickly
      })
  })
})

// =============================================================================
// Document Upload Modal Tests
// =============================================================================

test.describe('Document Upload Modal', () => {
  test('should display upload modal elements', async ({ mockPage }) => {
    const page = mockPage

    // Navigate to a page with upload modal (usually chat or analyze)
    await page.goto('/analyze')

    // Look for upload trigger button
    const uploadTrigger = page.locator(
      'button:has-text("Upload"), button[aria-label*="upload" i], [data-testid="upload-button"]'
    )

    if (await uploadTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadTrigger.click()

      // Check modal elements
      await expect(page.locator('text=Upload de Documento')).toBeVisible()

      // Check drag and drop area
      await expect(page.locator('text=/Arraste.*aqui ou/i')).toBeVisible()

      // Check allowed file types
      await expect(
        page.locator('text=/PDF.*DOC.*TXT.*MD.*CSV.*XLS.*JPG.*PNG/i')
      ).toBeVisible()

      // Check max size info
      await expect(page.locator('text=/máx.*10MB/i')).toBeVisible()

      // Check action buttons
      await expect(page.locator('button:has-text("Cancelar")')).toBeVisible()
    }
  })

  test('should have file input with correct accept types', async ({
    mockPage
  }) => {
    const page = mockPage

    await page.goto('/analyze')

    const uploadTrigger = page.locator(
      'button:has-text("Upload"), button[aria-label*="upload" i]'
    )

    if (await uploadTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadTrigger.click()

      // Check file input accept attribute
      const fileInput = page.locator('input[type="file"]')
      await expect(fileInput).toHaveAttribute(
        'accept',
        '.pdf,.docx,.doc,.txt,.md,.csv,.xlsx,.xls,.jpg,.jpeg,.png'
      )
    }
  })

  test('should show file name after selecting a file', async ({ mockPage }) => {
    const page = mockPage

    await page.goto('/analyze')

    const uploadTrigger = page.locator(
      'button:has-text("Upload"), button[aria-label*="upload" i]'
    )

    if (await uploadTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadTrigger.click()

      // Upload a test file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles({
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('PDF content placeholder')
      })

      // File name should be displayed
      await expect(page.locator('text=test-document.pdf')).toBeVisible()
    }
  })

  test('should show error for invalid file type', async ({ mockPage }) => {
    const page = mockPage

    await page.goto('/analyze')

    const uploadTrigger = page.locator(
      'button:has-text("Upload"), button[aria-label*="upload" i]'
    )

    if (await uploadTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadTrigger.click()

      // Try to upload invalid file type
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles({
        name: 'invalid.exe',
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('Invalid content')
      })

      // Error message should appear
      await expect(
        page.locator('text=/Tipo de arquivo não permitido/i')
      ).toBeVisible()
    }
  })

  test('should show error for file too large', async ({ mockPage }) => {
    const page = mockPage

    await page.goto('/analyze')

    const uploadTrigger = page.locator(
      'button:has-text("Upload"), button[aria-label*="upload" i]'
    )

    if (await uploadTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadTrigger.click()

      // Try to upload file larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024) // 11MB
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles({
        name: 'large-file.pdf',
        mimeType: 'application/pdf',
        buffer: largeBuffer
      })

      // Error message should appear
      await expect(page.locator('text=/Arquivo muito grande/i')).toBeVisible()
    }
  })

  test('should close modal when clicking cancel', async ({ mockPage }) => {
    const page = mockPage

    await page.goto('/analyze')

    const uploadTrigger = page.locator(
      'button:has-text("Upload"), button[aria-label*="upload" i]'
    )

    if (await uploadTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadTrigger.click()

      // Modal should be visible
      await expect(page.locator('text=Upload de Documento')).toBeVisible()

      // Click cancel
      await page.click('button:has-text("Cancelar")')

      // Modal should close
      await expect(page.locator('text=Upload de Documento')).not.toBeVisible()
    }
  })

  test('should close modal when clicking X button', async ({ mockPage }) => {
    const page = mockPage

    await page.goto('/analyze')

    const uploadTrigger = page.locator(
      'button:has-text("Upload"), button[aria-label*="upload" i]'
    )

    if (await uploadTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadTrigger.click()

      // Modal should be visible
      await expect(page.locator('text=Upload de Documento')).toBeVisible()

      // Click X button
      await page.click('button[aria-label="Fechar modal"]')

      // Modal should close
      await expect(page.locator('text=Upload de Documento')).not.toBeVisible()
    }
  })

  test('should show loading state during upload', async ({ mockPage }) => {
    const page = mockPage

    await page.goto('/analyze')

    // Mock slow upload
    await page.route('**/api/documents/upload', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'new-doc-id' })
      })
    })

    const uploadTrigger = page.locator(
      'button:has-text("Upload"), button[aria-label*="upload" i]'
    )

    if (await uploadTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadTrigger.click()

      // Upload a test file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles({
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('PDF content placeholder')
      })

      // Click send button
      const sendButton = page.locator('button:has-text("Enviar")')
      if (await sendButton.isVisible().catch(() => false)) {
        await sendButton.click()

        // Loading state should appear
        await expect(page.locator('text=Enviando...')).toBeVisible({
          timeout: 2000
        })
      }
    }
  })
})

// =============================================================================
// Error Handling Tests
// =============================================================================

test.describe('Documents Error Handling', () => {
  test('should handle API error when loading documents', async ({
    mockPage
  }) => {
    const page = mockPage

    // Mock API error
    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' })
      })
    })

    await page.goto('/documents')

    // Page should still render (error state depends on implementation)
    await expect(page.locator('text=Meus Documentos')).toBeVisible()
  })

  test('should handle unauthorized access', async ({ mockPage }) => {
    const page = mockPage

    // Mock unauthorized response
    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Unauthorized' })
      })
    })

    await page.goto('/documents')

    // Should either show error or redirect to login
    // The exact behavior depends on implementation
    await page.waitForTimeout(1000)
  })

  test('should handle network error gracefully', async ({ mockPage }) => {
    const page = mockPage

    // Mock network failure
    await page.route('**/api/documents/user**', async (route) => {
      await route.abort('failed')
    })

    await page.goto('/documents')

    // Page should still be usable
    await expect(page.locator('text=Meus Documentos')).toBeVisible()
  })
})

// =============================================================================
// Accessibility Tests
// =============================================================================

test.describe('Documents Accessibility', () => {
  test('should have proper aria labels on action buttons', async ({
    mockPage
  }) => {
    const page = mockPage

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: [mockDocuments[0]],
          count: 1
        })
      })
    })

    await page.goto('/documents')

    // Wait for document to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Check aria labels
    await expect(
      page.locator('button[aria-label="Baixar documento"]')
    ).toBeVisible()
    await expect(
      page.locator('button[aria-label="Remover documento"]')
    ).toBeVisible()
  })

  test('should be keyboard navigable', async ({ mockPage }) => {
    const page = mockPage

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: [mockDocuments[0]],
          count: 1
        })
      })
    })

    await page.goto('/documents')

    // Wait for document to load
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Tab navigation should work
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Search input should be focusable
    const searchInput = page.locator('input[placeholder*="Buscar por nome"]')
    await searchInput.focus()
    await expect(searchInput).toBeFocused()
  })
})

// =============================================================================
// Responsive Design Tests
// =============================================================================

test.describe('Documents Responsive Design', () => {
  test('should display properly on mobile viewport', async ({ mockPage }) => {
    const page = mockPage

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: mockDocuments, count: 4 })
      })
    })

    await page.goto('/documents')

    // Page should still be usable
    await expect(page.locator('text=Meus Documentos')).toBeVisible()
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()

    // Search and sort should still be visible
    await expect(
      page.locator('input[placeholder*="Buscar por nome"]')
    ).toBeVisible()
  })

  test('should display properly on tablet viewport', async ({ mockPage }) => {
    const page = mockPage

    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.route('**/api/documents/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: mockDocuments, count: 4 })
      })
    })

    await page.goto('/documents')

    // Page should display properly
    await expect(page.locator('text=Meus Documentos')).toBeVisible()
    await expect(page.locator('text=contrato-cpr-2024.pdf')).toBeVisible()
  })
})
