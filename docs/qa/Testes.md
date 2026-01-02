# Testes E2E - Rodrigues AI Frontend

## Status Atual (31 Dez 2025)

| Métrica             | Valor     |
| ------------------- | --------- |
| ✅ Passaram         | 123       |
| ❌ Falharam         | 46        |
| ⏭️ Skipped          | 1         |
| **Taxa de sucesso** | **72.8%** |

## Estrutura de Testes

```
e2e/
├── fixtures/
│   ├── auth.fixture.ts      # Login helpers
│   └── test-data.ts         # Dados de teste
├── auth/
│   ├── login.spec.ts        # ✅ 7/8 passando
│   └── authenticated.spec.ts # ✅ 5/7 passando
├── chat/
│   └── chat-session.spec.ts # ✅ 35/41 passando
├── cpr/
│   ├── analise.spec.ts      # ✅ 10/12 passando
│   └── criar.spec.ts        # ⚠️ 17/24 passando
├── documents/
│   └── documents.spec.ts    # ✅ 36/38 passando
└── settings/
    └── profile.spec.ts      # ⚠️ 18/38 passando
```

## Comandos

```bash
# Executar todos os testes
npm run test:e2e

# Executar apenas um arquivo
npm run test:e2e -- e2e/auth/login.spec.ts

# Executar com UI interativa
npm run test:e2e -- --ui

# Ver relatório HTML
npx playwright show-report
```

## Problemas Conhecidos

### 1. Race Conditions com Credenciais Compartilhadas

Os testes usam as mesmas credenciais (`teste@teste.com`), causando conflitos de sessão quando rodam em paralelo.

**Solução atual:** Limitamos workers a 2 no `playwright.config.ts`

**Solução ideal:** Criar usuários de teste isolados por worker

### 2. Seletores de Avatar/Menu

O avatar do usuário mostra a inicial do nome (ex: "U" para "Usuário"). Os seletores devem usar:

```typescript
// ✅ Correto
const userAvatar = page.getByRole('button', { name: /^[A-Z]$/ })

// ❌ Incorreto
const userAvatar = page.locator('[data-testid="user-avatar"]')
```

### 3. Redirect Após Login

O redirect padrão após login é `/chat`, não `/dashboard`:

```typescript
// ✅ Correto
await page.waitForURL(/\/chat/)

// ❌ Incorreto
await page.waitForURL(/\/dashboard/)
```

## Testes Falhando - Análise

### Settings/Profile (20 falhas)

- **Admin Actions on Team** - Dependem de dados mock de membros
- **Logout Functionality** - Seletores de menu precisam ajuste
- **Invite Actions** - Funcionalidade ainda não implementada completamente

### CPR Criar (7 falhas)

- **Document Generation** - Timeout esperando geração de PDF
- **Wizard Steps** - Alguns steps dependem de estado anterior

### Chat (6 falhas)

- **AI Response** - Dependem de resposta real da API de IA
- **Document Attachment** - Preview de arquivo precisa ajuste

## Próximos Passos

### Prioridade Alta

1. **Corrigir seletores nos testes de Settings**
   - Usar mesma abordagem do avatar (`getByRole` com regex)
   - Adicionar `data-testid` nos componentes críticos

2. **Isolar usuários de teste**

   ```typescript
   // e2e/fixtures/auth.fixture.ts
   const testUser = `test-${Date.now()}@teste.com`
   // Criar usuário via API antes do teste
   // Deletar após o teste
   ```

3. **Mock respostas de IA**
   ```typescript
   await page.route('**/api/chat/**', (route) => {
     route.fulfill({
       status: 200,
       body: JSON.stringify({ message: 'Resposta mockada' })
     })
   })
   ```

### Prioridade Média

4. **Adicionar retries para testes flaky**

   ```typescript
   // playwright.config.ts
   retries: 2, // Tentar 2x antes de falhar
   ```

5. **Implementar visual regression testing**
   ```bash
   npm install @playwright/test
   # Usar page.screenshot() para comparar
   ```

### Prioridade Baixa

6. **Configurar CI/CD**
   - GitHub Actions para rodar testes em cada PR
   - Relatório de cobertura automático

7. **Adicionar testes de performance**
   - Core Web Vitals
   - Tempo de carregamento das páginas

## Configuração do Ambiente

### Variáveis de Ambiente

```bash
# .env.test
TEST_USER_EMAIL=teste@teste.com
TEST_USER_PASSWORD=Teste123
NEXT_PUBLIC_API_URL=https://rodrigues-ai-backend-production.up.railway.app
```

### Backend

O backend deve estar rodando em produção (Railway) ou localmente:

```bash
# Verificar saúde do backend
curl https://rodrigues-ai-backend-production.up.railway.app/api/v1/health/
```

## Referências

- [Playwright Docs](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
