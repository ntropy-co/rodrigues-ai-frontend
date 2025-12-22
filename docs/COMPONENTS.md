# 🧩 Componentes Principais

## Estrutura

```
src/components/
├── ui/           # Primitivos (Button, Input, Dialog)
└── v2/           # Features (Chat, Upload, Analysis)
```

## UI Primitivos (`/ui`)

### Button
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Primário</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### Input
```tsx
import { Input } from '@/components/ui/input'
<Input placeholder="Digite aqui..." />
```

### Dialog
```tsx
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
```

## Features (`/v2`)

### ChatLayout
Container principal do chat.
```tsx
<ChatLayout sessionId={sessionId} />
```

### ChatArea
Área de mensagens com scroll e streaming.
```tsx
<ChatArea messages={messages} isStreaming={isStreaming} />
```

### FileUploadModal
Modal de upload de arquivos.
```tsx
<FileUploadModal
  isOpen={isOpen}
  onClose={onClose}
  userId={userId}
  onUploadComplete={handleComplete}
/>
```

### ConversationsSidebar
Lista de sessões de chat.
```tsx
<ConversationsSidebar
  sessions={sessions}
  activeSessionId={activeId}
  onSessionSelect={handleSelect}
/>
```

### Header
Barra de navegação superior.
```tsx
<Header onMenuClick={toggleMenu} />
```

## Padrões

### Componentes Client vs Server
- `'use client'` para componentes com estado/eventos
- Server Components por padrão (melhor performance)

### Naming
- PascalCase para componentes
- camelCase para hooks e funções
