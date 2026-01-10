# 📋 Backlog Kanban - Versão Visual

**Status:** 🔴 To Do | 🟡 In Progress | 🟢 Done | ⚪ Blocked

---

## 🔴 P0 - CRÍTICO (Fazer Agora)

### 📦 Duplicações (Blocker)

- [x] **P0-01** ✅ Consolidar Stores Duplicados - **CONCLUÍDO**
  - Deletado `src/store.ts` e `src/stores/` (3 arquivos)
  - Migrados 13 imports para `@/features/*/stores/`
  - ⏱️ 2h | 💥 Alto

- [x] **P0-09** ✅ Reorganizar Estrutura de Testes - **CONCLUÍDO**
  - ✅ Removidos testes duplicados de `src/components/v2/`
  - ✅ Movidos testes para colocation (junto aos arquivos)
  - ✅ Removida pasta `src/__tests__/` vazia
  - ✅ Removido `src/test/setup.ts` não utilizado
  - ✅ Corrigidos testes falhando:
    - `WorkflowProgressBar.test.tsx` (text-verity-300 → text-verity-500)
    - `useSessions.test.ts` (mock de chatApi corrigido)
    - `useRiskCalculator.test.ts` (header Authorization removido - usa cookies)
  - ✅ Configurado Vitest para evitar erro de memória (reduzido workers, aumentado heap)
  - ✅ Todos os testes específicos corrigidos passando
  - ⏱️ 2h | 💥 Alto
- [x] **P0-03** ✅ Consolidar Hooks Duplicados - **CONCLUÍDO**
  - ✅ Migrados 18 hooks para `src/features/*/hooks/`
  - ✅ Atualizados 30+ arquivos com imports
  - ✅ Removidos hooks duplicados de `src/hooks/`
  - ✅ Corrigidos erros de tipos (RiskFactor, WorkflowState)
  - ✅ Build passando | Typecheck ✅ | Aplicação rodando ✅
  - ⏱️ 1 dia | 💥 Alto

- [x] **P0-05** ✅ Consolidar Componentes Duplicados - **CONCLUÍDO**
  - ✅ Migrados 4 componentes específicos de `src/components/v2/`:
    - `InstallPrompt` → `@/components/layout/InstallPromptGate`
    - `WebVitalsReporterWrapper` → `@/components/layout/Monitoring/WebVitalsReporterWrapper`
    - `TourOverlay` → `@/features/tour`
    - `VerityGuide` → `@/features/tour`
  - ✅ Pasta `Tour/` completamente removida de `src/components/v2/`
  - ✅ Apenas 2 imports restantes de `@/components/v2/` (mantidos intencionalmente):
    - `QuotesChart` (diferentes implementações)
    - `CPRWizard` (APIs diferentes - draft vs workflow)
  - ✅ Build passando | Typecheck ✅ | Aplicação funcionando ✅
  - ⏱️ 1.5 dias | 💥 Alto

### ♿ Acessibilidade Básica (Blocker)

- [x] **P0-02** ✅ Corrigir lang="pt-BR" - **CONCLUÍDO**
  - Corrigido em `src/app/layout.tsx` e `src/app/global-error.tsx`
  - ⏱️ 5 min | 💥 Alto

- [x] **P0-04** ✅ Adicionar Skip Links - **CONCLUÍDO**
  - ✅ Criado componente SkipLinks em `src/components/ui/SkipLinks.tsx`
  - ✅ Integrado no layout principal (primeiro elemento no body)
  - ✅ Adicionado ID `main-content` em todas as páginas principais
  - ✅ ID `navigation-sidebar` já existia no MenuSidebar
  - ✅ Estilos WCAG: visível apenas quando focado (sr-only)
  - ✅ Testes: 5 testes passando
  - ✅ Build passando | Typecheck ✅ | Lint ✅
  - ⏱️ 1h | 💥 Alto

