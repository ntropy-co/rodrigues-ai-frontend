# ✅ Verity Design System: Execution Checklist

Este arquivo rastreia todas as tarefas necessárias para implementar o **Design System 2026 (Neo-Neutral)**.

## 🔴 Fase 1: Fundação (Core)

Tarefas críticas que afetam toda a aplicação. Devem ser feitas primeiro.

- [x] **Palette Retune (Tailwind Config)**
  - [x] Atualizar `sand-50` para `#FDFCFB` (Warm Paper).
  - [x] Atualizar `sand-200` para `#F3F1EB` (Bone).
  - [x] Substituir `ouro-500` por `#BFA070` (Champagne Metallic).
  - [x] Substituir `ouro-600` por `#A68A56` (Bronze).
  - [ ] Verificar e ajustar tons de verde (`verity-primary`) se necessário.

- [x] **Typography System**
  - [x] Confirmar importação da **Crimson Pro** no layout raiz.
  - [x] Configurar classe `.font-display` para usar Crimson Pro com `tracking-tight`.
  - [x] Configurar classe `.font-sans` para usar Inter.
  - [x] Criar utilitário `.tabular-nums` para tabelas financeiras.

## 🟡 Fase 2: Refatoração de Componentes

Atualizar componentes base para remover "vícios" antigos.

- [x] **Inputs & Forms**
  - [x] Implementar estilo "Floating Input" (Narrow) para o Chat.
  - [x] Remover bordas cinza padrão (`gray-300`) e usar `sand-300`.
  - [x] Adicionar `shadow-sm` colorido (tom verde muito sutil) no foco.

- [x] **Cards & Surfaces**
  - [x] Remover bordas de cards internos (Zero-UI).
  - [x] Substituir fundos brancos puros por `sand-50` onde houver muito texto.
  - [x] Implementar "Spring Physics" no hover (escala suave + sombra).

- [x] **Iconografia**
  - [x] Auditar projeto e substituir ícones Material/FontAwesome por **Lucide React**.
  - [x] Garantir `stroke-width={1.5}` em todos os ícones.

## 🔵 Fase 3: Telas Específicas (Refactors)

Correções pontuais identificadas na auditoria.

- [x] **Página de Documentos** [`src/app/documents/page.tsx`]
  - [x] **CRÍTICO:** Trocar background `bg-gray-50`/`zinc-900` por `bg-sand-50`/`verity-950`.
  - [x] Atualizar cards da lista de arquivos para o novo padrão (sem borda, sombra suave).

- [x] **Dashboard** [`src/app/dashboard/page.tsx`]
  - [x] Refinar espaçamento para o "Bento Grid" (eliminar scroll desnecessário).
  - [x] Verificar se os "Quick Actions" estão usando as novas cores (sem azul/roxo).

- [x] **Landing Page** [`verity-lp`]
  - [x] **Navigation Fixes:**
    - [x] Adicionar IDs faltantes: `id="about"` (Ecosystem) e `id="contact"` (CTA).
    - [x] Implementar **Scroll Spy** no Header (Menu ativo brilha ao rolar).
  - [x] Sincronizar config Tailwind (copiar cores do App).
  - [x] Aplicar "Frosted Crystal" (Blur 24px) nos cards flutuantes.
  - [x] Trocar logos opacos por Logos Sólidos `verity-800`.
  - [x] Remover "Emerald Green" dos mockups e usar Verity Green.

## 🟣 Fase Especial: Auth & Public Revamp (High Impact)

Solicitação prioritária para elevar o nível das páginas públicas.

- [x] **Login Page (A "Entrada do Club")**
  - [x] **Background:** Substituir imagem estática por "Aurora Financeira" (Gradiente animado CSS `verity-950` -> `verity-900`).
  - [x] **Card:** Vidro "Crystal" (Blur 24px, Borda `white/5`, Shadow `verity-950/50`).
  - [x] **Typography:** "Verity Agro" em Crimson Pro Display (Grande).
  - [x] **Inputs:** Estilo "Modern Filled" (`bg-sand-50/5` -> Focus `bg-sand-50/10`).

- [x] **Contact & Request Access**
  - [x] Unificar visual com Login (Background animado, mas mais leve).
  - [x] Formulário com validação em tempo real e feedback visual elegante.

- [x] **Public Pages (High-Impact Hubs)**
  - [x] **Help Center:** Layout Bento Grid com busca centralizada (`src/app/(dashboard)/help`).
  - [x] **Settings Hub:** Dashboard de configurações com User Hero e Cards (`src/app/(dashboard)/settings`).

- [x] **The Verity Guide (Agentic Onboarding)**
  - [x] **Engine:** Context API + Framer Motion (Zero-Dependency).
  - [x] **UI:** Avatar "Verity" + Glass Bubbles + Cinema Overlay.
  - [x] **Tours:** Welcome Tour (Automático) + Wizard Tour (Contextual).

## 🟢 Fase 4: Polimento Final

- [x] **Dark Mode (Verity Noir)**
  - [x] Verificar se o fundo é `verity-950` (Floresta Noturna) e não preto puro.
  - [x] Ajustar textos para `sand-100` (evitar branco ótico).

- [x] **Motion Check**
  - [x] Testar todas as animações para garantir sensação "elástica" (Spring).
