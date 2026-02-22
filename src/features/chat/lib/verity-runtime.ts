'use client'

import { useMemo } from 'react'
import {
  useExternalStoreRuntime,
  type ThreadMessageLike,
  type ExternalStoreAdapter
} from '@assistant-ui/react'
import { usePlaygroundStore } from '../stores/playgroundStore'
import type { PlaygroundChatMessage } from '../types'

/**
 * Converte PlaygroundChatMessage (Zustand) → ThreadMessageLike (assistant-ui)
 */
function convertMessage(msg: PlaygroundChatMessage): ThreadMessageLike {
  const role =
    msg.role === 'agent'
      ? 'assistant'
      : msg.role === 'system'
        ? 'system'
        : msg.role === 'user'
          ? 'user'
          : 'assistant'

  return {
    id: msg.id ?? `msg-${msg.created_at}`,
    role,
    content: msg.content ? [{ type: 'text' as const, text: msg.content }] : [],
    createdAt: new Date(msg.created_at)
  }
}

interface UseVerityRuntimeOptions {
  onSendMessage: (message: string, files?: File[]) => Promise<void> | void
}

/**
 * Hook que cria o ExternalStoreRuntime do assistant-ui,
 * alimentado pelo playgroundStore (Zustand).
 */
export function useVerityRuntime({ onSendMessage }: UseVerityRuntimeOptions) {
  const messages = usePlaygroundStore((state) => state.messages)
  const isStreaming = usePlaygroundStore((state) => state.isStreaming)

  const adapter = useMemo<ExternalStoreAdapter<PlaygroundChatMessage>>(
    () => ({
      messages,
      isRunning: isStreaming,
      convertMessage,
      onNew: async (message) => {
        // Extrair texto do content do assistant-ui
        const textParts = message.content.filter(
          (part): part is { type: 'text'; text: string } => part.type === 'text'
        )
        const text = textParts.map((p) => p.text).join('\n')

        if (text.trim()) {
          await onSendMessage(text)
        }
      }
    }),
    [messages, isStreaming, onSendMessage]
  )

  return useExternalStoreRuntime(adapter)
}
