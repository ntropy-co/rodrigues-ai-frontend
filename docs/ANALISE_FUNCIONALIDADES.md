# Analise de Funcionalidades - Verity Agro

## Estado Atual do Projeto

### Infraestrutura Existente

| Camada          | Status | Detalhes                                       |
| --------------- | ------ | ---------------------------------------------- |
| **Auth**        | OK     | Login, Register, Logout, Forgot/Reset Password |
| **Chat Basico** | OK     | POST /api/chat, sessoes, mensagens             |
| **Upload Docs** | OK     | PDF, DOC, TXT, CSV, XLS, imagens (10MB max)    |
| **Sessions**    | OK     | CRUD de sessoes, filtro por projeto            |
| **Projects**    | OK     | CRUD de projetos                               |

### APIs Existentes (BFF - Next.js)

```
/api/auth/
  - POST /login
  - POST /register
  - POST /logout
  - GET  /me
  - POST /forgot-password
  - POST /reset-password
  - GET  /verify-reset-token/[token]

/api/chat/
  - POST /              (envia mensagem)
  - POST /[messageId]/feedback

/api/documents/
  - POST /upload
  - GET  /conversation?conversation_id=
  - GET  /user/[userId]
  - GET  /[documentId]
  - GET  /[documentId]/download
  - DELETE /[documentId]

/api/sessions/
  - GET  /             (lista sessoes)
  - POST /             (cria sessao)
  - GET  /[sessionId]
  - PATCH /[sessionId]
  - DELETE /[sessionId]

/api/projects/
  - GET  /
  - POST /
  - GET  /[projectId]
  - PATCH /[projectId]
  - DELETE /[projectId]
```

---

## Analise por Funcionalidade

---

### 1. Tirar Duvidas sobre CPR

**Status:** PARCIALMENTE IMPLEMENTADO

**O que existe:**

- [x] Chat basico funcionando
- [x] Envio de mensagens para backend
- [x] Exibicao de respostas
- [x] Gerenciamento de sessoes

**O que falta:**

- [ ] Integracao com base de conhecimento (RAG)
- [ ] Integracao com Dialogflow ES/CX
- [ ] Indexacao de documentos sobre CPR no Vertex AI Search
- [ ] Citacao de fontes nas respostas
- [ ] Prompts especializados para contexto CPR

**Dependencias Tecnicas:**
| Dependencia | Tipo | Observacao |
|-------------|------|------------|
| Vertex AI Search | GCP Service | Usa creditos |
| Dialogflow CX | GCP Service | Usa creditos |
| Base de conhecimento CPR | Conteudo | Precisa criar/coletar |
| API do Backend | Backend | Endpoint /chat precisa suportar RAG |

**Backlog:**

```
[ ] BACKEND: Criar endpoint ou modificar /chat para suportar modo RAG
[ ] BACKEND: Integrar Dialogflow CX para perguntas complexas
[ ] BACKEND: Integrar Vertex AI Search para busca semantica
[ ] CONTEUDO: Coletar e estruturar base de conhecimento CPR
[ ] GCP: Configurar Vertex AI Search datastore
[ ] GCP: Configurar Dialogflow CX agent
[ ] FRONTEND: Exibir fontes/citacoes nas respostas
[ ] FRONTEND: Indicador visual de "buscando na base..."
```

**Estimativa:** Media complexidade

---

### 2. Analisar/Corrigir CPR

**Status:** PARCIALMENTE IMPLEMENTADO

**O que existe:**

- [x] Upload de documentos (PDF, DOC, etc.)
- [x] Armazenamento de documentos
- [x] Download de documentos

**O que falta:**

- [ ] Extracao de texto do PDF (OCR/Vision)
- [ ] Analise estruturada do documento
- [ ] Deteccao de erros e inconsistencias
- [ ] Geracao de sugestoes de correcao
- [ ] Interface de exibicao de resultados da analise
- [ ] Exportacao do relatorio de analise

**Dependencias Tecnicas:**
| Dependencia | Tipo | Observacao |
|-------------|------|------------|
| Gemini Vision ou Document AI | GCP Service | Para extracao de texto |
| Gemini Pro | GCP Service | Para analise |
| Regras de validacao CPR | Logica | Lei 8.929/94 |

