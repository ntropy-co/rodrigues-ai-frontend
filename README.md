# Rodrigues AI - Frontend

Interface web da plataforma Rodrigues AI, especializada em Crédito Agro e CPR.

## 🏗️ Tecnologias

- **Framework:** Next.js 15.5+
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand + React Context
- **Auth:** JWT + OAuth2
- **UI Components:** shadcn/ui

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- npm ou pnpm

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd rodrigues-ai-frontend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local
# Editar com URL do backend

# Rodar em desenvolvimento
npm run dev
```

### Acessar

- **App:** http://localhost:3000
- **Login:** http://localhost:3000/login

## 🔑 Variáveis de Ambiente

Ver `.env.example` para lista completa:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📁 Estrutura

```
rodrigues-ai-frontend/
├── src/
│   ├── app/              # Pages (App Router)
│   │   ├── login/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── components/
│   │   ├── v2/           # Componentes principais
│   │   └── ui/           # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   └── types/            # TypeScript types
├── public/               # Assets estáticos
└── docs/
    └── LOGIN_SETUP.md    # Guia de autenticação
```

## 🎨 Features

- ✅ Chat com IA especializada em Agro
- ✅ Autenticação completa (login, registro, reset senha)
- ✅ Interface responsiva (desktop + mobile)
- ✅ Copy de mensagens com feedback
- ✅ Timestamps relativos
- ✅ Indicador de digitação
- ✅ Auto-scroll inteligente
- ✅ Atalhos de teclado (Cmd/Ctrl+K)
- ✅ Skeleton loaders
- ✅ Dark mode support

## 🔐 Autenticação

O frontend se conecta aos endpoints do backend:

```typescript
// Login
POST /api/v1/auth/login

// Registro
POST /api/v1/auth/register

// Reset de senha
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Token JWT é armazenado em `localStorage` e incluído automaticamente em todas as requisições.

## 🧪 Scripts

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção local
npm start

# Linting
npm run lint

# Format
npm run format
```

## 🚀 Deploy

### Com Docker

```bash
# Build imagem
docker build -t rodrigues-ai-frontend .

# Rodar container
docker run -p 3000:3000 --env-file .env rodrigues-ai-frontend
```

### Com Docker Compose

```bash
docker-compose up -d
```

### Vercel (recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configurar variáveis de ambiente no painel da Vercel.

## 📝 Documentação

- [Setup de Login](docs/LOGIN_SETUP.md)
- [Componentes UI](http://localhost:3000) (Storybook - se configurado)

## 🎨 Customização

### Cores e Tema

Editar `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...}
    }
  }
}
```

### Adicionar Componentes shadcn/ui

```bash
npx shadcn-ui@latest add <component-name>
```

## 🐛 Troubleshooting

### Erro de conexão com backend

```bash
# Verificar se backend está rodando
curl http://localhost:8000/api/v1/health/

# Verificar .env.local
cat .env.local
```

### Erros de build

```bash
# Limpar cache e node_modules
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

## 📞 Suporte

Para problemas ou dúvidas, verificar documentação em `docs/`
