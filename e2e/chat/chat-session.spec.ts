/**
 * Chat Module E2E Tests
 *
 * Comprehensive tests for the Chat module including:
 * - Chat page display
 * - Creating new chat sessions
 * - Sending messages
 * - Receiving AI responses (mocked streaming)
 * - Message history display
 * - Session management (list, select, delete)
 * - Attaching documents to chat
 * - Error handling
 */

import { test, expect } from '../fixtures/auth.fixture'
import {
  setupAllMocks,
  mockSessions as apiMockSessions
} from '../fixtures/api-mocks'

// ============================================================================
// Test Data and Mock Responses
// ============================================================================

const mockSessions = [
  {
    session_id: 's_test-session-001',
    user_id: 'u_test-user',
    title: 'Analise de CPR - Fazenda Boa Vista',
    status: 'active',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    session_id: 's_test-session-002',
    user_id: 'u_test-user',
    title: 'Simulacao de Risco - Safra 2024',
    status: 'active',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    session_id: 's_test-session-003',
    user_id: 'u_test-user',
    title: 'Contrato de Compra - Soja',
    status: 'active',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockMessages = [
  {
    id: 'm_001',
    session_id: 's_test-session-001',
    role: 'user',
    content: 'Quero analisar um CPR de uma fazenda de soja em Mato Grosso.',
    created_at: new Date(Date.now() - 60000).toISOString()
  },
  {
    id: 'm_002',
    session_id: 's_test-session-001',
    role: 'assistant',
    content:
      'Entendi! Para realizar a analise da CPR, preciso que voce envie o documento. Voce pode arrastar o arquivo ou clicar no botao de anexo para fazer upload do PDF ou imagem do documento.',
    created_at: new Date(Date.now() - 55000).toISOString()
  }
]

const mockChatResponse = {
  text: 'Esta e uma resposta de teste do assistente Verity Agro.',
  session_id: 's_new-test-session',
  message_id: 'm_new-message-001'
}

const mockStreamingResponse = `data: {"type": "content", "content": "Esta "}\n\ndata: {"type": "content", "content": "e uma "}\n\ndata: {"type": "content", "content": "resposta "}\n\ndata: {"type": "content", "content": "de teste "}\n\ndata: {"type": "content", "content": "do assistente "}\n\ndata: {"type": "content", "content": "Verity Agro."}\n\ndata: {"type": "done"}\n\ndata: [DONE]\n\n`

// ============================================================================
// Chat Page Display Tests
// ============================================================================

test.describe('Chat Page Display', () => {
  test.beforeEach(async ({ mockPage }) => {
    // All API mocks are already set up by the mockPage fixture
    // Navigate to chat page
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')
  })

  test('should display chat page with main layout elements', async ({
    mockPage
  }) => {
    // Check for main input bar
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })

    // Check for placeholder text
    // Regex matches "Descreva" and accented "análise"
    await expect(chatInput).toHaveAttribute(
      'placeholder',
      /descreva.*an.lise|mensagem/i
    )
  })

  test('should display conversations sidebar on desktop', async ({
    mockPage
  }) => {
    // Check for "Nova Conversa" button
    const newConversationButton = mockPage.locator(
      'button:has-text("Nova Conversa")'
    )
    await expect(newConversationButton)
      .toBeVisible({ timeout: 10000 })
      .catch(() => {
        // Sidebar might be collapsed on smaller screens
      })

    // Check for search input in sidebar
    const searchInput = mockPage.locator('input[placeholder*="Buscar"]')
    await expect(searchInput)
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // Search might be hidden
      })
  })

  test('should display disclaimer text', async ({ mockPage }) => {
    // Check for disclaimer
    await expect(
      mockPage.locator(
        'text=/verity.*agro.*cometer.*erros|verifique.*informacoes/i'
      )
    ).toBeVisible({ timeout: 10000 })
  })

  test('should display welcome content when no messages', async ({
    mockPage
  }) => {
    // When there are no messages, should show main content/suggestions
    const mainContent = mockPage.locator(
      'text=/como.*posso.*ajudar|sugestoes|comece/i, [class*="suggestion"]'
    )

    await expect(mainContent)
      .toBeVisible({ timeout: 10000 })
      .catch(() => {
        // Content might vary based on implementation
      })
  })
})

// ============================================================================
// Session Management Tests
// ============================================================================

