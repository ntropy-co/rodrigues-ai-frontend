# Plano Estrategico: Piloto de 1 Mes

## Visao Geral

| Metrica      | Valor                                   |
| ------------ | --------------------------------------- |
| **Empresas** | 60                                      |
| **Usuarios** | 150                                     |
| **Duracao**  | 1 mes                                   |
| **Objetivo** | Maximo resultado + Seguranca + Economia |

---

## Parte 1: Estimativa de Volume

### Premissas para o Calculo

| Metrica                    | Valor Estimado | Justificativa    |
| -------------------------- | -------------- | ---------------- |
| **Usuarios ativos**        | 150            | Dado fornecido   |
| **Dias uteis/mes**         | 22             | Mes comercial    |
| **Interacoes/usuario/dia** | 15-25          | Uso moderado B2B |
| **Documentos/empresa**     | 10-20          | CPRs, contratos  |
| **Queries em docs/dia**    | 5-10           | Analises de CPR  |

### Volume Total Estimado (1 mes)

| Tipo                      | Calculo                             | Total                  |
| ------------------------- | ----------------------------------- | ---------------------- |
| **Chat sessions**         | 150 users x 22 dias x 1 session/dia | **3,300 sessions**     |
| **Mensagens de chat**     | 150 x 22 x 20 msg                   | **66,000 mensagens**   |
| **Queries em documentos** | 150 x 22 x 8 queries                | **26,400 queries RAG** |
| **Documentos indexados**  | 60 empresas x 15 docs               | **900 documentos**     |
| **Storage (docs)**        | 900 x 2MB medio                     | **~1.8 GB**            |

---

## Parte 2: Creditos Disponiveis

### Resumo de Creditos

| Credito                           | Valor      | Validade |
| --------------------------------- | ---------- | -------- |
| GenAI App Builder (Vertex Search) | $1,000     | 12 meses |
| Dialogflow CX                     | $600       | 12 meses |
| Vector Search                     | $1,000     | 12 meses |
| GCP Free Trial                    | $300       | 90 dias  |
| **TOTAL**                         | **$2,900** | -        |

---

## Parte 3: Custo Estimado do Piloto

### Opcao A: Stack Google Cloud (Maxima Qualidade)

| Servico                | Uso            | Custo Unit.     | Total     |
| ---------------------- | -------------- | --------------- | --------- |
| **Dialogflow CX**      | 3,300 sessions | $0.20/session   | **$660**  |
| **Vertex AI Search**   | 26,400 queries | $1.50/1000      | **$40**   |
| **Generative Answers** | 13,200 queries | $3.00/1000      | **$40**   |
| **Gemini 2.5 Flash**   | ~5M tokens     | $0.075/1M input | **$15**   |
| **Cloud Storage**      | 2GB            | $0.02/GB        | **$0.04** |
| **SUBTOTAL GCP**       | -              | -               | **~$755** |

### Opcao B: Stack Hibrida (Recomendada)

| Servico              | Uso                     | Custo     | Pago com      |
| -------------------- | ----------------------- | --------- | ------------- |
| **Dialogflow CX**    | Queries complexas (30%) | ~$200     | Credito $600  |
| **Dialogflow ES**    | FAQ simples (70%)       | **$0**    | Free tier     |
| **Vertex AI Search** | 26,400 queries          | ~$80      | Credito $1000 |
| **Supabase Pro**     | Auth + DB               | $25       | Cartao        |
| **Cloudflare R2**    | Storage docs            | ~$3       | Cartao        |
| **Vercel Pro**       | Hosting                 | $20       | Cartao        |
| **SUBTOTAL**         | -                       | **~$328** | -             |

**Resultado da Opcao B:**

- Creditos GCP gastos: ~$280
- Custo real (cartao): ~$48/mes
- **Creditos restantes: ~$2,620**

---

## Parte 4: Arquitetura Recomendada

