# Infraestrutura CI/CD - Verity Agro Frontend

**Status:** ✅ Implementado no repo (workflows em `.github/workflows/`)

## Visão Geral

```
GitHub → Workflows → Vercel
  ├── PR: lint, typecheck, build
  ├── develop → staging (auto)
  └── main → production (manual)
```

## Configuração de Secrets (GitHub)

Acesse: **Settings → Secrets and variables → Actions**

| Secret | Descrição | Onde obter |
|--------|-----------|------------|
| `VERCEL_TOKEN` | Token de acesso | [Vercel Settings](https://vercel.com/account/tokens) |
| `UPSTASH_REDIS_REST_URL` | URL do Redis | Upstash Dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | Token do Redis | Upstash Dashboard |
| `NEXT_PUBLIC_API_URL` | URL do backend | Seu backend |

## Configuração de Environments (GitHub)

Acesse: **Settings → Environments**

### staging
- **Protection rules:** Nenhuma (auto-deploy)
- **Secrets:** Herdam do repositório
- **Deployment branch:** `develop`

### production
- **Protection rules:** Required reviewers (1+)
- **Secrets:** Valores de produção
- **Deployment branch:** `main`

## Workflows

### 1. Lint & Type Check (`validate.yml`)
- **Trigger:** Push/PR para main ou develop
- **Jobs:** lint, typecheck, format check

### 2. Build (`build.yml`)
- **Trigger:** PRs para main ou develop
- **Jobs:** npm ci, npm run build

### 3. Deploy Staging (`deploy-staging.yml`)
- **Trigger:** Push para develop
- **Jobs:** Build + Deploy para preview URL

### 4. Deploy Production (`deploy-production.yml`)
- **Trigger:** Manual (workflow_dispatch)
- **Requer:** Digitar "deploy" para confirmar
- **Jobs:** Build + Deploy prod + Create Release

## Health Checks

| Endpoint | Tipo | Descrição |
|----------|------|-----------|
| `/api/health` | Liveness | App está rodando? |
| `/api/health/ready` | Readiness | Redis + Backend OK? |

## Comandos de Verificação

```bash
# Local
npm run lint
npm run typecheck
npm run build

# Health checks
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/ready
```

## Deploy Manual

```bash
# Staging (via GitHub Actions)
git push origin develop

# Production
# 1. Vá para Actions → Deploy Production
# 2. Click "Run workflow"
# 3. Digite "deploy" e confirme
```

## Rollback

1. **Via Vercel:** Dashboard → Deployments → Promote anterior
2. **Via Git:** `git revert HEAD && git push`

## Monitoramento

- **Logs:** Vercel Dashboard → Functions
- **Erros:** Sentry
- **Analytics:** PostHog
- **Rate Limit:** Upstash Dashboard
