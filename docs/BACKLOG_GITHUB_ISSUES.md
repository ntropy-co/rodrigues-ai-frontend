# Backlog - GitHub Issues Format

Este documento contem todas as issues necessarias para implementar as 10 funcionalidades do piloto Verity Agro.

---

## Labels Sugeridas

```
Tipo:
- feature
- bug
- enhancement
- docs
- infra

Prioridade:
- P0-critical
- P1-high
- P2-medium
- P3-low

Area:
- frontend
- backend
- devops
- design
- content

Feature:
- feat-1-duvidas
- feat-2-analisar
- feat-3-resumir
- feat-4-criar
- feat-5-simular
- feat-6-extrator
- feat-7-compliance
- feat-8-risco
- feat-9-cotacoes
- feat-10-minuta

Sprint:
- sprint-1
- sprint-2
- sprint-3
- sprint-4
```

---

## Epics

### Epic 1: Infraestrutura Base

### Epic 2: Chat Inteligente (Feature 1)

### Epic 3: Analise de Documentos (Features 2, 3, 6, 7)

### Epic 4: Geracao de Documentos (Features 4, 10)

### Epic 5: Calculadoras e Simuladores (Features 5, 8)

### Epic 6: Integracao de Mercado (Feature 9)

---

## Issues por Feature

---

## FEATURE 1: Tirar Duvidas sobre CPR

### Issue #1

**Titulo:** [BACKEND] Criar endpoint de chat com suporte a RAG
**Labels:** `feature` `backend` `P1-high` `feat-1-duvidas` `sprint-1`
**Descricao:**

````markdown
## Objetivo

Modificar ou criar endpoint de chat que suporte busca em base de conhecimento (RAG).

## Requisitos

- [ ] Receber mensagem do usuario
- [ ] Buscar contexto relevante no Vertex AI Search
- [ ] Montar prompt com contexto
- [ ] Chamar Gemini com prompt enriquecido
- [ ] Retornar resposta com fontes/citacoes

## Endpoint

`POST /api/v1/chat/rag`

## Request

```json
{
  "message": "O que e uma CPR fisica?",
  "session_id": "s_xxx",
  "use_rag": true
}
```
````

## Response

```json
{
  "text": "A CPR Fisica e...",
  "session_id": "s_xxx",
  "sources": [{ "title": "Lei 8.929/94", "section": "Art. 4" }]
}
```

## Criterios de Aceite

- [ ] Endpoint responde em menos de 5s
- [ ] Fontes sao retornadas quando RAG e usado
- [ ] Fallback para chat normal se RAG falhar

````

---

### Issue #2
**Titulo:** [GCP] Configurar Vertex AI Search datastore para base CPR
**Labels:** `infra` `devops` `P1-high` `feat-1-duvidas` `sprint-1`
**Descricao:**
```markdown
## Objetivo
Criar e configurar datastore no Vertex AI Search para indexar documentos sobre CPR.

## Tarefas
- [ ] Criar projeto no GCP (se nao existir)
- [ ] Habilitar Vertex AI Search API
- [ ] Criar datastore do tipo "unstructured"
- [ ] Configurar schema de metadados
- [ ] Testar busca manual

## Configuracoes
- Nome: `verity-cpr-knowledge`
- Tipo: Unstructured documents
- Regiao: us-central1 (ou southamerica-east1)

## Documentacao
- Link para console GCP
- Credenciais necessarias
- Custos estimados
````

---

### Issue #3

**Titulo:** [CONTEUDO] Coletar e estruturar base de conhecimento CPR
**Labels:** `content` `P1-high` `feat-1-duvidas` `sprint-1`
**Descricao:**

```markdown
## Objetivo

Criar base de conhecimento sobre CPR para alimentar o sistema RAG.

## Fontes a coletar

- [ ] Lei 8.929/94 (texto completo)
- [ ] Lei 13.986/2020 (atualizacoes)
- [ ] Resolucoes do Banco Central sobre CPR
- [ ] Manual de Credito Rural (MCR)
- [ ] FAQs de bancos sobre CPR
- [ ] Artigos tecnicos sobre CPR

## Formato de saida

- Arquivos PDF ou TXT
- Organizados por categoria
- Metadados: titulo, fonte, data, categoria

## Estrutura de pastas
```

/knowledge-base
/legislacao
/manuais
/faqs
/artigos

```

## Criterios de Aceite
- [ ] Minimo 20 documentos coletados
- [ ] Todos com metadados preenchidos
- [ ] Revisados por especialista em CPR
```

---

### Issue #4

**Titulo:** [GCP] Indexar documentos no Vertex AI Search
**Labels:** `infra` `backend` `P1-high` `feat-1-duvidas` `sprint-1`
**Descricao:**

```markdown
## Objetivo

Fazer upload e indexacao dos documentos da base de conhecimento.

## Prerequisitos

- Issue #2 (datastore criado)
- Issue #3 (documentos coletados)

## Tarefas

- [ ] Criar script de upload para Vertex AI Search
- [ ] Fazer upload dos documentos
- [ ] Aguardar indexacao
- [ ] Testar buscas de exemplo
- [ ] Validar relevancia dos resultados

## Queries de teste

1. "O que e CPR fisica"
2. "Requisitos obrigatorios de uma CPR"
3. "Diferenca entre CPR e CPR-F"
4. "Prazo maximo de uma CPR"
```

---

### Issue #5

**Titulo:** [BACKEND] Integrar Vertex AI Search no servico de chat
**Labels:** `backend` `P1-high` `feat-1-duvidas` `sprint-2`
**Descricao:**

````markdown
## Objetivo

Criar servico que busca contexto no Vertex AI Search.

## Prerequisitos

- Issue #4 (documentos indexados)

## Tarefas

- [ ] Criar cliente Vertex AI Search
- [ ] Implementar funcao de busca semantica
- [ ] Formatar resultados para uso no prompt
- [ ] Adicionar cache de buscas frequentes
- [ ] Implementar fallback para busca vazia

## Interface

```python
class VertexSearchService:
    async def search(self, query: str, top_k: int = 5) -> List[SearchResult]:
        pass
```
````

## Criterios de Aceite

- [ ] Busca retorna top 5 resultados relevantes
- [ ] Latencia < 500ms
- [ ] Tratamento de erros implementado

````

---

### Issue #6
**Titulo:** [FRONTEND] Exibir fontes/citacoes nas respostas do chat
**Labels:** `frontend` `P2-medium` `feat-1-duvidas` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Mostrar as fontes usadas para gerar a resposta do assistente.

## Tarefas
- [ ] Criar componente `SourceCitation`
- [ ] Modificar `MessageBubble` para exibir fontes
- [ ] Estilizar citacoes de forma discreta
- [ ] Adicionar tooltip com detalhes da fonte

## Design
````

+------------------------------------------+
| Verity: A CPR Fisica e uma Cedula... |
| |
| Fontes: Lei 8.929/94, Art. 4 |
+------------------------------------------+

```

## Criterios de Aceite
- [ ] Fontes aparecem abaixo da resposta
- [ ] Clicavel para ver mais detalhes
- [ ] Nao aparece se nao houver fontes
```

---

### Issue #7

**Titulo:** [FRONTEND] Adicionar indicador "Buscando na base de conhecimento..."
**Labels:** `frontend` `P3-low` `feat-1-duvidas` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Mostrar ao usuario que o sistema esta buscando informacoes na base de conhecimento.

## Tarefas

- [ ] Criar componente de loading especifico para RAG
- [ ] Mostrar durante a busca (antes da resposta)
- [ ] Animacao sutil e informativa

## Design
```

+------------------------------------------+
| [icon] Buscando na base de conhecimento |
| .... |
+------------------------------------------+

```

```

---

### Issue #8

**Titulo:** [GCP] Configurar Dialogflow CX para perguntas complexas
**Labels:** `infra` `P2-medium` `feat-1-duvidas` `sprint-3`
**Descricao:**

```markdown
## Objetivo

Configurar Dialogflow CX como camada de orquestracao para perguntas complexas.

## Tarefas

- [ ] Criar agente Dialogflow CX
- [ ] Configurar Data Store connector (Vertex AI Search)
- [ ] Criar fluxos para tipos de perguntas
- [ ] Configurar fallback para Gemini
- [ ] Testar integracao

## Fluxos

1. FAQ simples -> resposta direta
2. Pergunta sobre legislacao -> busca Vertex + Gemini
3. Pergunta ambigua -> clarificacao

## Observacao

Esta issue e opcional para o MVP. Pode usar RAG direto no comeco.
```

---

## FEATURE 2: Analisar/Corrigir CPR

### Issue #9

**Titulo:** [BACKEND] Criar endpoint de analise de CPR
**Labels:** `feature` `backend` `P1-high` `feat-2-analisar` `sprint-1`
**Descricao:**

````markdown
## Objetivo

Criar endpoint que recebe um documento CPR e retorna analise com erros e sugestoes.

## Endpoint

`POST /api/v1/documents/{document_id}/analyze`

## Response

```json
{
  "document_id": "doc_xxx",
  "status": "attention_required",
  "score": 75,
  "issues": [
    {
      "type": "critical",
      "field": "vencimento",
      "message": "Data de vencimento anterior a emissao",
      "location": "linha 15",
      "suggestion": "Corrigir para data futura"
    }
  ],
  "suggestions": [
    {
      "type": "improvement",
      "field": "produto",
      "message": "Descricao do produto pouco detalhada",
      "current": "Soja",
      "suggested": "Soja em graos, tipo exportacao, safra 2024/2025"
    }
  ]
}
```
````

## Criterios de Aceite

- [ ] Identifica erros criticos (dados faltantes, inconsistencias)
- [ ] Sugere melhorias
- [ ] Retorna score de 0-100
- [ ] Tempo de resposta < 30s

````

---

### Issue #10
**Titulo:** [BACKEND] Integrar Gemini Vision para extracao de texto de PDF
**Labels:** `backend` `P1-high` `feat-2-analisar` `sprint-1`
**Descricao:**
```markdown
## Objetivo
Usar Gemini Vision para extrair texto de PDFs de CPR.

## Tarefas
- [ ] Criar servico de extracao de texto
- [ ] Integrar Gemini 1.5 Pro Vision
- [ ] Tratar PDFs de multiplas paginas
- [ ] Cachear extracao para reutilizacao
- [ ] Fallback para PyPDF se Vision falhar

## Interface
```python
class DocumentExtractor:
    async def extract_text(self, file_path: str) -> str:
        pass

    async def extract_structured(self, file_path: str) -> CPRData:
        pass
````

## Criterios de Aceite

- [ ] Extrai texto de PDFs escaneados (OCR)
- [ ] Extrai texto de PDFs digitais
- [ ] Mantem estrutura basica do documento

````

---

