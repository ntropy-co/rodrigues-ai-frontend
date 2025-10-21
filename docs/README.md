# Rodrigues AI - Frontend

Frontend Next.js para o sistema de crédito agrícola com IA da Rodrigues.

## 🚀 Stack Tecnológica

- **Framework**: Next.js 15+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Gerenciador de Pacotes**: pnpm
- **Node**: 18+
- **Deploy**: Vercel

## 📋 Funcionalidades

- ✅ Chat com IA (integração com backend FastAPI)
- ✅ Upload de documentos com drag & drop
- ✅ Gerenciamento de sessões
- ✅ Interface responsiva e moderna
- ✅ Componentes reutilizáveis (shadcn/ui)

## 🛠️ Setup Local

### Requisitos

- Node.js 18+
- pnpm 8+

### Instalação

```bash
# Clonar repositório
git clone https://github.com/PabloBispo/rodrigues-ai-frontend.git
cd rodrigues-ai-frontend

# Instalar dependências
pnpm install

# Copiar arquivo de ambiente
cp .env.example .env.local

# Editar .env.local com a URL do backend
```

### Rodar em Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Aplicação disponível em http://localhost:3000
```

### Build de Produção

```bash
# Criar build otimizado
pnpm build

# Rodar em modo produção
pnpm start
```

## 🚀 Deploy na Vercel

### 1. Conectar Repositório GitHub

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Importe `PabloBispo/rodrigues-ai-frontend`
4. Configure as variáveis de ambiente
5. Clique em **"Deploy"**

### 2. Variáveis de Ambiente na Vercel

No dashboard da Vercel, adicione:

```
NEXT_PUBLIC_API_URL=https://rodrigues-ai-backend-production.up.railway.app
```

### 3. Deploy Automático

- Cada push na branch `master` faz deploy automático
- Preview deployments em pull requests
- Rollback instantâneo se necessário

## 📁 Estrutura do Projeto

```
.
├── src/
│   ├── app/              # App Router (Next.js 15)
│   ├── components/       # Componentes React
│   │   ├── ui/          # shadcn/ui components
│   │   ├── Chat/        # Componentes de chat
│   │   ├── FileUpload/  # Upload de documentos
│   │   └── ...
│   ├── lib/             # Utilitários e helpers
│   └── styles/          # Estilos globais
├── public/              # Arquivos estáticos
├── next.config.ts       # Configuração Next.js
├── tailwind.config.ts   # Configuração Tailwind
└── package.json         # Dependências
```

## 🔐 Variáveis de Ambiente

| Variável              | Descrição              | Obrigatória |
| --------------------- | ---------------------- | ----------- |
| `NEXT_PUBLIC_API_URL` | URL do backend FastAPI | ✅          |

**Nota:** Variáveis com prefixo `NEXT_PUBLIC_` são expostas no browser.

**Produção:**

- Backend: `https://rodrigues-ai-backend-production.up.railway.app`

**Desenvolvimento local:**

- Backend: `http://localhost:8000`

## 🧪 Testes

```bash
# Lint
pnpm lint

# Type check
pnpm type-check

# Format
pnpm format
```

## 🔧 Desenvolvimento

### Adicionar Dependência

```bash
pnpm add nome-do-pacote
```

### Adicionar Componente shadcn/ui

```bash
npx shadcn@latest add button
```

## 🐛 Troubleshooting

### Erro de conexão com backend

Verifique se:

- Backend está rodando em Railway
- `NEXT_PUBLIC_API_URL` está correta
- CORS está configurado no backend para aceitar origem da Vercel

### Build falha na Vercel

```bash
# Testar build localmente
pnpm build

# Verificar logs na Vercel Dashboard
```

### Variáveis de ambiente não funcionam

- Lembre-se de adicionar `NEXT_PUBLIC_` no prefixo
- Redeploy após adicionar variáveis na Vercel
- Limpar cache do navegador

## 📝 Licença

Proprietário - Rodrigues Agro

## 🤝 Contribuindo

Este é um projeto privado. Contate a equipe para mais informações.

## 📧 Contato

- **Projeto**: [github.com/PabloBispo/rodrigues-ai-frontend](https://github.com/PabloBispo/rodrigues-ai-frontend)
- **Backend**: [github.com/PabloBispo/rodrigues-ai-backend](https://github.com/PabloBispo/rodrigues-ai-backend)
- **Deploy**: Vercel (automático via GitHub)