**Backlog:**

```
[ ] BACKEND: Criar endpoint POST /api/v1/documents/analyze
[ ] BACKEND: Integrar Gemini Vision para extracao de texto de PDF
[ ] BACKEND: Criar prompt estruturado para analise de CPR
[ ] BACKEND: Implementar regras de validacao (dados obrigatorios, datas, etc.)
[ ] BACKEND: Retornar resultado estruturado (erros, sugestoes, score)
[ ] FRONTEND: Criar componente AnalysisResult
[ ] FRONTEND: Criar pagina/modal de analise de CPR
[ ] FRONTEND: Botao "Analisar" apos upload
[ ] FRONTEND: Exibicao de erros criticos vs sugestoes
[ ] FRONTEND: Exportar relatorio em PDF
```

**Estimativa:** Media-Alta complexidade

---

### 3. Resumir CPR

**Status:** NAO IMPLEMENTADO

**O que existe:**

- [x] Upload de documentos

**O que falta:**

- [ ] Endpoint de resumo
- [ ] Extracao de dados estruturados
- [ ] Template de resumo executivo
- [ ] Interface de exibicao do resumo
- [ ] Exportacao (PDF, Excel, copiar)

**Dependencias Tecnicas:**
| Dependencia | Tipo | Observacao |
|-------------|------|------------|
| Gemini Pro | GCP Service | Para geracao do resumo |
| Extracao de texto | Feature | Compartilhada com funcionalidade 2 |

**Backlog:**

```
[ ] BACKEND: Criar endpoint POST /api/v1/documents/summarize
[ ] BACKEND: Criar prompt para extracao de dados estruturados
[ ] BACKEND: Definir schema do resumo (partes, objeto, valores, prazos, garantias)
[ ] FRONTEND: Criar componente CPRSummary
[ ] FRONTEND: Botao "Resumir" apos upload
[ ] FRONTEND: Exibicao formatada do resumo
[ ] FRONTEND: Botoes de exportacao (PDF, Excel, Copiar)
```

**Estimativa:** Baixa-Media complexidade (reutiliza extracao)

---

### 4. Criar/Fazer CPR

**Status:** NAO IMPLEMENTADO

**O que existe:**

- [x] Sistema de formularios basico (React)

**O que falta:**

- [ ] Wizard/stepper de criacao
- [ ] Formulario multi-step
- [ ] Validacao em tempo real
- [ ] Geracao de documento Word/PDF
- [ ] Templates de CPR Fisica e Financeira
- [ ] Salvamento de rascunhos

**Dependencias Tecnicas:**
| Dependencia | Tipo | Observacao |
|-------------|------|------------|
| docx (npm) | Library | Para gerar Word |
| html-pdf ou puppeteer | Library | Para gerar PDF |
| Templates CPR | Conteudo | Minutas juridicas |

**Backlog:**

```
[ ] FRONTEND: Criar componente CPRWizard (multi-step form)
[ ] FRONTEND: Step 1 - Tipo de CPR e dados emitente
[ ] FRONTEND: Step 2 - Dados do credor
[ ] FRONTEND: Step 3 - Produto e quantidade
[ ] FRONTEND: Step 4 - Valores e prazos
[ ] FRONTEND: Step 5 - Garantias e avalista
[ ] FRONTEND: Step 6 - Revisao e geracao
[ ] FRONTEND: Validacao em tempo real com Zod ou React Hook Form
[ ] BACKEND: Criar endpoint POST /api/v1/cpr/generate
[ ] BACKEND: Integrar biblioteca docx para gerar Word
[ ] BACKEND: Integrar puppeteer/html-pdf para gerar PDF
[ ] CONTEUDO: Criar templates de CPR Fisica e Financeira
[ ] DATABASE: Tabela para salvar CPRs criadas
```

**Estimativa:** Media-Alta complexidade

---

### 5. Simular CPR (Valores)

**Status:** NAO IMPLEMENTADO

**O que existe:**

- [ ] Nada especifico

**O que falta:**

