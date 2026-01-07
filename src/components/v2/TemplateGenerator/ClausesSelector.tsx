import { Checkbox } from '@/components/ui/checkbox'
import { OPTIONAL_CLAUSES, DocumentTypeId } from './types'

interface ClausesSelectorProps {
  selectedClauses: string[]
  onChange: (clauses: string[]) => void
  documentTypeId?: DocumentTypeId
}

export function ClausesSelector({
  selectedClauses,
  onChange,
  documentTypeId
}: ClausesSelectorProps) {
  const handleToggle = (clauseId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedClauses, clauseId])
    } else {
      onChange(selectedClauses.filter((id) => id !== clauseId))
    }
  }

  // Filter clauses by document type (empty appliesTo = applies to all)
  const applicableClauses = OPTIONAL_CLAUSES.filter(
    (clause) =>
      clause.appliesTo.length === 0 ||
      (documentTypeId && clause.appliesTo.includes(documentTypeId))
  )

  return (
    <div className="space-y-4 rounded-lg border bg-slate-50/50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">
        Cláusulas Opcionais
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {applicableClauses.map((clause) => (
          <div
            key={clause.id}
            className="flex items-start space-x-3 rounded-md p-2 transition-colors hover:bg-slate-100"
          >
            <Checkbox
              id={clause.id}
              checked={selectedClauses.includes(clause.id)}
              onCheckedChange={(checked) =>
                handleToggle(clause.id, checked as boolean)
              }
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={clause.id}
                className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {clause.label}
              </label>
              {clause.description && (
                <p className="text-xs text-muted-foreground">
                  {clause.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
