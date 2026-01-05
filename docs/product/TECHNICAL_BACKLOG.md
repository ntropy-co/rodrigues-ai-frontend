# 🚀 Backlog Técnico e Prompts Pendentes (2025-12-26)

Este documento contém os prompts otimizados para as tarefas que ainda **não foram implementadas** ou que requerem **integração/refinamento**.

## 📊 Análise de Modelos (Resumo)

| Tipo de Tarefa                   | Modelo Recomendado  | Por quê                                   |
| :------------------------------- | :------------------ | :---------------------------------------- |
| **Arquitetura / Segurança / QA** | **Claude Opus 4.5** | Raciocínio profundo e análise sistemática |
| **Componentes UI / Integração**  | **Gemini 3 Pro**    | Execução rápida de React e Tailwind       |

---

## 🛠️ PENDENTES - CRÍTICOS & ALTO IMPACTO

### 📝 ISSUE #202 - Performance & Bundle Optimization

**Modelo:** Claude Opus 4.5
**Status:** Pendente (Configuração de Analyzer + Otimizações)

```markdown
[SYSTEM - Claude Opus 4.5]
Voce e um(a) engenheiro(a) senior de Frontend/Performance (Next.js/React).
Saida: Plano (3-7 passos) + Patch em unified diff + Comandos de verificacao.

[USER]

# Performance Optimization & Bundle Size Reduction

1. Configurar @next/bundle-analyzer no next.config.ts.
2. Identificar e reduzir dependências pesadas (lucide-react, framer-motion).
3. Implementar Dynamic Imports para componentes pesados (Recharts, Modais).
4. Otimizar imagens e fontes usando as APIs nativas do Next.js.
5. Implementar Web Vitals tracking para monitorar LCP, INP e CLS.
```

---

### 📝 ISSUE #201 - Acessibilidade WCAG 2.1 AA

**Modelo:** Claude Opus 4.5
**Status:** Pendente

```markdown
[SYSTEM - Claude Opus 4.5]
Voce e um(a) engenheiro(a) senior focado em acessibilidade (WCAG).
Saida: Patch em unified diff + Checklist de validacao a11y.

[USER]

# Implementar Acessibilidade WCAG 2.1 AA

1. Audit inicial usando axe-core.
2. Corrigir contraste de cores em toda a UI.
3. Garantir que todos os elementos interativos sejam acessíveis por teclado.
4. Implementar Focus Trap em modais (especialmente FileUploadModal).
5. Adicionar ARIA labels e roles semânticos onde necessário (ChatInput, Sidebars).
6. Implementar Skip Links para navegação rápida.
```

---

### 📝 ISSUE #162 - Testes Automatizados (Epic)

**Modelo:** Claude Opus 4.5
**Status:** Não Iniciado

```markdown
[SYSTEM - Claude Opus 4.5]
Voce e um(a) engenheiro(a) senior de Frontend/QA especialista em Vitest e Playwright.

[USER]

# Implementar Infraestrutura de Testes

1. Configurar Vitest + React Testing Library para testes unitários.
2. Configurar Playwright para testes End-to-End (E2E).
3. Criar testes para os fluxos críticos:
   - Envio de mensagens no Chat.
   - Upload de documentos.
   - Geração de CPR no Wizard.
4. Meta: 80% de cobertura nos componentes da `src/components/v2/`.
```

---

## 🏗️ PENDENTES - FUNCIONALIDADES & INTEGRAÇÃO

### 📝 ISSUE #194 - Legal Document Diff Viewer

**Modelo:** Gemini 3 Pro
**Status:** Pendente

```markdown
[SYSTEM - Gemini 3 Pro]
Voce e um(a) engenheiro(a) senior de Next.js especialista em UI.

[USER]

# Implementar Legal Document Diff Viewer

Criar um componente `DiffViewer` elegante (estilo GitHub/Prism) para comparar versões de minutas:

1. Usar a biblioteca `diff` (ou similar leve).
2. Suporte a visualização Inline e Lado a Lado.
3. Destacar inclusões (verde) e exclusões (vermelho/tachado).
4. Adicionar botões "Aceitar" e "Rejeitar" para cada mudança.
```

---

### 📝 ISSUE #148-149 - PDF Export (Real)

**Modelo:** Gemini 3 Pro
**Status:** Parcial (Atualmente usa apenas window.print)

```markdown
[SYSTEM - Gemini 3 Pro]
Foque em gerar um PDF limpo e profissional sem depender apenas do bypass de impressão do browser.

[USER]

# Implementar Exportação PDF Profissional

1. Integrar uma biblioteca como `jsPDF` ou `pdfkit` (ou via API no backend Python).
2. Gerar export do PDF para:
   - Minutas geradas no TemplateGenerator.
   - Relatórios de Risco do CPRSimulator.
3. Garantir layout A4 com margens corretas e sem elementos de UI (menus).
```

---

### 📝 INTEGRAÇÃO - Backend Python

**Status:** Aguardando conclusão do backend para ligar as pontas no frontend.

- **#196 Input Bar Commands**: Ligar os comandos `/analise`, `/risco`, `/resumo` aos modelos RAG no backend.
- **#195 Citations System**: Renderizar as citações dinâmicas [1], [2] vindas da resposta do LLM.
- **#203 Docs Restantes**: Criar `CHAT_SYSTEM.md`, `PROVIDERS.md` e `DECISIONS.md`.

---

## ✅ FINALIZADOS (Removidos deste Log)

- #136 - TemplateGenerator (UI e Geração DOCX)
- #200 - Security Audit (Headers, CSP, Rate Limit)
- #161 - CI/CD Pipeline
- #131 - QuotesChart (Integração de Dados)
- #112-114 - CPRWizard Steps 4-6
- #119 - CPRSimulator (UI e Cálculo)
- #125 - Histórico de Documentos
- #134 - Cláusulas Modulares
