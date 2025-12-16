# Relatório de Auditoria: Sistema de Analytics - Verity Agro

**Data:** 2025-12-14
**Versão do Projeto:** 0.1.0
**Analisado por:** Claude Code

---

## 1. Resumo Executivo

| Área                      | Status          | Completude |
| ------------------------- | --------------- | ---------- |
| Database Schema           | 🔴 N/A          | 0%         |
| Serviço Core              | 🟡 Parcial      | 30%        |
| PostHog Integration       | 🟢 Implementado | 80%        |
| Langfuse Integration      | 🔴 Não existe   | 0%         |
| API Routes                | 🔴 Não existe   | 0%         |
| React Hooks               | 🟡 Parcial      | 25%        |
| Event Definitions         | 🟡 Parcial      | 30%        |
| Component Instrumentation | 🟡 Parcial      | 25%        |
| Cron Jobs                 | 🔴 Não existe   | 0%         |
| Admin Dashboard           | 🔴 Não existe   | 0%         |

**Legenda:** 🟢 Implementado | 🟡 Parcial | 🔴 Não existe

### Pontuação Geral: 19% de completude

---

## 2. Detalhamento por Área

### 2.1 Database Schema

**Status:** 🔴 N/A - Frontend Only

**O que existe:**

- Este é um projeto **frontend-only** (Next.js)
- Não possui ORM (Prisma, Drizzle, etc.)
- Todos os dados são gerenciados pelo backend FastAPI
- Frontend atua como BFF (Backend for Frontend) proxiando requisições

**O que falta (se fosse implementar no frontend):**

- Tabelas de analytics não são aplicáveis
- Analytics de eventos são enviados diretamente ao PostHog (SaaS)

**Arquivos relevantes:**

- N/A - Sem schema de banco de dados

---

### 2.2 Serviço Core de Analytics

**Status:** 🟡 Parcial

**O que existe:**

- `PostHogProvider.tsx` com funções helper:
  - `trackEvent(event, properties)` - Captura eventos customizados
  - `identifyUser(userId, properties)` - Identifica usuários
  - `resetUser()` - Reset de identificação no logout
- Inicialização automática do PostHog
- Configuração via variáveis de ambiente

**O que falta:**

- Sistema de queue/batching local
- Persistência em localStorage para falhas de rede
- Captura automática de contexto de dispositivo
- Gerenciamento de sessão customizado
- Função de flush manual
- beforeunload handler para envio de eventos pendentes
- Tipagem forte para eventos (TypeScript enums/types)
- Arquivo centralizado de definição de eventos

**Arquivos relevantes:**

- `src/components/providers/PostHogProvider.tsx` - Provider principal (60 linhas)

---

### 2.3 Integrações (PostHog / Langfuse)

**PostHog Status:** 🟢 Implementado

| Item                     | Status | Observação                              |
| ------------------------ | ------ | --------------------------------------- |
| SDK instalado            | ✅     | `posthog-js: ^1.306.1`                  |
| Inicialização            | ✅     | Via PostHogProvider no root layout      |
| Pageview automático      | ✅     | `capture_pageview: true`                |
| Pageleave automático     | ✅     | `capture_pageleave: true`               |
| Identificação de usuário | ✅     | Função exportada (não usada ativamente) |
| Session replay           | ❌     | Não configurado                         |
| Feature flags            | ❌     | Não configurado                         |

**Langfuse Status:** 🔴 Não existe

| Item                | Status | Observação    |
| ------------------- | ------ | ------------- |
| SDK instalado       | ❌     | Não instalado |
| Traces configurados | ❌     | N/A           |
| Scores customizados | ❌     | N/A           |
| Integração LLM      | ❌     | N/A           |

**Nota:** Langfuse está documentado no `.env.example` mas não implementado. A integração de LLM tracing deve ser feita no **backend** (FastAPI), não no frontend.

---

### 2.4 API Routes

**Status:** 🔴 Não existe (Analytics-specific)

| Endpoint                        | Existe | Funcional | Observações      |
| ------------------------------- | ------ | --------- | ---------------- |
| POST /api/analytics/batch       | ❌     | N/A       | Não implementado |
| POST /api/analytics/chat-topic  | ❌     | N/A       | Não implementado |
| POST /api/analytics/limit-event | ❌     | N/A       | Não implementado |
| POST /api/analytics/funnel      | ❌     | N/A       | Não implementado |
| GET /api/analytics/\*           | ❌     | N/A       | Não implementado |

**Routes existentes (BFF):**

- 6 rotas de autenticação (`/api/auth/*`)
- 2 rotas de chat (`/api/chat/*`)
- 5 rotas de documentos (`/api/documents/*`)
- 2 rotas de projetos (`/api/projects/*`)
- 2 rotas de sessões (`/api/sessions/*`)
- 1 rota de health check (`/api/playground/status`)

