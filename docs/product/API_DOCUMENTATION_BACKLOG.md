# Backlog de Documentação — API (FastAPI) + BFF (Next.js)

Este arquivo é um checklist para “ultradetalhar” a API e as rotas do proxy do frontend (BFF), de forma que alguém consiga mexer com segurança lendo apenas código + docstrings + Markdown.

## Como usar

- Marque os itens conforme for documentando/ajustando.
- A “fonte da verdade” é o código (docstrings coladas no código). Este Markdown serve como **índice/backlog** e guia de consistência.
- Backend e frontend estão em repositórios separados:
  - Backend (FastAPI): arquivos citados como `app/...`
  - Frontend (Next.js): arquivos citados como `src/...`

## Mapa rápido (contrato atual)

- **Base path (backend)**: `settings.API_V1_STR` = `/api/v1` (`app/core/config.py`)
- **Docs (backend)**: `/docs` e OpenAPI em `/api/v1/openapi.json` (`app/main.py`)
- **Auth**: OAuth2 Bearer Token (JWT HS256) (`app/core/deps.py`, `app/core/security.py`)
  - Header: `Authorization: Bearer <access_token>`
  - JWT claims usados hoje: `sub` (id do usuário), `exp` (expiração)
  - Expiração padrão (hoje): `ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 8` (8 dias) (`app/core/config.py`)
- **Reset de senha (link)**: backend gera link `FRONTEND_URL/reset-password?token=...` (`app/core/email.py`)
- **Webhooks**: não existem no projeto atualmente.

## Checklist padrão (Backend / FastAPI) — aplicar em TODO endpoint

- [ ] Endpoint tem `summary` (1 linha) e docstring com: objetivo, regras, auth, request/response, erros e efeitos colaterais.
- [ ] Endpoint tem `response_model=...` sempre que aplicável (mesmo para listas).
- [ ] Endpoint tem `responses={...}` para erros esperados (401/403/404/422/500, etc).
- [ ] Parâmetros (path/query/body) têm validação e descrição (Pydantic `Field`, `Query`, etc) quando não for óbvio.
- [ ] Existe pelo menos 1 exemplo de uso (curl) e 1 exemplo de response no Markdown do módulo (ou na docstring).
- [ ] Se o endpoint altera dados, documentar transação/efeitos: DB, arquivos, serviços externos.
- [ ] Se houver regra de permissão (owner/superuser), documentar explicitamente.

## Checklist padrão (Frontend / Next.js BFF) — aplicar em TODO `src/app/api/**/route.ts`

- [ ] Comentário de topo explica: objetivo, rota pública, rota backend chamada e por que existe proxy (CORS/formatos).
- [ ] Documentar transformações de contrato (ex.: JSON → form-urlencoded, campos renomeados, etc).
- [ ] Documentar auth: de onde vem o token e como o header é repassado.
- [ ] Documentar “decisões do proxy”: cache headers, fallback (ex.: 404 → lista vazia), validações locais.
- [ ] Listar “chamadores” do frontend (hooks/pages) para facilitar rastreio.

---

# 1) Backlog — Rotas do Backend (FastAPI)

## Health (`app/api/routes/health.py`)

Prefixo: `/api/v1/health`

- [ ] (módulo) Explicar finalidade do healthcheck e payload.
- [ ] `GET /` → `health_check()`
  - Auth: público
  - Response: `{ "status": "success", "message": "Agent API is running" }`
  - Notas: no FastAPI o path canônico tende a ser `/api/v1/health/` (slash final).

## Login OAuth2 “padrão” (`app/api/routes/login.py`)

Prefixo: `/api/v1/login`

- [x] (módulo) Explicar por que existe **além** de `/api/v1/auth/login`.
- [x] `POST /access-token` → `login_access_token(...)` (OAuth2PasswordRequestForm)
  - Auth: público (gera token)
  - Request: `application/x-www-form-urlencoded` com `username`(email) e `password`
  - Response: `Token` (`access_token`, `token_type`)
  - Notas: este endpoint é o `tokenUrl` do `OAuth2PasswordBearer` (`app/core/deps.py`).

## Auth (login/register/me/logout/reset) (`app/api/routes/auth.py`)

Prefixo: `/api/v1/auth`

- [x] (módulo) Documentar fluxo completo de auth (register/login/me/logout/forgot/reset) e como o frontend usa.
- [x] `POST /register` → `register(session, data: UserRegister)` → `Token`
  - Auth: público
  - Notas: valida email duplicado; gera JWT.
