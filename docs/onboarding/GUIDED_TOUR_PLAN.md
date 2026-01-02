# 🧭 Verity Guide: The State of the Art Onboarding (2026)

> _"Não mostre onde clicar. Mostre o que é possível alcançar."_

Este documento define a arquitetura do **Sistema de Onboarding Inteligente** da Verity Agro.

---

## 1. Filosofia: "Agentic Onboarding"

Em 2026, tours guiados lineares ("Step 1 of 5") estão mortos. O usuário moderno ignora popups modais.
A solução Verity é o **Agentic Onboarding**: Uma experiência conversacional e contextual liderada pela IA da plataforma.

### Pilares da Experiência

1.  **Cinema Mode:** O foco não é apenas um highlight; a interface inteira reage ("dims") para criar um palco para a feature.
2.  **Persona "Guide":** Não é um tooltip anônimo. É a "Verity AI" falando com você.
3.  **Just-in-Time:** O tour completo só acontece se solicitado. O padrão é o _Micro-Learning_: "Vi que você abriu o CPR Wizard pela primeira vez. Quer ajuda?"
4.  **Interativo:** O tour não avança clicando em "Next". Ele avança quando o usuário **executa a ação** (ex: "Clique em Nova CPR" -> O tour espera o clique real).

---

## 2. Arquitetura Técnica

Não usaremos bibliotecas genéricas (`react-joyride`) que limitam o design. construiremos um motor customizado.

### Stack (Atualizado: Zero-Dependency)

- **State Management:** `React Context API` (Nativo). Reduz bundle size e elimina complexidade de build.
- **Animation:** `Framer Motion` (Spring Physics indispensável).
- **Positioning:** `CSS Fixed Positioning` (Robustez máxima para o Avatar).
- **Persistence:** `localStorage`.

### Arquitetura Implementada

Optamos por uma abordagem **"In-House Engine"** em vez de usar `zustand` ou `floating-ui`.
Isso garantiu que o sistema rodasse imediatamente sem conflitos de dependências (npm issues) e mantivesse uma performance leve.
O `TourContext` controla todo o ciclo de vida, enquanto o `VerityGuide` é puramente apresentacional.

### Componentes Core

1.  **`<TourProvider />`**: Envolve a aplicação. Gerencia o "Palco" (Overlay).
2.  **`<VerityGuide />`**: O Avatar da IA (Glassmorphism + Glow) que "flutua" na tela.
3.  **`<Spotlight />`**: Um recorte SVG ou `mix-blend-mode` que ilumina o elemento alvo.
4.  **`<InteractiveTrigger />`**: O pequeno ícone `?` que pode ser espalhado pela UI para replays contextuais.

---

## 3. Roteiro do Tour (The Script)

### Abertura: "The Handshake"

- **Trigger:** Primeiro Login.
- **Ação:**
  1.  Tela escurece suavemente (Blur).
  2.  Avatar Verity surge no centro (Animação "Pop").
  3.  **Dialogo:** _"Olá, [Nome]. Bem-vindo à inteligência financeira do campo. Sou a Verity, sua analista pessoal."_
  4.  **Escolha:** "Fazer tour completo" ou "Explorar sozinho".

### Ato 1: O Painel de Controle (Dashboard)

- **Foco:** Cards de Métricas.
- **Verity:** _"Aqui monitoramos a saúde da sua carteira em tempo real."_
- **Foco:** Quick Actions.
- **Verity:** _"Precisa de agilidade? Inicie uma nova CPR ou cotação em um clique aqui."_

### Ato 2: O Cérebro (Chat AI)

- **Foco:** Sidebar ou Botão de Chat.
- **Verity:** _"Dúvidas complexas? Apenas pergunte. Eu cruzo dados de mercado, clima e legislação para você."_

### Ato 3: Contextual (CPR Wizard) - _Ativado sob demanda_

- **Trigger:** Usuário clica no ícone `?` em "Nova CPR".
- **Verity:** _"O Wizard protege você de erros jurídicos. Preencha os dados e eu valido as garantias automaticamente."_

---

## 4. Plano de Execução

1.  **Setup Engine:** Criar `context/TourContext.tsx` e hooks.
2.  **UI Components:** Criar `<GuideAvatar />` e `<GlassTooltip />`.
3.  **Implementação Global:** Adicionar o Provider no `layout.tsx`.
4.  **Scripting:** Escrever os passos do "Welcome Tour".
5.  **Micro-triggers:** Inserir botões `?` nas páginas chave.

---

_Este sistema elevará a percepção da plataforma de "Software" para "Parceiro Inteligente"._
