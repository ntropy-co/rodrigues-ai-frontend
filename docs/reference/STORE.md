# 🗄️ Zustand Store

O projeto utiliza Zustand para gerenciamento de estado client-side.

## Arquivo Principal

`src/store.ts`

## Visão Geral

O `usePlaygroundStore` é o store principal da aplicação, gerenciando:

- Estado da sessão de chat/playground
- Configuração de endpoints e agentes
- Mensagens do chat
- Estado de streaming
- Sessões persistidas

## Interface do Store

```typescript
interface PlaygroundStore {
  // ===========================
  // Hydration (SSR safety)
  // ===========================
  hydrated: boolean
  setHydrated: () => void

  // ===========================
  // Streaming State
  // ===========================
  isStreaming: boolean
  setIsStreaming: (isStreaming: boolean) => void
  streamingErrorMessage: string
  setStreamingErrorMessage: (streamingErrorMessage: string) => void

  // ===========================
  // Endpoint Configuration
  // ===========================
  endpoints: Array<{
    endpoint: string
    id_playground_endpoint: string
  }>
  setEndpoints: (endpoints: Array<{ endpoint: string; id_playground_endpoint: string }>) => void
  selectedEndpoint: string
  setSelectedEndpoint: (selectedEndpoint: string) => void
  isEndpointActive: boolean
  setIsEndpointActive: (isActive: boolean) => void
  isEndpointLoading: boolean
  setIsEndpointLoading: (isLoading: boolean) => void

  // ===========================
  // Chat Messages
  // ===========================
  messages: PlaygroundChatMessage[]
  setMessages: (
    messages: PlaygroundChatMessage[] | ((prev: PlaygroundChatMessage[]) => PlaygroundChatMessage[])
  ) => void

  // ===========================
  // Agent Configuration
  // ===========================
  agents: Agent[]
  setAgents: (agents: Agent[]) => void
  agentId: string | null
  setAgentId: (agentId: string | null) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  hasStorage: boolean
  setHasStorage: (hasStorage: boolean) => void

  // ===========================
  // Session Management
  // ===========================
  sessionId: string | null
  setSessionId: (sessionId: string | null) => void
  sessionsData: SessionEntry[] | null
  setSessionsData: (
    sessionsData: SessionEntry[] | ((prev: SessionEntry[] | null) => SessionEntry[] | null)
  ) => void
  isSessionsLoading: boolean
  setIsSessionsLoading: (isSessionsLoading: boolean) => void
  locallyCreatedSessionIds: string[]
  addLocallyCreatedSessionId: (sessionId: string) => void
}
```

## Tipos Auxiliares

```typescript
interface Agent {
  value: string
  label: string
  model: {
    provider: string
  }
  storage?: boolean
}

interface PlaygroundChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
  metadata?: Record<string, unknown>
}

interface SessionEntry {
  session_id: string
  title?: string
  created_at: string
  updated_at: string
  message_count?: number
}
```

## Persistência

O store usa `persist` middleware do Zustand para salvar parte do estado no localStorage:

```typescript
persist(
  (set) => ({ ... }),
  {
    name: 'endpoint-storage',           // Chave no localStorage
    storage: createJSONStorage(() => localStorage),
    partialize: () => ({
      selectedEndpoint: process.env.NEXT_PUBLIC_API_URL || ''
    }),
    onRehydrateStorage: () => (state) => {
      state?.setHydrated?.()            // Marca como hidratado após SSR
    }
  }
)
```

**Nota**: Apenas `selectedEndpoint` é persistido. Mensagens e sessões são efêmeras por sessão.

## Uso no Componente

### Importação e Uso Básico

```typescript
import { usePlaygroundStore } from '@/store'

function ChatComponent() {
  // Seleção individual (melhor performance)
  const messages = usePlaygroundStore((state) => state.messages)
  const isStreaming = usePlaygroundStore((state) => state.isStreaming)
  const setMessages = usePlaygroundStore((state) => state.setMessages)

  // Adicionar mensagem
  const addMessage = (message: PlaygroundChatMessage) => {
    setMessages((prev) => [...prev, message])
  }

  // Limpar mensagens
  const clearMessages = () => {
    setMessages([])
  }
}
```

### Múltiplas Seleções