- [x] `POST /login` → `login(session, form_data: OAuth2PasswordRequestForm)` → `Token`
  - Auth: público (gera token)
  - Request: `application/x-www-form-urlencoded` com `username`(email) e `password`
  - Notas: este é o endpoint usado pelo BFF do frontend hoje.
- [x] `GET /me` → `get_current_user_info(current_user: CurrentUser)` → `UserPublic`
  - Auth: obrigatório
- [x] `POST /logout` → `logout()` → `{"message": ...}`
  - Auth: não obrigatório (JWT stateless; logout é “apagar token no cliente”)
  - Notas: JWT é stateless; logout é “apagar token no cliente”.
- [x] `POST /forgot-password` → `forgot_password(session, request: ForgotPasswordRequest)` → `MessageResponse`
  - Auth: público
  - Notas: sempre retorna mesma mensagem (anti-enumeração); envia e-mail (ou log).
- [x] `GET /verify-reset-token/{token}` → `verify_reset_token(session, token)` → `{ "valid": bool }`
  - Auth: público
- [x] `POST /reset-password` → `reset_password(session, request: ResetPasswordRequest)` → `MessageResponse`
  - Auth: público

## Users (`app/api/routes/users.py`)

Prefixo: `/api/v1/users`

- [ ] (módulo) Explicar quando usar `/auth/me` vs `/users/me`.
- [ ] `GET /me` → `get_current_user_info(current_user: CurrentUser)` → `UserPublic`
  - Auth: obrigatório
- [ ] `GET /{user_id}` → `get_user_by_id(session, user_id)` → `UserPublic`
  - Auth: atualmente **não** obrigatório (avaliar/documentar risco)
  - Notas: se for intencional ser público, documentar escopo e dados expostos.
- [ ] `PATCH /{user_id}` → `update_user_by_id(..., current_user: CurrentUser)` → `UserPublic`
  - Auth: obrigatório
  - Notas: apenas self ou superuser; valida conflito de email.
- [ ] `DELETE /{user_id}` → `delete_user_by_id(..., current_user: CurrentUser)` → `204 No Content`
  - Auth: obrigatório
  - Notas: “soft delete”; apenas self ou superuser.

## Sessions (`app/api/routes/sessions.py`)

Prefixo: `/api/v1/sessions`

- [ ] (módulo) Documentar formato de ID: `s_<uuidhex>` (`app/core/ids.py`).
- [ ] `POST /` → `create_new_session(..., data: SessionCreateRequest | None)` → `SessionPublic` (201)
  - Auth: obrigatório
  - Notas: `user_id` sempre é sobrescrito pelo `current_user.id`.
- [ ] `GET /` → `list_my_sessions(..., project_id?, skip=0, limit=100)` → `list[SessionPublic]`
  - Auth: obrigatório
  - Notas: filtro opcional por `project_id`.
- [ ] `GET /{session_id}` → `get_session_by_id(..., session_id)` → `SessionPublic`
  - Auth: obrigatório
  - Notas: valida prefixo `s_`; checa ownership (owner/superuser).
- [ ] `PATCH /{session_id}` → `update_session_by_id(..., data: SessionUpdate)` → `SessionPublic`
  - Auth: obrigatório
  - Notas: valida prefixo `s_`; checa ownership (owner/superuser).
- [ ] `DELETE /{session_id}` → `delete_session_by_id(..., session_id)` → `204 No Content`
  - Auth: obrigatório
  - Notas: valida prefixo `s_`; checa ownership (owner/superuser).

## Projects (`app/api/routes/projects.py`)

Prefixo: `/api/v1/projects`

- [ ] (módulo) Documentar formato de ID: `p_<uuidhex>` (`app/core/ids.py`).
- [ ] `POST /` → `create_new_project(..., data: ProjectCreate)` → `ProjectPublic` (201)
  - Auth: obrigatório
- [ ] `GET /` → `list_my_projects(..., skip=0, limit=100)` → `list[ProjectPublic]`
  - Auth: obrigatório
- [ ] `GET /{project_id}` → `get_project_by_id(..., project_id)` → `ProjectPublic`
  - Auth: obrigatório
  - Notas: valida prefixo `p_`; checa ownership (owner/superuser).
- [ ] `PATCH /{project_id}` → `update_project_by_id(..., data: ProjectUpdate)` → `ProjectPublic`
  - Auth: obrigatório
  - Notas: valida prefixo `p_`; checa ownership (owner/superuser).
- [ ] `DELETE /{project_id}` → `delete_project_by_id(..., project_id)` → `204 No Content`
  - Auth: obrigatório
  - Notas: valida prefixo `p_`; checa ownership (owner/superuser).

