import React from 'react'
import { CPRWizardData } from '../schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { z } from 'zod'

// =============================================================================
// Constants
// =============================================================================

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

// =============================================================================
// Schema
// =============================================================================

export const stepPropriedadeSchema = z.object({
  farmName: z.string().min(3, 'Nome da propriedade deve ter no mínimo 3 caracteres'),
  farmCar: z
    .string()
    .regex(/^[A-Z]{2}-\d{7}-[A-Z0-9]{32}$|^.{15,}$/, 'CAR inválido ou incompleto')
    .optional()
    .or(z.literal('')),
  farmArea: z.number({ error: 'Área inválida' }).positive('Área deve ser positiva'),
  farmState: z.string().min(2, 'Selecione o estado'),
  farmCity: z.string().min(2, 'Cidade é obrigatória'),
  farmAddress: z.string().min(10, 'Endereço da propriedade é obrigatório')
})

export type StepPropriedadeData = z.infer<typeof stepPropriedadeSchema>

// =============================================================================
// Component
// =============================================================================

interface StepPropriedadeProps {
  data: Partial<CPRWizardData>
  updateData: (data: Partial<CPRWizardData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepPropriedade({
  data,
  updateData,
  onNext,
  onBack
}: StepPropriedadeProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validate = () => {
    try {
      const toValidate = {
        farmName: data.farmName || '',
        farmCar: data.farmCar || '',
        farmArea: data.farmArea,
        farmState: data.farmState || '',
        farmCity: data.farmCity || '',
        farmAddress: data.farmAddress || ''
      }

      stepPropriedadeSchema.parse(toValidate)
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
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Dados da Propriedade</h2>
        <p className="text-sm text-muted-foreground">
          Informe os dados da propriedade rural onde a produção será realizada.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Nome da Propriedade */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="farmName">Nome da Propriedade</Label>
          <Input
            id="farmName"
            placeholder="Ex: Fazenda Santa Maria"
            value={data.farmName || ''}
            onChange={(e) => updateData({ farmName: e.target.value })}
            className={errors.farmName ? 'border-red-500' : ''}
          />
          {errors.farmName && (
            <span className="text-xs text-red-500">{errors.farmName}</span>
          )}
        </div>

        {/* CAR */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="farmCar">
            CAR (Cadastro Ambiental Rural){' '}
            <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="farmCar"
            placeholder="UF-0000000-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            value={data.farmCar || ''}
            onChange={(e) => updateData({ farmCar: e.target.value.toUpperCase() })}
            className={errors.farmCar ? 'border-red-500' : ''}
          />
          {errors.farmCar && (
            <span className="text-xs text-red-500">{errors.farmCar}</span>
          )}
          <span className="text-xs text-muted-foreground">
            Formato: UF-CÓDIGO IBGE-CÓDIGO CAR
          </span>
        </div>

        {/* Área Total */}
        <div className="space-y-2">
          <Label htmlFor="farmArea">Área Total (ha)</Label>
          <Input
            id="farmArea"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={data.farmArea || ''}
            onChange={(e) => updateData({ farmArea: parseFloat(e.target.value) })}
            className={errors.farmArea ? 'border-red-500' : ''}
          />
          {errors.farmArea && (
            <span className="text-xs text-red-500">{errors.farmArea}</span>
          )}
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="farmState">Estado</Label>
          <Select
            value={data.farmState}
            onValueChange={(val) => updateData({ farmState: val })}
          >
            <SelectTrigger
              id="farmState"
              className={errors.farmState ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {BRAZILIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.farmState && (
            <span className="text-xs text-red-500">{errors.farmState}</span>
          )}
        </div>

        {/* Cidade */}
        <div className="space-y-2">
          <Label htmlFor="farmCity">Cidade</Label>
          <Input
            id="farmCity"
            placeholder="Ex: Ribeirão Preto"
            value={data.farmCity || ''}
            onChange={(e) => updateData({ farmCity: e.target.value })}
            className={errors.farmCity ? 'border-red-500' : ''}
          />
          {errors.farmCity && (
            <span className="text-xs text-red-500">{errors.farmCity}</span>
          )}
        </div>

        {/* Endereço */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="farmAddress">Endereço / Localização</Label>
          <Input
            id="farmAddress"
            placeholder="Rodovia, km, coordenadas ou referência"
            value={data.farmAddress || ''}
            onChange={(e) => updateData({ farmAddress: e.target.value })}
            className={errors.farmAddress ? 'border-red-500' : ''}
          />
          {errors.farmAddress && (
            <span className="text-xs text-red-500">{errors.farmAddress}</span>
          )}
        </div>
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
