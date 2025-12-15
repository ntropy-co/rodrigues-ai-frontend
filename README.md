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
- [Feature Analysis](docs/ANALISE_FUNCIONALIDADES.md)
- [Pilot Plan](docs/PLANO_PILOTO_ESTRATEGICO.md)

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ntropy-co/rodrigues-ai-frontend)

## License

Proprietary - Verity Agro

## Links

- **Frontend**: [Vercel](https://verity-agro.vercel.app)
- **Backend**: [Railway](https://railway.app)
- **Repository**: [GitHub](https://github.com/ntropy-co/rodrigues-ai-frontend)
