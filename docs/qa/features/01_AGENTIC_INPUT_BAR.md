# 🧪 Roteiro de Teste: Agentic Input Bar

**Componente**: `src/components/v2/InputBar/InputBar.tsx`
**Contexto**: Barra de input principal do chat com suporte a comandos (`/`) e menções (`@`).

---

## 1. Slash Commands (`/`)

### Cenário 1.1: Autocomplete de Comandos

- [ ] **Ação**: Digite `/` no input vazio.
- [ ] **Resultado Esperado**:
  - Um menu flutuante deve aparecer _acima_ do input.
  - Lista deve conter: `GPT-4o`, `Claude 3.5 Sonnet`, `Canvas Mode`, `Reset Thread`.
  - O primeiro item deve estar destacado.

### Cenário 1.2: Filtragem de Comandos

- [ ] **Ação**: Digite `/g`.
- [ ] **Resultado Esperado**: A lista deve filtrar e mostrar apenas `GPT-4o` (ou outros que comecem com "g").
- [ ] **Ação**: Digite `/canvas`.
- [ ] **Resultado Esperado**: Apenas `Canvas Mode` deve aparecer.

### Cenário 1.3: Seleção via Teclado

- [ ] **Ação**: Digite `/`, use seta `↓` para selecionar o segundo item, tecle `Enter`.
- [ ] **Resultado Esperado**:
  - O menu fecha.
  - O comando é executado (ex: Toast aparece "Modelo alterado..." ou input limpa se for ação de sistema).
  - O input volta a ter foco.

---

## 2. Mentions (`@`)

### Cenário 2.1: Menção de Documentos

- [ ] **Ação**: Digite `Olá, gostaria de analisar o @`.
- [ ] **Resultado Esperado**:
  - Menu flutuante aparece na posição do cursor.
  - Lista de documentos "mockados" (ex: `Contrato Safra 2025.pdf`) aparece.

### Cenário 2.2: Inserção de Menção

- [ ] **Ação**: Selecione um documento da lista.
- [ ] **Resultado Esperado**:
  - O texto completa para: `Olá, gostaria de analisar o @Contrato Safra 2025.pdf `.
  - Menu fecha.

---

## 3. Upload & Drag-and-Drop (Regressão)

### Cenário 3.1: Drag-and-Drop Visual

- [ ] **Ação**: Arraste um arquivo qualquer sobre a área do input.
- [ ] **Resultado Esperado**:
  - A borda/fundo do input deve mudar de cor (feedback visual).
  - Camadas 3D podem se mover/reagir.

### Cenário 3.2: Anexar Arquivo

- [ ] **Ação**: Solte o arquivo.
- [ ] **Resultado Esperado**:
  - Ícone do arquivo aparece como "chip" flutuante acima do input.
  - Barra de progresso simulada deve encher e sumir.

---

## 4. Edge Cases

- [ ] **Esc**: Abrir menu com `/` e apertar `Esc` deve fechar o menu sem alterar o texto.
- [ ] **Mobile**: Testar se o menu flutuante não quebra o layout em telas pequenas.
- [ ] **Múltiplos Triggers**: Digitar `/` depois digitar texto normal, depois `@` na mesma frase. Ambos devem funcionar independentemente.
