# 🧪 Roteiro de Teste: Observability & Web Vitals

**Componente**: `src/components/v2/Monitoring/WebVitalsReporter.tsx`
**Contexto**: Monitoramento de performance e erros (Sentry/PostHog).

---

## 1. Core Web Vitals

### Cenário 1.1: Disparo de Métricas
- [ ] **Ação**: Carregar a aplicação e navegar por 2 ou 3 páginas. Abrir o Console do DevTools.
- [ ] **Resultado Esperado**:
    - Verificar logs (se `debug: true`) de métricas LCP, CLS, FID.
    - Verificar na aba "Network" se há disparos para o endpoint do PostHog ou Vercel Analytics.

---

## 2. Error Tracking (Sentry)

### Cenário 2.1: Erro Controlado
- [ ] **Ação**: (Apenas em ambiente DEV/Homolog) Forçar um erro no console ou usar um botão de "Test Error" se disponível.
- [ ] **Resultado Esperado**:
    - O erro deve ser capturado pelo Sentry (verificar aba Network -> chamada para ingest.sentry.io).
    - O usuário deve ver uma Boundary de Erro elegante, não a tela branca da morte.