- [ ] Calculadora de valores
- [ ] Integracao com API de cotacoes
- [ ] Formulas de calculo (valor bruto, desconto, liquido)
- [ ] Interface da calculadora
- [ ] Historico de simulacoes

**Dependencias Tecnicas:**
| Dependencia | Tipo | Observacao |
|-------------|------|------------|
| API de cotacoes | External API | CEPEA, B3, ou similar |
| Formulas financeiras | Logica | Taxas, descontos |

**Backlog:**

```
[ ] FRONTEND: Criar componente CPRSimulator
[ ] FRONTEND: Inputs: produto, quantidade, preco, prazo, taxa
[ ] FRONTEND: Logica de calculo no frontend (rapido)
[ ] FRONTEND: Exibicao de resultado (bruto, desconto, liquido)
[ ] FRONTEND: Comparacao com mercado atual
[ ] BACKEND: Criar endpoint GET /api/v1/quotes/current?product=soja
[ ] BACKEND: Integrar API de cotacoes (CEPEA ou similar)
[ ] BACKEND: Criar endpoint POST /api/v1/simulations (salvar)
[ ] BACKEND: Criar endpoint GET /api/v1/simulations (historico)
[ ] DATABASE: Tabela simulations
```

**Estimativa:** Media complexidade

---

### 6. Extrator de Dados Estruturados

**Status:** NAO IMPLEMENTADO

**O que existe:**

- [x] Upload de documentos

**O que falta:**

- [ ] Extracao automatica de campos
- [ ] Schema de dados da CPR
- [ ] Interface de exibicao tabular
- [ ] Edicao dos dados extraidos
- [ ] Exportacao (Excel, JSON)

**Dependencias Tecnicas:**
| Dependencia | Tipo | Observacao |
|-------------|------|------------|
| Gemini Vision | GCP Service | Para extracao |
| xlsx (npm) | Library | Para exportar Excel |

**Backlog:**

```
[ ] BACKEND: Criar endpoint POST /api/v1/documents/extract
[ ] BACKEND: Definir schema de extracao (tipo, numero, emitente, credor, etc.)
[ ] BACKEND: Criar prompt estruturado para extracao
[ ] BACKEND: Retornar JSON estruturado
[ ] FRONTEND: Criar componente DataExtractor
[ ] FRONTEND: Exibicao em tabela editavel
[ ] FRONTEND: Botao "Exportar Excel"
[ ] FRONTEND: Botao "Copiar JSON"
[ ] FRONTEND: Modo de edicao inline
```

**Estimativa:** Baixa-Media complexidade (reutiliza Vision)

---

### 7. Checklist de Compliance

**Status:** NAO IMPLEMENTADO

**O que existe:**

- [x] Upload de documentos

**O que falta:**

- [ ] Lista de requisitos legais (Lei 8.929/94)
- [ ] Verificacao automatica de cada item
- [ ] Calculo de score de compliance
- [ ] Interface de checklist
- [ ] Relatorio de compliance

**Dependencias Tecnicas:**
| Dependencia | Tipo | Observacao |
|-------------|------|------------|
| Regras Lei 8.929/94 | Conteudo | 13 itens obrigatorios |
| Extracao de texto | Feature | Compartilhada |

**Backlog:**

```
[ ] CONTEUDO: Mapear todos os requisitos da Lei 8.929/94
[ ] BACKEND: Criar endpoint POST /api/v1/documents/compliance
[ ] BACKEND: Implementar verificacao de cada requisito
[ ] BACKEND: Calcular score de compliance (%)
[ ] BACKEND: Retornar lista de itens OK/NOK com detalhes
[ ] FRONTEND: Criar componente ComplianceChecklist
[ ] FRONTEND: Exibicao com icones OK/NOK
[ ] FRONTEND: Score visual (progress bar)
[ ] FRONTEND: Detalhes expandiveis por item
[ ] FRONTEND: Exportar relatorio
```

**Estimativa:** Baixa-Media complexidade

---

### 8. Calculadora de Risco

**Status:** NAO IMPLEMENTADO

**O que existe:**

- [ ] Nada especifico

**O que falta:**

- [ ] Algoritmo de scoring de risco
- [ ] Fatores de risco (garantia, prazo, valor, etc.)
- [ ] Pesos configuráveis
- [ ] Interface de exibicao
- [ ] Recomendacoes automaticas