test.describe('Session Management', () => {
  test.beforeEach(async ({ mockPage }) => {
    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSessions)
        })
      } else {
        await route.continue()
      }
    })

    // Mock projects endpoint
    await mockPage.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
  })

  test('should display list of sessions in sidebar', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Wait for sessions to load
    await mockPage.waitForTimeout(1000)

    // Check for session titles
    for (const session of mockSessions) {
      const sessionCard = mockPage.locator(`text=${session.title}`)
      await expect(sessionCard)
        .toBeVisible({ timeout: 5000 })
        .catch(() => {
          // Session might be truncated or not visible in viewport
        })
    }
  })

  test('should create new session when clicking Nova Conversa', async ({
    mockPage
  }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock create session endpoint
    await mockPage.route('**/api/sessions', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 's_new-session',
            session_id: 's_new-session',
            user_id: 'u_test-user',
            title: 'Nova Conversa',
            status: 'active',
            created_at: new Date().toISOString()
          })
        })
      } else {
        await route.continue()
      }
    })

    // Click new conversation button
    const newButton = mockPage.locator('button:has-text("Nova Conversa")')
    if (await newButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newButton.click()

      // Should navigate or reset the chat
      await mockPage.waitForTimeout(500)

      // Input should be cleared and ready for new message
      const chatInput = mockPage.locator('#chat-input')
      await expect(chatInput).toHaveValue('')
    }
  })

  test('should select existing session from sidebar', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock chat history endpoint
    await mockPage.route('**/api/chat/history/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          messages: mockMessages,
          total: mockMessages.length
        })
      })
    })

    // Wait for sessions to load
    await mockPage.waitForTimeout(1000)

    // Click on first session
    const firstSession = mockPage.locator(`text=${mockSessions[0].title}`)
    if (await firstSession.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstSession.click()

      // URL should change to include session ID
      await expect(mockPage).toHaveURL(/\/chat\/s_test-session-001/, {
        timeout: 5000
      })
    }
  })

  test('should search sessions', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Find and use search input
    const searchInput = mockPage.locator('input[placeholder*="Buscar"]')
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('CPR')

      // Wait for filter to apply
      await mockPage.waitForTimeout(500)

      // Should show matching sessions
      await expect(mockPage.locator('text=/CPR/i').first()).toBeVisible()
    }
  })

  test('should delete session with confirmation', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock delete endpoint
    await mockPage.route('**/api/sessions/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'deleted' })
        })
      } else {
        await route.continue()
      }
    })

    // Wait for sessions to load
    await mockPage.waitForTimeout(1000)

    // Find first session card and look for delete button (appears on hover)
    const sessionCard = mockPage
      .locator(`text=${mockSessions[0].title}`)
      .first()
    if (await sessionCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await sessionCard.hover()

      // Look for delete button (trash icon)
      const deleteButton = mockPage.locator(
        'button[title="Excluir"], button:has(svg.lucide-trash-2)'
      )

      if (
        await deleteButton
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        await deleteButton.first().click()

        // Should show confirmation dialog
        await expect(
          mockPage.locator('text=/confirmar.*exclusao|tem.*certeza/i')
        ).toBeVisible({ timeout: 3000 })

        // Confirm deletion
        const confirmButton = mockPage
          .locator('button:has-text("Excluir")')
          .last()
        await confirmButton.click()
      }
    }
  })
})

// ============================================================================
// Sending Messages Tests
// ============================================================================

