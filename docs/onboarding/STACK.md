# Stack Tecnologia - Verity Agro

> Documentacao completa da stack utilizada no projeto Verity Agro (Frontend)
>
> Ultima atualizacao: 2025-12-13

---

## Visao Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    Next.js 15 + React 19                        │
│                      Deploy: Vercel                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ BFF (API Routes)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    FastAPI (Python)                             │
│                     Deploy: Railway                             │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │  Gemini  │   │ Vertex AI│
        │(Database)│   │  (LLM)   │   │ (Search) │
        └──────────┘   └──────────┘   └──────────┘
```

---

## Stack do Frontend

### Core

| Tecnologia     | Versao | Proposito                    |
| -------------- | ------ | ---------------------------- |
| **Node.js**    | 25.2.1 | Runtime JavaScript           |
| **npm**        | 11.6.2 | Gerenciador de pacotes       |
| **Next.js**    | 15.5.7 | Framework React (App Router) |
| **React**      | 19.2.1 | Biblioteca UI                |
| **TypeScript** | 5.9.3  | Tipagem estatica             |

### UI & Styling

| Tecnologia                   | Versao   | Proposito                 |
| ---------------------------- | -------- | ------------------------- |
| **Tailwind CSS**             | 3.4.18   | Utility-first CSS         |
| **tailwindcss-animate**      | 1.0.7    | Animacoes Tailwind        |
| **@tailwindcss/typography**  | 0.5.19   | Tipografia para prose     |
| **Framer Motion**            | 12.23.25 | Animacoes declarativas    |
| **Lucide React**             | 0.555.0  | Icones                    |
| **clsx**                     | 2.1.1    | Concatenacao de classes   |
| **tailwind-merge**           | 3.4.0    | Merge de classes Tailwind |
| **class-variance-authority** | 0.7.1    | Variantes de componentes  |

### Componentes UI (Radix)

| Componente                    | Versao |
| ----------------------------- | ------ |
| @radix-ui/react-checkbox      | 1.3.3  |
| @radix-ui/react-dialog        | 1.1.15 |
| @radix-ui/react-dropdown-menu | 2.1.16 |
| @radix-ui/react-icons         | 1.3.2  |
| @radix-ui/react-select        | 2.2.6  |
| @radix-ui/react-slot          | 1.2.4  |
| @radix-ui/react-tooltip       | 1.2.8  |

### State Management

| Tecnologia  | Versao | Proposito                      |
| ----------- | ------ | ------------------------------ |
| **Zustand** | 5.0.9  | Estado global (leve e simples) |
| **nuqs**    | 2.8.2  | Estado na URL (query strings)  |

### Markdown & Content

| Tecnologia           | Versao | Proposito                 |
| -------------------- | ------ | ------------------------- |
| **react-markdown**   | 9.1.0  | Renderizar markdown       |
| **remark-gfm**       | 4.0.1  | GitHub Flavored Markdown  |
| **remark-parse**     | 11.0.0 | Parser markdown           |
| **remark-rehype**    | 11.1.2 | Converter para HTML       |
| **rehype-raw**       | 7.0.0  | HTML dentro de markdown   |
| **rehype-sanitize**  | 6.0.0  | Sanitizar HTML            |
| **rehype-stringify** | 10.0.1 | Stringificar HTML         |
| **unified**          | 11.0.5 | Pipeline de processamento |

### Utilitarios

| Tecnologia              | Versao  | Proposito                |
| ----------------------- | ------- | ------------------------ |
| **dayjs**               | 1.11.19 | Manipulacao de datas     |
| **js-cookie**           | 3.0.5   | Gerenciamento de cookies |
| **zod**                 | 4.1.13  | Validacao de schemas     |
| **sonner**              | 1.7.4   | Toast notifications      |
| **use-stick-to-bottom** | 1.1.1   | Auto-scroll para chat    |

### PWA (Progressive Web App)

| Tecnologia               | Versao | Proposito            |
| ------------------------ | ------ | -------------------- |
| **@ducanh2912/next-pwa** | 10.2.9 | Service Worker + PWA |

### Servicos Externos

| Tecnologia         | Versao | Proposito                           |
| ------------------ | ------ | ----------------------------------- |
| **Resend**         | 6.6.0  | Envio de emails transacionais       |
| **@upstash/redis** | 1.35.8 | Cache/tokens temporarios (opcional) |

### Temas

| Tecnologia      | Versao | Proposito       |
| --------------- | ------ | --------------- |
| **next-themes** | 0.4.6  | Dark/Light mode |

---

## Dev Dependencies

### Linting & Formatting

| Tecnologia                      | Versao | Proposito                     |
| ------------------------------- | ------ | ----------------------------- |
| **ESLint**                      | 9.39.1 | Linting JavaScript/TypeScript |
| **eslint-config-next**          | 15.2.3 | Config ESLint para Next.js    |
| **eslint-plugin-react**         | 7.37.5 | Regras React                  |
| **Prettier**                    | 3.7.4  | Formatacao de codigo          |
| **prettier-plugin-tailwindcss** | 0.6.14 | Ordenar classes Tailwind      |

### Git Hooks

| Tecnologia      | Versao | Proposito            |
| --------------- | ------ | -------------------- |
| **Husky**       | 9.1.7  | Git hooks            |
| **lint-staged** | 16.2.7 | Lint em staged files |

### Build Tools

| Tecnologia       | Versao  | Proposito                 |
| ---------------- | ------- | ------------------------- |
| **PostCSS**      | 8.5.6   | Processamento CSS         |
| **Webpack**      | 5.103.0 | Bundler (usado pelo Next) |
| **@babel/core**  | 7.28.5  | Transpilacao              |
| **babel-loader** | 10.0.0  | Loader Babel para Webpack |

### Types

| Pacote           | Versao   |
| ---------------- | -------- |
| @types/node      | 20.19.25 |
| @types/react     | 19.2.7   |
| @types/react-dom | 19.2.3   |
| @types/js-cookie | 3.0.6    |

---

## Configuracao TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Variaveis de Ambiente

| Variavel                   | Obrigatoria | Descricao                         |
| -------------------------- | ----------- | --------------------------------- |
| `NEXT_PUBLIC_API_URL`      | Sim         | URL do backend FastAPI            |
| `NEXT_PUBLIC_APP_URL`      | Sim         | URL da aplicacao (auto na Vercel) |
| `NODE_ENV`                 | Auto        | Ambiente (development/production) |
| `RESEND_API_KEY`           | Sim\*       | API key do Resend (para emails)   |
| `UPSTASH_REDIS_REST_URL`   | Nao         | URL do Upstash Redis              |
| `UPSTASH_REDIS_REST_TOKEN` | Nao         | Token do Upstash Redis            |

> \*Obrigatoria para funcionalidade de reset de senha

---

## Scripts Disponiveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor dev na porta 3000

# Build & Deploy
npm run build        # Build de producao
npm run start        # Inicia servidor de producao

# Qualidade de Codigo
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas de lint
npm run format       # Verifica formatacao
npm run format:fix   # Corrige formatacao
npm run typecheck    # Verifica tipos TypeScript
npm run validate     # Executa lint + format + typecheck

# Utilitarios
npm run clean        # Limpa cache e builds
```

