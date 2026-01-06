# 🎯 MVP Scope - Verity Agro

**Data:** 2026-01-06
**Estratégia:** Chat-First MVP

---

## 📦 Escopo MVP

O MVP do Verity Agro é focado em uma **interface de chat única** que centraliza todas as funcionalidades de CPR. Páginas dedicadas e ferramentas avançadas ficam para versões futuras.

### Funcionalidades Core (MVP)

| Funcionalidade | Interface | Status Frontend | Dependência Backend |
|----------------|-----------|-----------------|---------------------|
| **Tirar Dúvidas sobre CPR** | Chat | ✅ Pronto | RAG/Dialogflow |
| **Criar CPR** | Chat (via prompt) | ✅ UI Pronta | Intent routing |
| **Analisar CPR** | Chat + Upload | ✅ UI Pronta | Gemini Vision |
| **Compliance CPR** | Chat | ✅ UI Pronta | Regras Lei 8.929/94 |

### Funcionalidades Desabilitadas (MVP)

| Funcionalidade | Motivo | Feature Flag |
|----------------|--------|--------------|
| Tools Dropdown | Foco no chat | `TOOLS_DROPDOWN: false` |
| Páginas CPR dedicadas | Chat-first | Rotas existem mas não são promovidas |
| Gráficos de Cotação | Nice-to-have | Dados existem, visual futuro |
| Diff Viewer | Não é core | Não implementado |

---

## 🔗 Dependências de Backend

Para o MVP funcionar end-to-end, o backend precisa:

1. **Roteamento de Intents**: O endpoint `/api/chat` deve identificar e rotear intents como "criar CPR", "analisar documento", "verificar compliance".

2. **Processamento de Documentos**: Integração com Gemini Vision ou Document AI para extrair texto de PDFs/imagens uploadadas.

3. **Base de Conhecimento**: RAG com documentação sobre Lei 8.929/94 e práticas de CPR.

---

## ✅ Checklist de Launch

- [x] Frontend Chat funcional
- [x] Upload de documentos
- [x] Autenticação completa
- [x] Feature flags configuradas
- [ ] Backend processando intents de CPR
- [ ] Teste end-to-end com usuário piloto

---

## 📝 Notas

- O chat é a **única interface** do MVP. Usuários interagem exclusivamente via prompts.
- Funcionalidades como "Criar CPR" são acionadas por linguagem natural (ex: "Quero criar uma CPR física").
- O backend é responsável por interpretar a intenção e retornar a resposta estruturada.

---

**Documento gerado em:** 2026-01-06