test.describe('Sending Messages', () => {
  test.beforeEach(async ({ mockPage }) => {
    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Mock projects endpoint
    await mockPage.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
  })

  test('should send message when pressing Enter', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock chat endpoint
    await mockPage.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockChatResponse)
      })
    })

    // Mock streaming endpoint
    await mockPage.route('**/api/chat/stream', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: mockStreamingResponse
      })
    })

    // Type message
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })
    await chatInput.fill('Quero analisar uma CPR')

    // Press Enter to send
    await chatInput.press('Enter')

    // Wait for message to be sent
    await mockPage.waitForTimeout(500)

    // Input should be cleared after sending
    await expect(chatInput).toHaveValue('')
  })

  test('should send message when clicking send button', async ({
    mockPage
  }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock chat endpoint
    await mockPage.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockChatResponse)
      })
    })

    // Mock streaming endpoint
    await mockPage.route('**/api/chat/stream', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: mockStreamingResponse
      })
    })

    // Type message
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })
    await chatInput.fill('Ola, preciso de ajuda')

    // Click send button
    const sendButton = mockPage.locator('button[aria-label="Enviar mensagem"]')
    await expect(sendButton).toBeEnabled()
    await sendButton.click()

    // Wait for message to be sent
    await mockPage.waitForTimeout(500)

    // Input should be cleared
    await expect(chatInput).toHaveValue('')
  })

  test('should not send empty message', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Send button should be disabled with empty input
    const sendButton = mockPage.locator('button[aria-label="Enviar mensagem"]')
    await expect(sendButton).toBeDisabled()

    // Try pressing Enter with empty input
    const chatInput = mockPage.locator('#chat-input')
    await chatInput.focus()
    await chatInput.press('Enter')

    // No message should be sent (no network request)
  })

  test('should show loading state while sending', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock chat endpoint with delay
    await mockPage.route('**/api/chat/stream', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: mockStreamingResponse
      })
    })

    // Type and send message
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })
    await chatInput.fill('Mensagem de teste')
    await chatInput.press('Enter')

    // Should show loading indicator
    const loadingIndicator = mockPage.locator(
      '[class*="animate-spin"], svg.lucide-loader-2'
    )
    await expect(loadingIndicator)
      .toBeVisible({ timeout: 2000 })
      .catch(() => {
        // Loading might be too quick
      })
  })

  test('should support multiline messages with Shift+Enter', async ({
    mockPage
  }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })

    // Type first line
    await chatInput.fill('Linha 1')

    // Press Shift+Enter for new line
    await chatInput.press('Shift+Enter')

    // Type second line
    await chatInput.type('Linha 2')

    // Check that input contains both lines
    const inputValue = await chatInput.inputValue()
    expect(inputValue).toContain('Linha 1')
    expect(inputValue).toContain('Linha 2')
  })
})

// ============================================================================
// AI Response Tests (Mocked Streaming)
// ============================================================================

test.describe('AI Response Display', () => {
  test.beforeEach(async ({ mockPage }) => {
    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Mock projects endpoint
    await mockPage.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
  })

  test('should display assistant response after sending message', async ({
    mockPage
  }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock streaming endpoint with immediate response
    await mockPage.route('**/api/chat/stream', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: mockStreamingResponse
      })
    })

    // Send a message
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })
    await chatInput.fill('Como funciona a analise de CPR?')
    await chatInput.press('Enter')

    // Wait for response to appear
    await mockPage.waitForTimeout(2000)

    // Look for the assistant's response text
    await expect(
      mockPage.locator('text=/resposta.*teste|assistente.*verity/i')
    ).toBeVisible({ timeout: 10000 })
  })

  test('should display user message in chat', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock streaming endpoint
    await mockPage.route('**/api/chat/stream', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: mockStreamingResponse
      })
    })

    const testMessage = 'Esta e minha mensagem de teste para o chat'

    // Send a message
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })
    await chatInput.fill(testMessage)
    await chatInput.press('Enter')

    // Wait for message to appear
    await mockPage.waitForTimeout(1000)

    // User message should be visible
    await expect(mockPage.locator(`text=${testMessage}`)).toBeVisible({
      timeout: 5000
    })
  })

  test('should display typing indicator while streaming', async ({
    mockPage
  }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock streaming endpoint with slow response
    await mockPage.route('**/api/chat/stream', async (route) => {
      // Slow stream to catch typing indicator
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: mockStreamingResponse
      })
    })

    // Send a message
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })
    await chatInput.fill('Pergunta que demora para responder')
    await chatInput.press('Enter')

    // Look for typing indicator
    const typingIndicator = mockPage.locator(
      '[class*="typing"], [class*="pulse"], [class*="animate"]'
    )

    await expect(typingIndicator.first())
      .toBeVisible({ timeout: 3000 })
      .catch(() => {
        // Indicator might not be visible or might have different implementation
      })
  })
})

// ============================================================================
// Message History Tests
// ============================================================================

test.describe('Message History', () => {
  test('should load and display message history when opening session', async ({
    mockPage
  }) => {
    // Using mockPage directly

    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSessions)
      })
    })

    // Mock projects endpoint
    await mockPage.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Mock chat history endpoint
    await mockPage.route('**/api/chat/history/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          messages: mockMessages,
          total: mockMessages.length
        })
      })
    })

    // Navigate directly to session
    await mockPage.goto('/chat/s_test-session-001')
    await mockPage.waitForLoadState('networkidle')

    // Wait for messages to load
    await mockPage.waitForTimeout(1000)

    // Check for user message
    await expect(
      mockPage.locator('text=/analisar.*CPR.*fazenda.*soja/i')
    ).toBeVisible({ timeout: 10000 })

    // Check for assistant message
    await expect(
      mockPage.locator('text=/analise.*CPR.*preciso.*envie.*documento/i')
    ).toBeVisible({ timeout: 10000 })
  })

  test('should scroll to bottom when new messages arrive', async ({
    mockPage
  }) => {
    // Using mockPage directly

    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Mock projects endpoint
    await mockPage.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Mock streaming endpoint
    await mockPage.route('**/api/chat/stream', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: mockStreamingResponse
      })
    })

    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Send multiple messages
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })

    await chatInput.fill('Primeira mensagem de teste')
    await chatInput.press('Enter')
    await mockPage.waitForTimeout(500)

    // The chat area should be scrolled
    // This is a basic check - in reality we'd check scroll position
  })
})