## Chat (Dialogflow CX) (`app/api/routes/chat.py`)

Prefixo: `/api/v1/chat`

- [ ] (módulo) Documentar integração Dialogflow CX, limites, logs e possíveis erros (500).
- [ ] `POST /` → `chat(..., request: ChatRequest)` → `ChatResponse`
  - Auth: obrigatório
  - Request: `{ "message": string, "session_id"?: "s_..." | null }`
  - Response: `{ "text": string, "session_id": "s_...", "message_id": "<uuid>" }`
  - Notas: cria sessão automaticamente se `session_id` não vier; injeta contexto de documentos (`get_extracted_text_for_session`).
- [ ] `POST /{message_id}/feedback` → `update_feedback(message_id, feedback_req, ...)` → `{ "status": "success" }`
  - Auth: obrigatório
  - Request: `{ "feedback": "like" | "dislike" | "none" }`
  - Notas: `message_id` é UUID; valida ownership via sessão.
- [ ] `GET /history/{session_id}` → `get_chat_history(session_id, ..., skip=0, limit=100)` → `list[ConversationPublic]`
  - Auth: obrigatório
  - Notas: valida prefixo `s_`; checa ownership.

## Documents (upload local + metadata) (`app/api/routes/documents.py`)

Prefixo: `/api/v1/documents`

- [ ] (módulo) Documentar storage (pasta `UPLOAD_DIR`), metadata, formatos aceitos e segurança.
- [ ] `POST /upload` → `upload_document(file, user_id="default-user", session_id=None)` → `JSONResponse`
  - Auth: atualmente não obrigatório (avaliar/documentar)
  - Request: `multipart/form-data` (`file`, `user_id`, `session_id`)
  - Notas: valida extensão e tamanho (10MB); tenta extrair texto; salva metadata em JSON.
- [ ] `GET /user/{user_id}` → `get_user_documents(user_id, session_id?)` → `JSONResponse`
  - Auth: atualmente não obrigatório (avaliar/documentar)
  - Response: `{ "documents": [...], "count": number }`
- [ ] `GET /conversation` → `get_conversation_documents(conversation_id)` → `JSONResponse`
  - Auth: atualmente não obrigatório (avaliar/documentar)
  - Request: query `conversation_id` (= `session_id`)
  - Response: `{ "files": [...], "count": number }`
- [ ] `GET /list` → `list_documents()` → `JSONResponse`
  - Auth: atualmente não obrigatório (avaliar/documentar)
  - Response: `{ "documents": [...], "count": number }`
- [ ] `GET /{file_id}/download` → `download_document(file_id)` → arquivo (stream)
  - Auth: atualmente não obrigatório (avaliar/documentar)
- [ ] `DELETE /{file_id}` → `delete_document(file_id)` → `{ "message": "...", "file_id": "..." }`
  - Auth: atualmente não obrigatório (avaliar/documentar)
- [ ] (helper interno) Documentar `get_extracted_text_for_session(session_id, max_chars=8000)` (não é endpoint)
  - Uso: chamado pelo chat para enriquecer prompt.
  - Notas: truncamento; formato `[Documento: ...]`.

---

# 2) Backlog — Rotas do Frontend (Next.js BFF / proxy)

## Auth proxies (`src/app/api/auth/**/route.ts`)

- [x] `POST /api/auth/login` (`src/app/api/auth/login/route.ts`) → backend `POST /api/v1/auth/login` (+ `GET /api/v1/auth/me`)
  - Transformação: `{email,password}` → form `username/password`
  - Response “frontend”: `{ token, user, organization, expiresAt }`
  - Chamadores: `src/lib/auth/api.ts`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuthHook.ts`
- [x] `POST /api/auth/register` (`src/app/api/auth/register/route.ts`) → backend `POST /api/v1/auth/register`
  - Transformação: `{name}` → `{full_name}`
  - Chamadores: `src/lib/auth/api.ts`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuthHook.ts`
- [x] `GET /api/auth/me` (`src/app/api/auth/me/route.ts`) → backend `GET /api/v1/auth/me`
  - Transformação: `{full_name,is_superuser}` → `{name,role}`
  - Chamadores: `src/lib/auth/api.ts`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuthHook.ts`
- [x] `POST /api/auth/logout` (`src/app/api/auth/logout/route.ts`) → backend `POST /api/v1/auth/logout`
  - Chamadores: `src/lib/auth/api.ts`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuthHook.ts`
