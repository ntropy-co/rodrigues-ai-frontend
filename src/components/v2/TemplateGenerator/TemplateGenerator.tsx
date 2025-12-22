"use client";

import { useState } from "react";
import { DocumentTypeSelector } from "./DocumentTypeSelector";
import { DocumentForm } from "./DocumentForm";
import { ClausesSelector } from "./ClausesSelector";
import { DocumentPreview } from "./DocumentPreview";
import { DocumentTypeId } from "./types";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { generateDocx } from "./docGenerator";
import { toast } from "sonner";

export function TemplateGenerator() {
  const [selectedType, setSelectedType] = useState<DocumentTypeId>("cpr-fisica");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTypeChange = (type: DocumentTypeId) => {
    setSelectedType(type);
    setFormData({}); // Limpa formulário ao trocar tipo
  };

  const handleDownloadDocx = async () => {
    try {
      setIsGenerating(true);
      await generateDocx({
        typeId: selectedType,
        data: formData,
        clauses: selectedClauses,
      });
      toast.success("Documento gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar documento:", error);
      toast.error("Erro ao gerar o documento. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    import('@/lib/export/pdf').then(({ exportToPdf }) => {
      exportToPdf({ source: 'template_generator' });
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen max-h-screen overflow-hidden bg-slate-50">
      {/* Sidebar de Configuração */}
      <aside className="w-full lg:w-[450px] bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-1">
            Gerador de Minutas
          </h2>
          <p className="text-sm text-slate-500">
            Configure os dados para gerar seu documento.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <section>
            <DocumentTypeSelector
              selectedType={selectedType}
              onSelect={handleTypeChange}
            />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-1 bg-blue-500 rounded-full" />
              <h3 className="font-semibold text-slate-800">Dados do Contrato</h3>
            </div>
            <DocumentForm
              typeId={selectedType}
              data={formData}
              onChange={setFormData}
            />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
               <div className="h-6 w-1 bg-green-500 rounded-full" />
              <h3 className="font-semibold text-slate-800">Cláusulas Acessórias</h3>
            </div>
            <ClausesSelector
              selectedClauses={selectedClauses}
              onChange={setSelectedClauses}
              documentTypeId={selectedType}
            />
          </section>
        </div>

        <div className="p-4 border-t bg-slate-50 gap-3 flex flex-col sm:flex-row">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={handleDownloadDocx}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Baixar Word
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Salvar PDF (Print)
          </Button>
        </div>
      </aside>

      {/* Área de Preview */}
      <main className="flex-1 bg-slate-100/50 p-4 lg:p-8 overflow-y-auto flex justify-center items-start">
        <div className="w-full max-w-[210mm] transition-all duration-300 ease-in-out transform origin-top hover:scale-[1.01]">
            <div className="mb-4 flex justify-between items-center lg:hidden">
                 <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider">Preview do Documento</h3>
            </div>
            <DocumentPreview
            typeId={selectedType}
            data={formData}
            clauses={selectedClauses}
            />
        </div>
      </main>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        @media print {
            aside { display: none; }
            main { padding: 0; background: white; }
            main > div { box-shadow: none; border: none; max-width: none; width: 100%; transform: none !important; }
        }
      `}</style>
    </div>
  );
}
