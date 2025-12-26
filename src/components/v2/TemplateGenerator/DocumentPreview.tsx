import { DocumentTypeId, OPTIONAL_CLAUSES } from "./types";

interface DocumentPreviewProps {
  typeId: DocumentTypeId;
  data: Record<string, any>;
  clauses: string[];
}

export function DocumentPreview({ typeId, data, clauses }: DocumentPreviewProps) {
  const getTitle = () => {
    switch (typeId) {
      case "cpr-fisica": return "CÉDULA DE PRODUTO RURAL - CPR (FÍSICA)";
      case "cpr-financeira": return "CÉDULA DE PRODUTO RURAL - CPR (FINANCEIRA)";
      case "contrato-compra-venda": return "CONTRATO DE COMPRA E VENDA";
      default: return "DOCUMENTO";
    }
  };

  const selectedClauseObjects = clauses
    .map((id) => OPTIONAL_CLAUSES.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  return (
    <div id="document-preview-content" className="bg-white shadow-lg border border-slate-200 p-8 min-h-[800px] w-full max-w-[210mm] mx-auto text-sm leading-relaxed text-justify font-serif text-slate-900">
      <h1 className="text-xl font-bold text-center mb-8 uppercase border-b-2 border-black pb-4">
        {getTitle()}
      </h1>

      <div className="space-y-6">
        {/* Renderização Simplificada dos Dados - Em produção seria um template string rico */}
        <div className="section">
            <h2 className="font-bold uppercase text-xs text-slate-500 mb-2">Dados do Documento</h2>
            {Object.entries(data).length === 0 ? (
                <p className="text-slate-400 italic">Preencha o formulário para visualizar os dados aqui...</p>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key}>
                            <span className="font-bold capitalize">{key.replace(/_/g, " ")}: </span>
                            <span>{value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {selectedClauseObjects.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="font-bold mb-4 text-lg uppercase tracking-wide">CLÁUSULAS ADICIONAIS</h3>
            <div className="space-y-6">
              {selectedClauseObjects.map((clause, index) => (
                <div key={clause.id} className="clause-block">
                  <h4 className="font-bold text-sm mb-2">
                    {index + 1}. {clause.label.toUpperCase()}
                  </h4>
                  <p className="text-sm leading-relaxed text-justify indent-8">
                    {clause.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-black text-center">
             <p>_________________________________________________</p>
             <p className="mt-1 font-bold">ASSINATURA DO EMITENTE</p>
        </div>
      </div>
    </div>
  );
}

