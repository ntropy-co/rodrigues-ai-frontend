# Mapeamento de Símbolos de Commodities

> **Propósito:** Este documento define o mapeamento entre os símbolos usados no frontend (Yahoo Finance) e os códigos internos do backend para commodities agrícolas.

---

## Tabela de Mapeamento

| Commodity      | Frontend (Yahoo) | Backend (Interno) | Unidade Frontend | Unidade Backend |
| -------------- | ---------------- | ----------------- | ---------------- | --------------- |
| Soja           | `ZS=F`           | `SOJA`            | USD/bushel       | saca 60kg       |
| Milho          | `ZC=F`           | `MILHO`           | USD/bushel       | saca 60kg       |
| Trigo          | `ZW=F`           | `TRIGO`           | USD/bushel       | saca 60kg       |
| Café           | `KC=F`           | `CAFE`            | USD/lb           | saca 60kg       |
| Óleo de Soja   | `ZL=F`           | `OLEO_SOJA`       | USD/lb           | kg              |
| Farelo de Soja | `ZM=F`           | `BSOJA`           | USD/ton          | tonelada        |
| Açúcar         | `SB=F`           | `ACUCAR`          | USD/lb           | saca 50kg       |
| Algodão        | `CT=F`           | `ALGODAO`         | USD/lb           | arroba 15kg     |
| Boi Gordo      | `LE=F`           | `BOI`             | USD/lb           | arroba 15kg     |

---

## Commodities Apenas no Backend

| Código    | Nome         | Notas                         |
| --------- | ------------ | ----------------------------- |
| `CAFE_R`  | Café Robusta | Sem equivalente Yahoo Finance |
| `ETANOL`  | Etanol       | Mercado brasileiro            |
| `BEZERRO` | Bezerro      | Mercado brasileiro            |
| `FRANGO`  | Frango       | Mercado brasileiro            |
| `SUINO`   | Suíno        | Mercado brasileiro            |

---

## Fontes de Dados

### Frontend

- **Yahoo Finance API** via proxy BFF
- Preços em USD (mercado internacional)

### Backend

- **CEPEA/ESALQ:** Centro de Estudos Avançados em Economia Aplicada
- **B3:** Brasil, Bolsa, Balcão
- **CONAB:** Companhia Nacional de Abastecimento
- Preços em BRL (mercado brasileiro)

---

## Arquivos de Referência

| Arquivo            | Localização                     |
| ------------------ | ------------------------------- |
| Frontend constants | `src/lib/commodities.ts`        |
| Backend model      | `app/models/commodity.py`       |
| Backend routes     | `app/api/routes/commodities.py` |

---

## Notas Importantes

1. **Conversão de unidades:** O frontend exibe em unidades internacionais (bushel, lb), enquanto o backend armazena em unidades brasileiras (saca, arroba).

2. **Moeda:** Frontend = USD, Backend = BRL (com campo opcional USD).

3. **Uso atual:** O frontend usa símbolos Yahoo apenas para display em charts. O backend é a fonte de verdade para preços usados em cálculos de CPR.

---

_Documentado em: 2025-12-26_
