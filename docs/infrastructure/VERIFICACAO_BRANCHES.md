# Verificação de Branches - Frontend

## 📊 Status das Branches

### Branches Locais
- `docs/qa-report`
- `feat/design-system-hardening`
- `fix/deploy-sync-v3`
- `fix/final-deploy-fixes`
- `fix/force-deploy`
- `fix/nextjs15-app-router-compat`
- `fix/typescript-zod-v4-errors`
- `fix/verified-deploy-sync`
- `main`
- `master` ⭐ (branch atual)

### Branches Remotas (origin)
- `origin/master` ✅ (tem local: `master`)
- `origin/feature/p1-performance-optimizations` ⚠️ (NÃO tem local)

---

## ⚠️ Branch Remota Sem Correspondente Local

### `origin/feature/p1-performance-optimizations`
Esta branch existe no remote mas não tem uma branch local correspondente.

**Para criar a branch local e fazer checkout:**
```bash
git checkout -b feature/p1-performance-optimizations origin/feature/p1-performance-optimizations
```

**Ou apenas para rastrear sem fazer checkout:**
```bash
git branch --track feature/p1-performance-optimizations origin/feature/p1-performance-optimizations
```

---

## 📋 Resumo

- **Total de branches remotas**: 2
- **Branches remotas com correspondente local**: 1 (`master`)
- **Branches remotas sem correspondente local**: 1 (`feature/p1-performance-optimizations`)

---

## 🔍 Comandos Úteis

### Ver todas as branches (locais e remotas)
```bash
git branch -a
```

### Ver apenas branches remotas
```bash
git branch -r
```

### Ver apenas branches locais
```bash
git branch
```

### Criar branch local a partir de branch remota
```bash
git checkout -b <nome-local> origin/<nome-remota>
```

### Atualizar referências remotas
```bash
git fetch --all
```

---

**Última verificação**: 2024-12-19
