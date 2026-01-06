# 🛠️ Setup Local

## Requisitos

- Node.js 20+ (Recomendado 25.2.1)
- npm 9+
- Git

## Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/ntropy-co/rodrigues-ai-frontend.git
cd rodrigues-ai-frontend

# 2. Instalar dependências
npm install

# 3. Copiar variáveis de ambiente
cp .env.example .env.local
```

## Variáveis de Ambiente

Edite `.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# App URL (para CORS)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Sentry (opcional)
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...

# PostHog (opcional)
NEXT_PUBLIC_POSTHOG_KEY=...
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start

# Lint e formatação
npm run lint
npm run format
```

## Estrutura de Comandos

| Comando             | Descrição                          |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Inicia servidor de desenvolvimento |
| `npm run build`     | Build de produção                  |
| `npm run lint`      | Verifica erros de lint             |
| `npm run format`    | Formata código                     |
| `npm run typecheck` | Verifica tipos TypeScript          |

## Troubleshooting

### Erro: "Cannot find module"

```bash
rm -rf node_modules
npm install
```

### Erro: "CORS blocked"

Verifique se `NEXT_PUBLIC_API_URL` está correto no `.env.local`

### Erro: "Upstash connection failed"

Rate limiting falha silenciosamente se Redis não estiver configurado. Para desenvolvimento local, isso é aceitável.
