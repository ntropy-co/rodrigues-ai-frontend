# 🧪 Roteiro de Teste: Template Generator

**Componente**: `src/components/v2/TemplateGenerator`
**Contexto**: Gerador de minutas contratuais customizáveis.

---

## 1. Seletor de Cláusulas (`ClausesSelector.tsx`)

### Cenário 1.1: Cláusulas Opcionais

- [ ] **Ação**: No painel lateral, ativar toggle de uma cláusula opcional (ex: "Foro de Eleição").
- [ ] **Resultado Esperado**:
  - A cláusula deve aparecer imediatamente no preview do documento.
  - O texto deve se ajustar se houver variáveis.

### Cenário 1.2: Cláusulas Exclusivas (Radio)

- [ ] **Ação**: Se houver opções mutuamente exclusivas (ex: "Juros Simples" vs "Composto"), alternar entre elas.
- [ ] **Resultado Esperado**: Apenas uma deve estar ativa por vez.

---

## 2. Preview do Documento (`DocumentPreview.tsx`)

### Cenário 2.1: Renderização em Tempo Real

- [ ] **Ação**: Alterar um campo de input (ex: Nome do Contratante) no formulário.
- [ ] **Resultado Esperado**: O nome deve atualizar instantaneamente no preview do lado direito.

### Cenário 2.2: Responsividade

- [ ] **Ação**: Redimensionar a janela.
- [ ] **Resultado Esperado**: O preview deve manter proporção A4 ou se adaptar (scroll horizontal/zoom) sem quebrar o layout.
