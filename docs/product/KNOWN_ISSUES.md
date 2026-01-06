# ⚠️ Known Issues - Verity Agro MVP

**Data:** 2026-01-06

Este documento lista limitações conhecidas e workarounds para o MVP.

---

## 🔶 Limitações Funcionais

| Issue                   | Descrição                                   | Workaround               | Prioridade Pós-MVP |
| ----------------------- | ------------------------------------------- | ------------------------ | ------------------ |
| **Slash Commands**      | Sistema básico, apenas 5 comandos hardcoded | Usar linguagem natural   | P2                 |
| **PDF Export**          | Usa `window.print()`                        | Funcional, mas não ideal | P2                 |
| **Gráficos de Cotação** | Dados existem, sem visualização gráfica     | Exibir em texto/tabela   | P3                 |
| **Mentions (@)**        | Não implementado                            | N/A                      | P3                 |

---

## 🔧 Limitações Técnicas

| Issue           | Descrição                                 | Impacto | Plano              |
| --------------- | ----------------------------------------- | ------- | ------------------ |
| **E2E Tests**   | Alguns testes flaky (dependem do backend) | Baixo   | Melhorar mocks     |
| **Bundle Size** | Não otimizado                             | Médio   | Rodar ANALYZE=true |

---

## ✅ Não são Bugs

Estas são decisões de produto, não problemas:

- **Tools Dropdown oculto**: Decisão de MVP, código existe.
- **Dark Mode desabilitado**: Pode ser habilitado a qualquer momento.
- **Páginas CPR não promovidas**: Chat-first strategy.

---

**Atualizado em:** 2026-01-06
