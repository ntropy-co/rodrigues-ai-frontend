# Task 01 — Corrigir Auth/Refresh e unificar a autenticação (Claude Opus 4.5 Thinking)

## Por que **Claude Opus 4.5 Thinking** para esta task

Esta é a task mais arriscada para produção porque envolve sessão, refresh token, consistência de estado e múltiplos pontos de chamada (BFF + client). Ela exige:

- Raciocínio “end-to-end” (contrato BFF ↔ client ↔ cookies ↔ estado React).
- Refactor multi-arquivo com mínimo risco de regressão.
- Capacidade forte em correção de bugs em bases reais (estilo SWE-bench).

**Sinais públicos (dez/2025):**
- DeepLearning.AI (The Batch) descreve o Opus 4.5 como forte em “agentic workflows” e discute desempenho em *Terminal-Bench Hard* e *SWE-bench Verified* (comparando com Sonnet 4.5), além de eficiência de tokens.  
  Link: https://www.deeplearning.ai/the-batch/claude-opus-4-5-retakes-the-coding-crown-at-one-third-the-price-of-its-predecessor/

## Prompt (copie e cole no Claude Opus 4.5 Thinking)

```text
Você é Claude Opus 4.5 Thinking atuando como engenheiro(a) sênior de frontend/Next.js e responsável por preparar este repositório para produção.

OBJETIVO
Corrigir de forma definitiva o fluxo de autenticação e refresh token e eliminar duplicidade de fontes de verdade de auth.

REPO
- Caminho do repo: c:\Users\João Marcelo\verity-agro\rodrigues-ai-frontend
- Stack: Next.js App Router + rotas BFF em src/app/api/**/route.ts

CONTEXTO (PROBLEMAS JÁ IDENTIFICADOS)
1) Refresh token quebrado por contrato divergente:
   - O client em `src/lib/auth/token-refresh.ts` espera JSON `{ access_token, refresh_token }`.
   - O BFF em `src/app/api/auth/refresh/route.ts` devolve `{ token, refreshToken, expiresAt }`.
   - Resultado: ao receber 401 e tentar refresh, o código faz retry com `Authorization: Bearer undefined`.
2) Autenticação duplicada e divergente:
   - Existe `src/contexts/AuthContext.tsx` (contexto usado no app) e `src/hooks/useAuthHook.ts` (hook paralelo).
   - Páginas usam ambos (ex.: `src/app/(auth)/forgot-password/page.tsx` usa `useAuthHook`).
3) Chamadas autenticadas às vezes não usam `fetchWithRefresh`, então 401 não é recuperado automaticamente (ex.: chat em `src/hooks/useAIStreamHandler.tsx`).

REQUISITOS (Definition of Done)
1) Refresh funciona end-to-end:
   - Ao receber 401 em uma request autenticada, o sistema tenta refresh, atualiza token e reexecuta a request com Authorization correto.
   - Não pode haver cenário onde `Bearer undefined` seja enviado.
2) Uma única fonte de verdade de auth:
   - O app deve expor apenas um caminho recomendado (`useAuth` do contexto) e remover/encapsular o hook paralelo.
   - Todas as páginas de auth (login, signup, forgot-password, reset-password) devem usar a mesma camada.
3) Padronização de requests autenticadas:
   - Requests do frontend devem usar um wrapper único (ex.: `fetchWithRefresh`) OU um `apiClient` comum, para garantir refresh e headers consistentes.
4) Sem mudanças desnecessárias:
   - Não refatorar UI/estilos.
   - Não renomear arquivos sem motivo.
   - Não introduzir novas dependências pesadas sem necessidade.
5) Segurança:
   - Não logar tokens em produção.
   - Não salvar segredos em arquivos.

ESTRATÉGIA OBRIGATÓRIA
Siga exatamente esta abordagem:
1) Inspecione os arquivos relevantes (liste-os explicitamente):
   - `src/lib/auth/token-refresh.ts`
   - `src/app/api/auth/refresh/route.ts`
   - `src/lib/auth/api.ts`
   - `src/contexts/AuthContext.tsx`
   - `src/hooks/useAuthHook.ts`
   - `src/hooks/useAIStreamHandler.tsx`
   - `src/app/(auth)/**/page.tsx`
2) Proponha a solução com um contrato único para refresh:
   - Decida se o BFF deve retornar `{ access_token, refresh_token }` OU se o client deve aceitar `{ token, refreshToken }`.
   - Escolha a opção que minimiza mudanças e reduz risco de regressão.
3) Execute a mudança completa com patches (multi-arquivo), garantindo consistência.
4) Garanta migração limpa:
   - Se `useAuthHook` permanecer, deve ser um wrapper fino que delega ao contexto (sem lógica duplicada).
   - Se for removido, atualize imports.
5) Validação:
   - Rode typecheck/lint/test (o que existir no repo) e corrija erros que você introduzir.

AMBIENTE / FERRAMENTAS
Você tem acesso para:
- Ler e editar arquivos.
- Rodar comandos (PowerShell).
- Instalar dependências se precisar.
Não faça git commit.

SAÍDA (formato obrigatório)
1) “Plano curto” (3–6 bullets)
2) “Mudanças aplicadas” com lista de arquivos tocados
3) “Como validar” com comandos exatos (PowerShell) e o que esperar
4) “Riscos/assunções” (se houver)

COMECE AGORA.
```

