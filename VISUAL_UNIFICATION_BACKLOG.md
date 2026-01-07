# BACKLOG DE PRODUTO: UNIFICAÇÃO VISUAL VERITY

Este documento quebra o Plano de Execução "Ultrathink" em uma hierarquia ágil padrão: **Épicos > Histórias de Usuário > Tarefas Técnicas**.

---

## ÉPICO 1: Fundação do Design System (Core)
**Objetivo**: Estabelecer as bases técnicas (cores, tipografia, variáveis) para que o novo visual "Orgânico & Premium" possa ser aplicado.

### História 1.1: Paleta de Cores "Sand & Verity"
> "Como desenvolvedor, eu quero ter as variáveis de cor exatas da Landing Page disponíveis no projeto, para garantir fidelidade visual."
- [ ] **Tarefa**: Converter cores Hex da LP para HSL (suporte a opacidade Shadcn).
- [ ] **Tarefa**: Atualizar `src/app/globals.css` substituindo a paleta "Noble Green" pela "Verity Organic" (Sand backgrounds).
- [ ] **Tarefa**: Configurar `tailwind.config.ts` com os novos objetos de cor (`colors.sand`, `colors.verity`).

### História 1.2: Tipografia Elegante
> "Como designer, quero que os títulos usem 'Crimson Pro', para transmitir a sensação de boutique premium."
- [ ] **Tarefa**: Confirmar importação da fonte `Crimson Pro` no `layout.tsx`.
- [ ] **Tarefa**: Criar classe utilitária `.text-elegant` (`font-display font-medium tracking-tight`).
- [ ] **Tarefa**: Aplicar `font-display` nos headers globais (H1, H2) via CSS base ou componente.

### História 1.3: Atmosfera Global
> "Como usuário, quero sentir a identidade da marca assim que abro o site, vendo o fundo 'Areia' em vez de branco/menta."
- [ ] **Tarefa**: Atualizar a tag `<body>` em `layout.tsx` para usar `bg-sand-100` e `text-verity-900`.
- [ ] **Tarefa**: Ajustar a cor de seleção de texto (`::selection`) para `bg-verity-200`.

---

## ÉPICO 2: Componentes & UI Kit
**Objetivo**: Refinar os blocos de construção (botões, cards, inputs) para saírem do padrão "Shadcn Genérico" para o "Verity Custom".

### História 2.1: Glassmorphism (Efeito de Vidro)
> "Como usuário, quero ver camadas translúcidas e sofisticadas, para sentir que estou usando um software moderno."
- [ ] **Tarefa**: Criar classes utilitárias `.glass-panel` e `.glass-card` no `globals.css` copiando o CSS da LP.
- [ ] **Tarefa**: Atualizar o componente `Card` do Shadcn para suportar variantes `glass`.

### História 2.2: Controles Orgânicos (Inputs & Botões)
> "Como usuário, quero interagir com botões e campos que pareçam táteis e integrados ao fundo areia."
- [ ] **Tarefa**: Aumentar `border-radius` padrão dos botões (de `md` para `xl` ou `full`).
- [ ] **Tarefa**: Alterar cor de borda padrão dos Inputs de `gray-200` para `sand-400`.
- [ ] **Tarefa**: Atualizar estados de foco (`ring`) para usar `verity-400` suave.

---

## ÉPICO 3: Telas de Experiência (Páginas)
**Objetivo**: Aplicar a nova identidade nas telas críticas da jornada do usuário.

### História 3.1: Login Imersivo (A Nova Porta de Entrada)
> "Como novo usuário, quero uma tela de login que seja visualmente idêntica à Landing Page que me convenceu a entrar."
- [ ] **Tarefa**: Remover layout padrão de login (ex: tela dividida simples).
- [ ] **Tarefa**: Implementar fundo com imagem de alta qualidade (lavoura/soja) + Overlay escuro suave.
- [ ] **Tarefa**: Criar container de Login centralizado usando o novo estilo `.glass-panel`.
- [ ] **Tarefa**: Usar tipografia `Crimson Pro` no título de boas-vindas.

### História 3.2: Dashboard Premium
> "Como analista, quero um dashboard que não canse a vista (fundo quente) e destaque os dados importantes (verde profundo)."
- [ ] **Tarefa**: Revisar contraste dos cards de métricas sobre o fundo `sand-100`.
- [ ] **Tarefa**: Atualizar Sidebar para usar um tom `sand-200` ou `glass` em vez de branco chapado.
