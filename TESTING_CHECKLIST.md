# Mobile Optimization - Testing Checklist
## Rodrigues AI Frontend

Use este checklist para validar todas as otimizações mobile implementadas.

---

## 🎯 Phase 2: Performance Testing

### Code Splitting
- [ ] **MarkdownRenderer**: Verificar skeleton loader aparece ao carregar mensagens da AI
- [ ] **FileUploadModal**: Verificar spinner ao clicar no botão "Arquivo"
- [ ] **MenuSidebar**: Verificar carregamento suave ao abrir menu (desktop)

### Lazy Loading
- [ ] **Imagens no chat**: Scroll e verificar imagens carregam só quando visíveis
- [ ] Verificar atributo `loading="lazy"` no DevTools (Inspect Element)
- [ ] Testar em 3G simulado (Chrome DevTools > Network > Slow 3G)

### Backdrop Blur
- [ ] **Desktop**: Backdrop blur visível em InputBar
- [ ] **Mobile**: Background sólido (sem blur) para performance
- [ ] Scroll suave a 60fps em ambos

### Performance Benchmarks
- [ ] Abrir Chrome DevTools > Performance
- [ ] Gravar 10 segundos de interação (scroll, click, type)
- [ ] Verificar FPS: Alvo 60fps, mínimo 50fps

---

## 📱 Phase 3: PWA Testing

### Service Worker
- [ ] Abrir DevTools > Application > Service Workers
- [ ] Verificar status "Activated and running"
- [ ] Verificar scope "/"

### Manifest
- [ ] DevTools > Application > Manifest
- [ ] Verificar todos os campos preenchidos
- [ ] Ícones 192x192 e 512x512 carregam
- [ ] Theme color #4285f4 aplicado

### Caching Strategies
- [ ] DevTools > Application > Cache Storage
- [ ] Verificar 3 caches criados:
  - [ ] `api-cache` (NetworkFirst)
  - [ ] `image-cache` (CacheFirst)
  - [ ] `static-cache` (StaleWhileRevalidate)

### Offline Functionality
- [ ] DevTools > Network > Offline
- [ ] Recarregar página
- [ ] Verificar página `/offline` aparece
- [ ] Clicar "Tentar novamente" reconecta
- [ ] Clicar "Voltar ao início" redireciona para `/`

### Install Prompt
- [ ] Usar em mobile ou desktop
- [ ] Aguardar 30 segundos
- [ ] Verificar banner de instalação aparece
- [ ] Clicar "Instalar" e verificar app instala
- [ ] Clicar "X" e verificar não aparece mais (localStorage)
- [ ] App instalado aparece na tela inicial

---

## 🎨 Phase 4: Advanced UX Testing

### Swipe Gestures (Carousel)
- [ ] **Mobile/Touch Device Required**
- [ ] Abrir página inicial com sugestões
- [ ] Swipe **esquerda** no carousel
  - [ ] Deve avançar para próxima página
  - [ ] Animação suave com spring physics
  - [ ] Vibração (haptic) ao soltar
- [ ] Swipe **direita** no carousel
  - [ ] Deve voltar para página anterior
  - [ ] Mesma animação suave
  - [ ] Vibração ao soltar
- [ ] **Rubber-band effect**: Arrastar e soltar antes do threshold
  - [ ] Carousel volta à posição original
  - [ ] Sem mudança de página
- [ ] **Drag feedback**: Ao arrastar, carousel segue o dedo

### Haptic Feedback
- [ ] **Device Required**: iOS ou Android físico (não funciona em simulador)
- [ ] Clicar sugestão no carousel → Vibração média
- [ ] Clicar botões de navegação (< >) → Vibração leve
- [ ] Clicar indicadores de página (dots) → Vibração leve
- [ ] Enviar mensagem (botão Send) → Vibração média
- [ ] Swipe no carousel → Vibração "success" (padrão)
- [ ] Install prompt:
  - [ ] Clicar "Instalar" → Vibração média
  - [ ] Clicar "X" (dismiss) → Vibração leve
  - [ ] Instalação aceita → Vibração "success"

