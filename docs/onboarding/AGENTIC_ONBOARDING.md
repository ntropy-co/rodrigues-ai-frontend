# 🧭 Agentic Onboarding: A Experiência "Verity Guide"

> _"Não mostre onde clicar. Mostre o que é possível alcançar."_

Este documento detalha a filosofia e a implementação do sistema de **Agentic Onboarding** da Verity Agro, projetado para transcender os tutoriais lineares tradicionais e oferecer uma recepção digna de uma plataforma Enterprise/Editorial.

---

## 1. O Conceito: "Cinema Mode & The Guide"

Em vez de tooltips irritantes que "gritam" com o usuário, criamos uma **interação cinematográfica**.

### A Filosofia

1.  **O Palco (Cinema Mode):** Quando a ajuda é necessária, o restante do mundo desaparece. O fundo escurece (`TourOverlay`), silenciando o ruído visual do dashboard para focar puramente na mensagem.
2.  **A Persona (Avatar):** A ajuda não vem de um "pop-up", vem da **Verity**. O Avatar (`VerityGuide`) é a personificação da inteligência da plataforma. Ele "respira" (animação de pulso) e "fala" através de balões de vidro fosco.
3.  **Micro-Learning (Just-in-Time):** O tour completo só acontece no primeiro acesso. Depois disso, a ajuda é **contextual**. O usuário clica no ícone `?` onde precisa, e recebe uma explicação curta e poderosa sobre _aquela_ funcionalidade específica (ex: Wizard de CPR).

---

## 2. A Implementação Técnica: "Zero-Dependency"

Devido à necessidade de robustez extrema e controle total sobre a animação, rejeitamos bibliotecas genéricas (como `react-joyride`) em favor de uma engine customizada.

### Stack

- **Engine:** `React Context API` (`TourContext.tsx`). Gerencia o estado global, fila de passos e persistência.
- **Motion:** `Framer Motion`. Responsável pela "Spring Physics" das entradas e saídas fluidas.
- **Persistência:** `localStorage`. Garante que o usuário não seja incomodado repetidamente com o mesmo tour.

### Estrutura de Arquivos

- `src/contexts/TourContext.tsx`: O cérebro.
- `src/components/v2/Tour/VerityGuide.tsx`: O corpo (Avatar + UI).
- `src/components/v2/Tour/TourOverlay.tsx`: O ambiente (Dimming).
- `src/components/v2/Tour/WelcomeTour.tsx`: O roteiro de boas-vindas.
- `src/components/v2/Tour/TourTrigger.tsx`: O gatilho contextual (`?`).

---

## 3. Como Evoluir

Este sistema foi desenhado para crescer.

1.  **Novos Tours:** Basta criar um array de `TourStep[]` e passar para o `TourTrigger`.
2.  **Ações Inteligentes:** O sistema suporta callbacks `onEnter`, permitindo que o tour execute ações reais (ex: abrir um menu) enquanto fala.
3.  **Voz e Som:** A estrutura `VerityAvatar` já prevê estados de "falando", facilitando uma futura integração com TTS (Text-to-Speech).

---

_A Verity Agro não apenas fornece ferramentas; ela guia o usuário ao sucesso com a elegância de um Private Banker._
