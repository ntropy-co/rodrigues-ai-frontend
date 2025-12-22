# 📚 Documentação Técnica - Verity Agro Frontend

> Documentação interna para onboarding e manutenção do frontend Next.js 15

## Quick Links

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE](./ARCHITECTURE.md) | Visão geral da arquitetura |
| [AUTHENTICATION](./AUTHENTICATION.md) | Fluxo de autenticação |
| [API_ROUTES](./API_ROUTES.md) | Rotas BFF do Next.js |
| [COMPONENTS](./COMPONENTS.md) | Componentes principais |
| [HOOKS](./HOOKS.md) | Custom hooks |
| [SETUP](./SETUP.md) | Configuração local |

## Stack Técnico

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS
- **Animações:** Framer Motion
- **Estado:** Zustand + React Query
- **Auth:** JWT via cookies (SameSite=Strict)
- **Backend:** FastAPI (rodrigues-ai-backend)

## Estrutura de Diretórios

```
src/
├── app/              # App Router pages
│   ├── api/          # BFF routes
│   └── (auth)/       # Auth pages
├── components/
│   ├── ui/           # Primitivos (Button, Input)
│   └── v2/           # Componentes de features
├── hooks/            # 23 custom hooks
├── lib/              # Utilitários
│   ├── auth/         # Autenticação
│   └── utils/        # Helpers
├── stores/           # Zustand stores
└── types/            # TypeScript types
```

## Documentação Existente

Veja também a pasta `/docs` para documentação adicional:
- `STACK.md` - Stack técnico detalhado
- `VARIAVEIS_AMBIENTE.md` - Variáveis de ambiente
- `EMAIL_SETUP.md` - Configuração de email
