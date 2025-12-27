'use client'

import { createContext, useContext, useRef, type RefObject } from 'react'

interface ChatInputContextType {
  chatInputRef: RefObject<HTMLTextAreaElement | null>
}

const ChatInputContext = createContext<ChatInputContextType | undefined>(
  undefined
)

export function ChatInputProvider({ children }: { children: React.ReactNode }) {
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null)

  return (
    <ChatInputContext.Provider value={{ chatInputRef }}>
      {children}
    </ChatInputContext.Provider>
  )
}

export function useChatInputRef() {
  const context = useContext(ChatInputContext)
  if (context === undefined) {
    throw new Error('useChatInputRef must be used within a ChatInputProvider')
  }
  return context.chatInputRef
}