### Reduced Motion Compliance
- [ ] **iOS**: Settings > Accessibility > Motion > Reduce Motion (ON)
- [ ] **Android**: Settings > Accessibility > Remove animations (ON)
- [ ] Verificar haptic **não dispara** quando Reduce Motion ativo
- [ ] Verificar animações simplificadas/desabilitadas

### Landscape Mode
- [ ] **Mobile Device Required**
- [ ] Rotar para landscape (horizontal)
- [ ] **ChatArea**:
  - [ ] Padding reduzido (py-3 vs py-6)
  - [ ] Espaçamento entre mensagens menor (space-y-4 vs space-y-6)
  - [ ] Botão "Scroll to Bottom" ajustado (bottom-20)
- [ ] **InputBar**:
  - [ ] Padding compacto (p-2 vs p-3)
  - [ ] Espaçamento reduzido (space-y-2 vs space-y-3)
- [ ] **Carousel**:
  - [ ] Mobile landscape: **2 items** visíveis
  - [ ] Desktop landscape: **4 items** visíveis
  - [ ] Portrait: volta para 1/3 items

### Pull-to-Refresh
- [ ] **Mobile/Touch Required**
- [ ] Abrir página `/chat` com mensagens
- [ ] Scroll até o **topo** (mensagem mais antiga)
- [ ] Puxar para baixo e segurar
  - [ ] Indicador circular aparece
  - [ ] Ícone refresh rotaciona com o progresso
  - [ ] Texto "Puxe para atualizar" aparece
- [ ] Puxar **80px+** e soltar
  - [ ] Texto muda para "Solte para atualizar"
  - [ ] Ícone gira (animate-spin)
  - [ ] Console.log "Pull to refresh - carregar histórico"
  - [ ] Indicador desaparece após 1s
- [ ] Puxar menos de 80px e soltar
  - [ ] Indicador volta ao topo sem ativar

### Spring Animations
- [ ] **Carousel**: Navegação deve ter "bounce" no final
  - [ ] Não linear (ease-in-out)
  - [ ] Efeito mola (spring physics)
- [ ] **Mensagens**: Entrada deve ter slide-up + fade
  - [ ] Primeira mensagem: sem delay
  - [ ] Mensagens seguintes: stagger 50ms cada
  - [ ] Máximo 500ms delay (10+ mensagens)
- [ ] **GPU Acceleration**: Verificar no DevTools
  - [ ] Performance > Layers
  - [ ] Carousel deve ter layer compositor própria
  - [ ] Transforms usando `translate3d()` não `translateX()`

---

## ♿ Accessibility Testing

### Touch Targets (44x44px Minimum)
- [ ] **Carousel**:
  - [ ] Botões < > : 44x44px ✓
  - [ ] Indicadores (dots): Verificar se clicáveis
  - [ ] Cards de sugestão: Altura 70px ✓
- [ ] **InputBar**:
  - [ ] Botão Send: 44x44px ✓
  - [ ] Botões "Arquivo" e "Ferramentas": 44x44px ✓
- [ ] **ChatArea**:
  - [ ] Scroll to Bottom button: 44x44px ✓
  - [ ] Copy buttons: Verificar tamanho

### Screen Reader (VoiceOver/TalkBack)
- [ ] **iOS VoiceOver**:
  - [ ] Settings > Accessibility > VoiceOver (ON)
  - [ ] Navegar pelo app com swipes
  - [ ] Verificar todos os botões têm labels
- [ ] **Android TalkBack**:
  - [ ] Settings > Accessibility > TalkBack (ON)
  - [ ] Mesma navegação