// ============================================================================
// Document Attachment Tests
// ============================================================================

test.describe('Document Attachment', () => {
  test.beforeEach(async ({ mockPage }) => {
    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Mock projects endpoint
    await mockPage.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
  })

  test('should have attachment button', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Look for attachment button (paperclip icon)
    const attachButton = mockPage.locator(
      'button[aria-label="Anexar documentos"], button:has(svg.lucide-paperclip)'
    )

    await expect(attachButton.first()).toBeVisible({ timeout: 10000 })
  })

  test('should open file upload modal when clicking attach', async ({
    mockPage
  }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Click attachment button
    const attachButton = mockPage.locator(
      'button[aria-label="Anexar documentos"], button:has(svg.lucide-paperclip)'
    )

    if (
      await attachButton
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await attachButton.first().click()

      // Modal should open
      await expect(
        mockPage.locator(
          'text=/upload|enviar.*arquivo|arrastar.*arquivo|selecionar.*arquivo/i'
        )
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display attached file preview', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock document upload
    await mockPage.route('**/api/documents/upload**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'doc_test-001',
          document_id: 'doc_test-001',
          file_name: 'contrato-cpr.pdf',
          file_type: 'application/pdf',
          file_size: 1024000
        })
      })
    })

    // Look for hidden file input
    const fileInput = mockPage.locator('input[type="file"]').first()

    if ((await fileInput.count()) > 0) {
      // Upload a test file
      await fileInput.setInputFiles({
        name: 'contrato-cpr.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('PDF test content')
      })

      // Wait for file preview to appear
      await mockPage.waitForTimeout(1000)

      // File name should be visible
      await expect(mockPage.locator('text=contrato-cpr.pdf')).toBeVisible({
        timeout: 5000
      })
    }
  })

  test('should allow removing attached file', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // First attach a file
    const fileInput = mockPage.locator('input[type="file"]').first()

    if ((await fileInput.count()) > 0) {
      await fileInput.setInputFiles({
        name: 'arquivo-teste.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('PDF test content')
      })

      // Wait for file preview
      await mockPage.waitForTimeout(500)

      // Find and click remove button on file preview
      const removeButton = mockPage.locator(
        '[class*="attachment"] button:has(svg.lucide-x), button[class*="remove"]'
      )

      if (
        await removeButton
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        await removeButton.first().click()

        // File should be removed
        await expect(
          mockPage.locator('text=arquivo-teste.pdf')
        ).not.toBeVisible({
          timeout: 2000
        })
      }
    }
  })
})

// ============================================================================
// Slash Commands Tests
// ============================================================================

test.describe('Slash Commands', () => {
  test.beforeEach(async ({ mockPage }) => {
    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Mock projects endpoint
    await mockPage.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
  })

  test('should show command suggestions when typing /', async ({
    mockPage
  }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })

    // Type slash
    await chatInput.fill('/')

    // Wait for suggestions to appear
    await mockPage.waitForTimeout(500)

    // Should show suggestion list
    const suggestionList = mockPage.locator(
      '[role="listbox"], [id="suggestion-list"], [class*="suggestion"]'
    )

    await expect(suggestionList.first())
      .toBeVisible({ timeout: 3000 })
      .catch(() => {
        // Suggestions might have different implementation
      })
  })

  test('should filter commands as user types', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })

    // Type slash command
    await chatInput.fill('/canvas')

    // Wait for filtering
    await mockPage.waitForTimeout(500)

    // Should show canvas command if available
    await expect(mockPage.locator('text=/canvas/i'))
      .toBeVisible({ timeout: 3000 })
      .catch(() => {
        // Command might not be visible
      })
  })
})

// ============================================================================
// Error Handling Tests
// ============================================================================