- [x] **P0-07** ✅ Adicionar Landmarks Semânticos - **CONCLUÍDO**
  - ✅ Adicionado `<header role="banner">` em ChatHeader, InternalHeader, AnalysisLayout, login
  - ✅ Adicionado `<nav>` com aria-label em headers e sidebars
  - ✅ Adicionado `<aside role="navigation">` em ConversationsSidebar e MenuSidebar
  - ✅ Adicionado `<aside role="complementary">` em FilesSidebar e AnalysisLayout (document panel)
  - ✅ Adicionado `<main id="main-content" tabIndex={-1}>` em todas as páginas principais (já existia, confirmado)
  - ✅ Adicionado `<section>` com aria-labelledby em dashboard, compliance, analyze, documents, FilesSidebar
  - ✅ Adicionado `<footer role="contentinfo">` em login e FilesSidebar
  - ✅ Roles ARIA apropriados em todos os componentes
  - ✅ Testes: Typecheck ✅ | Lint ✅
  - ⏱️ 2h | 💥 Alto

- [x] **P0-06** ✅ Adicionar ARIA Labels Faltando - **CONCLUÍDO**
  - ✅ Adicionado `aria-label` em 19 botões sem texto visível (ChatHeader, InputBar, ConversationsSidebar, FilesSidebar, EmptyState, IssueCard, TourTrigger)
  - ✅ Adicionado `aria-labelledby` e `aria-describedby` em formulários (login, signup)
  - ✅ Adicionado `htmlFor` e `id` conectando labels aos inputs em todos os formulários de autenticação
  - ✅ Adicionado `aria-required`, `aria-invalid`, `aria-describedby` em inputs de formulários
  - ✅ Adicionado `aria-expanded`, `aria-pressed`, `aria-hidden` onde apropriado
  - ✅ 57 atributos ARIA em componentes de chat
  - ✅ 19 atributos ARIA em formulários de autenticação
  - ✅ Todos os botões de ação têm labels apropriados
  - ✅ Todos os inputs têm labels associados e descrições de erro
  - ✅ Testes: Typecheck ✅ | Lint ✅
  - ⏱️ 1 dia | 💥 Alto

- [x] **P0-08** ✅ Verificar Contraste de Cores (WCAG AA) - **CONCLUÍDO**
  - ✅ Criado script de auditoria automática (`scripts/check-contrast.mjs`)
  - ✅ Corrigido `ouro-400`: De `#E0B14E` para `#A0782C` (4.14:1 - texto grande)
  - ✅ Ajustado `verity-400`: Melhorado contraste sobre `sand-100`
  - ✅ Ajustado `error-600`: Escurecido para garantir contraste (6.45:1)
  - ✅ Documentadas 4 exceções aprovadas (apenas texto grande)
  - ✅ Criada documentação completa (`docs/compliance/WCAG_COLOR_CONTRAST.md`)
  - ✅ Criado guia rápido de uso (`docs/compliance/COLOR_USAGE_GUIDE.md`)
  - ✅ Adicionado script ao CI/CD (`.github/workflows/validate.yml`)
  - ✅ Adicionado comando `npm run check:contrast`
  - ✅ 0 problemas críticos, 4 avisos documentados (apenas texto grande)
  - ⏱️ 1 dia | 💥 Alto

---

## 🟡 P1 - ALTA (Próxima Sprint)

### 🎨 Formatação Chat (ChatGPT-Style)

- [x] **P1-19** ✅ Melhorar Espaçamento CSS - **CONCLUÍDO**
  - ✅ Parágrafos: `mb-3` → `mb-4` (aumentado para melhor legibilidade)
  - ✅ Listas: `space-y-3` → `space-y-4`, `mb-4` → `mb-6` (espaçamento maior entre itens)
  - ✅ Headings: Adicionado espaçamento `mt-6/mt-8` e `mb-3/mb-4/mb-6` (hierarquia visual)
  - ✅ Horizontal Rules: Adicionado `my-8` (separadores mais destacados)
  - ✅ Blockquotes: Adicionado `my-4` e estilo com border-l-4 e background
  - ✅ MarkdownRenderer container: `gap-y-5` → `gap-y-6` (espaçamento geral aumentado)
  - ✅ Estilos aplicados em `.markdown-content` em `globals.css`
  - ✅ Build passando | Typecheck ✅ | Lint ✅
  - ⏱️ 2h | 💥 Alto