**Dependencias Tecnicas:**
| Dependencia | Tipo | Observacao |
|-------------|------|------------|
| Algoritmo de risco | Logica | Definir fatores e pesos |
| Dados extraidos | Feature | Depende da funcionalidade 6 |

**Backlog:**

```
[ ] PRODUTO: Definir fatores de risco e seus pesos
[ ] BACKEND: Criar endpoint POST /api/v1/risk/calculate
[ ] BACKEND: Implementar algoritmo de scoring
[ ] BACKEND: Gerar recomendacoes baseadas no score
[ ] FRONTEND: Criar componente RiskCalculator
[ ] FRONTEND: Input dos dados da operacao (ou usar dados extraidos)
[ ] FRONTEND: Exibicao visual do score (gauge, progress)
[ ] FRONTEND: Lista de fatores positivos/negativos
[ ] FRONTEND: Recomendacoes
```

**Estimativa:** Media complexidade

---

### 9. Historico de Cotacoes

**Status:** NAO IMPLEMENTADO

**O que existe:**

- [ ] Nada especifico

**O que falta:**

- [ ] Integracao com API de cotacoes
- [ ] Armazenamento de historico
- [ ] Graficos de evolucao
- [ ] Comparacao com preco da CPR

**Dependencias Tecnicas:**
| Dependencia | Tipo | Observacao |
|-------------|------|------------|
| API de cotacoes | External API | CEPEA, B3, CBOT |
| Recharts ou Chart.js | Library | Para graficos |
| Cron job | Infra | Para atualizar cotacoes |

**Backlog:**

```
[ ] PESQUISA: Identificar APIs de cotacoes disponiveis (CEPEA, agrolink, etc.)
[ ] BACKEND: Criar servico de coleta de cotacoes
[ ] BACKEND: Criar endpoint GET /api/v1/quotes/history?product=soja&period=6m
[ ] BACKEND: Criar endpoint GET /api/v1/quotes/current
[ ] DATABASE: Tabela quotes_history
[ ] INFRA: Cron job para atualizar cotacoes diariamente
[ ] FRONTEND: Criar componente QuotesChart
[ ] FRONTEND: Seletor de produto e periodo
[ ] FRONTEND: Grafico de linha com historico
[ ] FRONTEND: Indicadores (min, max, media)
[ ] FRONTEND: Comparacao com preco da CPR
```

**Estimativa:** Media complexidade

---

### 10. Gerador de Minuta

**Status:** NAO IMPLEMENTADO

**O que existe:**

- [ ] Nada especifico

**O que falta:**

- [ ] Sistema de templates
- [ ] Variaveis dinamicas
- [ ] Clausulas modulares
- [ ] Geracao Word/PDF
- [ ] Interface de selecao e personalizacao

**Dependencias Tecnicas:**
| Dependencia | Tipo | Observacao |
|-------------|------|------------|
| Templates juridicos | Conteudo | CPR Fisica, Financeira, etc. |
| docx (npm) | Library | Para gerar Word |
| Handlebars ou similar | Library | Para template engine |

**Backlog:**

```
[ ] CONTEUDO: Criar templates de cada tipo de minuta
[ ] CONTEUDO: Definir variaveis substituiveis
[ ] CONTEUDO: Criar clausulas modulares (opcoes on/off)
[ ] BACKEND: Criar endpoint POST /api/v1/templates/generate
[ ] BACKEND: Implementar substituicao de variaveis
[ ] BACKEND: Implementar adicao/remocao de clausulas
[ ] BACKEND: Gerar Word e PDF
[ ] FRONTEND: Criar componente TemplateGenerator
[ ] FRONTEND: Seletor de tipo de documento
[ ] FRONTEND: Checkboxes de clausulas opcionais
[ ] FRONTEND: Preview do documento
[ ] FRONTEND: Botoes de download (Word, PDF)
```

**Estimativa:** Baixa-Media complexidade

---

## Resumo do Backlog

### Por Prioridade

