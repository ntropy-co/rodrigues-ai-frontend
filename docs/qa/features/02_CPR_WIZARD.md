# 🧪 Roteiro de Teste: CPR Wizard (Steps 4-6)

**Componente**: `src/components/v2/CPRWizard`
**Contexto**: Wizard multipasso para criação de Cédula de Produto Rural.

---

## 1. Navegação e Validação

### Cenário 1.1: Bloqueio de Avanço
- [ ] **Ação**: Entre no Step 4 (Garantias) sem preencher nada e tente clicar em "Próximo".
- [ ] **Resultado Esperado**: O botão deve estar desabilitado ou exibir erro de validação nos campos obrigatórios.

### Cenário 1.2: Persistência de Estado
- [ ] **Ação**: Preencha o Step 4 e avance para o Step 5. Clique em "Voltar".
- [ ] **Resultado Esperado**: Os dados preenchidos no Step 4 devem estar lá.

---

## 2. Step 4: Garantias

- [ ] **Ação**: Selecionar "Hipoteca" como tipo.
- [ ] **Resultado Esperado**: Campos específicos de hipoteca (Matrícula, Cartório) devem aparecer.
- [ ] **Ação**: Adicionar mais de uma garantia (se houver botão "Adicionar Outra").
- [ ] **Resultado Esperado**: Lista de garantias deve atualizar corretamente.

## 3. Step 5: Revisão

- [ ] **Ação**: Verificar o resumo dos dados.
- [ ] **Resultado Esperado**: Todos os dados inseridos nos passos 1-4 devem estar visíveis e corretos (Valor, Produto, Produtor, Garantias).
- [ ] **Ação**: Clicar em "Gerar Minuta".
- [ ] **Resultado Esperado**: Loading state deve ativar.

## 4. Step 6: Conclusão

- [ ] **Ação**: Aguardar geração.
- [ ] **Resultado Esperado**:
    - Mensagem de sucesso (Confetti ou Ícone Verde).
    - Botão para "Baixar PDF" ou "Visualizar Minuta".
    - Botão "Voltar ao Início" que reseta o wizard.
