import { track, ANALYTICS_EVENTS } from '@/lib/analytics'
import { toast } from 'sonner'

interface ExportPdfOptions {
  /** Source component name for analytics */
  source: 'template_generator' | 'risk_calculator' | string
  /** Target element ID to capture */
  elementId?: string
  /** Filename for download */
  filename?: string
}

/**
 * Generates a high-quality PDF from a DOM element using html2canvas and jspdf.
 *
 * @param options Configuration for PDF generation
 */
export const exportToPdf = async ({
  source,
  elementId = 'document-preview-content',
  filename = 'documento.pdf'
}: ExportPdfOptions) => {
  try {
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const element = document.getElementById(elementId)
    if (!element) {
      toast.error('Elemento para PDF não encontrado.')
      return
    }

    // UX: Show loading
    const toastId = toast.loading('Gerando PDF...')

    // Track start
    track(ANALYTICS_EVENTS.EXPORT_PDF_START, { source, format: 'pdf' })

    // Capture canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true, // Handle images if any
      allowTaint: true
    })

    const imgData = canvas.toDataURL('image/jpeg', 1.0)

    // PDF Setup (A4)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calc dimensions preserving aspect ratio
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

    // Multi-page logic
    while (heightLeft > 0) {
      position = heightLeft - imgHeight // Move position up
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }

    // Download
    pdf.save(filename)

    // Success
    track(ANALYTICS_EVENTS.EXPORT_PDF_SUCCESS, { source })
    toast.success('PDF baixado com sucesso!', { id: toastId })
  } catch (error) {
    console.error('PDF Generation Error:', error)
    track(ANALYTICS_EVENTS.EXPORT_PDF_ERROR, { source, error: String(error) })
    toast.error('Erro ao gerar PDF. Tente novamente.')
  }
}