### Issue #11
**Titulo:** [BACKEND] Criar prompt estruturado para analise de CPR
**Labels:** `backend` `P1-high` `feat-2-analisar` `sprint-1`
**Descricao:**
```markdown
## Objetivo
Desenvolver prompt que analisa CPR e identifica erros.

## Tarefas
- [ ] Criar prompt base para analise
- [ ] Incluir regras da Lei 8.929/94
- [ ] Definir categorias de erros (critico, alerta, sugestao)
- [ ] Testar com CPRs de exemplo
- [ ] Iterar e melhorar prompt

## Estrutura do Prompt
````

Voce e um especialista em CPR (Cedula de Produto Rural).
Analise o documento abaixo e identifique:

1. ERROS CRITICOS (impedem validade):
   - Campos obrigatorios ausentes
   - Inconsistencias de datas
   - Dados invalidos

2. ALERTAS (podem causar problemas):
   - Informacoes incompletas
   - Clausulas ambiguas

3. SUGESTOES (melhorias):
   - Detalhamentos recomendados
   - Boas praticas

[DOCUMENTO]
{texto_extraido}

Responda em JSON no formato:
{schema}

```

```

---

### Issue #12

**Titulo:** [BACKEND] Implementar regras de validacao de CPR
**Labels:** `backend` `P1-high` `feat-2-analisar` `sprint-1`
**Descricao:**

````markdown
## Objetivo

Criar validacoes programaticas alem da analise por IA.

## Regras a implementar (Lei 8.929/94)

- [ ] Denominacao "Cedula de Produto Rural" presente
- [ ] Data de emissao presente e valida
- [ ] Local de emissao presente
- [ ] Nome/razao social do emitente
- [ ] CPF/CNPJ do emitente
- [ ] Endereco do emitente
- [ ] Promessa de entrega do produto
- [ ] Descricao do produto com qualidade
- [ ] Quantidade do produto
- [ ] Local de entrega
- [ ] Prazo/data de entrega
- [ ] Nome do credor
- [ ] Data de vencimento > Data de emissao
- [ ] Valores numericos consistentes

## Interface

```python
class CPRValidator:
    def validate(self, cpr_data: CPRData) -> ValidationResult:
        pass
```
````

````

---

### Issue #13
**Titulo:** [FRONTEND] Criar componente AnalysisResult
**Labels:** `frontend` `P1-high` `feat-2-analisar` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Componente para exibir resultado da analise de CPR.

## Tarefas
- [ ] Criar componente AnalysisResult
- [ ] Secao de erros criticos (vermelho)
- [ ] Secao de alertas (amarelo)
- [ ] Secao de sugestoes (azul)
- [ ] Score visual (gauge ou progress)
- [ ] Botao "Baixar Relatorio PDF"

## Props
```typescript
interface AnalysisResultProps {
  documentId: string
  status: 'ok' | 'attention' | 'critical'
  score: number
  issues: Issue[]
  suggestions: Suggestion[]
  onExportPDF: () => void
}
````

## Design

Ver mockup no PLANO_PILOTO_ESTRATEGICO.md

````

---

### Issue #14
**Titulo:** [FRONTEND] Criar pagina de analise de CPR
**Labels:** `frontend` `P1-high` `feat-2-analisar` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Pagina dedicada para analise de documentos CPR.

## Tarefas
- [ ] Criar rota /analyze ou /analise
- [ ] Area de upload de documento
- [ ] Botao "Analisar"
- [ ] Loading state durante analise
- [ ] Exibir AnalysisResult
- [ ] Historico de analises recentes

## Fluxo
1. Usuario faz upload da CPR
2. Clica em "Analisar"
3. Sistema processa (loading)
4. Exibe resultado da analise
5. Opcao de exportar/salvar
````

---

### Issue #15

**Titulo:** [FRONTEND] Adicionar botao "Analisar" apos upload
**Labels:** `frontend` `P2-medium` `feat-2-analisar` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Permitir analise direta apos upload de documento.

## Tarefas

- [ ] Adicionar botao "Analisar" no FileUploadModal
- [ ] Adicionar opcao no menu de documento
- [ ] Navegar para pagina de analise ou abrir modal

## UX

Apos upload bem-sucedido:

- Botao "Ver Documento"
- Botao "Analisar" (novo)
```

---

### Issue #16

**Titulo:** [BACKEND] Gerar relatorio PDF da analise
**Labels:** `backend` `P2-medium` `feat-2-analisar` `sprint-3`
**Descricao:**

```markdown
## Objetivo

Permitir exportar resultado da analise em PDF.

## Endpoint

`GET /api/v1/documents/{document_id}/analysis/pdf`

## Tarefas

- [ ] Criar template HTML do relatorio
- [ ] Integrar puppeteer ou html-pdf
- [ ] Gerar PDF com resultado da analise
- [ ] Incluir logo, data, identificacao

## Conteudo do PDF

- Cabecalho com logo Verity
- Identificacao do documento
- Score de compliance
- Lista de erros
- Lista de sugestoes
- Data/hora da analise
```

---

### Issue #17

**Titulo:** [FRONTEND] Botao "Aplicar Sugestoes" na analise
**Labels:** `frontend` `P3-low` `feat-2-analisar` `sprint-4`
**Descricao:**

```markdown
## Objetivo

Permitir aplicar sugestoes automaticamente (quando possivel).

## Observacao

Esta e uma feature avancada para versoes futuras.
No MVP, apenas mostrar as sugestoes para o usuario aplicar manualmente.
```

---

## FEATURE 3: Resumir CPR

### Issue #18

**Titulo:** [BACKEND] Criar endpoint de resumo de CPR
**Labels:** `feature` `backend` `P1-high` `feat-3-resumir` `sprint-2`
**Descricao:**

````markdown
## Objetivo

Criar endpoint que gera resumo executivo de uma CPR.

## Endpoint

`POST /api/v1/documents/{document_id}/summarize`

## Response

```json
{
  "document_id": "doc_xxx",
  "summary": {
    "partes": {
      "emitente": { "nome": "...", "cnpj": "..." },
      "credor": { "nome": "...", "cnpj": "..." },
      "avalista": { "nome": "...", "cpf": "..." }
    },
    "objeto": {
      "produto": "Soja em graos",
      "quantidade": "5.000 sacas",
      "qualidade": "Padrao exportacao"
    },
    "valores": {
      "total": 750000,
      "preco_unitario": 150
    },
    "prazos": {
      "emissao": "2024-12-15",
      "vencimento": "2025-06-15",
      "prazo_dias": 180
    },
    "garantias": ["Penhor de safra", "Aval pessoal"],
    "local_entrega": "Armazem XYZ..."
  }
}
```
````

## Criterios de Aceite

- [ ] Extrai todas as informacoes principais
- [ ] Formato estruturado e consistente
- [ ] Tempo < 20s

````

---

### Issue #19
**Titulo:** [BACKEND] Criar prompt para extracao estruturada
**Labels:** `backend` `P1-high` `feat-3-resumir` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Prompt que extrai dados estruturados de uma CPR.

## Schema de extracao
```json
{
  "tipo_cpr": "fisica|financeira",
  "numero": "string",
  "emitente": {
    "nome": "string",
    "documento": "string",
    "endereco": "string"
  },
  "credor": {...},
  "produto": {
    "tipo": "string",
    "quantidade": "number",
    "unidade": "string",
    "qualidade": "string"
  },
  "valores": {
    "total": "number",
    "moeda": "BRL",
    "preco_unitario": "number"
  },
  "datas": {
    "emissao": "date",
    "vencimento": "date"
  },
  "garantias": ["string"],
  "avalista": {...},
  "local_entrega": "string",
  "clausulas_especiais": ["string"]
}
````

## Prompt deve

- [ ] Usar JSON mode do Gemini
- [ ] Tratar campos ausentes graciosamente
- [ ] Normalizar formatos (datas, valores)

````

---

### Issue #20
**Titulo:** [FRONTEND] Criar componente CPRSummary
**Labels:** `frontend` `P1-high` `feat-3-resumir` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Componente para exibir resumo estruturado da CPR.

## Tarefas
- [ ] Layout em secoes (Partes, Objeto, Valores, etc.)
- [ ] Formatacao de valores monetarios
- [ ] Formatacao de datas
- [ ] Icones por categoria
- [ ] Responsivo

## Botoes de acao
- [ ] Copiar (texto formatado)
- [ ] Exportar PDF
- [ ] Exportar Excel
````

---

### Issue #21

**Titulo:** [FRONTEND] Botao "Resumir" apos upload
**Labels:** `frontend` `P2-medium` `feat-3-resumir` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Adicionar opcao de resumir documento apos upload.

## Tarefas

- [ ] Botao no menu do documento
- [ ] Modal ou pagina de resumo
- [ ] Loading durante processamento
```

---

### Issue #22

**Titulo:** [FRONTEND] Exportar resumo em Excel
**Labels:** `frontend` `P2-medium` `feat-3-resumir` `sprint-3`
**Descricao:**

```markdown
## Objetivo

Permitir exportar dados do resumo para Excel.

## Tarefas

- [ ] Instalar biblioteca xlsx
- [ ] Criar funcao de exportacao
- [ ] Formatar dados em colunas
- [ ] Download automatico

## Dependencia

- npm: xlsx
```

---

### Issue #23

**Titulo:** [FRONTEND] Exportar resumo em PDF
**Labels:** `frontend` `P2-medium` `feat-3-resumir` `sprint-3`
**Descricao:**

```markdown
## Objetivo

Gerar PDF do resumo executivo.

## Opcoes

1. Chamar endpoint backend que gera PDF
2. Gerar no frontend com jspdf ou react-pdf

## Recomendacao

Usar backend (reutiliza logica da feature 2).
```

---

## FEATURE 4: Criar/Fazer CPR

### Issue #24

**Titulo:** [FRONTEND] Criar componente CPRWizard (formulario multi-step)
**Labels:** `feature` `frontend` `P1-high` `feat-4-criar` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Wizard de criacao de CPR com formulario em etapas.

## Steps

1. Tipo de CPR + Dados do Emitente
2. Dados do Credor
3. Produto e Quantidade
4. Valores e Prazos
5. Garantias e Avalista
6. Revisao e Geracao

## Tarefas

- [ ] Criar componente Stepper/Wizard
- [ ] Criar formularios de cada step
- [ ] Validacao por step (React Hook Form + Zod)
- [ ] Persistir estado entre steps
- [ ] Navegacao anterior/proximo
- [ ] Indicador de progresso

## Bibliotecas

- react-hook-form
- zod
- @hookform/resolvers
```

---

### Issue #25

**Titulo:** [FRONTEND] Step 1 - Tipo de CPR e Dados do Emitente
**Labels:** `frontend` `P1-high` `feat-4-criar` `sprint-2`
**Descricao:**

```markdown
## Campos

- [ ] Tipo de CPR (radio: Fisica / Financeira)
- [ ] Razao Social do Emitente
- [ ] CNPJ do Emitente (com mascara)
- [ ] Endereco completo
- [ ] Cidade / UF
- [ ] Representante legal (nome)

## Validacoes

- CNPJ valido
- Campos obrigatorios preenchidos
```

