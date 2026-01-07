# Guia rapido de prompts (frontend)

Atualizado: 2025-12-26

Este repo passou por limpeza de prompts. Os arquivos antigos de sprint foram removidos ou arquivados.

Arquivos principais:
- `IMPLEMENTATION_STATUS.md` (status do que ja foi feito e o que falta)
- `docs/archived/PROMPTS_GEMINI_CLAUDE.md` (backlog pendente + prompts consolidados)
- `llm-prompts/` (prompts prontos por task)

Inicio rapido
1) Veja o status em `IMPLEMENTATION_STATUS.md`.
2) Se houver uma task correspondente em `llm-prompts/`, use aquele arquivo.
3) Se nao houver task especifica, use o prompt consolidado em `docs/archived/PROMPTS_GEMINI_CLAUDE.md`.

Tasks prontas (copie e cole o prompt inteiro do arquivo)
| Task | Modelo | Objetivo | Arquivo |
| --- | --- | --- | --- |
| 01 | Claude Opus 4.5 Thinking | Auth/refresh e unificacao de autenticacao | `llm-prompts/LLM_TASK_01_AUTH_REFRESH_CLAUDE_OPUS_4_5.md` |
| 02 | Gemini 3 Pro Thinking | Infra de testes (Vitest/RTL) | `llm-prompts/LLM_TASK_02_TESTS_VITEST_GEMINI_3_PRO_THINKING.md` |
| 03 | Gemini 3 Flash | Web Vitals + analytics tipado | `llm-prompts/LLM_TASK_03_ANALYTICS_WEBVITALS_GEMINI_3_FLASH.md` |
| 04 | Gemini 3 Flash | Acessibilidade (WCAG 2.1) | `llm-prompts/LLM_TASK_04_A11Y_WCAG_GEMINI_3_FLASH.md` |
| 05 | Gemini 3 Pro Thinking | Bundle analyzer + perf | `llm-prompts/LLM_TASK_05_BUNDLE_ANALYZER_PERF_GEMINI_3_PRO_THINKING.md` |
| 06 | Gemini 3 Flash | Diff Viewer | `llm-prompts/LLM_TASK_06_DIFF_VIEWER_GEMINI_3_FLASH.md` |
| 07 | Claude Opus 4.5 Thinking | Exportacao real de PDF | `llm-prompts/LLM_TASK_07_PDF_EXPORT_REAL_CLAUDE_OPUS_4_5.md` |

Como usar um prompt
- Copie o prompt completo do arquivo.
- Use o modelo indicado no titulo.
- Peça saida em patch (unified diff) e comandos de validacao alinhados ao `package.json`.

Observacao
- Se precisar de historico, consulte `docs/archived/`.
