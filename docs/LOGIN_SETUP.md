# Sistema de Login - Rodrigues AI

## Visão Geral

O sistema de autenticação está **completamente implementado e pronto para uso**! Inclui login, registro, logout e proteção de rotas com JWT.

## Arquitetura

### Backend (FastAPI)
- **Rotas**: `/api/v1/auth/*`
  - `POST /auth/register` - Criar nova conta
  - `POST /auth/login` - Fazer login (retorna JWT token)
  - `GET /auth/me` - Obter dados do usuário atual
  - `POST /auth/logout` - Fazer logout
- **Segurança**: JWT tokens com bcrypt para senhas
- **Banco de dados**: PostgreSQL com SQLModel

### Frontend (Next.js)
- **Página de login**: `/login`
- **Contexto**: `AuthContext` para gerenciar estado de autenticação
- **UI**: Interface moderna com modo claro/escuro
- **Proteção**: Redirecionamento automático se já autenticado

## Configuração

### 1. Banco de Dados PostgreSQL

Inicie o PostgreSQL (usando Docker):

```bash
docker run -d \
  --name rodrigues-postgres \
  -e POSTGRES_USER=rodrigues_agro_user \
  -e POSTGRES_PASSWORD=rodrigues_agro_password_change_in_production \
  -e POSTGRES_DB=rodrigues_agro_db \
  -p 5432:5432 \
  postgres:15
```

Ou use sua instalação local do PostgreSQL e crie o banco de dados:

```sql
CREATE DATABASE rodrigues_agro_db;
CREATE USER rodrigues_agro_user WITH PASSWORD 'rodrigues_agro_password_change_in_production';
GRANT ALL PRIVILEGES ON DATABASE rodrigues_agro_db TO rodrigues_agro_user;
```

### 2. Variáveis de Ambiente

Os arquivos `.env` já foram criados. **Importante**: Altere as senhas e chaves secretas antes de usar em produção!

#### Backend (`backend/.env`)
```env
POSTGRES_SERVER=localhost
POSTGRES_USER=rodrigues_agro_user
POSTGRES_PASSWORD=rodrigues_agro_password_change_in_production
POSTGRES_DB=rodrigues_agro_db
POSTGRES_PORT=5432

SECRET_KEY=change-this-to-a-random-secret-key-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=11520  # 8 dias
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Instalar Dependências

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### 4. Iniciar Aplicação

#### Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

O banco de dados será inicializado automaticamente na primeira execução!

#### Frontend
```bash
cd frontend
npm run dev
```

## Como Usar

### 1. Acessar a Tela de Login

Navegue para: `http://localhost:3000/login`

### 2. Criar uma Conta

1. Clique na aba "Registrar"
2. Preencha:
   - Nome Completo (opcional)
   - Email
   - Senha (mínimo 8 caracteres)
   - Confirmar Senha
3. Clique em "Criar Conta"
4. Você será automaticamente logado e redirecionado para a página principal

### 3. Fazer Login

1. Na aba "Login"
2. Digite email e senha
3. Clique em "Entrar"
4. Redirecionamento automático após sucesso

### 4. Logout

Use a função `logout()` do `useAuth()` em qualquer componente:

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { logout } = useAuth()

  return (
    <button onClick={logout}>Sair</button>
  )
}
```

## Proteção de Rotas

### Frontend - Proteger Páginas

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) return <div>Carregando...</div>
  if (!isAuthenticated) return null

  return <div>Conteúdo protegido</div>
}
```

### Backend - Proteger Endpoints

```python
from app.core.deps import CurrentUser

@router.get('/protected')
def protected_route(current_user: CurrentUser):
    """Rota protegida - requer autenticação"""
    return {"message": f"Olá {current_user.email}!"}
```

## Funcionalidades Implementadas

✅ **Registro de Usuários**
- Validação de email único
- Hash de senha com bcrypt
- Campos: email, senha, nome completo (opcional)

✅ **Login**
- Autenticação via email/senha
- Geração de JWT token
- Token válido por 8 dias

✅ **Gerenciamento de Sessão**
- Token armazenado em localStorage
- Auto-login ao recarregar página
- Logout limpa token

