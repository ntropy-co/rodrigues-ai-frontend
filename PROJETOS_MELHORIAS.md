# Melhorias para a area de Projetos

Este documento descreve, de forma clara e detalhada, o que um time senior
de Frontend, UI/UX e Design faria para elevar a experiencia da area de
Projetos. A ideia e transformar Projetos em um eixo de organizacao real
para conversas e documentos, com fluxo previsivel, boa visibilidade e
baixa friccao.

## Contexto atual (o que existe hoje)

- Projetos existem apenas no sidebar do chat e servem para filtrar sessoes.
- Criacao de projeto acontece em um dialog simples (nome e descricao).
- A descricao nao aparece na UI e nao e editavel depois.
- Sessoes criadas a partir do chat (sem usar o sidebar) nao recebem
  project_id, logo ficam fora de projetos por padrao.
- A selecao do projeto nao persiste e nao se sincroniza ao abrir /chat/:id.
- Erros de API (401/404) normalmente viram lista vazia, sem feedback ao usuario.
- Nao existe um "Project hub" ou pagina dedicada com contexto do projeto.

## Objetivos do produto

- Projetos devem organizar conversas e documentos por contexto de negocio.
- O usuario deve entender rapidamente "onde estou" e "o que pertence a este projeto".
- A experiencia precisa reduzir cliques, repeticao e erros silenciosos.
- A interface deve escalar para dezenas/centenas de projetos e conversas.

## Melhorias propostas - Frontend

### 1) Estado e sincronizacao do projeto selecionado

**Problema:** o projeto selecionado se perde ao navegar e nao reflete a conversa atual.  
**Solucao:** persistir selecao (URL + store + localStorage) e sincronizar com /chat/:id.  
**Impacto:** contexto consistente; usuario nunca "se perde" entre projetos.

### 2) Associacao de projeto nas novas conversas

**Problema:** novas conversas criadas direto do chat nao tem project_id.  
**Solucao:** incluir project_id no payload de criacao de sessao/chat ou
fluxo que define o projeto antes da primeira mensagem.  
**Impacto:** conversas sempre nascem no projeto certo.

### 3) Mover conversas entre projetos

**Problema:** nao existe forma de reorganizar conversas depois de criadas.  
**Solucao:** adicionar acao "Mover para projeto" (API + UI + atalho).  
**Impacto:** organizacao real sem precisar recomeçar conversas.

### 4) Camada de dados robusta (cache e revalidate)

**Problema:** erros viram lista vazia e nao ha cache/optimistic update.  
**Solucao:** usar cache (ex. react-query), optimistic update e rollback,
além de mensagens claras de erro.  
**Impacto:** interface mais rapida e previsivel.

### 5) Acessibilidade e interacao

**Problema:** acoes criticas dependem de hover e nao tem foco/aria completo.  
**Solucao:** garantir atalhos de teclado, foco visivel, aria-label e
confirmacoes com contexto.  
**Impacto:** experiencia inclusiva e mais confiavel.

### 6) Performance para listas grandes

**Problema:** listas longas podem degradar a fluidez.  
**Solucao:** virtualizacao de listas, debounce no search e prefetch.  
**Impacto:** interface rapida mesmo com muitos projetos e conversas.

## Melhorias propostas - UI/UX

### 1) Modelo mental claro: projeto = container

**Por que:** usuarios precisam entender que projeto agrupa conversas e documentos.  
**Como:** microcopy e layout deixam claro o escopo do projeto e seu conteudo.

### 2) Project hub (pagina dedicada)

**Por que:** sidebar nao oferece contexto nem visao geral.  
**Como:** pagina com overview, conversas recentes, documentos, status e acoes.

### 3) Fluxos de criacao/edicao/arquivo

**Por que:** fluxo atual e minimo e sem gerenciamento de ciclo de vida.  
**Como:** criar, renomear, editar descricao, arquivar e restaurar.

### 4) Organizacao e busca

**Por que:** muitos projetos geram ruido.  
**Como:** filtros, favoritos, ordenacao e busca por nome/descricao.

### 5) Instrumentacao e aprendizado continuo

**Por que:** sem dados, melhorias viram opiniao.  
**Como:** eventos de criacao, selecao, troca e arquivo para medir impacto.

## Melhorias propostas - Design

### 1) Hierarquia visual clara

**Problema:** projeto e conversa parecem o mesmo card.  
**Solucao:** estilos e icones distintos para cada tipo.

### 2) Metadados leves e uteis

**Exemplos:** contagem de conversas, ultima atividade, status (ativo/arquivado).  
**Resultado:** decisao rapida ao escanear a lista.

### 3) Estados completos

**Necessario:** vazio, loading, erro, hover, ativo, foco, arquivado.  
**Resultado:** UX consistente e confiavel.

### 4) CTA "Novo Projeto" evidente

**Problema:** acao importante com pouco destaque.  
**Solucao:** CTA com hierarquia visual clara e feedback ao criar.

### 5) Motion com proposito

**Problema:** pouca resposta visual.  
**Solucao:** animacoes sutis para selecao, criacao e reorganizacao.

