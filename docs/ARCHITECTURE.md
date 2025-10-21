# Architecture Documentation

## Overview

Rodrigues AI Frontend is built with Next.js 15 using the App Router architecture, providing a modern, performant, and SEO-friendly application.

## Technology Stack

### Core Framework

- **Next.js 15.5.6**: React framework with App Router
- **React 19**: UI library with server components
- **TypeScript 5.9**: Type-safe development

### Styling & UI

- **Tailwind CSS 3.4**: Utility-first CSS framework
- **shadcn/ui**: High-quality accessible components
- **Radix UI**: Primitive components foundation
- **Framer Motion**: Animation library
- **Lucide Icons**: Icon library

### State Management

- **Zustand**: Lightweight state management
- **React Context**: Authentication and theme state
- **nuqs**: URL state management with type safety

### Code Quality

- **ESLint 9**: Linting and code standards
- **Prettier 3.4**: Code formatting
- **TypeScript Strict Mode**: Maximum type safety

## Directory Structure

### `/src/app`

Next.js App Router pages and layouts. Each folder represents a route:

- `layout.tsx`: Root layout with providers (theme, auth)
- `page.tsx`: Main chat interface
- `/login`, `/forgot-password`, `/reset-password`: Authentication flows
- `/offline`: PWA offline fallback page

### `/src/components`

Reusable React components organized by domain:

#### `/ui`

shadcn/ui components - design system primitives:

- `button.tsx`, `dialog.tsx`, `select.tsx`: Base components
- `/typography`: Text components with markdown support

#### `/v2`

Application-specific components:

- `ChatArea/`: Chat interface with messages
- `InputBar/`: Message input with file upload
- `MainContent/`: Landing page with suggestions
- `MenuSidebar/`: Navigation sidebar
- `InstallPrompt/`: PWA install prompt

### `/src/lib`

Utility functions and helpers, organized by domain:

#### `/auth`

Authentication-related utilities:

- `api.ts`: Auth API calls (login, register, etc.)
- `cookies.ts`: Token management
- `validations.ts`: Zod schemas for auth forms

#### `/utils`

General utilities:

- `clipboard.ts`: Copy to clipboard functionality
- `format.ts`: Date/text formatting helpers
- `rate-limiter.ts`: Client-side rate limiting
- `ui.ts`: UI helper functions
- `url-validator.ts`: URL validation and sanitization

Other files:

- `utils.ts`: Tailwind `cn()` utility for className merging
- `constants.ts`: App-wide constants
- `audio.ts`: Audio recording utilities
- `modelProvider.ts`: AI model configuration

### `/src/hooks`

Custom React hooks:

- `useAIStreamHandler.tsx`: Handles AI streaming responses
- `useSessionLoader.tsx`: Loads chat session history
- `useCarouselPagination.ts`: Carousel navigation
- `useHaptic.ts`: Mobile haptic feedback
- `useOrientation.ts`: Device orientation detection
- `usePullToRefresh.ts`: Pull-to-refresh gesture
- `useSwipeGesture.ts`: Swipe gesture detection

### `/src/contexts`

React contexts for global state:

- `AuthContext.tsx`: Authentication state and methods
- `ThemeProvider.tsx`: Dark/light theme management

### `/src/types`

TypeScript type definitions:

- `auth.ts`: Authentication types
- `next-pwa.d.ts`: PWA type declarations
- `playground.ts`: Chat/AI interaction types

### `/src/api`

API integration layer:

- `routes.ts`: API endpoint definitions
- `playground.ts`: Chat API functions

## Key Features

### Progressive Web App (PWA)

- Offline support with service worker
- Install prompt for mobile/desktop
- Manifest.json for app metadata
- Caching strategies for API and assets

### Authentication

- JWT token-based auth
- Secure cookie storage
- Rate limiting on login/register
- Password reset flow

### Mobile Optimizations

- Touch-friendly UI (44px minimum targets)
- Pull-to-refresh gesture
- Swipe navigation
- Haptic feedback
- Responsive backdrop blur
- Orientation detection

### Performance

- Code splitting with dynamic imports
- Image lazy loading
- Component lazy loading
- PWA caching strategies
- Optimized fonts with `next/font`

### Security

- Content Security Policy headers
- CSRF protection
- XSS prevention with sanitization
- URL validation against SSRF
- Secure cookie settings

## State Management

### Global State (Zustand)

Located in `store.ts`, manages:

- Chat messages
- Session data
- Streaming state
- UI state (sidebar visibility, etc.)

### Context-Based State

- **AuthContext**: User authentication, login/logout
- **ThemeProvider**: Dark/light mode preference

### URL State (nuqs)

- Agent selection
- Session ID
- Query parameters with type safety

## Data Flow

### Chat Message Flow

1. User sends message via `InputBar`
2. `useAIStreamHandler` makes API call
3. Server streams responses via SSE
4. `useAIResponseStream` processes chunks
5. Zustand store updates messages
6. `ChatArea` rerenders with new content

### Authentication Flow

1. User submits credentials
2. `AuthContext` calls `loginApi`
3. Token stored in secure cookie
4. User state updated
5. Redirect to chat interface

## Build & Deployment

### Development

```bash
pnpm dev  # localhost:3000
```

### Production Build

```bash
pnpm build  # Creates optimized build
pnpm start  # Runs production server
```

### Deployment (Vercel)

- Automatic deployments from `master` branch
- Preview deployments for PRs
- Environment variables in Vercel dashboard

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://api.rodriguesagro.com.br
```

## Code Style Guidelines

### File Naming

- Components: PascalCase (`ChatArea.tsx`)
- Utilities: camelCase (`format.ts`)
- Constants: UPPER_CASE export

### Import Order

1. React/Next imports
2. External libraries
3. Internal components
4. Hooks
5. Utils/helpers
6. Types
7. Styles

### Component Structure

```tsx
'use client' // if needed

// Imports
import { useState } from 'react'

// Types
interface Props {
  // ...
}

// Component
export function Component({ props }: Props) {
  // Hooks
  const [state, setState] = useState()

  // Handlers
  const handleClick = () => {}

  // Render
  return <div>...</div>
}
```

## Future Improvements

- [ ] Add comprehensive test suite
- [ ] Implement E2E testing with Playwright
- [ ] Add bundle analyzer
- [ ] Implement error boundaries
- [ ] Add performance monitoring
- [ ] Improve accessibility (WCAG AAA)
- [ ] Add internationalization (i18n)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