```
+---------------------------------------------------------------------+
|                         FRONTEND                                     |
|                    Next.js 15 (Vercel Pro)                          |
|                         $20/mes                                      |
+---------------------------------------------------------------------+
                                  |
                                  v
+---------------------------------------------------------------------+
|                      API LAYER (Next.js)                            |
|                    Rate Limiting + Auth Check                        |
+---------------------------------------------------------------------+
                                  |
        +-------------------------+-------------------------+
        v                         v                         v
+---------------+        +---------------+        +---------------+
|   Supabase    |        |   Roteador    |        |  Cloudflare   |
|   Auth + DB   |        |  Inteligente  |        |      R2       |
|   $25/mes     |        |               |        |    ~$3/mes    |
|               |        |               |        |               |
| - Auth + MFA  |        |               |        | - PDFs CPR    |
| - PostgreSQL  |        |               |        | - Contratos   |
| - RLS         |        |               |        | - Zero egress |
| - Audit logs  |        |               |        |               |
+---------------+        +---------------+        +---------------+
                                  |
                    +-------------+-------------+
                    v                           v
          +------------------+       +------------------------+
          |  Dialogflow ES   |       |     Dialogflow CX      |
          |    (GRATIS)      |       |    ($600 credito)      |
          |                  |       |                        |
          | - "Ola"          |       | - Data Store Agent     |
          | - FAQ geral      |       | - Analise de CPR       |
          | - Navegacao      |       | - Queries em docs      |
          | - ~70% trafego   |       | - ~30% trafego         |
          +------------------+       +------------------------+
                                                |
                                                v
                                      +------------------+
                                      |  Vertex AI       |
                                      |    Search        |
                                      | ($1000 credito)  |
                                      |                  |
                                      | - Index docs     |
                                      | - RAG/Search     |
                                      | - Gen Answers    |
                                      +------------------+
                                                |
                                                v
                                      +------------------+
                                      |  Gemini 2.5      |
                                      |     Flash        |
                                      | ($300 credito)   |
                                      +------------------+
```

---

## Parte 5: Seguranca

### Checklist de Seguranca Essencial

#### 1. Autenticacao & Acesso

| Feature             | Implementacao             | Status      |
| ------------------- | ------------------------- | ----------- |
| **Login seguro**    | Supabase Auth             | Incluido    |
| **MFA**             | Supabase Auth             | Ativar      |
| **Session timeout** | 30 min inatividade        | Configurar  |
| **Password policy** | Min 8 chars, complexidade | Configurar  |
| **Rate limiting**   | 100 req/min por user      | Implementar |

#### 2. Dados em Transito & Repouso

| Feature                | Implementacao       | Status   |
| ---------------------- | ------------------- | -------- |
| **HTTPS**              | Vercel (automatico) | Gratis   |
| **TLS 1.3**            | Todos os servicos   | Default  |
| **Encryption at rest** | Supabase AES-256    | Incluido |
| **Encryption at rest** | GCP (default)       | Incluido |
| **Cloudflare R2**      | Encrypted           | Incluido |

#### 3. Isolamento de Dados (Multi-tenant)

| Feature                     | Implementacao                       | Prioridade  |
| --------------------------- | ----------------------------------- | ----------- |
| **Row Level Security**      | Supabase RLS                        | CRITICO     |
| **Org-based isolation**     | organization_id em todas as tabelas | CRITICO     |
| **Docs isolation**          | Prefixo por org no R2               | CRITICO     |
| **Vertex Search isolation** | Data store por org                  | Recomendado |

#### 4. Compliance & Auditoria

| Feature            | Implementacao    | Status      |
| ------------------ | ---------------- | ----------- |
| **Audit logs**     | Supabase + GCP   | Ativar      |
| **Activity logs**  | Tabela custom    | Implementar |
| **Data retention** | 90 dias default  | Configurar  |
| **LGPD ready**     | Termos + consent | Implementar |

### Implementacao de Row Level Security (Supabase)

```sql
-- Policy para isolamento por organizacao
CREATE POLICY "Users can only see their org data"
ON documents
FOR ALL
USING (organization_id = auth.jwt() ->> 'organization_id');

CREATE POLICY "Users can only see their org sessions"
ON chat_sessions
FOR ALL
USING (organization_id = auth.jwt() ->> 'organization_id');

CREATE POLICY "Users can only see their org messages"
ON chat_messages
FOR ALL
USING (
  session_id IN (
    SELECT id FROM chat_sessions
    WHERE organization_id = auth.jwt() ->> 'organization_id'
  )
);
```

### Rate Limiting (Next.js API)

```typescript
// middleware.ts ou lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
  analytics: true
})

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString()
    }
  }
}
```

---

## Parte 6: Funcionalidades do Piloto

### Resumo das Funcionalidades

| #   | Funcionalidade          | Categoria | Prioridade     | Complexidade |
| --- | ----------------------- | --------- | -------------- | ------------ |
| 1   | Tirar Duvidas sobre CPR | Chat/RAG  | P1 - Core      | Baixa        |
| 2   | Analisar/Corrigir CPR   | Analise   | P1 - Core      | Media        |
| 3   | Resumir CPR             | Analise   | P1 - Core      | Baixa        |
| 4   | Criar/Fazer CPR         | Geracao   | P1 - Core      | Media        |
| 5   | Simular CPR (valores)   | Calculo   | P1 - Core      | Media        |
| 6   | Extrator de Dados       | Analise   | P1 - Adicional | Baixa        |
| 7   | Checklist Compliance    | Analise   | P1 - Adicional | Baixa        |
| 8   | Calculadora de Risco    | Analise   | P1 - Adicional | Media-Baixa  |
| 9   | Historico de Cotacoes   | Contexto  | P1 - Adicional | Baixa        |
| 10  | Gerador de Minuta       | Geracao   | P1 - Adicional | Baixa        |

