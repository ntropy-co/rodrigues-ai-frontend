# 🚀 Configuração de Variáveis de Ambiente - Vercel

## 📋 Variáveis Necessárias

Configure estas variáveis no Vercel Dashboard para o projeto `rodrigues-ai-frontend`.

### 1. Acessar Configurações da Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `rodrigues-ai-frontend`
3. Vá em **Settings** → **Environment Variables**

---

## ⚙️ Variáveis de Produção

### API Backend URL

```bash
# Nome da variável
NEXT_PUBLIC_API_URL

# Valor
https://rodrigues-ai-backend-production.up.railway.app

# Environments
✅ Production
✅ Preview
✅ Development
```

**Importante:** Esta variável **DEVE** começar com `NEXT_PUBLIC_` para ser acessível no client-side.

---

### Application URL (Opcional)

```bash
# Nome da variável
NEXT_PUBLIC_APP_URL

# Valor (Vercel preenche automaticamente)
https://ai.rodriguesagro.com.br

# Environments
✅ Production
```

---

## 🔧 Build Configuration (Opcional)

Se houver erros de TypeScript/ESLint durante build:

```bash
# Ignorar erros de ESLint
ESLINT_IGNORE_DURING_BUILD=true

# Ignorar erros de TypeScript
TYPESCRIPT_IGNORE_BUILD_ERRORS=true
```

**⚠️ Use com cautela!** Idealmente, corrija os erros em vez de ignorá-los.

---

## 📝 Verificação

Após configurar, faça um novo deploy e verifique:

```bash
# 1. Acesse a URL de produção
https://ai.rodriguesagro.com.br

# 2. Abra DevTools Console e verifique
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
# Deve mostrar: https://rodrigues-ai-backend-production.up.railway.app

# 3. Teste uma requisição
# Abra Network tab e envie uma mensagem no chat
# Verifique se as requisições vão para:
# https://rodrigues-ai-backend-production.up.railway.app/api/v1/playground/...
```

---

## 🏠 Desenvolvimento Local

Para desenvolvimento local, use `.env.local`:

```bash
# Criar arquivo .env.local (já ignorado pelo git)
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://rodrigues-ai-backend-production.up.railway.app
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

**OU** para usar backend local:

```bash
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

---

## 🔍 Troubleshooting

### Problema: Frontend não conecta ao backend

**Sintomas:**
- Erros de CORS
- Erros 404 nas chamadas API
- Console mostra URL incorreta

**Solução:**

1. **Verificar variável no Vercel:**
   - Settings → Environment Variables
   - Confirmar `NEXT_PUBLIC_API_URL` está configurada

2. **Forçar redeploy:**
   - Deployments → Latest → ... → Redeploy

3. **Verificar no build log:**
   ```
   Environment Variables
   ├─ NEXT_PUBLIC_API_URL
   └─ https://rodrigues-ai-backend-production.up.railway.app
   ```

### Problema: Variável não aparece no client

**Causa:** Variável sem prefixo `NEXT_PUBLIC_`

**Solução:** Sempre use `NEXT_PUBLIC_` para variáveis client-side

### Problema: Backend retorna 404/502

**Causa:** Railway backend está offline ou URL incorreta

**Solução:**

1. Verificar Railway backend:
   ```bash
   curl https://rodrigues-ai-backend-production.up.railway.app/api/v1/health/
   ```

2. Deve retornar:
   ```json
   {"status":"success","message":"Agent API is running"}
   ```

3. Se não funcionar, verificar Railway logs

---

## 📚 Referências

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Runtime Configuration](https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration)

---

## ✅ Checklist de Configuração

- [ ] `NEXT_PUBLIC_API_URL` configurada no Vercel
- [ ] Valor correto: `https://rodrigues-ai-backend-production.up.railway.app`
- [ ] Aplicada em todos os environments (Production, Preview, Development)
- [ ] Redeploy realizado após configuração
- [ ] Teste de conexão bem-sucedido
- [ ] `.env.local` criado para desenvolvimento local
- [ ] Backend Railway está online e respondendo

---

**Status Atual:**
- ✅ Backend URL: `https://rodrigues-ai-backend-production.up.railway.app`
- ✅ Frontend URL: `https://ai.rodriguesagro.com.br`
- ✅ Health Check: `/api/v1/health/`
