'use client'

import { DiffViewer } from '@/features/chat'

const ORIGINAL_TEXT = `CÉDULA DE PRODUTO RURAL (CPR)

EMITENTE: João da Silva
CPF: 123.456.789-00
ENDEREÇO: Fazenda Boa Vista, Zona Rural

PRODUTO: Soja
QUANTIDADE: 1.000 sacas de 60kg
PREÇO UNITÁRIO: R$ 150,00
VALOR TOTAL: R$ 150.000,00

GARANTIA: Penhor de Safra
DESCRIÇÃO: Safra de soja 2024/2025

VENCIMENTO: 30/06/2025

Cidade, 01 de Janeiro de 2025.

___________________________
Assinatura do Emitente`

const MODIFIED_TEXT = `CÉDULA DE PRODUTO RURAL (CPR)

EMITENTE: João da Silva Santos
CPF: 123.456.789-00
ENDEREÇO: Fazenda Boa Vista, Rodovia BR-163, Km 200, Zona Rural

PRODUTO: Soja Transgênica
QUANTIDADE: 1.200 sacas de 60kg
PREÇO UNITÁRIO: R$ 160,00
VALOR TOTAL: R$ 192.000,00

GARANTIA: Penhor de Safra e Hipoteca
DESCRIÇÃO: Safra de soja 2024/2025, com garantia adicional sobre matrícula nº 12345

ÍNDICE DE CORREÇÃO: IPCA

VENCIMENTO: 30/07/2025

Cidade, 15 de Janeiro de 2025.

___________________________
Assinatura do Emitente

___________________________
Assinatura do Avalista`

export default function DiffViewerTestPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Comparador de Documentos</h1>
      <p className="mb-6 text-muted-foreground">
        Visualize as diferenças entre versões de contratos e minutas.
      </p>

      <DiffViewer
        original={ORIGINAL_TEXT}
        modified={MODIFIED_TEXT}
        mode="unified"
        showLineNumbers={true}
      />
    </div>
  )
}
