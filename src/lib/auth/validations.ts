/**
 * Schemas de validação de autenticação usando Zod
 *
 * Estes schemas garantem que os dados de entrada sejam válidos e seguros
 * antes de serem enviados para a API, prevenindo injeção de dados maliciosos.
 */

import { z } from 'zod'

/**
 * Schema de validação para login
 * - Email deve ser válido
 * - Password deve ter no mínimo 8 caracteres
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Email obrigatório')
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(128)
})

/**
 * Schema de validação para registro
 * - Email válido
 * - Senha forte (mínimo 8 chars, maiúscula, minúscula, número)
 * - Nome completo (2-100 caracteres)
 * - Confirmação de senha deve coincidir
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email obrigatório')
      .email('Email inválido')
      .max(255),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .max(128)
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    full_name: z
      .string()
      .min(2, 'Nome muito curto')
      .max(100, 'Nome muito longo')
      .regex(
        /^[a-zA-ZÀ-ÿ\s'-]+$/,
        'Nome deve conter apenas letras, espaços e hífens'
      ),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword']
  })

/**
 * Schema de validação para forgot password
 */
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email obrigatório').email('Email inválido').max(255)
})

/**
 * Schema de validação para reset password
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token obrigatório'),
    new_password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .max(128)
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    confirmPassword: z.string()
  })
  .refine((data) => data.new_password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword']
  })

/**
 * Schema de validação para URLs
 * - Deve ser uma URL válida
 * - Apenas protocolos HTTP e HTTPS permitidos
 */
export const urlSchema = z
  .string()
  .url('URL inválida')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url)
        return ['http:', 'https:'].includes(parsed.protocol)
      } catch {
        return false
      }
    },
    {
      message: 'URL deve usar protocolo HTTP ou HTTPS'
    }
  )

/**
 * Schema de validação para IDs de usuário
 * - Deve ser um UUID ou string válida
 */
export const userIdSchema = z
  .string()
  .min(1, 'User ID obrigatório')
  .max(100, 'User ID muito longo')

// Type exports para TypeScript
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