---

### Issue #26

**Titulo:** [FRONTEND] Step 2 - Dados do Credor
**Labels:** `frontend` `P1-high` `feat-4-criar` `sprint-2`
**Descricao:**

```markdown
## Campos

- [ ] Razao Social do Credor
- [ ] CNPJ do Credor
- [ ] Endereco (opcional)
- [ ] Contato (opcional)

## Validacoes

- CNPJ valido
- Razao social obrigatoria
```

---

### Issue #27

**Titulo:** [FRONTEND] Step 3 - Produto e Quantidade
**Labels:** `frontend` `P1-high` `feat-4-criar` `sprint-2`
**Descricao:**

```markdown
## Campos

- [ ] Tipo de Produto (select: Soja, Milho, Cafe, etc.)
- [ ] Produto personalizado (se "Outro")
- [ ] Quantidade (numero)
- [ ] Unidade (select: sacas 60kg, toneladas, arrobas)
- [ ] Qualidade/Especificacao (textarea)
- [ ] Safra (ex: 2024/2025)

## Validacoes

- Quantidade > 0
- Produto selecionado
```

---

### Issue #28

**Titulo:** [FRONTEND] Step 4 - Valores e Prazos
**Labels:** `frontend` `P1-high` `feat-4-criar` `sprint-2`
**Descricao:**

```markdown
## Campos

- [ ] Valor Total (R$, com mascara)
- [ ] Preco Unitario (calculado ou manual)
- [ ] Data de Emissao (date picker)
- [ ] Data de Vencimento (date picker)
- [ ] Local de Entrega (endereco)
- [ ] Indice de Correcao (select: IPCA, IGP-M, Nenhum)

## Validacoes

- Vencimento > Emissao
- Valores positivos
- Local de entrega preenchido

## Calculo automatico

Preco Unitario = Valor Total / Quantidade
```

---

### Issue #29

**Titulo:** [FRONTEND] Step 5 - Garantias e Avalista
**Labels:** `frontend` `P1-high` `feat-4-criar` `sprint-2`
**Descricao:**

```markdown
## Campos Garantias

- [ ] Tipo de Garantia (multiselect)
  - Penhor de safra
  - Hipoteca
  - Alienacao fiduciaria
  - Outros
- [ ] Descricao da garantia (textarea)

## Campos Avalista (opcional)

- [ ] Tem avalista? (toggle)
- [ ] Nome do Avalista
- [ ] CPF/CNPJ do Avalista
- [ ] Endereco do Avalista
```

---

### Issue #30

**Titulo:** [FRONTEND] Step 6 - Revisao e Geracao
**Labels:** `frontend` `P1-high` `feat-4-criar` `sprint-2`
**Descricao:**

```markdown
## Tarefas

- [ ] Exibir resumo de todos os dados
- [ ] Permitir edicao (voltar ao step)
- [ ] Checkbox de confirmacao
- [ ] Botao "Gerar Documento"
- [ ] Loading durante geracao
- [ ] Exibir opcoes de download (Word, PDF)
```

---

### Issue #31

**Titulo:** [BACKEND] Criar endpoint de geracao de CPR
**Labels:** `backend` `P1-high` `feat-4-criar` `sprint-2`
**Descricao:**

````markdown
## Objetivo

Endpoint que recebe dados e gera documento CPR.

## Endpoint

`POST /api/v1/cpr/generate`

## Request

```json
{
  "tipo": "financeira",
  "emitente": {...},
  "credor": {...},
  "produto": {...},
  "valores": {...},
  "datas": {...},
  "garantias": [...],
  "avalista": {...},
  "formato": "pdf" // ou "docx"
}
```
````

## Response

```json
{
  "id": "cpr_xxx",
  "status": "generated",
  "download_url": "/api/v1/cpr/cpr_xxx/download",
  "formats_available": ["pdf", "docx"]
}
```

## Tarefas

- [ ] Validar dados recebidos
- [ ] Carregar template
- [ ] Substituir variaveis
- [ ] Gerar documento
- [ ] Salvar no storage
- [ ] Retornar URL de download

````

---

### Issue #32
**Titulo:** [BACKEND] Integrar biblioteca docx para gerar Word
**Labels:** `backend` `P1-high` `feat-4-criar` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Gerar documentos Word (.docx) a partir de template.

## Biblioteca
- Python: python-docx
- Node: docx (se backend Node)

## Tarefas
- [ ] Criar template Word base
- [ ] Implementar substituicao de variaveis
- [ ] Preservar formatacao
- [ ] Testar geracao
````

---

### Issue #33

**Titulo:** [BACKEND] Integrar puppeteer para gerar PDF
**Labels:** `backend` `P1-high` `feat-4-criar` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Gerar PDFs a partir de HTML/template.

## Opcoes

- puppeteer (mais features)
- html-pdf (mais simples)
- weasyprint (Python)

## Tarefas

- [ ] Criar template HTML da CPR
- [ ] Configurar puppeteer/alternativa
- [ ] Implementar geracao de PDF
- [ ] Otimizar para tamanho/qualidade
```

---

### Issue #34

**Titulo:** [CONTEUDO] Criar templates de CPR Fisica e Financeira
**Labels:** `content` `P1-high` `feat-4-criar` `sprint-1`
**Descricao:**

```markdown
## Objetivo

Criar minutas/templates juridicos de CPR.

## Templates necessarios

- [ ] CPR Fisica
- [ ] CPR Financeira

## Requisitos

- Conformidade com Lei 8.929/94
- Variaveis substituiveis marcadas: {{variavel}}
- Revisao por advogado especialista
- Clausulas obrigatorias incluidas

## Formato

- Word (.docx) com marcadores
- HTML para geracao PDF
```

---

### Issue #35

**Titulo:** [DATABASE] Criar tabela para CPRs geradas
**Labels:** `backend` `infra` `P2-medium` `feat-4-criar` `sprint-2`
**Descricao:**

````markdown
## Objetivo

Armazenar CPRs criadas pelo sistema.

## Schema

```sql
CREATE TABLE cprs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tipo VARCHAR(20), -- 'fisica' | 'financeira'
  dados JSONB, -- dados completos da CPR
  status VARCHAR(20), -- 'draft' | 'generated' | 'signed'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```
````

## Indices

- user_id
- created_at

````

---

## FEATURE 5: Simular CPR (Valores)

### Issue #36
**Titulo:** [FRONTEND] Criar componente CPRSimulator
**Labels:** `feature` `frontend` `P1-high` `feat-5-simular` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Calculadora de simulacao de valores de CPR.

## Inputs
- [ ] Produto (select)
- [ ] Quantidade (number)
- [ ] Preco por unidade (currency)
- [ ] Prazo em dias (number)
- [ ] Taxa ao mes (percentage)

## Outputs (calculados)
- [ ] Valor Bruto
- [ ] Desconto (taxa * prazo)
- [ ] Valor Liquido
- [ ] Cotacao atual do mercado
- [ ] Variacao vs mercado

## Formulas
````

valor_bruto = quantidade _ preco_unitario
desconto = valor_bruto _ (taxa_mes/100) _ (prazo_dias/30)
valor_liquido = valor_bruto - desconto
variacao = ((preco_unitario - cotacao_mercado) / cotacao_mercado) _ 100

```

```

---

### Issue #37

**Titulo:** [BACKEND] Criar endpoint de cotacoes atuais
**Labels:** `backend` `P1-high` `feat-5-simular` `sprint-2`
**Descricao:**

````markdown
## Objetivo

Retornar cotacoes atuais de commodities.

## Endpoint

`GET /api/v1/quotes/current?product=soja`

## Response

```json
{
  "product": "soja",
  "prices": {
    "spot": {
      "value": 145.0,
      "unit": "saca_60kg",
      "currency": "BRL"
    },
    "cbot": {
      "value": 10.25,
      "unit": "bushel",
      "currency": "USD"
    }
  },
  "exchange_rate": {
    "usd_brl": 6.05
  },
  "updated_at": "2024-12-12T10:00:00Z"
}
```
````

## Produtos suportados

- soja
- milho
- cafe
- trigo
- algodao

````

---

### Issue #38
**Titulo:** [BACKEND] Integrar API de cotacoes
**Labels:** `backend` `P1-high` `feat-5-simular` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Integrar fonte de dados de cotacoes de commodities.

## Fontes possiveis
1. CEPEA/ESALQ (gratuito, diario)
2. Agrolink API
3. B3 (oficial, mais complexo)
4. Yahoo Finance (internacional)

## Tarefas
- [ ] Pesquisar APIs disponiveis
- [ ] Avaliar custo/disponibilidade
- [ ] Implementar integracao
- [ ] Cachear resultados (TTL 1h)
- [ ] Fallback para dados anteriores

## Recomendacao
Comecar com CEPEA (gratuito) e evoluir.
````

---

### Issue #39

**Titulo:** [FRONTEND] Logica de calculo no simulador
**Labels:** `frontend` `P1-high` `feat-5-simular` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Implementar calculos em tempo real no frontend.

## Tarefas

- [ ] Calculo reativo (useEffect ou useMemo)
- [ ] Formatacao de valores (BRL)
- [ ] Validacao de inputs
- [ ] Exibicao instantanea
```

---

### Issue #40

**Titulo:** [BACKEND] Salvar historico de simulacoes
**Labels:** `backend` `P2-medium` `feat-5-simular` `sprint-3`
**Descricao:**

````markdown
## Objetivo

Permitir salvar e consultar simulacoes anteriores.

## Endpoints

- `POST /api/v1/simulations` - salvar
- `GET /api/v1/simulations` - listar

## Schema

```sql
CREATE TABLE simulations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product VARCHAR(50),
  quantity DECIMAL,
  price DECIMAL,
  days INTEGER,
  rate DECIMAL,
  result JSONB,
  created_at TIMESTAMP
);
```
````

````

---

### Issue #41
**Titulo:** [FRONTEND] Comparacao com mercado no simulador
**Labels:** `frontend` `P2-medium` `feat-5-simular` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Mostrar como o preco da simulacao se compara ao mercado.

## Exibicao
- Cotacao atual
- Diferenca em %
- Indicador visual (acima/abaixo)
- Contexto (media 6 meses, min, max)
````

---

### Issue #42

**Titulo:** [FRONTEND] Botao "Criar CPR" a partir da simulacao
**Labels:** `frontend` `P3-low` `feat-5-simular` `sprint-3`
**Descricao:**

```markdown
## Objetivo

Permitir iniciar criacao de CPR com dados da simulacao preenchidos.

## Tarefas

- [ ] Botao "Criar CPR com estes valores"
- [ ] Navegar para wizard preenchido
- [ ] Passar dados via state/URL
```

---

## FEATURE 6: Extrator de Dados Estruturados

