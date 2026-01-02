import { DocumentTypeId, OPTIONAL_CLAUSES } from './types'

interface DocumentPreviewProps {
  typeId: DocumentTypeId
  data: Record<string, string | number | boolean>
  clauses: string[]
}

export function DocumentPreview({
  typeId,
  data,
  clauses
}: DocumentPreviewProps) {
  const getTitle = () => {
    switch (typeId) {
      case 'cpr-fisica':
        return 'CÉDULA DE PRODUTO RURAL - CPR (FÍSICA)'
      case 'cpr-financeira':
        return 'CÉDULA DE PRODUTO RURAL - CPR (FINANCEIRA)'
      case 'contrato-compra-venda':
        return 'CONTRATO DE COMPRA E VENDA'
      default:
        return 'DOCUMENTO'
    }
  }

  const selectedClauseObjects = clauses
    .map((id) => OPTIONAL_CLAUSES.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)

  return (
    <div
      id="document-preview-content"
      className="mx-auto min-h-[800px] w-full max-w-[210mm] border border-slate-200 bg-white p-8 text-justify font-serif text-sm leading-relaxed text-slate-900 shadow-lg"
    >
      <h1 className="mb-8 border-b-2 border-black pb-4 text-center text-xl font-bold uppercase">
        {getTitle()}
      </h1>

      <div className="space-y-6">
        {/* Renderização Simplificada dos Dados - Em produção seria um template string rico */}
        <div className="section">
          <h2 className="mb-2 text-xs font-bold uppercase text-slate-500">
            Dados do Documento
          </h2>
          {Object.entries(data).length === 0 ? (
            <p className="italic text-slate-400">
              Preencha o formulário para visualizar os dados aqui...
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                  <span className="font-bold capitalize">
                    {key.replace(/_/g, ' ')}:{' '}
                  </span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedClauseObjects.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="mb-4 text-lg font-bold uppercase tracking-wide">
              CLÁUSULAS ADICIONAIS
            </h3>
            <div className="space-y-6">
              {selectedClauseObjects.map((clause, index) => (
                <div key={clause.id} className="clause-block">
                  <h4 className="mb-2 text-sm font-bold">
                    {index + 1}. {clause.label.toUpperCase()}
                  </h4>
                  <p className="text-justify indent-8 text-sm leading-relaxed">
                    {clause.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-black pt-8 text-center">
          <p>_________________________________________________</p>
          <p className="mt-1 font-bold">ASSINATURA DO EMITENTE</p>
        </div>
      </div>
    </div>
  )
}
