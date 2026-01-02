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
import { COMMODITY_INFO, type CommoditySymbol } from '@/lib/commodities'
import { z } from 'zod'

// =============================================================================
// Constants
// =============================================================================

const SAFRAS = ['2024/2025', '2025/2026', '2026/2027']

const UNITS = [
  { value: 'kg', label: 'Quilogramas (kg)' },
  { value: 'ton', label: 'Toneladas (ton)' },
  { value: 'saca', label: 'Sacas (60kg)' },
  { value: 'arroba', label: 'Arrobas (@)' }
]

// =============================================================================
// Schema
// =============================================================================

export const stepCulturaSchema = z.object({
  commodity: z.string().min(1, 'Selecione a cultura'),
  safra: z.string().min(1, 'Selecione a safra'),
  expectedQuantity: z
    .number({ error: 'Quantidade inválida' })
    .positive('Quantidade deve ser positiva'),
  unit: z.string().min(1, 'Selecione a unidade'),
  plantingDate: z.string().optional(),
  harvestDate: z.string().optional()
})

export type StepCulturaData = z.infer<typeof stepCulturaSchema>

// =============================================================================
// Component
// =============================================================================

interface StepCulturaProps {
  data: Partial<CPRWizardData>
  updateData: (data: Partial<CPRWizardData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepCultura({
  data,
  updateData,
  onNext,
  onBack
}: StepCulturaProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Get commodity options from COMMODITY_INFO
  const commodityOptions = Object.entries(COMMODITY_INFO).map(
    ([key, info]) => ({
      value: key,
      label: info.name
    })
  )

  const validate = () => {
    try {
      const toValidate = {
        commodity: data.commodity || '',
        safra: data.safra || '',
        expectedQuantity: data.expectedQuantity,
        unit: data.unit || '',
        plantingDate: data.plantingDate || '',
        harvestDate: data.harvestDate || ''
      }

      stepCulturaSchema.parse(toValidate)
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

  // Get selected commodity info for display
  const selectedCommodity = data.commodity
    ? COMMODITY_INFO[data.commodity as CommoditySymbol]
    : null

  return (
    <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Definição da Cultura</h2>
        <p className="text-sm text-muted-foreground">
          Especifique a cultura e quantidade que será vinculada à CPR.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Cultura */}
        <div className="space-y-2">
          <Label htmlFor="commodity">Cultura / Commodity</Label>
          <Select
            value={data.commodity}
            onValueChange={(val) => updateData({ commodity: val })}
          >
            <SelectTrigger
              id="commodity"
              className={errors.commodity ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Selecione a cultura" />
            </SelectTrigger>
            <SelectContent>
              {commodityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.commodity && (
            <span className="text-xs text-red-500">{errors.commodity}</span>
          )}
          {selectedCommodity && data.commodity && (
            <span className="text-xs text-muted-foreground">
              Símbolo: {data.commodity} | Unidade: {selectedCommodity.unit}
            </span>
          )}
        </div>

        {/* Safra */}
        <div className="space-y-2">
          <Label htmlFor="safra">Safra</Label>
          <Select
            value={data.safra}
            onValueChange={(val) => updateData({ safra: val })}
          >
            <SelectTrigger
              id="safra"
              className={errors.safra ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Selecione a safra" />
            </SelectTrigger>
            <SelectContent>
              {SAFRAS.map((safra) => (
                <SelectItem key={safra} value={safra}>
                  {safra}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.safra && (
            <span className="text-xs text-red-500">{errors.safra}</span>
          )}
        </div>

        {/* Quantidade Prevista */}
        <div className="space-y-2">
          <Label htmlFor="expectedQuantity">Quantidade Prevista</Label>
          <Input
            id="expectedQuantity"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={data.expectedQuantity || ''}
            onChange={(e) =>
              updateData({ expectedQuantity: parseFloat(e.target.value) })
            }
            className={errors.expectedQuantity ? 'border-red-500' : ''}
          />
          {errors.expectedQuantity && (
            <span className="text-xs text-red-500">
              {errors.expectedQuantity}
            </span>
          )}
        </div>

        {/* Unidade */}
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade</Label>
          <Select
            value={data.unit}
            onValueChange={(val) => updateData({ unit: val })}
          >
            <SelectTrigger
              id="unit"
              className={errors.unit ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unit && (
            <span className="text-xs text-red-500">{errors.unit}</span>
          )}
        </div>

        {/* Data de Plantio */}
        <div className="space-y-2">
          <Label htmlFor="plantingDate">
            Data Prevista de Plantio{' '}
            <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="plantingDate"
            type="date"
            value={data.plantingDate || ''}
            onChange={(e) => updateData({ plantingDate: e.target.value })}
          />
        </div>

        {/* Data de Colheita */}
        <div className="space-y-2">
          <Label htmlFor="harvestDate">
            Data Prevista de Colheita{' '}
            <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="harvestDate"
            type="date"
            value={data.harvestDate || ''}
            onChange={(e) => updateData({ harvestDate: e.target.value })}
          />
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