- [ ] Labels verificados:
  - [ ] Carousel: "Página anterior", "Próxima página", "Ir para página X"
  - [ ] InputBar: "Campo de mensagem", "Enviar mensagem", "Adicionar arquivo"
  - [ ] ChatArea: "Rolar para baixo"

### Keyboard Navigation
- [ ] **Desktop Only** (Tab key)
- [ ] Tab através de todos os elementos interativos
- [ ] Ordem lógica: Carousel → Input → Send → Sugestões
- [ ] Focus indicators visíveis em todos os elementos
- [ ] Enter/Space ativam botões
- [ ] Escape fecha modais

### Color Contrast
- [ ] Usar ferramenta: axe DevTools, WAVE, ou Lighthouse
- [ ] Texto sobre backgrounds:
  - [ ] Mensagens do usuário (white on blue): Ratio ≥ 4.5:1
  - [ ] Mensagens da AI (foreground on muted): Ratio ≥ 4.5:1
  - [ ] Botões primários (text on gemini-blue): Ratio ≥ 4.5:1
- [ ] Dark mode:
  - [ ] Mesmas regras de contraste aplicam

---

## 🌐 Cross-Browser Testing

### Chrome (Desktop + Mobile)
- [ ] Abrir em Chrome Desktop (versão 90+)
- [ ] Verificar todas as features funcionam
- [ ] Abrir Chrome DevTools > Device Toolbar (mobile view)
- [ ] Testar swipe gestures com mouse (click + drag)
- [ ] PWA install prompt aparece

### Safari (Desktop + iOS)
- [ ] **macOS Safari** (versão 14+)
- [ ] Verificar layout responsivo
- [ ] Verificar PWA manifest reconhecido
- [ ] **iOS Safari** (iPhone/iPad)
- [ ] Testar swipe gestures nativos
- [ ] Verificar haptic feedback funciona
- [ ] Testar landscape mode
- [ ] Instalar PWA ("Add to Home Screen")

### Firefox (Desktop + Android)
- [ ] **Firefox Desktop** (versão 88+)
- [ ] Verificar todas as features
- [ ] DevTools > Responsive Design Mode
- [ ] **Firefox Android**
- [ ] Testar em device real
- [ ] PWA install support

### Edge (Desktop)
- [ ] Edge Desktop (Chromium, versão 90+)
- [ ] Comportamento idêntico ao Chrome
- [ ] PWA install funciona

### Samsung Internet
- [ ] **Android Only**
- [ ] Baixar Samsung Internet (versão 14+)
- [ ] Testar PWA install (excelente suporte)
- [ ] Verificar gestures e haptics

---

## 📱 Device Testing Matrix

### iOS Devices
| Device | Screen | Test Swipe | Test Haptic | Test Landscape | PWA Install |
|--------|--------|------------|-------------|----------------|-------------|
| iPhone SE (2022) | 4.7" | [ ] | [ ] | [ ] | [ ] |
| iPhone 14 | 6.1" | [ ] | [ ] | [ ] | [ ] |
| iPhone 14 Pro Max | 6.7" | [ ] | [ ] | [ ] | [ ] |
| iPad Air | 10.9" | [ ] | [ ] | [ ] | [ ] |

