# Variáveis de Ambiente - Verity Agro

> Lista completa de variáveis necessárias para desenvolvimento e produção
> Atualizado: 2025-12-16

> Segurança: nunca commite chaves/token em git. Use `.env`/`.env.local` no local e variables no provedor (Vercel/Railway).

---

## 📋 Índice

- [Frontend (Next.js - Vercel)](#frontend-nextjs---vercel)
- [Backend (FastAPI - Railway)](#backend-fastapi---railway)
- [Como Configurar](#como-configurar)
- [Checklist de Deploy](#checklist-de-deploy)

---

## Frontend (Next.js - Vercel)

### ✅ Obrigatórias

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://rodrigues-ai-backend-production.up.railway.app` | URL do backend FastAPI |
| `NEXT_PUBLIC_APP_URL` | `https://ai.verityagro.com` | URL do frontend (auto na Vercel) |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxx` | API key do Resend para emails |
| `EMAIL_FROM` | `no-reply@verityagro.com` | Email remetente |
| `EMAIL_FROM_NAME` | `Verity Agro` | Nome do remetente |

### 📊 Analytics & Monitoramento

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_xxxxxxxxxxxxx` | PostHog analytics key |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` | PostHog host |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://xxx@xxx.ingest.sentry.io/xxx` | Sentry error tracking |

### 🔧 Opcionais

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `NEXT_PUBLIC_PLAYGROUND_ENDPOINT` | `https://rodrigues-ai-backend-production.up.railway.app` | Endpoint para playground |
| `NEXT_PUBLIC_FRONTEND_URL` | `http://localhost:3000` | URL frontend (dev) |
| `UPSTASH_REDIS_REST_URL` | `https://xxx.upstash.io` | Redis cache (opcional) |
| `UPSTASH_REDIS_REST_TOKEN` | `xxxxxxxxxxxxx` | Token Redis |

### 📝 Build Configuration

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente (auto na Vercel) |
| `ESLINT_IGNORE_DURING_BUILD` | `false` | Ignorar erros ESLint no build |
| `TYPESCRIPT_IGNORE_BUILD_ERRORS` | `false` | Ignorar erros TypeScript no build |

---

## Backend (FastAPI - Railway)

### 🗄️ Database (PostgreSQL)

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `POSTGRES_SERVER` | `postgres.railway.internal` | Host do PostgreSQL (Railway provê) |
| `POSTGRES_USER` | `postgres` | Usuário do banco (Railway provê) |
| `POSTGRES_PASSWORD` | `xxxxxxxxxxxxx` | Senha do banco (Railway provê) |
| `POSTGRES_DB` | `railway` | Nome do banco (Railway provê) |
| `POSTGRES_PORT` | `5432` | Porta do PostgreSQL |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | URL completa (Railway auto-gera) |

> ⚠️ **Railway**: Não precisa configurar manualmente. Ao adicionar PostgreSQL no Railway, essas variáveis são injetadas automaticamente.

### 🔑 AI/LLM Services

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `GOOGLE_API_KEY` | ✅ Sim | Google Gemini API key |
| `OPENROUTER_API_KEY` | ✅ Sim | OpenRouter API para modelos grátis |
| `AGNO_API_KEY` | ❌ Opcional | Agno API (se usado) |
| `DIALOGFLOW_PROJECT_ID` | ❌ Migrar | Projeto Dialogflow CX (será removido) |
| `DIALOGFLOW_AGENT_ID` | ❌ Migrar | Agent Dialogflow CX (será removido) |
| `GOOGLE_APPLICATION_CREDENTIALS` | ❌ Migrar | Path para service account (Dialogflow/GCS) |

### 🔐 Security & Auth

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `SECRET_KEY` | `xxxxxxxxxxxxxxxxxxxxxxxx` | JWT secret (gerar com `secrets.token_urlsafe(32)`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `11520` | Expiração token (8 dias) |
| `RESET_PASSWORD_TOKEN_EXPIRE_MINUTES` | `30` | Expiração token reset senha |

### 🌐 CORS & URLs

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `FRONTEND_URL` | `https://ai.verityagro.com` | URL do frontend |
| `BACKEND_CORS_ORIGINS` | `https://ai.verityagro.com,https://app.agno.com` | Origens permitidas (separadas por vírgula) |
| `NEXT_PUBLIC_API_URL` | `https://api.verityagro.com` | URL pública da API |
| `NEXT_PUBLIC_APP_URL` | `https://ai.verityagro.com` | URL pública do app |

### 📦 Vector Database (Qdrant)

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `QDRANT_HOST` | `qdrant` | Host do Qdrant (Docker) ou URL cloud |
| `QDRANT_PORT` | `6333` | Porta do Qdrant |
| `QDRANT_API_KEY` | `xxxxxxxxxxxxx` | API key (se Qdrant Cloud) |
| `QDRANT_COLLECTION_NAME` | `prod--rodrigues-ai-credito-agro` | Nome da coleção |
| `QDRANT_URL` | `https://xxx.cloud.qdrant.io` | URL completa (se Qdrant Cloud) |

> 💡 **Opção 1 (Auto-hospedado)**: Deploy Qdrant no Railway como serviço separado
> 💡 **Opção 2 (Cloud)**: Usar Qdrant Cloud (free tier: 1GB)

### 📧 Email (SMTP)

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `SMTP_HOST` | `smtp.gmail.com` | Host SMTP |
| `SMTP_PORT` | `587` | Porta SMTP |
| `SMTP_USER` | `noreply@verityagro.com` | Usuário SMTP |
| `SMTP_PASSWORD` | `xxxxxxxxxxxxx` | Senha SMTP |
| `EMAIL_FROM` | `noreply@verityagro.com` | Email remetente |
| `EMAIL_FROM_NAME` | `Rodrigues AI` | Nome remetente |

### 📊 Observability

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `LANGFUSE_PUBLIC_KEY` | ❌ Recomendada | Langfuse tracing (free: 50k traces/mês) |
| `LANGFUSE_SECRET_KEY` | ❌ Recomendada | Langfuse secret |
| `LANGFUSE_HOST` | ❌ Recomendada | `https://cloud.langfuse.com` |
| `SENTRY_DSN` | ❌ Recomendada | Sentry error tracking (free: 5k eventos/mês) |
| `POSTHOG_API_KEY` | ❌ Recomendada | PostHog analytics (backend) |
| `POSTHOG_HOST` | ❌ Recomendada | `https://us.i.posthog.com` |

### ⚙️ Application Config

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `ENVIRONMENT` | `production` | Ambiente: local, staging, production |
| `NODE_ENV` | `production` | Node environment |
| `DOCS_ENABLED` | `false` | Mostrar docs Swagger (false em produção) |
| `LOG_LEVEL` | `INFO` | Nível de log: DEBUG, INFO, WARNING, ERROR |
| `RATE_LIMIT_PER_MINUTE` | `60` | Rate limiting (requisições/minuto) |

### 🔄 LangGraph/LangChain (NOVO - Migração do Dialogflow)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `LANGGRAPH_CHECKPOINTER_URL` | ✅ Sim | URL do PostgreSQL para checkpointer (mesma do DATABASE_URL) |
| `LANGGRAPH_INTERRUPT_ENABLED` | ✅ Sim | `true` - Ativar interrupts para human-in-the-loop |
| `LANGGRAPH_VERSION` | ℹ️ Info | `1.0.5` (documentação) |

---

## 🚀 Como Configurar

### Desenvolvimento Local

1. **Frontend** (`.env.local`):
```bash
cp .env.example .env.local
# Edite .env.local com suas keys
```

2. **Backend** (`.env`):
```bash
cp .env.example .env
# Edite .env com suas keys locais
```

### Produção (Railway - Backend)

#### Opção 1: Via Dashboard Railway

1. Acesse o projeto no Railway
2. Clique em "Variables"
3. Adicione cada variável manualmente

#### Opção 2: Via Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link com projeto
railway link

# Adicionar variáveis (uma por vez)
railway variables set GOOGLE_API_KEY=sua_key_aqui
railway variables set OPENROUTER_API_KEY=sua_key_aqui
railway variables set SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
railway variables set ENVIRONMENT=production
railway variables set DOCS_ENABLED=false

# Ver todas variáveis
railway variables
```

#### Opção 3: Usar arquivo .env (CUIDADO!)

```bash
# Criar arquivo .railway.env localmente (NÃO commitar!)
cat > .railway.env << 'EOF'
GOOGLE_API_KEY=xxx
OPENROUTER_API_KEY=xxx
SECRET_KEY=xxx
ENVIRONMENT=production
DOCS_ENABLED=false
# ... demais variáveis
EOF

# Importar de uma vez (Railway CLI)
railway variables set --from-file .railway.env

# DELETAR arquivo depois!
rm .railway.env
```

### Produção (Vercel - Frontend)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Link com projeto
vercel link

# Adicionar variáveis de produção
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
vercel env add RESEND_API_KEY production

# Ou via dashboard Vercel > Settings > Environment Variables
```

---

## ✅ Checklist de Deploy

### Backend (Railway)

- [ ] PostgreSQL adicionado como serviço
- [ ] `DATABASE_URL` auto-gerada pelo Railway
- [ ] `GOOGLE_API_KEY` configurada
- [ ] `OPENROUTER_API_KEY` configurada
- [ ] `SECRET_KEY` gerada e configurada
- [ ] `ENVIRONMENT=production`
- [ ] `DOCS_ENABLED=false`
- [ ] `FRONTEND_URL` apontando para Vercel
- [ ] `BACKEND_CORS_ORIGINS` incluindo domínio Vercel
- [ ] Qdrant configurado (cloud ou serviço Railway)
- [ ] `QDRANT_URL` ou `QDRANT_HOST` + `QDRANT_PORT`
- [ ] Langfuse configurado (cloud.langfuse.com)
- [ ] `LANGFUSE_PUBLIC_KEY` e `LANGFUSE_SECRET_KEY`
- [ ] Sentry DSN configurada
- [ ] PostHog API key configurada (se usar no backend)
- [ ] `LANGGRAPH_CHECKPOINTER_URL` = `DATABASE_URL`
- [ ] `LANGGRAPH_INTERRUPT_ENABLED=true`

### Frontend (Vercel)

- [ ] `NEXT_PUBLIC_API_URL` apontando para Railway
- [ ] `NEXT_PUBLIC_APP_URL` apontando para domínio Vercel
- [ ] `RESEND_API_KEY` configurada
- [ ] `EMAIL_FROM` configurado
- [ ] `EMAIL_FROM_NAME` configurado
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` configurada
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` configurada
- [ ] `NEXT_PUBLIC_SENTRY_DSN` configurada
- [ ] Domínio customizado configurado (opcional)

### Verificação Pós-Deploy

```bash
# Testar saúde do backend
curl https://rodrigues-ai-backend-production.up.railway.app/api/v1/health/

# Testar docs (se DOCS_ENABLED=true em staging)
curl https://rodrigues-ai-backend-production.up.railway.app/docs

# Verificar frontend
curl https://ai.verityagro.com
```

---

## 🔍 Variáveis Faltando (Conforme Código Atual)

### Backend - URGENTE

1. **`OPENROUTER_API_KEY`** ⚠️
   - Necessária para usar modelos grátis do OpenRouter
   - Referenciada em `model_mapping.md`
   - Cadastro: https://openrouter.ai/

2. **`LANGGRAPH_CHECKPOINTER_URL`** ⚠️
   - Necessária para persistência de estado LangGraph
   - Usar mesma URL do PostgreSQL
   - Valor: `${{DATABASE_URL}}` (Railway)

3. **`LANGGRAPH_INTERRUPT_ENABLED`** ⚠️
   - Ativar human-in-the-loop workflows
   - Valor: `true`

### Backend - RECOMENDADAS

4. **`LANGFUSE_PUBLIC_KEY`** + `LANGFUSE_SECRET_KEY`** 📊
   - Observabilidade LLM essencial
   - Free tier: 50.000 traces/mês
   - Cadastro: https://cloud.langfuse.com

5. **`QDRANT_URL`** ou **`QDRANT_HOST`** 🔍
   - Necessária para RAG funcionar
   - Opção cloud (free): https://qdrant.tech/cloud/
   - Opção self-hosted: Deploy no Railway

### Backend - MIGRAÇÃO DIALOGFLOW → LANGGRAPH

6. **Remover após migração completa**:
   - `DIALOGFLOW_PROJECT_ID`
   - `DIALOGFLOW_AGENT_ID`
   - `GOOGLE_APPLICATION_CREDENTIALS`

7. **Manter temporariamente** (até fase 5 completa):
   - Endpoint `/api/v1/dialogflow/webhook` ainda ativo
   - Variáveis Dialogflow necessárias para fallback

---

## 📖 Referências

- [Railway Docs - Environment Variables](https://docs.railway.app/develop/variables)
- [Vercel Docs - Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js Docs - Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [FastAPI Settings Management](https://fastapi.tiangolo.com/advanced/settings/)
- [LangGraph Checkpointer Docs](https://langchain-ai.github.io/langgraph/how-tos/persistence/)

---

## 🆘 Troubleshooting

### Erro: "Database connection failed"
- Verificar `DATABASE_URL` no Railway
- Conferir se PostgreSQL está running
- Testar conexão: `railway run psql $DATABASE_URL`

### Erro: "CORS policy blocked"
- Verificar `BACKEND_CORS_ORIGINS` inclui domínio do frontend
- Formato: `https://dominio1.com,https://dominio2.com` (sem espaços)

### Erro: "API key invalid" (Google/OpenRouter)
- Verificar se keys estão corretas
- Google: https://aistudio.google.com/apikey
- OpenRouter: https://openrouter.ai/keys

### Erro: "Langfuse not initialized"
- Verificar `LANGFUSE_PUBLIC_KEY` e `LANGFUSE_SECRET_KEY`
- Verificar `LANGFUSE_HOST` (default: https://cloud.langfuse.com)
- Não é crítico, mas prejudica observabilidade

---

**Última atualização**: 2025-12-16 | [Voltar ao índice](#-índice)
