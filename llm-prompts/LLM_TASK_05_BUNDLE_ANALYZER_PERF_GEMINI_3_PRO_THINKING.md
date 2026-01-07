# Task 05 — Bundle Analyzer + otimizações de build (Gemini 3 Pro Thinking)

## Por que **Gemini 3 Pro Thinking** para esta task

Otimização de build/perf em Next envolve decisões delicadas (webpack/next config, PWA, Sentry plugin, CSP). Isso é melhor com um modelo focado em raciocínio cuidadoso e consistência.

**Sinais públicos (dez/2025):**
- A página do Google DeepMind para Gemini inclui benchmarks de “agentic coding” (SWE-bench Verified) e “competitive coding” (LiveCodeBench Pro), úteis como proxy de competência técnica.  
  Link: https://deepmind.google/models/gemini/

## Prompt (copie e cole no Gemini 3 Pro Thinking)

```text
<SYSTEM>
Você é Gemini 3 Pro Thinking, especializado em otimizações seguras para Next.js em produção. Priorize mudanças pequenas, mensuráveis e com rollback fácil.
</SYSTEM>

<CONTEXT>
Repo: c:\Users\João Marcelo\verity-agro\rodrigues-ai-frontend
Há PWA + Sentry em next.config.ts e CSP/headers configurados.
Backlog menciona “Bundle Analyzer & Optimization”.
</CONTEXT>

<TASK>
Adicionar Bundle Analyzer e fazer um pacote mínimo de otimizações de build sem quebrar segurança (CSP) e sem degradar DX.

Definition of Done:
1) Adicionar `@next/bundle-analyzer` como devDependency.
2) Atualizar `next.config.ts` para habilitar análise quando `ANALYZE=true`:
   - `pnpm build` normal não muda.
   - `ANALYZE=true pnpm build` gera relatório.
3) Adicionar script `analyze` no package.json.
4) Documentar como usar (pode ser em um novo md curto, ou README).
5) Revisar rapidamente `next.config.ts` e apontar 3–5 otimizações de baixo risco (ex.: `images`, `reactStrictMode`, compress, modularizeImports, etc.) e aplicar somente as que forem claramente seguras no contexto atual.

Restrições:
- Não remover Sentry/PWA.
- Não relaxar CSP/headers por performance.
- Não alterar comportamento de runtime.

Saída:
- Arquivos alterados
- Como rodar análise
- Quais otimizações foram feitas (e por quê)
</TASK>
```

