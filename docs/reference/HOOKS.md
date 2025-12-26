# 🪝 Custom Hooks

O projeto possui **23 custom hooks** em `src/hooks/`.

## Hooks de Autenticação

### `useAuthHook`
Estado global de autenticação.

```typescript
const { user, isAuthenticated, isLoading, login, logout } = useAuth()
```

### `useAuthForm`
Lógica de formulários de auth (login, registro).

```typescript
const { form, onSubmit, isSubmitting, error } = useAuthForm('login')
```

## Hooks de Chat

### `useAIStreamHandler`
Processa streaming de respostas do AI.

```typescript
const { sendMessage, isStreaming, messages } = useAIStreamHandler(sessionId)
```

### `useChatFiles`
Upload e gestão de arquivos no chat.

```typescript
const { files, uploadFile, removeFile, isUploading } = useChatFiles(sessionId)
```

### `useSessions`
CRUD de sessões de chat.

```typescript
const { sessions, createSession, deleteSession, isLoading } = useSessions()
```

## Hooks de UI

### `useHaptic`
Feedback tátil em dispositivos móveis.

```typescript
const { trigger } = useHaptic()
trigger('light') // 'light' | 'medium' | 'heavy'
```

### `useReducedMotion`
Respeita preferência do usuário por menos animações.

```typescript
const prefersReducedMotion = useReducedMotion()
```

### `useSwipeGesture`
Detecta gestos de swipe.

```typescript
const { handlers, direction } = useSwipeGesture({
  onSwipeLeft: () => nextSlide(),
  onSwipeRight: () => prevSlide()
})
```

## Hooks de Layout

### `useResponsiveLayout`
Breakpoints responsivos.

```typescript
const { isMobile, isTablet, isDesktop } = useResponsiveLayout()
```

### `useKeyboardHeight`
Altura do teclado virtual (mobile).

```typescript
const keyboardHeight = useKeyboardHeight()
```

## Hooks de Dados

### `useDocuments`
CRUD de documentos.

```typescript
const { documents, deleteDocument, isLoading } = useDocuments(userId)
```

### `useProjects`
Gestão de projetos.

```typescript
const { projects, createProject, isLoading } = useProjects()
```
