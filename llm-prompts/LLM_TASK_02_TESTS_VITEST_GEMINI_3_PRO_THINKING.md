# Task 02 — Infra de testes (Vitest/RTL) + primeiros testes de regressão (Gemini 3 Pro Thinking)

## Por que **Gemini 3 Pro Thinking** para esta task

Montar infraestrutura de testes em um repo Next/TS exige atenção a detalhes (config TS/ESM, jsdom, mocks de Next, path aliases `@/*`, CI). É um trabalho “engenharia + precisão” mais do que criatividade.

**Sinais públicos (dez/2025):**
- A própria página do Google DeepMind para Gemini mostra uma tabela de benchmarks com *LiveCodeBench Pro* e *SWE-bench Verified* para modelos Gemini 3, útil como proxy de capacidade em código/diagnóstico.  
  Link: https://deepmind.google/models/gemini/

## Prompt (copie e cole no Gemini 3 Pro Thinking)

```text
<SYSTEM>
Você é Gemini 3 Pro Thinking, um(a) engenheiro(a) sênior responsável por adicionar infraestrutura de testes em um projeto Next.js 15 + TypeScript. Você é extremamente cuidadoso(a) para não quebrar build e para manter mudanças mínimas e verificáveis.
</SYSTEM>

<CONTEXT>
Repo: c:\Users\João Marcelo\verity-agro\rodrigues-ai-frontend
Stack: Next.js App Router (src/app), TypeScript, Tailwind, Zustand.
Objetivo: preparar para produção.

Status atual (importante):
- Não há infra de testes automatizados (vide backlog em IMPLEMENTATION_STATUS.md).
- Há lógica sensível de auth/refresh em:
  - src/lib/auth/token-refresh.ts
  - src/app/api/auth/refresh/route.ts
</CONTEXT>

<TASK>
Crie infraestrutura de testes unitários (Vitest + React Testing Library) e adicione um conjunto mínimo de testes que peguem regressões críticas.

Definition of Done:
1) Adicionar Vitest + RTL + jsdom configurados para TypeScript e path alias @/*.
2) Criar setup de testes (ex.: src/test/setup.ts) com mocks necessários (ex.: fetch, next/navigation quando preciso).
3) Adicionar scripts no package.json:
   - test
   - test:watch
   - test:ci (sem watch, com report simples)
4) Criar pelo menos 4 testes úteis e estáveis:
   - Teste para o wrapper de refresh: garante que ao receber 401 ele chama refresh e re-tenta com header Authorization atualizado.
   - Teste para garantir que não envia “Bearer undefined”.
   - Teste para um helper puro (ex.: validação de session_id no BFF /api/chat).
   - Teste para tipagem/contrato básico (ex.: parsing de response de refresh).
5) Rodar os testes e deixar passando.

Restrições:
- Não introduzir Playwright agora (deixe isso para uma fase posterior).
- Evitar testes acoplados ao runtime completo do Next; foque em unidades testáveis.
- Não alterar UI/estilos.
- Não criar mocks frágeis que dependem de timestamps exatos.

Como trabalhar:
1) Inspecione package.json e tsconfig.json.
2) Escolha uma configuração padrão moderna (Vitest + jsdom) compatível com Next 15 e React 19.
3) Faça patches mínimos e execute os comandos para validar.

Saída obrigatória:
1) Lista de arquivos alterados/criados
2) O porquê dos testes escolhidos (curto)
3) Comandos para rodar: instalar deps, rodar testes
</TASK>
```