**Total:** 18 rotas BFF, 0 rotas de analytics

---

### 2.5 React Hooks

**Status:** 🟡 Parcial

| Hook               | Existe | Tipagem | Testes |
| ------------------ | ------ | ------- | ------ |
| useAnalytics       | ❌     | N/A     | N/A    |
| useAnalyticsFunnel | ❌     | N/A     | N/A    |
| useTimeOnSection   | ❌     | N/A     | N/A    |
| useFeatureLimit    | ❌     | N/A     | N/A    |
| useErrorTracking   | ❌     | N/A     | N/A    |
| useScrollTracking  | ❌     | N/A     | N/A    |

**Hooks existentes com tracking:**

| Hook               | Arquivo                            | Eventos Trackados   |
| ------------------ | ---------------------------------- | ------------------- |
| useAIStreamHandler | `src/hooks/useAIStreamHandler.tsx` | `chat_message_sent` |
| useChatFiles       | `src/hooks/useChatFiles.ts`        | `document_uploaded` |

**Hooks de scroll existentes (sem analytics):**

- `useScrollDetection.ts` - Detecta posição de scroll
- `useScrollAnimation.ts` - Animações baseadas em scroll

---

### 2.6 Definição de Eventos

**Status:** 🟡 Parcial

| Categoria  | Definido   | Implementado | Eventos                                                                                           |
| ---------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------- |
| Engagement | ❌         | 0/5          | session_start, session_end, feature_click, time_on_page, scroll_depth                             |
| Chat       | ✅ Parcial | 1/5          | `chat_message_sent` ✅, chat_response_received ❌, chat_topic ❌, chat_feedback ❌, chat_error ❌ |
| CPR        | ❌         | 0/6          | cpr*creation_start, cpr_step*\*, cpr_analysis_complete, cpr_draft_complete, cpr_download          |
| Limit      | ❌         | 0/4          | limit_warning, limit_reached, limit_retry, limit_upgrade                                          |
| Search     | ❌         | 0/3          | search_query, search_results, search_click                                                        |
| Error      | ❌         | 0/4          | error_js, error_api, error_validation, error_critical                                             |
| Onboarding | ❌         | 0/4          | onboarding*start, onboarding_step*\*, onboarding_complete, onboarding_abandon                     |
| Feedback   | ❌         | 0/3          | feedback_nps, feedback_satisfaction, feedback_feature_request                                     |
| Document   | ✅ Parcial | 1/4          | `document_uploaded` ✅, document_viewed ❌, document_downloaded ❌, document_deleted ❌           |
| Auth       | ✅ Parcial | 2/5          | `user_logged_in` ✅, `user_signed_up` ✅, user_logged_out ❌, password_reset ❌, auth_error ❌    |

**Total:** 4 eventos implementados de ~43 planejados (~9%)

---

### 2.7 Componentes Instrumentados

**Status:** 🟡 Parcial

| Componente           | Instrumentado | Eventos Trackados                  |
| -------------------- | ------------- | ---------------------------------- |
| AuthContext          | ✅            | `user_logged_in`, `user_signed_up` |
| useAIStreamHandler   | ✅            | `chat_message_sent`                |
| useChatFiles         | ✅            | `document_uploaded`                |
| FileUploadModal      | ✅            | `document_uploaded`                |
| ChatArea             | ❌            | Feedback via API (não analytics)   |
| MessageBubble        | ❌            | Feedback buttons (não analytics)   |
| ConversationsSidebar | ❌            | Search, navigation (não trackados) |
| SuggestionCards      | ❌            | Quick actions (não trackados)      |
| Error Boundary       | ❌            | Não existe                         |
| Login Page           | ❌            | Depende do AuthContext             |
| FilesSidebar         | ❌            | Downloads, views (não trackados)   |

**Componentes críticos sem tracking:**

- CPR Analysis Flow
- Search/Filter interactions
- Session management
- Project management
- Document downloads
- Error states

---

### 2.8 Cron Jobs

**Status:** 🔴 Não existe

| Job                   | Existe | Configurado | Schedule |
| --------------------- | ------ | ----------- | -------- |
| Hourly Rollup         | ❌     | N/A         | N/A      |
| Daily Rollup          | ❌     | N/A         | N/A      |
| Session Cleanup       | ❌     | N/A         | N/A      |
| Partition Maintenance | ❌     | N/A         | N/A      |

**Arquivos de configuração:**

- `vercel.json` - **Não existe**
- `/api/cron/*` - **Não existe**

**Nota:** Cron jobs de analytics devem ser implementados no **backend** (FastAPI), não no frontend Next.js.

---