### Issue #43

**Titulo:** [BACKEND] Criar endpoint de extracao estruturada
**Labels:** `feature` `backend` `P1-high` `feat-6-extrator` `sprint-2`
**Descricao:**

````markdown
## Objetivo

Extrair dados estruturados de documento CPR.

## Endpoint

`POST /api/v1/documents/{document_id}/extract`

## Response

```json
{
  "document_id": "doc_xxx",
  "extracted_data": {
    "tipo": "CPR Financeira",
    "numero": "2024/001234",
    "emitente": {...},
    "credor": {...},
    "produto": {...},
    "valores": {...},
    "datas": {...},
    "garantias": [...],
    "avalista": {...}
  },
  "confidence": 0.95,
  "fields_extracted": 14,
  "fields_missing": ["clausulas_especiais"]
}
```
````

## Observacao

Reutiliza logica da Feature 3 (resumir) mas com foco em dados brutos.

````

---

### Issue #44
**Titulo:** [FRONTEND] Criar componente DataExtractor
**Labels:** `frontend` `P1-high` `feat-6-extrator` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Interface para exibir e editar dados extraidos.

## Tarefas
- [ ] Tabela de dados (campo | valor)
- [ ] Modo visualizacao
- [ ] Modo edicao inline
- [ ] Indicador de confianca por campo
- [ ] Highlight de campos faltantes
````

---

### Issue #45

**Titulo:** [FRONTEND] Exportar dados para Excel
**Labels:** `frontend` `P2-medium` `feat-6-extrator` `sprint-3`
**Descricao:**

```markdown
## Objetivo

Exportar dados extraidos para planilha Excel.

## Tarefas

- [ ] Instalar xlsx
- [ ] Criar funcao de exportacao
- [ ] Formatar em colunas
- [ ] Incluir metadados (documento, data)
```

---

### Issue #46

**Titulo:** [FRONTEND] Copiar dados como JSON
**Labels:** `frontend` `P2-medium` `feat-6-extrator` `sprint-3`
**Descricao:**

```markdown
## Objetivo

Permitir copiar dados estruturados em JSON.

## Tarefas

- [ ] Botao "Copiar JSON"
- [ ] Formatar JSON legivel
- [ ] Feedback de copia (toast)
```

---

### Issue #47

**Titulo:** [FRONTEND] Edicao inline dos dados extraidos
**Labels:** `frontend` `P3-low` `feat-6-extrator` `sprint-4`
**Descricao:**

```markdown
## Objetivo

Permitir corrigir dados extraidos incorretamente.

## Tarefas

- [ ] Modo edicao por campo
- [ ] Salvar alteracoes
- [ ] Historico de versoes (opcional)
```

---

## FEATURE 7: Checklist de Compliance

### Issue #48

**Titulo:** [CONTEUDO] Mapear requisitos da Lei 8.929/94
**Labels:** `content` `P1-high` `feat-7-compliance` `sprint-1`
**Descricao:**

```markdown
## Objetivo

Documentar todos os requisitos legais de uma CPR valida.

## Requisitos a mapear (Art. 3 e 4)

1. Denominacao "Cedula de Produto Rural"
2. Data de emissao
3. Local de emissao
4. Nome do emitente e CPF/CNPJ
5. Endereco completo do emitente
6. Promessa de entrega do produto
7. Descricao do produto (tipo e qualidade)
8. Quantidade do produto
9. Local de entrega ou retirada
10. Prazo ou data de entrega
11. Nome do credor e CPF/CNPJ
12. Clausula de correcao monetaria (se houver)
13. Assinatura do emitente
14. Assinatura do avalista (se houver)

## Entregavel

- Documento com cada requisito
- Citacao do artigo da lei
- Criterio de verificacao
```

---

### Issue #49

**Titulo:** [BACKEND] Criar endpoint de verificacao de compliance
**Labels:** `backend` `P1-high` `feat-7-compliance` `sprint-2`
**Descricao:**

````markdown
## Objetivo

Verificar conformidade da CPR com a lei.

## Endpoint

`POST /api/v1/documents/{document_id}/compliance`

## Response

```json
{
  "document_id": "doc_xxx",
  "score": 82,
  "status": "approved_with_issues",
  "items": [
    {
      "requirement": "Denominacao CPR",
      "article": "Art. 3, I",
      "status": "ok",
      "detail": null
    },
    {
      "requirement": "Local de entrega",
      "article": "Art. 3, IX",
      "status": "incomplete",
      "detail": "Falta especificar endereco completo"
    }
  ],
  "summary": {
    "total": 13,
    "ok": 11,
    "issues": 2
  }
}
```
````

````

---

### Issue #50
**Titulo:** [BACKEND] Implementar verificacao de cada requisito
**Labels:** `backend` `P1-high` `feat-7-compliance` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Logica de verificacao para cada item do checklist.

## Tarefas
- [ ] Verificacao via regex/pattern matching
- [ ] Verificacao via IA (para itens subjetivos)
- [ ] Combinacao de ambos

## Interface
```python
class ComplianceChecker:
    def check(self, cpr_data: CPRData) -> ComplianceResult:
        pass

    def check_item(self, item: str, cpr_data: CPRData) -> ItemResult:
        pass
````

````

---

### Issue #51
**Titulo:** [FRONTEND] Criar componente ComplianceChecklist
**Labels:** `frontend` `P1-high` `feat-7-compliance` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Interface de checklist de compliance.

## Tarefas
- [ ] Lista de items com icone OK/NOK
- [ ] Score visual (progress bar)
- [ ] Expandir detalhes por item
- [ ] Citacao do artigo da lei
- [ ] Status geral (aprovado, ressalvas, reprovado)
````

---

### Issue #52

**Titulo:** [FRONTEND] Exportar relatorio de compliance
**Labels:** `frontend` `P2-medium` `feat-7-compliance` `sprint-3`
**Descricao:**

```markdown
## Objetivo

Gerar PDF do resultado do compliance check.

## Conteudo

- Logo
- Identificacao do documento
- Score
- Lista de items verificados
- Detalhes de problemas
- Recomendacoes
- Data da verificacao
```

---

## FEATURE 8: Calculadora de Risco

### Issue #53

**Titulo:** [PRODUTO] Definir fatores de risco e pesos
**Labels:** `content` `P1-high` `feat-8-risco` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Definir algoritmo de scoring de risco.

## Fatores sugeridos

### Positivos (aumentam score)

| Fator                           | Peso |
| ------------------------------- | ---- |
| Garantia real (penhor)          | +20  |
| Avalista presente               | +15  |
| Prazo curto (< 6 meses)         | +10  |
| Credor e instituicao financeira | +10  |
| Produto de alta liquidez        | +8   |
| Emitente com historico          | +5   |

### Negativos (reduzem score)

| Fator                      | Peso |
| -------------------------- | ---- |
| Valor muito alto (> 1M)    | -15  |
| Valor alto (> 500k)        | -10  |
| Regiao com risco climatico | -10  |
| Prazo longo (> 12 meses)   | -8   |
| Sem garantia real          | -10  |
| Primeiro relacionamento    | -5   |

## Score

- Base: 50 pontos
- Maximo: 100
- Minimo: 0

## Faixas

- 80-100: Baixo risco
- 60-79: Risco moderado
- 40-59: Risco elevado
- 0-39: Alto risco
```

---

### Issue #54

**Titulo:** [BACKEND] Criar endpoint de calculo de risco
**Labels:** `backend` `P1-high` `feat-8-risco` `sprint-2`
**Descricao:**

````markdown
## Objetivo

Calcular score de risco de uma operacao CPR.

## Endpoint

`POST /api/v1/risk/calculate`

## Request

```json
{
  "document_id": "doc_xxx",
  // OU dados manuais:
  "data": {
    "valor_total": 750000,
    "prazo_dias": 180,
    "produto": "soja",
    "tem_garantia_real": true,
    "tem_avalista": true,
    "tipo_credor": "banco",
    "regiao": "MT",
    "historico_emitente": "novo"
  }
}
```
````

## Response

```json
{
  "score": 72,
  "classification": "moderate",
  "factors": {
    "positive": [
      { "factor": "Garantia real", "points": 20 },
      { "factor": "Avalista presente", "points": 15 }
    ],
    "negative": [{ "factor": "Valor alto", "points": -10 }]
  },
  "recommendation": "Aprovar com monitoramento mensal"
}
```

````

---

### Issue #55
**Titulo:** [FRONTEND] Criar componente RiskCalculator
**Labels:** `frontend` `P1-high` `feat-8-risco` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Interface de calculo e exibicao de risco.

## Tarefas
- [ ] Formulario de inputs (ou usar dados extraidos)
- [ ] Gauge/medidor visual de risco
- [ ] Lista de fatores positivos (verde)
- [ ] Lista de fatores negativos (vermelho)
- [ ] Recomendacao textual
- [ ] Botao para recalcular
````

---

### Issue #56

**Titulo:** [FRONTEND] Exportar relatorio de risco
**Labels:** `frontend` `P2-medium` `feat-8-risco` `sprint-3`
**Descricao:**

```markdown
## Objetivo

PDF com analise de risco detalhada.
```

---

## FEATURE 9: Historico de Cotacoes

### Issue #57

**Titulo:** [PESQUISA] Identificar APIs de cotacoes disponiveis
**Labels:** `research` `P1-high` `feat-9-cotacoes` `sprint-1`
**Descricao:**

```markdown
## Objetivo

Mapear fontes de dados de cotacoes de commodities agricolas.

## Fontes a pesquisar

- [ ] CEPEA/ESALQ - https://cepea.esalq.usp.br/
- [ ] Agrolink - https://www.agrolink.com.br/
- [ ] B3 - bolsa oficial
- [ ] CBOT (Chicago)
- [ ] Yahoo Finance
- [ ] Alpha Vantage

## Criterios

- Disponibilidade (API publica?)
- Custo
- Frequencia de atualizacao
- Produtos cobertos
- Formato dos dados

## Entregavel

- Tabela comparativa
- Recomendacao
```

---

### Issue #58

**Titulo:** [BACKEND] Criar servico de coleta de cotacoes
**Labels:** `backend` `P1-high` `feat-9-cotacoes` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Servico que coleta e armazena cotacoes.

## Tarefas

