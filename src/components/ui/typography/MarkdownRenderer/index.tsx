import dynamic from 'next/dynamic'

// Dynamic import para code splitting - reduz bundle inicial em ~180KB
// react-markdown + rehype/remark plugins são pesados e raramente usados no initial load
const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), {
  ssr: true, // Manter SSR para SEO e conteúdo inicial
  loading: () => (
    // Skeleton loader com altura similar ao conteúdo
    <div className="animate-pulse space-y-3 rounded-lg p-2">
      <div className="h-4 w-3/4 rounded bg-muted"></div>
      <div className="h-4 w-full rounded bg-muted"></div>
      <div className="h-4 w-5/6 rounded bg-muted"></div>
    </div>
  )
})

export default MarkdownRenderer
