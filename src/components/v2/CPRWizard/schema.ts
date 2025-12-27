import { z } from 'zod'

// =============================================================================
// Step 4: Valores e Prazos
// =============================================================================

export const stepValuesSchema = z
  .object({
    amount: z
      .number({ message: 'Valor inválido' })
      .positive('Valor deve ser positivo'),
    quantity: z
      .number({ message: 'Quantidade inválida' })
      .positive('Quantidade deve ser positiva'),
    unitPrice: z.number().optional(), // Calculado, mas permite override
    issueDate: z.string().min(1, 'Data de emissão obrigatória'),
    dueDate: z.string().min(1, 'Data de vencimento obrigatória'),
    deliveryPlace: z.string().min(3, 'Local de entrega obrigatório'),
    correctionIndex: z.enum(['IPCA', 'IGP-M', 'Nenhum'], {
      message: 'Selecione um índice'
    })
  })
  .refine(
    (data) => {
      const issue = new Date(data.issueDate)
      const due = new Date(data.dueDate)
      return due > issue
    },
    {
      message: 'Data de vencimento deve ser posterior à emissão',
      path: ['dueDate']
    }
  )

// =============================================================================
// Step 5: Garantias e Avalista
// =============================================================================

export const stepGuaranteesSchema = z
  .object({
    guaranteeType: z
      .array(z.string())
      .min(1, 'Selecione pelo menos uma garantia'),
    guaranteeDescription: z.string().min(10, 'Descrição detalhada obrigatória'),

    hasGuarantor: z.boolean(),
    guarantorName: z.string().optional(),
    guarantorCpfCnpj: z.string().optional(),
    guarantorAddress: z.string().optional()
  })
  .refine(
    (data) => {
      if (data.hasGuarantor) {
        return (
          !!data.guarantorName &&
          !!data.guarantorCpfCnpj &&
          !!data.guarantorAddress
        )
      }
      return true
    },
    {
      message: 'Dados do avalista são obrigatórios quando marcado',
      path: ['guarantorName'] // Aponta para o nome mas afeta o bloco
    }
  )

// =============================================================================
// Combined Schema (Full Form)
// =============================================================================

export const cprWizardSchema = z.object({
  // Steps 1-3 (Placeholders)
  product: z.string().optional(),
  producer: z.string().optional(),
  farm: z.string().optional(),

  // Step 4
  ...stepValuesSchema.shape,

  // Step 5
  ...stepGuaranteesSchema.shape
})

export type CPRWizardData = z.infer<typeof cprWizardSchema>
