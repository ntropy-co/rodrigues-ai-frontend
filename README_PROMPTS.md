# 🤖 Guia Rápido de Prompts - Gemini 3 Pro & Claude Opus 4.5

**Leitura rápida:** 2 min
**Início completo:** 5 min

---

## 🎯 Você Está Aqui

Tem estes arquivos de prompts prontos para usar:

```
rodrigues-ai-frontend/
├── PROMPTS_INDEX.md ← COMECE AQUI (índice master)
├── PROMPTS_GEMINI_CLAUDE.md (análise de modelos)
├── PROMPTS_SPRINT1_DETALHADO.md (P1 - críticas)
├── PROMPTS_SPRINT2_DETALHADO.md (P2 - altos)
├── PROMPTS_SPRINT3_E_EXTRAS.md (P3 - médios)
├── PROMPTS_SPRINT4_DETALHADO.md (pendências / complementos)
└── README_PROMPTS.md (este arquivo)
```

---

## ⚡ Início em 3 Passos

### 1️⃣ Escolha uma Issue
Abra `PROMPTS_INDEX.md` e procure seu número (ex: #136)

### 2️⃣ Escolha o Modelo
- **Claude Opus 4.5** = Arquitetura, análise, docs
- **Gemini 3 Pro** = React components, UI, rápido

### 3️⃣ Copie & Cole
1. Abra o arquivo correspondente
2. Procure a issue
3. Copie o prompt PROMPT
4. Cole em claude.ai ou Gemini
5. Pronto! ✅

---

## 📊 Distribuição Rápida

### Claude Opus 4.5 (18h total)
```
Sprint 1: #161 (3h), #200 (2h)
Sprint 2: #202 (3h), #201 (2.5h), #134 (1h)
Sprint 3: #195 (2h), #203 (2.5h), #162 (3h)
```

### Gemini 3 Pro (20.5h total)
```
Sprint 1: #144 (1.5h), #136 (2h), #131 (1.5h), #112-114 (3h)
Sprint 2: #145 (1.5h), #125 (1.5h), #119 (2h)
Sprint 3: #148-149 (2h), #196 (2h), #194 (1.5h)
```

---

## 🚀 Ordem Recomendada

### Dia 1-2: Sprint 1 (Crítico)
**Claude:** `#161` (Infra/CI-CD)
**Gemini:** `#136` (TemplateGenerator)

### Dia 3-4: Sprint 1 (Continuação)
**Claude:** `#200` (Security)
**Gemini:** `#131` (Charts), `#144` (Monitoring)

### Dia 5-7: Sprint 2
**Claude:** `#202` (Performance)
**Gemini:** `#125` (History), `#119` (Simulator)

### Dia 8-10: Sprint 3 + Extras
**Claude:** `#195` (Citations), `#203` (Docs)
**Gemini:** `#196` (Input Bar), `#194` (Diff)

---

## 📖 Documentação dos Prompts

| Arquivo | Issues | Uso | Tempo |
|---------|--------|-----|-------|
| PROMPTS_GEMINI_CLAUDE.md | Exemplos (#136, #200, #202, #203) | Aprender | 10 min |
| PROMPTS_SPRINT1_DETALHADO.md | #161, #144 | P1-HIGH | ~5 min (copiar/usar) |
| PROMPTS_SPRINT2_DETALHADO.md | #202, #201, #136 | P2-MEDIUM | ~5 min (copiar/usar) |
| PROMPTS_SPRINT3_E_EXTRAS.md | #203, #196, #195, #194, #162 | P2-P3 | ~5 min (copiar/usar) |
| PROMPTS_SPRINT4_DETALHADO.md | #131, #112-114, #145, #125, #119, #134, #148-149 | Complementos | ~5 min (copiar/usar) |
| PROMPTS_INDEX.md | Todas (tabela) | Referência | 5 min |

---

## 💡 Dicas Importantes

### ✅ Faça Assim
```
1. Leia o prompt completo antes
2. Adapte variáveis de seu contexto
3. Peça exemplos
4. Revise código antes de usar
5. Teste em branch
```

### ❌ Não Faça
```
✗ Apenas copiar/colar sem revisar
✗ Usar direto em produção
✗ Ignorar warnings do modelo
✗ Não testar antes
```

---

## 🔧 Setup Antes de Começar

### Variáveis Necessárias
```bash
# .env.local
NEXT_PUBLIC_API_URL=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
# ... outras
```

### Dependências Comuns
```bash
npm install @next/bundle-analyzer    # Performance
npm install vitest @testing-library/react  # Testes
npm install @upstash/ratelimit      # Rate limiting
npm install pino pino-pretty         # Logging
```

---

## 📋 Checklist de Implementação

- [ ] Leia PROMPTS_INDEX.md
- [ ] Escolha primeira issue (#136 recomendado)
- [ ] Copie prompt de PROMPTS_SPRINT1_DETALHADO.md
- [ ] Cole em claude.ai ou gemini.google.com
- [ ] Revise código gerado
- [ ] Adapte ao seu projeto
- [ ] Crie branch: `feat/issue-136`
- [ ] Implementar mudanças
- [ ] Teste localmente
- [ ] Commit & Push
- [ ] Abra PR para revisão
- [ ] Merge após aprovação
- [ ] Próxima issue!

---

## 🎓 Exemplos de Uso

### Exemplo 1: Componente React
```
1. Abra PROMPTS_SPRINT1_DETALHADO.md
2. Procure "ISSUE #136 - TemplateGenerator"
3. Copie o prompt
4. Cole em Gemini 3 Pro
5. Gera componente React completo
6. Integre em seu projeto
```

### Exemplo 2: Security Audit
```
1. Abra PROMPTS_SPRINT1_DETALHADO.md
2. Procure "ISSUE #200 - Security Audit"
3. Copie o prompt
4. Cole em Claude Opus 4.5
5. Recebe análise de segurança
6. Implemente correções
```

---

## 🤝 Suporte

Dúvidas? Verifique:

1. **Qual arquivo?** → PROMPTS_INDEX.md tem índice
2. **Qual modelo?** → PROMPTS_GEMINI_CLAUDE.md tem análise
3. **Como usar?** → Este arquivo (README_PROMPTS.md)
4. **Detalhes?** → PROMPTS_SPRINT[1-3]_*.md

---

## 🎉 Próximos Passos

1. ✅ Leia este arquivo (você está aqui)
2. ⏭️ Abra `PROMPTS_INDEX.md`
3. ⏭️ Escolha primeira issue
4. ⏭️ Abra arquivo correspondente
5. ⏭️ Copie prompt
6. ⏭️ Comece a implementar!

---

**Tempo total estimado:** ~38.5 horas
**Issues:** 23+
**Modelos:** 2 (Gemini 3 Pro + Claude Opus 4.5)

Pronto para começar? 🚀
