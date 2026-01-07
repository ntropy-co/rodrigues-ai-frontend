# Task 01 — Corrigir contrato de Refresh Token (Claude Opus 4.5 Thinking)

## Por que **Claude Opus 4.5 Thinking** para esta task

Esta task envolve correção de um bug de contrato entre BFF e cliente que pode causar `Bearer undefined`. Exige raciocínio "end-to-end" e refactor cuidadoso.

## Status Atual do Código (Dezembro 2025)

### BUG IDENTIFICADO: Mismatch de contrato

**BFF retorna** (`src/app/api/auth/refresh/route.ts`, linhas 80-87):
```typescript
{
  token: tokenData.access_token,      // ← Campo diferente!
  refreshToken: tokenData.refresh_token,
  expiresAt
}
```

**Cliente espera** (`src/lib/auth/token-refresh.ts`, linhas 21-25):
```typescript
interface RefreshResponse {
  access_token: string    // ← Espera este nome!
  refresh_token: string   // ← Espera este nome!
  token_type: string
}
```

**Resultado:** O cliente tenta acessar `data.access_token` mas recebe `data.token`, resultando em `Authorization: Bearer undefined`.

### O que NÃO precisa mais ser feito

O prompt original mencionava "unificar auth duplicado", mas o `useAuthHook.ts` já é um hook bem estruturado e funcional. **Não é necessário removê-lo ou refatorá-lo.**

## Prompt Atualizado (copie e cole no Claude Opus 4.5 Thinking)

```text
Você é Claude Opus 4.5 Thinking atuando como engenheiro(a) sênior de frontend/Next.js.

OBJETIVO
Corrigir o bug de contrato no fluxo de refresh token que causa `Bearer undefined`.

REPO
- Caminho: c:\Users\João Marcelo\verity-agro\rodrigues-ai-frontend
- Stack: Next.js App Router + rotas BFF em src/app/api/**/route.ts

BUG ESPECÍFICO A CORRIGIR
O BFF em `src/app/api/auth/refresh/route.ts` retorna:
  { token, refreshToken, expiresAt }

O cliente em `src/lib/auth/token-refresh.ts` espera:
  { access_token, refresh_token, token_type }

SOLUÇÃO RECOMENDADA
Alterar o BFF para retornar o contrato que o cliente espera:
  { access_token, refresh_token, token_type: "bearer" }

ARQUIVOS A MODIFICAR
1) `src/app/api/auth/refresh/route.ts` — Alterar resposta (linhas 80-87)

ARQUIVOS A VERIFICAR (não modificar se OK)
- `src/lib/auth/token-refresh.ts` — Já está correto
- `src/hooks/useAuthHook.ts` — Usar como referência para entender o fluxo

REQUISITOS (Definition of Done)
1) O BFF retorna `{ access_token, refresh_token, token_type: "bearer" }`
2) O cliente consegue fazer refresh e re-executar requests com token válido
3) Não há cenário onde `Bearer undefined` seja enviado
4) Não alterar `useAuthHook.ts` (já está funcional)

VALIDAÇÃO
1) Rode typecheck: `npx tsc --noEmit`
2) Busque por usos de `.token` vs `.access_token` para garantir consistência

SAÍDA (formato obrigatório)
1) "Mudança aplicada" com diff do arquivo
2) "Como validar" com passos manuais
3) "Riscos" se houver
```

---

*Atualizado em: 2025-12-26*
