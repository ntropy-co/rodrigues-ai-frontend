# Plano de Implementação: Sistema de Analytics - Verity Agro

**Data:** 2025-12-14
**Baseado em:** analytics-audit-report.md
**Estimativa Total:** 29 horas

---

## Fase 1: Fundação (4 horas)

### 1.1 Criar Sistema de Tipos de Eventos

**Arquivo:** `src/lib/analytics/events.ts`

```typescript
// Definição centralizada de todos os eventos de analytics

export const ANALYTICS_EVENTS = {
  // Authentication
  USER_LOGGED_IN: 'user_logged_in',
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_OUT: 'user_logged_out',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
  AUTH_ERROR: 'auth_error',

  // Chat
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  CHAT_RESPONSE_RECEIVED: 'chat_response_received',
  CHAT_FEEDBACK_GIVEN: 'chat_feedback_given',
  CHAT_ERROR: 'chat_error',
  CHAT_SESSION_STARTED: 'chat_session_started',

  // Documents
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_VIEWED: 'document_viewed',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  DOCUMENT_DELETED: 'document_deleted',

  // CPR (Core Business)
  CPR_QUICK_ACTION_CLICKED: 'cpr_quick_action_clicked',
  CPR_ANALYSIS_STARTED: 'cpr_analysis_started',
  CPR_ANALYSIS_COMPLETED: 'cpr_analysis_completed',
  CPR_DRAFT_STARTED: 'cpr_draft_started',
  CPR_DRAFT_COMPLETED: 'cpr_draft_completed',

  // Search & Navigation
  SEARCH_QUERY_SUBMITTED: 'search_query_submitted',
  CONVERSATION_SELECTED: 'conversation_selected',
  PROJECT_SELECTED: 'project_selected',

  // Errors
  ERROR_BOUNDARY_TRIGGERED: 'error_boundary_triggered',
  API_ERROR: 'api_error',

  // Engagement
  PAGE_SCROLL_DEPTH: 'page_scroll_depth',
  TIME_ON_PAGE: 'time_on_page'
} as const

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

// Property types for each event
export interface EventProperties {
  [ANALYTICS_EVENTS.USER_LOGGED_IN]: {
    method: 'email' | 'google' | 'invite'
    user_id: string
  }
  [ANALYTICS_EVENTS.USER_SIGNED_UP]: {
    method: 'email' | 'google' | 'invite'
  }
  [ANALYTICS_EVENTS.USER_LOGGED_OUT]: {
    session_duration_seconds?: number
  }
  [ANALYTICS_EVENTS.CHAT_MESSAGE_SENT]: {
    session_id: string
    message_length: number
    has_files: boolean
    file_count: number
    is_new_session: boolean
  }
  [ANALYTICS_EVENTS.CHAT_FEEDBACK_GIVEN]: {
    message_id: string
    feedback_type: 'like' | 'dislike'
    session_id: string
  }
  [ANALYTICS_EVENTS.DOCUMENT_UPLOADED]: {
    document_id: string
    file_name: string
    file_size: number
    file_type: string
    file_category: string
    conversation_id?: string
  }
  [ANALYTICS_EVENTS.DOCUMENT_DOWNLOADED]: {
    document_id: string
    file_name: string
    file_type: string
  }
  [ANALYTICS_EVENTS.CPR_QUICK_ACTION_CLICKED]: {
    action_type: string
    action_label: string
  }
  [ANALYTICS_EVENTS.SEARCH_QUERY_SUBMITTED]: {
    query: string
    results_count: number
  }
  [ANALYTICS_EVENTS.ERROR_BOUNDARY_TRIGGERED]: {
    error_message: string
    error_stack?: string
    component_name?: string
  }
  // Add more as needed...
}
```

### 1.2 Criar Wrapper Tipado

**Arquivo:** `src/lib/analytics/index.ts`

```typescript
import {
  trackEvent as posthogTrack,
  identifyUser as posthogIdentify,
  resetUser as posthogReset
} from '@/components/providers/PostHogProvider'
import {
  ANALYTICS_EVENTS,
  type AnalyticsEvent,
  type EventProperties
} from './events'

// Re-export events for convenience
export { ANALYTICS_EVENTS } from './events'

// Type-safe track function
export function track<E extends AnalyticsEvent>(
  event: E,
  properties: E extends keyof EventProperties
    ? EventProperties[E]
    : Record<string, unknown>
): void {
  posthogTrack(event, properties)
}

// Identify user with standard properties
export function identify(
  userId: string,
  properties?: {
    email?: string
    name?: string
    role?: string
    created_at?: string
  }
): void {
  posthogIdentify(userId, properties)
}

// Reset user on logout
export function reset(): void {
  posthogReset()
}

// Utility: Track with timestamp
export function trackWithTimestamp<E extends AnalyticsEvent>(
  event: E,
  properties: E extends keyof EventProperties
    ? EventProperties[E]
    : Record<string, unknown>
): void {
  posthogTrack(event, {
    ...properties,
    timestamp: new Date().toISOString()
  })
}
```

