import React, { useState } from 'react'
import { CPRWizardData } from '../schema'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { DownloadIcon, FileTextIcon, Loader2 } from 'lucide-react'

interface StepReviewProps {
  data: Partial<CPRWizardData>
  onBack: () => void
  goToStep: (step: number) => void
}

export function StepReview({ data, onBack, goToStep }: StepReviewProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = async () => {
    if (!confirmed) return
    
    setIsGenerating(true)
    
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsGenerating(false)
    setGenerated(true)
    toast.success('Minuta da CPR gerada com sucesso!')
  }

  if (generated) {
    return (
        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-500 py-10">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FileTextIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Documento Pronto!</h2>
            <p className="text-muted-foreground">A CPR foi gerada e está pronta para download.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button variant="outline" className="gap-2">
                    <DownloadIcon className="w-4 h-4" />
                    Baixar PDF
                </Button>
                <Button variant="outline" className="gap-2">
                    <DownloadIcon className="w-4 h-4" />
                    Baixar Word (.docx)
                </Button>
            </div>
             <Button variant="ghost" onClick={onBack} className="mt-4 text-xs">Voltar para edição</Button>
        </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      <div className="space-y-4">
         {/* Resumo Valores */}
         <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-base">Valores e Prazos</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => goToStep(4)} className="text-xs h-8">Editar</Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                   <span className="text-muted-foreground block">Valor Total</span>
                   <span className="font-semibold">
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.amount || 0)}
                   </span>
                </div>
                <div>
                    <span className="text-muted-foreground block">Vencimento</span>
                    <span className="font-semibold">{data.dueDate}</span>
                </div>
                 <div>
                    <span className="text-muted-foreground block">Local de Entrega</span>
                    <span className="font-semibold">{data.deliveryPlace}</span>
                </div>
            </CardContent>
         </Card>

         {/* Resumo Garantias */}
         <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-base">Garantias</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => goToStep(5)} className="text-xs h-8">Editar</Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                 <div>
                    <span className="text-muted-foreground block">Tipos</span>
                    <span className="font-semibold">{data.guaranteeType?.join(', ')}</span>
                </div>
                {data.hasGuarantor && (
                     <div className="pt-2 border-t">
                        <span className="text-muted-foreground block">Avalista</span>
                        <span className="font-semibold">{data.guarantorName}</span>
                        <span className="text-xs text-muted-foreground block">{data.guarantorCpfCnpj}</span>
                    </div>
                )}
            </CardContent>
         </Card>
      </div>

      <div className="flex items-center space-x-2 border p-4 rounded-md bg-amber-50/20 border-amber-100">
        <Checkbox 
            id="confirm" 
            checked={confirmed}
            onCheckedChange={(c) => setConfirmed(c === true)}
        />
        <label 
            htmlFor="confirm"
            className="text-sm font-medium leading-none cursor-pointer"
        >
            Confirmo que revisei todos os dados e desejo gerar o documento.
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>Voltar</Button>
        <Button 
            onClick={handleGenerate} 
            disabled={!confirmed || isGenerating}
            className="min-w-[150px]"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                </>
            ) : (
                'Gerar Documento'
            )}
        </Button>
      </div>
    </div>
  )
}
