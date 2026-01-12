# Sincronização da Branch Master

## 🔍 Status Atual

**Branches diferentes detectadas:**
- **Local master**: `a63f5e85029121e0c6165ee03a37b2edd6172ee5`
- **Remote origin/master**: `6164d8eaaebdc439ba697ef6d1e70f185b52fc09`

⚠️ **A branch local está diferente da remote!**

---

## ✅ Instruções para Sincronizar

Execute os seguintes comandos **dentro do terminal WSL Ubuntu** (não PowerShell):

```bash
# 1. Navegar para o diretório do projeto
cd ~/projects/verity-agro/rodrigues-ai-frontend

# 2. Garantir que está na branch master
git checkout master

# 3. Fazer fetch do remote para atualizar referências
git fetch origin

# 4. Verificar diferenças (opcional, para confirmar)
git log --oneline master..origin/master
git log --oneline origin/master..master

# 5. SOBRESCREVER a branch local com a do remote
git reset --hard origin/master

# 6. Verificar status final
git status
git log --oneline -5
```

---

## 🚨 Importante

- O comando `git reset --hard origin/master` vai **sobrescrever completamente** a branch local
- **Todas as alterações locais não commitadas serão perdidas**
- Se você tem alterações importantes na branch local, faça backup antes:
  ```bash
  git branch master-backup-$(date +%Y%m%d)
  ```

---

## 📋 Comandos Alternativos (Script)

Você também pode executar o script que foi criado:

```bash
cd ~/projects/verity-agro/rodrigues-ai-frontend
chmod +x sync-master.sh
./sync-master.sh
```

---

## ✅ Verificação Pós-Sincronização

Após executar os comandos, verifique:

```bash
# Deve mostrar que está atualizado
git status

# Deve mostrar o mesmo commit
git rev-parse master
git rev-parse origin/master
```

Ambos devem retornar: `6164d8eaaebdc439ba697ef6d1e70f185b52fc09`

---

**Última verificação**: 2024-12-19
**Status**: ⚠️ Aguardando sincronização manual
