import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { DocumentField, FIELDS_BY_TYPE, DocumentTypeId } from './types'

interface DocumentFormProps {
  typeId: DocumentTypeId
  data: Record<string, string | number | boolean>
  onChange: (data: Record<string, string | number | boolean>) => void
}

export function DocumentForm({ typeId, data, onChange }: DocumentFormProps) {
  const fields = FIELDS_BY_TYPE[typeId] || []

  const handleChange = (name: string, value: string | number | boolean) => {
    onChange({
      ...data,
      [name]: value
    })
  }

  const renderField = (field: DocumentField) => {
    const rawValue = data[field.name]
    const value = rawValue !== undefined ? String(rawValue) : ''

    switch (field.type) {
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleChange(field.name, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
          />
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        )

      default: // text, cpf, cnpj, currency (handled as text for now, can add masking libraries later)
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        )
    }
  }

  return (
    <div className="grid gap-4 py-4">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-2">
          <Label
            htmlFor={field.name}
            className="text-sm font-medium text-slate-700"
          >
            {field.label}{' '}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          {renderField(field)}
        </div>
      ))}
    </div>
  )
}