- [ ] Integrar API escolhida
- [ ] Coletar cotacoes diariamente
- [ ] Armazenar no banco
- [ ] Cache em memoria (Redis ou local)
```

---

### Issue #59

**Titulo:** [BACKEND] Criar endpoint de historico de cotacoes
**Labels:** `backend` `P1-high` `feat-9-cotacoes` `sprint-2`
**Descricao:**

````markdown
## Endpoint

`GET /api/v1/quotes/history?product=soja&period=6m`

## Response

```json
{
  "product": "soja",
  "period": "6m",
  "data": [
    {"date": "2024-07-01", "price": 155.00},
    {"date": "2024-08-01", "price": 148.00},
    ...
  ],
  "stats": {
    "min": 138.00,
    "max": 158.00,
    "avg": 148.50,
    "current": 145.00
  }
}
```
````

````

---

### Issue #60
**Titulo:** [DATABASE] Criar tabela de historico de cotacoes
**Labels:** `backend` `infra` `P1-high` `feat-9-cotacoes` `sprint-2`
**Descricao:**
```markdown
## Schema
```sql
CREATE TABLE quotes_history (
  id SERIAL PRIMARY KEY,
  product VARCHAR(50),
  date DATE,
  price DECIMAL(10,2),
  currency VARCHAR(3),
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product, date, source)
);

CREATE INDEX idx_quotes_product_date ON quotes_history(product, date);
````

````

---

### Issue #61
**Titulo:** [INFRA] Configurar cron job para coleta de cotacoes
**Labels:** `infra` `devops` `P2-medium` `feat-9-cotacoes` `sprint-3`
**Descricao:**
```markdown
## Objetivo
Automatizar coleta diaria de cotacoes.

## Opcoes
- Vercel Cron Jobs
- GitHub Actions scheduled
- Cloud Scheduler (GCP)
- Supabase Edge Functions (scheduled)

## Frequencia
- Diaria as 18h (apos fechamento mercado)
````

---

### Issue #62

**Titulo:** [FRONTEND] Criar componente QuotesChart
**Labels:** `frontend` `P1-high` `feat-9-cotacoes` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Grafico de evolucao de cotacoes.

## Tarefas

- [ ] Instalar Recharts
- [ ] Grafico de linha
- [ ] Seletor de produto
- [ ] Seletor de periodo (1m, 3m, 6m, 1y)
- [ ] Indicadores (min, max, media)
- [ ] Tooltip com valores

## Biblioteca

- recharts (recomendado)
- chart.js
- tremor
```

---

### Issue #63

**Titulo:** [FRONTEND] Comparacao preco CPR vs mercado
**Labels:** `frontend` `P2-medium` `feat-9-cotacoes` `sprint-3`
**Descricao:**

```markdown
## Objetivo

Mostrar como o preco da CPR se compara ao historico.

## Exibicao

- Linha de referencia no grafico
- % acima/abaixo da media
- Contexto textual
```

---

## FEATURE 10: Gerador de Minuta

### Issue #64

**Titulo:** [CONTEUDO] Criar templates de minutas
**Labels:** `content` `P1-high` `feat-10-minuta` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Criar templates juridicos para geracao de documentos.

## Templates necessarios

- [ ] Minuta de CPR Fisica
- [ ] Minuta de CPR Financeira
- [ ] Termo de Penhor Agricola
- [ ] Contrato de Aval
- [ ] Termo de Vistoria de Lavoura
- [ ] Notificacao de Vencimento

## Formato

- Variaveis: {{nome_emitente}}, {{cnpj}}, etc.
- Clausulas condicionais: {{#if avalista}}...{{/if}}
- HTML para conversao PDF
- DOCX para Word
```

---

### Issue #65

**Titulo:** [CONTEUDO] Definir clausulas modulares
**Labels:** `content` `P2-medium` `feat-10-minuta` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Clausulas opcionais que podem ser incluidas/removidas.

## Clausulas opcionais

- [ ] Vencimento antecipado
- [ ] Correcao monetaria (IPCA, IGP-M)
- [ ] Seguro agricola
- [ ] Reconhecimento de firma
- [ ] Registro em cartorio
- [ ] Arbitragem

## Formato

Cada clausula como bloco separado.
```

---

### Issue #66

**Titulo:** [BACKEND] Criar endpoint de geracao de minuta
**Labels:** `backend` `P1-high` `feat-10-minuta` `sprint-2`
**Descricao:**

````markdown
## Endpoint

`POST /api/v1/templates/generate`

## Request

```json
{
  "template_type": "cpr_fisica",
  "variables": {
    "emitente_nome": "Fazenda Sao Joao",
    "emitente_cnpj": "12.345.678/0001-90",
    ...
  },
  "clauses": {
    "vencimento_antecipado": true,
    "correcao_monetaria": "ipca",
    "seguro_agricola": false
  },
  "format": "pdf"
}
```
````

## Response

```json
{
  "id": "minuta_xxx",
  "download_url": "/api/v1/templates/minuta_xxx/download",
  "formats": ["pdf", "docx"]
}
```

````

---

### Issue #67
**Titulo:** [BACKEND] Implementar template engine
**Labels:** `backend` `P1-high` `feat-10-minuta` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Sistema de substituicao de variaveis em templates.

## Opcoes
- Handlebars
- Jinja2 (Python)
- Mustache
- String replace simples

## Tarefas
- [ ] Carregar template por tipo
- [ ] Substituir variaveis
- [ ] Processar condicionais (clausulas)
- [ ] Gerar HTML final
- [ ] Converter para PDF/DOCX
````

---

### Issue #68

**Titulo:** [FRONTEND] Criar componente TemplateGenerator
**Labels:** `frontend` `P1-high` `feat-10-minuta` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Interface para selecao e geracao de minutas.

## Tarefas

- [ ] Seletor de tipo de documento
- [ ] Formulario de variaveis
- [ ] Checkboxes de clausulas opcionais
- [ ] Preview do documento
- [ ] Botoes de download (Word, PDF)
```

---

### Issue #69

**Titulo:** [FRONTEND] Preview de minuta antes de gerar
**Labels:** `frontend` `P2-medium` `feat-10-minuta` `sprint-3`
**Descricao:**

```markdown
## Objetivo

Mostrar preview do documento antes de gerar final.

## Opcoes

- Renderizar HTML no iframe
- PDF preview com react-pdf
- Texto formatado simples
```

---

---

## BUGS E MELHORIAS

### Issue #70

**Titulo:** [BUG] Upload de documentos nao passa token de auth
**Labels:** `bug` `backend` `P1-high` `sprint-1`
**Descricao:**

````markdown
## Problema

O endpoint `/api/documents/upload` nao repassa o token de autorizacao para o backend.

## Arquivo

`src/app/api/documents/upload/route.ts`

## Correcao

Adicionar header Authorization na chamada ao backend.

```typescript
const authorization = request.headers.get('authorization')

const response = await fetch(`${BACKEND_URL}/api/v1/documents/upload`, {
  method: 'POST',
  headers: {
    Authorization: authorization || ''
  },
  body: formData
})
```
````

````

---

### Issue #71
**Titulo:** [BUG] useDocuments nao passa token de auth
**Labels:** `bug` `frontend` `P1-high` `sprint-1`
**Descricao:**
```markdown
## Problema
Hook useDocuments faz chamadas sem token de autenticacao.

## Arquivo
`src/hooks/useDocuments.ts`

## Correcao
Usar AuthContext para obter token e passar nas requisicoes.
````

---

### Issue #72

**Titulo:** [ENHANCEMENT] Implementar refresh token automatico
**Labels:** `enhancement` `frontend` `P1-high` `sprint-1`
**Descricao:**

```markdown
## Problema

Quando o token expira, usuario precisa fazer login novamente manualmente.

## Solucao

Implementar interceptor que:

1. Detecta 401 Unauthorized
2. Tenta refresh token
3. Repete requisicao original
4. Se falhar, redireciona para login
```

---

### Issue #73

**Titulo:** [ENHANCEMENT] Implementar tratamento global de erros
**Labels:** `enhancement` `frontend` `P2-medium` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Centralizar tratamento de erros da aplicacao.

## Tarefas

- [ ] Criar ErrorBoundary global
- [ ] Criar hook useErrorHandler
- [ ] Padronizar mensagens de erro
- [ ] Integrar com Sentry
- [ ] Toast de erros consistente
```

---

### Issue #74

**Titulo:** [ENHANCEMENT] Implementar React Query para data fetching
**Labels:** `enhancement` `frontend` `P2-medium` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Melhorar gerenciamento de estado de servidor.

## Beneficios

- Cache automatico
- Revalidacao
- Loading/error states
- Retry automatico
- Deduplicacao de requests

## Tarefas

- [ ] Instalar @tanstack/react-query
- [ ] Configurar QueryClient
- [ ] Migrar hooks existentes
```

---

## BUGS E MELHORIAS ADICIONAIS

### Issue #88 - URGENTE (PRIMEIRA PRIORIDADE)

**Titulo:** [BUG][URGENTE] Corrigir envio de email para reset de senha
**Labels:** `bug` `backend` `P0-critical` `sprint-1` `urgent` `blocker`
**Descricao:**

````markdown
## Problema

O sistema de reset de senha nao esta enviando emails corretamente.

## Sintomas

- Usuario solicita reset de senha
- Email nao chega na caixa de entrada
- Possivel problema de configuracao SMTP ou servico de email

## Tarefas

### Diagnostico

- [ ] Verificar logs do backend para erros de envio
- [ ] Verificar configuracao SMTP/servico de email
- [ ] Testar envio manual de email
- [ ] Verificar se email esta caindo em spam

### Implementacao

- [ ] Configurar servico de email (opcoes abaixo)
- [ ] Testar fluxo completo de reset
- [ ] Adicionar logs de sucesso/falha
- [ ] Implementar retry em caso de falha

## Opcoes de Servico de Email

| Servico  | Free Tier        | Preco    |
| -------- | ---------------- | -------- |
| Resend   | 3k/mes           | $20/10k  |
| SendGrid | 100/dia          | Variavel |
| AWS SES  | 62k/mes (EC2)    | $0.10/1k |
| Mailgun  | 5k/mes (3 meses) | $35/50k  |
| Postmark | 100/mes          | $15/10k  |

## Recomendacao

Usar **Resend** - moderno, boa DX, free tier generoso.

## Exemplo com Resend

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'Verity <noreply@verity.agro>',
  to: user.email,
  subject: 'Redefinir sua senha',
  html: resetPasswordTemplate(resetUrl)
})
```
````

## Variaveis de Ambiente

- RESEND_API_KEY ou SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- EMAIL_FROM

````

---

### Issue #89
**Titulo:** [BUG] Corrigir inconsistencias nas respostas da IA
**Labels:** `bug` `backend` `ai` `P1-high` `sprint-1`
**Descricao:**
```markdown
## Problema
A IA esta apresentando inconsistencias em algumas respostas.

## Tarefas

### Diagnostico
- [ ] Identificar exemplos especificos de inconsistencias
- [ ] Categorizar tipos de problemas:
  - [ ] Respostas fora do contexto CPR
  - [ ] Informacoes incorretas sobre legislacao
  - [ ] Respostas genericas demais
  - [ ] Alucinacoes (informacoes inventadas)
  - [ ] Formato de resposta inconsistente

### Melhorias no Prompt
- [ ] Revisar system prompt atual
- [ ] Adicionar instrucoes mais especificas
- [ ] Incluir exemplos (few-shot learning)
- [ ] Adicionar guardrails para respostas

### Estrutura do Prompt Melhorado
````

CONTEXTO:
Voce e um assistente especializado em CPR (Cedula de Produto Rural)
no Brasil. Voce so responde perguntas relacionadas a:

- CPR e titulos de credito rural
- Legislacao: Lei 8.929/94, Lei 13.986/2020
- Credito rural e financiamento agricola
- Garantias e avalistas

REGRAS:

1. Se a pergunta nao for sobre CPR/credito rural, diga educadamente
   que so pode ajudar com esses temas.
2. Sempre cite a fonte quando mencionar legislacao.
3. Se nao tiver certeza, diga "nao tenho certeza" ao inves de inventar.
4. Responda em portugues brasileiro.
5. Seja conciso mas completo.

FORMATO:

- Use paragrafos curtos
- Use listas quando apropriado
- Cite fontes: "Conforme Art. X da Lei Y..."

```