```typescript
function StreamingIndicator() {
  // Desestruturação (causa re-render em qualquer mudança)
  const { isStreaming, streamingErrorMessage } = usePlaygroundStore()

  // Seleção seletiva (recomendado - evita re-renders desnecessários)
  const isStreaming = usePlaygroundStore((s) => s.isStreaming)
  const error = usePlaygroundStore((s) => s.streamingErrorMessage)
}
```

### SSR Safety com Hydration

```typescript
function HydratedComponent() {
  const hydrated = usePlaygroundStore((state) => state.hydrated)

  // Evita flash de conteúdo durante hidratação SSR
  if (!hydrated) {
    return <Skeleton />
  }

  return <ActualContent />
}
```

## Padrões de Uso

### 1. Gerenciamento de Streaming

```typescript
function useStreamingChat() {
  const setIsStreaming = usePlaygroundStore((s) => s.setIsStreaming)
  const setMessages = usePlaygroundStore((s) => s.setMessages)
  const setError = usePlaygroundStore((s) => s.setStreamingErrorMessage)

  const startStreaming = async (userMessage: string) => {
    setIsStreaming(true)
    setError('')

    try {
      // ... streaming logic
      setMessages((prev) => [...prev, newMessage])
    } catch (error) {
      setError(error.message)
    } finally {
      setIsStreaming(false)
    }
  }
}
```

### 2. Gerenciamento de Sessões

```typescript
function useSessionManagement() {
  const sessionId = usePlaygroundStore((s) => s.sessionId)
  const setSessionId = usePlaygroundStore((s) => s.setSessionId)
  const sessionsData = usePlaygroundStore((s) => s.sessionsData)
  const setSessionsData = usePlaygroundStore((s) => s.setSessionsData)
  const addLocalSession = usePlaygroundStore((s) => s.addLocallyCreatedSessionId)

  const createNewSession = (id: string) => {
    setSessionId(id)
    addLocalSession(id)
    setSessionsData((prev) => [
      { session_id: id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ...(prev || [])
    ])
  }

  const switchSession = (newSessionId: string) => {
    setSessionId(newSessionId)
    // Messages serão carregados pelo hook/componente
  }
}
```

### 3. Configuração de Agentes

```typescript
function AgentSelector() {
  const agents = usePlaygroundStore((s) => s.agents)
  const agentId = usePlaygroundStore((s) => s.agentId)
  const setAgentId = usePlaygroundStore((s) => s.setAgentId)
  const setSelectedModel = usePlaygroundStore((s) => s.setSelectedModel)

  const selectAgent = (agent: Agent) => {
    setAgentId(agent.value)
    setSelectedModel(agent.model.provider)
  }

  return (
    <Select value={agentId} onValueChange={(id) => {
      const agent = agents.find((a) => a.value === id)
      if (agent) selectAgent(agent)
    }}>
      {agents.map((agent) => (
        <SelectItem key={agent.value} value={agent.value}>
          {agent.label}
        </SelectItem>
      ))}
    </Select>
  )
}
```

## DevTools

O store suporta Redux DevTools via middleware `devtools`:

```typescript
import { devtools } from 'zustand/middleware'

// Para habilitar DevTools (já configurado no ADR-0002):
create<PlaygroundStore>()(
  devtools(
    persist(
      (set) => ({ ... }),
      { name: 'playground-storage' }
    ),
    { name: 'PlaygroundStore' }
  )
)
```

## Boas Práticas

1. **Seleção Seletiva**: Sempre use seletores para evitar re-renders
   ```typescript
   // ✅ Bom
   const messages = usePlaygroundStore((s) => s.messages)

   // ❌ Ruim (causa re-render em qualquer mudança do store)
   const { messages } = usePlaygroundStore()
   ```

2. **Updaters Funcionais**: Use funções para atualizações baseadas em estado anterior
   ```typescript
   // ✅ Bom
   setMessages((prev) => [...prev, newMessage])

   // ❌ Ruim (pode perder mensagens em atualizações concorrentes)
   setMessages([...messages, newMessage])
   ```

3. **Hydration Check**: Sempre verifique hidratação para SSR
   ```typescript
   if (!hydrated) return <Loading />
   ```

4. **Imutabilidade**: Sempre retorne novos objetos/arrays
   ```typescript
   // ✅ Bom
   setSessionsData((prev) => prev ? [...prev, newSession] : [newSession])

   // ❌ Ruim (mutação direta)
   sessionsData.push(newSession)
   setSessionsData(sessionsData)
   ```

## Referências

- [ADR-0002: Zustand State Management](../architecture/decisions/0002-zustand-state-management.md)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
