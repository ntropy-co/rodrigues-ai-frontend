import { track } from '@/lib/analytics'

interface ExportPdfOptions {
  /** Source component name for analytics */
  source: 'template_generator' | 'risk_calculator' | string
  /** Optional filename if we were doing direct download (future proofing) */
  filename?: string
}

/**
 * Triggers browser print dialog for "Export to PDF" functionality
 * and tracks the event in analytics.
 */
export const exportToPdf = ({ source }: ExportPdfOptions) => {
  // Track the click event
  track('export_pdf_clicked', { 
    source, 
    format: 'pdf',
    timestamp: new Date().toISOString()
  })

  // Trigger print dialog
  // The CSS @media print rules in the components handle the layout
  window.print()
}