---

### Funcionalidade 1: Tirar Duvidas sobre CPR

**Descricao:** Chat inteligente para responder perguntas sobre CPR e temas correlatos (credito rural, garantias, legislacao, etc.)

**Exemplos de uso:**

- "O que e uma CPR fisica?"
- "Qual a diferenca entre CPR e CPR-F?"
- "Quais garantias sao aceitas em uma CPR?"
- "Qual o prazo maximo de uma CPR?"

**Implementacao tecnica:**

- Dialogflow ES para FAQ basico (gratis)
- Dialogflow CX + Vertex AI Search para perguntas complexas
- Base de conhecimento indexada no Vertex Search

**UI sugerida:**

```
+--------------------------------------------------+
|  Assistente Verity                          [X]  |
+--------------------------------------------------+
|                                                  |
|  Usuario: O que e uma CPR fisica?                |
|                                                  |
|  Verity: A CPR Fisica e uma Cedula de Produto   |
|  Rural onde o produtor se compromete a entregar  |
|  o produto agrícola em si (ex: sacas de soja),   |
|  e nao o valor em dinheiro.                      |
|                                                  |
|  Diferente da CPR Financeira, onde a liquidacao  |
|  e feita em moeda corrente.                      |
|                                                  |
|  Fonte: Lei 8.929/94, Art. 4o                    |
|                                                  |
+--------------------------------------------------+
|  Digite sua pergunta...                    [>]   |
+--------------------------------------------------+
```

---

### Funcionalidade 2: Analisar/Corrigir CPR

**Descricao:** Usuario faz upload de uma CPR e o sistema analisa, identifica erros e sugere correcoes/melhorias.

**O que analisa:**

- Dados obrigatorios presentes
- Conformidade com a Lei 8.929/94
- Clareza das clausulas
- Garantias adequadas
- Inconsistencias de valores/datas

**Output esperado:**

```
+--------------------------------------------------+
|  ANALISE DA CPR #12345                           |
+--------------------------------------------------+
|                                                  |
|  Status Geral: ATENCAO NECESSARIA                |
|                                                  |
|  PROBLEMAS ENCONTRADOS:                          |
|                                                  |
|  [!] Erro Critico                                |
|      Data de vencimento anterior a emissao       |
|      Linha 15: "Vencimento: 10/01/2024"          |
|      Sugestao: Corrigir para data futura         |
|                                                  |
|  [!] Erro Critico                                |
|      Avalista sem CPF/CNPJ                       |
|      Linha 28: "Avalista: Joao Silva"            |
|      Sugestao: Incluir documento do avalista     |
|                                                  |
|  [i] Melhoria Sugerida                           |
|      Descricao do produto pouco detalhada        |
|      Atual: "Soja"                               |
|      Sugestao: "Soja em graos, tipo exportacao,  |
|      safra 2024/2025, padrao ANEC"               |
|                                                  |
|  [i] Melhoria Sugerida                           |
|      Clausula de correcao monetaria ausente      |
|      Sugestao: Adicionar indice de correcao      |
|                                                  |
+--------------------------------------------------+
|  [Baixar Relatorio PDF]  [Aplicar Sugestoes]     |
+--------------------------------------------------+
```

**Implementacao tecnica:**

- Upload do PDF para Cloudflare R2
- Extracao de texto via Gemini Vision ou Document AI
- Analise via prompt estruturado no Gemini
- Regras de validacao pre-definidas

---

### Funcionalidade 3: Resumir CPR

**Descricao:** Gera um resumo executivo da CPR com os principais pontos.

**Output esperado:**

```
+--------------------------------------------------+
|  RESUMO EXECUTIVO - CPR #12345                   |
+--------------------------------------------------+
|                                                  |
|  PARTES:                                         |
|  - Emitente: Fazenda Sao Joao Ltda               |
|  - Credor: Banco ABC S.A.                        |
|  - Avalista: Maria Santos (CPF: xxx.xxx.xxx-xx)  |
|                                                  |
|  OBJETO:                                         |
|  - Produto: Soja em graos                        |
|  - Quantidade: 5.000 sacas de 60kg               |
|  - Qualidade: Padrao exportacao ANEC             |
|                                                  |
|  VALORES:                                        |
|  - Valor Total: R$ 750.000,00                    |
|  - Preco/Saca: R$ 150,00                         |
|                                                  |
|  PRAZOS:                                         |
|  - Emissao: 15/12/2024                           |
|  - Vencimento: 15/06/2025                        |
|  - Prazo: 6 meses                                |
|                                                  |
|  GARANTIAS:                                      |
|  - Penhor de 1o grau sobre safra 2024/2025      |
|  - Aval pessoal de Maria Santos                  |
|                                                  |
|  LOCAL DE ENTREGA:                               |
|  - Armazem XYZ, Rod. BR-163, km 45               |
|                                                  |
+--------------------------------------------------+
|  [Copiar]  [Exportar PDF]  [Exportar Excel]      |
+--------------------------------------------------+
```