---

## Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticacao (layout proprio)
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── api/               # BFF - API Routes
│   │   ├── auth/          # Proxy auth para backend
│   │   ├── chat/          # Proxy chat para backend
│   │   ├── documents/     # Proxy documentos para backend
│   │   ├── sessions/      # Proxy sessoes para backend
│   │   └── projects/      # Proxy projetos para backend
│   ├── chat/              # Pagina principal do chat
│   └── layout.tsx         # Layout principal
├── components/
│   ├── ui/                # Componentes base (Shadcn-style)
│   └── v2/                # Componentes do redesign
├── contexts/              # React Contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utilitarios e configs
│   ├── auth/              # Logica de autenticacao
│   └── utils/             # Funcoes utilitarias
├── types/                 # TypeScript types
└── store.ts               # Zustand store
```

---

## Stack do Backend (Referencia)

O backend e um projeto separado hospedado no Railway:

| Tecnologia           | Proposito           |
| -------------------- | ------------------- |
| **FastAPI**          | Framework Python    |
| **PostgreSQL**       | Banco de dados      |
| **Gemini**           | LLM para chat       |
| **Vertex AI Search** | Busca em documentos |
| **Railway**          | Hosting             |

**URL Producao:** `https://api.verityagro.com`

---

## Servicos Externos Planejados

### Ativos

| Servico          | Proposito          | Status |
| ---------------- | ------------------ | ------ |
| **Vercel**       | Hosting frontend   | Ativo  |
| **Railway**      | Hosting backend    | Ativo  |
| **Google Cloud** | Gemini + Vertex AI | Ativo  |

### A Configurar

| Servico           | Proposito              | Free Tier      |
| ----------------- | ---------------------- | -------------- |
| **Resend**        | Emails transacionais   | 3.000/mes      |
| **Langfuse**      | Observabilidade LLM    | 50k traces/mes |
| **Sentry**        | Monitoramento de erros | 5k eventos/mes |
| **PostHog**       | Analytics              | 1M eventos/mes |
| **Cloudflare R2** | Storage de documentos  | 10GB           |

---

## Seguranca

### Headers Configurados (next.config.ts)

- **Content-Security-Policy**: Protecao XSS
- **X-Frame-Options**: DENY (previne clickjacking)
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: camera=(), microphone=(), geolocation=()
- **Strict-Transport-Security**: HSTS em producao

### Autenticacao

- JWT tokens armazenados em cookies httpOnly (via backend)
- Refresh token mechanism (a implementar)
- Rate limiting (a implementar)

---

## PWA

O app e configurado como PWA com:

- Service Worker para cache offline
- Manifest para instalacao
- Caching strategies:
  - **API routes**: NetworkOnly (nunca cachear)
  - **Google Fonts**: CacheFirst (1 ano)
  - **Imagens**: StaleWhileRevalidate (30 dias)
  - **JS estatico**: CacheFirst (1 dia)
  - **Paginas**: NetworkFirst (1 dia)

---

## Design System

### Paleta de Cores (Verity Agro)

```
Verde (Principal):
├── 950: #1A3A2E  (texto primario)
├── 900: #2D5A45  (CTA/accent)
├── 800: #3A6B54  (hover)
├── 700: #478063  (accent light)
├── 600: #5A7A6B  (texto secundario)
├── 500: #6D8D7D  (medium)
├── 400: #8BA89B  (texto terciario)
├── 300: #9DC4B0  (border medium)
├── 200: #D1E7DD  (border)
├── 100: #E8F3ED  (border light)
└── 50:  #F5F9F7  (background)

Ouro (Valores monetarios):
├── 600: #C9922A
├── 500: #D4A034
└── 400: #E0B14E
```

### Tipografia

- **Display**: Crimson Text (serif)
- **Body**: Inter (sans-serif)
- **Code**: Fira Code (monospace)

---

## Proximos Passos

1. [ ] Configurar Resend para emails
2. [ ] Implementar refresh token
3. [ ] Adicionar Langfuse para observabilidade
4. [ ] Configurar Sentry para erros
5. [ ] Implementar rate limiting
6. [ ] Adicionar testes automatizados

---

## Links Uteis

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Resend](https://resend.com/docs)
- [Vercel](https://vercel.com/docs)
