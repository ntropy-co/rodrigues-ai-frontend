import { Checkbox } from "@/components/ui/checkbox";
import { OPTIONAL_CLAUSES, DocumentTypeId } from "./types";

interface ClausesSelectorProps {
  selectedClauses: string[];
  onChange: (clauses: string[]) => void;
  documentTypeId?: DocumentTypeId;
}

export function ClausesSelector({ selectedClauses, onChange, documentTypeId }: ClausesSelectorProps) {
  const handleToggle = (clauseId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedClauses, clauseId]);
    } else {
      onChange(selectedClauses.filter((id) => id !== clauseId));
    }
  };

  // Filter clauses by document type (empty appliesTo = applies to all)
  const applicableClauses = OPTIONAL_CLAUSES.filter(
    (clause) => clause.appliesTo.length === 0 || (documentTypeId && clause.appliesTo.includes(documentTypeId))
  );

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-slate-50/50">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">Cláusulas Opcionais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {applicableClauses.map((clause) => (
          <div key={clause.id} className="flex items-start space-x-3 p-2 hover:bg-slate-100 rounded-md transition-colors">
            <Checkbox
              id={clause.id}
              checked={selectedClauses.includes(clause.id)}
              onCheckedChange={(checked) => handleToggle(clause.id, checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={clause.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
  );
}