---

### Funcionalidade 4: Criar/Fazer CPR

**Descricao:** Usuario preenche um formulario e o sistema gera o documento da CPR completo.

**Fluxo:**

1. Usuario seleciona tipo de CPR (Fisica ou Financeira)
2. Preenche formulario guiado
3. Sistema valida dados em tempo real
4. Gera documento Word/PDF pronto para assinatura

**UI do formulario:**

```
+--------------------------------------------------+
|  CRIAR NOVA CPR                          Passo 1/5|
+--------------------------------------------------+
|                                                  |
|  Tipo de CPR:                                    |
|  ( ) CPR Fisica (entrega do produto)             |
|  (x) CPR Financeira (pagamento em dinheiro)      |
|                                                  |
|  DADOS DO EMITENTE:                              |
|  Razao Social: [________________________]        |
|  CNPJ:         [__.___.___/____-__]              |
|  Endereco:     [________________________]        |
|  Cidade/UF:    [________________] / [__]         |
|                                                  |
|  DADOS DO CREDOR:                                |
|  Razao Social: [________________________]        |
|  CNPJ:         [__.___.___/____-__]              |
|                                                  |
+--------------------------------------------------+
|  [Voltar]                           [Proximo >]  |
+--------------------------------------------------+
```

**Output:**

- Documento Word editavel
- PDF para assinatura
- Dados estruturados (JSON) para integracao

---

### Funcionalidade 5: Simular CPR (Valores)

**Descricao:** Calculadora para simular valores de uma operacao de CPR.

**Inputs:**

- Produto (soja, milho, cafe, etc.)
- Quantidade (sacas/toneladas)
- Preco atual ou futuro
- Prazo da operacao
- Taxa de desconto (se aplicavel)

**Output:**

```
+--------------------------------------------------+
|  SIMULADOR DE CPR                                |
+--------------------------------------------------+
|                                                  |
|  PARAMETROS:                                     |
|  Produto:     [Soja_____________] v              |
|  Quantidade:  [5.000] sacas 60kg                 |
|  Preco/Saca:  R$ [150,00]                        |
|  Vencimento:  [180] dias                         |
|  Taxa a.m.:   [1,5] %                            |
|                                                  |
|  ============================================    |
|                                                  |
|  RESULTADO DA SIMULACAO:                         |
|                                                  |
|  Valor Bruto:           R$ 750.000,00            |
|  Desconto (9% / 6m):   -R$  67.500,00            |
|  ------------------------------------------      |
|  Valor Liquido:         R$ 682.500,00            |
|                                                  |
|  Cotacao Atual Soja:    R$ 145,00/saca           |
|  Variacao vs Mercado:   +3,4%                    |
|                                                  |
|  ============================================    |
|                                                  |
|  [Recalcular]  [Salvar Simulacao]  [Criar CPR]   |
+--------------------------------------------------+
```

**Implementacao tecnica:**

- Formulas de calculo no frontend (rapido)
- API de cotacoes para precos atuais
- Historico de simulacoes salvo no Supabase

---

### Funcionalidade 6: Extrator de Dados Estruturados

**Descricao:** Extrai automaticamente todos os dados de uma CPR para formato estruturado.

**Output:**

```
+--------------------------------------------------+
|  DADOS EXTRAIDOS - CPR #12345                    |
+--------------------------------------------------+
|                                                  |
|  +--------------------------------------------+  |
|  | Campo          | Valor                    |  |
|  +--------------------------------------------+  |
|  | Tipo           | CPR Financeira           |  |
|  | Numero         | 2024/001234              |  |
|  | Emitente       | Fazenda Sao Joao Ltda    |  |
|  | CNPJ Emitente  | 12.345.678/0001-90       |  |
|  | Credor         | Banco ABC S.A.           |  |
|  | CNPJ Credor    | 00.000.000/0001-91       |  |
|  | Produto        | Soja                     |  |
|  | Quantidade     | 5.000 sacas              |  |
|  | Valor Total    | R$ 750.000,00            |  |
|  | Data Emissao   | 15/12/2024               |  |
|  | Data Vencim.   | 15/06/2025               |  |
|  | Garantia       | Penhor de safra          |  |
|  | Avalista       | Maria Santos             |  |
|  | CPF Avalista   | 123.456.789-00           |  |
|  +--------------------------------------------+  |
|                                                  |
|  [Exportar Excel]  [Copiar JSON]  [Editar]       |
+--------------------------------------------------+
```

**JSON gerado:**

