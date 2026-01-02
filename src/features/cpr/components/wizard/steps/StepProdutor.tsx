import React from 'react'
import { CPRWizardData } from '../schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { z } from 'zod'

// =============================================================================
// Schema
// =============================================================================

export const stepProdutorSchema = z.object({
  producerName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  producerCpfCnpj: z
    .string()
    .min(11, 'CPF/CNPJ inválido')
    .max(18, 'CPF/CNPJ inválido'),
  producerPhone: z.string().min(10, 'Telefone inválido'),
  producerEmail: z.string().email('Email inválido'),
  producerAddress: z
    .string()
    .min(10, 'Endereço deve ter no mínimo 10 caracteres')
})

export type StepProdutorData = z.infer<typeof stepProdutorSchema>

// =============================================================================
// Component
// =============================================================================

interface StepProdutorProps {
  data: Partial<CPRWizardData>
  updateData: (data: Partial<CPRWizardData>) => void
  onNext: () => void
}

export function StepProdutor({ data, updateData, onNext }: StepProdutorProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validate = () => {
    try {
      const toValidate = {
        producerName: data.producerName || '',
        producerCpfCnpj: data.producerCpfCnpj || '',
        producerPhone: data.producerPhone || '',
        producerEmail: data.producerEmail || '',
        producerAddress: data.producerAddress || ''
      }

      stepProdutorSchema.parse(toValidate)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  // CPF/CNPJ mask helper
  const formatCpfCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 11) {
      // CPF: 000.000.000-00
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      // CNPJ: 00.000.000/0000-00
      return digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18)
    }
  }

  // Phone mask helper
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }

  return (
    <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Identificação do Produtor</h2>
        <p className="text-sm text-muted-foreground">
          Informe os dados do produtor rural que emitirá a CPR.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Nome Completo */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="producerName">Nome Completo / Razão Social</Label>
          <Input
            id="producerName"
            placeholder="Ex: João da Silva ou Fazenda Santa Maria Ltda"
            value={data.producerName || ''}
            onChange={(e) => updateData({ producerName: e.target.value })}
            className={errors.producerName ? 'border-error-500' : ''}
          />
          {errors.producerName && (
            <span className="text-xs text-error-500">
              {errors.producerName}
            </span>
          )}
        </div>

        {/* CPF/CNPJ */}
        <div className="space-y-2">
          <Label htmlFor="producerCpfCnpj">CPF / CNPJ</Label>
          <Input
            id="producerCpfCnpj"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            value={data.producerCpfCnpj || ''}
            onChange={(e) =>
              updateData({ producerCpfCnpj: formatCpfCnpj(e.target.value) })
            }
            className={errors.producerCpfCnpj ? 'border-error-500' : ''}
            maxLength={18}
          />
          {errors.producerCpfCnpj && (
            <span className="text-xs text-error-500">
              {errors.producerCpfCnpj}
            </span>
          )}
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="producerPhone">Telefone</Label>
          <Input
            id="producerPhone"
            placeholder="(00) 00000-0000"
            value={data.producerPhone || ''}
            onChange={(e) =>
              updateData({ producerPhone: formatPhone(e.target.value) })
            }
            className={errors.producerPhone ? 'border-error-500' : ''}
            maxLength={15}
          />
          {errors.producerPhone && (
            <span className="text-xs text-error-500">
              {errors.producerPhone}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="producerEmail">Email</Label>
          <Input
            id="producerEmail"
            type="email"
            placeholder="produtor@email.com"
            value={data.producerEmail || ''}
            onChange={(e) => updateData({ producerEmail: e.target.value })}
            className={errors.producerEmail ? 'border-error-500' : ''}
          />
          {errors.producerEmail && (
            <span className="text-xs text-error-500">
              {errors.producerEmail}
            </span>
          )}
        </div>

        {/* Endereço Completo */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="producerAddress">Endereço Completo</Label>
          <Input
            id="producerAddress"
            placeholder="Rua, número, bairro, cidade, estado, CEP"
            value={data.producerAddress || ''}
            onChange={(e) => updateData({ producerAddress: e.target.value })}
            className={errors.producerAddress ? 'border-error-500' : ''}
          />
          {errors.producerAddress && (
            <span className="text-xs text-error-500">
              {errors.producerAddress}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext}>Próximo</Button>
      </div>
    </div>
  )
}
