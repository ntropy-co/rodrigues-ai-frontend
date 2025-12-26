# Task 03 — Web Vitals + Analytics tipado (Gemini 3 Flash)

## Por que **Gemini 3 Flash** para esta task

Essa task é relativamente direta (conectar coletor → `track(...)` tipado, ajustar evento faltante) e tende a exigir várias pequenas edições com baixo risco. **Gemini 3 Flash** é tipicamente melhor quando você quer velocidade/custo e execução rápida de mudanças bem especificadas.

**Sinais públicos (dez/2025):**
- O Google Developers Blog descreve o Gemini 3 Flash como “Pro-grade coding performance with low latency and lower cost”, e menciona SWE-bench Verified.  
  Link: https://developers.googleblog.com/gemini-3-flash-is-now-available-in-gemini-cli/
- A tabela no Google DeepMind (Gemini) inclui SWE-bench Verified para modelos Gemini 3.  
  Link: https://deepmind.google/models/gemini/

## Prompt (copie e cole no Gemini 3 Flash)

```text
Você é Gemini 3 Flash. Execute esta task com foco em rapidez e precisão. Faça mudanças pequenas, compile mentalmente e valide com comandos.

Repo: c:\Users\João Marcelo\verity-agro\rodrigues-ai-frontend

TASK
Consertar e padronizar tracking/analytics:

1) WebVitalsReporter deve coletar e ENVIAR eventos tipados
   - Arquivo: src/components/v2/Monitoring/WebVitalsReporter.tsx
   - Hoje ele só loga e tem comentários.
   - Integre com o wrapper tipado: `track(ANALYTICS_EVENTS.WEB_VITAL_REPORTED, ...)`
     (ver src/lib/analytics/index.ts e src/lib/analytics/events.ts)
   - Respeitar sample rate por env var `NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE` (default 0.1).
   - Não acessar `window` se não existir (garantir segurança em ambiente SSR/hidratação).

2) Corrigir evento de export PDF tipado
   - Hoje: src/lib/export/pdf.ts chama `track('export_pdf_clicked', ...)` mas esse evento não existe em ANALYTICS_EVENTS.
   - Solução esperada: adicionar evento ao enum + tipagem em src/lib/analytics/events.ts, OU trocar para um evento existente (se fizer sentido).
   - Preferência: criar `EXPORT_PDF_CLICKED` em ANALYTICS_EVENTS com propriedades `{ source, format, timestamp }` e usar `track(ANALYTICS_EVENTS.EXPORT_PDF_CLICKED, ...)`.

3) Garantir consistência: não usar trackEvent direto
   - Onde fizer sentido, preferir sempre `track()` do módulo tipado em src/lib/analytics.

REGRAS
- Não altere UI/estilos.
- Não adicione dependências novas.
- Não quebre build.

VALIDAÇÃO
Rode no fim:
- typecheck (tsc --noEmit ou script do projeto)
- busca rápida por `export_pdf_clicked` e por `console.table`/comentários antigos no WebVitalsReporter

SAÍDA
- Liste arquivos alterados.
- Diga exatamente quais comandos rodar.
```

