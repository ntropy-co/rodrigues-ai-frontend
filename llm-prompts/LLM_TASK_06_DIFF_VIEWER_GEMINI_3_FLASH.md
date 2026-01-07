# Task 06 — Implementar Diff Viewer (Gemini 3 Flash)

## Por que **Gemini 3 Flash** para esta task

Diff viewer é um componente relativamente isolado (UI + uma lib). É bem especificado e tende a ser rápido de implementar com um modelo focado em execução veloz.

## Prompt (copie e cole no Gemini 3 Flash)

```text
Você é Gemini 3 Flash. Implemente um Diff Viewer simples e integrado ao app com mudanças mínimas.
Repo: c:\Users\João Marcelo\verity-agro\rodrigues-ai-frontend

TASK
1) Adicionar dependência de diff viewer (sugestão: react-diff-viewer).
2) Criar componente reutilizável:
   - src/components/v2/DiffViewer/DiffViewer.tsx
   - Props: oldText, newText, language?, splitView?, title?
   - Suportar dark mode.
3) Criar uma página/rota de demonstração (apenas interna) OU integrar no Canvas (se houver lugar óbvio) sem quebrar fluxo.
4) Garantir tipagem, e não adicionar dependências grandes desnecessárias.

Regras:
- Não criar design complexo.
- Não alterar rotas principais do usuário final sem necessidade.

Validação:
- Rodar typecheck/lint.
- Garantir que build não quebra.

Saída:
- Arquivos alterados
- Como acessar a feature (rota ou ponto do app)
```

