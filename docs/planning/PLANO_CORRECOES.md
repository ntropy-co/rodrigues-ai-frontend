# Plano de Correções - Frontend Verity Agro

## 📋 Resumo Executivo

**Problema Principal**: Múltiplos hooks e componentes estão usando `token` do `useAuth()`, mas o `token` sempre é `null` no `AuthContext` porque o sistema usa cookies HttpOnly. Isso impede que requisições autenticadas funcionem corretamente.

**Solução**: Substituir todas as verificações de `token` por `isAuthenticated` e trocar `fetch` direto por `fetchWithRefresh` para requisições autenticadas.

---

## ✅ Correções Já Realizadas

### Hooks Corrigidos (5/12)
1. ✅ `src/hooks/useProjects.ts` - Completo
2. ✅ `src/hooks/useSessions.ts` - Completo
3. ✅ `src/hooks/useSettings.ts` - Completo
4. ✅ `src/hooks/useCompliance.ts` - Completo
5. ✅ `src/hooks/useCPRAnalysis.ts` - Completo

---

## 🔴 Correções Pendentes - Prioridade ALTA

### 1. Hooks em `src/hooks/` (3 arquivos)

#### 1.1. `src/hooks/useRiskCalculator.ts`
**Status**: ❌ Pendente  
**Problemas**:
- Linha 76: `const { token } = useAuth()` → deve ser `isAuthenticated`
- Linha 91: `if (!token)` → deve ser `if (!isAuthenticated)`
- Linha 107: `Authorization: Bearer ${token}` → remover header, usar `fetchWithRefresh`
- Falta import de `fetchWithRefresh`

**Ações**:
```typescript
// 1. Adicionar import
import { fetchWithRefresh } from '@/lib/auth/token-refresh'

// 2. Substituir
const { isAuthenticated } = useAuth()

// 3. Substituir verificação
if (!isAuthenticated) { ... }

// 4. Trocar fetch por fetchWithRefresh e remover Authorization header
const response = await fetchWithRefresh('/api/cpr/risk/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

---

#### 1.2. `src/hooks/useContracts.ts`
**Status**: ❌ Pendente  
**Problemas**:
- Linha 76: `const { token } = useAuth()` → deve ser `isAuthenticated`
- Linha 84: `if (!token)` → deve ser `if (!isAuthenticated)`
- Linha 130: `if (!token)` → deve ser `if (!isAuthenticated)`
- Linha 175: `if (!token)` → deve ser `if (!isAuthenticated)`
- Linha 121: `}, [token])` → deve ser `}, [isAuthenticated])`
- Já usa `fetchWithRefresh` corretamente ✅

**Ações**:
```typescript
// 1. Substituir
const { isAuthenticated } = useAuth()

// 2. Substituir todas as verificações
if (!isAuthenticated) { ... }

// 3. Atualizar dependências
}, [isAuthenticated])
```

---

#### 1.3. `src/hooks/useAudit.ts`
**Status**: ❌ Pendente  
**Problemas**:
- Linha 58: `const { token } = useAuth()` → deve ser `isAuthenticated`
- Linhas 65, 127, 193, 250, 305, 358, 395: `if (!token)` → deve ser `if (!isAuthenticated)`
- Linhas 389, 426: `}, [token])` → deve ser `}, [isAuthenticated])`
- Já usa `fetchWithRefresh` corretamente ✅

**Ações**:
```typescript
// 1. Substituir
const { isAuthenticated } = useAuth()

// 2. Substituir todas as verificações (7 ocorrências)
if (!isAuthenticated) { ... }

