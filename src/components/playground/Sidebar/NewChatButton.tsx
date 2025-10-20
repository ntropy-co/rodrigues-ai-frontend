'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'
import { usePlaygroundStore } from '@/store'

function NewChatButton() {
  const router = useRouter()
  const { messages, setMessages } = usePlaygroundStore()

  const handleNewChat = () => {
    setMessages([]) // Limpar mensagens
    router.push('/chat') // Navegar para nova conversa
  }

  return (
    <Button
      className="z-10 cursor-pointer rounded bg-brand px-4 py-2 font-bold text-primary hover:bg-brand/80 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleNewChat}
      disabled={messages.length === 0}
    >
      <div className="flex items-center gap-2">
        <p>New Chat</p>{' '}
        <Icon type="plus-icon" size="xs" className="text-background" />
      </div>
    </Button>
  )
}

export default NewChatButton