```json
{
  "tipo": "CPR Financeira",
  "numero": "2024/001234",
  "emitente": {
    "nome": "Fazenda Sao Joao Ltda",
    "cnpj": "12.345.678/0001-90"
  },
  "credor": {
    "nome": "Banco ABC S.A.",
    "cnpj": "00.000.000/0001-91"
  },
  "produto": {
    "tipo": "Soja",
    "quantidade": 5000,
    "unidade": "sacas"
  },
  "valores": {
    "total": 750000,
    "moeda": "BRL"
  },
  "datas": {
    "emissao": "2024-12-15",
    "vencimento": "2025-06-15"
  },
  "garantias": ["Penhor de safra"],
  "avalista": {
    "nome": "Maria Santos",
    "cpf": "123.456.789-00"
  }
}
```

---

### Funcionalidade 7: Checklist de Compliance

**Descricao:** Verifica automaticamente se a CPR atende todos os requisitos legais da Lei 8.929/94.

**Output:**

```
+--------------------------------------------------+
|  CHECKLIST DE COMPLIANCE - CPR #12345            |
+--------------------------------------------------+
|                                                  |
|  REQUISITOS LEGAIS (Lei 8.929/94):               |
|                                                  |
|  [OK] Denominacao "Cedula de Produto Rural"      |
|  [OK] Data e local de emissao                    |
|  [OK] Identificacao completa do emitente         |
|  [OK] Promessa de entrega do produto             |
|  [OK] Descricao do produto (tipo e qualidade)    |
|  [OK] Quantidade do produto                      |
|  [!!] Local de entrega - INCOMPLETO              |
|       > Falta especificar endereco completo      |
|  [OK] Prazo ou data de entrega                   |
|  [OK] Identificacao do credor                    |
|  [OK] Clausula de correcao                       |
|  [!!] Assinatura do emitente - NAO VERIFICADA    |
|       > Documento digitalizado sem certificado   |
|                                                  |
|  ============================================    |
|                                                  |
|  SCORE DE COMPLIANCE: 82%                        |
|  Status: APROVADA COM RESSALVAS                  |
|                                                  |
|  Itens OK: 9/11                                  |
|  Itens com problema: 2/11                        |
|                                                  |
+--------------------------------------------------+
|  [Baixar Relatorio]  [Ver Detalhes]              |
+--------------------------------------------------+
```

**Itens verificados:**

1. Denominacao "Cedula de Produto Rural"
2. Data de emissao
3. Local de emissao
4. Identificacao do emitente (nome, CPF/CNPJ, endereco)
5. Promessa de entrega do produto
6. Descricao do produto com qualidade
7. Quantidade do produto
8. Local de entrega
9. Prazo/data de entrega
10. Identificacao do credor
11. Clausula de vencimento antecipado (se houver)
12. Assinatura do emitente
13. Assinatura do avalista (se houver)

---

### Funcionalidade 8: Calculadora de Risco

**Descricao:** Avalia o risco da operacao baseado em multiplos fatores.

**Output:**

```
+--------------------------------------------------+
|  ANALISE DE RISCO - CPR #12345                   |
+--------------------------------------------------+
|                                                  |
|  SCORE GERAL: 72/100 - RISCO MODERADO            |
|                                                  |
|  [=============================         ]  72%   |
|                                                  |
|  ============================================    |
|                                                  |
|  FATORES POSITIVOS:                              |
|                                                  |
|  [+20] Garantia real (penhor de safra)           |
|  [+15] Avalista com bom historico                |
|  [+10] Prazo curto (< 6 meses)                   |
|  [+10] Credor e instituicao financeira           |
|  [+8]  Produto com alta liquidez (soja)          |
|                                                  |
|  FATORES DE ATENCAO:                             |
|                                                  |
|  [-10] Valor alto (> R$ 500k)                    |
|  [-8]  Regiao com historico de seca              |
|  [-5]  Emitente com menos de 5 anos de atividade |
|  [-3]  Primeira operacao com este credor         |
|                                                  |
|  ============================================    |
|                                                  |
|  RECOMENDACAO:                                   |
|  Aprovar com monitoramento mensal.               |
|  Considerar seguro agricola como mitigador.      |
|                                                  |
+--------------------------------------------------+
|  [Ver Detalhes]  [Exportar Relatorio]            |
+--------------------------------------------------+
```

**Fatores de risco avaliados:**

- Tipo e valor da garantia
- Historico do emitente
- Prazo da operacao
- Valor total
- Liquidez do produto
- Regiao de producao
- Sazonalidade
- Presenca de avalista

---

### Funcionalidade 9: Historico de Cotacoes

**Descricao:** Mostra contexto de mercado ao analisar uma CPR.

**Output:**

