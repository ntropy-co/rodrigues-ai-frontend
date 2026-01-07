# Task 07 — Exportação real de PDF (Claude Opus 4.5 Thinking)

## Por que **Claude Opus 4.5 Thinking** para esta task

Exportar PDF “de verdade” costuma ser cheio de edge cases (fontes, quebras de página, renderização consistente, segurança, server vs client, tamanhos, internacionalização). Exige decisões de arquitetura e implementação cuidadosa.

**Sinal público (dez/2025):**
- DeepLearning.AI (The Batch) descreve Opus 4.5 com foco em agentic workflows e tasks de engenharia mais difíceis, o que tende a ajudar em integrações complexas e decisões de arquitetura.  
  Link: https://www.deeplearning.ai/the-batch/claude-opus-4-5-retakes-the-coding-crown-at-one-third-the-price-of-its-predecessor/

## Prompt (copie e cole no Claude Opus 4.5 Thinking)

```text
Você é Claude Opus 4.5 Thinking. Atue como engenheiro(a) senior para implementar exportação de PDF em produção no Next.js.

Repo: c:\Users\João Marcelo\verity-agro\rodrigues-ai-frontend

CONTEXT
- Hoje o projeto usa `window.print()` como “Export PDF”:
  - `src/lib/export/pdf.ts`
- Backlog pede “PDF Export Real”.

TASK
Substituir `window.print()` por exportação de PDF real (download de arquivo) com UX consistente e qualidade aceitável.

Requisitos:
1) O usuário clica “Exportar PDF” e recebe um arquivo .pdf baixado.
2) Suportar pelo menos os dois casos que já usam export:
   - TemplateGenerator
   - RiskCalculator
3) Não quebrar CSP nem PWA.
4) Manter dependências sob controle:
   - Se escolher lib client-side (ex.: html2pdf.js / jsPDF), explique tradeoffs.
   - Se escolher server-side (ex.: pdfkit / playwright PDF / headless), explique tradeoffs e impacto de infra.
5) Implementar com uma API clara:
   - `exportToPdf({ source, filename?, htmlNode? ... })` ou equivalente.

Estratégia obrigatória:
1) Primeiro, proponha 2 opções (client-side vs server-side) e escolha UMA com justificativa curta (produção).
2) Implemente a opção escolhida com mudanças mínimas.
3) Atualize os pontos de chamada atuais para usar a nova implementação.
4) Adicione um fallback seguro (mensagem/erro) se a geração falhar.
5) Valide com build/typecheck.

Restrições:
- Não reescrever UI.
- Não adicionar serviço externo.
- Não exigir login diferente.

Saída obrigatória:
1) Decisão (client vs server) + 5 bullets de porquê.
2) Arquivos alterados.
3) Comandos para validar e um mini “como testar manualmente”.
```