- [x] `POST /api/auth/forgot-password` (`src/app/api/auth/forgot-password/route.ts`) → backend `POST /api/v1/auth/forgot-password`
  - Chamadores: `src/lib/auth/api.ts`, `src/hooks/useAuthHook.ts`, pages em `src/app/(auth)/**`
  - Tela: `src/app/(auth)/forgot-password/page.tsx` (rota: `GET /forgot-password`)
- [x] `POST /api/auth/reset-password` (`src/app/api/auth/reset-password/route.ts`) → backend `POST /api/v1/auth/reset-password`
  - Transformação: `{password}` → `{new_password}`
  - Chamadores: `src/lib/auth/api.ts`, `src/hooks/useAuthHook.ts`, pages em `src/app/(auth)/**`
  - Tela: `src/app/(auth)/reset-password/page.tsx` (rota: `GET /reset-password?token=...`)
- [x] `GET /api/auth/verify-reset-token/:token` (`src/app/api/auth/verify-reset-token/[token]/route.ts`) → backend `GET /api/v1/auth/verify-reset-token/{token}`
  - Chamadores: (nenhum hoje) — opcional para validar token antes de mostrar o form

### Fluxo completo — reset de senha (tela → BFF → backend)

- [x] 1. Usuário abre `GET /forgot-password` (`src/app/(auth)/forgot-password/page.tsx`) e envia email
  - Frontend chama `POST /api/auth/forgot-password` (`src/app/api/auth/forgot-password/route.ts`)
  - Backend recebe `POST /api/v1/auth/forgot-password` (`app/api/routes/auth.py`)
  - Backend gera token e loga/envia link `FRONTEND_URL/reset-password?token=...` (`app/core/email.py`)
- [x] 2. Usuário abre o link do email `GET /reset-password?token=...` (`src/app/(auth)/reset-password/page.tsx`)
  - Tela lê o `token` via querystring e envia a nova senha chamando `resetPassword(...)` (`src/lib/auth/api.ts`)
  - Frontend chama `POST /api/auth/reset-password` (`src/app/api/auth/reset-password/route.ts`)
  - Backend recebe `POST /api/v1/auth/reset-password` (`app/api/routes/auth.py`) e valida:
    - token existe, não expirou, e pertence a um usuário
    - senha nova respeita políticas (min 8 no schema atual)
- [x] 3. (Opcional) Validar token antes do submit
  - Chamar `GET /api/auth/verify-reset-token/:token` (BFF) → `GET /api/v1/auth/verify-reset-token/{token}` (backend)

## Chat proxies

- [x] `POST /api/chat` (`src/app/api/chat/route.ts`) → backend `POST /api/v1/chat/`
  - Validação local: `session_id` deve começar com `s_` se vier preenchido
  - CORS: `OPTIONS` implementado
  - Chamadores: `src/hooks/useAIStreamHandler.tsx`
- [x] `POST /api/chat/:messageId/feedback` (`src/app/api/chat/[messageId]/feedback/route.ts`) → backend `POST /api/v1/chat/{message_id}/feedback`
  - Validação local: `messageId` UUID; `feedback` ∈ {like, dislike, none}
  - CORS: `OPTIONS` implementado
  - Chamadores: `src/components/v2/ChatArea/ChatArea.tsx`

## Sessions proxies

- [x] `GET/POST /api/sessions` (`src/app/api/sessions/route.ts`) → backend `GET/POST /api/v1/sessions/`
  - Cache headers no GET
  - Chamadores: `src/hooks/useSessions.ts`
  - Status: `project_id` agora é repassado para o backend
- [x] `GET/PATCH/DELETE /api/sessions/:sessionId` (`src/app/api/sessions/[sessionId]/route.ts`) → backend `GET/PATCH/DELETE /api/v1/sessions/{session_id}`
  - Chamadores: `src/hooks/useSessions.ts`

## Projects proxies

- [x] `GET/POST /api/projects` (`src/app/api/projects/route.ts`) → backend `GET/POST /api/v1/projects/`
  - Cache headers no GET
  - Chamadores: `src/hooks/useProjects.ts`
- [x] `GET/PATCH/DELETE /api/projects/:projectId` (`src/app/api/projects/[projectId]/route.ts`) → backend `GET/PATCH/DELETE /api/v1/projects/{project_id}`
  - Chamadores: `src/hooks/useProjects.ts`

## Documents proxies

- [x] `POST /api/documents/upload` (`src/app/api/documents/upload/route.ts`) → backend `POST /api/v1/documents/upload`
  - Chamadores: `src/hooks/useChatFiles.ts`, `src/components/v2/FileUpload/FileUploadModal.tsx`
