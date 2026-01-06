# Backlog - GitHub Issues (PENDING ONLY)

Este documento contém as issues pendentes para o piloto Verity Agro. Itens já implementados foram removidos para manter o foco na execução.

---

## FEATURE 1: Tirar Dúvidas sobre CPR

### Issue #2

**Título:** [GCP] Configurar Vertex AI Search datastore para base CPR
**Labels:** `infra` `devops` `P1-high` `feat-1-duvidas` `sprint-1`

### Issue #3

**Título:** [CONTEUDO] Coletar e estruturar base de conhecimento CPR
**Labels:** `content` `P1-high` `feat-1-duvidas` `sprint-1`

### Issue #4

**Título:** [GCP] Indexar documentos no Vertex AI Search
**Labels:** `infra` `backend` `P1-high` `feat-1-duvidas` `sprint-1`

### Issue #5

**Título:** [BACKEND] Integrar Vertex AI Search no serviço de chat
**Labels:** `backend` `P1-high` `feat-1-duvidas` `sprint-2`

### Issue #8

**Título:** [GCP] Configurar Dialogflow CX para perguntas complexas
**Labels:** `infra` `P2-medium` `feat-1-duvidas` `sprint-3`

---

## FEATURE 2: Analisar/Corrigir CPR

### Issue #9

**Título:** [BACKEND] Criar endpoint de análise de CPR
**Labels:** `feature` `backend` `P1-high` `feat-2-analisar` `sprint-1`

### Issue #10

**Título:** [BACKEND] Integrar Gemini Vision para extração de texto de PDF
**Labels:** `backend` `P1-high` `feat-2-analisar` `sprint-1`

### Issue #11

**Título:** [BACKEND] Criar prompt estruturado para análise de CPR
**Labels:** `backend` `P1-high` `feat-2-analisar` `sprint-1`

### Issue #12

**Título:** [BACKEND] Implementar regras de validação de CPR
**Labels:** `backend` `P1-high` `feat-2-analisar` `sprint-1`

### Issue #16

**Título:** [BACKEND] Gerar relatório PDF da análise
**Labels:** `backend` `P2-medium` `feat-2-analisar` `sprint-3`

---

## FEATURE 3: Resumir CPR

### Issue #18

**Título:** [BACKEND] Criar endpoint de resumo de CPR
**Labels:** `feature` `backend` `P1-high` `feat-3-resumir`

### Issue #19

**Título:** [BACKEND] Criar prompt para extração estruturada
**Labels:** `backend` `P1-high` `feat-3-resumir`

### Issue #20

**Título:** [FRONTEND] Criar componente CPRSummary
**Labels:** `frontend` `P1-high` `feat-3-resumir`

### Issue #21

**Título:** [FRONTEND] Botão "Resumir" após upload
**Labels:** `frontend` `P2-medium` `feat-3-resumir`

---

## FEATURE 4: Criar/Fazer CPR

### Issue #24

**Título:** [FRONTEND] Criar componente CPRWizard (formulário multi-step)
**Labels:** `feature` `frontend` `P1-high` `feat-4-criar`
_(Nota: Steps 4-6 já possuem UI inicial em src/components/v2/CPRWizard)_

### Issue #31

**Título:** [BACKEND] Criar endpoint de geração de CPR
**Labels:** `backend` `P1-high` `feat-4-criar`

### Issue #32

**Título:** [BACKEND] Integrar biblioteca docx para gerar Word
**Labels:** `backend` `P1-high` `feat-4-criar`

### Issue #33

**Título:** [BACKEND] Integrar puppeteer para gerar PDF
**Labels:** `backend` `P1-high` `feat-4-criar`

### Issue #34

**Título:** [CONTEUDO] Criar templates de CPR Física e Financeira
**Labels:** `content` `P1-high` `feat-4-criar`

### Issue #35

**Título:** [DATABASE] Criar tabela para CPRs geradas
**Labels:** `backend` `infra` `P2-medium` `feat-4-criar`

---

## FEATURE 5: Simular CPR (Valores)

### Issue #36