✅ **Proteção de Rotas**
- Backend: Middleware de autenticação JWT
- Frontend: Context API + redirecionamento

✅ **UI/UX**
- Interface moderna e responsiva
- Dark mode
- Estados de loading
- Mensagens de erro/sucesso (toast)
- Validação de formulários

## Estrutura de Arquivos

```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       └── auth.py          # Rotas de autenticação
│   ├── core/
│   │   ├── config.py            # Configurações
│   │   ├── db.py                # Database setup
│   │   ├── deps.py              # Dependências (auth middleware)
│   │   └── security.py          # JWT e hash de senha
│   ├── models/
│   │   └── user.py              # Modelos de usuário
│   └── main.py                  # App principal
└── .env                         # Variáveis de ambiente

frontend/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx         # Página de login
│   │   └── layout.tsx           # Layout com AuthProvider
│   ├── contexts/
│   │   └── AuthContext.tsx      # Context de autenticação
│   ├── lib/
│   │   └── auth-api.ts          # API client
│   └── types/
│       └── auth.ts              # TypeScript types
└── .env.local                   # Variáveis de ambiente
```

## API Endpoints

### POST `/api/v1/auth/register`
Criar nova conta de usuário.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "full_name": "Nome Completo"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Nome Completo",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2024-01-01T00:00:00"
}
```

### POST `/api/v1/auth/login`
Fazer login e obter token.

**Request:** `application/x-www-form-urlencoded`
```
username=user@example.com&password=senha123
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### GET `/api/v1/auth/me`
Obter dados do usuário atual (requer autenticação).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Nome Completo",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2024-01-01T00:00:00"
}
```

### POST `/api/v1/auth/logout`
Fazer logout (apenas limpa token no cliente).

**Response:** `200 OK`
```json
{
  "message": "Successfully logged out"
}
```

## Segurança

### Boas Práticas Implementadas

✅ **Senhas**
- Hash com bcrypt (salt rounds automático)
- Mínimo 8 caracteres
- Nunca armazenadas em texto puro

✅ **JWT Tokens**
- Assinatura com SECRET_KEY
- Expiração configurável (padrão: 8 dias)
- Validação em cada requisição

✅ **CORS**
- Configurado para aceitar apenas origins permitidas
- Credentials habilitado para cookies/headers

✅ **Validação**
- Pydantic no backend
- TypeScript no frontend
- Sanitização de inputs

### Para Produção

**IMPORTANTE**: Antes de fazer deploy:

1. **Altere SECRET_KEY**: Gere uma chave aleatória forte
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Altere POSTGRES_PASSWORD**: Use senha forte e única

3. **Configure HTTPS**: Use certificado SSL/TLS

4. **Configure CORS**: Apenas origins da produção

5. **Reduza ACCESS_TOKEN_EXPIRE_MINUTES**: Considere 60-1440 minutos

6. **Ative rate limiting**: Proteja contra brute force

7. **Configure logs**: Monitore tentativas de login

## Troubleshooting

### Erro: "Could not connect to database"
- Verifique se PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste conexão: `psql -h localhost -U rodrigues_agro_user -d rodrigues_agro_db`

### Erro: "CORS policy blocked"
- Verifique `BACKEND_CORS_ORIGINS` no backend
- Confirme que frontend está em `http://localhost:3000`

### Erro: "Token expired"
- Faça logout e login novamente
- Verifique `ACCESS_TOKEN_EXPIRE_MINUTES`

### UI não atualiza após login
- Verifique console do navegador
- Confirme que `NEXT_PUBLIC_API_URL` está correto
- Limpe localStorage: `localStorage.clear()`

## Próximos Passos

Funcionalidades adicionais que você pode implementar:

- [ ] Recuperação de senha (esqueci minha senha)
- [ ] Verificação de email
- [ ] Login com redes sociais (OAuth)
- [ ] 2FA (autenticação de dois fatores)
- [ ] Gerenciamento de sessões (múltiplos dispositivos)
- [ ] Auditoria de login (histórico)
- [ ] Rate limiting
- [ ] CAPTCHA contra bots

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs do backend e frontend
2. Consulte a documentação da API em `http://localhost:8000/docs`
3. Revise este documento

---

**Sistema desenvolvido e pronto para uso!** 🎉