- [x] **P1-20** ✅ Listas com Badges Destacados - **CONCLUÍDO**
  - ✅ Badges aumentados para 10x10 (40px x 40px) em listas ordenadas e não-ordenadas
  - ✅ Espaçamento melhorado (space-y-3, gap-4, mb-4)
  - ✅ Badges ordenados: bg-verity-600 text-white (alto contraste WCAG AA)
  - ✅ Badges bullets: bg-verity-600 text-white com símbolo "●" destacado (WCAG AA garantido: 5.35:1)
  - ✅ Estilos aplicados em `.markdown-content ol` e `.markdown-content ul`
  - ✅ Build passando | Typecheck ✅ | Lint ✅
  - ⏱️ 2h | 💥 Alto

- [x] **P1-21** ✅ Separar Labels de Descrições - **CONCLUÍDO**
  - ✅ Criada função `detectLabelPattern()` para detectar padrão "Label: Descrição"
  - ✅ Implementado componente Paragraph customizado com detecção automática
  - ✅ Suporte para labels multi-palavras: "Valor Total:", "Data de Emissão:"
  - ✅ Suporte para acrônimos: "CPF:", "CNPJ:", "CEP:"
  - ✅ Label automaticamente em negrito (`<strong>`) com cor verity-950
  - ✅ Descrição em cor verity-800 com espaçamento `ml-2`
  - ✅ Implementado em `styles.tsx` (block) e `inlineStyles.tsx` (inline)
  - ✅ Documentação criada: `docs/ui/MARKDOWN_LABEL_DETECTION.md`
  - ✅ Build passando | Typecheck ✅ | Lint ✅
  - ⏱️ 1 dia | 💥 Alto

- [x] **P1-22** ✅ Task Lists (Checklists) com Checkboxes Interativos - **CONCLUÍDO**
  - ✅ Implementado componente `ListItem` customizado para task lists do remarkGfm
  - ✅ Task lists renderizadas com badges 10x10 destacados (estilo P1-20)
  - ✅ Checkboxes interativos com estado sincronizado (checked prop)
  - ✅ Suporte para sub-items com indentação visual (ml-14)
  - ✅ Estilos CSS aplicados para task lists em `globals.css`
  - ✅ Garantido que task items não herdam ::before dos bullets/números
  - ✅ aria-label dinâmico baseado no conteúdo do item
  - ✅ Funciona automaticamente com markdown task lists (`- [ ]` e `- [x]`)
  - ✅ Build passando | Typecheck ✅ | Lint ✅
  - ⏱️ 1 dia | 📈 Médio

- [x] **P1-23** ✅ Criar InstructionBlock Component - **CONCLUÍDO**
  - ✅ Criado componente `InstructionBlock` em `src/components/ui/typography/MarkdownRenderer/InstructionBlock.tsx`
  - ✅ Suporte para 3 variantes: `info`, `warning`, `success`
  - ✅ Suporte para 4 ícones: `file`, `warning`, `success`, `info`
  - ✅ Background destacado com border (verity-50/50, ouro-50/50)
  - ✅ Integrado com MarkdownRenderer via custom tag `<instruction>`
  - ✅ Adicionado ao rehypeSanitize para permitir tag custom
  - ✅ Suporte para título opcional
  - ✅ Conteúdo renderizado com markdown-content para consistência
  - ✅ Build passando | Typecheck ✅ | Lint ✅
  - ⏱️ 4h | 📈 Médio

### 🎨 Design System

- [x] **P1-05** ✅ Centralizar Design Tokens - **CONCLUÍDO**
  - ✅ Criada estrutura `src/design-tokens/` como fonte única de verdade
  - ✅ Extraídos tokens de cores (HSL e Hex): `sand`, `verity`, `ouro`, `error`, `brand`
  - ✅ Extraídos tokens semânticos: `semanticLight`, `semanticDark`, `shadcnLight`, `shadcnDark`
  - ✅ Extraídos tokens de tipografia: `fontFamilies`, `fontSize`, `typographyUtils`
  - ✅ Extraídos tokens de espaçamento: `spacing`, `semanticSpacing` (sistema base 4px)
  - ✅ Extraídos tokens de sombras: `shadows` (verity green tint)
  - ✅ Extraídos tokens de border-radius: `borderRadius` (Claude-style)
  - ✅ Extraídos tokens de animações: `duration`, `easing`, `keyframes`, `animations`
  - ✅ Criado `index.ts` com exports centralizados
  - ✅ Criada documentação em `src/design-tokens/README.md`
  - ✅ Build passando | Typecheck ✅ | Lint ✅
  - ⏱️ 1 dia | 💥 Alto