// 3. Atualizar dependências (2 ocorrências)
}, [isAuthenticated])
```

---

### 2. Hooks em `src/features/` (4 arquivos)

#### 2.1. `src/features/settings/hooks/useSettings.ts`
**Status**: ❌ Pendente  
**Problemas**:
- Linha 109: `const { token } = useAuth()` → deve ser `isAuthenticated`
- Linhas 115, 156, 198, 239, 278, 319: `if (!token)` → deve ser `if (!isAuthenticated)`
- Linhas 150, 191: `}, [token])` → deve ser `}, [isAuthenticated])`
- Já usa `fetchWithRefresh` corretamente ✅

**Ações**: Mesmas do `src/hooks/useSettings.ts` (já corrigido na raiz)

---

#### 2.2. `src/features/compliance/hooks/useCompliance.ts`
**Status**: ❌ Pendente  
**Problemas**:
- Linha 91: `const { token } = useAuth()` → deve ser `isAuthenticated`
- Linhas 107, 189: `if (!token)` → deve ser `if (!isAuthenticated)`
- Linhas 128, 210: `Authorization: Bearer ${token}` → remover header, usar `fetchWithRefresh`
- Linha 259: `}, [token])` → deve ser `}, [isAuthenticated])`
- Falta import de `fetchWithRefresh`

**Ações**: Mesmas do `src/hooks/useCompliance.ts` (já corrigido na raiz)

---

#### 2.3. `src/features/cpr/hooks/useCPRCreation.ts`
**Status**: ❌ Pendente  
**Problemas**:
- Linha 123: `const { token } = useAuth()` → deve ser `isAuthenticated`
- Linhas 182, 263: `if (!token)` → deve ser `if (!isAuthenticated)`
- Linhas 204, 288: `Authorization: Bearer ${token}` → remover header, usar `fetchWithRefresh`
- Linhas 252, 339: `[token, ...]` → deve ser `[isAuthenticated, ...]`
- Falta import de `fetchWithRefresh`

**Ações**:
```typescript
// 1. Adicionar import
import { fetchWithRefresh } from '@/lib/auth/token-refresh'

// 2. Substituir
const { isAuthenticated } = useAuth()

// 3. Substituir verificações
if (!isAuthenticated) { ... }

// 4. Trocar fetch por fetchWithRefresh (2 ocorrências)
const response = await fetchWithRefresh('/api/cpr/criar/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ session_id: sessionId })
})

