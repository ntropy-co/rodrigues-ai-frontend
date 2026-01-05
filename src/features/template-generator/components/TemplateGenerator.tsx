'use client'

import { useState } from 'react'
import { DocumentTypeSelector } from './DocumentTypeSelector'
import { DocumentForm } from './DocumentForm'
import { ClausesSelector } from './ClausesSelector'
import { DocumentPreview } from './DocumentPreview'
import { DocumentTypeId } from './types'
import { Button } from '@/components/ui/button'
import { Download, FileText, Loader2 } from 'lucide-react'
import { generateDocx } from './docGenerator'
import { toast } from 'sonner'

export function TemplateGenerator() {
  const [selectedType, setSelectedType] = useState<DocumentTypeId>('cpr-fisica')
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean>
  >({})
  const [selectedClauses, setSelectedClauses] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleTypeChange = (type: DocumentTypeId) => {
    setSelectedType(type)
    setFormData({}) // Limpa formulário ao trocar tipo
  }

  const handleDownloadDocx = async () => {
    try {
      setIsGenerating(true)
      await generateDocx({
        typeId: selectedType,
        data: formData,
        clauses: selectedClauses
      })
      toast.success('Documento gerado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar documento:', error)
      toast.error('Erro ao gerar o documento. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPdf = () => {
    import('@/lib/export/pdf').then(({ exportToPdf }) => {
      exportToPdf({ source: 'template_generator' })
    })
  }

  return (
    <div className="flex h-screen max-h-screen flex-col overflow-hidden bg-sand-50 lg:flex-row">
      {/* Sidebar de Configuração */}
      <aside className="z-10 flex h-full w-full flex-col overflow-hidden border-r border-sand-300 bg-white shadow-sm lg:w-[450px]">
        <div className="border-b border-sand-200 bg-white p-6">
          <h2 className="mb-1 bg-gradient-to-r from-verity-950 to-verity-700 bg-clip-text text-xl font-bold text-transparent">
            Gerador de Minutas
          </h2>
          <p className="text-sm text-verity-500">
            Configure os dados para gerar seu documento.
          </p>
        </div>

        <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-6">
          <section>
            <DocumentTypeSelector
              selectedType={selectedType}
              onSelect={handleTypeChange}
            />
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-verity-500" />
              <h3 className="font-semibold text-verity-900">
                Dados do Contrato
              </h3>
            </div>
            <DocumentForm
              typeId={selectedType}
              data={formData}
              onChange={setFormData}
            />
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-verity-500" />
              <h3 className="font-semibold text-verity-900">
                Cláusulas Acessórias
              </h3>
            </div>
            <ClausesSelector
              selectedClauses={selectedClauses}
              onChange={setSelectedClauses}
              documentTypeId={selectedType}
            />
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-sand-200 bg-sand-50 p-4 sm:flex-row">
          <Button
            className="flex-1 bg-verity-600 text-white hover:bg-verity-700"
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
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownloadPdf}
          >
            <Download className="mr-2 h-4 w-4" />
            Salvar PDF (Print)
          </Button>
        </div>
      </aside>

      {/* Área de Preview */}
      <main className="flex flex-1 items-start justify-center overflow-y-auto bg-sand-100/60 p-4 lg:p-8">
        <div className="w-full max-w-[210mm] origin-top transform transition-all duration-300 ease-in-out hover:scale-[1.01]">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-verity-500">
              Preview do Documento
            </h3>
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
          background-color: #e5e5e5;
          border-radius: 20px;
        }
        @media print {
          aside {
            display: none;
          }
          main {
            padding: 0;
            background: white;
          }
          main > div {
            box-shadow: none;
            border: none;
            max-width: none;
            width: 100%;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}