**Título:** [FRONTEND] Criar componente CPRSimulator
**Labels:** `feature` `frontend` `P1-high` `feat-5-simular`
_(Nota: UI inicial funcional em src/components/v2/CPRSimulator)_

### Issue #37

**Título:** [BACKEND] Criar endpoint de cotações atuais
**Labels:** `backend` `P1-high` `feat-5-simular`

### Issue #38

**Título:** [BACKEND] Integrar API de cotações
**Labels:** `backend` `P1-high` `feat-5-simular`

---

## FEATURE 6: Extrator de Dados Estruturados

### Issue #43

**Título:** [BACKEND] Criar endpoint de extração estruturada
**Labels:** `feature` `backend` `P1-high` `feat-6-extrator`

### Issue #44

**Título:** [FRONTEND] Criar componente DataExtractor
**Labels:** `frontend` `P1-high` `feat-6-extrator`

---

## FEATURE 7: Checklist de Compliance

### Issue #48

**Título:** [CONTEUDO] Mapear requisitos da Lei 8.929/94
**Labels:** `content` `P1-high` `feat-7-compliance`

### Issue #49

**Título:** [BACKEND] Criar endpoint de verificação de compliance
**Labels:** `backend` `P1-high` `feat-7-compliance`

### Issue #51

**Título:** [FRONTEND] Criar componente ComplianceChecklist
**Labels:** `frontend` `P1-high` `feat-7-compliance`

---

## FEATURE 8: Calculadora de Risco

### Issue #54

**Título:** [BACKEND] Criar endpoint de cálculo de risco
**Labels:** `backend` `P1-high` `feat-8-risco`

### Issue #56

**Título:** [FRONTEND] Exportar relatório de risco em PDF
**Labels:** `frontend` `P2-medium` `feat-8-risco`

---

## FEATURE 9: Histórico de Cotações

### Issue #61

**Título:** [INFRA] Configurar cron job para coleta de cotações
**Labels:** `infra` `devops` `P2-medium` `feat-9-cotacoes`

### Issue #63

**Título:** [FRONTEND] Comparação preço CPR vs mercado no gráfico
**Labels:** `frontend` `P2-medium` `feat-9-cotacoes`

---

## FEATURE 10: Gerador de Minuta

### Issue #64

**Título:** [CONTEUDO] Criar templates de minutas (Jurídico)
**Labels:** `content` `P1-high` `feat-10-minuta`

### Issue #66

**Título:** [BACKEND] Criar endpoint de geração de minuta
**Labels:** `backend` `P1-high` `feat-10-minuta`

### Issue #67

**Título:** [BACKEND] Implementar template engine
**Labels:** `backend` `P1-high` `feat-10-minuta`

---

## BUGS E MELHORIAS PENDENTES

### Issue #73

**Título:** [ENHANCEMENT] Implementar tratamento global de erros
**Labels:** `enhancement` `frontend` `P2-medium`

### Issue #74

**Título:** [ENHANCEMENT] Implementar React Query para data fetching
**Labels:** `enhancement` `frontend` `P2-medium`

### Issue #75

**Título:** [INFRA] Configurar Langfuse para observabilidade LLM
**Labels:** `infra` `devops` `P1-high`

### Issue #76

**Título:** [INFRA] Configurar Sentry para error tracking
**Labels:** `infra` `devops` `P1-high`

### Issue #88 - URGENTE

**Título:** [BUG][URGENTE] Corrigir envio de email para reset de senha
**Labels:** `bug` `backend` `P0-critical`

### Issue #89

**Título:** [BUG] Corrigir inconsistências nas respostas da IA (Prompt Engineering)
**Labels:** `bug` `backend` `ai` `P1-high`

### Issue #91

**Título:** [FEATURE] Implementar tour guiado para novos usuários (Onboarding)
**Labels:** `feature` `frontend` `ux` `P2-medium`

### Issue #93

**Título:** [ENHANCEMENT] Otimizar RAG (Chunking & Metadata)
**Labels:** `enhancement` `backend` `ai` `P2-medium`

### Issue #94

**Título:** [ENHANCEMENT] Otimizar latência (Streaming de Respostas)
**Labels:** `enhancement` `backend` `ai` `performance` `P1-high`
