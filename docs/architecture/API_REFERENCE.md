# 🔌 API Routes (BFF)

O frontend implementa o padrão **Backend-for-Frontend (BFF)** usando Next.js API Routes.

## Por que BFF?

- ✅ Oculta URL do backend real
- ✅ Adiciona rate limiting e CSRF
- ✅ Transforma contratos de API
- ✅ Gerencia autenticação

## Rotas Disponíveis

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login do usuário |
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Renova token |
| GET | `/api/auth/me` | Dados do usuário |
| POST | `/api/auth/forgot-password` | Esqueci senha |
| POST | `/api/auth/reset-password` | Reset senha |

### Chat

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/chat` | Enviar mensagem |
| POST | `/api/chat/[messageId]/feedback` | Feedback (like/dislike) |

### Documentos

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/documents/upload` | Upload de arquivo |
| GET | `/api/documents/[documentId]` | Detalhes do documento |
| GET | `/api/documents/[documentId]/download` | Download |
| GET | `/api/documents/conversation` | Docs por sessão |

### Sessões

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/sessions` | Listar sessões |
| POST | `/api/sessions` | Criar sessão |
| GET | `/api/sessions/[sessionId]` | Detalhes |
| DELETE | `/api/sessions/[sessionId]` | Deletar |

## Estrutura de uma Route

```typescript
// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

export async function POST(request: NextRequest) {
  // 1. Verificar auth
  const auth = request.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // 2. Validar input
  const body = await request.json()
  
  // 3. Proxy para backend
  const response = await fetch(`${BACKEND_URL}/api/v1/chat/`, {
    method: 'POST',
    headers: { 'Authorization': auth },
    body: JSON.stringify(body)
  })
  
  // 4. Retornar resposta
  return NextResponse.json(await response.json())
}
```

## Rate Limiting

Configurado em `src/middleware.ts`:
- **20 requests / 10 segundos** por IP
- Usa Upstash Redis
