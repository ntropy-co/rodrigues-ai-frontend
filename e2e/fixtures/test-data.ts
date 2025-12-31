/**
 * Test Data Fixtures for E2E Tests
 *
 * Centralized test data for consistent testing across all E2E specs.
 */

export const testUsers = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!',
    name: 'Test Admin'
  },
  regular: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    name: 'Test User'
  }
} as const

export const testData = {
  // Validation test data
  validEmail: 'valid@example.com',
  invalidEmail: 'invalid-email',
  validPassword: 'ValidPass123!',
  shortPassword: '123',
  weakPassword: 'password',

  // CPR test data
  sampleCPR: {
    emitente: 'Fazenda São João',
    cpfCnpj: '12.345.678/0001-90',
    produto: 'Soja',
    quantidade: 1000,
    unidade: 'sacas'
  }
} as const

export type TestUser = typeof testUsers.regular
