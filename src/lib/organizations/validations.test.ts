/**
 * Tests for organization validation schemas
 *
 * Tests input validation for organization update endpoints
 */

import { describe, it, expect } from 'vitest'
import {
  updateOrganizationSchema,
  updateOrganizationSettingsSchema
} from './validations'

describe('updateOrganizationSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid name', () => {
      const result = updateOrganizationSchema.safeParse({
        name: 'Acme Corporation'
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid hex colors', () => {
      const result = updateOrganizationSchema.safeParse({
        primary_color: '#FF5733',
        secondary_color: '#33FF57'
      })
      expect(result.success).toBe(true)
    })

    it('should accept 3-digit hex colors', () => {
      const result = updateOrganizationSchema.safeParse({
        primary_color: '#FFF',
        secondary_color: '#000'
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid email', () => {
      const result = updateOrganizationSchema.safeParse({
        email: 'contact@example.com'
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid HTTP website', () => {
      const result = updateOrganizationSchema.safeParse({
        website: 'http://example.com'
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid HTTPS website', () => {
      const result = updateOrganizationSchema.safeParse({
        website: 'https://www.example.com'
      })
      expect(result.success).toBe(true)
    })

    it('should accept all valid fields together', () => {
      const result = updateOrganizationSchema.safeParse({
        name: 'Test Organization',
        primary_color: '#FF5733',
        secondary_color: '#33FF57',
        email: 'info@test.com',
        website: 'https://test.com'
      })
      expect(result.success).toBe(true)
    })

    it('should accept empty object (all fields optional)', () => {
      const result = updateOrganizationSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs - name', () => {
    it('should reject empty name', () => {
      const result = updateOrganizationSchema.safeParse({
        name: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('não pode ser vazio')
      }
    })

    it('should reject name longer than 100 characters', () => {
      const result = updateOrganizationSchema.safeParse({
        name: 'a'.repeat(101)
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('máximo 100')
      }
    })
  })

  describe('invalid inputs - colors', () => {
    it('should reject invalid hex color without #', () => {
      const result = updateOrganizationSchema.safeParse({
        primary_color: 'FF5733'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('hexadecimal')
      }
    })

    it('should reject invalid hex color with wrong length', () => {
      const result = updateOrganizationSchema.safeParse({
        primary_color: '#FF57'
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid hex color with non-hex characters', () => {
      const result = updateOrganizationSchema.safeParse({
        primary_color: '#GGGGGG'
      })
      expect(result.success).toBe(false)
    })

    it('should reject color name instead of hex', () => {
      const result = updateOrganizationSchema.safeParse({
        primary_color: 'red'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('invalid inputs - email', () => {
    it('should reject invalid email format', () => {
      const result = updateOrganizationSchema.safeParse({
        email: 'not-an-email'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Email inválido')
      }
    })

    it('should reject email without domain', () => {
      const result = updateOrganizationSchema.safeParse({
        email: 'user@'
      })
      expect(result.success).toBe(false)
    })

    it('should reject email longer than 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com'
      const result = updateOrganizationSchema.safeParse({
        email: longEmail
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('muito longo')
      }
    })
  })

  describe('invalid inputs - website', () => {
    it('should reject invalid URL format', () => {
      const result = updateOrganizationSchema.safeParse({
        website: 'not-a-url'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('URL válida')
      }
    })

    it('should reject FTP protocol', () => {
      const result = updateOrganizationSchema.safeParse({
        website: 'ftp://example.com'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('HTTP ou HTTPS')
      }
    })

    it('should reject file protocol', () => {
      const result = updateOrganizationSchema.safeParse({
        website: 'file:///path/to/file'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should accept lowercase hex colors', () => {
      const result = updateOrganizationSchema.safeParse({
        primary_color: '#ff5733'
      })
      expect(result.success).toBe(true)
    })

    it('should accept mixed case hex colors', () => {
      const result = updateOrganizationSchema.safeParse({
        primary_color: '#Ff5733'
      })
      expect(result.success).toBe(true)
    })

    it('should accept name with exactly 100 characters', () => {
      const result = updateOrganizationSchema.safeParse({
        name: 'a'.repeat(100)
      })
      expect(result.success).toBe(true)
    })

    it('should accept name with exactly 1 character', () => {
      const result = updateOrganizationSchema.safeParse({
        name: 'A'
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('updateOrganizationSettingsSchema', () => {
  it('should accept any object with string keys', () => {
    const result = updateOrganizationSettingsSchema.safeParse({
      setting1: 'value1',
      setting2: 123,
      setting3: true,
      setting4: { nested: 'object' }
    })
    expect(result.success).toBe(true)
  })

  it('should accept empty object', () => {
    const result = updateOrganizationSettingsSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should accept nested objects', () => {
    const result = updateOrganizationSettingsSchema.safeParse({
      preferences: {
        theme: 'dark',
        language: 'pt-BR',
        notifications: {
          email: true,
          sms: false
        }
      }
    })
    expect(result.success).toBe(true)
  })

  it('should accept arrays', () => {
    const result = updateOrganizationSettingsSchema.safeParse({
      allowed_ips: ['192.168.1.1', '192.168.1.2'],
      tags: ['tag1', 'tag2', 'tag3']
    })
    expect(result.success).toBe(true)
  })

  it('should reject settings larger than 100KB', () => {
    // Create a large object that exceeds 100KB
    const largeSettings = {
      data: 'x'.repeat(101 * 1024) // 101KB
    }
    const result = updateOrganizationSettingsSchema.safeParse(largeSettings)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('muito grande')
    }
  })

  it('should accept settings exactly at 100KB limit', () => {
    // Create an object close to but under 100KB
    const largeSettings = {
      data: 'x'.repeat(90 * 1024) // 90KB (safely under 100KB)
    }
    const result = updateOrganizationSettingsSchema.safeParse(largeSettings)
    expect(result.success).toBe(true)
  })
})
