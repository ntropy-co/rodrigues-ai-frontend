'use client'

/**
 * useAuthForm Hook
 * Generic form state management for authentication forms
 */

import { useState, useCallback, useMemo } from 'react'
import {
  validateCorporateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validateRequired
} from '@/lib/utils/auth-validators'

// ============================================================================
// TYPES
// ============================================================================

type FormType = 'login' | 'signup' | 'forgot-password' | 'reset-password'

interface LoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

interface SignupFormValues {
  email: string
  password: string
  confirmPassword: string
  name: string
  acceptTerms: boolean
}

interface ForgotPasswordFormValues {
  email: string
}

interface ResetPasswordFormValues {
  password: string
  confirmPassword: string
}

type FormValues<T extends FormType> = T extends 'login'
  ? LoginFormValues
  : T extends 'signup'
    ? SignupFormValues
    : T extends 'forgot-password'
      ? ForgotPasswordFormValues
      : T extends 'reset-password'
        ? ResetPasswordFormValues
        : never

interface UseAuthFormReturn<T extends FormType> {
  values: FormValues<T>
  errors: Partial<Record<keyof FormValues<T>, string>>
  touched: Partial<Record<keyof FormValues<T>, boolean>>
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
  handleChange: (field: keyof FormValues<T>, value: string | boolean) => void
  handleBlur: (field: keyof FormValues<T>) => void
  handleSubmit: (onSubmit: () => Promise<void>) => Promise<void>
  setFieldError: (field: keyof FormValues<T>, error: string) => void
  resetForm: () => void
  setSubmitting: (value: boolean) => void
}

// ============================================================================
// INITIAL VALUES
// ============================================================================

function getInitialValues<T extends FormType>(type: T): FormValues<T> {
  switch (type) {
    case 'login':
      return { email: '', password: '', rememberMe: false } as FormValues<T>
    case 'signup':
      return {
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        acceptTerms: false
      } as FormValues<T>
    case 'forgot-password':
      return { email: '' } as FormValues<T>
    case 'reset-password':
      return { password: '', confirmPassword: '' } as FormValues<T>
    default:
      throw new Error(`Unknown form type: ${type}`)
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateField<T extends FormType>(
  type: T,
  field: keyof FormValues<T>,
  value: string | boolean,
  values: FormValues<T>
): string | null {
  const strValue = typeof value === 'string' ? value : ''

  switch (field) {
    case 'email':
      const requiredError = validateRequired(strValue, 'Email')
      if (requiredError) return requiredError

      if (type === 'signup') {
        const corporateResult = validateCorporateEmail(strValue)
        if (!corporateResult.valid) return corporateResult.error!
      }

      // Basic email format validation for login/forgot
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(strValue)) {
        return 'Email inválido.'
      }
      return null

    case 'password':
      const pwdRequiredError = validateRequired(strValue, 'Senha')
      if (pwdRequiredError) return pwdRequiredError

      // Only validate strength on signup and reset
      if (type === 'signup' || type === 'reset-password') {
        const pwdResult = validatePassword(strValue)
        if (!pwdResult.valid) {
          return pwdResult.errors[0]
        }
      }
      return null

    case 'confirmPassword':
      const confirmRequired = validateRequired(strValue, 'Confirmação de senha')
      if (confirmRequired) return confirmRequired

      const password = (values as SignupFormValues | ResetPasswordFormValues)
        .password
      const matchResult = validatePasswordMatch(password, strValue)
      if (!matchResult.valid) return matchResult.error!
      return null

    case 'name':
      const nameRequired = validateRequired(strValue, 'Nome')
      if (nameRequired) return nameRequired

      const nameResult = validateName(strValue)
      if (!nameResult.valid) return nameResult.error!
      return null

    case 'acceptTerms':
      if (type === 'signup' && value !== true) {
        return 'Você precisa aceitar os termos de uso.'
      }
      return null

    default:
      return null
  }
}

function validateAllFields<T extends FormType>(
  type: T,
  values: FormValues<T>
): Partial<Record<keyof FormValues<T>, string>> {
  const errors: Partial<Record<keyof FormValues<T>, string>> = {}

  for (const key of Object.keys(values) as Array<keyof FormValues<T>>) {
    const error = validateField(
      type,
      key,
      values[key] as string | boolean,
      values
    )
    if (error) {
      errors[key] = error
    }
  }

  return errors
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useAuthForm<T extends FormType>(type: T): UseAuthFormReturn<T> {
  const initialValues = useMemo(() => getInitialValues(type), [type])

  const [values, setValues] = useState<FormValues<T>>(initialValues)
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormValues<T>, string>>
  >({})
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormValues<T>, boolean>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback(
    (field: keyof FormValues<T>, value: string | boolean) => {
      setValues((prev) => ({ ...prev, [field]: value }))

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    },
    [errors]
  )

  const handleBlur = useCallback(
    (field: keyof FormValues<T>) => {
      setTouched((prev) => ({ ...prev, [field]: true }))

      // Validate on blur
      const error = validateField(
        type,
        field,
        values[field] as string | boolean,
        values
      )
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }))
      }
    },
    [type, values]
  )

  const handleSubmit = useCallback(
    async (onSubmit: () => Promise<void>) => {
      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => {
          acc[key as keyof FormValues<T>] = true
          return acc
        },
        {} as Partial<Record<keyof FormValues<T>, boolean>>
      )
      setTouched(allTouched)

      // Validate all fields
      const validationErrors = validateAllFields(type, values)
      setErrors(validationErrors)

      // If errors, don't submit
      if (Object.keys(validationErrors).length > 0) {
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit()
      } finally {
        setIsSubmitting(false)
      }
    },
    [type, values]
  )

  const setFieldError = useCallback(
    (field: keyof FormValues<T>, error: string) => {
      setErrors((prev) => ({ ...prev, [field]: error }))
    },
    []
  )

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const setSubmitting = useCallback((value: boolean) => {
    setIsSubmitting(value)
  }, [])

  // Computed states
  const isValid = useMemo(() => {
    const validationErrors = validateAllFields(type, values)
    return Object.keys(validationErrors).length === 0
  }, [type, values])

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues)
  }, [values, initialValues])

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
    resetForm,
    setSubmitting
  }
}

export default useAuthForm
