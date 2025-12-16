# Migração Dialogflow CX → LangGraph

> Plano de migração dos workflows de CPR do Dialogflow CX para LangGraph 1.0.5
>
> Atualizado: 2025-12-16

> Nota: este documento descreve a arquitetura e implementação no **backend** (FastAPI). Os paths citados (ex.: `app/agents/...`) pertencem ao repositório do backend.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estado Atual (Dialogflow CX)](#estado-atual-dialogflow-cx)
- [Arquitetura Alvo (LangGraph)](#arquitetura-alvo-langgraph)
- [Workflows a Migrar](#workflows-a-migrar)
- [Plano de Migração](#plano-de-migração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Testes](#testes)
- [Rollback Strategy](#rollback-strategy)

---

## Visão Geral

### Por que migrar?

| Aspecto | Dialogflow CX | LangGraph |
|---------|--------------|-----------|
| **Custo** | $$$ (por requisição) | $ (apenas LLM) |
| **Controle** | Limitado (GUI) | Total (código) |
| **Flexibilidade** | Flows pré-definidos | Grafos customizáveis |
| **Human-in-the-loop** | Limitado | Nativo (`interrupt()`) |
| **Debugging** | Console GCP | Logs + Langfuse |
| **Versioning** | Console GUI | Git (código) |
| **Observabilidade** | GCP Logs | Langfuse/LangSmith |
| **Latência** | Mais alta (2 hops) | Menor (direto) |
| **Multi-modelo** | Não | Sim (OpenRouter) |

### Benefícios da Migração

✅ **Redução de custos** - Elimina cobrança por requisição do Dialogflow
✅ **Maior controle** - Workflows em Python (versionados no Git)
✅ **Melhor debugging** - Logs estruturados + Langfuse tracing
✅ **Human-in-the-loop nativo** - `interrupt()` + `Command(resume=...)`
✅ **Multi-modelo** - Usar modelos grátis do OpenRouter por tarefa
✅ **Persistência de estado** - PostgreSQL checkpointer integrado
✅ **Observabilidade** - Langfuse para monitorar cada etapa do workflow

---

## Estado Atual (Dialogflow CX)

### Endpoint Existente

```
POST /api/v1/dialogflow/webhook
```

**Flows ativos:**

1. **analise_cpr** - Análise de documentos CPR
2. **criar_cpr** - Criação de novos CPRs

### Flow: analise_cpr

| Tag | Descrição | Ação |
|-----|-----------|------|
| `processar_documento` | Extrai texto do PDF | Gemini Vision |
| `confirmar_dados` | Valida dados extraídos | Human-in-the-loop |
| `validar_compliance` | Verifica Lei 8.929/94 | Llama 3.3 70B |
| `calcular_risco` | Score de risco | Llama 3.3 70B |
| `resultado_final` | Gera relatório | Mistral 7B |

### Flow: criar_cpr

| Tag | Descrição | Ação |
|-----|-----------|------|
| `coletar_dados_basicos` | Tipo, emitente, credor | Gemini Flash |
| `coletar_quantidade` | Produto e quantidade | Gemini Flash |
| `coletar_valor` | Valores e prazos | Gemini Flash |
| `confirmar_cpr` | Validação final | Human-in-the-loop |
| `gerar_cpr` | Gera documento Word/PDF | Llama 3.3 70B |

### Variáveis Dialogflow (A REMOVER)

```bash
DIALOGFLOW_PROJECT_ID=xxx
DIALOGFLOW_AGENT_ID=xxx
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

---

## Arquitetura Alvo (LangGraph)

### Estrutura de Arquivos (Backend)

```
app/
├── agents/                          # LangGraph workflows
│   ├── __init__.py
│   ├── analise_cpr.py              # Flow de análise
│   ├── criar_cpr.py                # Flow de criação
│   └── shared/
│       ├── llm_router.py           # Seleção de modelo por tarefa
│       ├── checkpointer.py         # PostgreSQL checkpointer
│       └── interrupts.py           # Helpers para interrupt/resume
├── api/
│   └── routes/
│       └── chat.py                 # Roteamento de workflows
└── core/
    └── config.py                   # Configurações LangGraph
```

### Fluxo de Roteamento

```
┌─────────────────────────────────────────────────────────────────┐
│                      POST /api/v1/chat                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
           ┌─────────────────────────────────┐
           │   Tem workflow ativo?           │
           │   (check PostgreSQL state)      │
           └─────────┬───────────────────────┘
                     │
         ┌───────────┴──────────┐
         │ Sim                  │ Não
         ▼                      ▼
   ┌──────────┐         ┌──────────────┐
   │ Resume   │         │ Detectar     │
   │ workflow │         │ intent       │
   └──────────┘         └──────┬───────┘
                               │
                    ┌──────────┴───────────┐
                    │ "analisar cpr"       │ "criar cpr"
                    ▼                      ▼
           ┌────────────────┐     ┌────────────────┐
           │ Start          │     │ Start          │
           │ analise_cpr    │     │ criar_cpr      │
           │ workflow       │     │ workflow       │
           └────────────────┘     └────────────────┘
```

---

## Workflows a Migrar

### Workflow 1: analise_cpr

#### Estado no LangGraph

```python
class AnaliseState(TypedDict):
    session_id: str
    document_id: str
    extracted_text: str
    dados_validados: dict
    compliance_result: dict
    risco_score: float
    relatorio_final: str
    analise_completa: bool
    messages: list
```

#### Nós do Grafo

```python
graph = StateGraph(AnaliseState)

# Nós
graph.add_node("extrair_texto", extrair_texto_node)
graph.add_node("validar_dados", validar_dados_node)
graph.add_node("aguardar_confirmacao", aguardar_confirmacao_node)  # interrupt()
graph.add_node("validar_compliance", validar_compliance_node)
graph.add_node("calcular_risco", calcular_risco_node)
graph.add_node("gerar_relatorio", gerar_relatorio_node)

# Edges
graph.add_edge(START, "extrair_texto")
graph.add_edge("extrair_texto", "validar_dados")
graph.add_edge("validar_dados", "aguardar_confirmacao")
graph.add_conditional_edges(
    "aguardar_confirmacao",
    lambda s: "prosseguir" if s.get("dados_validados") else "revalidar",
    {
        "prosseguir": "validar_compliance",
        "revalidar": "validar_dados"
    }
)
graph.add_edge("validar_compliance", "calcular_risco")
graph.add_edge("calcular_risco", "gerar_relatorio")
graph.add_edge("gerar_relatorio", END)
```

#### Mapeamento de Modelos

| Nó | Modelo (OpenRouter) | Temperatura | Justificativa |
|----|---------------------|-------------|---------------|
| `extrair_texto` | `qwen/qwen-2.5-72b-instruct:free` | 0.0 | Extração estruturada JSON |
| `validar_dados` | `meta-llama/llama-3.3-70b-instruct:free` | 0.1 | Validação lógica |
| `validar_compliance` | `meta-llama/llama-3.3-70b-instruct:free` | 0.1 | Raciocínio jurídico |
| `calcular_risco` | `meta-llama/llama-3.3-70b-instruct:free` | 0.1 | Análise quantitativa |
| `gerar_relatorio` | `mistralai/mistral-7b-instruct:free` | 0.3 | Formatação de texto |

#### Interrupt Points

```python
# Após validação de dados (aguardar confirmação do usuário)
if not state.get("dados_confirmados"):
    interrupt("Confirme os dados extraídos antes de prosseguir")
```

---

### Workflow 2: criar_cpr

#### Estado no LangGraph

```python
class CriarCPRState(TypedDict):
    session_id: str
    tipo_cpr: str  # "fisica" | "financeira"
    dados_emitente: dict
    dados_credor: dict
    produto: dict
    valores: dict
    garantias: dict
    documento_gerado: bool
    documento_url: str
    messages: list
```

#### Nós do Grafo

```python
graph = StateGraph(CriarCPRState)

# Nós
graph.add_node("coletar_tipo", coletar_tipo_node)
graph.add_node("coletar_emitente", coletar_emitente_node)
graph.add_node("coletar_credor", coletar_credor_node)
graph.add_node("coletar_produto", coletar_produto_node)
graph.add_node("coletar_valores", coletar_valores_node)
graph.add_node("coletar_garantias", coletar_garantias_node)
graph.add_node("revisar_dados", revisar_dados_node)
graph.add_node("aguardar_confirmacao", aguardar_confirmacao_node)  # interrupt()
graph.add_node("gerar_documento", gerar_documento_node)

# Edges
graph.add_edge(START, "coletar_tipo")
graph.add_edge("coletar_tipo", "coletar_emitente")
graph.add_edge("coletar_emitente", "coletar_credor")
graph.add_edge("coletar_credor", "coletar_produto")
graph.add_edge("coletar_produto", "coletar_valores")
graph.add_edge("coletar_valores", "coletar_garantias")
graph.add_edge("coletar_garantias", "revisar_dados")
graph.add_edge("revisar_dados", "aguardar_confirmacao")
graph.add_conditional_edges(
    "aguardar_confirmacao",
    lambda s: "gerar" if s.get("confirmado") else "revisar",
    {
        "gerar": "gerar_documento",
        "revisar": "revisar_dados"
    }
)
graph.add_edge("gerar_documento", END)
```

#### Mapeamento de Modelos

| Nó | Modelo (OpenRouter) | Temperatura | Justificativa |
|----|---------------------|-------------|---------------|
| `coletar_*` | `google/gemini-2.0-flash-exp:free` | 0.5 | Diálogo natural, validações |
| `revisar_dados` | `google/gemini-2.0-flash-exp:free` | 0.3 | Resumo estruturado |
| `gerar_documento` | `meta-llama/llama-3.3-70b-instruct:free` | 0.2 | Precisão jurídica |

#### Interrupt Points

```python
# Após coleta de todos os dados (aguardar confirmação final)
if not state.get("confirmado"):
    interrupt("Revise e confirme os dados antes de gerar o CPR")
```

---

## Plano de Migração

### Fase 1: Preparação ✅

- [x] Instalar dependências LangGraph
- [x] Criar estrutura de arquivos
- [x] Configurar PostgreSQL checkpointer
- [x] Implementar LLM router com OpenRouter

### Fase 2: Implementação dos Workflows ✅

- [x] Implementar `analise_cpr.py`
- [x] Implementar `criar_cpr.py`
- [x] Adicionar interrupt points
- [x] Testar persistência de estado

### Fase 3: Testes Unitários ✅

- [x] Testes de cada nó isolado
- [x] Testes de transições
- [x] Testes de interrupt/resume
- [x] Testes de edge cases

### Fase 4: Integração com Chat Endpoint ✅

- [x] Modificar `/api/v1/chat`
- [x] Adicionar detecção de intent
- [x] Implementar roteamento para workflows
- [x] Manter fallback para Dialogflow CX (temporário)

### Fase 5: Deploy e Testes em Produção 🔄

- [ ] Configurar variáveis no Railway
- [ ] Deploy do backend
- [ ] Testes A/B (Dialogflow vs LangGraph)
- [ ] Monitorar métricas (latência, erros, custos)
- [ ] Ajustes baseados em feedback

### Fase 6: Desativação do Dialogflow ⏳

- [ ] Remover endpoint `/api/v1/dialogflow/webhook`
- [ ] Remover variáveis Dialogflow
- [ ] Cancelar serviço Dialogflow CX no GCP
- [ ] Atualizar documentação

---

## Variáveis de Ambiente

### ✅ Adicionar (LangGraph)

```bash
# OpenRouter para multi-modelo
OPENROUTER_API_KEY=sk-or-xxx

# LangGraph checkpointer (usa PostgreSQL existente)
LANGGRAPH_CHECKPOINTER_URL=$DATABASE_URL
LANGGRAPH_INTERRUPT_ENABLED=true

# Langfuse observability (recomendado)
LANGFUSE_PUBLIC_KEY=pk-lf-xxx
LANGFUSE_SECRET_KEY=sk-lf-xxx
LANGFUSE_HOST=https://cloud.langfuse.com
```

### ❌ Remover (Após migração completa)

```bash
DIALOGFLOW_PROJECT_ID=xxx
DIALOGFLOW_AGENT_ID=xxx
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### ⚠️ Manter (Temporariamente)

Durante a fase de testes A/B, manter ambas configurações:

```bash
# LangGraph (novo)
OPENROUTER_API_KEY=xxx
LANGGRAPH_CHECKPOINTER_URL=xxx

# Dialogflow (fallback)
DIALOGFLOW_PROJECT_ID=xxx
DIALOGFLOW_AGENT_ID=xxx
```

---

## Testes

### Testes Unitários

```bash
# Testar workflows isolados
pytest tests/agents/test_analise_cpr.py
pytest tests/agents/test_criar_cpr.py

# Testar interrupt/resume
pytest tests/agents/test_interrupts.py

# Testar checkpointer
pytest tests/agents/test_persistence.py
```

### Testes de Integração

```bash
# Testar roteamento no endpoint /chat
pytest tests/api/test_chat_routing.py

# Testar fluxo completo analise_cpr
pytest tests/integration/test_analise_flow.py

# Testar fluxo completo criar_cpr
pytest tests/integration/test_criar_flow.py
```

### Testes Manuais (Staging)

1. **Análise de CPR**:
   - Enviar mensagem: "Quero analisar um CPR"
   - Fazer upload de documento PDF
   - Verificar extração de dados
   - Confirmar dados extraídos
   - Verificar relatório de compliance
   - Verificar cálculo de risco

2. **Criação de CPR**:
   - Enviar mensagem: "Quero criar um CPR"
   - Seguir wizard de coleta de dados
   - Revisar dados coletados
   - Confirmar geração
   - Verificar documento gerado

3. **Interrupt/Resume**:
   - Iniciar workflow
   - Sair no meio (fechar navegador)
   - Voltar depois
   - Enviar nova mensagem
   - Verificar que workflow continua de onde parou

---

## Rollback Strategy

### Se encontrar problemas críticos

#### Opção 1: Rollback Rápido (Endpoint)

```python
# Em app/api/routes/chat.py
USE_LANGGRAPH = os.getenv("ENABLE_LANGGRAPH", "false") == "true"

if USE_LANGGRAPH:
    # Tentar LangGraph
    try:
        response = await langgraph_handler(...)
    except Exception as e:
        logger.error(f"LangGraph failed, fallback to Dialogflow: {e}")
        response = dialogflow_handler(...)
else:
    # Usar apenas Dialogflow
    response = dialogflow_handler(...)
```

Rollback:
```bash
railway variables set ENABLE_LANGGRAPH=false
```

#### Opção 2: Rollback via Railway

```bash
# Ver deployments
railway deployments

# Fazer rollback para versão anterior
railway rollback <deployment-id>
```

#### Opção 3: Rollback via Git

```bash
# Reverter commit
git revert <commit-hash>
git push

# Railway faz deploy automático
```

---

## Monitoramento

### Métricas a Acompanhar

| Métrica | Dialogflow CX | LangGraph (Alvo) |
|---------|---------------|------------------|
| **Latência média** | ~2-3s | <1.5s |
| **Taxa de erro** | <1% | <0.5% |
| **Custo/1000 req** | ~$10-20 | ~$2-5 |
| **Taxa de conclusão** | ~80% | >90% |

### Dashboards

1. **Langfuse** - Tracing de workflows
   - Tempo por nó
   - Tokens consumidos por modelo
   - Taxa de sucesso/falha
   - Custo por workflow

2. **PostHog** - Analytics de produto
   - Eventos de início/conclusão de workflow
   - Tempo médio de conclusão
   - Taxa de abandono

3. **Sentry** - Error tracking
   - Erros por nó do workflow
   - Stack traces
   - Alertas em tempo real

---

## Cronograma Estimado

| Fase | Duração | Status |
|------|---------|--------|
| Fase 1: Preparação | 2 dias | ✅ Concluído |
| Fase 2: Implementação | 3 dias | ✅ Concluído |
| Fase 3: Testes Unitários | 2 dias | ✅ Concluído |
| Fase 4: Integração | 1 dia | ✅ Concluído |
| Fase 5: Deploy + Testes | 3 dias | 🔄 Em andamento |
| Fase 6: Desativação Dialogflow | 1 dia | ⏳ Pendente |
| **Total** | **12 dias** | **83% completo** |

---

## Checklist Final

### Antes do Deploy

- [ ] Todas as variáveis configuradas no Railway
- [ ] `OPENROUTER_API_KEY` válida e testada
- [ ] `LANGGRAPH_CHECKPOINTER_URL` apontando para PostgreSQL
- [ ] `LANGFUSE_*` configurado (opcional mas recomendado)
- [ ] Testes unitários passando (98 testes OK)
- [ ] Testes de integração criados
- [ ] Documentação atualizada

### Após o Deploy

- [ ] Verificar health check: `/api/v1/health/`
- [ ] Testar workflow analise_cpr end-to-end
- [ ] Testar workflow criar_cpr end-to-end
- [ ] Verificar logs no Railway
- [ ] Verificar traces no Langfuse
- [ ] Monitorar erros no Sentry
- [ ] Monitorar eventos no PostHog
- [ ] Comparar latência: Dialogflow vs LangGraph
- [ ] Comparar custos após 1 semana

### Após 1 Semana de Testes A/B

- [ ] Analisar métricas de performance
- [ ] Analisar feedback de usuários
- [ ] Decidir: continuar LangGraph ou rollback
- [ ] Se OK: remover Dialogflow (Fase 6)
- [ ] Atualizar documentação final

---

## Recursos

### Documentação

- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [LangGraph Checkpointer](https://langchain-ai.github.io/langgraph/how-tos/persistence/)
- [LangGraph Human-in-the-loop](https://langchain-ai.github.io/langgraph/how-tos/human-in-the-loop/)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Langfuse Docs](https://langfuse.com/docs)

### Exemplos de Código

- `app/agents/analise_cpr.py` - Workflow de análise
- `app/agents/criar_cpr.py` - Workflow de criação
- `app/api/routes/chat.py` - Roteamento de workflows

---

**Última atualização**: 2025-12-16 | [Voltar ao índice](#-índice)
