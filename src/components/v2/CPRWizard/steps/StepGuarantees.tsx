import React from 'react'
import { CPRWizardData, stepGuaranteesSchema } from '../schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { cn } from '@/lib/utils'

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

export function StepGuarantees({ data, updateData, onNext, onBack }: StepGuaranteesProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const toggleGuarantee = (option: string) => {
    const current = data.guaranteeType || []
    if (current.includes(option)) {
      updateData({ guaranteeType: current.filter(t => t !== option) })
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
            error.errors.forEach(err => {
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
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Garantias */}
      <div className="space-y-3">
        <Label>Tipo de Garantia</Label>
        <div className="grid grid-cols-2 gap-2">
            {GUARANTEE_OPTIONS.map(opt => (
                <div key={opt} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors">
                    <Checkbox 
                        id={`g-${opt}`} 
                        checked={data.guaranteeType?.includes(opt)}
                        onCheckedChange={() => toggleGuarantee(opt)}
                    />
                    <label 
                        htmlFor={`g-${opt}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                    >
                        {opt}
                    </label>
                </div>
            ))}
        </div>
        {errors.guaranteeType && <span className="text-xs text-red-500">{errors.guaranteeType}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Descrição da Garantia</Label>
        <Textarea 
            id="desc"
            placeholder="Descreva os bens dados em garantia (matrícula, localização, safra...)"
            value={data.guaranteeDescription || ''}
            onChange={(e) => updateData({ guaranteeDescription: e.target.value })}
            className={errors.guaranteeDescription ? 'border-red-500' : ''}
        />
        {errors.guaranteeDescription && <span className="text-xs text-red-500">{errors.guaranteeDescription}</span>}
      </div>

      {/* Avalista */}
      <div className="border-t pt-4 space-y-4">
         <div className="flex items-center space-x-2">
            <Checkbox 
                id="hasGuarantor"
                checked={data.hasGuarantor}
                onCheckedChange={(checked) => updateData({ hasGuarantor: checked === true })}
            />
            <Label htmlFor="hasGuarantor">Possui Avalista?</Label>
         </div>

         {data.hasGuarantor && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-muted animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-2">
                    <Label htmlFor="gName">Nome do Avalista</Label>
                    <Input 
                        id="gName" 
                        value={data.guarantorName || ''}
                        onChange={(e) => updateData({ guarantorName: e.target.value })}
                        className={errors.guarantorName ? 'border-red-500' : ''}
                    />
                     {errors.guarantorName && <span className="text-xs text-red-500">{errors.guarantorName}</span>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gDoc">CPF/CNPJ</Label>
                    <Input 
                        id="gDoc" 
                        value={data.guarantorCpfCnpj || ''}
                        onChange={(e) => updateData({ guarantorCpfCnpj: e.target.value })}
                    />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="gAddr">Endereço Completo</Label>
                    <Input 
                        id="gAddr" 
                        value={data.guarantorAddress || ''}
                        onChange={(e) => updateData({ guarantorAddress: e.target.value })}
                    />
                </div>
             </div>
         )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>Voltar</Button>
        <Button onClick={handleNext}>Próximo</Button>
      </div>
    </div>
  )
}