- [x] **P1-06** ✅ Gerar CSS/Tailwind de Tokens - **CONCLUÍDO**
  - ✅ Criado script `scripts/generate-tokens.ts` que lê tokens TypeScript
  - ✅ Implementada função `generateCSSVariables()` para gerar `:root` e `.dark` em `globals.css`
  - ✅ Implementada função `generateThemeExtend()` para gerar `theme.extend` em `tailwind.config.ts`
  - ✅ Gerado CSS variables para cores (sand, verity, ouro, error, brand), semantic mapping, dark mode
  - ✅ Gerado Tailwind config para colors, fontSize, fontFamily, boxShadow, borderRadius, spacing, transitionDuration, keyframes, animation, zIndex
  - ✅ Adicionado script npm `generate:tokens` ao `package.json`
  - ✅ Script preserva estrutura existente dos arquivos (imports, plugins, etc.)
  - ✅ Compatibilidade ES2017 (sem regex flag 's')
  - ✅ Build passando ✅ | Typecheck ✅ | Lint ✅
  - ⏱️ 2 dias | 💥 Alto

- [x] **P1-07** ✅ Typography Components - **CONCLUÍDO**
  - ✅ Refatorado `Heading/constants.ts` para usar tokens de typography
  - ✅ Refatorado `Paragraph/constants.ts` para usar tokens de typography
  - ✅ Heading usa `font-display` (Crimson Pro) com fontSize tokens (text-4xl, text-3xl, etc.)
  - ✅ Paragraph usa `font-sans` (Inter) com fontSize tokens (text-base, text-sm, etc.)
  - ✅ Adicionada documentação inline explicando mapeamento para design tokens
  - ✅ Mantida compatibilidade com API existente
  - ✅ Build passando ✅ | Typecheck ✅ | Lint ✅
  - ⏱️ 1 dia | 📈 Médio

- [x] **P1-08** ✅ Spacing System Consistente - **CONCLUÍDO**
  - ✅ Auditado uso de spacing no código - componentes já usam classes Tailwind (p-4, m-6, gap-3, etc.)
  - ✅ Verificado que Tailwind spacing scale já está baseada em 4px
  - ✅ Tokens de spacing (18, 22) já estão no `tailwind.config.ts` (gerado por P1-06)
  - ✅ Criada documentação completa: `docs/ui/SPACING_GUIDE.md`
  - ✅ Documentadas convenções de uso (padding, margin, gap, espaçamento semântico)
  - ✅ Documentados padrões comuns (cards, formulários, listas, modals)
  - ✅ Documentados valores especiais (18, 22) e boas práticas
  - ✅ Build passando ✅ | Typecheck ✅ | Lint ✅
  - ⏱️ 1 dia | 📈 Médio

- [x] **P1-09** ✅ Elevation System - **CONCLUÍDO**
  - ✅ Criado `src/design-tokens/elevation.ts` com z-index e shadows mapeados
  - ✅ Definida escala de elevação: base (0), raised (10), sticky (30), overlay (40), modal (50), tooltip (50)
  - ✅ Cada nível de elevação combina z-index com shadow apropriado
  - ✅ Adicionado zIndex scale ao `tailwind.config.ts` via script generate-tokens
  - ✅ Verificado que componentes UI críticos já usam valores corretos:
    - Dialog: `z-50` (modal) ✅
    - AlertDialog: `z-50` (modal) ✅
    - Tooltip: `z-50` (tooltip) ✅
    - Popover: `z-50` (tooltip) ✅
    - DropdownMenu: `z-50` (tooltip) ✅
  - ✅ Criada documentação: `docs/ui/ELEVATION_SYSTEM.md`
  - ✅ Documentadas convenções de uso e boas práticas
  - ✅ Build passando ✅ | Typecheck ✅ | Lint ✅
  - ⏱️ 4h | 📈 Médio

### ⚡ Performance

- [ ] **P1-10** 🟡 Lazy Load Componentes Pesados
  - Dynamic imports
  - ⏱️ 4h | 💥 Alto

- [x] **P1-11** ✅ Otimizar Zustand Selectors - **CONCLUÍDO**
  - ✅ useShallow implementado em componentes críticos
  - ✅ Otimização de re-renders desnecessários
  - ✅ Build passando | Typecheck ✅ | Lint ✅
  - ⏱️ 1 dia | 💥 Alto