// 5. Atualizar dependências
[isAuthenticated, processResponse]
[isAuthenticated, hookState.state, processResponse]
```

---

#### 2.4. `src/features/cpr/hooks/useCPRAnalysis.ts`
**Status**: ❌ Pendente  
**Problemas**:
- Linha 135: `const { token } = useAuth()` → deve ser `isAuthenticated`
- Linhas 193, 267: `if (!token)` → deve ser `if (!isAuthenticated)`
- Linhas 215, 292: `Authorization: Bearer ${token}` → remover header, usar `fetchWithRefresh`
- Linhas 259, 341: `[token, ...]` → deve ser `[isAuthenticated, ...]`
- Falta import de `fetchWithRefresh`

**Ações**: Mesmas do `src/hooks/useCPRAnalysis.ts` (já corrigido na raiz)

---

### 3. Componentes e Páginas (3 arquivos)

#### 3.1. `src/hooks/useInviteValidation.ts`
**Status**: ❌ Pendente  
**Problemas**:
- Linha 45: `if (!token)` → verificar se é necessário (pode ser token de convite, não auth)
- Linha 94: `}, [token])` → verificar contexto

**Ações**: Analisar se `token` aqui se refere ao token de autenticação ou token de convite

---

#### 3.2. `src/app/invite/[token]/page.tsx`
**Status**: ❌ Pendente  
**Problemas**:
- Linha 258: `if (!token)` → provavelmente é token de convite (URL param), não auth token
- Linha 285: `}, [token, validateInvite])` → verificar contexto

**Ações**: Confirmar se é token de convite (não precisa correção) ou token de auth

---

#### 3.3. `src/app/(auth)/reset-password/page.tsx`
**Status**: ❌ Pendente  
**Problemas**:
- Linhas 42, 70: `if (!token)` → provavelmente é token de reset (URL param), não auth token

**Ações**: Confirmar se é token de reset (não precisa correção) ou token de auth

---

## 🟡 Correções Pendentes - Prioridade MÉDIA

### 4. Rotas de API (Documentação)

**Status**: ⚠️ Apenas documentação  
**Problemas**:
- Múltiplos arquivos em `src/app/api/` têm comentários mencionando `Authorization: Bearer <token>`
- São apenas comentários de documentação, não código executável

**Ações**: 
- Atualizar documentação para mencionar que autenticação é via cookies HttpOnly
- Opcional: adicionar nota sobre não usar header Authorization manualmente

**Arquivos afetados** (apenas comentários):
- `src/app/api/organizations/**/*.ts`
- `src/app/api/settings/**/*.ts`
- `src/app/api/compliance/**/*.ts`
- `src/app/api/cpr/**/*.ts`
- `src/app/api/contracts/**/*.ts`
- `src/app/api/audit/**/*.ts`
- `src/app/api/chat/**/*.ts`
- `src/app/api/admin/**/*.ts`
- `src/app/api/documents/**/*.ts`
- `src/app/api/sessions/**/*.ts`
- `src/app/api/projects/**/*.ts`

---

## 🟢 Verificações Adicionais

### 5. Testes
**Status**: ⚠️ Verificar  
**Problemas**:
- `src/app/api/chat/history/[sessionId]/route.test.ts` - usa `Authorization: 'Bearer test-token'` (mock de teste)
- `src/app/api/chat/[messageId]/feedback/route.test.ts` - usa `Authorization: 'Bearer test-token'` (mock de teste)
- `src/app/api/sessions/[sessionId]/route.test.ts` - usa `Authorization: 'Bearer test-token'` (mock de teste)

**Ações**: 
- Verificar se testes precisam ser atualizados para usar cookies mockados
- Manter como está se são apenas mocks de teste

---

## 📊 Estatísticas

- **Total de arquivos com problemas**: 12
- **Hooks corrigidos**: 5/12 (42%)
- **Hooks pendentes**: 7/12 (58%)
- **Prioridade ALTA**: 7 arquivos
- **Prioridade MÉDIA**: 1 categoria (documentação)
- **Verificações**: 1 categoria (testes)

---

## 🎯 Ordem de Execução Recomendada

1. **Fase 1 - Hooks em `src/hooks/`** (3 arquivos)
   - `useRiskCalculator.ts`
   - `useContracts.ts`
   - `useAudit.ts`

2. **Fase 2 - Hooks em `src/features/`** (4 arquivos)
   - `features/settings/hooks/useSettings.ts`
   - `features/compliance/hooks/useCompliance.ts`
   - `features/cpr/hooks/useCPRCreation.ts`
   - `features/cpr/hooks/useCPRAnalysis.ts`

3. **Fase 3 - Componentes/Páginas** (3 arquivos)
   - Verificar contexto de `useInviteValidation.ts`
   - Verificar contexto de `app/invite/[token]/page.tsx`
   - Verificar contexto de `app/(auth)/reset-password/page.tsx`

4. **Fase 4 - Documentação** (opcional)
   - Atualizar comentários em rotas de API

5. **Fase 5 - Testes** (verificar)
   - Revisar testes que usam Authorization header

---

## ✅ Checklist de Validação

Após cada correção, verificar:
- [ ] Import de `fetchWithRefresh` adicionado (se necessário)
- [ ] `token` substituído por `isAuthenticated`
- [ ] Todas as verificações `if (!token)` atualizadas
- [ ] Headers `Authorization: Bearer ${token}` removidos
- [ ] `fetch` substituído por `fetchWithRefresh` (quando aplicável)
- [ ] Dependências de `useCallback`/`useEffect` atualizadas
- [ ] Sem erros de lint
- [ ] Testes passando (quando aplicável)

---

## 📝 Notas Importantes

1. **Cookies HttpOnly**: O sistema usa cookies HttpOnly para autenticação, então o token não está disponível no JavaScript. Sempre usar `isAuthenticated` para verificar autenticação.

2. **fetchWithRefresh**: Sempre usar `fetchWithRefresh` em vez de `fetch` para requisições autenticadas. Ele lida automaticamente com refresh de tokens via cookies.

3. **Não remover Authorization em rotas de API**: As rotas de API do Next.js (BFF) ainda podem precisar do header Authorization ao fazer proxy para o backend. Verificar cada caso.

4. **Tokens de URL**: Alguns "tokens" em URLs (como `/invite/[token]` ou `/reset-password?token=...`) são tokens de convite/reset, não tokens de autenticação. Não precisam correção.

---

**Última atualização**: 2024-12-19  
**Status geral**: 42% completo (5/12 hooks principais corrigidos)