### Validacao
- [ ] Criar conjunto de perguntas de teste
- [ ] Comparar respostas antes/depois
- [ ] Medir taxa de respostas corretas
- [ ] Documentar casos de borda

### Monitoramento
- [ ] Usar Langfuse para avaliar respostas
- [ ] Implementar feedback do usuario (like/dislike)
- [ ] Criar dashboard de qualidade
```

---

### Issue #90

**Titulo:** [CONTENT] Adicionar dados a base de conhecimento do agente
**Labels:** `content` `ai` `P1-high` `sprint-1`
**Descricao:**

```markdown
## Objetivo

Expandir a base de conhecimento do agente com mais dados sobre CPR.

## Dados a Adicionar

### Legislacao

- [ ] Lei 8.929/94 (texto completo comentado)
- [ ] Lei 13.986/2020 (Agro Legal)
- [ ] Resolucoes BACEN sobre CPR
- [ ] Instrucoes normativas relevantes

### Documentacao Tecnica

- [ ] Manual de Credito Rural (MCR) - capitulos relevantes
- [ ] Cartilhas de bancos sobre CPR
- [ ] Modelos de CPR validados

### FAQs e Exemplos

- [ ] Perguntas frequentes sobre CPR
- [ ] Casos de uso comuns
- [ ] Erros comuns e como evitar
- [ ] Glossario de termos

### Dados de Mercado

- [ ] Historico de precos de commodities
- [ ] Indices de correcao (IPCA, IGP-M, CDI)
- [ ] Taxas de juros praticadas

## Formato dos Dados

- Documentos em PDF/TXT para indexacao
- Metadados: titulo, fonte, data, categoria
- Chunking apropriado para RAG

## Processo

1. Coletar documentos
2. Limpar e formatar
3. Adicionar metadados
4. Indexar no Vertex AI Search
5. Testar buscas
6. Validar respostas
```

---

### Issue #91

**Titulo:** [FEATURE] Implementar tour guiado para novos usuarios (Onboarding)
**Labels:** `feature` `frontend` `ux` `P2-medium` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Criar experiencia de onboarding para usuarios que acessam a plataforma pela primeira vez.

## Biblioteca Recomendada

- **React Joyride** (mais popular, customizavel)
- Ou: Intro.js, Shepherd.js, Driver.js

## Tarefas

### Setup

- [ ] Instalar react-joyride: `npm install react-joyride`
- [ ] Criar componente TourProvider
- [ ] Detectar primeiro acesso do usuario

### Steps do Tour

#### Step 1: Boas-vindas
```

Bem-vindo ao Verity! 👋
Vamos fazer um tour rapido para voce conhecer as funcionalidades.

```

#### Step 2: Chat/Assistente
```

Este e o seu assistente de CPR.
Pergunte qualquer duvida sobre Cedula de Produto Rural,
legislacao ou credito rural.

```

#### Step 3: Upload de Documentos
```

Aqui voce pode fazer upload de CPRs para:

- Analisar erros e inconsistencias
- Gerar resumo executivo
- Extrair dados estruturados

```

#### Step 4: Ferramentas
```

Acesse ferramentas especializadas:

- Simulador de CPR
- Checklist de Compliance
- Gerador de Minutas

```

#### Step 5: Historico
```

Suas conversas e documentos ficam salvos aqui.
Voce pode retomar qualquer analise anterior.

```

#### Step 6: Finalizacao
```

Pronto! Agora voce pode comecar.
Se precisar de ajuda, clique no "?" a qualquer momento.

````

### Implementacao
```typescript
import Joyride, { Step } from 'react-joyride';

const tourSteps: Step[] = [
  {
    target: '.chat-input',
    content: 'Faca perguntas sobre CPR aqui',
    placement: 'top'
  },
  {
    target: '.upload-button',
    content: 'Faca upload de documentos para analise',
    placement: 'bottom'
  },
  // ...
];

const [runTour, setRunTour] = useState(false);

useEffect(() => {
  const hasSeenTour = localStorage.getItem('hasSeenTour');
  if (!hasSeenTour) {
    setRunTour(true);
  }
}, []);

<Joyride
  steps={tourSteps}
  run={runTour}
  continuous
  showProgress
  showSkipButton
  callback={(data) => {
    if (data.status === 'finished') {
      localStorage.setItem('hasSeenTour', 'true');
    }
  }}
/>
````

### Personalizacao

- [ ] Estilizar tooltips com cores da marca
- [ ] Adicionar ilustracoes/icones
- [ ] Permitir pular tour
- [ ] Opcao de ver tour novamente (menu ajuda)

### Analytics

- [ ] Rastrear conclusao do tour (PostHog)
- [ ] Rastrear onde usuarios abandonam
- [ ] Medir impacto no engajamento

````

---

### Issue #92
**Titulo:** [DOCS] Criar documentacao para usuarios
**Labels:** `docs` `content` `P2-medium` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Criar documentacao de ajuda para usuarios da plataforma.

## Formato
- Central de Ajuda in-app (recomendado)
- Ou: Notion publico, GitBook, Docusaurus

## Conteudo

### 1. Primeiros Passos
- [ ] Como criar conta
- [ ] Como fazer login
- [ ] Visao geral da plataforma
- [ ] Tour pelas funcionalidades

### 2. Guias por Funcionalidade
- [ ] Como tirar duvidas sobre CPR
- [ ] Como analisar uma CPR
- [ ] Como gerar resumo de CPR
- [ ] Como criar uma CPR
- [ ] Como usar o simulador
- [ ] Como verificar compliance
- [ ] Como calcular risco
- [ ] Como ver cotacoes
- [ ] Como gerar minutas

### 3. FAQs
- [ ] Perguntas frequentes sobre a plataforma
- [ ] Limites e restricoes
- [ ] Formatos de arquivo aceitos
- [ ] Seguranca dos dados

### 4. Troubleshooting
- [ ] Problemas de login
- [ ] Upload nao funciona
- [ ] Resposta da IA incorreta
- [ ] Como reportar bugs

### 5. Videos Tutoriais (opcional)
- [ ] Video de introducao (2 min)
- [ ] Video por funcionalidade (1 min cada)
- [ ] Screencast de casos de uso

## Implementacao In-App

### Opcao 1: Drawer de Ajuda
```typescript
// Componente de ajuda contextual
<HelpDrawer>
  <HelpArticle
    title="Como analisar uma CPR"
    content={...}
  />
</HelpDrawer>
````

### Opcao 2: Intercom/Crisp Style

- Widget flutuante de ajuda
- Busca em artigos
- Chat com suporte

### Opcao 3: Notion/GitBook Embed

- Paginas externas
- Link "Ajuda" no menu

````

---

### Issue #93
**Titulo:** [ENHANCEMENT] Otimizar dados para o agente (RAG)
**Labels:** `enhancement` `backend` `ai` `P2-medium` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Melhorar a qualidade dos dados usados pelo agente para respostas mais precisas.

## Problemas Atuais (diagnosticar)
- [ ] Chunks muito grandes ou pequenos
- [ ] Metadados insuficientes
- [ ] Dados desatualizados
- [ ] Duplicacao de informacoes
- [ ] Baixa relevancia nos resultados de busca

## Tarefas

### 1. Otimizar Chunking
```python
# Configuracao recomendada
chunk_size = 500  # tokens
chunk_overlap = 50  # tokens
separator = "\n\n"  # paragrafos
````

### 2. Melhorar Metadados

```json
{
  "content": "texto do chunk...",
  "metadata": {
    "source": "Lei 8.929/94",
    "section": "Art. 3",
    "category": "legislacao",
    "keywords": ["requisitos", "cpr", "obrigatorios"],
    "date": "1994-08-22",
    "relevance_score": 0.9
  }
}
```

### 3. Implementar Reranking

- [ ] Adicionar reranker apos busca inicial
- [ ] Usar modelo de reranking (Cohere, cross-encoder)
- [ ] Filtrar resultados irrelevantes

### 4. Hybrid Search

- [ ] Combinar busca semantica + keyword
- [ ] Peso: 70% semantico, 30% keyword
- [ ] BM25 + embeddings

### 5. Query Expansion

- [ ] Expandir query do usuario com sinonimos
- [ ] Gerar sub-queries para perguntas complexas
- [ ] HyDE (Hypothetical Document Embeddings)

### 6. Feedback Loop

- [ ] Usar feedback de usuarios para melhorar
- [ ] Identificar queries com baixa satisfacao
- [ ] Retreinar/ajustar embeddings

## Metricas de Sucesso

- [ ] Precisao@5 > 80%
- [ ] MRR (Mean Reciprocal Rank) > 0.7
- [ ] Satisfacao do usuario (like/dislike) > 90%

````

---

### Issue #94
**Titulo:** [ENHANCEMENT] Otimizar velocidade das respostas da IA
**Labels:** `enhancement` `backend` `ai` `performance` `P1-high` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Reduzir tempo de resposta do agente para melhor UX.

## Metricas Atuais (medir)
- [ ] Tempo total de resposta (p50, p95)
- [ ] Tempo de busca RAG
- [ ] Tempo de geracao LLM
- [ ] Tempo de rede

## Meta
- p50 < 3 segundos
- p95 < 8 segundos

## Estrategias de Otimizacao

### 1. Streaming de Respostas
```typescript
// Implementar SSE para streaming
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message, stream: true })
});

const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Atualizar UI incrementalmente
  appendToMessage(decode(value));
}
````

### 2. Cache de Respostas

- [ ] Cache de perguntas frequentes (Redis/KV)
- [ ] TTL: 1 hora para FAQs, 5 min para outros
- [ ] Invalidacao quando dados mudam

### 3. Modelo Mais Rapido

| Modelo           | Latencia | Qualidade | Custo |
| ---------------- | -------- | --------- | ----- |
| Gemini 1.5 Flash | ~1s      | Boa       | Baixo |
| Gemini 1.5 Pro   | ~3s      | Otima     | Medio |
| Gemini 1.0 Pro   | ~2s      | Boa       | Baixo |

Recomendacao:

- Flash para perguntas simples
- Pro para analises complexas

### 4. Otimizar RAG

- [ ] Reduzir numero de chunks recuperados (top 3 vs top 10)
- [ ] Pre-filtrar por categoria
- [ ] Cache de embeddings
- [ ] Indexacao otimizada

### 5. Reducao de Tokens

- [ ] Compactar system prompt
- [ ] Limitar historico de conversa
- [ ] Resumir contexto longo

### 6. Infraestrutura

- [ ] Usar regiao mais proxima (southamerica-east1)
- [ ] Connection pooling
- [ ] Keep-alive connections

### 7. UX Improvements

- [ ] Skeleton loading durante resposta
- [ ] Indicador de "pensando..."
- [ ] Mostrar resposta parcial (streaming)

## Implementacao de Streaming (se nao existir)

```python
# Backend (FastAPI)
from fastapi.responses import StreamingResponse

@app.post("/api/v1/chat/stream")
async def chat_stream(request: ChatRequest):
    async def generate():
        async for chunk in gemini.generate_stream(prompt):
            yield f"data: {json.dumps({'text': chunk})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )
```

## Monitoramento

- [ ] Dashboard de latencia no Langfuse
- [ ] Alertas para p95 > 10s
- [ ] Breakdown por etapa (RAG, LLM, rede)

````

---

## INFRAESTRUTURA

### Issue #75
**Titulo:** [INFRA] Configurar Langfuse para observabilidade LLM
**Labels:** `infra` `devops` `P1-high` `sprint-1`
**Descricao:**
```markdown
## Objetivo
Monitorar chamadas de IA (latencia, custos, erros).

## Tarefas
- [ ] Criar conta Langfuse
- [ ] Instalar SDK no backend
- [ ] Instrumentar chamadas Gemini
- [ ] Configurar dashboard
- [ ] Alertas de custo/erro
````

---

### Issue #76

**Titulo:** [INFRA] Configurar Sentry para error tracking
**Labels:** `infra` `devops` `P1-high` `sprint-1`
**Descricao:**

```markdown
## Objetivo

Capturar e rastrear erros em producao.

## Tarefas

- [ ] Criar projeto Sentry
- [ ] Instalar @sentry/nextjs
- [ ] Configurar DSN
- [ ] Source maps upload
- [ ] Alertas configurados
```

---

### Issue #77

**Titulo:** [INFRA] Configurar analytics (PostHog ou GA4)
**Labels:** `infra` `devops` `P2-medium` `sprint-2`
**Descricao:**

```markdown
## Objetivo

Rastrear uso do produto.

## Eventos a rastrear

- Login/Logout
- Upload de documento
- Analise realizada
- Resumo gerado
- CPR criada
- Simulacao feita

## Decisao

- Se precisa session recording: PostHog
- Se so analytics basico: GA4 (gratis)
```

---

### Issue #78

**Titulo:** [INFRA] Configurar ambiente de staging
**Labels:** `infra` `devops` `P2-medium` `sprint-1`
**Descricao:**

```markdown
## Objetivo

Ambiente para testes antes de producao.

## Tarefas

- [ ] Branch staging no Vercel
- [ ] Variaveis de ambiente separadas
- [ ] Database separado (ou schema)
- [ ] URL: staging.verity.app
```

---

## OBSERVABILIDADE (Detalhado)

### Issue #79

**Titulo:** [OBSERVABILITY] Setup completo Langfuse - Tracing de LLM
**Labels:** `infra` `observability` `P1-high` `sprint-1`
**Descricao:**

````markdown
## Objetivo

Implementar observabilidade completa para chamadas de IA com Langfuse.

## Por que Langfuse?

- Tracing de chamadas LLM (Gemini, OpenAI)
- Custos por request/usuario/feature
- Latencia e performance
- Debug de prompts
- Avaliacao de qualidade

## Tarefas

### Setup Inicial

- [ ] Criar conta em langfuse.com (free tier: 50k obs/mes)
- [ ] Criar projeto "verity-agro-prod"
- [ ] Criar projeto "verity-agro-staging"
- [ ] Obter API keys (public + secret)
- [ ] Adicionar variaveis de ambiente

### Backend Integration

- [ ] Instalar SDK: `pip install langfuse` ou `npm install langfuse`
- [ ] Configurar cliente Langfuse
- [ ] Wrapper para chamadas Gemini
- [ ] Adicionar metadata (user_id, session_id, feature)
- [ ] Tracing de chains/pipelines RAG

### Instrumentacao por Feature

- [ ] Feature 1 (Duvidas): trace de RAG + resposta
- [ ] Feature 2 (Analisar): trace de extracao + analise
- [ ] Feature 3 (Resumir): trace de extracao + resumo
- [ ] Feature 6 (Extrator): trace de extracao estruturada
- [ ] Feature 7 (Compliance): trace de verificacao

### Dashboards e Alertas

- [ ] Dashboard de custos diarios
- [ ] Dashboard de latencia por feature
- [ ] Dashboard de erros/falhas
- [ ] Alerta: custo diario > $X
- [ ] Alerta: latencia p95 > 10s
- [ ] Alerta: taxa de erro > 5%

## Exemplo de Instrumentacao

```python
from langfuse import Langfuse

langfuse = Langfuse()

@langfuse.trace(name="analyze_cpr")
async def analyze_cpr(document_id: str, user_id: str):
    # Span para extracao
    with langfuse.span(name="extract_text") as span:
        text = await extract_text(document_id)
        span.update(output={"chars": len(text)})

    # Span para analise com Gemini
    with langfuse.span(name="gemini_analysis") as span:
        span.update(input={"prompt_tokens": count_tokens(prompt)})
        result = await gemini.generate(prompt)
        span.update(output={"completion_tokens": count_tokens(result)})

    return result
```
````

## Metricas a Rastrear

| Metrica             | Descricao                                |
| ------------------- | ---------------------------------------- |
| `llm.tokens.input`  | Tokens de entrada                        |
| `llm.tokens.output` | Tokens de saida                          |
| `llm.cost`          | Custo estimado em USD                    |
| `llm.latency`       | Tempo de resposta                        |
| `llm.model`         | Modelo usado                             |
| `feature`           | Funcionalidade (analyze, summarize, etc) |
| `user_id`           | Usuario que fez a chamada                |
| `session_id`        | Sessao do chat                           |

````

---

### Issue #80
**Titulo:** [OBSERVABILITY] Setup completo Sentry - Error Tracking & Performance
**Labels:** `infra` `observability` `P1-high` `sprint-1`
**Descricao:**
```markdown
## Objetivo
Capturar erros, exceptions e metricas de performance.

## Tarefas

### Setup Frontend (Next.js)
- [ ] Instalar: `npm install @sentry/nextjs`
- [ ] Executar wizard: `npx @sentry/wizard@latest -i nextjs`
- [ ] Configurar sentry.client.config.ts
- [ ] Configurar sentry.server.config.ts
- [ ] Configurar sentry.edge.config.ts
- [ ] Upload de source maps no build

### Setup Backend (se Python/FastAPI)
- [ ] Instalar: `pip install sentry-sdk[fastapi]`
- [ ] Configurar no startup da aplicacao
- [ ] Adicionar middleware de performance

### Configuracoes
```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% das transacoes
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0, // 100% quando erro
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],
});
````

### Contexto Customizado

- [ ] Adicionar user context (id, email, empresa)
- [ ] Adicionar tags (feature, session_id)
- [ ] Breadcrumbs customizados

### Alertas

- [ ] Alerta: novo erro em producao
- [ ] Alerta: spike de erros (> 10/min)
- [ ] Alerta: erro em feature critica
- [ ] Integracao Slack/Discord

### Session Replay (opcional)

- [ ] Habilitar replay para erros
- [ ] Configurar privacy (mascarar dados sensiveis)

## Erros a Capturar

| Tipo              | Exemplo                               |
| ----------------- | ------------------------------------- |
| API Errors        | 500, 502, 503                         |
| Auth Errors       | Token expirado, unauthorized          |
| LLM Errors        | Timeout, rate limit, invalid response |
| Upload Errors     | Arquivo invalido, muito grande        |
| Validation Errors | Dados invalidos no formulario         |

````

---

### Issue #81
**Titulo:** [OBSERVABILITY] Setup PostHog - Product Analytics & Session Recording
**Labels:** `infra` `observability` `P1-high` `sprint-1`
**Descricao:**
```markdown
## Objetivo
Analytics de produto, funis de conversao e gravacao de sessoes.

## Por que PostHog vs GA4?
| Feature | PostHog | GA4 |
|---------|---------|-----|
| Analytics | ✅ | ✅ |
| Session Recording | ✅ | ❌ |
| Heatmaps | ✅ | ❌ |
| Feature Flags | ✅ | ❌ |
| Self-hosted | ✅ | ❌ |
| Event-based pricing | ✅ | ❌ |

## Tarefas

### Setup
- [ ] Criar conta PostHog (free: 1M eventos/mes)
- [ ] Criar projeto
- [ ] Instalar: `npm install posthog-js`
- [ ] Configurar provider no _app.tsx ou layout.tsx

### Configuracao
```typescript
// lib/posthog.ts
import posthog from 'posthog-js'

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-mask]'
      }
    })
  }
}
````

### Eventos Customizados a Rastrear

```typescript
// Autenticacao
posthog.capture('user_signed_up', { method: 'email' })
posthog.capture('user_logged_in', { method: 'email' })
posthog.capture('user_logged_out')

// Features Core
posthog.capture('document_uploaded', {
  file_type: 'pdf',
  file_size: 1024
})
posthog.capture('cpr_analyzed', {
  score: 85,
  issues_found: 3
})
posthog.capture('cpr_summarized', {
  document_id: 'xxx'
})
posthog.capture('cpr_created', {
  type: 'financeira'
})
posthog.capture('simulation_run', {
  product: 'soja',
  value: 750000
})

// Engagement
posthog.capture('chat_message_sent')
posthog.capture('export_pdf_clicked')
posthog.capture('export_excel_clicked')
```

### Identificacao de Usuario

```typescript
posthog.identify(user.id, {
  email: user.email,
  name: user.name,
  company: user.company,
  plan: user.plan
})
```

### Dashboards a Criar

- [ ] Dashboard: Usuarios ativos (DAU, WAU, MAU)
- [ ] Dashboard: Uso por feature
- [ ] Dashboard: Funil de onboarding
- [ ] Dashboard: Retencao
- [ ] Dashboard: Feature adoption

### Session Recording

- [ ] Habilitar gravacao
- [ ] Configurar mascaramento de dados sensiveis
- [ ] Filtrar gravacoes por evento de erro

````

---

### Issue #82
**Titulo:** [OBSERVABILITY] Structured Logging
**Labels:** `infra` `observability` `P2-medium` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Logs estruturados e pesquisaveis em JSON.

## Tarefas

### Backend (Python)
- [ ] Instalar structlog: `pip install structlog`
- [ ] Configurar formato JSON
- [ ] Adicionar contexto (request_id, user_id)
- [ ] Log levels apropriados

### Backend (Node)
- [ ] Instalar pino: `npm install pino`
- [ ] Configurar formato JSON
- [ ] Middleware de request logging

### Frontend
- [ ] Console logs estruturados para debug
- [ ] Enviar logs criticos para backend

### Formato Padrao
```json
{
  "timestamp": "2024-12-12T10:00:00Z",
  "level": "info",
  "message": "CPR analyzed successfully",
  "request_id": "req_xxx",
  "user_id": "user_xxx",
  "session_id": "s_xxx",
  "feature": "analyze",
  "document_id": "doc_xxx",
  "duration_ms": 2500,
  "metadata": {
    "score": 85,
    "issues": 3
  }
}
````

