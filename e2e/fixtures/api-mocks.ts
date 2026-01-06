/**
 * Centralized API Mocks for E2E Tests
 *
 * Provides mock handlers for all API endpoints, enabling tests to run
 * without a real backend.
 */

import { Page, Route } from '@playwright/test'

// ============================================================================
// Mock Data
// ============================================================================

export const mockUser = {
  id: 'u_mock-user-001',
  email: 'test@verity.agro',
  name: 'Usuário de Teste',
  role: 'user',
  organization_id: 'org_test-001',
  is_active: true,
  created_at: new Date().toISOString()
}

export const mockAdminUser = {
  ...mockUser,
  id: 'u_mock-admin-001',
  email: 'admin@verity.agro',
  name: 'Admin de Teste',
  role: 'admin'
}

export const mockOrganization = {
  id: 'org_test-001',
  name: 'Fazenda Teste',
  logo_url: null,
  primary_color: '#16a34a',
  plan_tier: 'pro',
  created_at: new Date().toISOString()
}

export const mockSessions = [
  {
    session_id: 's_test-session-001',
    user_id: mockUser.id,
    title: 'Análise de CPR - Fazenda Boa Vista',
    status: 'active',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    session_id: 's_test-session-002',
    user_id: mockUser.id,
    title: 'Simulação de Risco - Safra 2024',
    status: 'active',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const mockMessages = [
  {
    id: 'm_001',
    session_id: 's_test-session-001',
    role: 'user',
    content: 'Quero analisar um CPR de uma fazenda de soja.',
    created_at: new Date(Date.now() - 60000).toISOString()
  },
  {
    id: 'm_002',
    session_id: 's_test-session-001',
    role: 'assistant',
    content:
      'Perfeito! Para analisar a CPR, por favor envie o documento em PDF ou imagem.',
    created_at: new Date(Date.now() - 55000).toISOString()
  }
]

export const mockStreamingResponse = `data: {"type": "content", "content": "Esta "}

data: {"type": "content", "content": "é uma "}

data: {"type": "content", "content": "resposta "}

data: {"type": "content", "content": "de teste."}

data: {"type": "done"}

data: [DONE]

`

// ============================================================================
// Mock Setup Functions
// ============================================================================

/**
 * Sets up all API mocks for a page.
 * Call this in beforeEach for tests that don't need a real backend.
 */
export async function setupAllMocks(page: Page) {
  await setupAuthMocks(page)
  await setupSessionMocks(page)
  await setupChatMocks(page)
  await setupProjectMocks(page)
  await setupDocumentMocks(page)
  await setupOrganizationMocks(page)
}

/**
 * Mock authentication endpoints
 */
export async function setupAuthMocks(page: Page) {
  // GET /api/auth/me - Current user
  await page.route('**/api/auth/me', async (route: Route) => {
    console.log('🎯 Intercepted GET /api/auth/me')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser)
    })
  })

  // POST /api/auth/login
  await page.route('**/api/auth/login', async (route: Route) => {
    console.log('🎯 Intercepted POST /api/auth/login')
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock_access_token',
          token_type: 'bearer',
          user: mockUser
        })
      })
    } else {
      await route.continue()
    }
  })

  // POST /api/auth/logout
  await page.route('**/api/auth/logout', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success' })
    })
  })
}

/**
 * Mock session endpoints
 */
export async function setupSessionMocks(page: Page) {
  await page.route('**/api/sessions**', async (route: Route) => {
    const method = route.request().method()

    // GET /api/sessions
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSessions) // Match BackendSession[] expecting array
      })
    } else if (method === 'POST') {
      const newSession = {
        session_id: `s_new-session-${Date.now()}`,
        user_id: mockUser.id,
        title: 'Nova Conversa',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newSession)
      })
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'deleted' })
      })
    } else {
      await route.continue()
    }
  })
}

/**
 * Mock chat endpoints
 */
export async function setupChatMocks(page: Page) {
  // Chat history
  await page.route('**/api/chat/history/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        messages: mockMessages,
        total: mockMessages.length
      })
    })
  })

  // Chat stream
  await page.route('**/api/chat/stream', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: mockStreamingResponse
    })
  })

  // Regular chat endpoint
  await page.route('**/api/chat', async (route: Route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          text: 'Esta é uma resposta de teste.',
          session_id: 's_test-session-001',
          message_id: `m_${Date.now()}`
        })
      })
    } else {
      await route.continue()
    }
  })
}

/**
 * Mock project endpoints
 */
export async function setupProjectMocks(page: Page) {
  await page.route('**/api/projects**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]) // Match Project[] expecting array
    })
  })
}

/**
 * Mock document endpoints
 */
export async function setupDocumentMocks(page: Page) {
  await page.route('**/api/documents**', async (route: Route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ files: [], total: 0 }) // Match { files: ... }
      })
    } else if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: `doc_${Date.now()}`,
          name: 'Documento de Teste.pdf',
          status: 'uploaded',
          created_at: new Date().toISOString()
        })
      })
    } else {
      await route.continue()
    }
  })
}

/**
 * Mock organization endpoints
 */
export async function setupOrganizationMocks(page: Page) {
  await page.route('**/api/organization**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ organization: mockOrganization })
    })
  })

  await page.route('**/api/team**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        members: [mockUser],
        total: 1
      })
    })
  })

  await page.route('**/api/invites**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ invites: [], total: 0 })
    })
  })
}