| Feature              | Tasks Backend | Tasks Frontend | Tasks Outros | Total  |
| -------------------- | ------------- | -------------- | ------------ | ------ |
| 1. Tirar Duvidas     | 4             | 2              | 2            | 8      |
| 2. Analisar/Corrigir | 5             | 5              | 0            | 10     |
| 3. Resumir           | 3             | 4              | 0            | 7      |
| 4. Criar CPR         | 3             | 7              | 2            | 12     |
| 5. Simular           | 4             | 4              | 0            | 8      |
| 6. Extrator          | 4             | 5              | 0            | 9      |
| 7. Compliance        | 4             | 5              | 1            | 10     |
| 8. Risco             | 3             | 5              | 1            | 9      |
| 9. Cotacoes          | 4             | 5              | 2            | 11     |
| 10. Minuta           | 5             | 5              | 3            | 13     |
| **TOTAL**            | **39**        | **47**         | **11**       | **97** |

### Dependencias Compartilhadas

```
CRITICAS (bloqueiam multiplas features):
├── Gemini Vision/Document AI (features 2, 3, 6, 7)
├── API de Cotacoes (features 5, 9)
├── Geracao de documentos Word/PDF (features 4, 10)
└── Base de conhecimento CPR (feature 1)

MODERADAS:
├── Regras Lei 8.929/94 (features 2, 7)
├── Templates juridicos (features 4, 10)
└── Algoritmo de risco (feature 8)
```

---

## Bugs e Problemas Identificados

### No Codebase Atual

| Arquivo                 | Problema                                | Severidade |
| ----------------------- | --------------------------------------- | ---------- |
| `/api/documents/upload` | Nao passa token de auth para backend    | Media      |
| `useDocuments.ts`       | Nao passa token de auth                 | Media      |
| `FileUploadModal.tsx`   | Nao trata erro de rede                  | Baixa      |
| `store.ts`              | `locallyCreatedSessionIds` nao persiste | Baixa      |

### Melhorias Necessarias

| Area           | Melhoria                       | Impacto |
| -------------- | ------------------------------ | ------- |
| Auth           | Refresh token automatico       | Alto    |
| Error Handling | Tratamento global de erros     | Medio   |
| Loading States | Skeleton loaders consistentes  | Baixo   |
| Cache          | Implementar SWR ou React Query | Medio   |

---

## Stack Tecnica Necessaria

### Confirmada (ja usa)

- Next.js 14 (App Router)
- React 18
- TypeScript
- Zustand (state management)
- Tailwind CSS
- Lucide Icons

### A Definir/Adicionar

| Necessidade             | Opcoes                     | Recomendacao                    |
| ----------------------- | -------------------------- | ------------------------------- |
| **AI/LLM**              | Gemini, OpenAI, Claude     | Gemini (tem creditos)           |
| **Document Processing** | Gemini Vision, Document AI | Gemini Vision (simples)         |
| **RAG/Search**          | Vertex AI Search, pgvector | Vertex AI Search (tem creditos) |
| **Chatbot**             | Dialogflow, Langchain      | Dialogflow CX (tem creditos)    |
| **Charts**              | Recharts, Chart.js, Tremor | Recharts (popular, React)       |
| **Forms**               | React Hook Form + Zod      | React Hook Form + Zod           |
| **Document Gen**        | docx + puppeteer           | docx + puppeteer                |
| **Excel**               | xlsx, exceljs              | xlsx (mais simples)             |
| **Data Fetching**       | SWR, React Query           | React Query (mais features)     |
| **Database**            | Supabase, Firebase         | Supabase (PostgreSQL)           |
| **Storage**             | Cloudflare R2, S3          | R2 (zero egress)                |

---

## Proximos Passos Recomendados

1. **Decidir stack de AI/Backend** - Gemini vs OpenAI, Vertex vs alternativas
2. **Criar schema do banco de dados** - Tabelas necessarias
3. **Implementar features compartilhadas primeiro:**
   - Extracao de texto (usa em 2, 3, 6, 7)
   - API de cotacoes (usa em 5, 9)
   - Geracao de docs (usa em 4, 10)
4. **Comecar pelo MVP das features core (1-5)**
5. **Adicionar features adicionais (6-10)**

---

_Documento gerado em: Dezembro 2024_