```
+--------------------------------------------------+
|  CONTEXTO DE MERCADO - SOJA                      |
+--------------------------------------------------+
|                                                  |
|  COTACAO ATUAL:                                  |
|  Soja (CBOT): US$ 10,25/bushel                   |
|  Soja (Brasil): R$ 145,00/saca                   |
|  Dolar: R$ 6,05                                  |
|                                                  |
|  HISTORICO (ultimos 6 meses):                    |
|                                                  |
|  R$/saca                                         |
|  160|                                            |
|  155|    *                                       |
|  150|  *   *  *                                  |
|  145| *     *   * *  *                           |
|  140|              *                             |
|  135|                                            |
|     +----------------------------------          |
|      Jul Ago Set Out Nov Dez                     |
|                                                  |
|  - Media 6 meses: R$ 148,50/saca                 |
|  - Minima: R$ 138,00 (Out/24)                    |
|  - Maxima: R$ 158,00 (Jul/24)                    |
|                                                  |
|  ============================================    |
|                                                  |
|  ANALISE DA CPR:                                 |
|  Preco na CPR: R$ 150,00/saca                    |
|  vs Mercado atual: +3,4% (acima)                 |
|  vs Media 6 meses: +1,0% (acima)                 |
|                                                  |
|  Avaliacao: Preco dentro da faixa de mercado     |
|                                                  |
+--------------------------------------------------+
```

**Fontes de dados:**

- CBOT (Chicago Board of Trade)
- B3 (Bolsa brasileira)
- CEPEA/ESALQ
- APIs publicas de cotacoes

---

### Funcionalidade 10: Gerador de Minuta

**Descricao:** Gera minutas e templates de documentos relacionados a CPR prontos para uso.

**Tipos de minutas disponiveis:**

- Minuta de CPR Fisica
- Minuta de CPR Financeira
- Termo de Penhor Agricola
- Contrato de Aval
- Termo de Vistoria de Lavoura
- Notificacao de Vencimento

**UI do gerador:**

```
+--------------------------------------------------+
|  GERADOR DE MINUTAS                              |
+--------------------------------------------------+
|                                                  |
|  Selecione o tipo de documento:                  |
|                                                  |
|  [x] Minuta de CPR Fisica                        |
|  [ ] Minuta de CPR Financeira                    |
|  [ ] Termo de Penhor Agricola                    |
|  [ ] Contrato de Aval                            |
|  [ ] Termo de Vistoria                           |
|  [ ] Notificacao de Vencimento                   |
|                                                  |
|  ============================================    |
|                                                  |
|  Opcoes de personalizacao:                       |
|                                                  |
|  [x] Incluir clausula de vencimento antecipado   |
|  [x] Incluir clausula de correcao monetaria      |
|  [ ] Incluir clausula de seguro agricola         |
|  [x] Incluir espaco para reconhecimento firma    |
|                                                  |
|  Produto principal: [Soja_______________] v      |
|                                                  |
+--------------------------------------------------+
|  [Gerar Minuta]  [Visualizar Modelo]             |
+--------------------------------------------------+
```

**Output gerado:**

```
+--------------------------------------------------+
|  MINUTA GERADA                                   |
+--------------------------------------------------+
|                                                  |
|  CEDULA DE PRODUTO RURAL - FISICA                |
|  ________________________________________        |
|                                                  |
|  [Nome do Emitente], inscrito no CNPJ sob o      |
|  no [______________], com sede em [__________],  |
|  neste ato representado por [________________],  |
|  doravante denominado EMITENTE, promete entregar |
|  ao [Nome do Credor], inscrito no CNPJ sob o     |
|  no [______________], doravante denominado       |
|  CREDOR, a quantidade de [____] sacas de 60kg    |
|  de [SOJA], safra [____/____], com as seguintes  |
|  caracteristicas: [________________________]     |
|                                                  |
|  ...                                             |
|                                                  |
+--------------------------------------------------+
|  [Baixar Word]  [Baixar PDF]  [Editar Online]    |
+--------------------------------------------------+
```

**Implementacao tecnica:**

- Templates pre-definidos em Markdown/HTML
- Substituicao de variaveis dinamicas
- Geracao de Word via docx library
- Geracao de PDF via html-pdf ou puppeteer
- Clausulas modulares (adiciona/remove conforme opcoes)

**Beneficios:**

- Padronizacao de documentos
- Reducao de erros em clausulas
- Agilidade na emissao de CPRs
- Conformidade legal garantida

---

### Resumo: O que Cada Funcionalidade Impressiona

| Funcionalidade        | O que Impressiona               | Valor para o Cliente        |
| --------------------- | ------------------------------- | --------------------------- |
| Tirar Duvidas         | "Sabe tudo sobre CPR"           | Economiza tempo de pesquisa |
| Analisar/Corrigir CPR | "Encontrou erros que eu nao vi" | Evita problemas juridicos   |
| Resumir CPR           | "Em 5 segundos entendi a CPR"   | Agilidade na analise        |
| Criar CPR             | "Documento pronto em 2 minutos" | Produtividade               |
| Simular CPR           | "Ja sei quanto vou receber"     | Tomada de decisao           |
| Extrator              | "Nao preciso digitar nada"      | Elimina trabalho manual     |
| Compliance            | "Garantia de que esta legal"    | Seguranca juridica          |
| Risco                 | "Sei exatamente o risco"        | Decisao informada           |
| Cotacoes              | "Contexto de mercado na hora"   | Inteligencia de mercado     |
| Gerador Minuta        | "Template pronto e padronizado" | Padronizacao e agilidade    |

