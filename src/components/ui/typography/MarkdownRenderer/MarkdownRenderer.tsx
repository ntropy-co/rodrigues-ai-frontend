import { type FC } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

import { type MarkdownRendererProps } from './types'
import { inlineComponents } from './inlineStyles'
import { components } from './styles'

const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  children,
  classname,
  inline = false
}) => (
  <ReactMarkdown
    className={cn(
      'prose prose-lg flex w-full flex-col gap-y-5 rounded-lg dark:prose-invert prose-h1:text-2xl',
      classname
    )}
    components={{ ...(inline ? inlineComponents : components) }}
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw, rehypeSanitize]}
  >
    {children}
  </ReactMarkdown>
)

export default MarkdownRenderer
