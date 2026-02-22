'use client'

import type { FC } from 'react'
import { useMessagePartText } from '@assistant-ui/react'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer/MarkdownRenderer'

export const MarkdownText: FC = () => {
  const { text } = useMessagePartText()
  return <MarkdownRenderer>{text}</MarkdownRenderer>
}
