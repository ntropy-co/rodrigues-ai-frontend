# Problema: Frontend não funciona localmente

## 🔍 Problemas Identificados

### 1. **Dependências não instaladas** ⚠️ CRÍTICO
- **Sintoma**: `'next' não é reconhecido como um comando interno ou externo`
- **Causa**: O diretório `node_modules` não existe no projeto
- **Solução**: Instalar dependências com `npm install`

### 2. **Configuração Turbopack problemática** ✅ CORRIGIDO
- **Sintoma**: Possível problema com caminhos UNC/WSL
- **Causa**: Configuração `turbopack.root: __dirname` pode causar problemas em caminhos WSL
- **Solução**: Removida a configuração `turbopack.root` (Turbopack detecta automaticamente o root)
- **Status**: ✅ Corrigido em `next.config.ts`

### 3. **Caminhos WSL/UNC** ⚠️ ATENÇÃO
- **Sintoma**: Comandos PowerShell podem ter problemas ao acessar caminhos WSL
- **Causa**: Windows pode não suportar bem caminhos UNC do WSL
- **Recomendação**: Executar comandos dentro do WSL (Ubuntu) ou mapear o caminho para uma letra de drive

---

## 🛠️ Soluções

### Solução 1: Instalar dependências dentro do WSL (RECOMENDADO)

**Opção A: Executar dentro do WSL Ubuntu**
```bash
# No terminal WSL Ubuntu (não PowerShell)
cd ~/projects/verity-agro/rodrigues-ai-frontend
npm install
npm run dev
```

**Opção B: Executar via PowerShell com caminho WSL**
```powershell
# No PowerShell, executar dentro do WSL
wsl -d Ubuntu-24.04 -e bash -c "cd ~/projects/verity-agro/rodrigues-ai-frontend && npm install && npm run dev"
```

### Solução 2: Mapear caminho WSL para drive Windows

Se preferir trabalhar no PowerShell do Windows:

1. **Mapear caminho WSL para drive:**
   ```powershell
   # No PowerShell como Administrador
   net use Z: \\wsl.localhost\Ubuntu-24.04\home\joaomarcelo\projects\verity-agro\rodrigues-ai-frontend
   ```

2. **Instalar dependências:**
   ```powershell
   cd Z:
   npm install
   npm run dev
   ```

### Solução 3: Instalar Node.js dentro do WSL (se necessário)

Se o Node.js não estiver instalado no WSL:

```bash
# No terminal WSL Ubuntu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verificar instalação
npm --version   # Verificar instalação
```

---

## ✅ Checklist de Correções

- [x] Configuração `turbopack.root` removida do `next.config.ts`
- [ ] Dependências instaladas (`npm install`)
- [ ] Verificar se Node.js está instalado no WSL
- [ ] Testar execução do projeto (`npm run dev`)

---

## 🧪 Testar após instalar dependências

Após instalar as dependências, testar:

```bash
# Dentro do WSL Ubuntu
cd ~/projects/verity-agro/rodrigues-ai-frontend

# Verificar instalação
npm list next

# Testar build (opcional)
npm run build

# Executar em desenvolvimento
npm run dev
```

---

## 📝 Notas Importantes

1. **WSL vs Windows**: Para projetos Next.js em WSL, é recomendado executar comandos dentro do ambiente WSL, não via PowerShell do Windows acessando caminhos UNC.

2. **Turbopack**: A configuração `turbopack.root` foi removida porque:
   - O Turbopack detecta automaticamente o root do projeto
   - Usar `__dirname` pode causar problemas com caminhos UNC/WSL
   - Não é necessária na maioria dos casos

3. **Node.js**: Certifique-se de que o Node.js está instalado **dentro do WSL**, não apenas no Windows. Verifique com:
   ```bash
   which node  # Deve apontar para /usr/bin/node ou similar dentro do WSL
   ```

---

## 🚀 Próximos Passos

1. **Instalar dependências** dentro do WSL
2. **Verificar instalação** do Node.js no WSL
3. **Executar o projeto** e verificar se inicia corretamente
4. **Testar funcionalidades** básicas (login, navegação, etc.)

---

**Última atualização**: 2026-01-11
**Status**: ⚠️ Aguardando instalação de dependências
