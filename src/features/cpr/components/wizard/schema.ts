import { z } from 'zod'

// =============================================================================
// Step 1: Produtor
// =============================================================================

export const stepProdutorSchema = z.object({
  producerName: z.string().min(3, 'Nome do produtor obrigatório'),
  producerCpfCnpj: z.string().min(11, 'CPF/CNPJ obrigatório'),
  producerPhone: z.string().optional(),
  producerEmail: z.string().email().optional(),
  producerAddress: z.string().optional()
})

// =============================================================================
// Step 2: Propriedade
// =============================================================================

export const stepPropriedadeSchema = z.object({
  farmName: z.string().min(3, 'Nome da propriedade obrigatório'),
  farmCar: z.string().optional(),
  farmArea: z.number().optional(),
  farmState: z.string().min(2, 'Estado obrigatório'),
  farmCity: z.string().min(2, 'Cidade obrigatória'),
  farmAddress: z.string().optional()
})

// =============================================================================
// Step 3: Cultura
// =============================================================================

export const stepCulturaSchema = z.object({
  commodity: z.string().min(1, 'Selecione a commodity'),
  safra: z.string().min(1, 'Selecione a safra'),
  expectedQuantity: z.number().positive('Quantidade deve ser positiva'),
  unit: z.string().min(1, 'Selecione a unidade'),
  plantingDate: z.string().optional(),
  harvestDate: z.string().optional()
})

// =============================================================================
// Step 4: Valores e Prazos
// =============================================================================

export const stepValuesSchema = z
  .object({
    amount: z
      .number({
        invalid_type_error: 'Valor inválido',
        required_error: 'Valor obrigatório'
      })
      .positive('Valor deve ser positivo'),
    quantity: z
      .number({
        invalid_type_error: 'Quantidade inválida',
        required_error: 'Quantidade obrigatória'
      })
      .positive('Quantidade deve ser positiva'),
    unitPrice: z.number().optional(), // Calculado, mas permite override
    issueDate: z.string().min(1, 'Data de emissão obrigatória'),
    dueDate: z.string().min(1, 'Data de vencimento obrigatória'),
    deliveryPlace: z.string().min(3, 'Local de entrega obrigatório'),
    correctionIndex: z.enum(['IPCA', 'IGP-M', 'Nenhum'], {
      required_error: 'Selecione um índice'
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
  // Step 1: Produtor
  ...stepProdutorSchema.shape,

  // Step 2: Propriedade
  ...stepPropriedadeSchema.shape,

  // Step 3: Cultura
  ...stepCulturaSchema.shape,

  // Step 4: Valores (extract inner object shape from refined schema)
  amount: z
    .number({
      invalid_type_error: 'Valor inválido',
      required_error: 'Valor obrigatório'
    })
    .positive('Valor deve ser positivo'),
  quantity: z
    .number({
      invalid_type_error: 'Quantidade inválida',
      required_error: 'Quantidade obrigatória'
    })
    .positive('Quantidade deve ser positiva'),
  unitPrice: z.number().optional(),
  issueDate: z.string().min(1, 'Data de emissão obrigatória'),
  dueDate: z.string().min(1, 'Data de vencimento obrigatória'),
  deliveryPlace: z.string().min(3, 'Local de entrega obrigatório'),
  correctionIndex: z.enum(['IPCA', 'IGP-M', 'Nenhum'], {
    required_error: 'Selecione um índice'
  }),

  // Step 5: Garantias
  guaranteeType: z
    .array(z.string())
    .min(1, 'Selecione pelo menos uma garantia'),
  guaranteeDescription: z.string().min(10, 'Descrição detalhada obrigatória'),
  hasGuarantor: z.boolean(),
  guarantorName: z.string().optional(),
  guarantorCpfCnpj: z.string().optional(),
  guarantorAddress: z.string().optional()
})

export type CPRWizardData = z.infer<typeof cprWizardSchema>
