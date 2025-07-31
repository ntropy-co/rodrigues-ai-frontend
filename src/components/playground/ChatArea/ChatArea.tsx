'use client'

import ChatInput from './ChatInput'
import MessageArea from './MessageArea'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const ChatArea = () => {
  return (
    <main className="relative m-1.5 flex flex-grow flex-col rounded-xl bg-background overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <MessageArea />
      <div className="sticky bottom-0 ml-9 px-4 pb-2 md:ml-9 ml-2">
        <ChatInput />
      </div>
    </main>
  )
}

export default ChatArea
