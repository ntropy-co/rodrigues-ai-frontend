# 🧪 Manual Testing Global Master List

Este documento centraliza todos os roteiros de teste manual do projeto **Rodrigues AI (Frontend)**.
Use este guia para validar funcionalidades antes de releases ou deploys em produção.

## 📋 Status Overview

| Funcionalidade | Prioridade | Status | Link |
| :--- | :---: | :---: | :--- |
| **Agentic Input Bar** | 🔥 Alta | `Pendente` | [Ver Testes](./features/01_AGENTIC_INPUT_BAR.md) |
| **CPR Wizard (Step 4-6)** | 🔥 Alta | `Pendente` | [Ver Testes](./features/02_CPR_WIZARD.md) |
| **Template Generator** | Medium | `Pendente` | [Ver Testes](./features/03_TEMPLATE_GENERATOR.md) |
| **Web Vitals & Monitoring**| Low | `Pendente` | [Ver Testes](./features/04_OBSERVABILITY.md) |

---

## 🚀 Como Executar os Testes

1. **Ambiente**: Execute os testes preferencialmente em `homolog` ou localmente (`npm run dev`).
2. **Navegador**: Use Chrome (Desktop) para a maioria dos testes, validando responsividade no modo mobile se necessário.
3. **Report**: Se encontrar falhas, abra uma Issue no GitHub com a tag `bug` e link para o roteiro que falhou.

---

## 🆕 Adicionando Novos Testes

1. Crie um arquivo markdown em `docs/qa/features/` seguindo o padrão `XX_NOME_FEATURE.md`.
2. Adicione uma linha na tabela acima.
