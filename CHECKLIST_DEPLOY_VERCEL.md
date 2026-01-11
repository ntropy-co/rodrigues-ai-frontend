# Checklist de Deploy - Vercel

## ✅ Verificações de Código

### 1. Lint e TypeScript
- [x] **Lint**: Sem erros (`npm run lint`)
- [ ] **TypeScript**: Verificar se compila sem erros (`npm run typecheck`)
- [ ] **Build**: Testar build local (`npm run build`)

### 2. Correções Aplicadas
- [x] Todos os hooks corrigidos (12/12)
- [x] `token` substituído por `isAuthenticated`
- [x] `fetchWithRefresh` implementado corretamente
- [x] Headers `Authorization` removidos dos hooks

---

## 🔧 Variáveis de Ambiente Necessárias

### Obrigatórias (NEXT_PUBLIC_*)
```bash
NEXT_PUBLIC_API_URL=https://rodrigues-ai-backend-production.up.railway.app
# ou
NEXT_PUBLIC_API_URL=https://api.rodriguesagro.com.br
```

### Opcionais (NEXT_PUBLIC_*)
```bash
NEXT_PUBLIC_AGENT_NAME=Verity Agro
NEXT_PUBLIC_SHOW_PRO_BUTTON=true
NEXT_PUBLIC_SHOW_UPLOAD_BUTTON=true
NEXT_PUBLIC_SHOW_TOOLS_BUTTON=true
```

### Backend/Server (NÃO NEXT_PUBLIC_*)
```bash
# Rate Limiting (Opcional - se não configurado, rate limit é desabilitado)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Sentry (Opcional - para monitoramento de erros)
SENTRY_ORG=...
SENTRY_PROJECT=...
SENTRY_AUTH_TOKEN=...
```

---

## 📋 Configuração da Vercel

### 1. Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (ou deixar padrão)
- **Output Directory**: `.next` (padrão do Next.js)
- **Install Command**: `npm install` (ou `npm ci` para builds mais rápidos)

### 2. Environment Variables
Configurar na Vercel Dashboard:
- Settings → Environment Variables

**IMPORTANTE**: 
- Variáveis `NEXT_PUBLIC_*` são expostas ao cliente
- Variáveis sem `NEXT_PUBLIC_*` são apenas no servidor
- Configurar para Production, Preview e Development

### 3. Node.js Version
- Verificar versão no `package.json` (engines)
- Vercel usa Node.js 18.x por padrão (compatível com Next.js 15)

---

## ⚠️ Problemas Comuns e Soluções

### 1. Build Fails
**Possíveis causas**:
- Erros de TypeScript
- Dependências faltando
- Variáveis de ambiente não configuradas

**Solução**:
```bash
# Testar build localmente
npm run build
```

### 2. Runtime Errors
**Possíveis causas**:
- Variáveis `NEXT_PUBLIC_*` não configuradas
- API URL incorreta
- CORS issues

**Solução**:
- Verificar variáveis de ambiente na Vercel
- Verificar logs de erro no dashboard da Vercel

### 3. Rate Limiting Não Funciona
**Causa**: `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` não configurados

**Solução**: 
- Configurar variáveis na Vercel OU
- Deixar sem configurar (rate limit será desabilitado, mas app funciona)

### 4. Sentry Errors
**Causa**: Variáveis do Sentry não configuradas

**Solução**: 
- Configurar `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` OU
- Remover configuração do Sentry do `next.config.ts` se não usar

---

## 🚀 Passos para Deploy

### 1. Preparação
```bash
# Verificar se tudo está commitado
git status

# Verificar build local
npm run build

# Verificar lint
npm run lint
```

### 2. Deploy na Vercel

**Opção A: Via Dashboard**
1. Conectar repositório GitHub/GitLab
2. Configurar variáveis de ambiente
3. Deploy automático

**Opção B: Via CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 3. Pós-Deploy
- [ ] Verificar se o site está acessível
- [ ] Testar login/logout
- [ ] Verificar requisições de API
- [ ] Verificar logs de erro na Vercel
- [ ] Testar funcionalidades principais

---

## 📊 Checklist Final

### Antes do Deploy
- [ ] Build local funciona (`npm run build`)
- [ ] Lint passa (`npm run lint`)
- [ ] TypeScript compila (`npm run typecheck`)
- [ ] Variáveis de ambiente documentadas
- [ ] `.env.example` atualizado (se houver)

### Durante o Deploy
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Build settings corretos
- [ ] Domínio configurado (se necessário)

### Após o Deploy
- [ ] Site acessível
- [ ] Login funciona
- [ ] API requests funcionam
- [ ] Sem erros no console do navegador
- [ ] Logs da Vercel sem erros críticos

---

## 🔍 Verificações Adicionais

### Performance
- [ ] Lighthouse score > 70
- [ ] Bundle size razoável
- [ ] Imagens otimizadas

### Segurança
- [ ] HTTPS habilitado (automático na Vercel)
- [ ] Headers de segurança configurados (já no `next.config.ts`)
- [ ] Variáveis sensíveis não expostas

### Funcionalidades
- [ ] Autenticação funciona
- [ ] Requisições de API funcionam
- [ ] PWA funciona (se habilitado)
- [ ] Rate limiting funciona (se configurado)

---

## 📝 Notas Importantes

1. **Cookies HttpOnly**: O sistema usa cookies HttpOnly para autenticação, então não há token no JavaScript. Isso está correto e seguro.

2. **Rate Limiting**: Se `UPSTASH_REDIS_REST_URL` não estiver configurado, o rate limiting será desabilitado, mas a aplicação funcionará normalmente.

3. **Sentry**: Se não usar Sentry, pode remover a configuração do `next.config.ts` ou deixar as variáveis vazias (não causará erro).

4. **PWA**: O PWA está desabilitado em desenvolvimento e habilitado em produção automaticamente.

5. **CSP**: O Content Security Policy está configurado no `next.config.ts`. Verificar se todas as URLs necessárias estão permitidas.

---

**Última atualização**: 2024-12-19

