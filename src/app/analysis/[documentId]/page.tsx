'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AnalysisLayout } from '@/components/v2/Analysis/AnalysisLayout'
import { AnalysisSummary } from '@/components/v2/Analysis/AnalysisSummary'
import { IssueCard, IssueSeverity } from '@/components/v2/Analysis/IssueCard'
import { FileText, Loader2 } from 'lucide-react'

// Tipos para os dados de análise
interface AnalysisIssue {
  id: string
  title: string
  description: string
  severity: IssueSeverity
  location?: string
  resolved?: boolean
}

interface AnalysisData {
  documentId: string
  documentName: string
  analysisDate: string
  issues: AnalysisIssue[]
}

// Mock data para demonstração - substituir por chamada à API
const mockAnalysisData: AnalysisData = {
  documentId: 'doc-123',
  documentName: 'CPR_Fazenda_Santa_Maria_2024.pdf',
  analysisDate: '18/12/2024',
  issues: [
    {
      id: '1',
      title: 'Valor da garantia inconsistente',
      description:
        'O valor declarado na cláusula 3.2 não corresponde ao valor calculado baseado na área e produtividade.',
      severity: 'high',
      location: 'Página 3, Cláusula 3.2'
    },
    {
      id: '2',
      title: 'Data de vencimento próxima',
      description:
        'A data de vencimento está a menos de 30 dias. Verificar se há necessidade de renovação.',
      severity: 'medium',
      location: 'Página 1, Cabeçalho'
    },
    {
      id: '3',
      title: 'Assinatura do avalista ausente',
      description:
        'O campo de assinatura do avalista está em branco na última página.',
      severity: 'high',
      location: 'Página 8, Assinaturas'
    },
    {
      id: '4',
      title: 'Formatação de CNPJ incorreta',
      description:
        'O CNPJ do emitente está sem a formatação padrão XX.XXX.XXX/XXXX-XX.',
      severity: 'low',
      location: 'Página 1, Identificação'
    }
  ]
}

export default function AnalysisPage() {
  const params = useParams()
  const documentId = params.documentId as string

  const [isLoading, setIsLoading] = useState(true)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)

  useEffect(() => {
    // Simular carregamento da API
    const fetchAnalysis = async () => {
      setIsLoading(true)
      // TODO: Substituir por chamada real à API
      // const response = await fetch(`/api/documents/${documentId}/analysis`)
      // const data = await response.json()

      // Usando mock data por enquanto
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAnalysisData({ ...mockAnalysisData, documentId })
      setIsLoading(false)
    }

    fetchAnalysis()
  }, [documentId])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-verde-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-verde-600" />
          <p className="mt-4 text-verde-700">Carregando análise...</p>
        </div>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-verde-50">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar análise</p>
        </div>
      </div>
    )
  }

  const highCount = analysisData.issues.filter(
    (i) => i.severity === 'high'
  ).length
  const mediumCount = analysisData.issues.filter(
    (i) => i.severity === 'medium'
  ).length
  const lowCount = analysisData.issues.filter(
    (i) => i.severity === 'low'
  ).length

  // Ordenar issues por severidade
  const sortedIssues = [...analysisData.issues].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.severity] - order[b.severity]
  })

  return (
    <AnalysisLayout
      documentName={analysisData.documentName}
      documentPanel={
        <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8">
          <FileText className="mb-4 h-16 w-16 text-gray-400" />
          <p className="text-center text-gray-500">
            Visualizador de PDF
            <br />
            <span className="text-sm">(Integrar react-pdf ou iframe)</span>
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Document ID: {documentId}
          </p>
        </div>
      }
      analysisPanel={
        <div className="space-y-6">
          {/* Resumo */}
          <AnalysisSummary
            totalIssues={analysisData.issues.length}
            highCount={highCount}
            mediumCount={mediumCount}
            lowCount={lowCount}
          />

          {/* Lista de Issues */}
          <div>
            <h3 className="mb-3 font-semibold text-verde-900">
              Problemas Encontrados ({analysisData.issues.length})
            </h3>
            <div className="space-y-3">
              {sortedIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={{
                    id: issue.id,
                    title: issue.title,
                    description: issue.description,
                    severity: issue.severity,
                    location: issue.location || ''
                  }}
                  onFix={() => {
                    console.log('Corrigir issue:', issue.id)
                    // TODO: Abrir modal de correção ou navegar para o Canvas
                  }}
                  onSelect={() => {
                    console.log('Navegar para:', issue.location)
                    // TODO: Destacar no PDF
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      }
    />
  )
}