---

## Fase 2: Identificação de Usuário (2 horas)

### 2.1 Atualizar AuthContext

**Arquivo:** `src/contexts/AuthContext.tsx`

**Mudanças:**

```typescript
// Adicionar imports
import { track, identify, reset, ANALYTICS_EVENTS } from '@/lib/analytics'

// No login (após setUser):
identify(userData.id, {
  email: userData.email,
  name: userData.name,
  role: userData.role
})
track(ANALYTICS_EVENTS.USER_LOGGED_IN, {
  method: 'email',
  user_id: userData.id
})

// No register (após auto-login):
track(ANALYTICS_EVENTS.USER_SIGNED_UP, {
  method: 'email'
})

// No logout (antes de limpar estado):
track(ANALYTICS_EVENTS.USER_LOGGED_OUT, {})
reset()
```

---

## Fase 3: Error Boundary (3 horas)

### 3.1 Criar Error Boundary Component

**Arquivo:** `src/components/ErrorBoundary.tsx`

```typescript
'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { track, ANALYTICS_EVENTS } from '@/lib/analytics'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Track error in PostHog
    track(ANALYTICS_EVENTS.ERROR_BOUNDARY_TRIGGERED, {
      error_message: error.message,
      error_stack: error.stack,
      component_name: errorInfo.componentStack?.split('\n')[1]?.trim(),
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Algo deu errado</h2>
            <p className="mt-2 text-gray-600">
              Por favor, recarregue a página ou tente novamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded bg-verde-600 px-4 py-2 text-white"
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 3.2 Adicionar ao Layout

**Arquivo:** `src/app/layout.tsx`

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Wrap children with ErrorBoundary
<ErrorBoundary>
  <NuqsAdapter>{children}</NuqsAdapter>
</ErrorBoundary>
```

---

## Fase 4: Tracking de CPR Actions (4 horas)

### 4.1 Atualizar SuggestionCards

**Arquivo:** `src/components/v2/MainContent/SuggestionCards.tsx`

```typescript
import { track, ANALYTICS_EVENTS } from '@/lib/analytics'

// No onClick de cada card:
const handleCardClick = (action: string, label: string) => {
  track(ANALYTICS_EVENTS.CPR_QUICK_ACTION_CLICKED, {
    action_type: action,
    action_label: label
  })
  // ... rest of handler
}
```

### 4.2 Atualizar ToolsModal

**Arquivo:** `src/components/v2/Tools/ToolsModal.tsx`

```typescript
import { track, ANALYTICS_EVENTS } from '@/lib/analytics'

// Ao selecionar ferramenta:
const handleToolSelect = (toolType: 'analyze' | 'draft') => {
  track(
    toolType === 'analyze'
      ? ANALYTICS_EVENTS.CPR_ANALYSIS_STARTED
      : ANALYTICS_EVENTS.CPR_DRAFT_STARTED,
    {}
  )
  // ... rest of handler
}
```

---

## Fase 5: Tracking de Feedback (2 horas)

### 5.1 Atualizar ChatArea

**Arquivo:** `src/components/v2/ChatArea/ChatArea.tsx`

```typescript
import { track, ANALYTICS_EVENTS } from '@/lib/analytics'

// No handleFeedback:
const handleFeedback = async (messageId: string, type: 'up' | 'down') => {
  // Track analytics first
  track(ANALYTICS_EVENTS.CHAT_FEEDBACK_GIVEN, {
    message_id: messageId,
    feedback_type: type === 'up' ? 'like' : 'dislike',
    session_id: sessionId || 'unknown'
  })

  // Then send to API
  // ... existing API call
}
```

---

## Fase 6: Tracking de Search (2 horas)

### 6.1 Atualizar ConversationsSidebar

**Arquivo:** `src/components/v2/ConversationsSidebar.tsx`

