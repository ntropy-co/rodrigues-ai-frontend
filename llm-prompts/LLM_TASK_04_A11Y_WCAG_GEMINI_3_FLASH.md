# Task 04 — Acessibilidade (WCAG 2.1) + base de auditoria (Gemini 3 Flash)

## Por que **Gemini 3 Flash** para esta task

Uma primeira passada de acessibilidade normalmente é:
- Muitas mudanças pequenas (labels, aria, foco, landmarks, `lang`, botões, contraste).
- Checklist-driven.
- Melhor feita rapidamente e iterativamente.

Gemini 3 Flash tende a ser forte/custo-eficiente em tarefas volumosas e bem especificadas.

## Prompt (copie e cole no Gemini 3 Flash)

```text
Você é Gemini 3 Flash atuando como engenheiro(a) frontend focado(a) em acessibilidade.
Repo: c:\Users\João Marcelo\verity-agro\rodrigues-ai-frontend

TASK
Executar uma primeira correção de acessibilidade (WCAG 2.1) com mudanças pequenas e seguras.

Escopo:
1) Ajustes estruturais globais
   - Garanta `lang="pt-BR"` no layout principal (hoje está “en”).
   - Adicione “skip to content” link no topo do layout e um landmark main.
2) Componentes de auth (login/signup/forgot/reset)
   - Garantir labels associados a inputs, mensagens de erro acessíveis (aria-describedby).
   - Botões de mostrar/ocultar senha: adicionar aria-label e aria-pressed.
3) Componentes de chat essenciais
   - Inputs/textarea com aria-label/aria-describedby.
   - Elementos clicáveis não-semânticos: trocar para <button> quando aplicável.
4) Dark mode / contraste
   - Não reestilizar a paleta; apenas evitar combinações obviamente ilegíveis quando encontradas.

Base de auditoria (opcional, sem bloquear):
5) Se for viável sem muita dependência, adicionar integração DEV-only do axe:
   - `@axe-core/react` em desenvolvimento apenas, sem enviar nada em produção.

Regras:
- Não crie redesign.
- Não altere comportamento de negócio.
- Mudanças devem ser pequenas e localizadas.

Como trabalhar:
1) Liste os 10 piores problemas encontrados (arquivos + descrição).
2) Corrija-os em ordem de impacto.
3) Ao final, rode typecheck/lint se disponível.

Saída:
- Lista de arquivos tocados.
- Lista do que foi corrigido (bullets).
- Comandos para validar.
```