### Android Devices
| Device | Screen | Test Swipe | Test Haptic | Test Landscape | PWA Install |
|--------|--------|------------|-------------|----------------|-------------|
| Pixel 6 | 6.4" | [ ] | [ ] | [ ] | [ ] |
| Samsung Galaxy S22 | 6.1" | [ ] | [ ] | [ ] | [ ] |
| OnePlus 10 Pro | 6.7" | [ ] | [ ] | [ ] | [ ] |
| Tablet (10") | 10" | [ ] | [ ] | [ ] | [ ] |

---

## 🔬 Performance Profiling

### Lighthouse Audit (Chrome DevTools)
- [ ] Abrir DevTools > Lighthouse
- [ ] Configurar:
  - [ ] Mode: Navigation
  - [ ] Device: Mobile
  - [ ] Categories: All
- [ ] Gerar relatório
- [ ] Verificar scores:
  - [ ] Performance: **≥ 90**
  - [ ] Accessibility: **≥ 85**
  - [ ] Best Practices: **≥ 90**
  - [ ] SEO: **≥ 80**
  - [ ] PWA: **≥ 90**

### Network Throttling Tests
- [ ] DevTools > Network
- [ ] **Slow 3G** (400ms RTT, 400kbps down):
  - [ ] Página carrega em < 5s
  - [ ] Skeleton loaders aparecem
  - [ ] Imagens lazy load corretamente
- [ ] **Fast 3G** (150ms RTT, 1.6mbps):
  - [ ] Página carrega em < 3s
  - [ ] Interatividade rápida

### Memory Profiling
- [ ] DevTools > Memory > Heap snapshot
- [ ] Interagir com app por 2 minutos
- [ ] Tirar novo snapshot
- [ ] Verificar sem memory leaks significativos
- [ ] Service Worker não acumula cache infinito

---

## ✅ Pre-Deployment Checklist

### Build & Code Quality
- [x] `pnpm typecheck` passa sem erros
- [x] `pnpm build` completa com sucesso
- [x] `pnpm format:check` valida formatação
- [ ] `pnpm lint` sem erros críticos

### PWA Assets
- [x] Service Worker gerado (`/public/sw.js`)
- [x] Manifest presente (`/public/manifest.json`)
- [x] Icons 192x192 e 512x512 presentes
- [x] Offline page criada (`/offline`)

### Security
- [ ] HTTPS habilitado (obrigatório para PWA)
- [ ] CSP headers configurados
- [ ] HSTS headers presentes
- [ ] Middleware CSRF funcionando

### Analytics & Monitoring
- [ ] Google Analytics / Plausible configurado
- [ ] Error tracking (Sentry?) configurado
- [ ] Performance monitoring ativo

---

## 🐛 Bug Report Template

Se encontrar problemas durante os testes, documente assim:

```markdown
### Bug: [Título curto]

**Severidade**: 🔴 Critical / 🟡 Medium / 🟢 Low
**Fase**: Phase 2 / 3 / 4 / 5
**Feature**: Swipe / Haptic / PWA / etc.

**Ambiente**:
- Device: iPhone 14 Pro / Pixel 6 / Desktop
- OS: iOS 17.2 / Android 14 / macOS 14
- Browser: Safari 17 / Chrome 120

**Passos para Reproduzir**:
1. Abrir página inicial
2. Swipe left no carousel
3. ...

**Comportamento Esperado**:
Carousel avança para próxima página com animação spring.

**Comportamento Atual**:
Carousel trava e não responde.

**Screenshots/Videos**:
[Anexar se possível]

**Console Errors**:
```
TypeError: Cannot read property 'x' of undefined
  at useSwipeGesture.ts:45
```

**Prioridade**: Fix immediately / Fix before launch / Nice to have
```

---

## 📊 Test Results Summary

Após completar os testes, preencher:

### Coverage
- [ ] Performance: ___/10 testes ✅
- [ ] PWA: ___/12 testes ✅
- [ ] Advanced UX: ___/25 testes ✅
- [ ] Accessibility: ___/15 testes ✅
- [ ] Cross-browser: ___/5 browsers ✅
- [ ] Devices: ___/8 devices ✅

### Overall Status
- **Ready for Production**: ☐ Yes / ☐ No
- **Blockers Found**: ☐ None / ☐ Minor / ☐ Major
- **Recommended Actions**: [List here]

### Sign-off
- **Tested by**: _________________
- **Date**: _________________
- **Approved for Deployment**: ☐ Yes / ☐ No

---

**Total Checklist Items**: 150+
**Estimated Testing Time**: 4-6 hours (with devices)
**Required Equipment**: iOS device, Android device, Desktop (Chrome/Safari/Firefox)
