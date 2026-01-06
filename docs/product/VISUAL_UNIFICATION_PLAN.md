# PLANO DE EXECUÇÃO ULTRADETALHADO: UNIFICAÇÃO VISUAL VERITY

## 1. Objetivo Estratégico

Transformar a experiência visual do `rodrigues-ai-frontend` (App) para espelhar a identidade "Premium & Orgânica" da `verity-lp` (Landing Page), eliminando a desconexão estética atual entre "Marketing" (Quente/Luxo) e "Produto" (Frio/Clínico).

## 2. Diagnóstico Técnico

| Elemento         | Landing Page (Alvo)                | App Frontend (Atual)           | Ação Necessária          |
| :--------------- | :--------------------------------- | :----------------------------- | :----------------------- |
| **Fundo**        | Sand-100 `F9F8F6` (Quente)         | Verde-50 `F5F9F7` (Frio/Menta) | **Substituir**           |
| **Cor Primária** | Verity Primary `1A3C30` (Profundo) | Verity Brand `2D5A45` (Médio)  | **Escurecer/Ajustar**    |
| **Tipografia**   | Crimson Pro (Serif) em Títulos     | Inter (Sans) predominante      | **Promover Crimson Pro** |
| **Estilo**       | Glassmorphism, Bordas Suaves       | Flat, Bordas Padrão Shadcn     | **Adicionar Glass/Blur** |
| **Sombras**      | Coloridas e Difusas                | Coloridas mas tímidas          | **Ajustar intensidade**  |

---

## 3. Plano de Execução (Passo a Passo)

### FASE 1: Fundação do Design System (Cores & Variáveis)

#### 1.1. Converter Paleta "Sand" & "Verity" para HSL (Compatibilidade Shadcn)

O Shadcn UI utiliza variáveis CSS em HSL para suportar opacidade (`bg-primary/20`).

- **Ação**: Atualizar `src/app/globals.css`.
- **Novos Valores (Alvo)**:
  - `--background`: `#F9F8F6` -> `30 14% 97%` (Sand-100)
  - `--foreground`: `#1A3C30` -> `159 39% 17%` (Verity Primary)
  - `--primary`: `#1A3C30` -> `159 39% 17%`
  - `--card`: `#FFFFFF` -> `#FFFFFF` (Manter branco para contraste com fundo Sand)
  - `--muted`: `#F3F1EB` -> `45 18% 94%` (Sand-200)

#### 1.2. Atualizar `tailwind.config.ts`

- **Ação**: Sincronizar a configuração do Tailwind com os novos tokens.
- **Tarefa**: Adicionar a paleta `sand` e `verity` completa dentro de `theme.extend.colors`.

```typescript
// Exemplo do que será injetado
colors: {
  sand: {
    50: '#FDFCFB',
    100: '#F9F8F6', // Novo Background Base
    200: '#F3F1EB',
    300: '#EBE9E1',
    400: '#E5E5E5',
  },
  verity: {
    // ... novos tons extraídos da LP
    900: '#1A3C30', // Novo Primary
  }
}
```

### FASE 2: Tipografia & Layout Global

#### 2.1. Ativação da "Crimson Pro"

- **Estado Atual**: A fonte já está importada em `layout.tsx` e configurada no Tailwind como `font-display`.
- **Ação**: Aplicar `font-display` nos títulos das páginas principais (Dashboard, Configurações).
- **Ação Global**: Adicionar classe utilitária `.text-elegant` que aplica `font-display text-verity-900` automaticamente.

#### 2.2. Background Global

- **Ação**: Forçar o background da aplicação em `globals.css` ou `layout.tsx`.

```css
body {
  @apply bg-sand-100 text-verity-900; /* Mudança de bg-verde-50 para bg-sand-100 */
}
```

### FASE 3: Componentes & "Look & Feel"

#### 3.1. Glassmorphism (O "Toque Premium")

- **Ação**: Criar utilitários de vidro no `globals.css` idênticos aos da LP.

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
```

- **Aplicação**: Usar em `Sidebar`, `Header` e `Cards` de destaque.

#### 3.2. Botões e Inputs

- **Botões**: Atualizar o `button` default do Shadcn para ter `rounded-xl` (mais orgânico) e usar a nova cor `primary` (#1A3C30).
- **Inputs**: Mudar a cor da borda de `#E2E8F0` (Cinza) para `sand-400` (Bege escuro) ou suavemente verde.

### FASE 4: Telas de Entrada (Login/Registro)

#### 4.1. Clonagem Visual

- **Ação**: Reescrever o layout de Login para usar:
  - Imagem de fundo agrícola (mesma da LP ou similar de alta qualidade).
  - Overlay de vidro (`glass-panel`).
  - Tipografia `Crimson Pro` no título "Bem-vindo ao Verity".
  - Remover o layout padrão "split screen" branco/preto se existir e usar o estilo "Cartão Flutuante" ou "Split com Imagem Imersiva".

---

## 4. Checklist de Verificação

- [ ] A aplicação "parece" bege/quente ao abrir, não mais verde-menta?
- [ ] O texto "Verity Agro" usa a serifa Crimson Pro?
- [ ] O contraste de leitura está mantido (Texto Verity-900 sobre Sand-100)?
- [ ] Os componentes Shadcn (Select, Dropdown) não quebraram com as novas variáveis HSL?

## 5. Ordem de Execução Recomendada

1.  Atualizar `globals.css` (Variáveis HSL).
2.  Atualizar `tailwind.config.ts` (Extensão do Tema).
3.  Ajustar `layout.tsx` (Background Class).
4.  Refinar Componentes (Glassmorphism).