---

## Parte 7: Cronograma de Implementacao

### Semana 1: Infraestrutura Base

| Dia | Tarefa                           |
| --- | -------------------------------- |
| 1-2 | Setup Supabase (Auth + DB + RLS) |
| 2-3 | Setup Cloudflare R2 + integracao |
| 3-4 | Setup Dialogflow ES (FAQ)        |
| 4-5 | Setup Dialogflow CX + Data Store |

### Semana 2: Integracoes

| Dia | Tarefa                               |
| --- | ------------------------------------ |
| 1-2 | Vertex AI Search (indexacao)         |
| 2-3 | Roteador ES/CX no backend            |
| 3-4 | Upload de documentos -> R2 -> Vertex |
| 4-5 | Testes de integracao                 |

### Semana 3: Seguranca & Polish

| Dia | Tarefa                     |
| --- | -------------------------- |
| 1-2 | Implementar RLS completo   |
| 2-3 | Rate limiting + audit logs |
| 3-4 | Testes de seguranca        |
| 4-5 | UI/UX polish               |

### Semana 4: Soft Launch

| Dia | Tarefa                         |
| --- | ------------------------------ |
| 1-2 | Onboarding de 5 empresas teste |
| 2-3 | Ajustes baseados em feedback   |
| 3-4 | Documentacao para usuarios     |
| 5   | **LAUNCH PILOTO**              |

---

## Parte 8: Metricas de Sucesso

### KPIs para Monitorar

| Metrica                     | Meta    | Como Medir              |
| --------------------------- | ------- | ----------------------- |
| **NPS**                     | > 40    | Survey no fim           |
| **Precisao das respostas**  | > 85%   | Feedback thumbs up/down |
| **Tempo de resposta**       | < 3s    | Logs                    |
| **Uptime**                  | > 99.5% | Monitoring              |
| **Usuarios ativos diarios** | > 60%   | Analytics               |
| **Queries/usuario/dia**     | > 10    | Logs                    |
| **Taxa de conversao**       | > 30%   | Contratos assinados     |

### Dashboard de Metricas (Exemplo)

```
+-------------------------------------------------------------+
|                    DASHBOARD DO PILOTO                       |
+-------------------------------------------------------------+
|  Empresas Ativas: 58/60    Usuarios Ativos: 142/150         |
|                                                              |
|  Uso Hoje                     Satisfacao                     |
|  - Queries: 2,340            - Positivo: 89%                |
|  - Documentos: 15 novos      - Negativo: 11%                |
|  - Sessions: 98              - NPS: 47                      |
|                                                              |
|  Creditos Restantes                                          |
|  - Dialogflow CX: $412 / $600                               |
|  - Vertex Search: $945 / $1000                              |
|  - GCP Trial: $285 / $300                                   |
+-------------------------------------------------------------+
```

---

## Parte 9: Resumo Financeiro

### Custo Total do Piloto (1 mes)

| Item                 | Custo     | Fonte         |
| -------------------- | --------- | ------------- |
| **Dialogflow CX**    | ~$200     | Credito $600  |
| **Vertex AI Search** | ~$80      | Credito $1000 |
| **Gemini API**       | ~$15      | Credito $300  |
| **Supabase Pro**     | $25       | Cartao        |
| **Cloudflare R2**    | ~$3       | Cartao        |
| **Vercel Pro**       | $20       | Cartao        |
| **Upstash Redis**    | $0        | Free tier     |
| **TOTAL**            | **~$343** | -             |

### Breakdown

- **Creditos usados:** ~$295
- **Custo real (cartao):** ~$48/mes
- **Creditos restantes:** ~$2,605

### ROI Potencial

- Se converter **30%** das empresas (18)
- Ticket medio: R$ 500/mes
- **Receita potencial:** R$ 9.000/mes
- **ROI do piloto:** ~18.000%

---

## Parte 10: Checklist Pre-Launch

### Infraestrutura

- [ ] Supabase Pro ativado
- [ ] RLS configurado em todas as tabelas
- [ ] Cloudflare R2 configurado
- [ ] Vercel Pro ativado
- [ ] Dominio custom configurado

### Google Cloud

- [ ] Dialogflow ES agent criado (FAQ)
- [ ] Dialogflow CX agent criado (RAG)
- [ ] Data Store conectado ao Vertex Search
- [ ] Documentos de teste indexados
- [ ] Billing alerts configurados