### 2.9 Admin Dashboard

**Status:** 🔴 Não existe

| Página                      | Existe | Funcional | Componentes |
| --------------------------- | ------ | --------- | ----------- |
| /admin/analytics            | ❌     | N/A       | N/A         |
| /admin/analytics/engagement | ❌     | N/A       | N/A         |
| /admin/analytics/chat       | ❌     | N/A       | N/A         |
| /admin/analytics/limits     | ❌     | N/A       | N/A         |
| /admin/analytics/funnels    | ❌     | N/A       | N/A         |

**Bibliotecas de visualização:**

- Recharts: **Não instalado**
- Chart.js: **Não instalado**
- Nivo: **Não instalado**
- Victory: **Não instalado**

**Nota:** Dashboard de analytics pode ser visualizado diretamente no **PostHog Cloud** ou implementado como página admin.

---

## 3. Código Existente Relevante

### 3.1 PostHogProvider (Completo)

```typescript
// src/components/providers/PostHogProvider.tsx
'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (POSTHOG_KEY && typeof window !== 'undefined') {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.debug()
          }
        }
      })
    }
  }, [])

  if (!POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.capture(event, properties)
  }
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.identify(userId, properties)
  }
}

export function resetUser() {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.reset()
  }
}
```

### 3.2 Evento: chat_message_sent

```typescript
// src/hooks/useAIStreamHandler.tsx (linhas 152-158)
trackEvent('chat_message_sent', {
  session_id: data.session_id,
  message_length: message.trim().length,
  has_files: files && files.length > 0,
  file_count: files?.length || 0,
  is_new_session: data.session_id !== sessionId
})
```

### 3.3 Evento: document_uploaded

```typescript
// src/hooks/useChatFiles.ts (linhas 243-250)
trackEvent('document_uploaded', {
  document_id: newFile.id,
  file_name: newFile.fileName,
  file_size: newFile.fileSize,
  file_type: newFile.mimeType,
  file_category: newFile.fileCategory,
  conversation_id: conversationId
})
```

### 3.4 Eventos: Auth

```typescript
// src/contexts/AuthContext.tsx (linhas 112-115, 159-161)
trackEvent('user_logged_in', {
  method: 'email',
  user_id: userData.id
})

trackEvent('user_signed_up', {
  method: 'email'
})
```

---

## 4. Dependências Encontradas

```json
{
  "posthog-js": "^1.306.1",
  "@sentry/nextjs": "^10.30.0",
  "@upstash/redis": "^1.35.8",
  "langfuse": "não instalado",
  "recharts": "não instalado",
  "amplitude": "não instalado",
  "mixpanel": "não instalado",
  "segment": "não instalado"
}
```

---

## 5. Recomendações de Implementação

### 5.1 Ordem de Prioridade

1. **CRÍTICO - Implementar primeiro:**
   - [ ] Criar arquivo centralizado de tipos de eventos (`lib/analytics/events.ts`)
   - [ ] Implementar `identifyUser()` após login bem-sucedido
   - [ ] Implementar `resetUser()` no logout
   - [ ] Adicionar Error Boundary com tracking de erros
   - [ ] Adicionar evento `user_logged_out`

2. **ALTO - Implementar em seguida:**
   - [ ] Adicionar tracking de CPR quick actions (SuggestionCards)
   - [ ] Adicionar tracking de feedback de mensagens
   - [ ] Adicionar tracking de search/filter
   - [ ] Adicionar tracking de downloads de documentos
   - [ ] Implementar funnel tracking para fluxo de CPR

3. **MÉDIO - Pode esperar:**
   - [ ] Configurar PostHog Session Replay
   - [ ] Implementar tracking de scroll depth
   - [ ] Implementar tracking de time on page
   - [ ] Adicionar tracking de erros de API

4. **BAIXO - Nice to have:**
   - [ ] Dashboard admin de analytics (usar PostHog Cloud)
   - [ ] Feature flags via PostHog
   - [ ] A/B testing setup
   - [ ] NPS surveys

### 5.2 Código que Pode Ser Reaproveitado

- `PostHogProvider.tsx` - Base sólida para expansão
- Padrão de `trackEvent()` já estabelecido
- Integração com layout root já configurada
- CSP headers já permitem PostHog

### 5.3 Código que Precisa Ser Refatorado

- `AuthContext.tsx` - Adicionar `identifyUser()` e `resetUser()`
- `ChatArea.tsx` - Adicionar tracking ao feedback handler
- `ConversationsSidebar.tsx` - Adicionar tracking de search
- `FilesSidebar.tsx` - Adicionar tracking de downloads

### 5.4 Dependências a Instalar