- [x] **P1-12** ✅ Bundle Analysis CI/CD - **CONCLUÍDO**
  - ✅ Adicionado step de bundle analysis ao `.github/workflows/build.yml`
  - ✅ Bundle analyzer configurado com `ANALYZE=true`
  - ✅ Continue-on-error habilitado para não bloquear builds
  - ✅ Script `analyze` já existia no package.json
  - ✅ Build passando | Typecheck ✅ | Lint ✅ | Analyze ✅
  - ⏱️ 2h | 📈 Médio

- [ ] **P1-13** 🟡 Image Optimization
  - Next.js Image
  - ⏱️ 1 dia | 📈 Médio

- [ ] **P1-14** 🟡 Font Loading Otimizado
  - Preload críticas
  - ⏱️ 2h | 📈 Médio

### 🎯 UX/UI - Estados

- [ ] **P1-15** 🟡 Loading States Unificados
  - Sistema único
  - ⏱️ 1 dia | 💥 Alto

- [ ] **P1-16** 🟡 Empty States Contextuais
  - Componente reutilizável
  - ⏱️ 1 dia | 💥 Alto

- [ ] **P1-17** 🟡 Error States Melhorados
  - Com recuperação
  - ⏱️ 1 dia | 💥 Alto

- [ ] **P1-18** 🟡 Mobile Touch Targets
  - Mínimo 44x44px
  - ⏱️ 4h | 📈 Médio

### ♿ Acessibilidade Avançada

- [ ] **P1-01** 🟡 Keyboard Navigation Completa
  - Todos componentes
  - ⏱️ 1 dia | 💥 Alto

- [ ] **P1-02** 🟡 Focus Management em Modals
  - Trap focus
  - ⏱️ 2h | 📈 Médio

- [ ] **P1-03** 🟡 Screen Reader Support
  - aria-describedby, aria-live
  - ⏱️ 1 dia | 📈 Médio

- [ ] **P1-04** 🟡 Integrar axe-core em Dev
  - Validação automática
  - ⏱️ 2h | 📈 Médio

---

## 🟢 P2 - MÉDIA (Backlog)

### 🧹 Simplificação

- [ ] **P2-01** 🟢 Consolidar Error Handling
  - Unificar 3 sistemas
  - ⏱️ 2 dias | 📈 Médio

- [ ] **P2-02** 🟢 Simplificar useErrorHandler
  - Remover abstrações
  - ⏱️ 1 dia | ✨ Baixo

- [ ] **P2-03** 🟢 Consolidar Abstrações de API
  - Unificar authFetch e proxy
  - ⏱️ 1 dia | 📈 Médio

- [ ] **P2-04** 🟢 Consolidar Stores de UI
  - Um único uiStore
  - ⏱️ 1 dia | ✨ Baixo

### 🎨 Componentes

- [ ] **P2-05** 🟢 Button Component Refinado
  - Estados, micro-interações
  - ⏱️ 4h | 📈 Médio

- [ ] **P2-06** 🟢 Input Component Melhorado
  - Floating labels
  - ⏱️ 1 dia | 📈 Médio

- [ ] **P2-07** 🟢 Card Component Variants
  - Variantes visuais
  - ⏱️ 4h | ✨ Baixo

### 📱 Mobile

- [ ] **P2-09** 🟢 Mobile-First Refactor
  - ~50 componentes
  - ⏱️ 3 dias | 📈 Médio

- [ ] **P2-10** 🟢 Swipe Gestures Mobile
  - Gestos nativos
  - ⏱️ 1 dia | ✨ Baixo

- [ ] **P2-11** 🟢 Bottom Navigation Mobile
  - Navegação inferior
  - ⏱️ 1 dia | 📈 Médio

### ⚡ Performance Avançada

- [ ] **P2-12** 🟢 Memoizar Componentes Pesados
  - React.memo
  - ⏱️ 1 dia | 📈 Médio

- [ ] **P2-13** 🟢 Virtualização de Listas
  - Listas longas
  - ⏱️ 2 dias | 📈 Médio

- [ ] **P2-14** 🟢 Code Splitting por Feature
  - Lazy load features
  - ⏱️ 1 dia | 📈 Médio

