# Verity Agro - Frontend

> Modern Next.js 15 frontend for Verity Agro - Agricultural credit specialist with AI-powered chat interface

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Run development server
pnpm dev

# Build for production
pnpm build
```

Visit [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Auth**: JWT with refresh token
- **Observability**: Sentry + PostHog
- **Package Manager**: pnpm

## Features

### Autenticação

- ✅ Login/Register com JWT
- ✅ Refresh token automático
- ✅ Reset de senha via email
- ✅ Cookies seguros (SameSite=Strict)

### Chat com IA

- ✅ Interface estilo Gemini
- ✅ Streaming de respostas
- ✅ Upload de documentos

### Observabilidade

- ✅ **Sentry**: Error tracking (client, server, edge)
- ✅ **PostHog**: Product analytics

## Workflows de CPR (LangGraph — Backend)

Os fluxos conversacionais de **Análise** e **Criação** de CPR estão sendo migrados do Dialogflow CX para **LangGraph** no backend, com:

- **Workflows como grafo** (nós + transições) versionados em código
- **Human-in-the-loop** nativo (`interrupt()/resume`) para confirmação de dados
- **Persistência de estado** (checkpointer em PostgreSQL) para retomar sessões
- **Multi-modelo** por tarefa via **OpenRouter** (roteamento de modelos)

Detalhes completos do desenho/cronograma: `docs/MIGRACAO_DIALOGFLOW_LANGGRAPH.md`.

### Workflows suportados

- `analise_cpr`: extrair texto do documento → validar/confirmar campos → compliance → score de risco → relatório final
- `criar_cpr`: wizard de coleta de dados → confirmação → geração do documento

## OpenRouter (integração no backend)

O **OpenRouter** é usado **somente no backend** para acesso a múltiplos modelos e seleção por tarefa (ex.: extração estruturada, compliance, sumarização).

- Variável necessária no backend: `OPENROUTER_API_KEY`
- **Não** configure essa chave no frontend (`NEXT_PUBLIC_*`) para evitar exposição no browser

Lista completa de variáveis (frontend + backend): `docs/VARIAVEIS_AMBIENTE.md`.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   └── api/          # BFF (Backend for Frontend) routes
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── v2/          # Application components
├── lib/             # Utility functions
│   ├── auth/        # Authentication (cookies, token-refresh)
│   └── email/       # Email service (Resend)
├── hooks/           # Custom React hooks
├── contexts/        # React contexts (AuthContext)
├── store.ts         # Zustand store
└── types/           # TypeScript types
```

## Environment Variables

| Variável                   | Descrição                              |
| -------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_API_URL`      | URL do backend                         |
| `NEXT_PUBLIC_SENTRY_DSN`   | Sentry DSN                             |
| `NEXT_PUBLIC_POSTHOG_KEY`  | PostHog API key                        |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host                           |
| `RESEND_API_KEY`           | API key do Resend (para emails)        |
| `EMAIL_FROM`               | Email remetente                        |
| `FRONTEND_URL`             | URL do frontend (para links em emails) |

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Check code formatting
pnpm format:fix   # Fix code formatting
pnpm typecheck    # Run TypeScript compiler
pnpm validate     # Run all checks
```

## Documentation

- [API Backlog](docs/api-backlog.md)
- [Email Setup](docs/EMAIL_SETUP.md)
- [Stack](docs/STACK.md)
- [Variáveis de Ambiente](docs/VARIAVEIS_AMBIENTE.md)
- [Migração Dialogflow → LangGraph](docs/MIGRACAO_DIALOGFLOW_LANGGRAPH.md)
- [Feature Analysis](docs/ANALISE_FUNCIONALIDADES.md)
- [Pilot Plan](docs/PLANO_PILOTO_ESTRATEGICO.md)

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ntropy-co/rodrigues-ai-frontend)

## License

Proprietary - Verity Agro

## Links

- **Frontend**: [Vercel](https://verity-agro.vercel.app)
- **Backend**: [Verity API](https://api.verityagro.com)
- **Repository**: [GitHub](https://github.com/ntropy-co/rodrigues-ai-frontend)