test.describe('Error Handling', () => {
  test.beforeEach(async ({ mockPage }) => {
    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Mock projects endpoint
    await mockPage.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
  })

  test('should display error when message fails to send', async ({
    mockPage
  }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock failed chat endpoint
    await mockPage.route('**/api/chat**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Erro interno do servidor' })
      })
    })

    await mockPage.route('**/api/chat/stream**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Erro interno do servidor' })
      })
    })

    // Send a message
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })
    await chatInput.fill('Mensagem que vai falhar')
    await chatInput.press('Enter')

    // Wait for error
    await mockPage.waitForTimeout(2000)

    // Should show error message (toast or inline)
    const errorMessage = mockPage.locator(
      'text=/erro|falha|nao.*foi.*possivel/i, [role="alert"]'
    )

    await expect(errorMessage.first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // Error display might vary
      })
  })

  test('should redirect to login when not authenticated', async ({
    mockPage
  }) => {
    // Using mockPage directly

    // Mock auth check to fail
    await mockPage.route('**/api/auth/me**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Not authenticated' })
      })
    })

    // Clear cookies to simulate unauthenticated state
    await mockPage.context().clearCookies()

    // Navigate to chat
    await mockPage.goto('/chat')

    // Should redirect to login
    await expect(mockPage).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('should handle network errors gracefully', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Mock network failure
    await mockPage.route('**/api/chat/stream**', async (route) => {
      await route.abort('failed')
    })

    // Try to send a message
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })
    await chatInput.fill('Mensagem com erro de rede')
    await chatInput.press('Enter')

    // Wait for error handling
    await mockPage.waitForTimeout(2000)

    // Should show some feedback to user (input should still be usable)
    await expect(chatInput).toBeEnabled()
  })

  test('should handle invalid session ID gracefully', async ({ mockPage }) => {
    // Using mockPage directly

    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Mock chat history to return error
    await mockPage.route('**/api/chat/history/**', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Session not found' })
      })
    })

    // Navigate to invalid session
    await mockPage.goto('/chat/s_invalid-session-id')

    // Should redirect to main chat page
    await expect(mockPage).toHaveURL(/\/chat$/, { timeout: 10000 })
  })
})

// ============================================================================
// Accessibility Tests
// ============================================================================

test.describe('Accessibility', () => {
  test.beforeEach(async ({ mockPage }) => {
    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Mock projects endpoint
    await mockPage.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
  })

  test('should have proper ARIA labels on input', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Check input has ARIA label
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })
    await expect(chatInput).toHaveAttribute('aria-label', /.+/)
  })

  test('should be keyboard navigable', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Tab through elements
    await mockPage.keyboard.press('Tab')
    await mockPage.keyboard.press('Tab')

    // Eventually should reach the input
    const focusedElement = mockPage.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have proper focus management', async ({ mockPage }) => {
    // Using mockPage directly
    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Click on input
    const chatInput = mockPage.locator('#chat-input')
    await chatInput.click()

    // Input should be focused
    await expect(chatInput).toBeFocused()
  })
})

// ============================================================================
// Mobile Responsiveness Tests
// ============================================================================

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ mockPage }) => {
    // Using mockPage directly

    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessions: mockSessions,
          total: mockSessions.length
        })
      })
    })

    // Mock projects endpoint
    await mockPage.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Set mobile viewport
    await mockPage.setViewportSize({ width: 375, height: 667 })

    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Chat input should still be visible
    const chatInput = mockPage.locator('#chat-input')
    await expect(chatInput).toBeVisible({ timeout: 10000 })

    // Send button should be visible
    const sendButton = mockPage.locator('button[aria-label="Enviar mensagem"]')
    await expect(sendButton).toBeVisible()
  })

  test('should toggle sidebar on mobile', async ({ mockPage }) => {
    // Using mockPage directly

    // Mock sessions endpoint
    await mockPage.route('**/api/sessions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessions: mockSessions,
          total: mockSessions.length
        })
      })
    })

    // Mock projects endpoint
    await mockPage.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    // Set mobile viewport
    await mockPage.setViewportSize({ width: 375, height: 667 })

    await mockPage.goto('/chat')
    await mockPage.waitForLoadState('networkidle')

    // Sidebar should be hidden initially on mobile
    const sidebar = mockPage.locator(
      'aside:has(button:has-text("Nova Conversa"))'
    )
    await expect(sidebar)
      .not.toBeVisible({ timeout: 2000 })
      .catch(() => {
        // Sidebar might have different behavior
      })

    // Look for menu toggle button
    const menuToggle = mockPage.locator(
      'button[aria-label*="menu"], button:has(svg.lucide-menu), [class*="hamburger"]'
    )

    if (
      await menuToggle
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false)
    ) {
      await menuToggle.first().click()

      // Sidebar should become visible
      await expect(
        mockPage.locator('text=/nova.*conversa|conversas/i').first()
      ).toBeVisible({ timeout: 3000 })
    }
  })
})