- [x] `GET /api/documents/user/:userId` (`src/app/api/documents/user/[userId]/route.ts`) → backend `GET /api/v1/documents/user/{user_id}`
  - Chamadores: `src/hooks/useDocuments.ts`
- [x] `GET /api/documents/conversation?conversation_id=...` (`src/app/api/documents/conversation/route.ts`) → backend `GET /api/v1/documents/conversation?conversation_id=...`
  - Nota: proxy exige `Authorization`, mas backend não exige hoje.
  - CORS: `OPTIONS` implementado
  - Chamadores: `src/hooks/useChatFiles.ts`
- [x] `GET /api/documents/:documentId/download` (`src/app/api/documents/[documentId]/download/route.ts`) → backend `GET /api/v1/documents/{file_id}/download`
  - Chamadores: `src/hooks/useChatFiles.ts`, `src/hooks/useDocuments.ts`
- [x] `DELETE /api/documents/:documentId` (`src/app/api/documents/[documentId]/route.ts`) → backend `DELETE /api/v1/documents/{file_id}`
  - Chamadores: `src/hooks/useChatFiles.ts`, `src/hooks/useDocuments.ts`

## Playground status

- [x] `GET /api/playground/status` (`src/app/api/playground/status/route.ts`) → backend `GET /api/v1/health`
  - Nota: backend define `GET /health/` (pode haver redirect por slash final).
  - Chamadores: `src/api/playground.ts`, `src/hooks/useChatActions.ts`

---

# 3) Inconsistências/Decisões pendentes (documentar e/ou corrigir)

- [ ] **Login duplicado**: decidir se o “login oficial” é `/api/v1/login/access-token` ou `/api/v1/auth/login` (manter ambos? deprecar um?).
- [ ] **Token storage no frontend**: há dois mecanismos (cookies via `js-cookie` e storage via `sessionStorage/localStorage`). Documentar qual é a fonte de verdade e remover/confirme o legado:
  - `src/hooks/useAuthHook.ts` usa `src/lib/auth/cookies.ts`
  - `src/lib/auth/api.ts` usa `src/lib/auth/storage.ts`
- [ ] **Token expiry**: alinhar documentação com `ACCESS_TOKEN_EXPIRE_MINUTES` (hoje 8 dias por default).
- [x] **`GET /api/sessions?project_id=...`**: proxy agora repassa `project_id` para o backend (`src/app/api/sessions/route.ts`).
- [x] **Projects update**: existe proxy `PATCH /api/projects/:projectId` e `useProjects.updateProject` usa esse caminho.
- [ ] **`GET /api/v1/users/{user_id}` público**: avaliar se deve exigir auth (ou limitar dados).
- [ ] **Documents sem auth no backend**: avaliar se upload/list/download/delete devem exigir Bearer e checar ownership (hoje parecem “públicos”).
- [ ] **Proxy documents/user logging**: `src/app/api/documents/user/[userId]/route.ts` loga `data.length` mas o backend retorna `{documents,count}`.

---

# 4) Templates (copiar/colar)

## Template — docstring de endpoint (FastAPI)

Use como bloco do handler:

```py
def handler(...):
    """
    <VERBO> <PATH>
    Objetivo: <o que faz e por que existe>

    Auth:
      - Bearer JWT: <sim/não>
      - Permissões: <owner/superuser/...>

    Request:
      - Path/query: <campos, defaults, validações>
      - Body: <schema + exemplos>

    Response:
      - 200/201: <schema + exemplos>

    Erros esperados:
      - 400: <quando>
      - 401: <quando>
      - 403: <quando>
      - 404: <quando>
      - 422: <validação>

    Side effects:
      - DB: <tabelas alteradas>
      - Arquivos/externos: <upload/email/dialogflow/etc>

    Como testar (curl):
      curl -X ...
    """
```

## Template — comentário de rota proxy (Next.js)

Topo do arquivo `route.ts`:

```ts
/**
 * Next.js API Route - <Nome>
 *
 * Por que existe:
 * - Proxy para evitar CORS e centralizar contrato do frontend
 *
 * Rota pública (frontend):
 * - <METHOD> /api/<...>
 *
 * Rota backend:
 * - <METHOD> /api/v1/<...>
 *
 * Auth:
 * - Requer `Authorization: Bearer <token>`? <sim/não>
 *
 * Transformações:
 * - <json -> form, renomear campos, calcular expiresAt, etc>
 *
 * Chamadores:
 * - <hooks/pages que usam esta rota>
 */
```
