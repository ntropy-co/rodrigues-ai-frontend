import { type FC } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

import { type MarkdownRendererProps } from './types'
import { inlineComponents } from './inlineStyles'
import { components } from './styles'

// Smart Blocks
import { ThinkingBlock } from '@/features/chat'
import { CitationCard } from '@/features/chat'

const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  children,
  classname,
  inline = false
}) => (
  <ReactMarkdown
    className={cn(
      'prose prose-sm flex w-full flex-col gap-y-2 rounded-lg dark:prose-invert prose-headings:mb-2 prose-headings:mt-4 prose-h1:text-xl prose-p:my-1',
      classname
    )}
    components={{
      ...(inline ? inlineComponents : components),
      // @ts-expect-error - Custom tag handling
      thinking: ({ children }) => <ThinkingBlock content={String(children)} />,
      // @ts-expect-error - Custom tag handling
      citation: ({ id, page, preview, source }) => (
        <CitationCard
          id={id || 'REF'}
          pageNumber={page}
          previewText={preview}
          sourceName={source}
        />
      )
    }}
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[
      rehypeRaw,
      [
        rehypeSanitize,
        {
          ...defaultSchema,
          tagNames: [...(defaultSchema.tagNames || []), 'thinking', 'citation'],
          attributes: {
            ...defaultSchema.attributes,
            citation: ['id', 'page', 'preview', 'source']
          }
        }
      ]
    ]}
  >
    {children}
  </ReactMarkdown>
)

export default MarkdownRenderer
