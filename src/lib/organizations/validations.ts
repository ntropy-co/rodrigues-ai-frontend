/**
 * Schemas de validação para organizations usando Zod
 *
 * Estes schemas garantem que os dados de atualização de organizações
 * sejam válidos antes de serem enviados para a API.
 */

import { z } from 'zod'

/**
 * Regex para validar cores hexadecimais (3 ou 6 dígitos)
 * Exemplos válidos: #fff, #FFF, #ffffff, #FFFFFF
 */
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

/**
 * Schema de validação para atualização de organização
 * - name: 1-100 caracteres
 * - primary_color: cor hexadecimal válida (opcional)
 * - secondary_color: cor hexadecimal válida (opcional)
 * - email: email válido (opcional)
 * - website: URL válida com HTTP/HTTPS (opcional)
 */
export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da organização é obrigatório')
    .max(100, 'Nome da organização muito longo (máximo 100 caracteres)')
    .optional(),
  primary_color: z
    .string()
    .regex(
      hexColorRegex,
      'Cor primária deve ser uma cor hexadecimal válida (ex: #FF5733)'
    )
    .optional(),
  secondary_color: z
    .string()
    .regex(
      hexColorRegex,
      'Cor secundária deve ser uma cor hexadecimal válida (ex: #33FF57)'
    )
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .optional(),
  website: z
    .string()
    .url('Website deve ser uma URL válida')
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
        message: 'Website deve usar protocolo HTTP ou HTTPS'
      }
    )
    .optional()
})

/**
 * Schema de validação para atualização de settings da organização
 * - Permite qualquer objeto JSON com chaves string (será validado pelo backend)
 */
export const updateOrganizationSettingsSchema = z.record(
  z.string(),
  z.unknown()
)

// Type exports para TypeScript
export type UpdateOrganizationInput = z.output<typeof updateOrganizationSchema>
export type UpdateOrganizationSettingsInput = z.output<
  typeof updateOrganizationSettingsSchema
>
