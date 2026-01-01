/**
 * Test Data Fixtures for E2E Tests
 *
 * Centralized test data for consistent testing across all E2E specs.
 */

const getEnv = (name: string) => process.env[name] || ''

export const testUsers = {
  admin: {
    email: getEnv('TEST_ADMIN_EMAIL'),
    password: getEnv('TEST_ADMIN_PASSWORD'),
    name: 'Test Admin'
  },
  regular: {
    email: getEnv('TEST_USER_EMAIL'),
    password: getEnv('TEST_USER_PASSWORD'),
    name: 'Usuário de Teste'
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