---

## ⚪ P3 - BAIXA (Nice to Have)

### 🔧 Code Quality

- [ ] **P3-01** ⚪ Component Composition
  - Quebrar grandes
  - ⏱️ 3 dias | ✨ Baixo

- [ ] **P3-02** ⚪ Compound Components
  - Pattern avançado
  - ⏱️ 1 dia | ✨ Baixo

- [ ] **P3-03** ⚪ Type Safety Improvements
  - Tipos específicos
  - ⏱️ 1 dia | ✨ Baixo

### ✨ Refinamentos UX

- [ ] **P3-05** ⚪ Micro-interações Premium
  - Spring physics
  - ⏱️ 1 dia | ✨ Baixo

- [ ] **P3-06** ⚪ Visual Feedback Sutil
  - Checkmark, shake
  - ⏱️ 1 dia | ✨ Baixo

- [ ] **P3-07** ⚪ Toast Melhorado
  - Com ações
  - ⏱️ 2h | ✨ Baixo

### 📚 Documentação

- [ ] **P3-09** ⚪ Padronizar Exports
  - index.ts em features
  - ⏱️ 1 dia | ✨ Baixo

- [ ] **P3-10** ⚪ ESLint Rule para Imports
  - Forçar padrão
  - ⏱️ 2h | ✨ Baixo

- [ ] **P3-12** ⚪ Documentação de Padrões
  - Padrões estabelecidos
  - ⏱️ 1 dia | ✨ Baixo

---

## 📊 PROGRESSO

### P0 - Crítico

```
Progresso: [████████████] 9/9 (100%)
```

✅ **9 tarefas totalmente concluídas!**

**Status detalhado:**

- ✅ **9 tarefas 100% concluídas** (P0-01, P0-02, P0-03, P0-04, P0-05, P0-06, P0-07, P0-08, P0-09)

### P1 - Alta

```
Progresso: [███████████░░░░░░░░░░░] 12/24 (50%)
```

✅ **12 tarefas concluídas!**

**Status detalhado:**

- ✅ **12 tarefas 100% concluídas** (P1-05, P1-06, P1-07, P1-08, P1-09, P1-11, P1-12, P1-19, P1-20, P1-21, P1-22, P1-23)
- 🟡 **12 tarefas pendentes**

### P2 - Média

```
Progresso: [░░░░░░░░░░░░░░] 0/14 (0%)
```

### P3 - Baixa

```
Progresso: [░░░░░░░░░░░░] 0/12 (0%)
```

---

## 🎯 SPRINT ATUAL

### Sprint 1: P0 - Crítico (Semana 1-2)

**Objetivo:** Remover blockers e duplicações críticas

**Tarefas Concluídas:**

- [x] P0-01: Stores (1 dia) - ✅ CONCLUÍDO
- [x] P0-02: lang="pt-BR" (5 min) - ✅ CONCLUÍDO
- [x] P0-03: Consolidar Hooks (1 dia) - ✅ CONCLUÍDO
- [x] P0-04: Skip Links (1h) - ✅ CONCLUÍDO
- [x] P0-05: Consolidar Componentes Duplicados (1.5 dias) - ✅ CONCLUÍDO
- [x] P0-06: ARIA Labels (1 dia) - ✅ CONCLUÍDO
- [x] P0-07: Landmarks Semânticos (2h) - ✅ CONCLUÍDO
- [x] P0-08: Verificar Contraste de Cores (1 dia) - ✅ CONCLUÍDO
- [x] P0-09: Reorganizar Estrutura de Testes (2h) - ✅ CONCLUÍDO
  - ✅ Estrutura reorganizada (sem `__tests__/`, testes colocalizados)
  - ✅ Testes falhando corrigidos (WorkflowProgressBar, useSessions, useRiskCalculator)
  - ✅ Configuração Vitest melhorada (memória, workers)

**Meta:** 9/9 P0 completas até final da semana 2 (100% concluído) ✅ **META SUPERADA!**

---

## 📈 VELOCIDADE

**Sprint 1 (Semana 1-2):** 9 tarefas | ~10.5 horas | 9 P0 completas ✅

**Sprint 2 (Semana 3-4):** 12 tarefas P1 completas | ~26 horas |