### Destino dos Logs

- Vercel Logs (incluso)
- Ou: Axiom, Datadog, Logtail

````

---

### Issue #83
**Titulo:** [OBSERVABILITY] Monitoramento de Custos de AI
**Labels:** `infra` `observability` `P1-high` `sprint-1`
**Descricao:**
```markdown
## Objetivo
Rastrear e alertar sobre custos de API de IA.

## Tarefas

### Rastreamento via Langfuse
- [ ] Calcular custo por chamada (tokens * preco)
- [ ] Agregar por usuario
- [ ] Agregar por feature
- [ ] Agregar por dia/semana/mes

### Precos de Referencia (Gemini)
| Modelo | Input | Output |
|--------|-------|--------|
| Gemini 1.5 Flash | $0.075/1M | $0.30/1M |
| Gemini 1.5 Pro | $1.25/1M | $5.00/1M |
| Gemini 1.0 Pro Vision | $0.25/1M | $0.50/1M |

### Alertas de Custo
- [ ] Alerta: custo diario > $10
- [ ] Alerta: custo semanal > $50
- [ ] Alerta: usuario individual > $5/dia
- [ ] Alerta: feature especifica > $20/dia

### Dashboard de Custos
- [ ] Custo total diario
- [ ] Custo por feature
- [ ] Custo por usuario (top 10)
- [ ] Projecao mensal
- [ ] Comparacao com creditos disponiveis

### Budget Caps (opcional)
- [ ] Limite por usuario/dia
- [ ] Limite por empresa/dia
- [ ] Graceful degradation quando limite atingido
````

---

### Issue #84

**Titulo:** [OBSERVABILITY] Health Checks e Uptime Monitoring
**Labels:** `infra` `observability` `P2-medium` `sprint-2`
**Descricao:**

````markdown
## Objetivo

Monitorar disponibilidade dos servicos.

## Tarefas

### Endpoints de Health Check

- [ ] GET /api/health - status geral
- [ ] GET /api/health/db - conexao com banco
- [ ] GET /api/health/ai - conexao com Gemini
- [ ] GET /api/health/storage - conexao com R2/Storage

### Resposta Padrao

```json
{
  "status": "healthy",
  "timestamp": "2024-12-12T10:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": { "status": "up", "latency_ms": 5 },
    "ai_service": { "status": "up", "latency_ms": 150 },
    "storage": { "status": "up", "latency_ms": 20 }
  }
}
```
````

### Uptime Monitoring

- [ ] Configurar UptimeRobot ou Better Uptime (free)
- [ ] Monitorar endpoint /api/health
- [ ] Intervalo: 5 minutos
- [ ] Alertas: Slack, Email, SMS

### Status Page (opcional)

- [ ] Criar status page publica
- [ ] Opcoes: Instatus, Cachet, StatusPage

````

---

### Issue #85
**Titulo:** [OBSERVABILITY] Performance Monitoring (Web Vitals)
**Labels:** `infra` `observability` `P2-medium` `sprint-2`
**Descricao:**
```markdown
## Objetivo
Monitorar performance do frontend (Core Web Vitals).

## Metricas
| Metrica | Bom | Precisa Melhorar | Ruim |
|---------|-----|------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5-4s | > 4s |
| FID (First Input Delay) | < 100ms | 100-300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |
| TTFB (Time to First Byte) | < 800ms | 800-1800ms | > 1800ms |

## Tarefas

### Vercel Analytics (recomendado)
- [ ] Habilitar Vercel Analytics no dashboard
- [ ] Verificar metricas no painel
- [ ] Zero config necessario

### Ou: Web Vitals Manual
```typescript
// pages/_app.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  posthog.capture('web_vitals', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating
  })
}
````

### Alertas

- [ ] Alerta: LCP > 4s
- [ ] Alerta: CLS > 0.25

````

---

### Issue #86
**Titulo:** [OBSERVABILITY] Criar Runbook de Incidentes
**Labels:** `docs` `observability` `P2-medium` `sprint-3`
**Descricao:**
```markdown
## Objetivo
Documentar procedimentos para resposta a incidentes.

## Conteudo do Runbook

### 1. Contatos de Emergencia
- On-call principal
- Backup
- Escalation path

### 2. Acessos Necessarios
- Vercel Dashboard
- Sentry
- Langfuse
- PostHog
- GCP Console
- Database

### 3. Procedimentos por Tipo de Incidente

#### Site fora do ar
1. Verificar status Vercel
2. Verificar health check
3. Verificar logs
4. Rollback se necessario

#### Erros de AI/LLM
1. Verificar Langfuse
2. Verificar quotas GCP
3. Verificar rate limits
4. Fallback para modelo alternativo

#### Vazamento de dados
1. Identificar escopo
2. Revogar acessos
3. Notificar usuarios
4. Documentar incidente

### 4. Checklist Pos-Incidente
- [ ] Root cause analysis
- [ ] Timeline do incidente
- [ ] Acoes corretivas
- [ ] Postmortem meeting
````

---

### Issue #87

**Titulo:** [OBSERVABILITY] Dashboard Unificado de Observabilidade
**Labels:** `infra` `observability` `P3-low` `sprint-3`
**Descricao:**

```markdown
## Objetivo

Visao unificada de todas as metricas.

## Opcoes

1. Grafana Cloud (free tier)
2. Datadog (pago)
3. Custom dashboard com Tremor/Recharts

## Metricas a Incluir

- Usuarios ativos (PostHog)
- Erros/hora (Sentry)
- Custos AI/dia (Langfuse)
- Latencia p95 (Vercel/Langfuse)
- Uptime (UptimeRobot)

## Tarefas

- [ ] Escolher ferramenta
- [ ] Integrar fontes de dados
- [ ] Criar visualizacoes
- [ ] Compartilhar com time
```

---

---

## Resumo por Sprint

### Sprint 1 (Semana 1-2) - Fundacao + Observabilidade + Bugs Criticos

- Issues #70, #71, #72 (bugs criticos auth/docs)
- Issue #88 (bug email reset senha)
- Issue #89 (bug inconsistencias IA)
- Issue #90 (adicionar dados base conhecimento)
- Issues #78 (staging)
- Issues #79, #80, #81, #83 (observabilidade core: Langfuse, Sentry, PostHog, Custos AI)
- Issues #2, #3, #4 (base conhecimento RAG)
- Issues #34, #48 (conteudo)
- Issue #57 (pesquisa cotacoes)

### Sprint 2 (Semana 2-3) - Features Core + Observabilidade + UX

- Issues #1, #5 (chat RAG)
- Issues #9, #10, #11, #12 (analise backend)
- Issues #18, #19 (resumo backend)
- Issues #24-30, #31-33 (criar CPR)
- Issues #36-39 (simulador)
- Issues #43-44 (extrator)
- Issues #49-51 (compliance)
- Issues #54-55 (risco)
- Issues #58-60, #62 (cotacoes)
- Issues #64-68 (minuta)
- Issues #82, #84, #85 (observabilidade: logging, health checks, web vitals)
- Issue #91 (tour guiado onboarding)
- Issue #92 (documentacao usuarios)
- Issue #93 (otimizar dados RAG)
- Issue #94 (otimizar velocidade respostas)

### Sprint 3 (Semana 3-4) - Frontend & Polish

- Issues #6, #7 (chat frontend)
- Issues #13-16 (analise frontend)
- Issues #20-23 (resumo frontend)
- Issues #40-42 (simulador extra)
- Issues #45-47 (extrator extra)
- Issues #52 (compliance export)
- Issues #56 (risco export)
- Issues #61, #63 (cotacoes extra)
- Issues #69 (minuta preview)
- Issues #73, #74 (melhorias)
- Issues #86, #87 (runbook, dashboard unificado)

### Sprint 4 (Semana 4+) - Nice to Have

- Issue #8 (Dialogflow CX)
- Issue #17 (aplicar sugestoes)
- Issue #35 (database CPRs)

---

## Issues de Observabilidade (Resumo)

| #   | Issue                   | Ferramenta       | Prioridade | Sprint |
| --- | ----------------------- | ---------------- | ---------- | ------ |
| 79  | Langfuse - LLM Tracing  | Langfuse         | P1-high    | 1      |
| 80  | Sentry - Error Tracking | Sentry           | P1-high    | 1      |
| 81  | PostHog - Analytics     | PostHog          | P1-high    | 1      |
| 82  | Structured Logging      | Pino/Structlog   | P2-medium  | 2      |
| 83  | Custos de AI            | Langfuse         | P1-high    | 1      |
| 84  | Health Checks           | Custom           | P2-medium  | 2      |
| 85  | Web Vitals              | Vercel Analytics | P2-medium  | 2      |
| 86  | Runbook Incidentes      | Docs             | P2-medium  | 3      |
| 87  | Dashboard Unificado     | Grafana/Custom   | P3-low     | 3      |

---

## Issues Adicionais (Resumo)

| #   | Issue                         | Categoria      | Prioridade | Sprint |
| --- | ----------------------------- | -------------- | ---------- | ------ |
| 88  | Corrigir email reset senha    | Bug            | P1-high    | 1      |
| 89  | Corrigir inconsistencias IA   | Bug/AI         | P1-high    | 1      |
| 90  | Adicionar dados base agente   | Content        | P1-high    | 1      |
| 91  | Tour guiado (onboarding)      | Feature/UX     | P2-medium  | 2      |
| 92  | Documentacao usuarios         | Docs           | P2-medium  | 2      |
| 93  | Otimizar dados RAG            | Enhancement/AI | P2-medium  | 2      |
| 94  | Otimizar velocidade respostas | Enhancement/AI | P1-high    | 2      |

---

## Metricas de Progresso

| Sprint    | Issues | Story Points (estimado) |
| --------- | ------ | ----------------------- |
| Sprint 1  | 21     | 60                      |
| Sprint 2  | 42     | 130                     |
| Sprint 3  | 22     | 65                      |
| Sprint 4  | 9      | 25                      |
| **Total** | **94** | **280**                 |

---

_Documento gerado em: Dezembro 2024_