## Fases sugeridas (pragmatico)

**Fase 1 (rapida):** persistir selecao, melhorar erros, exibir descricao,
padronizar estados e microcopy.  
**Fase 2 (media):** mover conversas, project hub, favoritos/ordenacao.  
**Fase 3 (avancada):** drag-and-drop, insights por projeto, automacoes.

## Dependencias possiveis de backend

- Endpoint para mover sessao entre projetos.
- Endpoint para stats por projeto (conversas, documentos, ultima atividade).
- Ajuste no endpoint de chat para aceitar project_id no inicio da sessao.

## Metricas de sucesso

- % de conversas com project_id.
- Tempo medio para encontrar uma conversa.
- Numero de projetos criados por usuario ativo.
- Taxa de uso de "mover conversa" e "arquivar projeto".

## Perguntas em aberto

- Projetos sao pessoais ou podem ser compartilhados?
- Qual o limite esperado de projetos por usuario?
- Projeto deve agrupar tambem documentos fora do chat?
- Qual o criterio para arquivamento automatico?

## Backlog priorizado (epicos e historias)

Premissas: sem visao compartilhada, governanca alta, sem integracoes externas.

### P0 - Fundacao e governanca

**Epico: Modelo de governanca e auditoria**

- Historia: definir politicas de governanca (permissoes, acoes criticas, retencao, arquivamento).
  - Aceite: documento de regras aprovado; lista de acoes criticas mapeada.
- Historia: registrar eventos de governanca (criar, renomear, arquivar, mover conversa).
  - Aceite: eventos disponiveis no log local da aplicacao e exportaveis por suporte interno.

**Epico: Consistencia de contexto**

- [x] Historia: persistir projeto selecionado (URL + store + localStorage).
  - Aceite: ao recarregar, projeto permanece selecionado; URL reflete o contexto.
- [ ] Historia: sincronizar projeto ativo com /chat/:id.
  - Aceite: abrir uma conversa ajusta o projeto automaticamente.

**Epico: Confiabilidade da criacao de conversas**

- [x] Historia: incluir project_id em toda nova conversa criada pelo chat.
  - Aceite: 100% das novas conversas possuem project_id.
- Historia: tratar erros de API com mensagens claras e retry.
  - Aceite: 401/404/timeout exibem mensagem e acao de tentar novamente.

**Epico: Base de UX e acessibilidade**

- Historia: estados completos (loading, vazio, erro, foco, ativo, hover, arquivado).
  - Aceite: todos os estados definidos e consistentes no sidebar e hub.
- Historia: acessibilidade essencial (teclado, foco visivel, aria-label).
  - Aceite: navega por teclado e leitor de tela sem perda de contexto.

### P1 - Organizacao e visao dedicada

**Epico: Project Hub**

- [x] Historia: criar pagina dedicada com overview e acoes principais.
  - Aceite: hub mostra descricao, conversas recentes e acoes de gestao.
- Historia: exibir e editar descricao do projeto.
  - Aceite: descricao visivel no hub e editavel com confirmacao.

**Epico: Organizacao e busca**

- Historia: busca por nome/descricao com debounce.
  - Aceite: resultados em tempo real com atraso controlado.
- Historia: filtros e ordenacao (nome, atividade, status).
  - Aceite: preferencia persistida por usuario.
- Historia: favoritos/pin de projetos.
  - Aceite: projetos fixados aparecem no topo.

**Epico: Reorganizacao de conversas**

- Historia: mover conversa entre projetos.
  - Aceite: conversa muda de projeto e aparece na lista correta.
- Historia: undo imediato para mover/arquivar.
  - Aceite: desfazer disponivel por alguns segundos apos a acao.

**Epico: Instrumentacao basica**

- Historia: eventos de criacao, selecao e troca de projeto.
  - Aceite: eventos registrados com timestamp e id de usuario.

### P2 - Escala e produtividade

**Epico: Acoes em massa**

- Historia: selecionar varias conversas para mover/arquivar.
  - Aceite: operacao em lote com confirmacao e feedback.

**Epico: Performance de listas grandes**

- Historia: virtualizacao de listas.
  - Aceite: scroll fluido com centenas de itens.
- Historia: prefetch de conversas recentes.
  - Aceite: abertura de conversas recentes mais rapida.

**Epico: Fluxos de melhoria**

- Historia: banner para conversas sem projeto.
  - Aceite: banner com CTA para atribuir projeto.
- Historia: templates de projeto (campos e estrutura).
  - Aceite: criar projeto a partir de template preenche campos basicos.

### P3 - Experiencia avancada

**Epico: Contexto estruturado**

- Historia: brief estruturado do projeto (objetivo, escopo, status).
  - Aceite: campos obrigatorios e validacao simples.

**Epico: Sugestao local**

- Historia: sugerir projeto ao iniciar chat por heuristica local.
  - Aceite: sugestao baseada em ultima atividade e palavras-chave.

**Epico: Onboarding**

- Historia: onboarding leve na primeira criacao de projeto.
  - Aceite: walkthrough curto com opcao de pular.
