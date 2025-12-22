import React, { useEffect } from 'react'
import { CPRWizardData, stepValuesSchema } from '../schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { z } from 'zod'

interface StepValuesProps {
  data: Partial<CPRWizardData>
  updateData: (data: Partial<CPRWizardData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepValues({ data, updateData, onNext, onBack }: StepValuesProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Auto-calculate unit price
  useEffect(() => {
    if (data.amount && data.quantity && data.quantity > 0 && !data.unitPrice) {
      const calculated = data.amount / data.quantity
      // Keep 2 decimals to avoid weird floats
      updateData({ unitPrice: parseFloat(calculated.toFixed(2)) })
    }
  }, [data.amount, data.quantity, updateData, data.unitPrice])

  const validate = () => {
    try {
      // Create a temporary object with defaults to validate
      const toValidate = {
        amount: data.amount,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        issueDate: data.issueDate || '',
        dueDate: data.dueDate || '',
        deliveryPlace: data.deliveryPlace || '',
        correctionIndex: data.correctionIndex || 'Nenhum'
      }
      
      stepValuesSchema.parse(toValidate)
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valor Total */}
        <div className="space-y-2">
          <Label htmlFor="amount">Valor Total (R$)</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={data.amount || ''}
            onChange={(e) => updateData({ amount: parseFloat(e.target.value) })}
            className={errors.amount ? 'border-red-500' : ''}
          />
          {errors.amount && <span className="text-xs text-red-500">{errors.amount}</span>}
        </div>

        {/* Quantidade */}
        <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade (Kg/Ton/Sacas)</Label>
            <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="0"
                value={data.quantity || ''}
                onChange={(e) => updateData({ quantity: parseFloat(e.target.value) })}
                className={errors.quantity ? 'border-red-500' : ''}
            />
             {errors.quantity && <span className="text-xs text-red-500">{errors.quantity}</span>}
        </div>

        {/* Preço Unitário (Calculado) */}
        <div className="space-y-2">
            <Label htmlFor="unitPrice">Preço Unitário (R$)</Label>
            <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={data.unitPrice || ''}
                onChange={(e) => updateData({ unitPrice: parseFloat(e.target.value) })}
            />
            <span className="text-xs text-muted-foreground">Calculado automaticamente (pode ajustar)</span>
        </div>

         {/* Índice de Correção */}
         <div className="space-y-2">
            <Label>Índice de Correção</Label>
            <Select 
                value={data.correctionIndex} 
                onValueChange={(val) => updateData({ correctionIndex: val as any })}
            >
                <SelectTrigger className={errors.correctionIndex ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Nenhum">Nenhum</SelectItem>
                    <SelectItem value="IPCA">IPCA</SelectItem>
                    <SelectItem value="IGP-M">IGP-M</SelectItem>
                </SelectContent>
            </Select>
            {errors.correctionIndex && <span className="text-xs text-red-500">{errors.correctionIndex}</span>}
        </div>

        {/* Datas */}
        <div className="space-y-2">
            <Label htmlFor="issueDate">Data de Emissão</Label>
            <Input
                id="issueDate"
                type="date"
                value={data.issueDate || ''}
                onChange={(e) => updateData({ issueDate: e.target.value })}
                className={errors.issueDate ? 'border-red-500' : ''}
            />
            {errors.issueDate && <span className="text-xs text-red-500">{errors.issueDate}</span>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
                id="dueDate"
                type="date"
                value={data.dueDate || ''}
                onChange={(e) => updateData({ dueDate: e.target.value })}
                className={errors.dueDate ? 'border-red-500' : ''}
            />
             {errors.dueDate && <span className="text-xs text-red-500">{errors.dueDate}</span>}
        </div>

        {/* Local de Entrega */}
        <div className="col-span-1 md:col-span-2 space-y-2">
            <Label htmlFor="deliveryPlace">Local de Entrega</Label>
            <Input
                id="deliveryPlace"
                placeholder="Ex: Fazenda Santa Maria, Rodovia BR-163, Km 500"
                value={data.deliveryPlace || ''}
                onChange={(e) => updateData({ deliveryPlace: e.target.value })}
                className={errors.deliveryPlace ? 'border-red-500' : ''}
            />
            {errors.deliveryPlace && <span className="text-xs text-red-500">{errors.deliveryPlace}</span>}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>Voltar</Button>
        <Button onClick={handleNext}>Próximo</Button>
      </div>
    </div>
  )
}