- Formatação Chat: 5 tarefas (P1-19, P1-20, P1-21, P1-22, P1-23) - **FORMATAÇÃO CHAT COMPLETA** ✅
- Design System Core: 5 tarefas (P1-05, P1-06, P1-07, P1-08, P1-09) - **DESIGN SYSTEM CORE COMPLETO** ✅
- Performance: 2 tarefas (P1-11, P1-12) - **OTIMIZAÇÕES DE PERFORMANCE INICIADAS** ✅

---

## 🔥 TOP 10 (Prioridade Absoluta)

1. 🟡 **P1-15** Loading States Unificados (1 dia) - **⬅️ PRÓXIMA TAREFA RECOMENDADA** - Melhora experiência do usuário
2. 🟡 **P1-16** Empty States Contextuais (1 dia) - Melhora experiência do usuário
3. 🟡 **P1-10** Lazy Load Componentes Pesados (4h) - Performance crítica
4. 🟡 **P1-11** Otimizar Zustand Selectors (1 dia) - Performance crítica
5. 🟡 **P1-01** Keyboard Navigation Completa (1 dia) - Acessibilidade avançada
6. 🟡 **P1-02** Focus Management em Modals (2h) - Acessibilidade
7. 🟡 **P1-03** Screen Reader Testing (1 dia) - Acessibilidade avançada
8. 🟡 **P1-04** Animações de Transição (1 dia) - UX refinada
9. 🟡 **P1-12** Otimizar Imagens (1 dia) - Performance
10. 🟡 **P1-13** Code Splitting por Rota (1 dia) - Performance

---

## 🎯 RECOMENDAÇÃO DE PRÓXIMA TAREFA

### ⚡ **P1-15: Loading States Unificados** (1 dia)

**Por que esta tarefa é recomendada agora:**

1. ✅ **Design System Core Completo** - P1-05, P1-06, P1-07, P1-08, P1-09 concluídas ✅
2. ✅ **Formatação Chat 100% Completa** - P1-19, P1-20, P1-21, P1-22, P1-23 concluídas ✅
3. ✅ **Todas as tarefas P0 críticas concluídas** - Base sólida estabelecida
4. ✅ **Alto impacto UX** - Estados de loading consistentes melhoram percepção de performance
5. ✅ **Componente reutilizável** - Sistema único de loading states
6. ✅ **Esforço moderado** - 1 dia de trabalho

**O que fazer:**

1. Auditar todos os loading states atuais no projeto
2. Criar componente base `LoadingState` reutilizável
3. Padronizar animações e estilos
4. Substituir loading states customizados pelo componente unificado
5. Documentar uso e variantes
6. Testar em diferentes contextos (botões, cards, páginas)

**Arquivos principais:**

- Novo: `src/components/ui/LoadingState.tsx` ou `src/components/ui/loading/`
- `src/components/ui/loading/LoadingSpinner.tsx`
- `src/components/ui/loading/LoadingSkeleton.tsx`
- `docs/ui/LOADING_STATES.md` - Documentação

**Progresso do Design System:**

- ✅ P1-05: Centralizar Design Tokens (CONCLUÍDO)
- ✅ P1-06: Gerar CSS/Tailwind de Tokens (CONCLUÍDO)
- ✅ P1-07: Typography Components (CONCLUÍDO)
- ✅ P1-08: Spacing System Consistente (CONCLUÍDO)
- ✅ P1-09: Elevation System (CONCLUÍDO) - **DESIGN SYSTEM CORE COMPLETO** ✅

**Progresso da Formatação Chat:**

- ✅ P1-19: Melhorar Espaçamento CSS (CONCLUÍDO)
- ✅ P1-20: Listas com Badges Destacados (CONCLUÍDO)
- ✅ P1-21: Separar Labels de Descrições (CONCLUÍDO)
- ✅ P1-22: Task Lists com Checkboxes Interativos (CONCLUÍDO)
- ✅ P1-23: InstructionBlock Component (CONCLUÍDO) - **FORMATAÇÃO CHAT 100% COMPLETA** ✅

---

**Última Atualização:** 2026-01-11 - P1-11, P1-12 concluídas ✅ | P1: 12/24 tarefas concluídas (50%) | **Performance: Otimizações Zustand + Bundle Analysis CI/CD** 🚀
