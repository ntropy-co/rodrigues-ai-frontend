# Verity Frontend

> Modern Next.js 15 frontend for Verity - Agricultural credit specialist with AI-powered chat interface

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

Visit [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Package Manager**: pnpm

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── v2/          # Application components
├── lib/             # Utility functions and helpers
│   ├── auth/        # Authentication utilities
│   └── utils/       # General utilities
├── hooks/           # Custom React hooks
├── contexts/        # React contexts
├── store.ts         # Zustand store
└── types/           # TypeScript types
```

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Check code formatting
pnpm format:fix   # Fix code formatting
pnpm typecheck    # Run TypeScript compiler
pnpm validate     # Run all checks (lint + format + typecheck)
```

## License

Proprietary - Rodrigues Agro

## Links

- **Frontend**: [Vercel](https://vercel.com)
- **Backend**: [Railway](https://railway.app)
- **Repository**: [GitHub](https://github.com/ntropy-co/rodrigues-ai-frontend)