### Seguranca

- [ ] MFA disponivel para usuarios
- [ ] Rate limiting implementado
- [ ] Audit logs ativos
- [ ] Politica de privacidade publicada
- [ ] Termos de uso publicados

### Qualidade

- [ ] Teste de respostas com 50+ queries
- [ ] Teste de carga (150 usuarios simultaneos)
- [ ] Teste de seguranca basico
- [ ] Mobile responsiveness testado

### Onboarding

- [ ] Email de boas-vindas preparado
- [ ] Guia rapido de uso criado
- [ ] FAQ documentado
- [ ] Canal de suporte definido

---

## Parte 11: Roteador ES/CX (Implementacao)

### Logica de Roteamento

```typescript
// lib/dialogflow-router.ts

interface RouterConfig {
  cxKeywords: string[]
  esAgent: string
  cxAgent: string
}

const config: RouterConfig = {
  cxKeywords: [
    'cpr',
    'documento',
    'contrato',
    'garantia',
    'analise',
    'compare',
    'resuma',
    'valor',
    'vencimento',
    'safra',
    'penhor',
    'aval',
    'cedente',
    'credor',
    'devedor'
  ],
  esAgent: process.env.DIALOGFLOW_ES_AGENT_ID!,
  cxAgent: process.env.DIALOGFLOW_CX_AGENT_ID!
}

export function shouldUseCX(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return config.cxKeywords.some((keyword) => lowerMessage.includes(keyword))
}

export async function routeMessage(message: string, sessionId: string) {
  if (shouldUseCX(message)) {
    return await callDialogflowCX(message, sessionId)
  } else {
    return await callDialogflowES(message, sessionId)
  }
}

// Alternativa: ES primeiro, fallback para CX
export async function smartRoute(message: string, sessionId: string) {
  // Primeiro tenta ES (gratis)
  const esResponse = await callDialogflowES(message, sessionId)

  // Se ES nao souber responder (fallback intent)
  if (esResponse.intent === 'Default Fallback Intent') {
    // Escala para CX (pago, mas com RAG)
    return await callDialogflowCX(message, sessionId)
  }

  return esResponse
}
```

### API Route para Chat

```typescript
// app/api/chat/route.ts

import { routeMessage } from '@/lib/dialogflow-router'
import { checkRateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()

  // Verificar autenticacao
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting
  const rateLimit = await checkRateLimit(user.id)
  if (!rateLimit.success) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimit.headers }
    )
  }

  const { message, sessionId } = await request.json()

  try {
    // Rotear para ES ou CX
    const response = await routeMessage(message, sessionId)

    // Logar para auditoria
    await supabase.from('chat_logs').insert({
      user_id: user.id,
      session_id: sessionId,
      message,
      response: response.text,
      agent_type: response.agentType, // 'ES' ou 'CX'
      created_at: new Date().toISOString()
    })

    return Response.json(response)
  } catch (error) {
    console.error('Chat error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Parte 12: Configuracao dos Servicos

### Variaveis de Ambiente Necessarias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=xxx
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Dialogflow ES
DIALOGFLOW_ES_AGENT_ID=xxx
DIALOGFLOW_ES_LOCATION=global

# Dialogflow CX
DIALOGFLOW_CX_AGENT_ID=xxx
DIALOGFLOW_CX_LOCATION=us-central1

# Vertex AI Search
VERTEX_SEARCH_DATA_STORE_ID=xxx
VERTEX_SEARCH_LOCATION=global

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=verity-documents

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=xxx
UPSTASH_REDIS_REST_TOKEN=xxx
```

---

## Fontes e Referencias

### Documentacao Oficial

- [Supabase SOC 2 Compliance](https://supabase.com/docs/guides/security/soc-2-compliance)
- [Supabase HIPAA](https://supabase.com/blog/supabase-soc2-hipaa)
- [Vertex AI Security](https://docs.cloud.google.com/generative-ai-app-builder/docs/compliance-security-controls)
- [Dialogflow Security Settings](https://cloud.google.com/dialogflow/cx/docs/concept/security-settings)
- [Dialogflow Pricing](https://cloud.google.com/dialogflow/pricing)
- [Vertex AI Search Pricing](https://cloud.google.com/generative-ai-app-builder/pricing)

### Guias de Seguranca

- [B2B SaaS Enterprise Readiness](https://www.descope.com/blog/post/b2b-saas-enterprise-readiness)
- [SOC 2 Compliance for SaaS](https://secureleap.tech/blog/soc-2-compliance-checklist-saas)
- [SaaS Security Best Practices 2025](https://www.reco.ai/learn/saas-security-best-practices)

---

## Contato e Suporte

Para duvidas sobre este plano, entre em contato com a equipe de desenvolvimento.

---

_Documento gerado em: Dezembro 2024_
_Versao: 1.0_