```bash
# Nenhuma dependência adicional necessária para analytics básico
# PostHog já está instalado e configurado

# Para dashboard admin (opcional):
npm install recharts

# Para rate limiting (já instalado):
# @upstash/redis já está no package.json
```

---

## 6. Estimativa de Esforço

| Área                           | Esforço | Complexidade | Dependências         |
| ------------------------------ | ------- | ------------ | -------------------- |
| Tipos de eventos centralizados | 2h      | Baixa        | Nenhuma              |
| identifyUser/resetUser         | 1h      | Baixa        | AuthContext          |
| Error Boundary                 | 3h      | Média        | React                |
| CPR funnel tracking            | 4h      | Média        | Componentes CPR      |
| Search tracking                | 2h      | Baixa        | ConversationsSidebar |
| Document tracking completo     | 2h      | Baixa        | FilesSidebar         |
| Feedback tracking              | 2h      | Baixa        | ChatArea             |
| Session Replay config          | 1h      | Baixa        | PostHog              |
| Scroll/Time tracking           | 4h      | Média        | Custom hooks         |
| Dashboard admin                | 8h      | Alta         | recharts, API routes |

**Total Estimado:** 29 horas de desenvolvimento

---

## 7. Próximos Passos Recomendados

1. [ ] Criar `src/lib/analytics/events.ts` com tipos e constantes
2. [ ] Criar `src/lib/analytics/index.ts` exportando funções tipadas
3. [ ] Atualizar `AuthContext.tsx` para usar `identifyUser()` no login
4. [ ] Atualizar `AuthContext.tsx` para usar `resetUser()` no logout
5. [ ] Criar `src/components/ErrorBoundary.tsx` com tracking
6. [ ] Adicionar evento `user_logged_out` ao logout
7. [ ] Adicionar tracking ao `SuggestionCards.tsx` (CPR actions)
8. [ ] Adicionar tracking ao `ConversationsSidebar.tsx` (search)
9. [ ] Adicionar tracking ao `FilesSidebar.tsx` (downloads)
10. [ ] Configurar PostHog Session Replay no dashboard

---

## 8. Arquivos Analisados

### Estrutura Principal

- `package.json`
- `next.config.ts`
- `src/app/layout.tsx`
- `.env.example`

### Providers e Contexts

- `src/components/providers/PostHogProvider.tsx`
- `src/components/providers/theme-provider.tsx`
- `src/contexts/AuthContext.tsx`

### Hooks (21 arquivos)

- `src/hooks/useAIStreamHandler.tsx` ✅ (com tracking)
- `src/hooks/useChatFiles.ts` ✅ (com tracking)
- `src/hooks/useScrollDetection.ts`
- `src/hooks/useScrollAnimation.ts`
- (+ 17 outros hooks sem tracking)

### Componentes

- `src/components/v2/FileUpload/FileUploadModal.tsx` ✅ (com tracking)
- `src/components/v2/ChatArea/ChatArea.tsx`
- `src/components/v2/ChatArea/MessageBubble.tsx`
- `src/components/v2/ConversationsSidebar.tsx`
- `src/components/v2/FilesSidebar.tsx`
- `src/components/v2/MainContent/SuggestionCards.tsx`
- `src/components/v2/Header/MenuSidebar.tsx`

### API Routes (18 arquivos)

- `src/app/api/auth/*` (6 rotas)
- `src/app/api/chat/*` (2 rotas)
- `src/app/api/documents/*` (5 rotas)
- `src/app/api/projects/*` (2 rotas)
- `src/app/api/sessions/*` (2 rotas)
- `src/app/api/playground/status/route.ts`

---

## 9. Observações Adicionais

### Arquitetura

- **Frontend-only**: Este é um projeto Next.js que atua como BFF
- **Backend separado**: FastAPI hospedado no Railway
- **Analytics client-side**: PostHog captura eventos no browser
- **Sem banco local**: Todos os dados são do backend ou PostHog SaaS

### Segurança

- CSP configurado para permitir PostHog (`us.i.posthog.com`, `us.posthog.com`)
- Sentry também permitido no CSP (preparado para ativação)
- `person_profiles: 'identified_only'` - bom para privacidade

### Gaps Críticos

1. **Identificação de usuário não ativa**: `identifyUser()` existe mas não é chamada
2. **Reset no logout ausente**: `resetUser()` existe mas não é chamada
3. **Sem Error Boundary**: Erros JS não são capturados centralmente
4. **Feedback não trackado**: Thumbs up/down vão para API mas não PostHog
5. **CPR funnel inexistente**: Principal fluxo do produto sem tracking

### Pontos Positivos

- PostHog bem configurado e funcionando
- Padrão de eventos estabelecido
- Auto page tracking ativo
- Debug mode em desenvolvimento
- Estrutura de código limpa e organizada
