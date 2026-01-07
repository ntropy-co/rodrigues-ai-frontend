import React from 'react'
import { CPRWizardData, stepGuaranteesSchema } from '../schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { z } from 'zod'

interface StepGuaranteesProps {
  data: Partial<CPRWizardData>
  updateData: (data: Partial<CPRWizardData>) => void
  onNext: () => void
  onBack: () => void
}

const GUARANTEE_OPTIONS = [
  'Penhor de Safra',
  'Hipoteca',
  'Alienação Fiduciária',
  'Outros'
]

export function StepGuarantees({
  data,
  updateData,
  onNext,
  onBack
}: StepGuaranteesProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const toggleGuarantee = (option: string) => {
    const current = data.guaranteeType || []
    if (current.includes(option)) {
      updateData({ guaranteeType: current.filter((t) => t !== option) })
    } else {
      updateData({ guaranteeType: [...current, option] })
    }
  }

  const validate = () => {
    try {
      const toValidate = {
        guaranteeType: data.guaranteeType || [],
        guaranteeDescription: data.guaranteeDescription || '',
        hasGuarantor: !!data.hasGuarantor,
        guarantorName: data.guarantorName,
        guarantorCpfCnpj: data.guarantorCpfCnpj,
        guarantorAddress: data.guarantorAddress
      }

      stepGuaranteesSchema.parse(toValidate)
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

  return (
    <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
      {/* Garantias */}
      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-medium">Tipo de Garantia</legend>
        <div className="grid grid-cols-2 gap-2">
          {GUARANTEE_OPTIONS.map((opt) => (
            <div
              key={opt}
              className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50"
            >
              <Checkbox
                id={`g-${opt}`}
                checked={data.guaranteeType?.includes(opt)}
                onCheckedChange={() => toggleGuarantee(opt)}
                aria-invalid={!!errors.guaranteeType}
                aria-describedby={
                  errors.guaranteeType ? 'guarantee-type-error' : undefined
                }
              />
              <label
                htmlFor={`g-${opt}`}
                className="w-full cursor-pointer text-sm font-medium leading-none text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {opt}
              </label>
            </div>
          ))}
        </div>
        {errors.guaranteeType && (
          <span
            id="guarantee-type-error"
            role="alert"
            className="text-xs font-medium text-red-600"
          >
            {errors.guaranteeType}
          </span>
        )}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="desc">Descrição da Garantia</Label>
        <Textarea
          id="desc"
          placeholder="Descreva os bens dados em garantia (matrícula, localização, safra...)"
          value={data.guaranteeDescription || ''}
          onChange={(e) => updateData({ guaranteeDescription: e.target.value })}
          className={errors.guaranteeDescription ? 'border-red-500' : ''}
        />
        {errors.guaranteeDescription && (
          <span className="text-xs text-red-500">
            {errors.guaranteeDescription}
          </span>
        )}
      </div>

      {/* Avalista */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasGuarantor"
            checked={data.hasGuarantor}
            onCheckedChange={(checked) =>
              updateData({ hasGuarantor: checked === true })
            }
          />
          <Label htmlFor="hasGuarantor">Possui Avalista?</Label>
        </div>

        {data.hasGuarantor && (
          <div className="grid grid-cols-1 gap-4 border-l-2 border-muted pl-6 duration-200 animate-in fade-in zoom-in-95 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gName">Nome do Avalista</Label>
              <Input
                id="gName"
                value={data.guarantorName || ''}
                onChange={(e) => updateData({ guarantorName: e.target.value })}
                className={errors.guarantorName ? 'border-red-500' : ''}
              />
              {errors.guarantorName && (
                <span className="text-xs text-red-500">
                  {errors.guarantorName}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gDoc">CPF/CNPJ</Label>
              <Input
                id="gDoc"
                value={data.guarantorCpfCnpj || ''}
                onChange={(e) =>
                  updateData({ guarantorCpfCnpj: e.target.value })
                }
              />
            </div>
            <div className="col-span-1 space-y-2 md:col-span-2">
              <Label htmlFor="gAddr">Endereço Completo</Label>
              <Input
                id="gAddr"
                value={data.guarantorAddress || ''}
                onChange={(e) =>
                  updateData({ guarantorAddress: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={handleNext}>Próximo</Button>
      </div>
    </div>
  )
}
