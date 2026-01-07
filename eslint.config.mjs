import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const eslintConfig = [
  // Ignore E2E test files (Playwright fixtures use 'use' which conflicts with React hooks rule)
  {
    ignores: ['e2e/**/*', 'playwright-report/**/*', 'test-results/**/*']
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript')
]

export default eslintConfig
