# 🔗 Guia de Integração Frontend-Backend - Verity Agro MVP

**Data:** 2026-01-06

Este documento confirma o alinhamento entre frontend e backend para o MVP.

---

## ✅ Status: ALINHADO

O contrato de API entre frontend e backend está **100% compatível**.

---

## 📡 Contrato de API: Chat

### Request (Frontend → Backend)

```typescript
// Frontend envia para: POST /api/chat (BFF)
// BFF encaminha para: POST ${BACKEND_URL}/api/v1/chat/

interface ChatRequest {
  message: string // Mensagem do usuário
  session_id: string | null // ID da sessão (null = criar nova)
}
```

### Response (Backend → Frontend)

```typescript
interface ChatResponse {
  text: string // Resposta do agente
  session_id: string // ID da sessão
  message_id: string // ID da mensagem (para feedback)
  sources?: string[] // Fontes usadas (documentos)
}
```

---

## 🧠 Roteamento de Intents (Backend)

O backend roteia automaticamente com base no conteúdo da mensagem:

| Keywords na Mensagem                       | Ação do Backend               |
| ------------------------------------------ | ----------------------------- |
| "analisar", "análise", "verificar" + "CPR" | Inicia workflow `analise_cpr` |
| "criar", "emitir", "fazer" + "CPR"         | Inicia workflow `criar_cpr`   |
| Outros                                     | Chat conversacional padrão    |

**Implicação:** O frontend não precisa implementar lógica de roteamento. Basta enviar a mensagem e o backend decide.

---

## 🔑 Variáveis de Ambiente

### Frontend (`.env`)

```bash
NEXT_PUBLIC_API_URL=https://api.verityagro.com  # Produção
# NEXT_PUBLIC_API_URL=http://localhost:8000     # Dev local
```

### Backend

```bash
CORS_ORIGINS=https://verityagro.com,https://app.verityagro.com
```

---

## 📄 Upload de Documentos

O upload de documentos já está integrado:

1. **Frontend:** `POST /api/documents/upload`
2. **Backend:** Armazena em GCS com `session_id`
3. **Chat:** Quando usuário pede análise, backend busca documentos da sessão automaticamente

---

## ✅ Checklist de Deploy MVP

- [x] Contrato de API alinhado
- [x] Variáveis de ambiente configuradas
- [x] Upload de documentos funcionando
- [x] Intent routing no backend
- [ ] Teste end-to-end (Login → Upload → "Analise esta CPR" → Resposta)

---

## 🚀 Próximos Passos

1. **Garantir backend online** com endpoint `/api/v1/chat/` acessível
2. **Testar fluxo completo** com usuário piloto
3. **Monitorar Langfuse** para traces de LLM

---

**Documento gerado em:** 2026-01-06