```typescript
import { track, ANALYTICS_EVENTS } from '@/lib/analytics'
import { useDebouncedCallback } from 'use-debounce'

// Debounce search tracking
const trackSearch = useDebouncedCallback(
  (query: string, resultsCount: number) => {
    if (query.length >= 2) {
      track(ANALYTICS_EVENTS.SEARCH_QUERY_SUBMITTED, {
        query,
        results_count: resultsCount
      })
    }
  },
  1000
)

// No onChange do search input:
const handleSearchChange = (value: string) => {
  setSearchQuery(value)
  const filtered = filterSessions(value)
  trackSearch(value, filtered.length)
}

// No click de conversation:
const handleConversationClick = (sessionId: string) => {
  track(ANALYTICS_EVENTS.CONVERSATION_SELECTED, { session_id: sessionId })
  // ... existing handler
}
```

---

## Fase 7: Tracking de Documents Completo (2 horas)

### 7.1 Atualizar FilesSidebar

**Arquivo:** `src/components/v2/FilesSidebar.tsx`

```typescript
import { track, ANALYTICS_EVENTS } from '@/lib/analytics'

// No download:
const handleDownload = (doc: Document) => {
  track(ANALYTICS_EVENTS.DOCUMENT_DOWNLOADED, {
    document_id: doc.id,
    file_name: doc.fileName,
    file_type: doc.mimeType
  })
  // ... existing download logic
}

// No delete (se existir):
const handleDelete = (doc: Document) => {
  track(ANALYTICS_EVENTS.DOCUMENT_DELETED, {
    document_id: doc.id
  })
  // ... existing delete logic
}
```

---

## Fase 8: PostHog Session Replay (1 hora)

### 8.1 Atualizar PostHogProvider

**Arquivo:** `src/components/providers/PostHogProvider.tsx`

```typescript
posthog.init(POSTHOG_KEY, {
  api_host: POSTHOG_HOST,
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
  // Add session replay
  session_recording: {
    recordCrossOriginIframes: false,
    // Mask all inputs by default for privacy
    maskAllInputs: true,
    maskInputOptions: {
      password: true,
      email: false // Allow email for user identification
    }
  },
  loaded: (posthog) => {
    if (process.env.NODE_ENV === 'development') {
      posthog.debug()
      // Disable session replay in development
      posthog.opt_out_capturing()
    }
  }
})
```

---

## Checklist de Implementação

### Fase 1: Fundação

- [ ] Criar `src/lib/analytics/events.ts`
- [ ] Criar `src/lib/analytics/index.ts`
- [ ] Testar exports e tipos

### Fase 2: Identificação

- [ ] Atualizar imports no AuthContext
- [ ] Adicionar `identify()` no login
- [ ] Adicionar `reset()` no logout
- [ ] Adicionar evento `user_logged_out`
- [ ] Testar fluxo completo de auth

### Fase 3: Error Boundary

- [ ] Criar componente ErrorBoundary
- [ ] Adicionar ao layout root
- [ ] Testar com erro simulado
- [ ] Verificar evento no PostHog

### Fase 4: CPR Actions

- [ ] Atualizar SuggestionCards
- [ ] Atualizar ToolsModal (se existir)
- [ ] Testar clicks nos cards
- [ ] Verificar eventos no PostHog

### Fase 5: Feedback

- [ ] Atualizar ChatArea
- [ ] Testar thumbs up/down
- [ ] Verificar eventos no PostHog

### Fase 6: Search

- [ ] Instalar use-debounce (se não tiver)
- [ ] Atualizar ConversationsSidebar
- [ ] Testar search tracking
- [ ] Verificar eventos no PostHog

### Fase 7: Documents

- [ ] Atualizar FilesSidebar
- [ ] Testar download tracking
- [ ] Verificar eventos no PostHog

### Fase 8: Session Replay

- [ ] Atualizar configuração PostHog
- [ ] Testar em staging
- [ ] Configurar masking adequado
- [ ] Ativar no dashboard PostHog

---

## Verificação Final

Após implementação, verificar no PostHog Dashboard:

1. **Events > Live Events** - Verificar eventos em tempo real
2. **Persons** - Verificar identificação de usuários
3. **Session Recordings** - Verificar replays (se ativado)
4. **Insights** - Criar dashboards básicos:
   - Usuários ativos por dia
   - Mensagens enviadas por dia
   - Documentos uploaded por dia
   - Distribuição de CPR actions
   - Taxa de feedback

---

## Métricas de Sucesso

| Métrica                | Antes | Depois |
| ---------------------- | ----- | ------ |
| Eventos trackados      | 4     | 15+    |
| Usuários identificados | 0%    | 100%   |
| Erros capturados       | 0     | Todos  |
| CPR actions trackados  | 0     | 100%   |
| Search trackado        | Não   | Sim    |
| Feedback trackado      | Não   | Sim    |
| Session replay         | Não   | Sim    |
