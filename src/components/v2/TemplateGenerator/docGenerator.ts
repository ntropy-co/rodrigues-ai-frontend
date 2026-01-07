import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType
} from 'docx'
import { saveAs } from 'file-saver'
import { DocumentTypeId, OPTIONAL_CLAUSES } from './types'

interface GenerationData {
  typeId: DocumentTypeId
  data: Record<string, string | number | boolean>
  clauses: string[]
}

export const generateDocx = async ({
  typeId,
  data,
  clauses
}: GenerationData) => {
  // Configuração básica do documento
  const titleText =
    typeId === 'cpr-fisica'
      ? 'CÉDULA DE PRODUTO RURAL - CPR (FÍSICA)'
      : typeId === 'cpr-financeira'
        ? 'CÉDULA DE PRODUTO RURAL - CPR (FINANCEIRA)'
        : 'CONTRATO DE COMPRA E VENDA'

  const paragraphs = [
    new Paragraph({
      text: titleText,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  ]

  // Adicionando dados do formulário como parágrafos
  // Em uma implementação real, isso seria um template mais complexo
  Object.entries(data).forEach(([key, value]) => {
    // Formata a chave para ficar legível (ex: emitente_nome -> Emitente Nome)
    const label = key.replace(/_/g, ' ').toUpperCase()

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${label}: `,
            bold: true
          }),
          new TextRun({
            text: String(value)
          })
        ],
        spacing: { after: 200 }
      })
    )
  })

  // Adicionando Cláusulas
  if (clauses.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: 'CLÁUSULAS ADICIONAIS',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 400, after: 200 }
      })
    )

    clauses.forEach((clauseId, index) => {
      const clauseDef = OPTIONAL_CLAUSES.find((c) => c.id === clauseId)
      if (clauseDef) {
        // Clause heading
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${clauseDef.label.toUpperCase()}`,
                bold: true
              })
            ],
            spacing: { before: 200, after: 100 }
          })
        )
        // Clause content
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: clauseDef.content
              })
            ],
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED
          })
        )
      }
    })
  }

  // Rodapé com local e data
  paragraphs.push(
    new Paragraph({
      text: `Local e Data: ____________________, ___ de ____________ de ______`,
      alignment: AlignmentType.CENTER,
      spacing: { before: 800 }
    })
  )

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs
      }
    ]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `minuta-${typeId}-${new Date().getTime()}.docx`)
}
